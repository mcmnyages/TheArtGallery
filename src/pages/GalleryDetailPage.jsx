import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGallery } from '../hooks/useGallery';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../hooks/useSubscription';
import ImageViewer from '../components/gallery/ImageViewer';
import SubscriptionManager from '../components/subscription/SubscriptionManager';
import { Lock } from 'lucide-react';

const GalleryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { currentGallery: gallery, loading, error, fetchGalleryById } = useGallery();
  const { hasGalleryAccess } = useSubscription();
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const hasAccess = gallery && hasGalleryAccess(gallery._id);

  useEffect(() => {
    if (id) {
      fetchGalleryById(id);
    }
  }, [id, fetchGalleryById]);

  useEffect(() => {
    // Track gallery views and debug image loading
    if (gallery) {
      console.log('Gallery detail loaded:', {
        id: gallery._id,
        name: gallery.name,
        imageCount: gallery?.images?.length,
        images: gallery?.images?.map(img => ({
          id: img._id,
          imageId: img.imageId,
          imageUrl: img.imageUrl
        }))
      });

      // Preload images
      gallery.images?.forEach(image => {
        if (image.imageUrl) {
          const img = new Image();
          img.src = image.imageUrl;
        }
      });
    }
  }, [gallery]);

  useEffect(() => {
    // Track gallery views
    if (gallery) {
      console.log('Viewing gallery:', {
        id: gallery._id,
        name: gallery.name,
        imageCount: gallery?.images?.length,
        imageUrls: gallery?.images?.map(img => img.imageUrl)
      });
    }
  }, [gallery, loading, error]);
  const handleImageClick = (image) => {
    console.log('Image clicked:', image);
    if (!hasAccess) {
      console.log('Access denied');
      return;
    }
    if (!image?.imageUrl) {
      console.log('No image URL found');
      return;
    }
    setSelectedImage({
      ...image,
      url: image.imageUrl
    });
    setViewerOpen(true);
  };
  
  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedImage(null);
  };
  
  const handlePrevImage = () => {
    if (!gallery?.images?.length) return;
    const currentIndex = gallery.images.findIndex(img => img._id === selectedImage?._id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : gallery.images.length - 1;
    setSelectedImage(gallery.images[prevIndex]);
  };
  
  const handleNextImage = () => {
    if (!gallery?.images?.length) return;
    const currentIndex = gallery.images.findIndex(img => img._id === selectedImage?._id);
    const nextIndex = currentIndex < gallery.images.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(gallery.images[nextIndex]);
  };
  
  const handleGoBack = () => {
    navigate('/galleries');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`rounded-lg p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="animate-pulse space-y-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="aspect-[4/3] bg-gray-300" />
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-16" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`rounded-lg p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
          <div className="mb-6">
            <div className="text-red-500 text-5xl mb-4">
              <i className="fas fa-exclamation-circle" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Unable to Load Gallery
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
          </div>
          <button 
            onClick={handleGoBack}
            className={`inline-flex items-center px-4 py-2 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <i className="fas fa-arrow-left mr-2" />
            Return to Galleries
          </button>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-gray-800' : 'bg-yellow-50'} rounded-lg shadow-md`}>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className={`text-4xl mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
              <i className="fas fa-folder-open" />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-yellow-700'}`}>
              Gallery Not Found
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-yellow-600'}`}>
              This gallery may have been moved or deleted.
            </p>
            <button 
              onClick={handleGoBack}
              className={`px-4 py-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
              }`}
            >
              <i className="fas fa-arrow-left mr-2" />
              Return to Galleries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{gallery?.name}</h1>
            <p className={`text-lg mb-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>{gallery?.description}</p>
            <div className={`flex items-center gap-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="flex items-center gap-2">
                <i className="fas fa-images" />
                {gallery?.images?.length || 0} images
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-calendar" />
                Created {new Date(gallery?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleGoBack}
            className={`px-4 py-2 rounded-md transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <i className="fas fa-arrow-left mr-2" />
            Back to Galleries
          </button>
        </div>
      </div>
      
      <div className="mt-8">
        {gallery?.images?.length > 0 ? (
          <>
            {!hasAccess && (
              <div className="mb-8">
                <SubscriptionManager gallery={gallery} />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gallery.images.map((image, index) => {
                console.log('Rendering image:', image);
                return (
                  <div 
                    key={image._id}
                    onClick={() => handleImageClick(image)}
                    className={`rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } ${!hasAccess ? 'pointer-events-none' : ''}`}
                  >
                    <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                      {image.imageUrl ? (
                        <img 
                          src={image.imageUrl}
                          alt={`Image ${index + 1} in ${gallery.name}`}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                            !hasAccess ? 'opacity-50' : ''
                          }`}
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image failed to load:', image.imageUrl);
                            e.target.src = '/assets/images/placeholder.jpg';
                            e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-gray-400">Image not available</span>
                        </div>
                      )}
                      {!hasAccess && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`p-3 rounded-full ${
                            isDarkMode 
                              ? 'bg-gray-800/80 text-white' 
                              : 'bg-white/80 text-gray-900'
                          }`}>
                            <Lock className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className={`text-center py-16 ${
            isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
          } rounded-lg`}>
            <div className="mb-4">
              <i className="fas fa-images text-4xl opacity-50" />
            </div>
            <p className="text-lg">No images found in this gallery</p>
            <p className="mt-2 text-sm">Check back later for new additions</p>
          </div>
        )}
      </div>
      
      {viewerOpen && selectedImage && gallery?.images && hasAccess && (        <ImageViewer
          imageData={{
            url: selectedImage.imageUrl,
            title: `Image in ${gallery.name}`,
            metadata: selectedImage.metadata || {},
            addedOn: new Date(selectedImage.uploadedAt || selectedImage.createdAt).toLocaleDateString(),
            id: selectedImage._id
          }}
          onClose={handleCloseViewer}
          onPrevious={gallery.images.length > 1 ? handlePrevImage : undefined}
          onNext={gallery.images.length > 1 ? handleNextImage : undefined}
          totalImages={gallery.images.length}
          currentIndex={gallery.images.findIndex(img => img._id === selectedImage._id)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default GalleryDetailPage;