import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { galleryService } from '../../services/galleryService';
import { Search, Plus, X, ImageIcon, Check, AlertCircle, Upload, Sparkles } from 'lucide-react';
import { useMessage } from '../../hooks/useMessage';

const CreateGalleryModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { addMessage } = useMessage();
  
  // Core state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableImages, setAvailableImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Form data with better initial state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageIds: [],
    baseCurrency: 'USD',
    subscriptionOptions: [
      {
        id: 'default',
        duration: 30,
        price: 9.99,
        label: '$9.99 for 30 days',
        isActive: true
      }
    ]
  });
  
  // Form validation state
  const [formValidation, setFormValidation] = useState({
    name: { valid: true, message: '' },
    description: { valid: true, message: '' },
    images: { valid: true, message: '' },
    subscriptionOptions: { valid: true, message: '' }
  });

  // Reset form when modal closes
  const resetForm = useCallback(() => {
    setError('');
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      imageIds: [],
      baseCurrency: 'USD',
      subscriptionOptions: [
        {
          id: 'default',
          duration: 30,
          price: 9.99,
          label: '$9.99 for 30 days',
          isActive: true
        }
      ]
    });
    setFormValidation({
      name: { valid: true, message: '' },
      description: { valid: true, message: '' },
      images: { valid: true, message: '' },
      subscriptionOptions: { valid: true, message: '' }
    });
    setSearchTerm('');
    setImageLoadErrors({});
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Fetch images when modal opens
  useEffect(() => {
    const fetchImages = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingImages(true);
        setError('');
        
        const images = await galleryService.getArtistImages();
        if (!images || images.length === 0) {
          setError('No images available. Please upload some images first.');
          return;
        }

        const processedImages = images.map(img => ({
          id: img._id || img.imageId,
          url: img.signedUrl || img.imageUrl || '',
          title: img.title || 'Untitled',
          category: img.category || 'Art'
        })).filter(img => img.url); // Only include images with valid URLs

        setAvailableImages(processedImages);
      } catch (err) {
        console.error('Failed to fetch images:', err);
        const errorMsg = 'Failed to load images. Please try again later.';
        setError(errorMsg);
        addMessage({ text: errorMsg, type: 'error' });
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [isOpen, addMessage]);

  // Check if current step is valid
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length >= 3 && formData.description.trim().length >= 10;
      case 2:
        // Make sure at least one subscription option exists and is active
        return formData.subscriptionOptions.length > 0 && 
          formData.subscriptionOptions.some(opt => opt.isActive && 
            typeof opt.isActive === 'boolean' && 
            opt.duration > 0 && 
            opt.price >= 0.99);
      case 3:
        return formData.imageIds.length > 0;
      default:
        return false;
    }
  }, [currentStep, formData]);

  // Form validation function
  const validateForm = useCallback(() => {
    const newValidation = {
      name: { valid: true, message: '' },
      description: { valid: true, message: '' },
      images: { valid: true, message: '' },
      subscriptionOptions: { valid: true, message: '' }
    };
    
    // Name validation
    if (formData.name.trim().length === 0) {
      newValidation.name = { valid: false, message: 'Gallery name is required' };
    } else if (formData.name.trim().length < 3) {
      newValidation.name = { valid: false, message: 'Gallery name must be at least 3 characters' };
    } else if (formData.name.trim().length > 100) {
      newValidation.name = { valid: false, message: 'Gallery name too long (max 100 characters)' };
    }

    // Description validation
    if (formData.description.trim().length === 0) {
      newValidation.description = { valid: false, message: 'Description is required' };
    } else if (formData.description.trim().length < 10) {
      newValidation.description = { valid: false, message: 'Description must be at least 10 characters' };
    } else if (formData.description.trim().length > 500) {
      newValidation.description = { valid: false, message: `Description too long (${formData.description.length}/500 characters)` };
    }
    
    // Image validation
    if (formData.imageIds.length === 0) {
      newValidation.images = { valid: false, message: 'Please select at least one image' };
    } else if (formData.imageIds.length > 50) {
      newValidation.images = { valid: false, message: 'Maximum of 50 images allowed' };
    }

    // Subscription options validation
    const activeOptions = formData.subscriptionOptions.filter(opt => opt.isActive);
    if (activeOptions.length === 0) {
      newValidation.subscriptionOptions = {
        valid: false,
        message: 'At least one subscription option must be active'
      };
    } else {
      const invalidOption = activeOptions.find(option => {
        const price = parseFloat(option.price);
        const duration = parseInt(option.duration);
        return !option.label || 
               isNaN(price) || price < 0.99 || price > 999.99 || 
               isNaN(duration) || duration < 1 || duration > 365 || 
               typeof option.isActive !== 'boolean';
      });

      if (invalidOption) {
        newValidation.subscriptionOptions = {
          valid: false,
          message: 'Each subscription option must have a valid price ($0.99-$999.99), duration (1-365 days), and label'
        };
      }
    }

    setFormValidation(newValidation);
    return Object.values(newValidation).every(field => field.valid);
  }, [formData]);

  // Optimized image filtering
  const filteredImages = useMemo(() => {
    if (!searchTerm) return availableImages;
    const term = searchTerm.toLowerCase();
    return availableImages.filter(image =>
      (image.title || '').toLowerCase().includes(term) ||
      (image.category || '').toLowerCase().includes(term)
    );
  }, [availableImages, searchTerm]);

  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors
    setFormValidation(prev => ({
      ...prev,
      [name]: { valid: true, message: '' }
    }));
  }, []);

  // Toggle image selection
  const toggleImageSelection = useCallback((imageId) => {
    setFormData(prev => {
      const newImageIds = prev.imageIds.includes(imageId)
        ? prev.imageIds.filter(id => id !== imageId)
        : [...prev.imageIds, imageId];
      
      return { ...prev, imageIds: newImageIds };
    });
  }, []);

  // Select all visible images
  const selectAllVisibleImages = useCallback(() => {
    const visibleImageIds = filteredImages.map(img => img.id);
    setFormData(prev => ({
      ...prev,
      imageIds: [...new Set([...prev.imageIds, ...visibleImageIds])]
    }));
  }, [filteredImages]);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setFormData(prev => ({ ...prev, imageIds: [] }));
  }, []);

  // Generate subscription label
  const generateSubscriptionLabel = useCallback((duration, price) => {
    if (!duration || !price) return 'Invalid subscription';
    return `$${parseFloat(price).toFixed(2)} for ${duration} days`;
  }, []);
  // Handle subscription option changes
  const updateSubscriptionOption = useCallback((index, updates) => {
    setFormData(prev => {
      const updatedOptions = [...prev.subscriptionOptions];
      const currentOption = { ...updatedOptions[index] };
      const newUpdates = {
        ...updates,
        isActive: 'isActive' in updates ? updates.isActive : currentOption.isActive
      };
      
      // Update the label when price or duration changes
      if ('price' in updates || 'duration' in updates) {
        const updatedOption = {
          ...currentOption,
          ...newUpdates
        };
        newUpdates.label = generateSubscriptionLabel(
          updates.duration || currentOption.duration,
          updates.price || currentOption.price
        );
      }
      
      updatedOptions[index] = {
        ...currentOption,
        ...newUpdates
      };
      
      return {
        ...prev,
        subscriptionOptions: updatedOptions
      };
    });
  }, [generateSubscriptionLabel]);
  // Add new subscription option
  const addSubscriptionOption = useCallback(() => {
    const newOption = {
      id: `custom-${Date.now()}`,
      duration: 30,
      price: 9.99,
      label: '$9.99 for 30 days',
      isActive: true
    };
    
    setFormData(prev => ({
      ...prev,
      subscriptionOptions: [...prev.subscriptionOptions, newOption]
    }));
  }, []);

  // Remove subscription option
  const removeSubscriptionOption = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      subscriptionOptions: prev.subscriptionOptions.filter((_, i) => i !== index)
    }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Format subscription options for the API
      const formattedSubscriptions = formData.subscriptionOptions
        .filter(opt => opt.isActive)
        .map(opt => ({
          duration: parseInt(opt.duration),
          price: parseFloat(opt.price),
          label: opt.label,
          isActive: true
        }));
      
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageIds: formData.imageIds,
        baseCurrency: formData.baseCurrency,
        subscriptionOptions: formattedSubscriptions
      };
      
      const result = await galleryService.createGalleryGroup(requestData);
      
      addMessage({ 
        text: `Gallery "${result.name || formData.name}" created successfully!`, 
        type: 'success' 
      });
      
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to create gallery:', err);
      const errorMessage = err.message || 'Failed to create gallery. Please try again.';
      setError(errorMessage);
      addMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Progress bar effect
  useEffect(() => {
    if (!loading) return;
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    return () => {
      clearInterval(interval);
      setLoadingProgress(0);
    };
  }, [loading]);

  // Handle image load errors
  const handleImageError = useCallback((imageId) => {
    setImageLoadErrors(prev => ({ ...prev, [imageId]: true }));
  }, []);

  // Step navigation
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className={`w-full max-w-5xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[90vh] flex flex-col text-left transition-all transform ${
        isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
      } backdrop-blur-xl rounded-3xl shadow-2xl relative overflow-hidden border border-purple-500/20`}>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-3 rounded-xl z-50 transition-all duration-300 transform hover:scale-110 hover:rotate-90 ${
            isDarkMode 
              ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20`}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-4 sm:p-6 md:p-8 pb-2 sm:pb-3 md:pb-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg transform -rotate-3 transition-transform duration-300 hover:rotate-0">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
                  Create New Gallery
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Step {currentStep} of 3 • {['Gallery Details', 'Pricing', 'Select Images'][currentStep - 1]}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className={`w-full h-2 rounded-full mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {error && (
              <div className={`p-4 rounded-xl border backdrop-blur-sm flex items-center gap-3 animate-in slide-in-from-top-2 mb-6 ${
                isDarkMode 
                  ? 'bg-red-900/30 border-red-800/50 text-red-400' 
                  : 'bg-red-50/80 border-red-200 text-red-700'
              }`}>
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 scrollbar-thin scrollbar-thumb-purple-500/50 hover:scrollbar-thumb-purple-500 scrollbar-track-transparent">
              {/* Step 1: Gallery Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-8">
                    <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-bounce" />
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Let's start with the basics
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Give your gallery a name and description that captures its essence
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Gallery Name <span className="text-purple-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-6 py-4 border-2 rounded-2xl bg-transparent backdrop-blur-sm text-lg ${
                          isDarkMode 
                            ? 'text-white placeholder-gray-400 bg-gray-800/30 border-gray-700 focus:bg-gray-800/50' 
                            : 'text-gray-900 placeholder-gray-500 bg-white/30 border-gray-200 focus:bg-white/50'
                        } ${
                          !formValidation.name.valid ? 'border-red-500' : 'focus:border-purple-500'
                        } transition-all duration-300 focus:ring-4 focus:ring-purple-500/20 outline-none`}
                        placeholder="Enter a captivating gallery name"
                      />
                      {!formValidation.name.valid && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {formValidation.name.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Description <span className="text-purple-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={`w-full px-6 py-4 border-2 rounded-2xl bg-transparent backdrop-blur-sm text-lg resize-none ${
                          isDarkMode 
                            ? 'text-white placeholder-gray-400 bg-gray-800/30 border-gray-700 focus:bg-gray-800/50' 
                            : 'text-gray-900 placeholder-gray-500 bg-white/30 border-gray-200 focus:bg-white/50'
                        } ${
                          !formValidation.description.valid ? 'border-red-500' : 'focus:border-purple-500'
                        } transition-all duration-300 focus:ring-4 focus:ring-purple-500/20 outline-none`}
                        rows="4"
                        placeholder="Describe what makes this gallery special..."
                      />
                      {!formValidation.description.valid && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {formValidation.description.message}
                        </p>
                      )}
                      <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formData.description.length}/500 characters
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-3 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Base Currency
                      </label>
                      <select
                        name="baseCurrency"
                        value={formData.baseCurrency}
                        onChange={handleChange}
                        className={`w-full px-6 py-4 border-2 rounded-2xl bg-transparent backdrop-blur-sm text-lg ${
                          isDarkMode 
                            ? 'text-white bg-gray-800/30 border-gray-700 focus:bg-gray-800/50' 
                            : 'text-gray-900 bg-white/30 border-gray-200 focus:bg-white/50'
                        } transition-all duration-300 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none`}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Subscription Options */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">$</span>
                    </div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Set your pricing
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Configure subscription options for your gallery
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Subscription Plans
                    </h3>
                    <button
                      type="button"
                      onClick={addSubscriptionOption}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Plan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.subscriptionOptions.map((option, index) => (
                      <div 
                        key={option.id || index}
                        className={`p-6 rounded-2xl border-2 backdrop-blur-sm relative transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-800/50 border-gray-700' 
                            : 'bg-white/50 border-gray-200'
                        } ${
                          option.isActive 
                            ? 'ring-2 ring-purple-500/50 scale-105' 
                            : 'hover:scale-102'
                        }`}
                      >
                        {formData.subscriptionOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubscriptionOption(index)}
                            className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        <div className="space-y-4">
                          <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.99"
                              max="999.99"
                              value={option.price}
                              onChange={(e) => updateSubscriptionOption(index, { 
                                price: parseFloat(e.target.value) || 0 
                              })}
                              className={`w-full pl-12 pr-4 py-4 text-2xl font-bold border rounded-xl bg-transparent ${
                                isDarkMode 
                                  ? 'text-white border-gray-700 bg-gray-800/30' 
                                  : 'text-gray-900 border-gray-300 bg-white/30'
                              }`}
                              placeholder="0.00"
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <input
                                type="number"
                                min="1"
                                max="365"
                                value={option.duration}
                                onChange={(e) => updateSubscriptionOption(index, {
                                  duration: parseInt(e.target.value) || 1,
                                })}
                                className={`w-full px-4 py-3 text-lg border rounded-xl bg-transparent ${
                                  isDarkMode 
                                    ? 'text-white border-gray-700 bg-gray-800/30' 
                                    : 'text-gray-900 border-gray-300 bg-white/30'
                                }`}
                                placeholder="Duration in days"
                              />
                            </div>
                            <span className={`whitespace-nowrap text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Days
                            </span>
                          </div>

                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {option.label}
                          </div>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={option.isActive}
                              onChange={(e) => updateSubscriptionOption(index, { isActive: e.target.checked })}
                              className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                            <span className={`font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Active Plan
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Image Selection */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-8">
                    <ImageIcon className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Choose your images
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select the images that will showcase in your gallery
                    </p>
                  </div>
                  {/* Search and selection controls */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search images..."
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl bg-transparent backdrop-blur-sm ${
                          isDarkMode 
                            ? 'text-white placeholder-gray-400 bg-gray-800/30 border-gray-700 focus:bg-gray-800/50' 
                            : 'text-gray-900 placeholder-gray-500 bg-white/30 border-gray-200 focus:bg-white/50'
                        } transition-all duration-300 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none`}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllVisibleImages}
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm font-medium whitespace-nowrap"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllSelections}
                        className={`px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium whitespace-nowrap ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Selected count */}
                  <div className={`text-center py-3 px-6 rounded-xl ${
                    isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                  } mb-6`}>
                    <span className="font-medium">
                      {formData.imageIds.length} image{formData.imageIds.length !== 1 ? 's' : ''} selected
                    </span>
                    {formData.imageIds.length > 0 && (
                      <span className="text-sm opacity-75 ml-2">
                        • Ready to create gallery
                      </span>
                    )}
                  </div>

                  {/* Loading state */}
                  {loadingImages ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                      <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Loading your images...
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                        This might take a moment
                      </p>
                    </div>
                  ) : filteredImages.length === 0 ? (
                    <div className="text-center py-12">
                      <Upload className={`w-16 h-16 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <h3 className={`text-xl font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {searchTerm ? 'No images found' : 'No images available'}
                      </h3>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                        {searchTerm 
                          ? 'Try adjusting your search terms' 
                          : 'Upload some images first to create a gallery'
                        }
                      </p>
                      {!searchTerm && (
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard/upload')}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium"
                        >
                          Upload Images
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Image grid */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {filteredImages.map((image) => {
                        const isSelected = formData.imageIds.includes(image.id);
                        const hasError = imageLoadErrors[image.id];
                        
                        return (
                          <div
                            key={image.id}
                            onClick={() => !hasError && toggleImageSelection(image.id)}
                            className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              isSelected 
                                ? 'ring-4 ring-purple-500 scale-105 shadow-2xl' 
                                : 'hover:shadow-xl'
                            } ${hasError ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {hasError ? (
                              <div className={`w-full h-full flex items-center justify-center ${
                                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                              }`}>
                                <AlertCircle className={`w-8 h-8 ${
                                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                                }`} />
                              </div>
                            ) : (
                              <img
                                src={image.url}
                                alt={image.title}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(image.id)}
                                loading="lazy"
                              />
                            )}
                            
                            {/* Selection overlay */}
                            <div className={`absolute inset-0 transition-all duration-300 ${
                              isSelected 
                                ? 'bg-purple-500/30 backdrop-blur-sm' 
                                : 'bg-black/0 hover:bg-black/20'
                            }`}>
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-in zoom-in-75">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            
                            {/* Image info */}
                            <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent ${
                              isSelected ? 'translate-y-0' : 'translate-y-full hover:translate-y-0'
                            } transition-transform duration-300`}>
                              <p className="text-white text-sm font-medium truncate">
                                {image.title}
                              </p>
                              <p className="text-white/75 text-xs">
                                {image.category}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                 
                  {!formValidation.images.valid && (
                    <div className={`p-4 rounded-xl border backdrop-blur-sm flex items-center gap-3 mt-6 ${
                      isDarkMode 
                        ? 'bg-red-900/30 border-red-800/50 text-red-400' 
                        : 'bg-red-50/80 border-red-200 text-red-700'
                    }`}>
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{formValidation.images.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className={`p-4 sm:p-6 md:p-8 pt-2 sm:pt-3 md:pt-4 border-t backdrop-blur-sm flex-shrink-0 ${
              isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid}
                      className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        isStepValid
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !isStepValid}
                      className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 relative overflow-hidden ${
                        loading || !isStepValid
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Creating Gallery...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Create Gallery</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Loading progress bar */}
              {loading && (
                <div className="mt-4">
                  <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <p className={`text-sm mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Creating your gallery... {Math.round(loadingProgress)}%
                  </p>
                </div>
              )}

              {/* Step indicator dots */}
              <div className="flex justify-center mt-6 gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step === currentStep
                        ? 'bg-purple-500 scale-125'
                        : step < currentStep
                        ? 'bg-green-500'
                        : isDarkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGalleryModal;