import React, { useContext, useState, useEffect } from 'react';
import { mockSubscriptionAPI } from '../../data/mockSubscriptions';
import { AuthContext } from '../AuthContext/context';
import { SubscriptionContext } from './context';
import { galleryService } from '../../services/galleryService'; 

export const SubscriptionProvider = ({ children }) => {
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const loadUserSubscriptions = async () => {
    if (user) {
      const subscriptions = await mockSubscriptionAPI.getUserSubscriptions(user.id);
      setUserSubscriptions(subscriptions);
    } else {
      setUserSubscriptions([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserSubscriptions();
  }, [user]);
  const subscribeToGallery = async (galleryId, subscriptionOption) => {
    if (!user) return null;
    
    try {
      // Create the subscription using galleryService
      const newSubscription = await galleryService.createSubscription(galleryId, subscriptionOption);
      
      // Update local state with new subscription
      setUserSubscriptions(prev => [...prev, newSubscription]);
      
      return newSubscription;
    } catch (error) {
      console.error('Failed to subscribe to gallery:', error);
      return null;
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    try {
      const success = await mockSubscriptionAPI.cancelSubscription(subscriptionId);
      if (success) {
        setUserSubscriptions(prev => 
          prev.map(sub =>
            sub.id === subscriptionId 
              ? { ...sub, status: 'cancelled' } 
              : sub
          )
        );
      }
      return success;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  };

  const hasGalleryAccess = (galleryId) => {
    if (!user) return false; // Not logged in = no access
    
    // Check if user has an active subscription for this gallery
    return userSubscriptions.some(sub => 
      sub.galleryId === galleryId && 
      sub.status === 'active' &&
      new Date(sub.endDate) > new Date()
    );
  };

  return (
    <SubscriptionContext.Provider value={{
      userSubscriptions,
      isLoading,
      subscribeToGallery,
      cancelSubscription,
      hasGalleryAccess,
      refreshSubscriptions: loadUserSubscriptions
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
