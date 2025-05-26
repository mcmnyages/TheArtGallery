import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const HeroSection = ({ title, subtitle, isAuthenticated }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${
      isDarkMode ? 'bg-gray-800' : 'bg-blue-600'
    }`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800 opacity-90' 
          : 'bg-gradient-to-r from-blue-900 to-blue-700 opacity-90'
      }`}></div>
      
      {/* Content */}
      <div className="relative px-6 py-12 md:py-20 md:px-12 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
          {title}
        </h1>
        <p className={`text-lg md:text-xl mb-6 max-w-2xl ${
          isDarkMode ? 'text-gray-300' : 'text-blue-100'
        }`}>
          {subtitle}
        </p>
        <div className="mt-4 space-x-4">
          {isAuthenticated ? (
            <Link
              to="/galleries"
              className={`inline-block px-6 py-3 rounded-md text-base font-medium shadow-md transition-colors ${
                isDarkMode 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-white text-blue-700 hover:bg-blue-50'
              }`}
            >
              Explore Galleries
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className={`inline-block px-6 py-3 rounded-md text-base font-medium shadow-md transition-colors ${
                  isDarkMode 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-white text-blue-700 hover:bg-blue-50'
                }`}
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className={`inline-block px-6 py-3 rounded-md text-base font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;