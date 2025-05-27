import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtist } from '../../hooks/useArtistContext';
import { useTheme } from '../../contexts/ThemeContext';

const CreateGalleryForm = () => {
  const navigate = useNavigate();
  const { createGallery } = useArtist();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subscriptionPrice: '',
    coverImage: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, you'd upload the image to a storage service first
      const galleryData = {
        ...formData,
        coverImage: formData.coverImage ? URL.createObjectURL(formData.coverImage) : null,
        subscriptionPrice: parseFloat(formData.subscriptionPrice),
        createdAt: new Date().toISOString()
      };

      await createGallery(galleryData);
      navigate('/artist/gallery');
    } catch (err) {
      setError(err.message || 'Failed to create gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-2xl mx-auto p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      aria-labelledby="gallery-form-title"
      noValidate
    >
      <h2 id="gallery-form-title" className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Create New Gallery
      </h2>

      {error && (
        <div 
          className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="gallery-name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Gallery Name
          </label>
          <input
            id="gallery-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-required="true"
            aria-invalid={formData.name === ''}
            required
          />
        </div>

        <div>
          <label htmlFor="gallery-description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="gallery-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            rows="4"
            aria-required="true"
            aria-invalid={formData.description === ''}
            required
          />
        </div>

        <div>
          <label htmlFor="gallery-category" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="gallery-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-required="true"
            aria-invalid={formData.category === ''}
            required
          >
            <option value="" disabled>Select category</option>
            <option value="contemporary">Contemporary</option>
            <option value="digital">Digital Art</option>
            <option value="photography">Photography</option>
            <option value="traditional">Traditional</option>
            <option value="sculpture">Sculpture</option>
          </select>
        </div>

        <div>
          <label htmlFor="subscription-price" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Monthly Subscription Price ($)
          </label>
          <input
            id="subscription-price"
            type="number"
            name="subscriptionPrice"
            value={formData.subscriptionPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-required="true"
            aria-invalid={formData.subscriptionPrice === ''}
            required
          />
        </div>

        <div>
          <label htmlFor="cover-image" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Cover Image
          </label>
          <input
            id="cover-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 dark:file:bg-blue-600 dark:hover:file:bg-blue-700"
            aria-required="true"
            aria-invalid={!formData.coverImage}
            aria-describedby="cover-image-description"
            required
          />
          <p id="cover-image-description" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload a high-quality image to represent your gallery. Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-busy={loading}
        >
          {loading ? 'Creating...' : 'Create Gallery'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/artist/gallery')}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateGalleryForm;
