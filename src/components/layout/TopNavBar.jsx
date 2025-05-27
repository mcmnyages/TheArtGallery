import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { FaSun, FaMoon, FaBars } from 'react-icons/fa';

const TopNavBar = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const navLinkClasses = (isActive) => `${
    isActive 
      ? 'border-blue-500 text-gray-900 dark:text-white' 
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`;

  return (
    <nav className={`fixed top-0 left-0 right-0 h-16 z-50 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full">
          <div className="flex">
            {/* Mobile menu button */}
            {isAuthenticated && (
              <div className="flex items-center mr-2 sm:hidden">
                <button
                  onClick={toggleSidebar}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open sidebar</span>
                  <FaBars className="block h-6 w-6" />
                </button>
              </div>
            )}

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center h-full">
                <Link to="/" className="flex items-center h-full">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Kabbala</span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm hidden sm:inline">Gallery</span>
                </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 h-full items-center">
              <Link
                to="/"
                className={navLinkClasses(location.pathname === '/')}
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link
                  to="/galleries"
                  className={navLinkClasses(location.pathname === '/galleries')}
                >
                  Galleries
                </Link>
              )}
              <Link
                to="/subscriptions"
                className={navLinkClasses(location.pathname === '/subscriptions')}
              >
                Subscriptions
              </Link>
            </div>
          </div>

          {/* Right side menu */}
          <div className="flex items-center space-x-4 h-full">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <FaSun className="h-6 w-6" />
              ) : (
                <FaMoon className="h-6 w-6" />
              )}
            </button>
            
            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleMenu}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  </button>
                </div>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;