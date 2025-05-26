import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ArtistContext } from './context';

export const ArtistProvider = ({ children }) => {
  const { user } = useAuth();
  const [artistProfile, setArtistProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'artist') {
      loadArtistData();
    }
  }, [user]);

  const loadArtistData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API calls with setTimeout
      setTimeout(() => {
        // Mock artist profile
        setArtistProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          bio: 'Contemporary artist specializing in digital and traditional media.',
          website: 'https://example.com',
          socialLinks: {
            instagram: 'artist_handle',
            twitter: 'artist_handle'
          }
        });

        // Mock galleries data
        setGalleries([
          {
            id: 'g1',
            name: 'Digital Art Collection',
            description: 'A collection of contemporary digital artworks',
            category: 'digital',
            coverImage: '/assets/images/gallery1.jpg',
            artworkCount: 5
          },
          {
            id: 'g2',
            name: 'Traditional Paintings',
            description: 'Oil and acrylic paintings on canvas',
            category: 'painting',
            coverImage: '/assets/images/gallery2.jpg',
            artworkCount: 3
          }
        ]);

        // Mock artworks data
        setArtworks([
          {
            id: 'a1',
            title: 'Digital Dreams',
            description: 'Abstract digital composition',
            category: 'digital',
            price: 499.99,
            galleryId: 'g1',
            imageUrl: '/assets/images/artwork1.jpg',
            createdAt: '2023-01-15'
          },
          {
            id: 'a2',
            title: 'Sunset Reflections',
            description: 'Oil painting of a dramatic sunset',
            category: 'painting',
            price: 899.99,
            galleryId: 'g2',
            imageUrl: '/assets/images/artwork2.jpg',
            createdAt: '2023-02-20'
          }
        ]);

      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGallery = async (galleryData) => {
    setLoading(true);
    try {
      // Mock API call with setTimeout
      const newGallery = await new Promise((resolve) => {
        setTimeout(() => {
          const gallery = {
            id: `g${Date.now()}`,
            ...galleryData,
            artworkCount: 0,
            createdAt: new Date().toISOString()
          };
          resolve(gallery);
        }, 1000);
      });

      setGalleries(prev => [...prev, newGallery]);
      return newGallery;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGallery = async (galleryId, updates) => {
    setLoading(true);
    try {
      // Mock API call with setTimeout
      const updatedGallery = await new Promise((resolve) => {
        setTimeout(() => {
          const gallery = galleries.find(g => g.id === galleryId);
          const updated = { ...gallery, ...updates };
          resolve(updated);
        }, 1000);
      });

      setGalleries(prev => prev.map(g => g.id === galleryId ? updatedGallery : g));
      return updatedGallery;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadArtwork = async (artworkData) => {
    setLoading(true);
    try {
      // Mock API call with setTimeout
      const newArtwork = await new Promise((resolve) => {
        setTimeout(() => {
          // In a real app, we would upload images to storage and get URLs back
          const images = artworkData.getAll('images');
          const mockImageUrls = Array.from({ length: images.length }, 
            (_, i) => `/assets/images/artwork${Date.now()}-${i}.jpg`);

          const artwork = {
            id: `a${Date.now()}`,
            title: artworkData.get('title'),
            description: artworkData.get('description'),
            category: artworkData.get('category'),
            price: parseFloat(artworkData.get('price')),
            galleryId: artworkData.get('galleryId'),
            dimensions: artworkData.get('dimensions'),
            medium: artworkData.get('medium'),
            year: parseInt(artworkData.get('year')),
            imageUrls: mockImageUrls,
            thumbnailUrl: mockImageUrls[0], // Use first image as thumbnail
            createdAt: new Date().toISOString()
          };
          resolve(artwork);
        }, 1500);
      });

      setArtworks(prev => [...prev, newArtwork]);

      // Update artwork count in gallery
      const galleryId = artworkData.get('galleryId');
      if (galleryId) {
        setGalleries(prev => prev.map(g => {
          if (g.id === galleryId) {
            return { ...g, artworkCount: (g.artworkCount || 0) + 1 };
          }
          return g;
        }));
      }

      return newArtwork;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteArtwork = async (artworkId) => {
    setLoading(true);
    try {
      // Mock API call with setTimeout
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      const artwork = artworks.find(a => a.id === artworkId);
      if (artwork?.galleryId) {
        // Update artwork count in gallery
        setGalleries(prev => prev.map(g => {
          if (g.id === artwork.galleryId) {
            return { ...g, artworkCount: Math.max(0, (g.artworkCount || 1) - 1) };
          }
          return g;
        }));
      }

      setArtworks(prev => prev.filter(a => a.id !== artworkId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArtistContext.Provider
      value={{
        artistProfile,
        artworks,
        galleries,
        loading,
        error,
        createGallery,
        updateGallery,
        uploadArtwork,
        deleteArtwork,
      }}
    >
      {children}
    </ArtistContext.Provider>
  );
};
