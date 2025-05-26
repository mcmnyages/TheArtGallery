import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getTokens } from '../services/tokenService';

const API_URL = 'https://authentication.secretstartups.org/v0.1';

export const useGallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [currentGallery, setCurrentGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch all gallery groups
  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const tokens = getTokens();
      if (!tokens?.accessToken) {
        throw new Error('No access token found');
      }
      
      const response = await axios.get(`${API_URL}/groups`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });
      
      setGalleries(response.data);
    } catch (err) {
      console.error('Error fetching galleries:', err);
      setError('Failed to load galleries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch a single gallery and its images
  const fetchGallery = useCallback(async (galleryId) => {
    setLoading(true);
    setError(null);
    
    try {
      const tokens = getTokens();
      if (!tokens?.accessToken) {
        throw new Error('No access token found');
      }
      
      // Fetch gallery details
      const galleryResponse = await axios.get(`${API_URL}/groups/${galleryId}`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });
      
      setCurrentGallery(galleryResponse.data);
      
      // Fetch gallery images
      const imagesResponse = await axios.get(`${API_URL}/groups/${galleryId}/images`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });
      
      setImages(imagesResponse.data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sample data for pre-login carousel (public galleries)
  const getSampleGalleries = useCallback(() => {
    return [
      {
        id: 'sample-1',
        name: 'Nature Collection',
        description: 'Beautiful landscapes and natural wonders',
        thumbnail: '/assets/images/sample-nature.jpg',
        imageCount: 12
      },
      {
        id: 'sample-2',
        name: 'Urban Architecture',
        description: 'Modern city designs from around the world',
        thumbnail: '/assets/images/sample-architecture.jpg',
        imageCount: 8
      },
      {
        id: 'sample-3',
        name: 'Abstract Art',
        description: 'Contemporary abstract pieces and patterns',
        thumbnail: '/assets/images/sample-abstract.jpg',
        imageCount: 15
      }
    ];
  }, []);
  
  // Sample images for the homepage carousel
  const getSampleCarouselImages = useCallback(() => {
    return [
      {
        id: 1,
        url: '/assets/images/carousel-1.jpg',
        alt: 'Scenic mountain landscape',
        caption: 'Explore beautiful landscapes',
        description: 'High-resolution nature photography from our premium collection'
      },
      {
        id: 2,
        url: '/assets/images/carousel-2.jpg',
        alt: 'Modern architecture',
        caption: 'Discover architectural wonders',
        description: 'Curated selection of stunning buildings and structures'
      },
      {
        id: 3,
        url: '/assets/images/carousel-3.jpg',
        alt: 'Abstract patterns',
        caption: 'Experience abstract art',
        description: 'Immerse yourself in colors, shapes, and patterns'
      }
    ];
  }, []);
  
  return {
    galleries,
    currentGallery,
    images,
    loading,
    error,
    fetchGalleries,
    fetchGallery,
    getSampleGalleries,
    getSampleCarouselImages
  };
};

export default useGallery;