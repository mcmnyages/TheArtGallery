import React from 'react';

const GalleryItem = ({ gallery, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
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
          <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-br-md">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg text-gray-900 mb-1">{gallery.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{gallery.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {gallery.category}
          </span>
          {gallery.createdAt && (
            <span className="text-xs text-gray-500">
              {new Date(gallery.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;