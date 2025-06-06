import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import PayPalButton from './PayPalButton';
import { galleryService } from '../../services/galleryService';

interface GalleryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  userId?: string;
  galleryName: string;
  price: number;
  currency: string;
  onPaymentSuccess: () => void;
}

const GalleryPaymentModal: React.FC<GalleryPaymentModalProps> = ({
  isOpen,
  onClose,
  galleryId,
  galleryName,
  price,
  currency,
  onPaymentSuccess
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;
  const handlePaymentSuccess = async (orderId: string) => {
    console.log('🚀 Starting payment verification process:', {
      orderId,
      userId: user?.id,
      galleryId,
      price,
      currency
    });

    if (!user?.id) {
      console.error('❌ Payment verification failed: No user ID found');
      setError('User authentication required. Please log in and try again.');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('⏳ Adding delay to ensure PayPal processing...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('🔍 Verifying payment with backend...', {
        galleryId,
        orderId,
        userId: user.id
      });
      
      // Verify the payment with our backend
      const paymentStatus = await galleryService.verifyPayment(galleryId, orderId, user.id);
      console.log('✅ Payment verification response:', paymentStatus);
      
      if (paymentStatus.hasAccess) {
        console.log('🎉 Payment verification successful, granting access');
        onPaymentSuccess();
        onClose();
      } else {
        console.error('❌ Payment verified but access not granted:', paymentStatus);
        throw new Error('Payment verification failed. If the amount was charged, please contact support.');
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      
      // Generate a support reference number for troubleshooting
      const errorRef = `ERR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      console.error('🆔 Support reference:', errorRef);
      
      setError(`There was a problem verifying your payment. Please contact support with reference: ${errorRef}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    setError('There was a problem processing your payment. Please try again.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        
        <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
          {/* Header */}
          <div className="mb-4">
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Access {galleryName}
            </h3>
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Get instant access to this gallery for {currency}{price}
            </p>
            
            {error && (
              <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-800'} mb-4`}>
                {error}
              </div>
            )}

            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Processing payment...</span>
                </div>
              ) : (
                user?.id ? (
                  <PayPalButton
                    galleryId={galleryId}
                    userId={user.id}
                    amount={price}
                    currency={currency}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <div className="text-center text-red-500">
                    Please log in to make a purchase
                  </div>
                )
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Secure payment powered by PayPal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPaymentModal;
