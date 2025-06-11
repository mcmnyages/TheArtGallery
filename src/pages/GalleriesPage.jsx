import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useGallery } from '../hooks/useGallery';
import { Lock, Search, Calendar, Eye, User, Star, Grid, List, Filter } from 'lucide-react';
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
  const [selectedSubscriptionOption, setSelectedSubscriptionOption] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name', 'price'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'public', 'private', 'owned'

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
    const isOwner = user?.id === gallery.userId;
    if (isOwner) return false;
    
    const hasActiveSubscription = gallery.subscriptions?.some(
      subscription => 
        subscription.userId === user?.id && 
        subscription.isActive && 
        new Date(subscription.endDate) > new Date()
    );

    return !hasActiveSubscription;
  };

  // Enhanced filtering and sorting
  const getFilteredAndSortedGalleries = () => {
    let filtered = galleries.filter(gallery => {
      const matchesSearch = gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           gallery.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (filterBy) {
        case 'public':
          return gallery.isPublic;
        case 'private':
          return !gallery.isPublic;
        case 'owned':
          return user?.id === gallery.userId;
        default:
          return true;
      }
    });

    // Sort galleries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const priceA = a.basePrice || (a.subscriptionOptions?.[0]?.price || 0);
          const priceB = b.basePrice || (b.subscriptionOptions?.[0]?.price || 0);
          return priceA - priceB;
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  const filteredGalleries = getFilteredAndSortedGalleries();

  // Handle gallery click
  const handleGalleryClick = async (e, gallery) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      addMessage({ 
        type: 'info', 
        text: 'Please log in to access this gallery.' 
      });
      navigate('/login');
      return;
    }

    const hasActiveSubscription = gallery.subscriptions?.some(
      subscription => 
        subscription.userId === user?.id && 
        subscription.isActive && 
        new Date(subscription.endDate) > new Date()
    );

    if (hasActiveSubscription) {
      navigate(`/gallery/${gallery._id}`);
      return;
    }    

    if (isGalleryLocked(gallery)) {
      const defaultOption = gallery.subscriptionOptions?.[0];
      if (!defaultOption) {
        addMessage({
          type: 'error',
          text: 'No subscription options available for this gallery.'
        });
        return;
      }
      setSelectedGallery(gallery);
      setShowPaymentModal(true);
      return;
    }
    
    navigate(`/gallery/${gallery._id}`);
  };  

  const handlePaymentSuccess = async (message) => {
    try {
      if (selectedGallery && user?.id) {
        const paymentStatus = await galleryService.verifyPayment(selectedGallery._id, null, user.id);
        if (paymentStatus.hasAccess) {
          setShowPaymentModal(false);
          setSelectedGallery(null);
          addMessage({
            type: 'success',
            text: message || 'Payment successful! You now have access to this gallery.'
          });
          await fetchGalleries();
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

  const GalleryCard = ({ gallery, isLocked }) => (
    <div 
      onClick={(e) => handleGalleryClick(e, gallery)}
      className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
      } backdrop-blur-sm transform hover:-translate-y-1`}
    >
      <div className="relative h-56 sm:h-64 overflow-hidden">
        {gallery.images && gallery.images[0] ? (
          <img 
            src={gallery.images[0].signedUrl}
            alt={gallery.name} 
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              isLocked ? 'opacity-50' : ''
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/images/art-2475718_1280.jpg';
            }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
            isDarkMode 
              ? 'from-gray-700 to-gray-800 text-gray-400' 
              : 'from-gray-100 to-gray-200 text-gray-500'
          }`}>
            <div className="text-center">
              <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <span className="text-sm">No preview available</span>
            </div>
          </div>
        )}
        
        {/* Image count badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {gallery.images?.length || 0}
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white/90 p-4 rounded-full shadow-lg">
              <Lock className="h-8 w-8 text-gray-700" />
            </div>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {artistProfile && artistProfile.id === gallery.userId && (
            <span className="bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium">
              Your Gallery
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium ${
            gallery.isPublic
              ? 'bg-blue-500/90 text-white'
              : 'bg-amber-500/90 text-white'
          }`}>
            {gallery.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className={`text-xl font-bold leading-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          } group-hover:text-blue-600 transition-colors`}>
            {gallery.name}
          </h3>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            gallery.isActive
              ? isDarkMode ? 'bg-emerald-800/50 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
              : isDarkMode ? 'bg-red-800/50 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              gallery.isActive ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
            {gallery.isActive ? 'Live' : 'Draft'}
          </div>
        </div>

        <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {gallery.description}
        </p>
        
        {/* Owner information */}
        {gallery.owner && (
          <div className={`flex items-center gap-2 mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{gallery.owner.name}</span>
          </div>
        )}

        {/* Subscription Options */}
        {gallery.subscriptionOptions && gallery.subscriptionOptions.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {gallery.subscriptionOptions.slice(0, 2).map(option => (
                <span
                  key={option._id}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    isDarkMode
                      ? 'bg-blue-800/30 text-blue-200 border border-blue-700/30'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}
                >
                  {option.label}: {option.price} {gallery.baseCurrency}
                </span>
              ))}
              {gallery.subscriptionOptions.length > 2 && (
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  +{gallery.subscriptionOptions.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className={`flex justify-between items-center pt-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            {gallery.basePrice ? (
              <span className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {gallery.basePrice} {gallery.baseCurrency}
              </span>
            ) : gallery.subscriptionOptions && gallery.subscriptionOptions.length > 0 ? (
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              }`}>
                Subscription based
              </span>
            ) : (
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Free access
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Calendar className="h-3 w-3" />
            {new Date(gallery.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );

  const GalleryListItem = ({ gallery, isLocked }) => (
    <div 
      onClick={(e) => handleGalleryClick(e, gallery)}
      className={`group p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
      } backdrop-blur-sm hover:shadow-lg`}
    >
      <div className="flex gap-6">
        <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
          {gallery.images && gallery.images[0] ? (
            <img 
              src={gallery.images[0].signedUrl}
              alt={gallery.name} 
              className={`w-full h-full object-cover ${isLocked ? 'opacity-50' : ''}`}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
              isDarkMode ? 'from-gray-700 to-gray-800' : 'from-gray-100 to-gray-200'
            }`}>
              <Eye className="h-6 w-6 opacity-50" />
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Lock className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } group-hover:text-blue-600 transition-colors truncate`}>
              {gallery.name}
            </h3>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              {artistProfile && artistProfile.id === gallery.userId && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                  Yours
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${
                gallery.isPublic
                  ? 'bg-blue-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {gallery.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          <p className={`text-sm mb-3 line-clamp-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {gallery.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {gallery.owner && (
                <div className={`flex items-center gap-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <User className="h-4 w-4" />
                  {gallery.owner.name}
                </div>
              )}
              <div className={`flex items-center gap-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Eye className="h-4 w-4" />
                {gallery.images?.length || 0} images
              </div>
              <div className={`flex items-center gap-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Calendar className="h-4 w-4" />
                {new Date(gallery.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="text-right">
              {gallery.basePrice ? (
                <span className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {gallery.basePrice} {gallery.baseCurrency}
                </span>
              ) : gallery.subscriptionOptions && gallery.subscriptionOptions.length > 0 ? (
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  From {gallery.subscriptionOptions[0].price} {gallery.baseCurrency}
                </span>
              ) : (
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Free
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className={`${
            isDarkMode ? 'bg-gray-800/30' : 'bg-white/70'
          } backdrop-blur-lg rounded-2xl shadow-xl border ${
            isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
          } p-6 md:p-8 mb-8`}>
            <div className="text-center mb-8">
              <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-white via-blue-200 to-purple-200' 
                  : 'from-gray-900 via-blue-600 to-purple-600'
              } bg-clip-text text-transparent`}>
                Discover Art Galleries
              </h1>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              } max-w-2xl mx-auto`}>
                Explore our curated collection of stunning art galleries from talented artists around the world
              </p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search galleries by name or description..."
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border ${
                    isDarkMode
                      ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg`}
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    <option value="all">All Galleries</option>
                    <option value="public">Public Only</option>
                    <option value="private">Private Only</option>
                    <option value="owned">My Galleries</option>
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">By Name</option>
                  <option value="price">By Price</option>
                </select>

                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white'
                        : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Loading galleries...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {galleryError && (
            <div className={`text-center p-8 rounded-xl ${
              isDarkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-lg ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                {galleryError}
              </p>
            </div>
          )}

          {/* Galleries Display */}
          {!loading && !galleryError && (
            <>
              {filteredGalleries.length === 0 ? (
                <div className={`text-center p-12 rounded-xl ${
                  isDarkMode ? 'bg-gray-800/30' : 'bg-white/70'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                }`}>
                  <div className="mb-6">
                    <Eye className={`h-16 w-16 mx-auto mb-4 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    No galleries found
                  </h3>
                  <p className={`text-lg ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <div className="mb-6">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Showing {filteredGalleries.length} of {galleries.length} galleries
                    </p>
                  </div>

                  {/* Gallery Grid/List */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                      {filteredGalleries.map(gallery => (
                        <GalleryCard 
                          key={gallery._id} 
                          gallery={gallery} 
                          isLocked={isGalleryLocked(gallery)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredGalleries.map(gallery => (
                        <GalleryListItem 
                          key={gallery._id} 
                          gallery={gallery} 
                          isLocked={isGalleryLocked(gallery)} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedGallery && (
        <GalleryPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedGallery(null);
            setSelectedSubscriptionOption(null);
          }}
          galleryId={selectedGallery._id}
          galleryName={selectedGallery.name}
          currency={selectedGallery.baseCurrency}
          subscriptionOptions={selectedGallery.subscriptionOptions}
          selectedOption={selectedSubscriptionOption || selectedGallery.subscriptionOptions[0]}
          onSubscriptionSelect={setSelectedSubscriptionOption}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default GalleriesPage;