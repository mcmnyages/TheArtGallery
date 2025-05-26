import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtist } from '../../hooks/useArtistContext';

const CreateGalleryForm = () => {
  const navigate = useNavigate();
  const { createGallery } = useArtist();
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Create New Gallery</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Gallery Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select category</option>
            <option value="contemporary">Contemporary</option>
            <option value="digital">Digital Art</option>
            <option value="photography">Photography</option>
            <option value="traditional">Traditional</option>
            <option value="sculpture">Sculpture</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Monthly Subscription Price ($)</label>
          <input
            type="number"
            name="subscriptionPrice"
            value={formData.subscriptionPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating...' : 'Create Gallery'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/artist/gallery')}
          className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateGalleryForm;
