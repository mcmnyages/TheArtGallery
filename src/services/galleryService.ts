import axios, { AxiosProgressEvent } from 'axios';
import * as tokenService from './tokenService';

// Base URL for gallery API endpoints
const API_URLS = {
  GALLERY: '/gallery'  // Base path for all gallery-related endpoints
};

export interface CreateGalleryGroupRequest {
  name: string;
  description: string;
  imageIds: string[];
  basePrice?: number;
  baseCurrency?: string;
}

export interface GalleryGroupResponse {
  message: string;
  group: GalleryGroup;
}

export interface GalleryImage {
  imageId: string;
  _id: string;
  signedUrl?: string;
  createdAt?: string;
  sharedWith?: string[];
}

export interface GalleryGroup {
  _id: string;
  userId: string;
  name: string;
  description: string;
  images: GalleryImage[];
  sharedWith: string[];
  createdAt: string;
  basePrice?: number;
  baseCurrency?: string;
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

    // Always include the ngrok-skip-browser-warning header
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${tokenService.getAccessToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    console.log('Using headers:', headers);
    return headers;
  }

  private async getSignedUrls(): Promise<Array<{ imageId: string; signedUrl: string }>> {
    try {
      console.log('Fetching signed URLs');
      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/signed-urls`;
      const response = await axios.get<{ success: boolean; urls: Array<{ imageId: string; signedUrl: string }> }>(
        url,
        {
          headers,
          withCredentials: true
        }
      );

      console.log('Signed URLs response:', response.data);
      if (!response.data.success || !response.data.urls) {
        throw new Error('Failed to fetch signed URLs');
      }

      return response.data.urls;
    } catch (error) {
      console.error('Error fetching signed URLs:', error);
      throw error;
    }
  }

  public async fetchAllGalleryGroups(): Promise<GalleryGroup[]> {
    try {
      const headers = await this.getAuthenticatedHeaders();
      const response = await axios.get<GalleryGroupsResponse>(`${API_URLS.GALLERY}/groups`, {
        headers,
        withCredentials: true
      });

      if (!response.data.groups) {
        return [];
      }

      // Get signed URLs for all images
      const signedUrlsResponse = await this.getSignedUrls();
      const signedUrlMap = new Map(signedUrlsResponse.map(({ imageId, signedUrl }) => [imageId, signedUrl]));

      // Update each gallery's images with signed URLs
      const galleriesWithSignedUrls = response.data.groups.map(gallery => ({
        ...gallery,
        images: gallery.images.map(image => ({
          ...image,
          signedUrl: signedUrlMap.get(image.imageId) || ''
        }))
      }));

      console.log('Fetched gallery groups with signed URLs:', galleriesWithSignedUrls);
      return galleriesWithSignedUrls;
    } catch (error) {
      console.error('Error fetching gallery groups:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Please login to access this content');
      }
      throw error;
    }
  }

  public async fetchGalleryGroups(): Promise<GalleryGroup[]> {
    try {
      console.log('Fetching artist gallery groups...');
      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/groups`;
      
      // Get gallery groups
      const response = await axios.get<GalleryGroupsResponse>(url, { 
        headers,
        withCredentials: true
      });

      if (!response.data.groups) {
        return [];
      }

      // Get signed URLs for all images
      const allImageIds = response.data.groups
        .flatMap(group => group.images.map(img => img.imageId))
        .filter((id): id is string => !!id);

      if (allImageIds.length > 0) {
        const signedUrlsResponse = await this.getSignedUrls();
        const signedUrlMap = new Map(signedUrlsResponse.map(({ imageId, signedUrl }) => [imageId, signedUrl]));

        // Add signed URLs to images in gallery groups
        const groupsWithSignedUrls = response.data.groups.map(group => ({
          ...group,
          images: group.images.map(image => ({
            ...image,
            signedUrl: signedUrlMap.get(image.imageId) || ''
          }))
        }));

        return groupsWithSignedUrls;
      }
      
      return response.data.groups;
    } catch (error) {
      console.error('Error fetching gallery groups:', error);
      throw error;
    }
  }

