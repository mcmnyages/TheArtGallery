import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useGallery } from '../hooks/useGallery';
import { useSubscription } from '../hooks/useSubscription';

const GalleriesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { galleries, loading, error: galleryError, fetchGalleries } = useGallery();
  const { hasGalleryAccess } = useSubscription();

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

  // Handle gallery click to navigate to detail page with gallery data
  const handleGalleryClick = (galleryId, isLocked) => {
    if (isLocked) {
      // If gallery is locked, navigate to subscriptions page
      navigate('/subscriptions');
      return;
    }
    const gallery = galleries.find(g => g._id === galleryId);
    console.log('Navigating to gallery:', gallery);
    navigate(`/gallery/${galleryId}`, { state: { gallery } });
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
                ) : (                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">                    {filteredGalleries.map(gallery => {
                      // Check if the user created this gallery or has subscription access
                      const isCreator = gallery.creatorId === user?.id;
                      const isLocked = !isCreator && !hasGalleryAccess(gallery._id);
                      
                      return (
                        <div 
                          key={gallery._id}
                          onClick={() => handleGalleryClick(gallery._id, isLocked)}
                          className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer relative ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                          }`}
                        >
                          <div className="h-48 bg-gray-200 relative overflow-hidden">
                            {/* Blur overlay for locked galleries */}
                            {isLocked && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="bg-black/70 px-3 py-2 rounded-lg flex items-center">
                                  <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-white text-sm font-medium">Subscribers Only</span>
                                </div>
                              </div>
                            )}
                            
                            {gallery.images && gallery.images[0] && (
                              <img 
                                src={gallery.images[0].imageUrl}
                                alt={gallery.name} 
                                className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                                  isLocked ? 'filter blur-[1px]' : ''
                                }`}
                              />
                            )}
                            <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-tl-md">
                              {gallery.images?.length || 0} images
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className={`text-xl font-bold mb-2 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {gallery.name}
                            </h3>
                            <p className={`text-sm mb-3 line-clamp-2 ${
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
                              
                              {isLocked && (
                                <div className="flex items-center">
                                  <span className={`text-sm font-medium mr-2 ${
                                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                  }`}>
                                    ${gallery.subscriptionPrice || '9.99'}/mo
                                  </span>
                                  <Link
                                    to="/subscriptions"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/subscriptions');
                                    }}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                      isDarkMode 
                                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                    }`}
                                  >
                                    Subscribe
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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