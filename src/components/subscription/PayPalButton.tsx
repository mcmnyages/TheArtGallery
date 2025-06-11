import React, { useEffect, useRef, useState, useCallback } from 'react';
import { paypalService } from '../../services/paypalService';

interface PayPalButtonProps {
  galleryId: string;
  userId: string;
  amount: number;
  currency?: string;
  subscriptionOptionId?: string;
  onSuccess: (orderId: string) => void;
  onError: (error: Error) => void;
  debug?: boolean;
}

interface PayPalLogger {
  track: () => Promise<void>;
  error: () => Promise<void>;
  warn: () => Promise<void>;
  info: () => Promise<void>;
  debug: () => Promise<void>;
}

interface PayPalSDK {
  Buttons: (config: {
    style?: {
      layout?: 'vertical' | 'horizontal';
      shape?: 'rect' | 'pill';
      label?: 'pay' | 'buynow' | 'checkout';
      height?: number;
    };
    createOrder?: () => Promise<string>;
    onApprove?: (data: { orderID: string }) => Promise<void>;
    onError?: (error: Error) => void;
  }) => {
    render: (container: HTMLElement) => Promise<void>;
    close: () => void;
    isEligible: () => boolean;
  };
  logger?: PayPalLogger;
}

declare global {
  interface Window {
    paypal?: PayPalSDK;
  }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  galleryId,
  userId,
  amount,
  currency = 'USD',
  subscriptionOptionId,
  onSuccess,
  onError,
  debug = false
}): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paypalButtonsRef = useRef<ReturnType<PayPalSDK['Buttons']> | null>(null);
  const scriptLoadingRef = useRef<Promise<void> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const paypalScriptId = 'paypal-sdk';
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID;

  const debugLog = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[PayPalButton] ${message}`, ...args);
    }
  }, [debug]);

  // Function to clean up PayPal resources
  const cleanupPayPal = useCallback(() => {
    debugLog('Cleaning up PayPal resources');
    try {
      // Clear any existing timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }

      // Clean up PayPal buttons instance
      if (paypalButtonsRef.current) {
        try {
          paypalButtonsRef.current.close();
        } catch (err) {
          console.warn('Error closing PayPal button:', err);
        }
        paypalButtonsRef.current = null;
      }

      // Clean up container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      // Clear script loading ref
      scriptLoadingRef.current = null;
      retryCountRef.current = 0;
    } catch (err) {
      console.warn('Error during PayPal cleanup:', err);
    }
  }, [debug, debugLog]);

  // Load PayPal script only once and reuse the promise
  const loadPayPalScript = useCallback(async () => {
    debugLog('Loading PayPal script');
    // Return existing promise if script is already loading
    if (scriptLoadingRef.current) {
      debugLog('Script already loading, reusing promise');
      return scriptLoadingRef.current;
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.getElementById(paypalScriptId);
      
      // If script exists and PayPal is loaded, resolve immediately
      if (existingScript && window.paypal?.Buttons) {
        debugLog('PayPal SDK already loaded');
        resolve();
        return;
      }

      // Remove existing script if it's there but PayPal isn't loaded
      if (existingScript) {
        debugLog('Removing existing incomplete script');
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = paypalScriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&disable-funding=card&components=buttons&debug=${debug}`;
      script.async = true;

      let timeoutId: ReturnType<typeof setTimeout>;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };

      script.onload = () => {
        debugLog('PayPal script loaded, checking for Buttons API');
        const checkPayPal = () => {
          if (window.paypal?.Buttons) {
            cleanup();
            resolve();
            return;
          }
          if (!isMountedRef.current) {
            cleanup();
            reject(new Error('Component unmounted during script load'));
            return;
          }
          timeoutId = setTimeout(checkPayPal, 100);
        };
        checkPayPal();
      };

      script.onerror = (event) => {
        cleanup();
        debugLog('Script load error:', event);
        reject(new Error('Failed to load PayPal SDK'));
      };

      // Global timeout
      timeoutId = setTimeout(() => {
        cleanup();
        debugLog('Script load timeout');
        reject(new Error('PayPal script load timeout'));
      }, 10000);

      document.head.appendChild(script);
    });

    scriptLoadingRef.current = loadPromise.catch(error => {
      debugLog('Script load error, will retry if attempts remain', error);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        scriptLoadingRef.current = null;
        return loadPayPalScript(); // Retry loading
      }
      // Clear the reference on error so we can try loading again later
      scriptLoadingRef.current = null;
      throw error;
    });

    return scriptLoadingRef.current;
  }, [clientId, currency, debug, debugLog]);

  // Initialize PayPal buttons with improved error handling
  const initializePayPalButtons = useCallback(async () => {
    debugLog('Initializing PayPal buttons');
    if (!window.paypal) {
      throw new Error('PayPal SDK not loaded');
    }

    if (!containerRef.current || !document.body.contains(containerRef.current)) {
      throw new Error('Container not ready');
    }

    // Clean up existing buttons first
    cleanupPayPal();

    // Create fresh container
    containerRef.current.innerHTML = '<div id="paypal-button-container"></div>';
    const buttonContainer = containerRef.current.querySelector('#paypal-button-container') as HTMLElement;

    if (!buttonContainer) {
      throw new Error('Failed to create PayPal button container');
    }

    try {
      debugLog('Creating PayPal buttons instance');
      // Create buttons instance
      const buttons = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          shape: 'rect',
          label: 'pay',
          height: 45
        },
        createOrder: async () => {
          try {
            debugLog('Creating PayPal order', { 
              galleryId, 
              userId, 
              amount, 
              currency, 
              subscriptionOptionId 
            });
            const order = await paypalService.createOrder(
              galleryId, 
              userId, 
              amount, 
              currency, 
              subscriptionOptionId
            );
            debugLog('Order created successfully', order);
            return order.id;
          } catch (error) {
            debugLog('Error creating order:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
            onError(new Error(errorMessage));
            throw error;
          }
        },
        onApprove: async (data: { orderID: string }) => {
          try {
            debugLog('Payment approved, capturing order', data.orderID);
            await paypalService.captureOrder(data.orderID);
            debugLog('Order captured, verifying payment');
            const isVerified = await paypalService.verifyPayment(data.orderID);
            
            if (isVerified) {
              debugLog('Payment verified successfully');
              onSuccess(data.orderID);
            } else {
              throw new Error('PayPal payment verification failed');
            }
          } catch (error) {
            debugLog('Error processing payment:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
            onError(new Error(errorMessage));
          }
        },
        onError: (err: Error) => {
          debugLog('PayPal Error:', err);
          onError(err);
        }
      });

      if (!buttons.isEligible()) {
        throw new Error('PayPal Buttons are not eligible for this configuration');
      }

      // Store buttons reference
      paypalButtonsRef.current = buttons;

      debugLog('Rendering PayPal buttons');
      // Render the buttons
      await buttons.render(buttonContainer);
      
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      debugLog('PayPal buttons rendered successfully');
    } catch (error) {
      debugLog('Error during button initialization:', error);
      if (paypalButtonsRef.current) {
        try {
          paypalButtonsRef.current.close();
        } catch (err) {
          console.warn('Error closing PayPal buttons during error cleanup:', err);
        }
        paypalButtonsRef.current = null;
      }
      throw error;
    }
  }, [amount, currency, galleryId, onError, onSuccess, subscriptionOptionId, userId, cleanupPayPal, debug, debugLog]);

  useEffect(() => {
    isMountedRef.current = true;
    
    const initPayPal = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        if (!clientId) {
          throw new Error('PayPal client ID is not configured. Please set VITE_PAYPAL_CLIENT_ID environment variable.');
        }

        debugLog('Starting PayPal initialization');
        await loadPayPalScript();
        
        // Check if component is still mounted
        if (!isMountedRef.current) {
          debugLog('Component unmounted during initialization');
          return;
        }

        await initializePayPalButtons();
      } catch (error) {
        if (!isMountedRef.current) return;
        
        debugLog('Error initializing PayPal:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize PayPal';
        setLoadError(errorMessage);
        setIsLoading(false);
        onError(new Error(errorMessage));
      }
    };

    // Add small delay before reinitializing to prevent rapid re-renders
    const timeoutId = setTimeout(() => {
      debugLog('Initializing PayPal after delay');
      initPayPal();
    }, 100);

    // Cleanup function
    return () => {
      debugLog('Component unmounting, cleaning up');
      clearTimeout(timeoutId);
      isMountedRef.current = false;
      cleanupPayPal();
    };
  }, [
    clientId, 
    currency, 
    amount, 
    subscriptionOptionId, 
    cleanupPayPal, 
    initializePayPalButtons, 
    loadPayPalScript, 
    onError,
    debug,
    debugLog
  ]);

  if (loadError) {
    return (
      <div className="paypal-button-container">
        <div className="p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-red-800 text-sm">
            Failed to load PayPal: {loadError}
          </p>
          <button 
            onClick={() => {
              debugLog('Retrying PayPal initialization');
              retryCountRef.current = 0;
              scriptLoadingRef.current = null;
              window.location.reload();
            }} 
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paypal-button-container relative">
      <div ref={containerRef} className="min-h-[45px]" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Loading PayPal...</span>
        </div>
      )}
    </div>
  );
};

export default PayPalButton;