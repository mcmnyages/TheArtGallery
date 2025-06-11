import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { useMessage } from '../../hooks/useMessage';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield } from 'lucide-react';

export default function SubscriptionManager({ gallery }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addMessage } = useMessage();
  const { 
    userSubscriptions, 
    subscribeToGallery, 
    cancelSubscription, 
    hasGalleryAccess 
  } = useSubscription();

  const currentSubscription = userSubscriptions.find(
    sub => sub.galleryId === gallery._id && sub.status === 'active'
  );
  const [selectedOption, setSelectedOption] = useState(gallery.subscriptionOptions[0]);

  const handleSubscribe = async () => {
    if (!user) {
      addMessage({ 
        text: 'Please log in to subscribe to this gallery', 
        type: 'info' 
      });
      navigate('/login', { 
        state: { from: `/gallery/${gallery._id}` } 
      });
      return;
    }

    if (!selectedOption) {
      addMessage({
        text: 'Please select a subscription option',
        type: 'error'
      });
      return;
    }

    try {
      const subscription = await subscribeToGallery(gallery._id, selectedOption);
      if (subscription) {
        addMessage({ 
          text: `Successfully subscribed to gallery for ${selectedOption.label}`, 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      addMessage({ 
        text: 'Failed to subscribe to gallery', 
        type: 'error' 
      });
    }
  };

  const handleCancel = async () => {
    if (!currentSubscription) return;
    
    try {
      const success = await cancelSubscription(currentSubscription.id);
      if (success) {
        addMessage({ 
          text: 'Successfully cancelled subscription', 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      addMessage({ 
        text: 'Failed to cancel subscription', 
        type: 'error' 
      });
    }
  };

  if (!user) {
    return (
      <div className={`rounded-lg p-6 shadow-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-500/20">
            <Lock className="h-6 w-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Subscribe to Access</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Log in to subscribe and unlock this gallery
            </p>
            <button
              onClick={() => navigate('/login', { 
                state: { from: `/gallery/${gallery._id}` } 
              })}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Log In to Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentSubscription) {
    return (
      <div className={`rounded-lg p-6 shadow-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-500/20">
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Subscribed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              You have access to all content in this gallery
            </p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-6 shadow-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20`}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-purple-500/20">
          <Lock className="h-6 w-6 text-purple-500" />
        </div>
        <div className="flex-1">          <h3 className="text-lg font-semibold mb-2">Subscribe to Access</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Choose a subscription option to unlock this gallery
          </p>
          
          {/* Subscription Options */}
          <div className="space-y-4 mb-4">
            {gallery.subscriptionOptions.map((option, index) => (
              <div 
                key={index}
                onClick={() => setSelectedOption(option)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedOption === option
                    ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.duration} days access
                    </p>
                  </div>
                  <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    ${option.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Subscribe Now for ${selectedOption?.price}
          </button>
        </div>
      </div>
    </div>
  );
}
