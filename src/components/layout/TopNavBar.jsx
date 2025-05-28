import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  HiSun, 
  HiMoon, 
  HiBars3, 
  HiCog6Tooth, 
  HiArrowRightOnRectangle,
  HiViewColumns,
  HiUser
} from 'react-icons/hi2';
import { FaSignOutAlt } from 'react-icons/fa';

const TopNavBar = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const navLinkClasses = (isActive) => `
    relative group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
    ${isActive 
      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
      : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
    }
    before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-0.5 
    before:bg-gradient-to-r before:from-blue-500 before:to-purple-500 before:transition-all before:duration-300
    ${isActive ? 'before:w-full before:-translate-x-1/2' : 'group-hover:before:w-full group-hover:before:-translate-x-1/2'}
  `;

  return (
    <nav className={`
      fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300
      ${scrolled 
        ? `${isDarkMode ? 'bg-gray-900/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'} backdrop-blur-lg shadow-lg` 
        : `${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} shadow-sm`
      } border-b
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isAuthenticated && (
              <div className="flex items-center mr-3 sm:hidden">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <span className="sr-only">Open sidebar</span>
                  <HiBars3 className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center h-full">
              <Link to="/" className="flex items-center h-full group">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <HiViewColumns className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Kabbala
                    </span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm hidden sm:inline font-medium">
                      Gallery
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-2 h-full items-center">
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
          <div className="flex items-center space-x-3 h-full">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 group"
              aria-label="Toggle theme"
            >
              <div className="relative">
                {isDarkMode ? (
                  <HiSun className="h-5 w-5 transform group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <HiMoon className="h-5 w-5 transform group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </div>
            </button>
            
            {isAuthenticated ? (
              <div className="ml-3 relative" ref={menuRef}>
                <div>
                  <button
                    onClick={toggleMenu}
                    className="flex items-center space-x-2 p-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group"
                    id="user-menu"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="relative">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">
                        {user?.firstName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                        Online
                      </p>
                    </div>
                  </button>
                </div>

                {/* Dropdown menu */}
                <div className={`
                  origin-top-right absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl py-2 
                  bg-white dark:bg-gray-800 ring-1 ring-black/10 dark:ring-white/10 
                  focus:outline-none backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50
                  transform transition-all duration-200 ease-out
                  ${isMenuOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }
                `} role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                  
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <Link
                      to="/account"
                      className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-all duration-200"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <HiCog6Tooth className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                      <span className="font-medium">Account Settings</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="group w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
                      role="menuitem"
                    >
                      <FaSignOutAlt className="mr-3 h-4 w-4 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                      <span className="font-medium">Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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