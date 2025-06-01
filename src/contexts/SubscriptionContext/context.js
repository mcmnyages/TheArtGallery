import { createContext } from 'react';

export const SubscriptionContext = createContext({
  userSubscriptions: [],
  isLoading: true,
  subscribeToGallery: () => {},
  cancelSubscription: () => {},
  hasGalleryAccess: () => false,
  refreshSubscriptions: () => {}
});
