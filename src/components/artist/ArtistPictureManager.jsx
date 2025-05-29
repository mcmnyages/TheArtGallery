import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { FaEdit, FaTrash, FaEye, FaCheck } from 'react-icons/fa';
import ImageViewer from '../gallery/ImageViewer';
import { galleryService } from '../../services/galleryService';

const ArtistPictureManager = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [categories, setCategories] = useState(['all', 'portraits', 'landscapes', 'abstract', 'other']);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchArtistImages();
  }, []);
  const fetchArtistImages = async () => {
    try {
      setLoading(true);
      const fetchedImages = await galleryService.getArtistImages();
      console.log('Fetched artist images:', fetchedImages);
      setImages(fetchedImages);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      setError(err.response?.data?.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await galleryService.deleteArtistImage(imageId);
        await fetchArtistImages();
      } catch (err) {
        console.error('Failed to delete image:', err);
        alert(err.response?.data?.message || 'Failed to delete image');
      }
    }
  };
  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const handleImageView = (image) => {
    setSelectedImage(image);
    setViewerOpen(true);
  };
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedImages.size} images?`)) {
      setLoading(true);
      try {
        const deletePromises = Array.from(selectedImages).map(imageId =>
          galleryService.deleteArtistImage(imageId)
        );
        await Promise.all(deletePromises);
        setSelectedImages(new Set()); // Clear selection
        await fetchArtistImages(); // Refresh the image list
      } catch (err) {
        console.error('Failed to delete images:', err);
        setError(err.response?.data?.message || 'Failed to delete images');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newUploadProgress = {};    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('images', file);  // Changed from 'images' to 'image' to match backend
        formData.append('type', 'artwork');

        // Initialize progress for this file
        newUploadProgress[file.name] = 0;
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Call uploadArtistImage with progress tracking
        return galleryService.uploadArtistImage(formData, (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        });
      });

      await Promise.all(uploadPromises);
      setUploadProgress({}); // Clear progress
      await fetchArtistImages(); // Refresh the image list
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    } catch (err) {
      console.error('Failed to upload images:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  // Sort and filter images
  const sortedAndFilteredImages = images
    ?.filter(image => filterCategory === 'all' || image.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error loading images</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchArtistImages}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`p-2 rounded-lg border ${
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
            className={`p-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
          </select>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>

        {selectedImages.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Selected ({selectedImages.size})
          </button>
        )}
      </div>

      {/* Upload Section */}
      <div className="mb-8 space-y-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Upload New Images'}
          </button>
          {uploading && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Uploading {Object.keys(uploadProgress).length} files...
            </span>
          )}
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedAndFilteredImages?.map((image) => {
          console.log('Rendering image:', image);
          return (
          <div
            key={image._id}
            className={`group relative rounded-lg overflow-hidden shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } ${selectedImages.has(image._id) ? 'ring-2 ring-blue-500' : ''}`}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <button
                onClick={() => toggleImageSelection(image._id)}
                className={`p-2 rounded-full transition-colors ${
                  selectedImages.has(image._id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/75 hover:bg-white text-gray-700'
                }`}
              >
                <FaCheck className="w-4 h-4" />
              </button>
            </div>

            {/* Image */}
            <div className="relative aspect-square">
              <img
                src={image.imageUrl}
                alt={image.title || 'Artwork'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load image:', image.imageUrl);
                  e.target.onerror = null; // Prevent infinite error loop
                  e.target.src = '/assets/images/placeholder.jpg';
                }}
                onLoad={() => console.log('Successfully loaded image:', image.imageUrl)}
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => handleImageView(image)}
                  className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <FaEye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteImage(image.imageId)}
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
                
              </h3>
              <p className={`text-sm mt-1 truncate ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                
              </p>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Added {new Date(image.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && sortedAndFilteredImages?.length === 0 && (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p className="text-lg mb-2">No images found</p>
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
            title: selectedImage.title || 'Untitled',
            imageId: selectedImage._id
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
