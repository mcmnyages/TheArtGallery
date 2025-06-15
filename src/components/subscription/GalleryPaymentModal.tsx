import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import PayPalButton from './PayPalButton';
import { galleryService } from '../../services/galleryService';

interface SubscriptionOption {
  _id: string;
  duration: number;
  price: number;
  label: string;
  isActive: boolean;
}

interface GalleryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  galleryName: string;
  currency: string;
  subscriptionOptions: SubscriptionOption[];
  selectedOption: SubscriptionOption;
  ownerId: string;
  onSubscriptionSelect: (option: SubscriptionOption) => void;
  onPaymentSuccess: (message: string) => void;
}

const GalleryPaymentModal: React.FC<GalleryPaymentModalProps> = ({
  isOpen,
  onClose,
  galleryId,
  galleryName,
  currency,
  subscriptionOptions,
  selectedOption,
  ownerId,
  onSubscriptionSelect,
  onPaymentSuccess
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Ensure selected option is valid
  const validSelectedOption = selectedOption && subscriptionOptions.find(opt => opt._id === selectedOption._id);
  if (!validSelectedOption && subscriptionOptions.length > 0) {
    onSubscriptionSelect(subscriptionOptions[0]);
  }

  const handlePaymentSuccess = async (orderId: string) => {
    if (!user?.id) {
      console.error('❌ Payment verification failed: No user ID found');
      setError('User authentication required. Please log in and try again.');
      return;
    }
    
    if (!selectedOption || !selectedOption._id) {
      console.error('❌ Payment verification failed: No subscription option selected');
      setError('Please select a subscription option to continue.');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);

      console.log('🔍 Processing payment success:', {
        galleryId,
        orderId,
        userId: user.id,
        subscriptionOption: selectedOption
      });
        
      const paymentStatus = await galleryService.verifyPayment(galleryId, orderId, user.id, selectedOption._id);
      
      console.log('✅ Payment verification response:', paymentStatus);
      
      if (paymentStatus.hasAccess || paymentStatus.subscription?.isActive) {
        console.log('🎉 Access granted:', paymentStatus);
        setError(null);
        const message = paymentStatus.message || `Successfully subscribed to ${galleryName} for ${selectedOption.label}!`;
        setSuccessMessage(message);
        setIsProcessing(false);

        setTimeout(() => {
          onPaymentSuccess(message);
          onClose();
        }, 2000);
      } else {
        console.error('❌ Payment verified but access not granted:', paymentStatus);
        throw new Error(paymentStatus.message || 'Payment verification failed. If the amount was charged, please contact support.');
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      const errorRef = `ERR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      console.error('🆔 Support reference:', errorRef);
      setError(`${error instanceof Error ? error.message : 'Payment verification failed'}. Support reference: ${errorRef}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    setError('There was a problem processing your payment. Please try again.');
  };

  const handleOptionSelect = (option: SubscriptionOption) => {
    setError(null); // Clear any previous errors
    onSubscriptionSelect(option);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
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
            {/* Subscription Options */}
            <div className="mb-4">
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Choose your subscription:
              </h4>
              <div className="space-y-2">
                {subscriptionOptions.map((option) => (
                  <div
                    key={option._id}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedOption._id === option._id
                        ? isDarkMode
                          ? 'bg-blue-900/30 border-2 border-blue-500'
                          : 'bg-blue-50 border-2 border-blue-500'
                        : isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {option.label}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {option.duration} days access
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {currency} {option.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-800'} mb-4`}>
                {error}
              </div>
            )}
            
            <div data-message-container>
              {successMessage && (
                <div className={`p-4 rounded-md ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-800'} mb-4`}>
                  {successMessage}
                </div>
              )}
            </div>
            
            {/* Payment Section */}
            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Processing payment...</span>
                </div>
              ) : (
                user?.id ? (
                  selectedOption ? (
                    <PayPalButton
                      galleryId={galleryId}
                      userId={user.id}
                      amount={selectedOption.price}
                      currency={currency}
                      subscriptionOptionId={selectedOption._id}
                      ownerId={ownerId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  ) : (
                    <div className="text-center text-yellow-500">
                      Please select a subscription option to continue
                    </div>
                  )
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
