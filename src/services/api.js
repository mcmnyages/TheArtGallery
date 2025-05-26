import * as tokenService from './tokenService';

const API_BASE_URL = 'https://api.kabbala-gallery.com/v1'; // Would be a real API URL in production

/**
 * Configure axios with authentication headers
 */
const configureHeaders = () => {
  const token = tokenService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Handle API response
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} - Resolved data or rejected error
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, attempt to refresh
      try {
        await tokenService.refreshAccessToken();
        // You might want to retry the original request here
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        throw new Error('Authentication expired. Please login again.');
      }
    }
    
    const error = data.message || response.statusText;
    throw new Error(error);
  }
  
  return data;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Resolved response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = configureHeaders();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// ----- Authentication API -----

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @returns {Promise<Object>} - User data and tokens
 */
export const loginUser = async (credentials) => {
  // In a real app, this would call the actual API
  // For demo, we'll simulate a successful login
  return new Promise((resolve) => {
    setTimeout(() => {
      const userData = {
        id: '123',
        email: credentials.email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'user'
      };
      
      const tokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        deviceToken: 'mock-device-token'
      };
      
      resolve({ user: userData, tokens });
    }, 800);
  });
};

/**
 * Register user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User data and tokens
 */
export const registerUser = async (userData) => {
  // In a real app, this would call the actual API
  // For demo, we'll simulate a successful registration
  return new Promise((resolve) => {
    setTimeout(() => {
      const responseData = {
        user: {
          id: Math.random().toString(36).substring(2, 15),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'user'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          deviceToken: 'mock-device-token'
        }
      };
      
      resolve(responseData);
    }, 1000);
  });
};

/**
 * Get user profile
 * @param {string} token - Access token
 * @returns {Promise<Object>} - User profile data
 */
export const fetchUserProfile = async (token) => {
  // In a real app, this would call the actual API
  // For demo, we'll simulate a successful profile fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '123',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        subscription: {
          plan: 'basic',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }
      });
    }, 300);
  });
};

// ----- Gallery API -----

/**
 * Fetch all galleries
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} - List of galleries
 */
export const fetchGalleries = async (params = {}) => {
  // In a real app, this would call the actual API
  // For demo, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockGalleries = [
        {
          id: '1',
          title: 'Modern Masterpieces',
          description: 'A collection of contemporary artwork from leading artists around the world',
          category: 'modern',
          imageUrl: '/assets/images/gallery1.jpg',
          imageCount: 42,
          featured: true,
          createdAt: '2023-04-15'
        },
        {
          id: '2',
          title: 'Classical Renaissance',
          description: 'Timeless works from the European Renaissance period',
          category: 'classical',
          imageUrl: '/assets/images/gallery2.jpg',
          imageCount: 36,
          featured: true,
          createdAt: '2023-03-22'
        },
        // Add more mock galleries as needed...
      ];
      
      resolve(mockGalleries);
    }, 800);
  });
};

/**
 * Fetch gallery details by ID
 * @param {string} galleryId - Gallery ID
 * @returns {Promise<Object>} - Gallery details with images
 */
export const fetchGalleryById = async (galleryId) => {
  // In a real app, this would call the actual API
  // For demo, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockGallery = {
        id: galleryId,
        title: `Gallery ${galleryId}`,
        description: 'This gallery features a stunning collection of artistic works...',
        category: 'modern',
        curator: 'Art Specialist Team',
        createdAt: '2023-05-15',
        images: Array.from({ length: 12 }, (_, index) => ({
          id: `${galleryId}-${index + 1}`,
          title: `Artwork ${index + 1}`,
          description: `Beautiful artwork piece number ${index + 1} in this collection.`,
          artist: `Artist ${(index % 4) + 1}`,
          year: 2000 + index,
          dimensions: `${60 + index * 5}cm x ${40 + index * 3}cm`,
          medium: index % 2 === 0 ? 'Oil on canvas' : 'Mixed media',
          imageUrl: `/assets/images/gallery${galleryId}-${(index % 4) + 1}.jpg`,
          thumbnailUrl: `/assets/images/gallery${galleryId}-${(index % 4) + 1}-thumb.jpg`,
        }))
      };
      
      resolve(mockGallery);
    }, 800);
  });
};

// ----- Subscription API -----

/**
 * Fetch available subscription plans
 * @returns {Promise<Array>} - List of subscription plans
 */
export const fetchSubscriptionPlans = async () => {
  // In a real app, this would call the actual API
  // For demo, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockPlans = [
        {
          id: 'basic',
          name: 'Basic',
          price: 9.99,
          interval: 'month',
          description: 'Access to all public galleries',
          features: [
            'Browse all public galleries',
            'Full-screen image viewing',
            'Standard image resolution',
            'Mobile access',
          ]
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 19.99,
          interval: 'month',
          description: 'Enhanced experience with premium features',
          features: [
            'All Basic features',
            'Exclusive premium galleries',
            'High-resolution image downloads',
            'Advanced zoom and detail viewing',
            'Priority customer support',
          ],
          popular: true
        },
        {
          id: 'professional',
          name: 'Professional',
          price: 39.99,
          interval: 'month',
          description: 'Complete access for professional users',
          features: [
            'All Premium features',
            'Ultra-high definition downloads',
            'Offline viewing mode',
            'Artist commentary access',
            'Early access to new exhibitions',
            'Commercial usage rights',
          ]
        }
      ];
      
      resolve(mockPlans);
    }, 600);
  });
};

/**
 * Process subscription payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} - Subscription confirmation
 */
export const processSubscriptionPayment = async (paymentData) => {
  // In a real app, this would call the actual payment API
  // For demo, we'll simulate a successful payment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        subscription: {
          id: 'sub_' + Math.random().toString(36).substring(2, 12),
          planId: paymentData.planId,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          autoRenew: paymentData.autoRenew || true
        }
      });
    }, 1500);
  });
};