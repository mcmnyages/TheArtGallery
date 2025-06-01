import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {useTheme} from '../contexts/ThemeContext';

const AccountPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Initialize form with user data when component loads
  useEffect(() => {
    if (user) {
      setFormState(prevState => ({
        ...prevState,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }));
    }
  }, [user]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setProfileError('');
    setProfileSuccess(false);
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setPasswordError('');
    setPasswordSuccess(false);
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);
    
    try {
      // Validate form data
      if (!formState.firstName.trim() || !formState.lastName.trim()) {
        throw new Error('First name and last name are required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data (in a real app, this would call an API)
      updateUser({
        firstName: formState.firstName,
        lastName: formState.lastName,
      });
      
      setProfileSuccess(true);
    } catch (error) {
      setProfileError(error.message || 'Failed to update profile information');
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);
    
    try {
      // Validate password
      if (!formState.currentPassword) {
        throw new Error('Current password is required');
      }
      
      if (!formState.newPassword) {
        throw new Error('New password is required');
      }
      
      if (formState.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      
      if (formState.newPassword !== formState.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Password update logic (in a real app, this would call an API)
      setPasswordSuccess(true);
      setFormState(prevState => ({
        ...prevState,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  const subscription = user.subscription || { plan: 'free', status: 'inactive' };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      {/* Profile Summary Card */}
      <div className={`bg-white shadow-md rounded-lg p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center">
          <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {subscription.plan === 'free' ? 'Free Plan' : `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Profile Information Form */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            
            <form onSubmit={handleProfileSubmit}>
              {profileError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-sm text-red-700">{profileError}</p>
                </div>
              )}
              
              {profileSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <p className="text-sm text-green-700">Profile updated successfully!</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formState.firstName}
                    onChange={handleProfileChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formState.lastName}
                    onChange={handleProfileChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formState.email}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 cursor-not-allowed sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email address cannot be changed.
                </p>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    profileLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {profileLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Change Password Form */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              {passwordError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              )}
              
              {passwordSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <p className="text-sm text-green-700">Password updated successfully!</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={formState.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={formState.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formState.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    passwordLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {passwordLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Sidebar for subscription info and account actions */}
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-base font-semibold mb-3">Subscription Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm font-medium capitalize">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm font-medium capitalize">{subscription.status}</span>
              </div>
              {subscription.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Renews on</span>
                  <span className="text-sm font-medium">
                    {new Date(subscription.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t">
                <a 
                  href="/subscriptions" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <span>Manage Subscription</span>
                  <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-base font-semibold mb-3">Account Actions</h3>
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign out
              </button>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Support</h4>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 block mb-2">Help Center</a>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 block mb-2">Contact Support</a>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 block">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;