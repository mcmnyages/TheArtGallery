import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { FaEdit, FaTrash, FaEye, FaCheck } from 'react-icons/fa';
import ImageViewer from '../gallery/ImageViewer';
import { galleryService } from '../../services/galleryService';
import { useMessage } from '../../hooks/useMessage';

const ArtistPictureManager = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { addMessage } = useMessage();
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
  const [dragOver, setDragOver] = useState(false);
  const [filePreview, setFilePreview] = useState([]);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchArtistImages();
  }, []);  const fetchArtistImages = async () => {
    try {
      setLoading(true);      const fetchedImages = await galleryService.getArtistImages();
      console.log('Fetched artist images with details:', fetchedImages);
      setImages(fetchedImages);
      setError(null);    } catch (err) {
      console.error('Failed to fetch images:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load images';
      setError(errorMsg);
      addMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteImage = async (imageId, mongoId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {      try {
        await galleryService.deleteArtistImage(mongoId);
        await fetchArtistImages();
        addMessage({ text: 'Image deleted successfully', type: 'success' });
      } catch (err) {
        console.error('Failed to delete image:', err);
        const errorMsg = err.response?.data?.message || 'Failed to delete image';
        addMessage({ text: errorMsg, type: 'error' });
      }
    }
  };  const toggleImageSelection = (mongoId) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(mongoId)) {
        next.delete(mongoId);
        addMessage({ text: 'Image deselected', type: 'info' });
      } else {
        next.add(mongoId);
        addMessage({ text: 'Image selected', type: 'info' });
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
      setLoading(true);      try {
        const deletePromises = Array.from(selectedImages).map(mongoId =>
          galleryService.deleteArtistImage(mongoId)
        );        await Promise.all(deletePromises);
        setSelectedImages(new Set()); // Clear selection
        await fetchArtistImages(); // Refresh the image list
        addMessage({ text: 'Selected images deleted successfully', type: 'success' });
      } catch (err) {
        console.error('Failed to delete images:', err);
        const errorMsg = err.response?.data?.message || 'Failed to delete images';
        setError(errorMsg);
        addMessage({ text: errorMsg, type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      addMessage({ text: 'Please select at least one image to upload', type: 'warning' });
      return;
    }    setUploading(true);
    const newUploadProgress = {};    
    addMessage({ text: `Starting upload of ${files.length} image(s)...`, type: 'info' });
    try {
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
      });      await Promise.all(uploadPromises);
      setUploadProgress({}); // Clear progress
      await fetchArtistImages(); // Refresh the image list
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
      addMessage({ text: 'Images uploaded successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to upload images:', err);
      const errorMsg = err.message || 'Failed to upload images';
      setError(errorMsg);
      addMessage({ text: errorMsg, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      // Create preview URLs for dropped files
      const previews = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setFilePreview(previews);
      handleImageUpload({ target: { files } });
    }
  };

  // Cleanup function for preview URLs
  useEffect(() => {
    return () => {
      filePreview.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [filePreview]);

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
        <div
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : isDarkMode
              ? 'border-gray-600 hover:border-gray-500'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
          />

          <div className="text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Select Images
                </>
              )}
            </button>
            <p className={`mt-2 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              or drag and drop images here
            </p>
          </div>

          {/* File Preview Grid */}
          {filePreview.length > 0 && !uploading && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filePreview.map((preview) => (
                <div
                  key={preview.url}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm px-2 text-center truncate">
                      {preview.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-6 space-y-4">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate flex-1 mr-4">
                      {fileName}
                    </span>
                    <span className={`text-sm font-medium ${
                      progress === 100
                        ? 'text-green-500'
                        : isDarkMode
                        ? 'text-blue-400'
                        : 'text-blue-600'
                    }`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ease-out rounded-full ${
                        progress === 100
                          ? 'bg-green-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Images Grid */}      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedAndFilteredImages?.map((image) => {
          console.log('Rendering image:', image);
          return (
          <div            key={image._id}
            className={`group relative rounded-lg overflow-hidden shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } ${selectedImages.has(image._id) ? 'ring-2 ring-blue-500' : ''}`}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">                <button                  onClick={() => toggleImageSelection(image._id)}
                  className={`p-2 rounded-full transition-colors ${
                    selectedImages.has(image._id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/75 hover:bg-white text-gray-700'
                }`}
              >
                <FaCheck className="w-4 h-4" />
              </button>
            </div>

            {/* Image */}            <div className="relative aspect-square">
              <img
                src={image.signedUrl}
                alt="Artwork"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load image:', image.signedUrl);
                  e.target.onerror = null; // Prevent infinite error loop
                  e.target.src = '/assets/images/placeholder.jpg';
                }}
                onLoad={() => console.log('Successfully loaded image:', image.signedUrl)}
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => handleImageView(image)}
                  className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <FaEye className="w-5 h-5" />
                </button>
                <button                  onClick={() => handleDeleteImage(image.imageId, image._id)}
                  className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100 transition-colors"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Details */}            <div className="p-4">
              <h3 className={`font-semibold truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {image.title || 'Untitled Artwork'}
              </h3>
              <p className={`text-sm mt-1 truncate ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {image.category ? image.category.charAt(0).toUpperCase() + image.category.slice(1) : 'Uncategorized'}
              </p>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : 'Date not available'}
              </p>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                ID: {image._id}
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
      )}      {/* Image Viewer Modal */}      {viewerOpen && selectedImage && (
        <ImageViewer
          image={{
            url: selectedImage.signedUrl,
            title: selectedImage.title || 'Artwork',
            imageId: selectedImage.imageId,
            mongoId: selectedImage._id,
            createdAt: selectedImage.createdAt,
            category: selectedImage.category
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
