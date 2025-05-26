import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PageContainer = ({ children, sidebarOpen }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <main 
      className={`flex-1 h-[calc(100vh-4rem)] overflow-y-auto ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {children}
    </main>
  );
};

export default PageContainer;