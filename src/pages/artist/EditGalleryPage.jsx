import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { galleryService } from '../../services/galleryService';
import PageContainer from '../../components/layout/PageContainer';
import { Search, Plus, X } from 'lucide-react';

const EditGalleryPage = () => {
  const navigate = useNavigate();
  const { galleryId } = useParams();
  const { isDarkMode } = useTheme();
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableImages, setAvailableImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  
  // Keep track of which images to add/remove
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [originalImageIds, setOriginalImageIds] = useState(new Set());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchGalleryAndImages = async () => {
      try {
        setLoading(true);
        const [fetchedGallery, images] = await Promise.all([
          galleryService.fetchGalleryGroupById(galleryId),
          galleryService.getArtistImages()
        ]);

        if (!fetchedGallery) {
          throw new Error('Gallery not found');
        }

        setGallery(fetchedGallery);
        setOriginalImageIds(new Set(fetchedGallery.images.map(img => img.imageId)));

        const availableImgs = images.map(img => ({
          id: img.imageId,
          url: img.imageUrl,
          title: img.imageId, // Using imageId as title since we don't have a title field
          category: 'Art' // Default category since we don't have categories yet
        }));
        setAvailableImages(availableImgs);
      } catch (err) {
        console.error('Failed to fetch gallery or images:', err);
        setError(err.message || 'Failed to load gallery and images');
      } finally {
        setLoading(false);
        setLoadingImages(false);
      }
    };

    fetchGalleryAndImages();
  }, [galleryId]);

  const filteredImages = availableImages.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSave = async () => {
    try {
      setProcessing(true);
      setError('');

      const imagesToAdd = Array.from(selectedImages)
        .filter(id => !originalImageIds.has(id));

      const imagesToRemove = Array.from(originalImageIds)
        .filter(id => selectedImages.has(id));

      // Add new images if any
      if (imagesToAdd.length > 0) {
        await galleryService.addImagesToGalleryGroup(galleryId, imagesToAdd);
      }

      // Remove deselected images if any
      if (imagesToRemove.length > 0) {
        await galleryService.removeImagesFromGalleryGroup(galleryId, imagesToRemove);
      }

      navigate('/artist/gallery');
    } catch (err) {
      console.error('Failed to update gallery images:', err);
      setError(err.message || 'Failed to update gallery images');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading gallery...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center gap-2">
            <X className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => navigate('/artist/gallery')}
            className="mt-4 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            &larr; Back to Galleries
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Gallery: {gallery.name}
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Select or deselect images to update this gallery
            </p>
          </div>
          <button
            onClick={() => navigate('/artist/gallery')}
            className={`px-4 py-2 rounded-md transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Image Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Selected: {selectedImages.size} images
            </div>
          </div>

          {/* Image Grid */}
          {loadingImages ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading images...</span>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No images found matching your search.' : 'No images available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => {
                const isSelected = selectedImages.has(image.id);
                const wasOriginallySelected = originalImageIds.has(image.id);
                
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

                      {/* Change status */}
                      {(isSelected !== wasOriginallySelected) && (
                        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                          isSelected 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {isSelected ? 'Will Add' : 'Will Remove'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={processing}
              className={`flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 ${
                processing
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating Gallery...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/artist/gallery')}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default EditGalleryPage;
