import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtist } from '../../contexts/ArtistContext';

const ArtworkGallery = () => {
  const navigate = useNavigate();
  const { artworks, loading, error, deleteArtwork } = useArtist();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [filteredArtworks, setFilteredArtworks] = useState(artworks);

  useEffect(() => {
    if (!artworks) return;
    
    let filtered = [...artworks];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(art => art.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        default:
          return 0;
      }
    });

    setFilteredArtworks(filtered);
  }, [artworks, selectedCategory, sortOrder]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Artworks</h2>
        <div className="flex gap-4">          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="painting">Paintings</option>
            <option value="sculpture">Sculptures</option>
            <option value="digital">Digital Art</option>
            <option value="photography">Photography</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price High to Low</option>
            <option value="price-low">Price Low to High</option>
          </select>
        </div>
      </div>      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No artworks found.</p>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => setSelectedCategory('all')} 
              className="mt-4 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork) => (
            <div key={artwork.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-sm rounded-full bg-white shadow-md">
                    {artwork.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{artwork.title}</h3>
                <p className="text-gray-600 mt-1">${artwork.price}</p>
                <p className="text-sm text-gray-500 mt-1">{artwork.description}</p>
                <div className="mt-4 flex justify-between">
                  <button 
                    onClick={() => navigate(`/artist/edit/${artwork.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this artwork?')) {
                        deleteArtwork(artwork.id);
                      }
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtworkGallery;
