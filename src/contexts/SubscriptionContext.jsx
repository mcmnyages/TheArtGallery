import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockSubscriptionAPI } from '../data/mockSubscriptions';
import { AuthContext } from './AuthContext/context';

export const SubscriptionContext = createContext({
  userSubscriptions: [],
  isLoading: true,
  subscribeToGallery: () => {},
  cancelSubscription: () => {},
  hasGalleryAccess: () => {},
  refreshSubscriptions: () => {}
});

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

  const subscribeToGallery = async (galleryId, price) => {
    if (!user) return null;
    
    try {
      const newSubscription = await mockSubscriptionAPI.subscribeToGallery(user.id, galleryId, price);
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
    if (!user) return false;
    return mockSubscriptionAPI.hasGalleryAccess(user.id, galleryId);
  };

  const contextValue = {
    userSubscriptions,
    isLoading,
    subscribeToGallery,
    cancelSubscription,
    hasGalleryAccess,
    refreshSubscriptions: loadUserSubscriptions
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};
