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
      className={`group rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer w-full ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
      } backdrop-blur-sm transform hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
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
              <Eye className="h-16 w-16 mx-auto mb-3 opacity-50" />
              <span className="text-sm">No preview available</span>
            </div>
          </div>
        )}
        
        {/* Image count badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {gallery.images?.length || 0}
        </div>

        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
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

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-base font-bold leading-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } group-hover:text-blue-600 transition-colors line-clamp-1`}>
              {gallery.name}
            </h3>
            <div className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${
              gallery.isActive
                ? isDarkMode ? 'bg-emerald-800/50 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
                : isDarkMode ? 'bg-red-800/50 text-red-200' : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                gallery.isActive ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              {gallery.isActive ? 'Live' : 'Draft'}
            </div>
          </div>

          <p className={`text-sm leading-relaxed line-clamp-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {gallery.description}
          </p>
        </div>
        
        {/* Owner information */}
        {gallery.owner && (
          <div className={`flex items-center gap-1.5 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Artwork By:
            <User className="h-4 w-4" />
             <span className="text-xs font-medium truncate">{gallery.owner.name}</span>
          </div>
        )}

        <div className={`flex justify-between items-center pt-3 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div>
            {gallery.basePrice ? (
              <span className={`text-sm font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {gallery.basePrice} {gallery.baseCurrency}
              </span>
            ) : gallery.subscriptionOptions && gallery.subscriptionOptions.length > 0 ? (
              <button 
                className={`text-xs font-medium px-2 py-1 rounded-full transition-all ${
                  isDarkMode 
                    ? 'bg-blue-800/30 text-blue-200 border border-blue-700/30 hover:bg-blue-800/50' 
                    : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                View Pricing
              </button>
            ) : (
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Free access
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Calendar className="h-3.5 w-3.5" />
            {new Date(gallery.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );

  const GalleryListItem = ({ gallery, isLocked }) => (
    <div 
      onClick={(e) => handleGalleryClick(e, gallery)}
      className={`group p-6 md:p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
      } backdrop-blur-sm hover:shadow-xl transform hover:-translate-y-1`}
    >
      <div className="flex gap-6 md:gap-8">
        <div className="relative w-36 sm:w-40 md:w-48 h-28 sm:h-32 md:h-36 rounded-xl overflow-hidden flex-shrink-0">
          {gallery.images && gallery.images[0] ? (
            <img 
              src={gallery.images[0].signedUrl}
              alt={gallery.name} 
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                isLocked ? 'opacity-50' : ''
              }`}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
              isDarkMode ? 'from-gray-700 to-gray-800' : 'from-gray-100 to-gray-200'
            }`}>
              <Eye className="h-8 w-8 opacity-50" />
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <Lock className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className={`text-xl md:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } group-hover:text-blue-600 transition-colors truncate`}>
              {gallery.name}
            </h3>
            <div className="flex gap-2 md:gap-3 flex-shrink-0">
              {artistProfile && artistProfile.id === gallery.userId && (
                <span className="bg-emerald-500 text-white text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                  Yours
                </span>
              )}
              <span className={`text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full ${
                gallery.isPublic
                  ? 'bg-blue-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {gallery.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          <p className={`text-sm md:text-base lg:text-lg leading-relaxed mb-4 line-clamp-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {gallery.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6 text-sm md:text-base">
              {gallery.owner && (
                <div className={`flex items-center gap-1.5 md:gap-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  {gallery.owner.name}
                </div>
              )}
              <div className={`flex items-center gap-1.5 md:gap-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Eye className="h-4 w-4 md:h-5 md:w-5" />
                {gallery.images?.length || 0} images
              </div>
              <div className={`hidden sm:flex items-center gap-1.5 md:gap-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                {new Date(gallery.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div>
              {gallery.basePrice ? (
                <span className={`text-lg md:text-xl lg:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {gallery.basePrice} {gallery.baseCurrency}
                </span>
              ) : gallery.subscriptionOptions && gallery.subscriptionOptions.length > 0 ? (
                <button 
                  className={`text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all ${
                    isDarkMode 
                      ? 'bg-blue-800/30 text-blue-200 border border-blue-700/30 hover:bg-blue-800/50' 
                      : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  View Pricing
                </button>
              ) : (
                <span className={`text-sm md:text-base lg:text-lg ${
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
    <div className={`min-h-screen py-6 md:py-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 max-w-[1440px] mx-auto">
        <div className="max-w-[1280px] mx-auto space-y-6 md:space-y-8">
          {/* Header Section */}
          <div className={`${
            isDarkMode ? 'bg-gray-800/30' : 'bg-white/70'
          } backdrop-blur-lg rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
          } p-4 sm:p-6`}>
            <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-white via-blue-200 to-purple-200' 
                  : 'from-gray-900 via-blue-600 to-purple-600'
              } bg-clip-text text-transparent leading-tight`}>
                Discover Art Galleries
              </h1>
              <p className={`text-xs sm:text-sm lg:text-base max-w-xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Explore our curated collection of stunning art galleries from talented artists around the world
              </p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative max-w-lg mx-auto">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search galleries by name or description..."
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all text-sm`}
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <Filter className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className={`px-2 py-1.5 text-sm rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
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
                  className={`px-2 py-1.5 text-sm rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">By Name</option>
                  <option value="price">By Price</option>
                </select>

                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white shadow'
                        : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white shadow'
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
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                <div className={`text-center p-16 rounded-3xl ${
                  isDarkMode ? 'bg-gray-800/30' : 'bg-white/70'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                }`}>
                  <div className="mb-8">
                    <Eye className={`h-20 w-20 mx-auto mb-6 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className={`text-3xl font-bold mb-4 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    No galleries found
                  </h3>
                  <p className={`text-xl ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <div className="mb-8">
                    <p className={`text-lg ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Showing {filteredGalleries.length} of {galleries.length} galleries
                    </p>
                  </div>

                  {/* Gallery Grid/List */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                      {filteredGalleries.map(gallery => (
                        <GalleryCard 
                          key={gallery._id} 
                          gallery={gallery} 
                          isLocked={isGalleryLocked(gallery)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
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
          ownerId={selectedGallery.userId}
          onSubscriptionSelect={setSelectedSubscriptionOption}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default GalleriesPage;