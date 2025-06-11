import React, { useEffect, useRef, useState, useCallback } from 'react';
import { paypalService } from '../../services/paypalService';
import { paypalSDKManager } from '../../services/paypalSDKManager';

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

export interface PayPalSDK {
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const clientId = process.env.VITE_PAYPAL_CLIENT_ID;

  const debugLog = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[PayPalButton] ${message}`, ...args);
    }
  }, [debug]);

  // Initialize PayPal buttons with improved error handling
  const initializePayPalButtons = useCallback(async () => {
    debugLog('Initializing PayPal buttons');
    
    if (!containerRef.current || !document.body.contains(containerRef.current)) {
      throw new Error('Container not ready');
    }

    // Close existing buttons if any
    if (paypalButtonsRef.current) {
      try {
        paypalButtonsRef.current.close();
      } catch (err) {
        console.warn('Error closing PayPal buttons:', err);
      }
      paypalButtonsRef.current = null;
    }

    // Create fresh container
    containerRef.current.innerHTML = '<div id="paypal-button-container"></div>';
    const buttonContainer = containerRef.current.querySelector('#paypal-button-container') as HTMLElement;

    if (!buttonContainer) {
      throw new Error('Failed to create PayPal button container');
    }

    try {
      debugLog('Loading PayPal SDK');
      const paypal = await paypalSDKManager.loadSDK(clientId!, currency, debug);

      if (!isMountedRef.current) {
        debugLog('Component unmounted during SDK load');
        return;
      }

      debugLog('Creating PayPal buttons instance');
      const buttons = paypal.Buttons({
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
  }, [amount, currency, galleryId, onError, onSuccess, subscriptionOptionId, userId, clientId, debug, debugLog]);

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

    // Initialize immediately
    initPayPal();

    // Cleanup function
    return () => {
      debugLog('Component unmounting, cleaning up');
      isMountedRef.current = false;
      if (paypalButtonsRef.current) {
        try {
          paypalButtonsRef.current.close();
        } catch (err) {
          console.warn('Error closing PayPal buttons during cleanup:', err);
        }
        paypalButtonsRef.current = null;
      }
    };
  }, [
    clientId, 
    currency, 
    amount, 
    subscriptionOptionId, 
    initializePayPalButtons, 
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
              setLoadError(null);
              setIsLoading(true);
              initializePayPalButtons().catch((error) => {
                const errorMessage = error instanceof Error ? error.message : 'Failed to initialize PayPal';
                setLoadError(errorMessage);
                setIsLoading(false);
                onError(new Error(errorMessage));
              });
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