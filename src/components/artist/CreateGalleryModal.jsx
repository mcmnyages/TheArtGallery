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
  const [loading, setLoading] = useState(false);  const [loadingImages, setLoadingImages] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableImages, setAvailableImages] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageIds: [],
    basePrice: '',
    baseCurrency: 'USD'
  });
  
  const [formValidation, setFormValidation] = useState({
    name: { valid: true, message: '' },
    description: { valid: true, message: '' },
    images: { valid: true, message: '' },
    basePrice: { valid: true, message: '' }
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setFormData({
        name: '',
        description: '',
        imageIds: [],
        basePrice: '',
        baseCurrency: 'USD'
      });
      setFormValidation({
        name: { valid: true, message: '' },
        description: { valid: true, message: '' },
        images: { valid: true, message: '' },
        basePrice: { valid: true, message: '' }
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
      images: { valid: true, message: '' },
      basePrice: { valid: true, message: '' }
    };
    
    // Name validation
    if (!formData.name.trim()) {
      newValidation.name = { valid: false, message: 'Gallery name is required' };
    } else if (formData.name.trim().length < 3) {
      newValidation.name = { valid: false, message: 'Gallery name must be at least 3 characters' };
    }

    // Description validation
    if (!formData.description.trim()) {
      newValidation.description = { valid: false, message: 'Gallery description is required' };    } else if (formData.description.trim().length < 10) {
      newValidation.description = { valid: false, message: 'Description must be at least 10 characters' };
    }
    
    // Images validation
    if (formData.imageIds.length === 0) {
      newValidation.images = { valid: false, message: 'Please select at least one image' };
    }

    // Price validation
    if (formData.basePrice !== '') {
      const price = parseFloat(formData.basePrice);
      if (isNaN(price) || price < 0) {
        newValidation.basePrice = { valid: false, message: 'Price must be a valid positive number' };
      } else if (price > 10000) {
        newValidation.basePrice = { valid: false, message: 'Price cannot exceed 10,000' };
      }
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
    (image.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);      setError('');
      
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageIds: formData.imageIds,
        basePrice: formData.basePrice !== '' ? parseFloat(formData.basePrice) : null,
        baseCurrency: formData.baseCurrency
      };
      
      console.log('Submitting gallery creation with:', requestData);
      const result = await galleryService.createGalleryGroup(requestData);
      console.log('Gallery created successfully:', result);
        addMessage({ text: result.name ? `Gallery "${result.name}" created successfully!` : 'Gallery created successfully!', type: 'success' });
      
      // Clear form and close modal
      setFormData({
        name: '',
        description: '',
        imageIds: [],
        basePrice: '',
        baseCurrency: 'USD'
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

  // Early return if modal is not open
  return !isOpen ? null : (
    <div className="fixed inset-0 overflow-y-auto bg-black/40 backdrop-blur-md z-50">
      <div className="min-h-screen px-4 text-center">
        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
        
        <div className={`inline-block w-full max-w-4xl text-left align-middle transition-all transform ${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative`}>
          {/* Glass effect border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
          
          {/* Close button with animation */}
          <button
            onClick={onClose}
            className={`absolute -top-4 -right-4 p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white shadow-lg shadow-purple-900/20' 
                : 'bg-white text-gray-600 hover:text-gray-900 shadow-lg shadow-purple-200/50'
            }`}
          >
            <X className="h-5 w-5" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-8 relative">
            {/* Header with animated gradient */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg transform -rotate-3 transition-transform duration-300 hover:rotate-0">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
                <h1 className={`text-4xl font-bold ${
                  isDarkMode 
                    ? 'text-white' 
                    : 'text-gray-900'
                }`}>
                  Create New Gallery
                </h1>
              </div>
            </div>

            {error && (
            <div className={`p-4 rounded-xl border-2 backdrop-blur-sm flex items-center gap-3 animate-fadeIn ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-800/50 text-red-400' 
                : 'bg-red-50/80 border-red-200 text-red-700'
            }`}>
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                <X className="h-5 w-5 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Gallery Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="gallery-name" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Gallery Name <span className="text-purple-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="gallery-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-transparent backdrop-blur-sm ${
                      isDarkMode 
                        ? 'text-white placeholder-gray-400' 
                        : 'text-gray-900 placeholder-gray-500'
                    } ${
                      !formValidation.name.valid
                        ? 'border-red-500 dark:border-red-500' 
                        : `border-gray-200 dark:border-gray-600 focus:border-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700/30 focus:bg-gray-700/50' 
                              : 'bg-white/50 focus:bg-white/80'
                          }`
                    } transition-all duration-300 focus:ring-4 ${
                      isDarkMode 
                        ? 'focus:ring-purple-500/20' 
                        : 'focus:ring-purple-500/20'
                    } outline-none`}
                    placeholder="Enter gallery name"
                  />
                  {!formValidation.name.valid && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                      {formValidation.name.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="gallery-description" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Description <span className="text-purple-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="gallery-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-transparent backdrop-blur-sm ${
                      isDarkMode 
                        ? 'text-white placeholder-gray-400' 
                        : 'text-gray-900 placeholder-gray-500'
                    } ${
                      !formValidation.description.valid
                        ? 'border-red-500 dark:border-red-500' 
                        : `border-gray-200 dark:border-gray-600 focus:border-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700/30 focus:bg-gray-700/50' 
                              : 'bg-white/50 focus:bg-white/80'
                          }`
                    } transition-all duration-300 focus:ring-4 ${
                      isDarkMode 
                        ? 'focus:ring-purple-500/20' 
                        : 'focus:ring-purple-500/20'
                    } outline-none resize-none`}
                    rows="4"
                    placeholder="Describe your gallery..."
                  />
                  {!formValidation.description.valid && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                      {formValidation.description.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="basePrice" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Base Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="basePrice"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl bg-transparent backdrop-blur-sm ${
                        isDarkMode 
                          ? 'text-white placeholder-gray-400' 
                          : 'text-gray-900 placeholder-gray-500'
                      } ${
                        !formValidation.basePrice?.valid
                          ? 'border-red-500 dark:border-red-500' 
                          : `border-gray-200 dark:border-gray-600 focus:border-purple-500 ${
                              isDarkMode 
                                ? 'bg-gray-700/30 focus:bg-gray-700/50' 
                                : 'bg-white/50 focus:bg-white/80'
                            }`
                      } transition-all duration-300 focus:ring-4 ${
                        isDarkMode 
                          ? 'focus:ring-purple-500/20' 
                          : 'focus:ring-purple-500/20'
                      } outline-none`}
                      placeholder="0.00"
                    />
                    {!formValidation.basePrice?.valid && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                        {formValidation.basePrice.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="baseCurrency" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Currency
                  </label>
                  <select
                    id="baseCurrency"
                    name="baseCurrency"
                    value={formData.baseCurrency}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-transparent backdrop-blur-sm ${
                      isDarkMode 
                        ? 'text-white bg-gray-700/30 border-gray-600 focus:bg-gray-700/50' 
                        : 'text-gray-900 bg-white/50 border-gray-200 focus:bg-white/80'
                    } transition-all duration-300 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none appearance-none`}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
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
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl bg-transparent backdrop-blur-sm ${
                      isDarkMode 
                        ? 'text-white placeholder-gray-400 bg-gray-700/30 border-gray-600 focus:bg-gray-700/50' 
                        : 'text-gray-900 placeholder-gray-500 bg-white/50 border-gray-200 focus:bg-white/80'
                    } transition-all duration-300 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none`}
                  />
                </div>
              </div>

              <div className={`flex items-center gap-2 px-6 py-3 rounded-xl ${
                formData.imageIds.length === 0
                  ? 'bg-yellow-50/80 dark:bg-yellow-900/20 border-2 border-yellow-200/50 dark:border-yellow-800/50'
                  : 'bg-green-50/80 dark:bg-green-900/20 border-2 border-green-200/50 dark:border-green-800/50'
              } backdrop-blur-sm transition-all duration-300`}>
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
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200/30 dark:border-purple-900/30"></div>
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
                    </div>
                    <p className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
              className={`flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 ${
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
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
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
  </div>
  );
};


export default CreateGalleryModal;
