import { useState, useEffect, useCallback } from 'react';
import { galleryService } from '../services/galleryService';

export const useGallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [currentGallery, setCurrentGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    isPublic: null,
    isActive: null,
    currency: null,
    priceRange: { min: null, max: null }
  });

  // Expected gallery format from API:
  // {
  //   _id: string;
  //   userId: string;
  //   name: string;
  //   description: string;
  //   images: Array<{
  //     imageId: string;
  //     imageUrl: string;
  //     _id: string;
  //     createdAt: string;
  //   }>;
  //   basePrice: number;
  //   baseCurrency: string;
  //   isActive: boolean;
  //   isPublic: boolean;
  //   tags: string[];
  //   subscriptionOptions: any[];
  //   subscriptions: any[];
  //   createdAt: string;
  //   updatedAt: string;
  // }

  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching all public galleries from service');
      const groups = await galleryService.fetchAllGalleryGroups();
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

  // Filter galleries based on current filters
  const getFilteredGalleries = useCallback(() => {
    return galleries.filter(gallery => {
      let matches = true;

      if (filters.isPublic !== null) {
        matches = matches && gallery.isPublic === filters.isPublic;
      }
      
      if (filters.isActive !== null) {
        matches = matches && gallery.isActive === filters.isActive;
      }

      if (filters.currency) {
        matches = matches && gallery.baseCurrency === filters.currency;
      }

      if (filters.priceRange.min !== null) {
        matches = matches && gallery.basePrice >= filters.priceRange.min;
      }

      if (filters.priceRange.max !== null) {
        matches = matches && gallery.basePrice <= filters.priceRange.max;
      }

      return matches;
    });
  }, [galleries, filters]);

  // Get unique currencies from all galleries
  const getAvailableCurrencies = useCallback(() => {
    return [...new Set(galleries.map(gallery => gallery.baseCurrency))];
  }, [galleries]);

  // Get price range (min/max) for all galleries
  const getPriceRange = useCallback(() => {
    if (galleries.length === 0) return { min: 0, max: 0 };
    
    return galleries.reduce((acc, gallery) => ({
      min: Math.min(acc.min, gallery.basePrice),
      max: Math.max(acc.max, gallery.basePrice)
    }), { min: Infinity, max: -Infinity });
  }, [galleries]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      isPublic: null,
      isActive: null,
      currency: null,
      priceRange: { min: null, max: null }
    });
  }, []);

  return {
    galleries,
    currentGallery,
    loading,
    error,
    filters,
    fetchGalleries,
    fetchGalleryById,
    getFilteredGalleries,
    getAvailableCurrencies,
    getPriceRange,
    updateFilters,
    resetFilters
  };
};

export default useGallery;