import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  HiHome, 
  HiUserGroup, 
  HiPhotograph, 
  HiClipboardList,
  HiCog,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiSparkles
} from 'react-icons/hi';

const AdminSidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const menuItems = [
    { path: '/admin', icon: HiHome, label: 'Dashboard' },
    { path: '/admin/artists', icon: HiUserGroup, label: 'Artists' },
    { path: '/admin/allsubscribers', icon: HiUserGroup, label: 'All Subscribers'},
    { path: '/admin/artworks', icon: HiPhotograph, label: 'Artworks' },
    { path: '/admin/applications', icon: HiClipboardList, label: 'Applications' },
    { path: '/admin/settings', icon: HiCog, label: 'Settings' }
  ];

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`flex items-center h-16 px-4 ${
        isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
      } border-b`}>
        {isOpen && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <HiSparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
            {isMobile && (
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
            )}
          </div>
        )}
        {!isOpen && !isMobile && (
          <div className="mx-auto">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <HiSparkles className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`rounded-lg p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50
              ${isDarkMode
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              } ${isOpen ? 'ml-auto' : 'mx-auto mt-4'}`}
          >
            {isOpen ? <HiChevronLeft className="h-6 w-6" /> : <HiChevronRight className="h-6 w-6" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] ${
              location.pathname === item.path
                ? isDarkMode
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg shadow-purple-500/10'
                : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
            }`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <item.icon className={`w-5 h-5 ${
              location.pathname === item.path 
                ? isDarkMode
                  ? 'text-blue-400 group-hover:text-blue-300'
                  : 'text-blue-600 group-hover:text-blue-700'
                : isDarkMode
                  ? 'text-gray-400 group-hover:text-gray-300'
                  : 'text-gray-500 group-hover:text-gray-700'
            }`} />
            {isOpen && <span className="ml-3">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
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
            {sidebarContent}
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside className={`flex flex-col transition-all duration-300
      ${isOpen ? 'w-72' : 'w-20'}
      ${isDarkMode 
        ? 'bg-gray-800/90 backdrop-blur-lg border-r border-gray-700/50' 
        : 'bg-white/90 backdrop-blur-lg border-r border-gray-200/50'
      }`}
    >
      {sidebarContent}
    </aside>
  );
};

export default AdminSidebar;
