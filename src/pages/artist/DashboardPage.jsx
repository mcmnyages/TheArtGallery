import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <PageContainer>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Artist Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Total Artworks</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Total Sales</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">$0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Active Exhibitions</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
          </div>

          {/* Quick Actions */}
          <div className="col-span-full mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/artist/upload')}
                className="p-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Upload New Artwork
              </button>
              <button
                onClick={() => navigate('/artist/gallery')}
                className="p-4 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                Manage Gallery
              </button>
              <button
                onClick={() => navigate('/artist/exhibitions')}
                className="p-4 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                Create Exhibition
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
