import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const GalleryItem = ({ gallery, onClick }) => {
  const { isDarkMode } = useTheme();

  console.log('Gallery item data:', {
    galleryId: gallery._id,
    name: gallery.name,
    imageCount: gallery.images?.length,
    firstImage: gallery.images?.[0]
  });

  // Get the first image URL for the cover, or use a placeholder
  const coverImage = gallery.images?.[0];
  const coverImageUrl = coverImage?.imageUrl || '/assets/images/placeholder.jpg';
  
  const handleClick = () => {
    console.log('Gallery clicked:', {
      id: gallery._id,
      images: gallery.images
    });
    onClick(gallery._id);
  };
  
  return (
    <div 
      className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
      onClick={handleClick}
    >
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        <img 
          src={coverImageUrl}
          alt={gallery.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-tl-md">
          {gallery.images?.length || 0} images
        </div>
      </div>
      
      <div className="p-4">
        <h3 className={`font-medium text-lg mb-1 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>{gallery.name}</h3>
        <p className={`text-sm mb-3 line-clamp-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>{gallery.description}</p>
        
        <div className="flex items-center justify-between">
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Created {new Date(gallery.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;