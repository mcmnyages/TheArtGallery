import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useGallery } from '../hooks/useGallery';
import { Lock } from 'lucide-react';
import { useMessage } from '../hooks/useMessage';
import { useArtist } from '../hooks/useArtistContext'; // Add this import

const GalleriesPage = () => {
  const { isAuthenticated, user } = useAuth();  // Add user here
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { galleries, loading, error: galleryError, fetchGalleries } = useGallery();
  const { addMessage } = useMessage();
  const { artistProfile } = useArtist(); // Add this line
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    console.log('Fetching galleries in GalleriesPage');
    fetchGalleries();
  }, [isAuthenticated, navigate, fetchGalleries]);

  // Filter galleries based on search term
  const filteredGalleries = galleries.filter(gallery => {
    const matchesSearch = gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         gallery.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle gallery click to check for artist access or subscription
  const handleGalleryClick = (e, gallery) => {
    e.preventDefault();
    navigate(`/gallery/${gallery._id}`);
  };
  
  return (
    <div className="min-h-full">
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 md:p-6`}>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Explore Galleries
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover our curated collection of art galleries
            </p>

            {/* Search */}
            <div className="mt-6">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search galleries..."
                  className={`w-full px-4 py-2 rounded-md border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            )}

            {/* Error state */}
            {galleryError && (
              <div className="text-center p-4">
                <p className="text-red-500">{galleryError}</p>
              </div>
            )}

            {/* Gallery grid */}
            {!loading && !galleryError && (
              <>
                {filteredGalleries.length === 0 ? (
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-12 text-center rounded-lg shadow-md`}>
                    <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      No galleries found
                    </h3>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Try adjusting your search criteria.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
                    {filteredGalleries.map(gallery => (
                      <div 
                        key={gallery._id}
                        onClick={(e) => handleGalleryClick(e, gallery)}
                        className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}
                      >
                        <div className="h-48 bg-gray-200 relative">                          {gallery.images && gallery.images[0] && (
                            <img 
                              src={gallery.images[0].imageUrl}
                              alt={gallery.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-tl-md">
                            {gallery.images?.length || 0} images
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">                            <h3 className={`text-xl font-bold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {gallery.name}
                            </h3>
                            {artistProfile && artistProfile.id === gallery.artistId && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                isDarkMode
                                  ? 'bg-green-700 text-green-100'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                Your Gallery
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {gallery.description}
                          </p>
                          <div className="mt-4 flex justify-between items-center">
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {new Date(gallery.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleriesPage;