import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGallery } from '../../hooks/useGallery';
import { useTheme } from '../../contexts/ThemeContext';

const GalleryGrid = () => {
  const { galleries, loading, error, fetchGalleries } = useGallery();
  const { isDarkMode } = useTheme();

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {galleries.map((gallery) => (
        <Link
          key={gallery._id}
          to={`/gallery/${gallery._id}`}
          className={`block rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {gallery.images && gallery.images[0] && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={gallery.images[0].url}
                alt={gallery.name}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {gallery.name}
            </h3>
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
      ))}
    </div>
  );
};

export default GalleryGrid;