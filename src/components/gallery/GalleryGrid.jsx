import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGallery } from '../../hooks/useGallery';
import { useTheme } from '../../contexts/ThemeContext';
import { useMessage } from '../../hooks/useMessage';
import { Lock } from 'lucide-react';

const GalleryGrid = () => {
  const { galleries, loading, error, fetchGalleries } = useGallery();
  const { isDarkMode } = useTheme();
  const { addMessage } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const handleLockClick = (e, gallery) => {
    e.preventDefault(); // Prevent navigation to gallery detail
    addMessage({ 
      text: 'Please subscribe first to access this gallery album', 
      type: 'info'
    });
    navigate('/subscriptions');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {galleries.map((gallery) => {
        // Force all galleries to be locked
        const isLocked = true;
        
        return (
          <Link
            key={gallery._id}
            to={`/gallery/${gallery._id}`}
            className={`group block rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="relative">
              {gallery.images && gallery.images[0] && (
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src={gallery.images[0].imageUrl}
                    alt={gallery.name}
                    className={`object-cover w-full h-full transition-opacity duration-200 ${
                      isLocked ? 'opacity-50' : ''
                    }`}
                  />
                  {isLocked && (
                    <button
                      onClick={(e) => handleLockClick(e, gallery)}
                      className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 hover:scale-110`}
                    >
                      <div className={`p-3 rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-800/80 text-white hover:bg-gray-700/80' 
                          : 'bg-white/80 text-gray-900 hover:bg-gray-100/80'
                      } transition-colors`}>
                        <Lock className="h-6 w-6" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {gallery.name}
                </h3>
                {isLocked && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    Subscribers Only
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {gallery.description}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {gallery.images?.length || 0} images
                </span>
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(gallery.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default GalleryGrid;