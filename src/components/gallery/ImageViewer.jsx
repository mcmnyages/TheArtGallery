import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ImageViewer = ({ image, onClose, onPrevious, onNext, totalImages, currentIndex }) => {
  const { isDarkMode } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Reset zoom and position when image changes
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [image]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      onPrevious();
    } else if (e.key === 'ArrowRight') {
      onNext();
    } else if (e.key === '+' || e.key === '=') {
      setZoomLevel(prevZoom => Math.min(prevZoom + 0.25, 3));
    } else if (e.key === '-') {
      setZoomLevel(prevZoom => Math.max(prevZoom - 0.25, 0.5));
    } else if (e.key === '0') {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [onClose, onNext, onPrevious]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Handle zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prevZoom => {
      const newZoom = Math.max(0.5, Math.min(3, prevZoom + delta));
      return newZoom;
    });
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
      const dx = (e.clientX - dragStart.x) / zoomLevel;
      const dy = (e.clientY - dragStart.y) / zoomLevel;
      
      setPosition(prevPosition => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Zoom in/out buttons
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
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 ${
          isDarkMode ? 'bg-black bg-opacity-90' : 'bg-gray-900 bg-opacity-75'
        }`} 
        onClick={onClose}
      />
      
      {/* Controls */}
      <div className={`relative z-10 w-full h-full ${
        isDarkMode ? 'text-gray-200' : 'text-gray-100'
      }`}>
        {/* Actions bar */}
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
            <span>Close</span>
          </button>
          <div className="text-sm">
            {currentIndex + 1} / {totalImages}
          </div>
        </div>

        {/* Main content with navigation */}
        <div className="relative flex-1">
          {/* Previous/Next buttons */}
          <button
            onClick={onPrevious}
            className={`absolute left-4 top-1/2 p-2 rounded-full -translate-y-1/2 ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-black bg-opacity-50 hover:bg-opacity-75 text-white'
            }`}
          >
            Previous
          </button>
          <button
            onClick={onNext}
            className={`absolute right-4 top-1/2 p-2 rounded-full -translate-y-1/2 ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-black bg-opacity-50 hover:bg-opacity-75 text-white'
            }`}
          >
            Next
          </button>

          {/* Image container */}
          <div 
            className="h-full flex items-center justify-center"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={image.url}
              alt={image.title}
              className="max-h-full max-w-full object-contain"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Zoom controls */}
        <div className={`p-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-black bg-opacity-50'
        }`}>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleZoomOut}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-700 text-white'
              }`}
            >
              Zoom Out
            </button>
            <span>{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-700 text-white'
              }`}
            >
              Zoom In
            </button>
            <button
              onClick={handleReset}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-700 text-white'
              }`}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;