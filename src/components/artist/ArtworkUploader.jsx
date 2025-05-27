import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaImage, FaTrash } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const ArtworkUploader = () => {
  const { isDarkMode } = useTheme();
  const [artworks, setArtworks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const newArtworks = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      uploadDate: new Date().toISOString(),
      status: 'pending'
    }));
    setArtworks(prev => [...prev, ...newArtworks]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    multiple: true
  });

  const handleDelete = (id) => {
    setArtworks(prev => prev.filter(artwork => artwork.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artwork Manager</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
        </span>
      </div>

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
          }`}
      >
        <input {...getInputProps()} />
        <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isDragActive
            ? "Drop your artworks here..."
            : "Drag & drop artworks, or click to select files"
          }
        </p>
      </div>

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map(artwork => (
          <div 
            key={artwork.id} 
            className="relative group rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md"
          >
            <img 
              src={artwork.preview} 
              alt={artwork.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-2">
              <p className="font-medium text-gray-900 dark:text-white truncate">{artwork.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Added {new Date(artwork.uploadDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(artwork.id)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtworkUploader;
