// Mock Users with enhanced role-based data
export const users = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    subscriptions: [],
    createdAt: '2025-01-01T00:00:00Z',
    profileImage: 'https://source.unsplash.com/100x100/?portrait',
    preferences: { notifications: true, newsletter: false }
  },
  {
    id: '2',
    email: 'artist@example.com',
    password: 'artist123',
    firstName: 'Jane',
    lastName: 'Artist',
    role: 'artist',
    bio: 'Contemporary artist specializing in digital art and photography',
    createdAt: '2025-01-02T00:00:00Z',
    profileImage: 'https://source.unsplash.com/100x100/?artist',
    artistProfile: {
      specialties: ['digital art', 'photography'],
      exhibitions: ['Modern Art Gallery 2024', 'Digital Dreams 2025'],
      featured: true
    }
  },
  {
    id: '3',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00Z',
    profileImage: 'https://source.unsplash.com/100x100/?admin',
    permissions: ['manage_users', 'manage_content', 'manage_subscriptions']
  },
  {
    id: '4',
    email: 'premium@example.com',
    password: 'premium123',
    firstName: 'Sarah',
    lastName: 'Premium',
    role: 'user',
    subscriptions: ['1', '2'],
    createdAt: '2025-01-03T00:00:00Z',
    profileImage: 'https://source.unsplash.com/100x100/?premium',
    membershipTier: 'premium',
    preferences: { notifications: true, newsletter: true }
  }
];

// Generate role-specific tokens
const generateTokens = (role) => ({
  accessToken: `mock-${role}-access-token-${Date.now()}`,
  refreshToken: `mock-${role}-refresh-token-${Date.now()}`,
  expiresIn: 3600
});

// Mock Artworks
export const artworks = [
  {
    id: '1',
    title: 'Abstract Harmony',
    description: 'A vibrant exploration of color and form',
    artistId: '2',
    category: 'painting',
    price: 1200,
    imageUrl: 'https://source.unsplash.com/800x600/?artwork,painting',
    createdAt: '2025-05-20T10:00:00Z',
    galleryId: '1'
  },
  {
    id: '2',
    title: 'Urban Dreams',
    description: 'Photography series capturing city life',
    artistId: '2',
    category: 'photography',
    price: 800,
    imageUrl: 'https://source.unsplash.com/800x600/?artwork,photography',
    createdAt: '2025-05-21T14:30:00Z',
    galleryId: '1'
  },
  {
    id: '3',
    title: 'Digital Waves',
    description: 'Digital art exploring ocean themes',
    artistId: '2',
    category: 'digital',
    price: 600,
    imageUrl: 'https://source.unsplash.com/800x600/?artwork,digital',
    createdAt: '2025-05-22T09:15:00Z',
    galleryId: '2'
  }
];

// Mock Galleries
export const galleries = [
  {
    id: '1',
    name: 'Modern Expressions',
    description: 'A collection of contemporary artworks',
    artistId: '2',
    coverImage: 'https://source.unsplash.com/1200x800/?art,gallery',
    subscriptionPrice: 9.99,
    createdAt: '2025-05-15T08:00:00Z',
    category: 'contemporary',
    featured: true
  },
  {
    id: '2',
    name: 'Digital Dreams',
    description: 'Exploring the intersection of art and technology',
    artistId: '2',
    coverImage: 'https://source.unsplash.com/1200x800/?digital,art',
    subscriptionPrice: 14.99,
    createdAt: '2025-05-16T10:30:00Z',
    category: 'digital',
    featured: false
  }
];

// Mock Subscriptions
export const subscriptions = [
  {
    id: '1',
    userId: '1',
    galleryId: '1',
    startDate: '2025-05-01T00:00:00Z',
    endDate: '2025-06-01T00:00:00Z',
    status: 'active',
    price: 9.99
  }
];

// Mock Functions to simulate API calls
let mockArtworks = [...artworks];
let mockGalleries = [...galleries];
let mockUsers = [...users];
let mockSubscriptions = [...subscriptions];

