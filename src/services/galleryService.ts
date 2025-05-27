import axios from 'axios';
import * as tokenService from './tokenService';
import { authService } from './authService';

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

    const headers = {
      'Authorization': `Bearer ${tokenService.getAccessToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    console.log('Using headers:', headers);
    return headers;
  }

  async fetchGalleryGroups(): Promise<GalleryGroup[]> {
    try {
      console.log('Fetching gallery groups...');
      const headers = await this.getAuthenticatedHeaders();
      const url = '/api/groups/all';
      console.log('Making request to:', url);
      
      const response = await axios.get<GalleryGroupsResponse>(url, { headers });
      console.log('Gallery groups response:', response.data);
      
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
      const url = `/api/groups/${id}`;
      console.log('Making request to:', url);
      
      const response = await axios.get<{ message: string, group: GalleryGroup }>(url, { headers });
      console.log('Gallery group response:', response.data);
      
      return response.data.group || null;
    } catch (error) {
      console.error('Error fetching gallery group:', error);
      throw error;
    }
  }
}

export const galleryService = new GalleryService();
