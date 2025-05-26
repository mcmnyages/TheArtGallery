import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApi } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';

const ArtistContext = createContext();

export const useArtist = () => {
  const context = useContext(ArtistContext);
  if (!context) {
    throw new Error('useArtist must be used within an ArtistProvider');
  }
  return context;
};

export const ArtistProvider = ({ children }) => {
  const { user } = useAuth();
  const [artistProfile, setArtistProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id && user.role === 'artist') {
      loadArtistData();
    }
  }, [user]);

  const loadArtistData = async () => {
    setLoading(true);
    try {
      const [artworksData, galleriesData] = await Promise.all([
        mockApi.getArtworksByArtist(user.id),
        mockApi.getGalleriesByArtist(user.id)
      ]);
      setArtworks(artworksData);
      setGalleries(galleriesData);
      setArtistProfile(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const createGallery = async (galleryData) => {
    setLoading(true);
    try {
      const newGallery = await mockApi.createGallery({
        ...galleryData,
        artistId: user.id
      });
      setGalleries([...galleries, newGallery]);
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
      const updatedGallery = await mockApi.updateGallery(galleryId, updates);
      setGalleries(galleries.map(g => g.id === galleryId ? updatedGallery : g));
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
      const newArtwork = await mockApi.createArtwork({
        ...artworkData,
        artistId: user.id
      });
      setArtworks([...artworks, newArtwork]);
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
      await mockApi.deleteArtwork(artworkId);
      setArtworks(artworks.filter(art => art.id !== artworkId));
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

export default ArtistContext;
