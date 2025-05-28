import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtist } from '../../hooks/useArtistContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaEdit, FaTrash, FaEye, FaCheck } from 'react-icons/fa';
import ImageViewer from '../gallery/ImageViewer';

const ArtistPictureManager = () => {
  const { artworks, deleteArtwork, loading, error } = useArtist();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedArtworks, setSelectedArtworks] = useState(new Set());

  // Sort and filter pictures
  const sortedAndFilteredArtworks = artworks
    ?.filter(artwork => filterCategory === 'all' || artwork.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleImageView = (artwork) => {
    setSelectedImage(artwork);
    setViewerOpen(true);
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (window.confirm('Are you sure you want to delete this artwork?')) {
      try {
        await deleteArtwork(artworkId);
        setSelectedArtworks(prev => {
          const next = new Set(prev);
          next.delete(artworkId);
          return next;
        });
      } catch (err) {
        console.error('Failed to delete artwork:', err);
      }
    }
  };

  const toggleSelection = (artworkId) => {
    setSelectedArtworks(prev => {
      const next = new Set(prev);
      if (next.has(artworkId)) {
        next.delete(artworkId);
      } else {
        next.add(artworkId);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedArtworks.size} selected artworks?`)) {
      try {
        await Promise.all([...selectedArtworks].map(id => deleteArtwork(id)));
        setSelectedArtworks(new Set());
      } catch (err) {
        console.error('Failed to delete artworks:', err);
      }
    }
  };

  const categories = ['all', ...new Set(artworks?.map(artwork => artwork.category) || [])];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`p-2 rounded-md border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`p-2 rounded-md border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {sortedAndFilteredArtworks?.length || 0} artworks
            {selectedArtworks.size > 0 && ` (${selectedArtworks.size} selected)`}
          </span>
          {selectedArtworks.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Pictures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedAndFilteredArtworks?.map((artwork) => (
          <div
            key={artwork.id}
            className={`group relative rounded-lg overflow-hidden shadow-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } ${selectedArtworks.has(artwork.id) ? 'ring-2 ring-blue-500' : ''}`}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <button
                onClick={() => toggleSelection(artwork.id)}
                className={`p-2 rounded-full transition-colors ${
                  selectedArtworks.has(artwork.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/75 hover:bg-white text-gray-700'
                }`}
              >
                <FaCheck className="w-4 h-4" />
              </button>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3]">
              <img
                src={artwork.thumbnailUrl || artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => handleImageView(artwork)}
                  className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <FaEye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteArtwork(artwork.id)}
                  className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100 transition-colors"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-4">
              <h3 className={`font-semibold truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {artwork.title}
              </h3>
              <p className={`text-sm mt-1 truncate ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {artwork.category}
              </p>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Added {new Date(artwork.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && sortedAndFilteredArtworks?.length === 0 && (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p className="text-lg mb-2">No artworks found</p>
          {filterCategory !== 'all' && (
            <button
              onClick={() => setFilterCategory('all')}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewerOpen && selectedImage && (
        <ImageViewer
          image={{
            url: selectedImage.imageUrl,
            title: selectedImage.title,
            imageId: selectedImage.id
          }}
          imageData={{
            url: selectedImage.imageUrl,
            title: selectedImage.title,
            metadata: {
              category: selectedImage.category,
              addedOn: new Date(selectedImage.createdAt).toLocaleDateString(),
              dimensions: selectedImage.dimensions,
              medium: selectedImage.medium
            }
          }}
          onClose={() => {
            setViewerOpen(false);
            setSelectedImage(null);
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default ArtistPictureManager;
