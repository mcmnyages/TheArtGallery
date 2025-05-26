import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useArtist } from '../../hooks/useArtistContext';
import { useTheme } from '../../contexts/ThemeContext';

const ManageGalleryPage = () => {
  const navigate = useNavigate();
  const { galleries, artworks, loading, error } = useArtist();
  const { isDarkMode } = useTheme();
  const [selectedGallery, setSelectedGallery] = useState('all');

  // Filter artworks by gallery
  const filteredArtworks = selectedGallery === 'all' 
    ? artworks 
    : artworks.filter(art => art.galleryId === selectedGallery);

  return (
    <PageContainer>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Manage Your Gallery
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Organize and manage your artwork collections
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/artist/gallery/create')}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Create Gallery
            </button>
            <button
              onClick={() => navigate('/artist/upload')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Upload Art
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Gallery Filter */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter by Gallery
              </label>
              <select
                value={selectedGallery}
                onChange={(e) => setSelectedGallery(e.target.value)}
                className={`w-64 p-2 border rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Artworks</option>
                {galleries.map(gallery => (
                  <option key={gallery.id} value={gallery.id}>
                    {gallery.name} ({gallery.artworkCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtworks.map(artwork => (
                <div 
                  key={artwork.id} 
                  className={`rounded-lg overflow-hidden shadow-md ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="relative h-48">
                    <img
                      src={artwork.thumbnailUrl || artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${
                      isDarkMode 
                        ? 'bg-gray-900 text-gray-300' 
                        : 'bg-white text-gray-700'
                    }`}>
                      {artwork.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {artwork.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      ${artwork.price}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Gallery: {galleries.find(g => g.id === artwork.galleryId)?.name || 'Uncategorized'}
                    </p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/artist/edit/${artwork.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this artwork?')) {
                            deleteArtwork(artwork.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtworks.length === 0 && (
              <div className={`text-center py-12 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <p className="text-lg">No artworks found in this gallery</p>
                <button
                  onClick={() => navigate('/artist/upload')}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Upload your first artwork
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default ManageGalleryPage;
