import React, { useEffect, useRef, useState } from 'react';
import { paypalService } from '../../services/paypalService';

interface PayPalButtonProps {
  galleryId: string;
  userId: string;
  amount: number;
  currency?: string;
  onSuccess: (orderId: string) => void;
  onError: (error: Error) => void;
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
  onSuccess,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paypalButtonsRef = useRef<ReturnType<PayPalSDK['Buttons']> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  const paypalScriptId = 'paypal-sdk';
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    isMountedRef.current = true;
    
    // Validate required environment variables
    if (!clientId) {
      const error = 'PayPal client ID is not configured. Please set VITE_PAYPAL_CLIENT_ID environment variable.';
      console.error(error);
      setLoadError(error);
      onError(new Error(error));
      return;
    }    const initializePayPalButtons = async () => {
      try {
        // Make sure we're still mounted
        if (!isMountedRef.current) {
          return;
        }

        // Wait for PayPal SDK
        if (!window.paypal) {
          throw new Error('PayPal SDK not loaded');
        }

        // Verify container exists and is in DOM
        if (!containerRef.current || !document.body.contains(containerRef.current)) {
          return; // Exit silently - we'll retry on next render
        }

        // Clear any existing content and add a placeholder div
        // This ensures we have a stable container
        containerRef.current.innerHTML = '<div id="paypal-button-container"></div>';
        const buttonContainer = containerRef.current.querySelector('#paypal-button-container');
        
        if (!buttonContainer) {
          throw new Error('Failed to create PayPal button container');
        }

        // Create buttons instance
        const buttons = window.paypal.Buttons({
          style: {
            layout: 'vertical',
            shape: 'rect',
            label: 'pay',
            height: 45
          },          createOrder: async () => {
            try {
              console.log('🔄 Creating PayPal order with:', { galleryId, userId, amount, currency });
              const order = await paypalService.createOrder(galleryId, userId, amount, currency);
              console.log('📦 Order created:', order);
              return order.id;
            } catch (error) {
              console.error('Error creating order:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
              onError(new Error(errorMessage));
              throw error; // Re-throw to prevent PayPal from continuing
            }
          },
          onApprove: async (data: { orderID: string }) => {
            try {
              await paypalService.captureOrder(data.orderID);              const isVerified = await paypalService.verifyPayment(data.orderID);
              
              // If the payment is verified with PayPal, pass the orderId to onSuccess
              if (isVerified) {
                onSuccess(data.orderID);
              } else {
                // If PayPal verification fails, throw an error
                throw new Error('PayPal payment verification failed');
              }
            } catch (error) {
              console.error('Error processing payment:', error);
              const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
              onError(new Error(errorMessage));
            }
          },
          onError: (err: Error) => {
            console.error('PayPal Error:', err);
            onError(err);
          }
        });

        if (!buttons.isEligible()) {
          throw new Error('PayPal Buttons are not eligible for this configuration');
        }

        paypalButtonsRef.current = buttons;        // Double check container is still available and mounted
        if (!containerRef.current || !document.body.contains(containerRef.current)) {
          throw new Error('Container element removed from DOM during initialization');
        }        // Store buttons reference before render
        paypalButtonsRef.current = buttons;

        // Verify container is still in DOM right before render
        if (!containerRef.current || !document.body.contains(containerRef.current)) {
          throw new Error('Container element removed from DOM before render');
        }        // Render the buttons into our stable container
        if (isMountedRef.current && buttonContainer) {
          await buttons.render(buttonContainer as HTMLElement);
          
          // Short delay to verify rendering
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Only update state if still mounted and render was successful
          if (isMountedRef.current && buttonContainer.querySelector('iframe')) {
            setIsLoading(false);
            isInitializedRef.current = true;
          }
        }
      } catch (error) {
        console.error('Error initializing PayPal buttons:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize PayPal';
        
        // Clean up on error
        if (paypalButtonsRef.current) {
          try {
            paypalButtonsRef.current.close();
          } catch (err) {
            console.warn('Error closing PayPal buttons during error cleanup:', err);
          }
          paypalButtonsRef.current = null;
        }

        // Clear container if it exists
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        if (isMountedRef.current) {
          setLoadError(errorMessage);
          setIsLoading(false);
          onError(new Error(errorMessage));
        }
      }
    };

    const loadPayPalScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script already exists
        let script = document.getElementById(paypalScriptId) as HTMLScriptElement;
        
        if (script) {
          // Script exists, check if PayPal is already loaded
          if (window.paypal) {
            // Handle blocked logger case
            if (window.paypal.logger) {
              window.paypal.logger.error = window.paypal.logger.error || (() => Promise.resolve());
              window.paypal.logger.warn = window.paypal.logger.warn || (() => Promise.resolve());
              window.paypal.logger.info = window.paypal.logger.info || (() => Promise.resolve());
              window.paypal.logger.debug = window.paypal.logger.debug || (() => Promise.resolve());
              window.paypal.logger.track = window.paypal.logger.track || (() => Promise.resolve());
            }
            resolve();
            return;
          }
          
          // Script exists but PayPal not loaded, wait for it
          script.onload = () => {
            // Handle blocked logger case after load
            if (window.paypal?.logger) {
              window.paypal.logger.error = window.paypal.logger.error || (() => Promise.resolve());
              window.paypal.logger.warn = window.paypal.logger.warn || (() => Promise.resolve());
              window.paypal.logger.info = window.paypal.logger.info || (() => Promise.resolve());
              window.paypal.logger.debug = window.paypal.logger.debug || (() => Promise.resolve());
              window.paypal.logger.track = window.paypal.logger.track || (() => Promise.resolve());
            }
            resolve();
          };
          script.onerror = () => reject(new Error('Failed to load existing PayPal script'));
          return;
        }

        // Create new script
        script = document.createElement('script');
        script.id = paypalScriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&disable-funding=card&components=buttons&debug=false`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          // Add a small delay to ensure PayPal is fully initialized
          setTimeout(() => {
            if (window.paypal) {
              // Handle blocked logger case after initial load
              if (window.paypal.logger) {
                window.paypal.logger.error = window.paypal.logger.error || (() => Promise.resolve());
                window.paypal.logger.warn = window.paypal.logger.warn || (() => Promise.resolve());
                window.paypal.logger.info = window.paypal.logger.info || (() => Promise.resolve());
                window.paypal.logger.debug = window.paypal.logger.debug || (() => Promise.resolve());
                window.paypal.logger.track = window.paypal.logger.track || (() => Promise.resolve());
              }
              resolve();
            } else {
              reject(new Error('PayPal SDK loaded but window.paypal is not available'));
            }
          }, 100);
        };

        script.onerror = (event) => {
          console.error('PayPal script failed to load:', event);
          reject(new Error('Failed to load PayPal SDK script'));
        };

        // Add script to head
        document.head.appendChild(script);
      });
    };

    const initializePayPal = async () => {
      try {
        if (isInitializedRef.current || !isMountedRef.current) return;

        setIsLoading(true);
        setLoadError(null);

        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
          try {
            await loadPayPalScript();
            
            if (isMountedRef.current) {
              await initializePayPalButtons();
              break; // Success, exit retry loop
            }
            return;
          } catch (error) {
            retryCount++;
            if (retryCount === maxRetries) {
              throw error; // Throw on final retry
            }
            console.warn(`PayPal initialization attempt ${retryCount} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          }
        }
      } catch (error) {
        console.error('Error loading PayPal:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load PayPal';
        
        if (isMountedRef.current) {
          setLoadError(errorMessage);
          setIsLoading(false);
          onError(new Error(errorMessage));
        }
      }
    };

    initializePayPal();    return () => {
      // Set mounted flag to false first
      isMountedRef.current = false;

      // Use RAF to ensure we don't cleanup during a render
      requestAnimationFrame(() => {
        // Clean up PayPal buttons
        if (paypalButtonsRef.current) {
          try {
            paypalButtonsRef.current.close();
          } catch (err) {
            console.warn('Error closing PayPal buttons:', err);
          }
          paypalButtonsRef.current = null;
        }

        // Clear container if it still exists
        if (containerRef.current && document.body.contains(containerRef.current)) {
          containerRef.current.innerHTML = '';
        }

        // Reset initialization flag
        isInitializedRef.current = false;
      });
    };
  }, [galleryId, amount, currency, onSuccess, onError, clientId]);

  if (loadError) {
    return (
      <div className="paypal-button-container">
        <div className="p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-red-800 text-sm">
            Failed to load PayPal: {loadError}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Reload page
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