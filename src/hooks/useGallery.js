import { useState, useEffect, useCallback } from 'react';
import { galleryService } from '../services/galleryService';

export const useGallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [currentGallery, setCurrentGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Expected gallery format from API:
  // {
  //   _id: string;
  //   name: string;
  //   description: string;
  //   images: Array<{
  //     imageId: string;
  //     imageUrl: string;
  //     _id: string;
  //     createdAt: string;
  //   }>;
  //   createdAt: string;
  // }

  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching all galleries from service');
      const groups = await galleryService.fetchGalleryGroups();
      console.log('Received galleries:', groups);
      setGalleries(groups || []); // Ensure we always have an array
    } catch (err) {
      console.error('Error fetching galleries:', err);
      setError(err.message || 'Failed to load galleries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchGalleryById = useCallback(async (galleryId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching single gallery by ID:', galleryId);
      const gallery = await galleryService.fetchGalleryGroupById(galleryId);
      console.log('Received gallery details:', gallery);
      setCurrentGallery(gallery);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    galleries,
    currentGallery,
    loading,
    error,
    fetchGalleries,
    fetchGalleryById
  };
};

export default useGallery;