  public async fetchGalleryGroupById(id: string): Promise<GalleryGroup | null> {
    try {
      console.log('Fetching gallery group by ID:', id);
      
      // First try to get all galleries
      const allGalleries = await this.fetchAllGalleryGroups();
      const gallery = allGalleries.find(g => g._id === id);

      if (!gallery) {
        console.warn('No gallery group found with ID:', id);
        return null;
      }

      if (gallery.images?.length > 0) {
        const signedUrlsResponse = await this.getSignedUrls();
        const signedUrlMap = new Map(signedUrlsResponse.map(({ imageId, signedUrl }) => [imageId, signedUrl]));

        gallery.images = gallery.images.map(image => ({
          ...image,
          signedUrl: signedUrlMap.get(image.imageId) || ''
        }));
      }

      console.log('Found gallery with signed URLs:', gallery);
      return gallery;
    } catch (error) {
      console.error('Error fetching gallery group by ID:', error);
      throw error;
    }
  }

  public async deleteGalleryGroup(groupId: string): Promise<void> {
    try {
      console.log('Deleting gallery group:', groupId);
      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/groups/${groupId}`;
      await axios.delete(url, {
        headers,
        withCredentials: true
      });
    } catch (error) {
      console.error('Error deleting gallery group:', error);
      throw error;
    }
  }

  public async uploadArtistImage(formData: FormData, onProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<GalleryImage> {
    try {
      const headers = await this.getAuthenticatedHeaders();
      headers['ngrok-skip-browser-warning'] = 'true';
      delete headers['Content-Type']; // Let browser set this for FormData

      const uploadFormData = new FormData();
      const file = formData.get('images');
      if (!file) {
        throw new Error('No file provided');
      }

      uploadFormData.append('images', file as Blob);
      const type = formData.get('type');
      if (type) {
        uploadFormData.append('type', type as string);
      }

      const response = await axios.post<{
        success: boolean;
        images: GalleryImage[];
      }>(`${API_URLS.GALLERY}/upload`, uploadFormData, {
        headers,
        withCredentials: true,
        onUploadProgress: onProgress
      });

      console.log('Upload response:', response.data);
      if (!response.data.images || !response.data.images.length) {
        throw new Error('No images were uploaded');
      }

      const uploadedImage = response.data.images[0];
      return uploadedImage;
    } catch (error) {
      console.error('Error uploading artist image:', error);
      throw error;
    }
  }

  public async uploadImage(file: File): Promise<GalleryImage> {
    try {
      console.log('Uploading image...');
      const headers = await this.getAuthenticatedHeaders();
      const formData = new FormData();
      formData.append('image', file);
      delete headers['Content-Type'];

      const response = await axios.post<{
        success: boolean;
        image: GalleryImage;
      }>(`${API_URLS.GALLERY}/upload`, formData, {
        headers,
        withCredentials: true
      });

      console.log('Upload response:', response.data);
      return response.data.image;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  public async createGalleryGroup(data: CreateGalleryGroupRequest): Promise<GalleryGroup & { message?: string }> {
    try {
      console.log('Creating gallery group with data:', data);
        // Validate request data
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new Error('Name is required and must be a string');
      }
      if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
        throw new Error('Description is required and must be a string');
      }
      if (!Array.isArray(data.imageIds) || data.imageIds.length === 0) {
        throw new Error('At least one image is required');
      }
      // Validate each imageId is a non-empty string
      if (data.imageIds.some(id => typeof id !== 'string' || id.trim().length === 0)) {
        throw new Error('All image IDs must be valid strings');
      }

      // Prepare request data with optional price info
      const requestData: CreateGalleryGroupRequest = {
        name: data.name.trim(),
        description: data.description.trim(),
        imageIds: data.imageIds,
      };

      // Only add price info if both price and currency are provided
      if (data.basePrice !== undefined && data.basePrice !== null) {
        const price = Number(data.basePrice);
        if (isNaN(price) || price < 0) {
          throw new Error('Base price must be a positive number');
        }
        requestData.basePrice = price;
        
        if (!data.baseCurrency || typeof data.baseCurrency !== 'string' || data.baseCurrency.trim().length === 0) {
          throw new Error('Base currency is required when price is provided');
        }
        requestData.baseCurrency = data.baseCurrency.trim();
      }

      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/groups`;      const response = await axios.post<GalleryGroupResponse>(
        url,
        requestData,
        {
          headers,
          withCredentials: true
        }
      );

      console.log('Gallery creation response:', response.data);
      if (!response.data.group) {
        throw new Error(response.data.message || 'Failed to create gallery group');
      }

      let group = response.data.group;
      if (group.images?.length > 0) {
        const signedUrlsResponse = await this.getSignedUrls();
        const signedUrlMap = new Map(signedUrlsResponse.map(({ imageId, signedUrl }) => [imageId, signedUrl]));

        group = {
          ...group,
          images: group.images.map(image => ({
            ...image,
            signedUrl: signedUrlMap.get(image.imageId) || ''
          }))
        };
      }

      return {
        ...group,
        message: response.data.message
      };
    } catch (error) {
      console.log('You tried with this data:',data, 'and got formarted to this:');
      console.error('Error creating gallery group:', error);
      throw error;
    }
  }

