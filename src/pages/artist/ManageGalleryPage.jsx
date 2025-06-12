import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useMessage } from '../../hooks/useMessage';
import { galleryService } from '../../services/galleryService';
import PageContainer from '../../components/layout/PageContainer';
import EditGalleryModal from '../../components/artist/EditGalleryModal';
import CreateGalleryModal from '../../components/artist/CreateGalleryModal';
import { 
  Plus, 
  Camera, 
  Trash2, 
  Eye, 
  Edit,
  Folder,
  Image,
  Calendar,
  Grid3X3,
  List,
  Search,
  Filter,
  SortDesc,
  ArrowUpDown,
  Star,
  Heart,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Settings,
  Download,
  Share2,
  MoreHorizontal,
  ChevronDown,
  X,
  Check
} from 'lucide-react';

const ManageGalleryPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { addMessage } = useMessage();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editGalleryId, setEditGalleryId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedGalleries, setSelectedGalleries] = useState(new Set());
  const [bulkActions, setBulkActions] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(true);

  useEffect(() => {
    const fetchArtistGalleries = async () => {
      try {
        setLoading(true);
        console.log('Fetching artist galleries...');
        const galleries = await galleryService.fetchGalleryGroups();
        console.log('Fetched artist galleries:', galleries);
        setGalleries(galleries || []);
      } catch (err) {
        console.error('Error fetching artist galleries:', err);
        setError(err.message);
        addMessage({ type: 'error', text: 'Failed to fetch galleries: ' + err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchArtistGalleries();
  }, [user, addMessage]);

  // Enhanced filtering and sorting with memoization
  const filteredAndSortedGalleries = useMemo(() => {
    let filtered = selectedGallery === 'all'
      ? galleries
      : galleries.filter(gallery => gallery._id === selectedGallery);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(gallery =>
        gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'imageCount':
          return (b.images?.length || 0) - (a.images?.length || 0);
        case 'popularity':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });
  }, [galleries, selectedGallery, searchTerm, sortBy]);

  const handleDeleteGallery = async (galleryId, galleryName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${galleryName}"? This action cannot be undone and will remove all images in this gallery.`
    );
    
    if (!confirmed) return;
    
    try {
      setDeleteLoading(galleryId);
      await galleryService.deleteGalleryGroup(galleryId);
      setGalleries(galleries.filter(g => g._id !== galleryId));
      
      addMessage({ 
        type: 'success', 
        text: `Gallery "${galleryName}" was successfully deleted`,
        action: { label: 'Undo', onClick: () => console.log('Undo delete') }
      });
      setError(null);
    } catch (err) {
      setError(`Failed to delete gallery: ${err.message}`);
      addMessage({ type: 'error', text: `Failed to delete gallery: ${err.message}` });
    } finally {
      setDeleteLoading(null);
    }
  };

  const getTotalImages = () => {
    return galleries.reduce((total, gallery) => total + (gallery.images?.length || 0), 0);
  };

  const getGalleryStats = () => {
    const totalViews = galleries.reduce((total, gallery) => total + (gallery.views || 0), 0);
    const avgImagesPerGallery = galleries.length > 0 ? Math.round(getTotalImages() / galleries.length) : 0;
    const mostPopular = galleries.reduce((max, gallery) => 
      (gallery.views || 0) > (max.views || 0) ? gallery : max, galleries[0]);
    
    return { totalViews, avgImagesPerGallery, mostPopular };
  };

  // Enhanced Empty State with Call-to-Action
  const EmptyState = () => (
    <div className="text-center py-20 px-6">
      <div className="relative mb-8">
        <div className={`inline-flex p-6 rounded-full ${
          isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' : 'bg-gradient-to-br from-purple-100 to-blue-100'
        } backdrop-blur-sm`}>
          <Sparkles className={`h-12 w-12 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
        </div>
        <div className="absolute -top-2 -right-2 animate-bounce">
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
        </div>
      </div>
      
      <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Ready to showcase your art?
      </h3>
      <p className={`text-lg mb-8 max-w-md mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Create your first gallery to organize and display your artwork collections beautifully.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
        >
          <div className="relative">
            <Plus className="h-6 w-6 transition-transform group-hover:rotate-90 duration-300" />
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
          </div>
          Create Your First Gallery
        </button>
        
        <div className="flex items-center justify-center gap-6 text-sm opacity-75">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span>Upload Images</span>
          </div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            <span>Organize Collections</span>
          </div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span>Share & Showcase</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Loading State
  const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center py-20">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image className="h-6 w-6 text-purple-600 animate-pulse" />
        </div>
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Loading your galleries
      </h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Gathering your creative collections...
      </p>
    </div>
  );

  // Enhanced Stat Card with animations
  const StatCard = ({ icon: Icon, label, value, color = "purple", trend, subtitle }) => (
    <div className={`group p-6 rounded-2xl ${
      isDarkMode ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-white/70 hover:bg-white/90'
    } backdrop-blur-sm border ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } hover:border-${color}-300 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 group-hover:from-${color}-500/30 group-hover:to-${color}-600/30 transition-all duration-300`}>
            <Icon className={`h-6 w-6 text-${color}-600 group-hover:scale-110 transition-transform duration-300`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} group-hover:text-${color}-600 transition-colors duration-300`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
          }`}>
            <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced Gallery Card
  const GalleryCard = ({ gallery }) => {
    const isSelected = selectedGalleries.has(gallery._id);
      return (
      <div className={`group relative rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] h-full flex flex-col ${
        isDarkMode 
          ? 'bg-gray-800/50 hover:bg-gray-800/70' 
          : 'bg-white/70 hover:bg-white/90'
      } backdrop-blur-sm border ${
        isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
      } shadow-sm hover:shadow-2xl ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
        
        {/* Selection Checkbox */}
        {bulkActions && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newSelected = new Set(selectedGalleries);
                if (isSelected) {
                  newSelected.delete(gallery._id);
                } else {
                  newSelected.add(gallery._id);
                }
                setSelectedGalleries(newSelected);
              }}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                isSelected 
                  ? 'bg-purple-600 border-purple-600 text-white' 
                  : 'bg-white/80 border-gray-300 hover:border-purple-400'
              }`}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </button>
          </div>
        )}

        {/* Gallery Header */}
        <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${
                isDarkMode 
                  ? 'from-purple-500/20 to-blue-500/20' 
                  : 'from-purple-100 to-blue-100'
              } group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300`}>
                <Folder className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } group-hover:text-purple-600 transition-colors duration-300`}>
                  {gallery.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className={`flex items-center gap-1.5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Image className="h-4 w-4" />
                    {gallery.images?.length || 0} images
                  </span>
                  <span className={`flex items-center gap-1.5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Eye className="h-4 w-4" />
                    {gallery.views || 0} views
                  </span>
                  {gallery.createdAt && (
                    <span className={`flex items-center gap-1.5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      {new Date(gallery.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {gallery.description && (
                  <p className={`text-sm mt-2 line-clamp-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {gallery.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/gallery/${gallery._id}`);
                }}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'hover:bg-purple-500/20 text-gray-400 hover:text-purple-400' 
                    : 'hover:bg-purple-50 text-gray-600 hover:text-purple-600'
                } hover:scale-110`}
                title="View Gallery"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditGalleryId(gallery._id);
                  setEditModalOpen(true);
                }}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'hover:bg-blue-500/20 text-gray-400 hover:text-blue-400' 
                    : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                } hover:scale-110`}
                title="Edit Gallery"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteGallery(gallery._id, gallery.name);
                }}
                disabled={deleteLoading === gallery._id}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'hover:bg-red-500/20 text-red-400 hover:text-red-500' 
                    : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                } disabled:opacity-50 hover:scale-110`}
                title="Delete Gallery"
              >
                {deleteLoading === gallery._id ? (
                  <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
          {/* Enhanced Gallery Preview */}
        <div className="p-5">
          {gallery.images && gallery.images.length > 0 ? (
            <div className="relative aspect-[16/10] flex items-center justify-center perspective-[1000px] overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="relative w-full h-full">
                {gallery.images.slice(0, 5).map((image, index) => (
                  <div 
                    key={image._id}
                    className={`absolute w-40 aspect-[3/4] transition-all duration-700 ease-out hover:z-50 hover:scale-110 hover:rotate-0 cursor-pointer
                      ${index === 0 ? 'z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-105' :
                        index === 1 ? 'z-40 top-1/2 left-[42%] -translate-y-1/2 -translate-x-1/2 -rotate-6 scale-95 opacity-90' :
                        index === 2 ? 'z-30 top-1/2 left-[58%] -translate-y-1/2 -translate-x-1/2 rotate-6 scale-90 opacity-80' :
                        index === 3 ? 'z-20 top-1/2 left-[30%] -translate-y-1/2 -translate-x-1/2 -rotate-12 scale-85 opacity-70' :
                        'z-10 top-1/2 left-[70%] -translate-y-1/2 -translate-x-1/2 rotate-12 scale-85 opacity-70'
                      }`}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                      <img
                        src={image.signedUrl || image.imageUrl}
                        alt={image.title || image.name || 'Gallery Image'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {gallery.images.length > 5 && (                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/gallery/${gallery._id}`);
                  }}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-white text-sm font-medium hover:bg-black/80 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  {gallery.images.length - 5} more images
                </button>
              )}
            </div>
          ) : (
            <div className={`text-center py-8 border-2 border-dashed rounded-xl ${
              isDarkMode ? 'border-gray-600 text-gray-400 bg-gray-800/30' : 'border-gray-300 text-gray-500 bg-gray-50'
            } hover:border-purple-400 transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-50/50 group-hover:to-blue-50/50`}>
              <div className="relative inline-block mb-3">
                <Image className="h-10 w-10 opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm mb-3 font-medium">No images yet</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/artist/upload');
                }}
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Upload Images
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const { totalViews, avgImagesPerGallery, mostPopular } = getGalleryStats();

  return (
    <PageContainer>
      <div className="min-h-screen p-6 space-y-8">
        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                Gallery Studio
              </h1>
              <p className={`mt-4 text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl leading-relaxed`}>
                Create, organize, and showcase your artistic collections with style and elegance
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {galleries.length} galleries active
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {totalViews} total views
                  </span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setBulkActions(!bulkActions)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                  bulkActions
                    ? 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
                    : isDarkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <Settings className="h-5 w-5" />
                {bulkActions ? 'Exit Selection' : 'Bulk Actions'}
              </button>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Gallery
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {!loading && galleries.length > 0 && showQuickStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={Folder} 
              label="Total Galleries" 
              value={galleries.length}
              color="purple"
              subtitle="Active collections"
            />
            <StatCard 
              icon={Image} 
              label="Total Artworks" 
              value={getTotalImages()}
              color="blue"
              subtitle={`${avgImagesPerGallery} avg per gallery`}
            />
            <StatCard 
              icon={Eye} 
              label="Total Views" 
              value={totalViews.toLocaleString()}
              color="green"
              subtitle="Across all galleries"
            />
            <StatCard 
              icon={Star} 
              label="Most Popular" 
              value={mostPopular?.name?.substring(0, 12) + '...' || 'None'}
              color="yellow"
              subtitle={`${mostPopular?.views || 0} views`}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 p-6 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top duration-500">
            <div className="bg-red-200 p-2 rounded-full">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">Something went wrong</h4>
              <p className="mt-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="space-y-6">
          {loading ? (
            <LoadingSpinner />
          ) : galleries.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Enhanced Filter Bar */}
              <div className={`p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/70'
              } backdrop-blur-sm border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } space-y-4`}>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search galleries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-900 focus:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-xl transition-all ${
                        viewMode === 'grid'
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                          : isDarkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Grid3X3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 rounded-xl transition-all ${
                        viewMode === 'list'
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                          : isDarkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-700'
                      } hover:border-purple-400`}
                    >
                      <SortDesc className="h-4 w-4" />
                      Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilters && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-10">
                        {['newest', 'oldest', 'name', 'imageCount', 'popularity'].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setShowFilters(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                              sortBy === option
                                ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                                : isDarkMode
                                  ? 'text-gray-300 hover:bg-gray-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>              {/* Gallery Grid/List */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 auto-rows-fr' 
                  : 'grid-cols-1'
              } max-w-[2000px] mx-auto`}>
                {filteredAndSortedGalleries.map((gallery) => (
                  <GalleryCard key={gallery._id} gallery={gallery} />
                ))}
              </div>

              {/* No Results Message */}
              {filteredAndSortedGalleries.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No galleries found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">                    {searchTerm 
                      ? `No galleries match "${searchTerm}"`
                      : 'Try creating a new gallery or adjusting your filters'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {editModalOpen && (
        <EditGalleryModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditGalleryId(null);
          }}
          galleryId={editGalleryId}
          onSuccess={() => {
            setEditModalOpen(false);
            setEditGalleryId(null);
            // Refresh galleries
            window.location.reload();
          }}
        />
      )}

      {createModalOpen && (
        <CreateGalleryModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            // Refresh galleries
            window.location.reload();
          }}
        />
      )}
    </PageContainer>
  );
};

export default ManageGalleryPage;