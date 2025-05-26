import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PageContainer = ({ children, sidebarOpen }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <main 
      className={`flex-1 relative transition-all duration-300 ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-20'
      } ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      {children}
    </main>
  );
};

export default PageContainer;