import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  HiHome, 
  HiPhotograph, 
  HiCreditCard, 
  HiUser, 
  HiBriefcase, 
  HiChartBar, 
  HiUpload,
  HiViewGrid,
  HiPlusCircle,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiSparkles,
  HiPhotograph as HiPicture,
  HiColorSwatch
} from 'react-icons/hi';
import RequestArtistModal from '../artist/RequestArtistModal';

const LeftSidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);

  // Check if user has Artwork resource access
  const hasArtworkAccess = user?.userResources?.some(r => 
    r.name === 'Artwork' && r.status === 'success'
  );

  // Get artist-specific navigation links
  const getArtistNavLinks = () => [
    {
      name: 'Artist Dashboard',
      path: '/artist/dashboard',
      icon: <HiChartBar className="h-6 w-6" />
    },
    {
      name: 'Picture Management',
      path: '/artist/pictures',
      icon: <HiPicture className="h-6 w-6" />
    },
    {
      name: 'Manage Galleries',
      path: '/artist/gallery',
      icon: <HiViewGrid className="h-6 w-6" />
    },
    {
      name: 'My Wallet',
      path: '/artist/Wallet',
      icon: <HiBriefcase className="h-6 w-6" />
    }
  ];

  // Get base navigation links
  const getBaseNavLinks = () => [
    {
      name: 'All Galleries',
      path: '/galleries',
      icon: <HiPhotograph className="h-6 w-6" />
    },
    {
      name: 'Account',
      path: '/account',
      icon: <HiUser className="h-6 w-6" />
    }
  ];

  // Combine base and resource-specific navigation links
  const navLinks = hasArtworkAccess
    ? [...getArtistNavLinks(), ...getBaseNavLinks()]
    : getBaseNavLinks();

  return (
    <>
      {/* Modal rendered at the root level */}
      <RequestArtistModal 
        isOpen={isArtistModalOpen} 
        onClose={() => setIsArtistModalOpen(false)} 
      />
      
      {isMobile ? (
        <>
          {/* Overlay */}
          {isOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsOpen(false)}
            ></div>
          )}
          
          {/* Mobile Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}
              ${isDarkMode 
                ? 'bg-gray-800/90 backdrop-blur-lg border-r border-gray-700/50' 
                : 'bg-white/90 backdrop-blur-lg border-r border-gray-200/50'}`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className={`flex items-center justify-between h-16 px-6 ${
                isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
              } border-b`}>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <HiSparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Kabbala Arts
                  </span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50
                    ${isDarkMode
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                    }`}
                >
                  <HiX className="h-6 w-6" />
                </button>
              </div>
                <div className="flex-1 flex flex-col overflow-hidden">              {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-[1.02]
                        ${location.pathname === link.path
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-purple-500/10'
                            : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg shadow-purple-500/10'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                        }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className={`transition-colors duration-200 ${
                        location.pathname === link.path 
                          ? isDarkMode
                            ? 'text-blue-400 group-hover:text-blue-300'
                            : 'text-blue-600 group-hover:text-blue-700'
                          : isDarkMode
                            ? 'text-gray-400 group-hover:text-gray-300'
                            : 'text-gray-500 group-hover:text-gray-700'
                      }`}>
                        {link.icon}
                      </span>
                      <span className="ml-3">{link.name}</span>
                    </Link>
                  ))}
                </nav>

                {/* Show Become an Artist button only if user is not an artist */}
                {!hasArtworkAccess && (
                  <div className="px-4 mb-2">
                    <button
                      onClick={() => setIsArtistModalOpen(true)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium
                        transition-all duration-200 transform hover:scale-[1.02] ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 hover:from-purple-500/30 hover:to-pink-500/30'
                          : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 hover:from-purple-100 hover:to-pink-100'
                      }`}
                    >
                      <HiColorSwatch className="h-6 w-6" />
                      {isOpen && <span className="ml-3">Become an Artist</span>}
                    </button>
                  </div>
                )}

                {/* Logout Button */}
                <div className="p-4">
                  <button
                    onClick={logout}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200 transform hover:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
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
      ) : (
        // Desktop sidebar
        <aside className={`sticky top-16 flex flex-col h-[calc(100vh-64px)] transition-all duration-300
          ${isOpen ? 'w-72' : 'w-20'}
          ${isDarkMode 
            ? 'bg-gray-800/90 backdrop-blur-lg border-r border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-lg border-r border-gray-200/50'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center h-16 px-4 ${
            isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
          } border-b`}>
            {isOpen && (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <HiSparkles className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`rounded-lg p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50
                ${isDarkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                } ${isOpen ? 'ml-auto' : 'mx-auto'}`}
            >
              {isOpen ? <HiChevronLeft className="h-6 w-6" /> : <HiChevronRight className="h-6 w-6" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-[1.02]
                  ${location.pathname === link.path
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-purple-500/10'
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg shadow-purple-500/10'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                  }`}
              >
                <span className={`transition-colors duration-200 ${
                  location.pathname === link.path 
                    ? isDarkMode
                      ? 'text-blue-400 group-hover:text-blue-300'
                      : 'text-blue-600 group-hover:text-blue-700'
                    : isDarkMode
                      ? 'text-gray-400 group-hover:text-gray-300'
                      : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {link.icon}
                </span>
                {isOpen && <span className="ml-3">{link.name}</span>}
              </Link>
            ))}
          </nav>

          {/* Show Become an Artist button only if user is not an artist */}
          {!hasArtworkAccess && (
            <div className="px-3 mb-2">
              <button
                onClick={() => setIsArtistModalOpen(true)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 transform hover:scale-[1.02] ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 hover:from-purple-500/30 hover:to-pink-500/30'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 hover:from-purple-100 hover:to-pink-100'
                }`}
              >
                <HiColorSwatch className="h-6 w-6" />
                {isOpen && <span className="ml-3">Become an Artist</span>}
              </button>
            </div>
          )}      {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={logout}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 transform hover:scale-[1.02] ${
                isDarkMode
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </aside>
      )}
    </>
  );
};

export default LeftSidebar;