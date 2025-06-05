import React, { useEffect } from 'react';
import { paypalService } from '../../services/paypalService';

interface PayPalButtonProps {
  galleryId: string;
  amount: number;
  currency?: string;
  onSuccess: (orderId: string) => void;
  onError: (error: Error) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  galleryId,
  amount,
  currency = 'USD',
  onSuccess,
  onError
}) => {
  useEffect(() => {
    // Add PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.VITE_PAYPAL_CLIENT_ID}&currency=${currency}`;
    script.async = true;

    script.onload = () => {
      try {
        window.paypal?.Buttons({
          createOrder: async () => {
            try {
              const order = await paypalService.createOrder(galleryId, amount, currency);
              return order.id;
            } catch (error) {
              console.error('Error creating order:', error);
              onError(error instanceof Error ? error : new Error('Failed to create order'));
              return null;
            }
          },
          onApprove: async (data: { orderID: string }) => {
            try {
              await paypalService.captureOrder(data.orderID);
              const isVerified = await paypalService.verifyPayment(data.orderID);
              
              if (isVerified) {
                onSuccess(data.orderID);
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Error processing payment:', error);
              onError(error instanceof Error ? error : new Error('Payment processing failed'));
            }
          },
          onError: (err: Error) => {
            console.error('PayPal Error:', err);
            onError(err);
          }
        }).render('#paypal-button-container');
      } catch (error) {
        console.error('Error initializing PayPal buttons:', error);
        onError(error instanceof Error ? error : new Error('Failed to initialize PayPal'));
      }
    };

    script.onerror = (error) => {
      console.error('Error loading PayPal SDK:', error);
      onError(new Error('Failed to load PayPal SDK'));
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [galleryId, amount, currency, onSuccess, onError]);

  return <div id="paypal-button-container" />;
};

export default PayPalButton;
