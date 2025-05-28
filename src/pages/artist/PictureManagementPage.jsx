import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import ArtistPictureManager from '../../components/artist/ArtistPictureManager';
import { useTheme } from '../../contexts/ThemeContext';
import { useArtist } from '../../hooks/useArtistContext';
import { HiUpload, HiViewGrid, HiPhotograph } from 'react-icons/hi';

const PictureManagementPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { artworks, galleries } = useArtist();

  // Calculate statistics
  const totalPictures = artworks?.length || 0;
  const totalGalleries = galleries?.length || 0;
  const recentUploads = artworks?.filter(
    art => new Date(art.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0;

  return (
    <PageContainer>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Picture Management
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              View, organize, and manage your pictures in one place
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={() => navigate('/artist/upload')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiUpload className="w-5 h-5 mr-2" />
              Upload New
            </button>
            <button
              onClick={() => navigate('/artist/gallery')}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <HiViewGrid className="w-5 h-5 mr-2" />
              Manage Galleries
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${
                isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
              }`}>
                <HiPhotograph className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Pictures
                </p>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {totalPictures}
                </h3>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${
                isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'
              }`}>
                <HiViewGrid className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Galleries
                </p>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {totalGalleries}
                </h3>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${
                isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
              }`}>
                <HiUpload className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Recent Uploads
                </p>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {recentUploads}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <ArtistPictureManager />
      </div>
    </PageContainer>
  );
};

export default PictureManagementPage;
