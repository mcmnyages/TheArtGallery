import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useGallery } from '../hooks/useGallery';
import { Lock } from 'lucide-react';
import { useMessage } from '../hooks/useMessage';
import { useArtist } from '../hooks/useArtistContext';
import GalleryPaymentModal from '../components/subscription/GalleryPaymentModal';
import { galleryService } from '../services/galleryService';

const GalleriesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { galleries, loading, error: galleryError, fetchGalleries } = useGallery();
  const { addMessage } = useMessage();
  const { artistProfile } = useArtist();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    console.log('Fetching galleries in GalleriesPage');
    fetchGalleries();
  }, [isAuthenticated, navigate, fetchGalleries]);

  // Function to determine if a gallery should be locked
  const isGalleryLocked = (gallery) => {
    // Gallery is unlocked if the current user is the owner of the gallery
    const isOwner = user?.id === gallery.userId;
    
    // By default, lock all galleries except the ones owned by the current user
    return !isOwner;
  };

  // Filter galleries based on search term
  const filteredGalleries = galleries.filter(gallery => {
    const matchesSearch = gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         gallery.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle gallery click
  const handleGalleryClick = (e, gallery) => {
    e.preventDefault();
    
    if (isGalleryLocked(gallery)) {
      if (!isAuthenticated) {
        addMessage({ 
          type: 'info', 
          text: 'Please log in to access this gallery.' 
        });
        navigate('/login');
        return;
      }
      setSelectedGallery(gallery);
      setShowPaymentModal(true);
      return;
    }
    
    navigate(`/gallery/${gallery._id}`);
  };

  const handlePaymentSuccess = async () => {
    try {
      if (selectedGallery) {
        const status = await galleryService.checkGalleryAccess(selectedGallery._id);
        if (status.hasAccess) {
          setShowPaymentModal(false);
          navigate(`/gallery/${selectedGallery._id}`);
        }
      }
    } catch (error) {
      console.error('Error verifying access:', error);
      addMessage({
        type: 'error',
        text: 'There was a problem verifying your access. Please try again.'
      });
    }
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
                    {filteredGalleries.map(gallery => {
                      const isLocked = isGalleryLocked(gallery);
                      return (
                        <div 
                          key={gallery._id}
                          onClick={(e) => handleGalleryClick(e, gallery)}
                          className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                          }`}
                        >
                          <div className="h-48 bg-gray-200 relative">                            {gallery.images && gallery.images[0] && gallery.images[0].signedUrl && (
                              <img 
                                src={gallery.images[0].signedUrl}
                                alt={gallery.name} 
                                className={`w-full h-full object-cover ${
                                  isLocked ? 'opacity-50' : ''
                                }`}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/images/art-2475718_1280.jpg'; // fallback image
                                }}
                              />
                            )}
                            <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-tl-md">
                              {gallery.images?.length || 0} images
                            </div>
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`p-3 rounded-full ${
                                  isDarkMode 
                                    ? 'bg-gray-800/80 text-white' 
                                    : 'bg-white/80 text-gray-900'
                                }`}>
                                  <Lock className="h-6 w-6" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`text-xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {gallery.name}
                              </h3>
                              <div className="flex flex-col items-end gap-1">
                                {artistProfile && artistProfile.id === gallery.userId && (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    isDarkMode
                                      ? 'bg-green-700 text-green-100'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    Your Gallery
                                  </span>
                                )}
                                {gallery.isPublic ? (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    isDarkMode
                                      ? 'bg-blue-700 text-blue-100'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    Public
                                  </span>
                                ) : (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    isDarkMode
                                      ? 'bg-yellow-700 text-yellow-100'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    Private
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            } mb-3`}>
                              {gallery.description}
                            </p>
                            <div className="flex justify-between items-center border-t pt-3 mt-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {gallery.basePrice} {gallery.baseCurrency}
                                </span>
                                {gallery.isActive ? (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    isDarkMode
                                      ? 'bg-green-700 text-green-100'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    Active
                                  </span>
                                ) : (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    isDarkMode
                                      ? 'bg-red-700 text-red-100'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {new Date(gallery.createdAt).toLocaleDateString()}
                              </span>
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

      {/* Add payment modal at the end of the JSX */}
      {showPaymentModal && selectedGallery && (
        <GalleryPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedGallery(null);
          }}
          galleryId={selectedGallery._id}
          galleryName={selectedGallery.name}
          price={selectedGallery.basePrice}
          currency={selectedGallery.baseCurrency}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default GalleriesPage;