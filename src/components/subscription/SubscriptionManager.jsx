import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';

export default function SubscriptionManager({ gallery }) {
  const { user } = useAuth();
  const { 
    userSubscriptions, 
    subscribeToGallery, 
    cancelSubscription, 
    hasGalleryAccess 
  } = useSubscription();

  const currentSubscription = userSubscriptions.find(
    sub => sub.galleryId === gallery.id && sub.status === 'active'
  );

  const handleSubscribe = async () => {
    try {
      const subscription = await subscribeToGallery(gallery.id, gallery.subscriptionPrice);
      if (subscription) {
        // You could add a toast notification here
        console.log('Successfully subscribed to gallery');
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleCancel = async () => {
    if (!currentSubscription) return;
    
    try {
      const success = await cancelSubscription(currentSubscription.id);
      if (success) {
        // You could add a toast notification here
        console.log('Successfully cancelled subscription');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  if (!user) {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-700">Please log in to subscribe to this gallery</p>
      </div>
    );
  }

  if (currentSubscription) {
    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-green-700 font-medium mb-2">You are subscribed to this gallery</p>
        <p className="text-sm text-gray-600 mb-3">
          Valid until: {new Date(currentSubscription.endDate).toLocaleDateString()}
        </p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Cancel Subscription
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <p className="text-gray-700 mb-2">Subscribe to access this gallery</p>
      <p className="text-lg font-bold text-gray-900 mb-3">
        ${gallery.subscriptionPrice}/month
      </p>
      <button
        onClick={handleSubscribe}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
      >
        Subscribe Now
      </button>
    </div>
  );
}
