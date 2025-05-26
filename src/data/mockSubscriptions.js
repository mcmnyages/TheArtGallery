// Mock subscriptions data
export const subscriptions = [
  {
    id: '1',
    userId: '4',
    galleryId: '1',
    status: 'active',
    startDate: '2025-05-01T00:00:00Z',
    endDate: '2025-06-01T00:00:00Z',
    price: 9.99
  },
  {
    id: '2',
    userId: '4',
    galleryId: '2',
    status: 'active',
    startDate: '2025-05-01T00:00:00Z',
    endDate: '2025-06-01T00:00:00Z',
    price: 14.99
  }
];

// Mock subscription API functions
export const mockSubscriptionAPI = {
  // Get user's active subscriptions
  getUserSubscriptions: (userId) => {
    return subscriptions.filter(sub => 
      sub.userId === userId && 
      sub.status === 'active' &&
      new Date(sub.endDate) > new Date()
    );
  },

  // Check if user has access to a gallery
  hasGalleryAccess: (userId, galleryId) => {
    return subscriptions.some(sub => 
      sub.userId === userId &&
      sub.galleryId === galleryId &&
      sub.status === 'active' &&
      new Date(sub.endDate) > new Date()
    );
  },

  // Subscribe to a gallery
  subscribeToGallery: (userId, galleryId, price) => {
    const newSubscription = {
      id: String(subscriptions.length + 1),
      userId,
      galleryId,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      price
    };
    subscriptions.push(newSubscription);
    return newSubscription;
  },

  // Cancel subscription
  cancelSubscription: (subscriptionId) => {
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      subscription.status = 'cancelled';
      subscription.endDate = new Date().toISOString();
      return true;
    }
    return false;
  }
};
