import React, { useState, useEffect, useCallback } from 'react';

const ImageViewer = ({ image, onClose, onPrevious, onNext, totalImages, currentIndex }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col justify-center items-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        aria-label="Close viewer"
      >
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Image container */}
      <div
        className={`flex-1 w-full flex justify-center items-center overflow-hidden ${isDragging ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-default'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={image.imageUrl}
          alt={image.title}
          className="max-h-full max-w-full object-contain transition-transform duration-100"
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center',
          }}
        />
      </div>
      
      {/* Bottom toolbar */}
      <div className="w-full bg-black bg-opacity-50 px-4 py-3 flex justify-between items-center">
        {/* Left - Image info */}
        <div className="text-white">
          <h3 className="font-medium">{image.title}</h3>
          <div className="text-sm opacity-75">
            <p>{image.artist}, {image.year}</p>
            <p>{image.medium}</p>
          </div>
        </div>
        
        {/* Center - Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onPrevious}
            className="text-white hover:text-gray-300"
            aria-label="Previous image"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-white text-sm">
            {currentIndex} / {totalImages}
          </div>
          <button
            onClick={onNext}
            className="text-white hover:text-gray-300"
            aria-label="Next image"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Right - Zoom controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="text-white hover:text-gray-300 p-1"
            aria-label="Zoom out"
            disabled={zoomLevel <= 0.5}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-white text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="text-white hover:text-gray-300 p-1"
            aria-label="Zoom in"
            disabled={zoomLevel >= 3}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleReset}
            className="text-white hover:text-gray-300 ml-2 text-xs"
            aria-label="Reset zoom"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;