import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { galleryService } from '../../services/galleryService';
import { 
  Search, Plus, X, ImageIcon, Check, AlertCircle, Upload, Sparkles, 
  Star, Zap, Settings, ChevronLeft, ChevronRight, Grid, List, 
  Eye, Heart, Info, DollarSign, Calendar, Package, ArrowLeft, ArrowRight
} from 'lucide-react';
import { useMessage } from '../../hooks/useMessage';

// Enhanced utility functions
const calculateAveragePerDay = (price, duration) => {
  if (!price || !duration) return 0;
  return price / duration;
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const CreateGalleryModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { addMessage } = useMessage();
  
  // Enhanced state management
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableImages, setAvailableImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Enhanced form data structure
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
        label: 'Monthly Access - $9.99',
        isActive: true,
        description: 'Perfect for regular viewers'
      }
    ],
    tags: [],
    isPublic: true,
    allowDownloads: false
  });
  
  // Enhanced validation state
  const [formValidation, setFormValidation] = useState({
    name: { valid: true, message: '' },
    description: { valid: true, message: '' },
    images: { valid: true, message: '' },
    subscriptionOptions: { valid: true, message: '' }
  });

  // Step configuration for better navigation
  const steps = [
    {
      id: 1,
      title: 'Gallery Details',
      description: 'Basic information about your gallery',
      icon: Info,
      color: 'purple'
    },
    {
      id: 2,
      title: 'Pricing Plans',
      description: 'Set up subscription options',
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 3,
      title: 'Select Images',
      description: 'Choose images for your gallery',
      icon: ImageIcon,
      color: 'blue'
    }
  ];

  // Get unique categories from images
  const imageCategories = useMemo(() => {
    const categories = ['all', ...new Set(availableImages.map(img => img.category).filter(Boolean))];
    return categories;
  }, [availableImages]);

  // Enhanced reset form function
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
          label: 'Monthly Access - $9.99',
          isActive: true,
          description: 'Perfect for regular viewers'
        }
      ],
      tags: [],
      isPublic: true,
      allowDownloads: false
    });
    setFormValidation({
      name: { valid: true, message: '' },
      description: { valid: true, message: '' },
      images: { valid: true, message: '' },
      subscriptionOptions: { valid: true, message: '' }
    });
    setSearchTerm('');
    setImageLoadErrors({});
    setSelectedCategory('all');
    setViewMode('grid');
    setPreviewMode(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Enhanced image fetching
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
          category: img.category || 'Art',
          size: img.size || null,
          dimensions: img.dimensions || null,
          uploadDate: img.uploadDate || new Date().toISOString()
        })).filter(img => img.url);

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

  // Enhanced step validation
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length >= 3 && 
               formData.description.trim().length >= 10 &&
               formData.name.trim().length <= 100 &&
               formData.description.trim().length <= 500;
      case 2:
        const activeOptions = formData.subscriptionOptions.filter(opt => opt.isActive);
        return activeOptions.length > 0 && 
               activeOptions.every(opt => 
                 opt.duration > 0 && 
                 opt.price >= 0.99 && 
                 opt.price <= 999.99 &&
                 opt.label && 
                 opt.label.trim().length > 0
               );
      case 3:
        return formData.imageIds.length > 0 && formData.imageIds.length <= 100;
      default:
        return false;
    }
  }, [currentStep, formData]);

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const newValidation = {
      name: { valid: true, message: '' },
      description: { valid: true, message: '' },
      images: { valid: true, message: '' },
      subscriptionOptions: { valid: true, message: '' }
    };
    
    // Enhanced name validation
    if (formData.name.trim().length === 0) {
      newValidation.name = { valid: false, message: 'Gallery name is required' };
    } else if (formData.name.trim().length < 3) {
      newValidation.name = { valid: false, message: 'Gallery name must be at least 3 characters' };
    } else if (formData.name.trim().length > 100) {
      newValidation.name = { valid: false, message: 'Gallery name too long (max 100 characters)' };
    } else if (!/^[a-zA-Z0-9\s\-_,.!?]+$/.test(formData.name.trim())) {
      newValidation.name = { valid: false, message: 'Gallery name contains invalid characters' };
    }

    // Enhanced description validation
    if (formData.description.trim().length === 0) {
      newValidation.description = { valid: false, message: 'Description is required' };
    } else if (formData.description.trim().length < 10) {
      newValidation.description = { valid: false, message: 'Description must be at least 10 characters' };
    } else if (formData.description.trim().length > 500) {
      newValidation.description = { valid: false, message: `Description too long (${formData.description.length}/500 characters)` };
    }
    
    // Enhanced image validation
    if (formData.imageIds.length === 0) {
      newValidation.images = { valid: false, message: 'Please select at least one image' };
    } else if (formData.imageIds.length > 100) {
      newValidation.images = { valid: false, message: 'Maximum of 100 images allowed' };
    }

    // Enhanced subscription validation
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
               isNaN(duration) || duration < 1 || duration > 365;
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

  // Enhanced image filtering
  const filteredImages = useMemo(() => {
    let filtered = availableImages;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(image => image.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(image =>
        (image.title || '').toLowerCase().includes(term) ||
        (image.category || '').toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [availableImages, searchTerm, selectedCategory]);

  // Enhanced form handlers
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear validation errors for the field
    setFormValidation(prev => ({
      ...prev,
      [name]: { valid: true, message: '' }
    }));
  }, []);

  // Enhanced image selection
  const toggleImageSelection = useCallback((imageId) => {
    setFormData(prev => {
      const newImageIds = prev.imageIds.includes(imageId)
        ? prev.imageIds.filter(id => id !== imageId)
        : [...prev.imageIds, imageId];
      
      return { ...prev, imageIds: newImageIds };
    });
  }, []);

  const selectAllVisibleImages = useCallback(() => {
    const visibleImageIds = filteredImages.map(img => img.id);
    setFormData(prev => ({
      ...prev,
      imageIds: [...new Set([...prev.imageIds, ...visibleImageIds])]
    }));
  }, [filteredImages]);

  const clearAllSelections = useCallback(() => {
    setFormData(prev => ({ ...prev, imageIds: [] }));
  }, []);

  // Enhanced subscription management
  const generateSubscriptionLabel = useCallback((duration, price, description = '') => {
    if (!duration || !price) return 'Invalid subscription';
    const formattedPrice = formatCurrency(price, formData.baseCurrency);
    const periodText = duration === 1 ? 'day' : 
                      duration === 7 ? 'week' : 
                      duration === 30 ? 'month' : 
                      duration === 365 ? 'year' : `${duration} days`;
    
    return `${formattedPrice} for ${duration === 1 ? '1' : duration === 7 ? '1' : duration === 30 ? '1' : duration === 365 ? '1' : duration} ${periodText}${description ? ` - ${description}` : ''}`;
  }, [formData.baseCurrency]);

  const updateSubscriptionOption = useCallback((index, updates) => {
    setFormData(prev => {
      const updatedOptions = [...prev.subscriptionOptions];
      const currentOption = { ...updatedOptions[index] };
      
      const newUpdates = {
        ...updates,
        isActive: 'isActive' in updates ? updates.isActive : currentOption.isActive
      };
      
      // Auto-update label when price or duration changes
      if ('price' in updates || 'duration' in updates) {
        const updatedOption = { ...currentOption, ...newUpdates };
        newUpdates.label = generateSubscriptionLabel(
          updates.duration || currentOption.duration,
          updates.price || currentOption.price,
          updates.description || currentOption.description
        );
      }
      
      updatedOptions[index] = { ...currentOption, ...newUpdates };
      
      return { ...prev, subscriptionOptions: updatedOptions };
    });
  }, [generateSubscriptionLabel]);

  const addSubscriptionOption = useCallback(() => {
    const newOption = {
      id: `custom-${Date.now()}`,
      duration: 30,
      price: 9.99,
      label: 'Monthly Access - $9.99',
      description: 'Custom plan',
      isActive: true
    };
    
    setFormData(prev => ({
      ...prev,
      subscriptionOptions: [...prev.subscriptionOptions, newOption]
    }));
  }, []);

  const removeSubscriptionOption = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      subscriptionOptions: prev.subscriptionOptions.filter((_, i) => i !== index)
    }));
  }, []);

  // Enhanced form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formattedSubscriptions = formData.subscriptionOptions
        .filter(opt => opt.isActive)
        .map(opt => ({
          duration: parseInt(opt.duration),
          price: parseFloat(opt.price),
          label: opt.label,
          description: opt.description || '',
          isActive: true
        }));
      
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageIds: formData.imageIds,
        baseCurrency: formData.baseCurrency,
        subscriptionOptions: formattedSubscriptions,
        tags: formData.tags,
        isPublic: formData.isPublic,
        allowDownloads: formData.allowDownloads
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

  // Loading progress effect
  useEffect(() => {
    if (!loading) return;
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 8, 95));
    }, 400);

    return () => {
      clearInterval(interval);
      setLoadingProgress(0);
    };
  }, [loading]);

  // Handle image load errors
  const handleImageError = useCallback((imageId) => {
    setImageLoadErrors(prev => ({ ...prev, [imageId]: true }));
  }, []);

  // Enhanced step navigation
  const nextStep = () => {
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const goToStep = (step) => {
    if (step <= currentStep || (step === currentStep + 1 && isStepValid)) {
      setCurrentStep(step);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className={`w-full max-w-6xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[95vh] flex flex-col text-left transition-all transform ${
        isDarkMode ? 'bg-gray-900/98' : 'bg-white/98'
      } backdrop-blur-xl rounded-2xl shadow-2xl relative overflow-hidden border ${
        isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
      }`}>
        
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-blue-500/2 to-green-500/3 pointer-events-none" />
        
        {/* Enhanced header */}
        <div className={`relative px-6 py-4 border-b backdrop-blur-sm ${
          isDarkMode ? 'border-gray-800/50 bg-gray-900/50' : 'border-gray-200/50 bg-white/50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                  {(() => {
                    const IconComponent = steps[currentStep - 1].icon;
                    return <IconComponent className="w-6 h-6 text-white" />;
                  })()}
                 </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create New Gallery
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {steps[currentStep - 1].description}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white' 
                  : 'bg-gray-100/50 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Enhanced step indicator */}
          <div className="flex items-center justify-center mt-4 gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    currentStep === step.id
                      ? `bg-${step.color}-500 text-white shadow-lg`
                      : currentStep > step.id
                      ? `bg-green-500 text-white`
                      : isDarkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${
                    step.id <= currentStep || (step.id === currentStep + 1 && isStepValid)
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={step.id > currentStep && !(step.id === currentStep + 1 && isStepValid)}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                  <span className="sm:hidden text-sm font-medium">{step.id}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className={`w-4 h-4 mx-2 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border backdrop-blur-sm flex items-start gap-3 animate-in slide-in-from-top-2 ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800/30 text-red-400' 
              : 'bg-red-50/80 border-red-200 text-red-700'
          }`}>
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto p-1 hover:bg-red-500/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            {/* Step 1: Enhanced Gallery Details */}
            {currentStep === 1 && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Info className="w-10 h-10 text-white" />
                  </div>
                  <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Gallery Information
                  </h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                    Let's start with the essential details about your gallery
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Gallery Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-xl bg-transparent backdrop-blur-sm text-lg transition-all duration-300 ${
                        isDarkMode 
                          ? 'text-white placeholder-gray-400 bg-gray-800/20 border-gray-700 focus:bg-gray-800/40' 
                          : 'text-gray-900 placeholder-gray-500 bg-white/20 border-gray-300 focus:bg-white/40'
                      } ${
                        !formValidation.name.valid ? 'border-red-500 focus:border-red-500' : 'focus:border-purple-500'
                      } focus:ring-4 focus:ring-purple-500/10 outline-none`}
                      placeholder="Enter an engaging gallery name..."
                      maxLength={100}
                    />
                    <div className="flex justify-between items-center mt-2">
                      {!formValidation.name.valid ? (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {formValidation.name.message}
                        </p>
                      ) : (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Choose a memorable name that captures your gallery's essence
                        </p>
                      )}
                      <span className={`text-sm ${
                        formData.name.length > 80 ? 'text-orange-500' : 
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formData.name.length}/100
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-xl bg-transparent backdrop-blur-sm text-lg resize-none transition-all duration-300 ${
                        isDarkMode 
                          ? 'text-white placeholder-gray-400 bg-gray-800/20 border-gray-700 focus:bg-gray-800/40' 
                          : 'text-gray-900 placeholder-gray-500 bg-white/20 border-gray-300 focus:bg-white/40'
                      } ${
                        !formValidation.description.valid ? 'border-red-500 focus:border-red-500' : 'focus:border-purple-500'
                      } focus:ring-4 focus:ring-purple-500/10 outline-none`}
                      rows="4"
                      placeholder="Describe what makes this gallery special, its theme, or the story behind it..."
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      {!formValidation.description.valid ? (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {formValidation.description.message}
                        </p>
                      ) : (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Help viewers understand what they'll find in your gallery
                        </p>
                      )}
                      <span className={`text-sm ${
                        formData.description.length > 450 ? 'text-orange-500' : 
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formData.description.length}/500
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Base Currency
                    </label>
                    <select
                      name="baseCurrency"
                      value={formData.baseCurrency}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 border-2 rounded-xl bg-transparent backdrop-blur-sm text-lg transition-all duration-300 ${
                        isDarkMode 
                          ? 'text-white bg-gray-800/20 border-gray-700 focus:bg-gray-800/40' 
                          : 'text-gray-900 bg-white/20 border-gray-300 focus:bg-white/40'
                      } focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none`}
                    >
                      <option value="USD">🇺🇸 USD - US Dollar</option>
                      <option value="EUR">🇪🇺 EUR - Euro</option>
                      <option value="GBP">🇬🇧 GBP - British Pound</option>
                      <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                      <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                      <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Gallery Settings
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPublic"
                          checked={formData.isPublic}
                          onChange={handleChange}
                          className="w-5 h-5 text-purple-600 bg-transparent border-2 border-gray-400 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Public Gallery
                          </span>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Allow others to discover your gallery
                          </p>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="allowDownloads"
                          checked={formData.allowDownloads}
                          onChange={handleChange}
                          className="w-5 h-5 text-purple-600 bg-transparent border-2 border-gray-400 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Allow Downloads
                          </span>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Let subscribers download images
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Enhanced Pricing Plans */}
            {currentStep === 2 && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <DollarSign className="w-10 h-10 text-white" />
                  </div>
                  <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Subscription Plans
                  </h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                    Set up pricing options for your gallery subscribers
                  </p>
                </div>

                <div className="space-y-6">
                  {formData.subscriptionOptions.map((option, index) => (
                    <div key={option.id} className={`p-6 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 ${
                      option.isActive 
                        ? isDarkMode 
                          ? 'border-green-500/50 bg-green-900/10' 
                          : 'border-green-500/50 bg-green-50/50'
                        : isDarkMode 
                          ? 'border-gray-700/50 bg-gray-800/10' 
                          : 'border-gray-300/50 bg-gray-50/50'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={option.isActive}
                              onChange={(e) => updateSubscriptionOption(index, { isActive: e.target.checked })}
                              className="w-5 h-5 text-green-600 bg-transparent border-2 border-gray-400 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Plan {index + 1}
                            </span>
                          </label>
                          {option.isActive && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-medium">
                              <Check className="w-3 h-3" />
                              Active
                            </div>
                          )}
                        </div>
                        
                        {formData.subscriptionOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubscriptionOption(index)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Duration (days)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={option.duration}
                            onChange={(e) => updateSubscriptionOption(index, { duration: parseInt(e.target.value) || 1 })}
                            className={`w-full px-4 py-3 border rounded-lg bg-transparent backdrop-blur-sm transition-all ${
                              isDarkMode 
                                ? 'text-white border-gray-600 focus:border-green-500 bg-gray-800/20' 
                                : 'text-gray-900 border-gray-300 focus:border-green-500 bg-white/20'
                            } focus:ring-2 focus:ring-green-500/20 outline-none`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Price ({formData.baseCurrency})
                          </label>
                          <input
                            type="number"
                            min="0.99"
                            max="999.99"
                            step="0.01"
                            value={option.price}
                            onChange={(e) => updateSubscriptionOption(index, { price: parseFloat(e.target.value) || 0.99 })}
                            className={`w-full px-4 py-3 border rounded-lg bg-transparent backdrop-blur-sm transition-all ${
                              isDarkMode 
                                ? 'text-white border-gray-600 focus:border-green-500 bg-gray-800/20' 
                                : 'text-gray-900 border-gray-300 focus:border-green-500 bg-white/20'
                            } focus:ring-2 focus:ring-green-500/20 outline-none`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Avg. per day
                          </label>
                          <div className={`px-4 py-3 rounded-lg border ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-800/20 text-gray-400' 
                              : 'border-gray-300 bg-gray-50/50 text-gray-600'
                          }`}>
                            {formatCurrency(calculateAveragePerDay(option.price, option.duration), formData.baseCurrency)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={option.description || ''}
                          onChange={(e) => updateSubscriptionOption(index, { description: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-lg bg-transparent backdrop-blur-sm transition-all ${
                            isDarkMode 
                              ? 'text-white border-gray-600 focus:border-green-500 bg-gray-800/20' 
                              : 'text-gray-900 border-gray-300 focus:border-green-500 bg-white/20'
                          } focus:ring-2 focus:ring-green-500/20 outline-none`}
                          placeholder="e.g., Perfect for regular viewers, Best value, Premium access..."
                        />
                      </div>

                      <div className={`mt-4 p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-800/30' : 'bg-gray-100/50'
                      }`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Generated Label:
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {option.label}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addSubscriptionOption}
                    className={`w-full p-4 border-2 border-dashed rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400 hover:bg-green-900/10' 
                        : 'border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50/50'
                    }`}
                  >
                    <Plus className="w-5 h-5 mx-auto mb-2" />
                    Add Another Subscription Plan
                  </button>
                </div>

                {!formValidation.subscriptionOptions.valid && (
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-red-900/20 border-red-800/30 text-red-400' 
                      : 'bg-red-50/80 border-red-200 text-red-700'
                  }`}>
                    <p className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {formValidation.subscriptionOptions.message}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Enhanced Image Selection */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <ImageIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Select Images
                  </h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                    Choose the images you want to include in this gallery
                  </p>
                </div>

                {/* Enhanced controls */}
                <div className={`p-4 rounded-xl backdrop-blur-sm border ${
                  isDarkMode ? 'bg-gray-800/20 border-gray-700/50' : 'bg-white/20 border-gray-200/50'
                }`}>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                      <div className="relative flex-1 min-w-0">
                        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg bg-transparent backdrop-blur-sm transition-all ${
                            isDarkMode 
                              ? 'text-white placeholder-gray-400 border-gray-600 focus:border-blue-500 bg-gray-800/20' 
                              : 'text-gray-900 placeholder-gray-500 border-gray-300 focus:border-blue-500 bg-white/20'
                          } focus:ring-2 focus:ring-blue-500/20 outline-none`}
                          placeholder="Search images by title or category..."
                        />
                      </div>
                      
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`px-4 py-3 border rounded-lg bg-transparent backdrop-blur-sm transition-all ${
                          isDarkMode 
                            ? 'text-white border-gray-600 focus:border-blue-500 bg-gray-800/20' 
                            : 'text-gray-900 border-gray-300 focus:border-blue-500 bg-white/20'
                        } focus:ring-2 focus:ring-blue-500/20 outline-none`}
                      >
                        {imageCategories.map(category => (
                          <option key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className={`p-3 rounded-lg transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                      </button>
                      
                      <button
                        type="button"
                        onClick={selectAllVisibleImages}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        Select All
                      </button>
                      
                      <button
                        type="button"
                        onClick={clearAllSelections}
                        className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formData.imageIds.length} of {filteredImages.length} selected
                      {searchTerm && ` (filtered from ${availableImages.length} total)`}
                    </p>
                    <div className={`text-sm ${
                      formData.imageIds.length > 100 
                        ? 'text-red-500' 
                        : formData.imageIds.length > 80 
                        ? 'text-orange-500' 
                        : 'text-green-500'
                    }`}>
                      Max: 100 images
                    </div>
                  </div>
                </div>

                {/* Loading state */}
                {loadingImages ? (
                  <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading your images...</p>
                  </div>
                ) : filteredImages.length === 0 ? (
                  <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium mb-2">No images found</p>
                    <p>
                      {searchTerm || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filter criteria' 
                        : 'Upload some images first to create a gallery'
                      }
                    </p>
                  </div>
                ) : (
                  /* Image grid/list */
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4' 
                      : 'space-y-3'
                  }`}>
                    {filteredImages.map((image) => {
                      const isSelected = formData.imageIds.includes(image.id);
                      const hasError = imageLoadErrors[image.id];
                      
                      return (
                        <div
                          key={image.id}
                          onClick={() => toggleImageSelection(image.id)}
                          className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                            viewMode === 'grid' 
                              ? 'aspect-square rounded-xl overflow-hidden' 
                              : 'flex gap-4 p-3 rounded-xl'
                          } ${
                            isSelected 
                              ? 'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/25' 
                              : isDarkMode 
                              ? 'hover:bg-gray-800/50' 
                              : 'hover:bg-gray-100/50'
                          }`}
                        >
                          {viewMode === 'grid' ? (
                            <>
                              {!hasError ? (
                                <img
                                  src={image.url}
                                  alt={image.title}
                                  className="w-full h-full object-cover"
                                  onError={() => handleImageError(image.id)}
                                />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center ${
                                  isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <AlertCircle className="w-8 h-8" />
                                </div>
                              )}
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              
                              <div className="absolute top-2 right-2">
                                {isSelected && (
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-white text-sm font-medium truncate">
                                  {image.title}
                                </p>
                                <p className="text-white/80 text-xs">
                                  {image.category}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                                {!hasError ? (
                                  <img
                                    src={image.url}
                                    alt={image.title}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImageError(image.id)}
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${
                                    isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    <AlertCircle className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className={`font-medium truncate ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {image.title}
                                  </h3>
                                  {isSelected && (
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {image.category}
                                </p>
                                {image.uploadDate && (
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {new Date(image.uploadDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!formValidation.images.valid && (
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-red-900/20 border-red-800/30 text-red-400' 
                      : 'bg-red-50/80 border-red-200 text-red-700'
                  }`}>
                    <p className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {formValidation.images.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced footer with navigation */}
          <div className={`px-6 py-4 border-t backdrop-blur-sm ${
            isDarkMode ? 'border-gray-800/50 bg-gray-900/50' : 'border-gray-200/50 bg-white/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      isStepValid
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                        : isDarkMode
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isStepValid}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
                      loading || !isStepValid
                        ? isDarkMode
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Creating Gallery...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Create Gallery
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Progress indicator */}
            {loading && (
              <div className="mt-4">
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className={`text-sm mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {loadingProgress < 30 ? 'Processing gallery details...' :
                   loadingProgress < 60 ? 'Setting up subscription plans...' :
                   loadingProgress < 90 ? 'Organizing images...' :
                   'Finalizing gallery...'}
                </p>
              </div>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#6b7280' : '#d1d5db'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#9ca3af' : '#9ca3af'};
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateX(16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateGalleryModal;