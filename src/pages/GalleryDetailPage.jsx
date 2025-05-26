import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageViewer from '../components/gallery/ImageViewer';

const GalleryDetailPage = () => {
  const { galleryId } = useParams();
  const navigate = useNavigate();
  
  const [gallery, setGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  useEffect(() => {
    const fetchGalleryDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Mock gallery data
          const mockGallery = {
            id: galleryId,
            title: galleryId === '1' ? 'Modern Masterpieces' : 
                  galleryId === '2' ? 'Classical Renaissance' :
                  galleryId === '3' ? 'Abstract Expressions' : 'Gallery ' + galleryId,
            description: 'This gallery features a stunning collection of artistic works that showcase the creativity and vision of remarkable artists from various periods and styles.',
            category: galleryId === '1' ? 'modern' : 
                     galleryId === '2' ? 'classical' :
                     galleryId === '3' ? 'abstract' : 'other',
            curator: 'Art Specialist Team',
            createdAt: '2023-05-15',
          };
          
          // Mock image data
          const mockImages = Array.from({ length: 12 }, (_, index) => ({
            id: `${galleryId}-${index + 1}`,
            title: `Artwork ${index + 1}`,
            description: `Beautiful artwork piece number ${index + 1} in this collection.`,
            artist: `Artist ${(index % 4) + 1}`,
            year: 2000 + index,
            dimensions: `${60 + index * 5}cm x ${40 + index * 3}cm`,
            medium: index % 2 === 0 ? 'Oil on canvas' : 'Mixed media',
            imageUrl: `/assets/images/gallery${galleryId}-${(index % 4) + 1}.jpg`,
            thumbnailUrl: `/assets/images/gallery${galleryId}-${(index % 4) + 1}-thumb.jpg`,
          }));
          
          setGallery(mockGallery);
          setImages(mockImages);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching gallery details:', err);
        setError('Failed to load gallery details. Please try again.');
        setLoading(false);
      }
    };
    
    if (galleryId) {
      fetchGalleryDetails();
    }
  }, [galleryId]);
  
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setViewerOpen(true);
  };
  
  const handleCloseViewer = () => {
    setViewerOpen(false);
  };
  
  const handlePrevImage = () => {
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setSelectedImage(images[prevIndex]);
  };
  
  const handleNextImage = () => {
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(images[nextIndex]);
  };
  
  const handleGoBack = () => {
    navigate('/galleries');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={handleGoBack}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Go back to galleries
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!gallery) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Gallery not found</p>
            <button 
              onClick={handleGoBack}
              className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
            >
              Go back to galleries
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Galleries
        </button>
      </div>

      {/* Gallery header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{gallery.title}</h1>
        <p className="text-gray-600 mb-4">{gallery.description}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-2 sm:mb-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {gallery.category.charAt(0).toUpperCase() + gallery.category.slice(1)}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              Curated by {gallery.curator}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Created on {new Date(gallery.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Gallery images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map(image => (
          <div 
            key={image.id}
            onClick={() => handleImageClick(image)}
            className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="h-64 bg-gray-200 overflow-hidden">
              <img 
                src={image.imageUrl} 
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{image.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{image.artist}, {image.year}</p>
              <p className="text-gray-400 text-xs mt-1">{image.medium}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image viewer modal */}
      {viewerOpen && selectedImage && (
        <ImageViewer
          image={selectedImage}
          onClose={handleCloseViewer}
          onPrevious={handlePrevImage}
          onNext={handleNextImage}
          totalImages={images.length}
          currentIndex={images.findIndex(img => img.id === selectedImage.id) + 1}
        />
      )}
    </div>
  );
};

export default GalleryDetailPage;