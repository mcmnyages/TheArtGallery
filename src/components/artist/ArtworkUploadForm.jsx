import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtist } from '../../hooks/useArtistContext';
import { useTheme } from '../../contexts/ThemeContext';

const ArtworkUploadForm = () => {
  const navigate = useNavigate();
  const { uploadArtwork, galleries } = useArtist();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    dimensions: '',
    medium: '',
    year: new Date().getFullYear(),
    galleryId: '', // For grouping artworks
  });
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (selectedFiles.length === 0) {
        throw new Error('Please select at least one image');
      }

      // Create FormData to handle file uploads
      const artworkData = new FormData();
      selectedFiles.forEach((file, index) => {
        artworkData.append('images', file);
      });

      // Append other form data
      Object.keys(formData).forEach(key => {
        artworkData.append(key, formData[key]);
      });

      await uploadArtwork(artworkData);
      navigate('/artist/gallery');
    } catch (err) {
      setError(err.message || 'Failed to upload artwork');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateNewGalleryClick = () => {
    navigate('/artist/gallery/create');
  };

  return (
    <form onSubmit={handleSubmit} className={`max-w-2xl mx-auto p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <h2 className="text-2xl font-bold mb-6">Upload New Artwork</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            rows="4"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gallery Group</label>
            <div className="flex gap-2">
              <select
                name="galleryId"
                value={formData.galleryId}
                onChange={handleChange}
                className={`flex-1 p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                required
              >
                <option value="">Select gallery</option>
                {galleries?.map(gallery => (
                  <option key={gallery.id} value={gallery.id}>{gallery.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCreateNewGalleryClick}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                New
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            >
              <option value="">Select category</option>
              <option value="painting">Painting</option>
              <option value="sculpture">Sculpture</option>
              <option value="digital">Digital Art</option>
              <option value="photography">Photography</option>
              <option value="mixed-media">Mixed Media</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="1800"
              max={new Date().getFullYear()}
              className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dimensions</label>
            <input
              type="text"
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              placeholder="e.g., 24x36 inches"
              className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Medium</label>
            <input
              type="text"
              name="medium"
              value={formData.medium}
              onChange={handleChange}
              placeholder="e.g., Oil on canvas"
              className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Images</label>
          <div className={`border-2 border-dashed rounded-lg p-6 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="artwork-images"
              required
            />
            <label
              htmlFor="artwork-images"
              className={`flex flex-col items-center cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L12 4m4 4v12" />
              </svg>
              <span className="text-sm">Click to upload images or drag and drop</span>
              <span className="text-xs mt-1">Support for multiple images</span>
            </label>
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected files:</p>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Uploading...' : 'Upload Artwork'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/artist/gallery')}
          className={`px-6 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md transition-colors`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ArtworkUploadForm;