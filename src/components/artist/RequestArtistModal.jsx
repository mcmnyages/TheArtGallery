import React, { useState } from 'react';
import { HiX, HiColorSwatch, HiStar, HiHeart, HiBan, HiCheck } from 'react-icons/hi';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { galleryService } from '../../services/galleryService';
import { useMessage } from '../../hooks/useMessage';

const RequestArtistModal = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addMessage } = useMessage();
  const [step, setStep] = useState('info'); // 'info' or 'confirm'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      const response = await galleryService.submitArtistApplication(user.email);
      
      // Show success message
      addMessage({
        type: 'success',
        text: response.message || 'Application submitted successfully'
      });

      // Close modal and navigate to account page
      onClose();
      navigate('/account');
    } catch (err) {
      setError(err.message);
      addMessage({
        type: 'error',
        text: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } transform transition-all duration-300 scale-100 opacity-100`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 p-1 rounded-full transition-colors ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
          } z-10`}
        >
          <HiX className="w-5 h-5" />
        </button>

        {step === 'info' ? (
          <>
            {/* Header Image */}
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90" />
              <img 
                src="/assets/images/urban art.avif"
                alt="Artist workspace"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center text-center text-white p-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Become an Artist</h2>
                  <p className="text-lg text-white/90">Share your masterpieces with our global community</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Why Join as an Artist?</h3>
                  
                  <ul className={`space-y-4 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <li className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <HiColorSwatch className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <span className="font-medium">Showcase your artwork</span>
                        <p className="text-sm opacity-75">Present your creations to millions of art enthusiasts worldwide</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <HiStar className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <span className="font-medium">Featured Collections</span>
                        <p className="text-sm opacity-75">Get featured in our curated galleries and boost visibility</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <HiHeart className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <span className="font-medium">Build Your Following</span>
                        <p className="text-sm opacity-75">Connect with art lovers and grow your audience</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <HiBan className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <span className="font-medium">Professional Tools</span>
                        <p className="text-sm opacity-75">Access exclusive artist features and analytics</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className={`text-xl font-semibold mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Ready to Get Started?</h3>
                    <p className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Join our vibrant community of artists and start sharing your work with art enthusiasts worldwide. 
                      We'll review your request within 48 hours.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => setStep('confirm')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                        text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02]
                        shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2"
                    >
                      <span>Continue to Application</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <p className={`text-sm text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {/* Fill out a quick form and we'll review your application */}
                    </p>
                  </div>

                  <div className={`text-xs text-center ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    By applying, you agree to our artist terms and community guidelines
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8">
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Confirm Your Application
            </h3>

            <div className={`p-6 rounded-xl mb-6 ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                We'll send this email to confirm your Artist application:
              </p>
              <div className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.email}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                  text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                  ${submitting ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-[1.02]'}`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Submit Application</span>
                    <HiCheck className="w-5 h-5" />
                  </span>
                )}
              </button>
              <button
                onClick={() => setStep('info')}
                disabled={submitting}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Back
              </button>
            </div>

            <p className={`mt-4 text-sm text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              You can change your email in your account settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestArtistModal;