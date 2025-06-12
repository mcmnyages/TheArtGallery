import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { galleryService } from '../../services/galleryService';
import { Search, Plus, X, Loader2, Info, Eye, EyeOff, Grid, List, Save, Undo2, CheckCircle, AlertCircle, Sparkles, Image as ImageIcon, DollarSign, Calendar, Users } from 'lucide-react';
import { useMessage } from '../../hooks/useMessage';

const EditGalleryModal = ({ isOpen, onClose, galleryId, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const { addMessage } = useMessage();
  const [gallery, setGallery] = useState(null);
  const [galleryName, setGalleryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableImages, setAvailableImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [originalSubscriptionOptions, setOriginalSubscriptionOptions] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [originalImageIds, setOriginalImageIds] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'subscriptions'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const searchInputRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape' && !processing) {
        onClose();
      } else if (e.key === '/' && e.ctrlKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        if (hasUnsavedChanges && !processing) {
          handleSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, processing, hasUnsavedChanges]);

  // Track changes
  useEffect(() => {
    if (!gallery) return;
    
    const hasNameChanged = galleryName !== gallery.name;
    const hasImageChanges = selectedImages.size !== originalImageIds.size || 
      [...selectedImages].some(id => !originalImageIds.has(id));
    const hasSubscriptionChanges = JSON.stringify(subscriptionOptions) !== 
      JSON.stringify(originalSubscriptionOptions);
    
    setHasUnsavedChanges(hasNameChanged || hasImageChanges || hasSubscriptionChanges);
  }, [galleryName, selectedImages, subscriptionOptions, gallery, originalImageIds, originalSubscriptionOptions]);

  // Generate subscription label
  const generateSubscriptionLabel = useCallback((durationType, duration, price) => {
    if (!duration || !price) return 'Invalid subscription';
    
    const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;
    
    const durationMap = {
      weekly: `${formatPrice(price)} / Week`,
      monthly: `${formatPrice(price)} / Month`,
      quarterly: `${formatPrice(price)} / Quarter`,
      yearly: `${formatPrice(price)} / Year`
    };

    return durationMap[durationType] || `${formatPrice(price)} for ${duration} days`;
  }, []);

  // Subscription handlers
  const subscriptionHandlers = {
    update: (index, updates) => {
      setSubscriptionOptions(prev => {
        const updatedOptions = [...prev];
        const currentOption = { ...updatedOptions[index] };
        const newUpdates = {
          ...updates,
          isActive: 'isActive' in updates ? updates.isActive : currentOption.isActive
        };
        
        if ('price' in updates || 'durationType' in updates || 'duration' in updates) {
          newUpdates.label = generateSubscriptionLabel(
            updates.durationType || currentOption.durationType,
            updates.duration || currentOption.duration,
            updates.price || currentOption.price
          );
        }
        
        updatedOptions[index] = {
          ...currentOption,
          ...newUpdates
        };
        
        return updatedOptions;
      });
    },

    add: () => {
      const newOption = {
        id: `custom-${Date.now()}`,
        duration: 30,
        durationType: 'monthly',
        price: 9.99,
        label: '$9.99 / Month',
        isActive: true
      };
      setSubscriptionOptions(prev => [...prev, newOption]);
    },

    remove: (index) => {
      setSubscriptionOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Toggle image selection with memoization
  const toggleImageSelection = useCallback((id) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Bulk selection handlers
  const selectAllVisible = () => {
    const visibleIds = filteredImages.map(img => img.id);
    setSelectedImages(prev => new Set([...prev, ...visibleIds]));
  };

  const deselectAllVisible = () => {
    const visibleIds = new Set(filteredImages.map(img => img.id));
    setSelectedImages(prev => new Set([...prev].filter(id => !visibleIds.has(id))));
  };

  const resetToOriginal = () => {
    setSelectedImages(new Set(originalImageIds));
    setGalleryName(gallery?.name || '');
    setSubscriptionOptions([...originalSubscriptionOptions]);
  };

  // Fetch gallery and images
  useEffect(() => {
    const fetchGalleryAndImages = async () => {
      if (!isOpen || !galleryId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const [fetchedGallery, images] = await Promise.all([
          galleryService.fetchGalleryGroupById(galleryId),
          galleryService.getArtistImages()
        ]);
        
        if (!fetchedGallery) {
          throw new Error('Gallery not found');
        }

        setGallery(fetchedGallery);
        setGalleryName(fetchedGallery.name);
        
        // Set image selections
        const initialImageIds = new Set(fetchedGallery.images.map(img => img._id));
        setOriginalImageIds(initialImageIds);
        setSelectedImages(initialImageIds);
        
        // Set subscription options
        if (fetchedGallery.subscriptionOptions) {
          const formattedOptions = fetchedGallery.subscriptionOptions.map(opt => ({
            ...opt,
            durationType: opt.duration === 7 ? 'weekly' :
                         opt.duration === 30 ? 'monthly' :
                         opt.duration === 90 ? 'quarterly' :
                         opt.duration === 365 ? 'yearly' : 'custom',
            label: generateSubscriptionLabel(
              opt.duration === 7 ? 'weekly' :
              opt.duration === 30 ? 'monthly' :
              opt.duration === 90 ? 'quarterly' :
              opt.duration === 365 ? 'yearly' : 'custom',
              opt.duration,
              opt.price
            )
          }));
          
          setSubscriptionOptions(formattedOptions);
          setOriginalSubscriptionOptions(fetchedGallery.subscriptionOptions);
        }

        // Set available images
        const availableImgs = (images || []).map(img => ({
          id: img._id,
          url: img.imageUrl,
          title: img.title || 'Untitled Image',
          alt: img.description || 'Gallery image'
        }));
        
        setAvailableImages(availableImgs);
        
        if (availableImgs.length === 0) {
          addMessage({ text: 'No images available to add to gallery', type: 'warning' });
        }
      } catch (err) {
        console.error('Failed to fetch gallery or images:', err);
        const errorMsg = err.message || 'Failed to load gallery and images';
        setError(errorMsg);
        addMessage({ text: errorMsg, type: 'error' });
        onClose();
      } finally {
        setLoading(false);
        setLoadingImages(false);
      }
    };

    fetchGalleryAndImages();
  }, [galleryId, isOpen, generateSubscriptionLabel, addMessage, onClose]);

  // Filter images based on search term and selection filter
  const filteredImages = availableImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !showOnlySelected || selectedImages.has(image.id);
    return matchesSearch && matchesFilter;
  });

  // Handle save operation
  const handleSave = async () => {
    try {
      setProcessing(true);
      setError('');

      // Determine changes
      const imagesToAdd = Array.from(selectedImages).filter(id => !originalImageIds.has(id));
      const imagesToRemove = Array.from(originalImageIds).filter(id => !selectedImages.has(id));
      const hasNameChanged = galleryName !== gallery.name;
      
      const formattedSubscriptions = subscriptionOptions.map(opt => ({
        duration: parseInt(opt.duration),
        price: parseFloat(opt.price),
        label: opt.label,
        isActive: opt.isActive
      }));
      
      const hasSubscriptionChanges = JSON.stringify(formattedSubscriptions) !== 
                                  JSON.stringify(originalSubscriptionOptions);

      // Validate at least one active subscription
      const hasActiveSubscription = subscriptionOptions.some(opt => opt.isActive);
      if (!hasActiveSubscription) {
        throw new Error('At least one subscription plan must be active');
      }

      // Check for changes
      if (!hasNameChanged && imagesToAdd.length === 0 && 
          imagesToRemove.length === 0 && !hasSubscriptionChanges) {
        addMessage({ text: 'No changes to save', type: 'info' });
        onClose();
        return;
      }

      // Update gallery metadata if changed
      if (hasNameChanged || hasSubscriptionChanges) {
        const updateData = {
          ...(hasNameChanged && { name: galleryName }),
          ...(hasSubscriptionChanges && { subscriptionOptions: formattedSubscriptions })
        };
        await galleryService.updateGalleryGroup(galleryId, updateData);
      }

      // Add new images
      if (imagesToAdd.length > 0) {
        await galleryService.addImagesToGalleryGroup(galleryId, imagesToAdd);
      }

      // Remove deselected images
      if (imagesToRemove.length > 0) {
        await galleryService.removeImagesFromGalleryGroup(galleryId, imagesToRemove);
      }

      // Success handling
      const successMessages = [];
      if (hasNameChanged) successMessages.push('Gallery name updated');
      if (hasSubscriptionChanges) successMessages.push('Subscription options updated');
      if (imagesToAdd.length > 0) successMessages.push(`Added ${imagesToAdd.length} image(s)`);
      if (imagesToRemove.length > 0) successMessages.push(`Removed ${imagesToRemove.length} image(s)`);

      addMessage({
        text: successMessages.length > 0 
          ? `Success: ${successMessages.join(', ')}` 
          : 'Gallery updated',
        type: 'success'
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to update gallery:', err);
      setError(err.message || 'Failed to update gallery');
      addMessage({ text: err.message || 'Failed to update gallery', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className={`relative max-w-md w-full rounded-2xl shadow-2xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } border border-gray-200 dark:border-gray-700`}>
          <div className="flex flex-col items-center justify-center p-12 gap-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-blue-500/20"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Loading Gallery
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fetching your gallery data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className={`relative w-full max-w-6xl my-2 sm:my-8 rounded-2xl shadow-2xl transform transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      } border border-gray-200 dark:border-gray-700`}>
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className={`absolute -top-3 -right-3 p-3 rounded-full shadow-lg transition-all duration-200 z-20 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-white hover:bg-gray-50 text-gray-600'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 group hover:scale-110`}
          aria-label="Close modal"
          disabled={processing}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Tabs */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                <Sparkles className="inline h-6 w-6 mr-2 text-blue-500" />
                Edit Gallery
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Customize your gallery settings and content
              </p>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
              {processing && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Name Input */}
          <div className="space-y-2">
            <label htmlFor="gallery-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Gallery Name
            </label>
            <div className="relative">
              <input
                id="gallery-name"
                type="text"
                value={galleryName}
                onChange={(e) => setGalleryName(e.target.value)}
                className={`w-full px-4 py-3 text-lg font-semibold rounded-xl border-2 transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:bg-gray-600' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:bg-blue-50/50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter a captivating gallery name..."
                disabled={processing}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Info className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'images'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Images ({selectedImages.size})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Pricing ({subscriptionOptions.filter(opt => opt.isActive).length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-700 dark:text-red-400">Error</h3>
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {activeTab === 'subscriptions' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Subscription Plans
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure pricing options for your subscribers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={subscriptionHandlers.add}
                  disabled={processing}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Plan
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {subscriptionOptions.map((option, index) => (
                  <div 
                    key={option.id || index}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-750 border-gray-600' 
                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                    } ${option.isActive 
                        ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                        : 'hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    {/* Popular Badge */}
                    {option.isActive && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full">
                        ACTIVE
                      </div>
                    )}

                    {subscriptionOptions.length > 1 && (
                      <button
                        onClick={() => subscriptionHandlers.remove(index)}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors opacity-75 hover:opacity-100"
                        aria-label="Remove subscription plan"
                        disabled={processing}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div className="space-y-6 mt-4">
                      {/* Duration Selector */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                          Billing Period
                        </label>
                        <select
                          value={option.durationType || 'monthly'}
                          onChange={(e) => {
                            const type = e.target.value;
                            const durationMap = {
                              weekly: 7,
                              monthly: 30,
                              quarterly: 90,
                              yearly: 365
                            };
                            subscriptionHandlers.update(index, {
                              durationType: type,
                              duration: durationMap[type]
                            });
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                            isDarkMode 
                              ? 'bg-gray-600 border-gray-500 focus:border-blue-500' 
                              : 'bg-white border-gray-300 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          disabled={processing}
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      {/* Price Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                          Price
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            min="0.99"
                            step="0.01"
                            value={option.price}
                            onChange={(e) => subscriptionHandlers.update(index, { 
                              price: parseFloat(e.target.value) || 0 
                            })}
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 text-lg font-semibold transition-all ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-500 focus:border-blue-500' 
                                : 'bg-white border-gray-300 focus:border-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            disabled={processing}
                          />
                        </div>
                      </div>

                      {/* Preview Label */}
                      <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          How subscribers will see this plan
                        </div>
                      </div>

                      {/* Active Toggle */}
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={option.isActive}
                          onChange={(e) => subscriptionHandlers.update(index, { 
                            isActive: e.target.checked 
                          })}
                          className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-blue-500"
                          disabled={processing}
                        />
                        <div className="flex-1">
                          <span className="font-medium">Active Plan</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Visible to subscribers
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'images' && (
            <section className="space-y-6">
              {/* Images Header with Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                    Gallery Images
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedImages.size} of {availableImages.length} images selected
                  </p>
                </div>
                
                {/* View Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search images... (Ctrl+/)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-3 w-full border-2 rounded-xl text-sm transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-500' 
                        : 'bg-white border-gray-300 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    disabled={processing}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowOnlySelected(!showOnlySelected)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    showOnlySelected
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-2 border-blue-300 dark:border-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600'
                  } hover:scale-105`}
                >
                  {showOnlySelected ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {showOnlySelected ? 'Selected Only' : 'Show All'}
                </button>
              </div>

              {/* Bulk Actions */}
              {filteredImages.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-750 rounded-xl">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Bulk Actions:
                  </span>
                  <button
                    onClick={selectAllVisible}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    disabled={processing}
                  >
                    Select All Visible
                  </button>
                  <button
                    onClick={deselectAllVisible}
                    className="px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    disabled={processing}
                  >
                    Deselect All Visible
                  </button>
                  {hasUnsavedChanges && (
                    <button
                      onClick={resetToOriginal}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1"
                      disabled={processing}
                    >
                      <Undo2 className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>
              )}

              {/* Images Grid/List */}
              {loadingImages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 dark:text-gray-400">Loading images...</p>
                  </div>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                    {searchTerm || showOnlySelected ? 'No images match your criteria' : 'No images available'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || showOnlySelected 
                      ? 'Try adjusting your search or filter settings' 
                      : 'Upload some images to get started'
                    }
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    : "space-y-3"
                }>
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedImages.has(image.id)
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:shadow-md'
                      } ${
                        viewMode === 'grid' ? 'aspect-square' : 'flex items-center p-3'
                      }`}
                      onClick={() => toggleImageSelection(image.id)}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png';
                              e.target.alt = 'Failed to load image';
                            }}
                          />
                          
                          {/* Selection Overlay */}
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                            selectedImages.has(image.id)
                              ? 'bg-blue-500/20 opacity-100'
                              : 'bg-black/20 opacity-0 group-hover:opacity-100'
                          }`}>
                            <div className={`p-2 rounded-full ${
                              selectedImages.has(image.id)
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/90 text-gray-700'
                            }`}>
                              <CheckCircle className="h-6 w-6" />
                            </div>
                          </div>

                          {/* Image Title Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
                            <p className="text-white text-sm font-medium truncate">
                              {image.title}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png';
                              e.target.alt = 'Failed to load image';
                            }}
                          />
                          <div className="flex-1 ml-4">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                              {image.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {image.alt}
                            </p>
                          </div>
                          <div className={`p-2 rounded-full ml-3 ${
                            selectedImages.has(image.id)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                          }`}>
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="sticky bottom-0 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{selectedImages.size} images selected</span>
              </div>
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={processing}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={processing || !hasUnsavedChanges}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  hasUnsavedChanges && !processing
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 dark:text-gray-500">
              <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+/</kbd> Focus search</span>
              <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> Save changes</span>
              <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd> Close modal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGalleryModal;