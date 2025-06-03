import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Check, X, Search, ImageIcon } from 'lucide-react';
import { galleryService } from '../../services/galleryService';
import { useMessage } from '../../hooks/useMessage';

const CreateGalleryForm = () => {
  const navigate = useNavigate();
  const { addMessage } = useMessage();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableImages, setAvailableImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageIds: []
  });

  useEffect(() => {
    const fetchImages = async () => {
      setLoadingImages(true);
      try {
        const images = await galleryService.getArtistImages();
        setAvailableImages(images.map(img => ({
          id: img._id,
          url: img.imageUrl,
          title: img.imageId, // Using imageId as title since we don't have a title field
          category: 'Art' // Default category since we don't have categories yet
        })));
      } catch (err) {
        console.error('Failed to fetch images:', err);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleImageSelection = (imageId) => {
    setFormData(prev => ({
      ...prev,
      imageIds: prev.imageIds.includes(imageId)
        ? prev.imageIds.filter(id => id !== imageId)
        : [...prev.imageIds, imageId]
    }));
  };

  const filteredImages = availableImages.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.category.toLowerCase().includes(searchTerm.toLowerCase())
  );  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    if (formData.imageIds.length === 0) {
      setError('Please select at least one image for your gallery');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageIds: formData.imageIds
      };
      
      console.log('Submitting gallery creation with data:', requestData);      const result = await galleryService.createGalleryGroup(requestData);
      console.log('Gallery creation successful:', result);
      
      // Show success message from the server response and navigate
      addMessage({ type: 'success', text: result.message || `Gallery "${result.name}" created successfully` });
      navigate('/artist/gallery');
    } catch (err) {
      console.error('Failed to create gallery:', err);
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      }
      setError(err.message || 'Failed to create gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Gallery
          </h1>
        </div>

        {error && (
          <div 
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2"
            role="alert"
            aria-live="polite"
          >
            <X className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="gallery-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Gallery Name *
              </label>
              <input
                id="gallery-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter gallery name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="selected-count" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Selected Images
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {formData.imageIds.length} image{formData.imageIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="gallery-description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description *
            </label>
            <textarea
              id="gallery-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              rows="4"
              placeholder="Describe your gallery..."
              required
            />
          </div>

          {/* Image Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Images for Gallery
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              {loadingImages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading images...</span>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No images found matching your search.' : 'No images available.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((image) => {
                    const isSelected = formData.imageIds.includes(image.id);
                    return (
                      <div
                        key={image.id}
                        onClick={() => toggleImageSelection(image.id)}
                        className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                          isSelected 
                            ? 'ring-4 ring-blue-500 dark:ring-blue-400 shadow-lg' 
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="aspect-square relative">
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 transition-all duration-300 ${
                            isSelected 
                              ? 'bg-blue-500/20' 
                              : 'bg-black/0 group-hover:bg-black/20'
                          }`} />
                          
                          {/* Selection indicator */}
                          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isSelected 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white/80 text-gray-600'
                          }`}>
                            {isSelected ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-bold">+</span>
                            )}
                          </div>

                          {/* Image info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-sm font-medium truncate">{image.title}</p>
                            <p className="text-gray-300 text-xs">{image.category}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading || formData.imageIds.length === 0}
              className={`flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading || formData.imageIds.length === 0
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Gallery...
                </span>
              ) : (
                `Create Gallery (${formData.imageIds.length} images)`
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/artist/gallery')}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGalleryForm;