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
  async getArtistImages(): Promise<GalleryImage[]> {
    try {
      const headers = await this.getAuthenticatedHeaders();      console.log('Making request to fetch artist images...');
      const response = await axios.get<{ success: boolean, imageUrls: string[][] }>('/api/v0.1/gallery', { 
        headers,
        withCredentials: true 
      });
      console.log('Raw API Response status:', response.status);
      console.log('Raw API Response data:', JSON.stringify(response.data, null, 2));

      if (!response.data.success || !response.data.imageUrls) {
        console.error('Invalid response format:', response.data);
        return [];
      }

      // Transform the nested array of URLs into GalleryImage objects
      const images: GalleryImage[] = response.data.imageUrls.flat().map((url, index) => ({
        imageId: `img-${index}`,
        imageUrl: url,
        _id: `img-${index}`,
        createdAt: new Date().toISOString(),
        sharedWith: []
      }));

      console.log('Transformed images:', images);
      return images;
    } catch (error) {
      console.error('Error fetching artist images:', error);
      throw error;
    }
  }  async deleteArtistImage(imageId: string): Promise<void> {
    try {
      const headers = await this.getAuthenticatedHeaders();      await axios.delete(`/api/v0.1/gallery/images/${imageId}`, { 
        headers,
        withCredentials: true 
      });
    } catch (error) {
      console.error('Error deleting artist image:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Please login to access this content');
      }
      throw error;
    }
  }
  async updateArtistImage(imageId: string, updates: Partial<GalleryImage>): Promise<GalleryImage> {
    try {
      const headers = await this.getAuthenticatedHeaders();      const response = await axios.patch<{ image: GalleryImage }>(
        `/api/v0.1/gallery/images/${imageId}`, 
        updates, 
        { 
          headers,
          withCredentials: true 
        }
      );
      return response.data.image;    } catch (error) {
      console.error('Error updating artist image:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Please login to access this content');
      }
      throw error;
    }
  }

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
  }  // Fetch all galleries (public + private)
  async fetchAllGalleryGroups(): Promise<GalleryGroup[]> {
    try {
      console.log('Fetching all gallery groups...');
      const headers = await this.getAuthenticatedHeaders();
      const url = '/api/groups/all';
      console.log('Making request to:', url);
      
      const response = await axios.get<GalleryGroupsResponse>(url, { 
        headers,
        withCredentials: true
      });
      
      console.log('All galleries response:', response.data);
      return response.data.groups || [];
    } catch (error) {
      console.error('Error fetching all gallery groups:', error);
      throw error;
    }
  }

  // Fetch only artist's galleries
  async fetchGalleryGroups(): Promise<GalleryGroup[]> {
    try {
      console.log('Fetching artist gallery groups...');
      const headers = await this.getAuthenticatedHeaders();
      const url = '/api/groups';
      console.log('Making request to:', url);
      
      const response = await axios.get<GalleryGroupsResponse>(url, { 
        headers,
        withCredentials: true
      });
      
      console.log('Gallery response data:', response.data);
      return response.data.groups || [];
    } catch (error) {
      console.error('Error fetching gallery groups:', error);
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

  async deleteGalleryGroup(groupId: string): Promise<void> {
    try {
      console.log('Deleting gallery group:', groupId);
      const headers = await this.getAuthenticatedHeaders();
      const url = `/api/groups/${groupId}`;
      
      await axios.delete(url, { 
        headers,
        withCredentials: true,
        validateStatus: (status) => status < 500
      });
    } catch (error) {
      console.error('Error deleting gallery group:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Please login to access this content');
      }
      throw error;
    }
  }

  async uploadArtistImage(formData: FormData): Promise<GalleryImage> {
    try {
      const headers = await this.getAuthenticatedHeaders();
      // Remove content-type from headers as it will be set automatically with FormData      delete headers['Content-Type'];      console.log('Uploading image...');
      const response = await axios.post<{ success: boolean; imageUrl: string }>('/uploads', formData, {
        headers,
        withCredentials: true,
        validateStatus: (status) => status < 500  // Handle 4xx errors gracefully
      });

      console.log('Upload response:', response.data);

      if (!response.data.success || !response.data.imageUrl) {
        throw new Error('Invalid response from server');
      }

      // Return the new image object
      return {
        imageId: `img-${Date.now()}`,
        imageUrl: response.data.imageUrl,
        _id: `img-${Date.now()}`,
        createdAt: new Date().toISOString(),
        sharedWith: []
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload image');
      }
      throw error;
    }
  }

  async fetchUserGalleries(userId: string): Promise<GalleryGroup[]> {
    try {
      console.log('Starting fetchUserGalleries for user:', userId);
      const headers = await this.getAuthenticatedHeaders();
      const url = `/api/groups/user/${userId}`;
      console.log('Making request to:', url);
      
      const response = await axios.get<GalleryGroupsResponse>(url, { 
        headers,
        withCredentials: true,
        validateStatus: (status) => status < 500
      });
      
      console.log('User galleries raw response:', response);
      console.log('User galleries response data:', response.data);

      if (!response.data || !response.data.groups) {
        console.warn('Unexpected response format:', response.data);
        return [];
      }

      return response.data.groups;
    } catch (error) {
      console.error('Error in fetchUserGalleries:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  }
}

export const galleryService = new GalleryService();
