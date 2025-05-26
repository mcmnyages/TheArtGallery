import { useContext } from 'react';
import { ArtistContext } from '../contexts/ArtistContext/context';

export const useArtist = () => useContext(ArtistContext);
