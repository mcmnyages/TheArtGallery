import React, { useState, useEffect } from 'react';
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
  Filter
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editGalleryId, setEditGalleryId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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

  // Enhanced filtering and sorting
  const getFilteredAndSortedGalleries = () => {
    let filtered = selectedGallery === 'all'
      ? galleries
      : galleries.filter(gallery => gallery._id === selectedGallery);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(gallery =>
        gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
        default:
          return 0;
      }
    });
  };

  const filteredGalleryContent = getFilteredAndSortedGalleries();

  const handleDeleteGallery = async (galleryId, galleryName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${galleryName}"? This action cannot be undone and will remove all images in this gallery.`
    );
    
    if (!confirmed) return;
    
    try {
      setDeleteLoading(galleryId);
      await galleryService.deleteGalleryGroup(galleryId);
      setGalleries(galleries.filter(g => g._id !== galleryId));
      
      // Show success message
      addMessage({ type: 'success', text: `Gallery "${galleryName}" was successfully deleted` });
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

  const EmptyState = () => (
    <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      <Folder className="mx-auto h-16 w-16 mb-4 opacity-50" />
      <h3 className="text-xl font-medium mb-2">No galleries yet</h3>
      <p className="mb-6 max-w-md mx-auto">
        Create your first gallery to start organizing your artwork collections.
      </p>
      <button
        onClick={() => setCreateModalOpen(true)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
      >
        <Plus className="h-5 w-5" />
        Create Your First Gallery
      </button>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <span className={`ml-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Loading your galleries...
      </span>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = "purple" }) => (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-100 ${isDarkMode ? 'bg-opacity-20' : ''}`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
    </div>
  );

  // Handle edit button click
  const handleEditClick = (e, galleryId) => {
    e.preventDefault();
    e.stopPropagation();
    setEditGalleryId(galleryId);
    setEditModalOpen(true);
  };

  // Handle successful edit
  const handleEditSuccess = async () => {
    try {
      const updatedGalleries = await galleryService.fetchGalleryGroups();
      setGalleries(updatedGalleries || []);
      addMessage({ type: 'success', text: 'Gallery updated successfully' });
    } catch (err) {
      console.error('Error refreshing galleries:', err);
      addMessage({ type: 'error', text: 'Failed to refresh galleries: ' + err.message });
    }
  };

  // Handle create gallery success
  const handleCreateSuccess = async () => {
    setCreateModalOpen(false);
    try {
      const updatedGalleries = await galleryService.fetchGalleryGroups();
      setGalleries(updatedGalleries || []);
      addMessage({ type: 'success', text: 'Gallery created successfully' });
    } catch (err) {
      console.error('Error refreshing galleries:', err);
      addMessage({ type: 'error', text: 'Failed to refresh galleries: ' + err.message });
    }
  };

  return (
    <PageContainer>
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
              Gallery Manager
            </h1>
            <p className={`mt-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Organize, manage, and showcase your artwork collections
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Create Gallery
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && galleries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              icon={Folder} 
              label="Total Galleries" 
              value={galleries.length}
              color="purple"
            />
            <StatCard 
              icon={Image} 
              label="Total Artworks" 
              value={getTotalImages()}
              color="blue"
            />
            <StatCard 
              icon={Calendar} 
              label="Last Updated" 
              value={galleries.length > 0 ? "Today" : "Never"}
              color="green"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <div className="bg-red-100 p-1 rounded-full">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Error</h4>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div>
          {loading ? (
            <LoadingSpinner />
          ) : galleries.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Search and Filter Controls */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50/50'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Search galleries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                      } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                    />
                  </div>

                  {/* Filter and View Controls */}
                  <div className="flex items-center gap-3">
                    {/* Gallery Filter */}
                    <select
                      value={selectedGallery}
                      onChange={(e) => setSelectedGallery(e.target.value)}
                      className={`px-4 py-3 rounded-lg border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                    >
                      <option value="all">All Galleries ({galleries.length})</option>
                      {galleries.map(gallery => (
                        <option key={gallery._id} value={gallery._id}>
                          {gallery.name} ({gallery.images?.length || 0})
                        </option>
                      ))}
                    </select>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-4 py-3 rounded-lg border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name A-Z</option>
                      <option value="imageCount">Most Images</option>
                    </select>

                    {/* View Mode Toggle */}
                    <div className={`flex rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} overflow-hidden`}>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-purple-600 text-white'
                            : isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Grid3X3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 transition-colors ${
                          viewMode === 'list'
                            ? 'bg-purple-600 text-white'
                            : isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <List className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {filteredGalleryContent.length} of {galleries.length} galleries
                {searchTerm && ` matching "${searchTerm}"`}
              </div>

              {/* Galleries Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGalleryContent.length === 0 ? (
                  <div className={`text-center py-8 col-span-full ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Search className="mx-auto h-8 w-8 mb-3 opacity-50" />
                    <h3 className="text-base font-medium mb-1">No galleries found</h3>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredGalleryContent.map(gallery => (
                    <div 
                      key={gallery._id}
                       onClick={(e) => handleEditClick(e, gallery._id)}
                      className={`rounded-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-500 ease-out ${
                        isDarkMode 
                          ? 'bg-gray-800/50 hover:bg-gray-800/70' 
                          : 'bg-white hover:bg-gray-50'
                      } backdrop-blur-sm border ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      } shadow hover:shadow-lg`}
                    >
                      {/* Gallery Header */}
                      <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${
                              isDarkMode 
                                ? 'from-purple-500/20 to-blue-500/20' 
                                : 'from-purple-100 to-blue-100'
                            }`}>
                              <Folder className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-base font-semibold truncate ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {gallery.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-0.5 text-xs">
                                <span className={`flex items-center gap-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  <Image className="h-3 w-3 opacity-70" />
                                  {gallery.images?.length || 0}
                                </span>
                                {gallery.createdAt && (
                                  <span className={`flex items-center gap-1 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    <Calendar className="h-3 w-3 opacity-70" />
                                    {new Date(gallery.createdAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/gallery/${gallery._id}`)}
                              className={`p-1.5 rounded-md transition-all duration-300 ${
                                isDarkMode 
                                  ? 'hover:bg-purple-500/20 text-gray-400 hover:text-purple-400' 
                                  : 'hover:bg-purple-50 text-gray-600 hover:text-purple-600'
                              }`}
                              title="View Gallery"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleEditClick(e, gallery._id)}
                              className={`p-1.5 rounded-md transition-all duration-300 ${
                                isDarkMode 
                                  ? 'hover:bg-blue-500/20 text-gray-400 hover:text-blue-400' 
                                  : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                              }`}
                              title="Your Gallery"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGallery(gallery._id, gallery.name)}
                              disabled={deleteLoading === gallery._id}
                              className={`p-1.5 rounded-md transition-all duration-300 ${
                                isDarkMode 
                                  ? 'hover:bg-red-500/20 text-red-400 hover:text-red-500' 
                                  : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                              } disabled:opacity-50`}
                              title="Delete Gallery"
                            >
                              {deleteLoading === gallery._id ? (
                                <div className="animate-spin h-3.5 w-3.5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gallery Images */}
                      <div className="p-3">
                        {gallery.images && gallery.images.length > 0 ? (
                          <div className="relative h-[180px] flex items-center justify-center perspective-[1000px]">
                            <div className="relative w-full h-full">
                              {gallery.images.slice(0, 5).map((image, index) => (
                                <div 
                                  key={image._id}
                                  className={`absolute w-[140px] h-[140px] transition-all duration-700 ease-out
                                    ${index === 0 ? 'z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-105' :
                                      index === 1 ? 'z-40 top-1/2 left-[45%] -translate-y-1/2 -translate-x-1/2 -rotate-3 scale-95 opacity-90' :
                                      index === 2 ? 'z-30 top-1/2 left-[55%] -translate-y-1/2 -translate-x-1/2 rotate-3 scale-90 opacity-80' :
                                      index === 3 ? 'z-20 top-1/2 left-[35%] -translate-y-1/2 -translate-x-1/2 -rotate-6 scale-85 opacity-70' :
                                      'z-10 top-1/2 left-[65%] -translate-y-1/2 -translate-x-1/2 rotate-6 scale-85 opacity-70'
                                    } group hover:z-50 hover:scale-110 hover:rotate-0 hover:opacity-100`}
                                >
                                  <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
                                    <img
                                      src={image.signedUrl || image.imageUrl}
                                      alt={image.title || image.name || 'Gallery Image'}
                                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                      loading="lazy"
                                    />
                                    {image.title && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-1 text-white text-xs truncate">
                                        {image.title}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {gallery.images.length > 5 && (
                              <button
                                onClick={() => navigate(`/gallery/${gallery._id}`)}
                                className="absolute bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-medium hover:bg-white/20 transition-colors duration-300"
                              >
                                <Plus className="h-3 w-3" />
                                {gallery.images.length - 5} more
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className={`text-center py-6 border-2 border-dashed rounded-lg ${
                            isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                          } bg-gradient-to-br ${
                            isDarkMode ? 'from-gray-800/30 to-purple-900/10' : 'from-gray-50 to-purple-50'
                          }`}>
                            <Image className="mx-auto h-8 w-8 mb-2 opacity-40" />
                            <p className="text-xs mb-2 opacity-75">No images yet</p>
                            <button
                              onClick={() => navigate('/artist/upload')}
                              className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-md text-xs transition-all duration-300 hover:scale-105"
                            >
                              <Plus className="h-3 w-3" />
                              Upload
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Edit Gallery Modal */}
              {editModalOpen && (
                <EditGalleryModal
                  isOpen={editModalOpen}
                  onClose={() => {
                    setEditModalOpen(false);
                    setEditGalleryId(null);
                  }}
                  galleryId={editGalleryId}
                  onSuccess={handleEditSuccess}
                />
              )}
            </>
          )}
        </div>

        {/* Create Gallery Modal - Always render but controlled by isOpen prop */}
        <CreateGalleryModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </PageContainer>
  );
};

export default ManageGalleryPage;