import axios from 'axios';
import * as tokenService from './tokenService';

export interface GalleryImage {
  imageId: string;
  imageUrl: string;
  _id: string;
  createdAt: string;
  sharedWith: string[];
}

export interface GalleryGroup {
  _id: string;
  userId: string;
  name: string;
  description: string;
  images: GalleryImage[];
  sharedWith: string[];
  createdAt: string;
  __v: number;
}

export interface GalleryGroupsResponse {
  message: string;
  groups: GalleryGroup[];
}

export class GalleryService {
  private baseUrl = import.meta.env.VITE_NGROK_API_URL;

  private async getAuthenticatedHeaders(): Promise<Record<string, string>> {
    const token = tokenService.getAccessToken();
    console.log('Current access token:', token);
    
    if (!token || tokenService.isTokenExpired()) {
      console.log('Token is missing or expired, attempting refresh');
      try {
        const refreshed = await tokenService.refreshAccessToken();
        if (!refreshed) {
          throw new Error('Failed to refresh token');
        }
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Token refresh failed:', error);
        throw new Error('Authentication required');
      }
    }

    // Always include the ngrok-skip-browser-warning header
    const headers = {
      'Authorization': `Bearer ${tokenService.getAccessToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    console.log('Using headers:', headers);
    return headers;
  }

  async fetchGalleryGroups(): Promise<GalleryGroup[]> {
    try {
      console.log('Fetching gallery groups...');
      const headers = await this.getAuthenticatedHeaders();
      const url = '/api/groups/all';  // Use the proxied path
      console.log('Making request to:', url);
      
      const response = await axios.get<GalleryGroupsResponse>(url, { 
        headers,
        withCredentials: true,
        validateStatus: (status) => status < 500 // Handle 4xx errors gracefully
      });
      
      console.log('Gallery groups response:', response.data);
      return response.data.groups || [];
    } catch (error) {
      console.error('Error fetching gallery groups:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Handle unauthorized error
        throw new Error('Please login to access this content');
      }
      throw error;
    }
  }

  async fetchGalleryGroupById(id: string): Promise<GalleryGroup | null> {
    try {
      console.log('Fetching gallery group by ID:', id);
      const headers = await this.getAuthenticatedHeaders();
      const url = `/api/groups/${id}`; // Use the proxied path
      console.log('Making request to:', url);
      
      const response = await axios.get<{ message: string, group: GalleryGroup }>(url, { 
        headers,
        withCredentials: true,
        validateStatus: (status) => status < 500
      });
      
      console.log('Gallery group response:', response.data);
      return response.data.group || null;
    } catch (error) {
      console.error('Error fetching gallery group:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Please login to access this content');
      }
      throw error;
    }
  }
}

export const galleryService = new GalleryService();
