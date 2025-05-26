import React from 'react';

const PageContainer = ({ children, sidebarOpen }) => {
  return (
    <main 
      className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 min-h-full">
        {children}
      </div>
    </main>
  );
};

export default PageContainer;