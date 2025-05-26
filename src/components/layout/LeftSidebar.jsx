import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  HiHome, 
  HiPhotograph, 
  HiCreditCard, 
  HiUser, 
  HiChartBar, 
  HiUpload,
  HiViewGrid,
  HiPlusCircle,
  HiChevronLeft,
  HiChevronRight,
  HiX
} from 'react-icons/hi';

const LeftSidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  // Get base navigation links
  const getBaseNavLinks = () => [
    {
      name: 'Home',
      path: '/',
      icon: <HiHome className="h-6 w-6" />
    },
    {
      name: 'All Galleries',
      path: '/galleries',
      icon: <HiPhotograph className="h-6 w-6" />
    },
    {
      name: 'Subscriptions',
      path: '/subscriptions',
      icon: <HiCreditCard className="h-6 w-6" />
    },
    {
      name: 'Account',
      path: '/account',
      icon: <HiUser className="h-6 w-6" />
    }
  ];

  // Get artist-specific navigation links
  const getArtistNavLinks = () => [
    {
      name: 'Artist Dashboard',
      path: '/artist/dashboard',
      icon: <HiChartBar className="h-6 w-6" />
    },
    {
      name: 'Upload Artwork',
      path: '/artist/upload',
      icon: <HiUpload className="h-6 w-6" />
    },
    {
      name: 'Manage Gallery',
      path: '/artist/gallery',
      icon: <HiViewGrid className="h-6 w-6" />
    },
    {
      name: 'Create Gallery',
      path: '/artist/gallery/create',
      icon: <HiPlusCircle className="h-6 w-6" />
    }
  ];

  // Combine base and role-specific navigation links
  const navLinks = [...getBaseNavLinks(), ...(user?.role === 'artist' ? getArtistNavLinks() : [])];

  // If mobile, render a sliding sidebar with overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
        
        {/* Mobile Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-30 w-64 shadow-lg transform transition-all duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex flex-col h-full">
            <div className={`flex items-center justify-between h-16 px-4 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } border-b`}>
              <span className={`text-xl font-semibold ${
                isDarkMode ? 'text-purple-400' : 'text-blue-600'
              }`}>Navigation</span>
              <button 
                onClick={() => setIsOpen(false)}
                className={`rounded-md p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col">
              <nav className="flex-1 mt-4 px-2 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? isDarkMode
                          ? 'bg-purple-900 text-purple-100'
                          : 'bg-blue-100 text-blue-700'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <span className={`mr-3 transition-colors ${
                      location.pathname === link.path 
                        ? isDarkMode
                          ? 'text-purple-400'
                          : 'text-blue-600'
                        : isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-500'
                    }`}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </nav>

              <div className={`p-4 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                <button
                  onClick={logout}
                  className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                      : 'text-red-600 hover:bg-gray-100 hover:text-red-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="ml-3">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transform transition-all duration-300 ease-in-out ${
      isOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-0'
    } ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md z-10`}>
      <div className="flex flex-col h-full">
        <div className={`flex items-center justify-between h-16 px-4 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } border-b`}>
          {isOpen && (
            <span className={`text-xl font-semibold ${
              isDarkMode ? 'text-purple-400' : 'text-blue-600'
            }`}>Navigation</span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`rounded-md p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
            } ${isOpen ? 'ml-auto' : 'mx-auto'}`}
          >
            {isOpen ? (
              <HiChevronLeft className="h-6 w-6" />
            ) : (
              <HiChevronRight className="h-6 w-6" />
            )}
          </button>
        </div>
        
        <div className="flex flex-col flex-1">
          <nav className={`flex-1 px-2 py-4 space-y-1 overflow-y-auto`}>
            {navLinks.map((link) => (
              <Link
              key={link.name}
              to={link.path}
              className={`flex items-center px-2 py-3 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? isDarkMode
                    ? 'bg-purple-900 text-purple-100'
                    : 'bg-blue-100 text-blue-700'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className={`transition-colors ${
                location.pathname === link.path 
                  ? isDarkMode
                    ? 'text-purple-400'
                    : 'text-blue-600'
                  : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`}>
                {link.icon}
              </span>
              {isOpen && <span className="ml-3">{link.name}</span>}
            </Link>
          ))}
          </nav>

          <div className={`p-4 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            <button
              onClick={logout}
              className={`w-full flex items-center px-2 py-3 rounded-md text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                  : 'text-red-600 hover:bg-gray-100 hover:text-red-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;