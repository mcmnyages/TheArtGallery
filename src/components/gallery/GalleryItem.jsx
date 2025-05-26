import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const GalleryItem = ({ gallery, onClick }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
      onClick={onClick}
    >
      <div className="h-48 bg-gray-200 relative">
        <img 
          src={gallery.imageUrl} 
          alt={gallery.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-tl-md">
          {gallery.imageCount} images
        </div>
        {gallery.featured && (
          <div className={`absolute top-0 left-0 text-white text-xs px-2 py-1 rounded-br-md ${
            isDarkMode ? 'bg-purple-600' : 'bg-blue-600'
          }`}>
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className={`font-medium text-lg mb-1 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>{gallery.title}</h3>
        <p className={`text-sm mb-3 line-clamp-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>{gallery.description}</p>
        
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            isDarkMode 
              ? 'bg-purple-900 text-purple-200' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {gallery.category}
          </span>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            By {gallery.curator}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;