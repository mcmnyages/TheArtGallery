import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { galleryService } from '../../services/galleryService';
import GalleryPaymentModal from '../subscription/GalleryPaymentModal';

const GalleryItem = ({ gallery }) => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (gallery.paymentRequired && isAuthenticated) {
        try {
          const status = await galleryService.checkGalleryAccess(gallery._id);
          setAccessStatus(status);
        } catch (error) {
          console.error('Error checking gallery access:', error);
        }
      }
      setIsLoading(false);
    };

    checkAccess();
  }, [gallery._id, gallery.paymentRequired, isAuthenticated]);

  const handlePaymentSuccess = async () => {
    try {
      const status = await galleryService.checkGalleryAccess(gallery._id);
      setAccessStatus(status);
    } catch (error) {
      console.error('Error updating access status:', error);
    }
  };

  const handleGalleryClick = (e) => {
    if (gallery.paymentRequired && (!accessStatus?.hasAccess || !isAuthenticated)) {
      e.preventDefault();
      setShowPaymentModal(true);
    }
  };

  const thumbnailUrl = gallery.images[0]?.signedUrl || '/placeholder-image.jpg';

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:-translate-y-1 
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <Link
          to={`/gallery/${gallery._id}`}
          onClick={handleGalleryClick}
          className="block relative aspect-square overflow-hidden"
        >
          <img
            src={thumbnailUrl}
            alt={gallery.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          
          {gallery.paymentRequired && !isLoading && (!accessStatus?.hasAccess || !isAuthenticated) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-purple-600' : 'bg-blue-600'} text-white text-sm font-medium`}>
                {gallery.basePrice && gallery.baseCurrency
                  ? `${gallery.baseCurrency}${gallery.basePrice} - Unlock Access`
                  : 'Premium Content'}
              </div>
            </div>
          )}
        </Link>

        <div className="p-4">
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {gallery.name}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {gallery.description}
          </p>
        </div>
      </div>

      {showPaymentModal && gallery.basePrice && gallery.baseCurrency && (
        <GalleryPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          galleryId={gallery._id}
          galleryName={gallery.name}
          price={gallery.basePrice}
          currency={gallery.baseCurrency}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default GalleryItem;