// Mock API Implementation
export const mockApi = {  // Auth
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Input validation
        if (!email) {
          reject({
            status: 'error',
            code: 'EMAIL_REQUIRED',
            message: 'Email is required'
          });
          return;
        }

        if (!password) {
          reject({
            status: 'error',
            code: 'PASSWORD_REQUIRED',
            message: 'Password is required'
          });
          return;
        }        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          // Check if user is premium
          const isPremium = user.membershipTier === 'premium';
          const effectiveRole = isPremium ? 'premium' : user.role;
          
          resolve({
            status: 'success',
            code: 'LOGIN_SUCCESS',
            message: `Welcome back, ${user.firstName}!`,
            data: {
              user: {
                ...userWithoutPassword,
                effectiveRole
              },
              tokens: generateTokens(effectiveRole)
            }
          });
          return;
        }
        
        // Demo mode - if special demo credentials
        if (email === 'demo@example.com' && password === 'demo123') {
          const demoUser = mockUsers.find(u => u.role === 'user');
          const { password: _, ...userWithoutPassword } = demoUser;
          resolve({
            status: 'success',
            code: 'DEMO_LOGIN',
            message: 'Welcome to demo mode!',
            data: {
              user: userWithoutPassword,
              tokens: generateTokens('user')
            }
          });
          return;
        }

        // Check if user exists but password is wrong
        const userExists = mockUsers.some(u => u.email === email);
        if (userExists) {
          reject({
            status: 'error',
            code: 'INVALID_PASSWORD',
            message: 'Invalid password'
          });
          return;
        }
        
        // User doesn't exist
        reject({
          status: 'error',
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email'
        });
      }, 500);
    });
  },
  // User Profile
  getUserProfile: (token) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!token) {
          reject({
            status: 'error',
            code: 'TOKEN_REQUIRED',
            message: 'Authentication token is required'
          });
          return;
        }

        const userRole = token.startsWith('mock-admin') ? 'admin' 
          : token.startsWith('mock-artist') ? 'artist' 
          : 'user';
        
        const user = mockUsers.find(u => u.role === userRole) || mockUsers.find(u => u.role === 'user');
        if (!user) {
          reject({
            status: 'error',
            code: 'USER_NOT_FOUND',
            message: 'User profile not found'
          });
          return;
        }

        const { password: _, ...userWithoutPassword } = user;
        resolve({
          status: 'success',
          code: 'PROFILE_FETCHED',
          message: 'Profile retrieved successfully',
          data: userWithoutPassword
        });
      }, 300);
    });
  },
  // Register
  register: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Input validation
        if (!userData.email) {
          reject({
            status: 'error',
            code: 'EMAIL_REQUIRED',
            message: 'Email is required'
          });
          return;
        }

        if (!userData.password) {
          reject({
            status: 'error',
            code: 'PASSWORD_REQUIRED',
            message: 'Password is required'
          });
          return;
        }

        if (!userData.firstName || !userData.lastName) {
          reject({
            status: 'error',
            code: 'NAME_REQUIRED',
            message: 'First name and last name are required'
          });
          return;
        }

        // Check if email is already registered
        if (mockUsers.some(u => u.email === userData.email)) {
          reject({
            status: 'error',
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists'
          });
          return;
        }

        const newUser = {
          id: String(mockUsers.length + 1),
          ...userData,
          role: userData.role || 'user',
          createdAt: new Date().toISOString(),
          subscriptions: [],
          profileImage: `https://source.unsplash.com/100x100/?profile${mockUsers.length + 1}`,
          preferences: {
            notifications: true,
            newsletter: false
          }
        };

        mockUsers.push(newUser);
        const { password: _, ...userWithoutPassword } = newUser;
        resolve({
          status: 'success',
          code: 'REGISTRATION_SUCCESS',
          message: `Welcome to KabbalaArts, ${newUser.firstName}!`,
          data: {
            user: userWithoutPassword,
            tokens: generateTokens(newUser.role)
          }
        });
      }, 500);
    });
  },
  // Update user profile
  updateUserProfile: (userId, updates) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!userId) {
          reject({
            status: 'error',
            code: 'USER_ID_REQUIRED',
            message: 'User ID is required'
          });
          return;
        }

        if (!updates || Object.keys(updates).length === 0) {
          reject({
            status: 'error',
            code: 'NO_UPDATES',
            message: 'No updates provided'
          });
          return;
        }

        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          reject({
            status: 'error',
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          });
          return;
        }

        // Check if trying to update email to one that already exists
        if (updates.email && updates.email !== mockUsers[userIndex].email) {
          const emailExists = mockUsers.some(u => u.email === updates.email);
          if (emailExists) {
            reject({
              status: 'error',
              code: 'EMAIL_EXISTS',
              message: 'This email is already in use'
            });
            return;
          }
        }

        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
        const { password: _, ...userWithoutPassword } = mockUsers[userIndex];
        resolve({
          status: 'success',
          code: 'PROFILE_UPDATED',
          message: 'Profile updated successfully',
          data: userWithoutPassword
        });
      }, 300);
    });
  },

  // Artworks
  getArtworks: () => Promise.resolve(mockArtworks),
  getArtworksByArtist: (artistId) => Promise.resolve(mockArtworks.filter(a => a.artistId === artistId)),
  getArtworksByGallery: (galleryId) => Promise.resolve(mockArtworks.filter(a => a.galleryId === galleryId)),
  createArtwork: (artwork) => {
    const newArtwork = { id: String(mockArtworks.length + 1), ...artwork };
    mockArtworks.push(newArtwork);
    return Promise.resolve(newArtwork);
  },
  deleteArtwork: (id) => {
    mockArtworks = mockArtworks.filter(a => a.id !== id);
    return Promise.resolve({ success: true });
  },

  // Galleries
  getGalleries: () => Promise.resolve(mockGalleries),
  getGalleryById: (id) => Promise.resolve(mockGalleries.find(g => g.id === id)),
  getGalleriesByArtist: (artistId) => Promise.resolve(mockGalleries.filter(g => g.artistId === artistId)),
  createGallery: (gallery) => {
    const newGallery = { id: String(mockGalleries.length + 1), ...gallery };
    mockGalleries.push(newGallery);
    return Promise.resolve(newGallery);
  },
  updateGallery: (id, updates) => {
    mockGalleries = mockGalleries.map(g => g.id === id ? { ...g, ...updates } : g);
    return Promise.resolve(mockGalleries.find(g => g.id === id));
  },

  // Subscriptions
  getUserSubscriptions: (userId) => Promise.resolve(mockSubscriptions.filter(s => s.userId === userId)),
  createSubscription: (subscription) => {
    const newSubscription = { 
      id: String(mockSubscriptions.length + 1), 
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      ...subscription 
    };
    mockSubscriptions.push(newSubscription);
    return Promise.resolve(newSubscription);
  },
  checkSubscription: (userId, galleryId) => {
    const sub = mockSubscriptions.find(
      s => s.userId === userId && 
      s.galleryId === galleryId && 
      s.status === 'active' &&
      new Date(s.endDate) > new Date()
    );
    return Promise.resolve(!!sub);
  },
  cancelSubscription: (subscriptionId) => {
    mockSubscriptions = mockSubscriptions.map(s => 
      s.id === subscriptionId 
        ? { ...s, status: 'cancelled', endDate: new Date().toISOString() }
        : s
    );
    return Promise.resolve(true);
  },
  renewSubscription: (subscriptionId) => {
    const subscription = mockSubscriptions.find(s => s.id === subscriptionId);
    if (!subscription) {
      return Promise.reject(new Error('Subscription not found'));
    }
    
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    subscription.status = 'active';
    return Promise.resolve(subscription);
  }
};
