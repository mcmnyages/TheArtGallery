import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GalleriesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'modern', name: 'Modern Art' },
    { id: 'classical', name: 'Classical' },
    { id: 'nature', name: 'Nature' },
    { id: 'portrait', name: 'Portraits' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'historical', name: 'Historical' }
  ];

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch galleries
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call with timeout
        setTimeout(() => {
          // Mock gallery data
          const mockGalleries = [
            {
              id: '1',
              title: 'Modern Masterpieces',
              description: 'A collection of contemporary artwork from leading artists around the world',
              category: 'modern',
              imageUrl: '/assets/images/gallery1.jpg',
              imageCount: 42,
              featured: true,
              createdAt: '2023-04-15'
            },
            {
              id: '2',
              title: 'Classical Renaissance',
              description: 'Timeless works from the European Renaissance period',
              category: 'classical',
              imageUrl: '/assets/images/gallery2.jpg',
              imageCount: 36,
              featured: true,
              createdAt: '2023-03-22'
            },
            {
              id: '3',
              title: 'Abstract Expressions',
              description: 'Exploring emotion and thought through abstract visual language',
              category: 'abstract',
              imageUrl: '/assets/images/gallery3.jpg',
              imageCount: 28,
              featured: false,
              createdAt: '2023-05-10'
            },
            {
              id: '4',
              title: 'Nature\'s Beauty',
              description: 'Breathtaking landscapes and natural wonders captured in stunning detail',
              category: 'nature',
              imageUrl: '/assets/images/gallery4.jpg',
              imageCount: 53,
              featured: true,
              createdAt: '2023-02-18'
            },
            {
              id: '5',
              title: 'Historical Portraits',
              description: 'Famous faces throughout history captured by master painters',
              category: 'portrait',
              imageUrl: '/assets/images/gallery5.jpg',
              imageCount: 31,
              featured: false,
              createdAt: '2023-06-05'
            },
            {
              id: '6',
              title: 'Urban Landscapes',
              description: 'City scenes and architectural marvels from around the globe',
              category: 'modern',
              imageUrl: '/assets/images/gallery6.jpg',
              imageCount: 24,
              featured: false,
              createdAt: '2023-07-12'
            },
            {
              id: '7',
              title: 'Medieval Art Collection',
              description: 'Rare pieces from the Middle Ages showcasing religious and cultural themes',
              category: 'historical',
              imageUrl: '/assets/images/gallery7.jpg',
              imageCount: 18,
              featured: false,
              createdAt: '2023-01-30'
            },
            {
              id: '8',
              title: 'Impressionist Wonders',
              description: 'Light and color as captured by the Impressionist masters',
              category: 'classical',
              imageUrl: '/assets/images/gallery8.jpg',
              imageCount: 45,
              featured: true,
              createdAt: '2023-08-02'
            }
          ];

          setGalleries(mockGalleries);
          setLoading(false);
        }, 1000);

      } catch (err) {
        console.error('Error fetching galleries:', err);
        setError('Failed to load galleries. Please try again.');
        setLoading(false);
      }
    };

    fetchGalleries();
  }, [isAuthenticated, navigate]);

  // Filter galleries based on search term and selected category
  const filteredGalleries = galleries.filter(gallery => {
    const matchesSearch = gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gallery.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || gallery.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle gallery click to navigate to detail page
  const handleGalleryClick = (galleryId) => {
    navigate(`/gallery/${galleryId}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Galleries</h1>
        <p className="text-gray-600">Discover our curated collection of art galleries</p>

        {/* Search and filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search galleries..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center p-12">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {!loading && !error && (
        <>
          {filteredGalleries.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg shadow-md">
              <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No galleries found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalleries.map(gallery => (
                <div 
                  key={gallery.id}
                  onClick={() => handleGalleryClick(gallery.id)}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
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
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{gallery.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{gallery.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categories.find(cat => cat.id === gallery.category)?.name || 'Uncategorized'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(gallery.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GalleriesPage;