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

        

        <ArtistPictureManager />
      </div>
    </PageContainer>
  );
};

export default PictureManagementPage;
