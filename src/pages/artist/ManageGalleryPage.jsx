import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { galleryService } from '../../services/galleryService';
import PageContainer from '../../components/layout/PageContainer';

const ManageGalleryPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState('all');  useEffect(() => {
    const fetchArtistGalleries = async () => {
      try {
        setLoading(true);        console.log('Fetching artist galleries...');
        const galleries = await galleryService.fetchGalleryGroups();
        console.log('Fetched artist galleries:', galleries);
        setGalleries(galleries || []);
      } catch (err) {
        console.error('Error fetching artist galleries:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistGalleries();
  }, [user]);

  // Filter galleries and their images based on selection
  const filteredGalleryContent = selectedGallery === 'all'
    ? galleries
    : galleries.filter(gallery => gallery._id === selectedGallery);

  const handleDeleteGallery = async (galleryId) => {
    if (!confirm('Are you sure you want to delete this gallery?')) return;
    
    try {
      setLoading(true);
      await galleryService.deleteGalleryGroup(galleryId);
      setGalleries(galleries.filter(g => g._id !== galleryId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Manage Your Gallery
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Organize and manage your artwork collections
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/artist/gallery/create')}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Create Gallery
            </button>
            <button
              onClick={() => navigate('/artist/upload')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Upload Art
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Gallery Filter */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter by Gallery
              </label>
              <select
                value={selectedGallery}
                onChange={(e) => setSelectedGallery(e.target.value)}
                className={`w-64 p-2 border rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Galleries</option>
                {galleries.map(gallery => (
                  <option key={gallery._id} value={gallery._id}>
                    {gallery.name} ({gallery.images?.length || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Galleries Grid */}
            <div className="space-y-8">
              {filteredGalleryContent.length === 0 ? (
                <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No galleries found. Create your first gallery to get started!
                </div>
              ) : (
                filteredGalleryContent.map(gallery => (
                  <div 
                    key={gallery._id}
                    className={`rounded-lg overflow-hidden shadow-md ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {gallery.name}
                          </h3>
                          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {gallery.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteGallery(gallery._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <span className="sr-only">Delete Gallery</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {gallery.images && gallery.images.length > 0 ? (
                          gallery.images.map(image => (
                            <div 
                              key={image._id}
                              className="relative group"
                            >
                              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                                <img
                                  src={image.imageUrl}
                                  alt={image.imageId}
                                  className="object-cover group-hover:opacity-75 transition-opacity"
                                />
                              </div>
                              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Added: {new Date(image.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className={`col-span-full text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No images in this gallery yet. Upload some artwork to get started!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default ManageGalleryPage;
