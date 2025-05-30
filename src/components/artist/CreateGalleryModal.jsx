import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { galleryService } from '../../services/galleryService';
import { Search, Plus, X, ImageIcon } from 'lucide-react';
import { useMessage } from '../../hooks/useMessage';

const CreateGalleryModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const addMessage = useMessage();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableImages, setAvailableImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageIds: []
  });
  const [formValidation, setFormValidation] = useState({
    name: { valid: true, message: '' },
    description: { valid: true, message: '' },
    images: { valid: true, message: '' }
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setFormData({
        name: '',
        description: '',
        imageIds: []
      });
      setFormValidation({
        name: { valid: true, message: '' },
        description: { valid: true, message: '' },
        images: { valid: true, message: '' }
      });
      setSearchTerm('');
    }
  }, [isOpen]);

  // Fetch images when modal is opened
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoadingImages(true);
        setError('');
        const images = await galleryService.getArtistImages();
        if (!images || images.length === 0) {
          setError('No images available. Please upload some images first.');
          return;
        }
        setAvailableImages(images.map(img => ({
          id: img.imageId,
          url: img.imageUrl,
          title: img.imageId, // Using imageId as title since we don't have a title field
          category: 'Art' // Default category since we don't have categories yet
        })));
      } catch (err) {
        console.error('Failed to fetch images:', err);
        setError('Failed to load images. Please try again later.');
        addMessage({ text: 'Failed to load images. Please try again later.', type: 'error' });
      } finally {
        setLoadingImages(false);
      }
    };

    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  // Optimistically update validation when images are selected
  useEffect(() => {
    if (formData.imageIds.length > 0 && !formValidation.images.valid) {
      setFormValidation(prev => ({
        ...prev,
        images: { valid: true, message: '' }
      }));
    }
  }, [formData.imageIds]);

  const validateForm = () => {
    const newValidation = {
      name: { valid: true, message: '' },
      description: { valid: true, message: '' },
      images: { valid: true, message: '' }
    };
    
    // Name validation
    if (!formData.name.trim()) {
      newValidation.name = { valid: false, message: 'Gallery name is required' };
    } else if (formData.name.trim().length < 3) {
      newValidation.name = { valid: false, message: 'Gallery name must be at least 3 characters' };
    }

    // Description validation
    if (!formData.description.trim()) {
      newValidation.description = { valid: false, message: 'Gallery description is required' };
    } else if (formData.description.trim().length < 10) {
      newValidation.description = { valid: false, message: 'Description must be at least 10 characters' };
    }

    // Images validation
    if (formData.imageIds.length === 0) {
      newValidation.images = { valid: false, message: 'Please select at least one image' };
    }

    setFormValidation(newValidation);
    return Object.values(newValidation).every(field => field.valid);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation errors when user types
    setFormValidation(prev => ({
      ...prev,
      [name]: { valid: true, message: '' }
    }));
  };

  const toggleImageSelection = (imageId) => {
    setFormData(prev => {
      const newImageIds = prev.imageIds.includes(imageId)
        ? prev.imageIds.filter(id => id !== imageId)
        : [...prev.imageIds, imageId];
      
      // Update validation
      setFormValidation(prev => ({
        ...prev,
        images: {
          valid: newImageIds.length > 0,
          message: newImageIds.length === 0 ? 'Please select at least one image' : ''
        }
      }));

      return {
        ...prev,
        imageIds: newImageIds
      };
    });
  };

  const filteredImages = availableImages.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      
      console.log('Submitting gallery creation with:', requestData);
      const result = await galleryService.createGalleryGroup(requestData);
      console.log('Gallery created successfully:', result);
      
      addMessage({ text: result.name ? `Gallery "${result.name}" created successfully!` : 'Gallery created successfully!', type: 'success' });
      
      // Clear form and close modal
      setFormData({
        name: '',
        description: '',
        imageIds: []
      });
      
      onSuccess?.(); // Refresh galleries list
      onClose();     // Close modal
    } catch (err) {
      console.error('Failed to create gallery:', err);
      const errorMessage = err.message || 'Failed to create gallery. Please try again.';
      setError(errorMessage);
      addMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
      <div className={`relative max-w-4xl w-full m-4 p-8 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Gallery
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center gap-2">
              <X className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Gallery Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="gallery-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Gallery Name *
                </label>
                <input
                  type="text"
                  id="gallery-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                    !formValidation.name.valid 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter gallery name"
                />
                {!formValidation.name.valid && (
                  <p className="mt-1 text-sm text-red-500">{formValidation.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="gallery-description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description *
                </label>
                <textarea
                  id="gallery-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`mt-1 w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                    !formValidation.description.valid 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows="4"
                  placeholder="Describe your gallery..."
                />
                {!formValidation.description.valid && (
                  <p className="mt-1 text-sm text-red-500">{formValidation.description.message}</p>
                )}
              </div>
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
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                formData.imageIds.length === 0
                  ? 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
                  : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
              }`}>
                <div className={`text-sm font-medium ${
                  formData.imageIds.length === 0
                    ? 'text-yellow-800 dark:text-yellow-400'
                    : 'text-green-800 dark:text-green-400'
                }`}>
                  {formData.imageIds.length === 0
                    ? 'Select images to create your gallery'
                    : `${formData.imageIds.length} image${formData.imageIds.length !== 1 ? 's' : ''} selected`}
                </div>
              </div>

              {!formValidation.images.valid && (
                <p className="text-sm text-red-500">{formValidation.images.message}</p>
              )}

              {/* Image Grid */}
              <div className="max-h-[50vh] overflow-y-auto p-1">
                {loadingImages ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      Loading your images...
                      <br />
                      <span className="text-sm opacity-75">This may take a moment</span>
                    </p>
                  </div>
                ) : filteredImages.length === 0 ? (
                  <div className="text-center py-12">
                    {searchTerm ? (
                      <>
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No images found matching "{searchTerm}"
                        </p>
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear search
                        </button>
                      </>
                    ) : (
                      <>
                        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">
                          No images available
                        </p>
                        <button
                          onClick={() => navigate('/artist/upload')}
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Upload some images
                        </button>
                      </>
                    )}
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
                            
                            {/* Selection status */}
                            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isSelected 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/80 text-gray-600'
                            }`}>
                              {isSelected && <Plus className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading || formData.imageIds.length === 0}
              className={`flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 ${
                loading || formData.imageIds.length === 0
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Gallery...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Gallery ({formData.imageIds.length} image{formData.imageIds.length !== 1 ? 's' : ''})</span>
                </span>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : `${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGalleryModal;
