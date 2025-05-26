import React from 'react';
import GalleryItem from './GalleryItem';

const GalleryGrid = ({ galleries, onGalleryClick, isLoading, hasError, searchTerm }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="text-center py-16">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading galleries</h3>
        <p className="mt-1 text-sm text-gray-500">
          There was a problem fetching the galleries. Please try again later.
        </p>
      </div>
    );
  }
  
  if (galleries.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No galleries found</h3>
        {searchTerm ? (
          <p className="mt-1 text-sm text-gray-500">
            No results match "{searchTerm}". Try a different search term.
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            There are no galleries available at the moment.
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {galleries.map(gallery => (
        <GalleryItem
          key={gallery.id}
          gallery={gallery}
          onClick={() => onGalleryClick(gallery.id)}
        />
      ))}
    </div>
  );
};

export default GalleryGrid;