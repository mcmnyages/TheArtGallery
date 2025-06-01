import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageViewer = ({ 
  image, 
  imageData,
  onClose, 
  onPrevious, 
  onNext, 
  totalImages, 
  currentIndex,
  isDarkMode,
  children 
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    // Debug log for image data
    console.log('ImageViewer received:', {
      image,
      imageData,
      totalImages,
      currentIndex
    });
    
    // Reset state when image changes
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setImageError(false);
  }, [image, imageData]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      onPrevious();
    } else if (e.key === 'ArrowRight') {
      onNext();
    }
  }, [onClose, onPrevious, onNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Handle wheel zoom
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.1;
      setZoomLevel(prevZoom => Math.max(0.5, Math.min(3, prevZoom + delta)));
    }
  };
  
  // Handle pan/drag
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setPosition(prevPosition => ({
        x: prevPosition.x + dx / zoomLevel,
        y: prevPosition.y + dy / zoomLevel
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.25, 0.5));
  };
  
  const handleReset = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageError = () => {
    console.error('Failed to load image:', image?.url || imageData?.url);
    setImageError(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 ${
          isDarkMode ? 'bg-black bg-opacity-90' : 'bg-gray-900 bg-opacity-75'
        }`} 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`relative z-10 w-full h-full ${
        isDarkMode ? 'text-gray-200' : 'text-gray-100'
      }`}>
        {/* Top bar */}
        <div className={`flex items-center justify-between p-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-black bg-opacity-50'
        }`}>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              {currentIndex + 1} / {totalImages}
            </div>
            {imageData?.metadata && (
              <div className="text-sm">
                {imageData.metadata.dimensions && (
                  <span className="mr-3">{imageData.metadata.dimensions}</span>
                )}
                {imageData.metadata.size && (
                  <span>{imageData.metadata.size}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main content with navigation */}
        <div className="relative flex-1 h-[calc(100%-8rem)]">
          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <button
              onClick={onPrevious}
              className={`absolute left-4 top-1/2 p-2 rounded-full -translate-y-1/2 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-black bg-opacity-50 hover:bg-opacity-75 text-white'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {currentIndex < totalImages - 1 && (
            <button
              onClick={onNext}
              className={`absolute right-4 top-1/2 p-2 rounded-full -translate-y-1/2 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-black bg-opacity-50 hover:bg-opacity-75 text-white'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image container */}
          <div 
            className="h-full flex items-center justify-center overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {!imageError ? (
              <img
                src={image?.url || imageData?.url}
                alt={image?.title || imageData?.title || 'Gallery image'}
                className="max-w-full max-h-full object-contain transform-gpu"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onError={handleImageError}
                draggable={false}
              />
            ) : (
              <div className={`text-center p-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <p>Failed to load image</p>
                <button 
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            )}
            {children}
          </div>
        </div>

        {/* Controls bar */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-black bg-opacity-50'
        }`}>
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={handleZoomOut}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-700 text-white'
              }`}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="min-w-[4rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-700 text-white'
              }`}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-700 text-white'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;