  public async addImagesToGalleryGroup(galleryId: string, imageIds: string[]): Promise<GalleryGroup> {
    try {
      console.log('Adding images to gallery group:', { galleryId, imageIds });
      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/groups/${galleryId}`;

      const requestData = {
        imageIds,
        action: 'add' as const
      };

      console.log('Request payload:', JSON.stringify(requestData, null, 2));
      const response = await axios.put<{ message: string; group: GalleryGroup }>(
        url,
        requestData,
        {
          headers,
          withCredentials: true
        }
      );

      console.log('Add images response:', response.data);
      if (!response.data.group) {
        throw new Error(response.data.message || 'Failed to add images to gallery group');
      }
      return response.data.group;
    } catch (error) {
      console.error('Error adding images to gallery group:', error);
      throw error;
    }
  }

  public async removeImagesFromGalleryGroup(galleryId: string, imageIds: string[]): Promise<GalleryGroup> {
    try {
      console.log('Removing images from gallery group:', { galleryId, imageIds });
      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/groups/${galleryId}`;

      const requestData = {
        imageIds,
        action: 'remove' as const
      };

      console.log('Request payload:', JSON.stringify(requestData, null, 2));
      const response = await axios.put<{ message: string; group: GalleryGroup }>(
        url,
        requestData,
        {
          headers,
          withCredentials: true
        }
      );

      console.log('Remove images response:', response.data);
      if (!response.data.group) {
        throw new Error(response.data.message || 'Failed to remove images from gallery group');
      }
      return response.data.group;
    } catch (error) {
      console.error('Error removing images from gallery group:', error);
      throw error;
    }
  }

  public async getArtistImages(): Promise<GalleryImage[]> {
    try {
      const headers = await this.getAuthenticatedHeaders();
      console.log('Making request to fetch artist images...');
      
      // Get image metadata from /images endpoint
      const imagesResponse = await axios.get<{ success: boolean; images: GalleryImage[] }>(
        `${API_URLS.GALLERY}/images`, 
        { 
          headers,
          withCredentials: true 
        }
      );
      
      if (!imagesResponse.data.success || !imagesResponse.data.images) {
        console.error('No images found in response:', imagesResponse.data);
        return [];
      }

      // Get signed URLs from /signed-urls endpoint
      const signedUrlsResponse = await this.getSignedUrls();
      const signedUrlMap = new Map(signedUrlsResponse.map(({ imageId, signedUrl }) => [imageId, signedUrl]));      // Combine image metadata with signed URLs
      const combinedImages = imagesResponse.data.images.map(image => ({
        ...image,
        imageUrl: signedUrlMap.get(image.imageId) || '', // Keep signed URL in imageUrl for display
        _id: image._id, // Ensure _id is included
        mongoId: image._id // Add an explicit mongoId field to make it clear this is the ID we want to use
      }));

      console.log('Combined images with signed URLs:', combinedImages);
      return combinedImages;
    } catch (error) {
      console.error('Error fetching artist images:', error);
      throw error;
    }
  }
}

export const galleryService = new GalleryService();
