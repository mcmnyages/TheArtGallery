import axios, { AxiosProgressEvent } from 'axios';
import * as tokenService from './tokenService';

// Base URL for gallery API endpoints
const API_URLS = {
  GALLERY: '/gallery'  // Base path for all gallery-related endpoints
};

export interface SubscriptionOption {
  duration: number;
  price: number;
  label: string;
  isActive: boolean;
}

export interface CreateGalleryGroupRequest {
  name: string;
  description: string;
  imageIds: string[];
  baseCurrency: string;
  subscriptionOptions: SubscriptionOption[];
}

export interface GalleryGroupResponse {
  message: string;
  group: GalleryGroup;
  groups?: GalleryGroup[];
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
  baseCurrency: string;
  subscriptionOptions: SubscriptionOption[];
  paymentRequired: boolean;
  __v: number;
}

export interface GalleryGroupsResponse {
  message: string;
  groups: GalleryGroup[];
}

interface Subscription {
  userId: string;
  startDate: string;
  endDate: string;
  duration: number;
  subscriptionType: string;
  paymentReference: string;
  isActive: boolean;
}

export interface PaymentStatus {
  hasAccess: boolean;
  orderId?: string;
  expiresAt?: string;
  message?: string;
  subscription?: Subscription | null;
}

export interface ArtistApplicationResponse {
  message: string;
  success: boolean;
}

export interface ArtistApplication {
  email: string;
  appliedAt: string;
  status: string; // 'pending', 'approved', or 'rejected'
}

export interface ArtistActionResponse {
  message: string;
  success: boolean;
}

export interface Artist {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class GalleryService {
  // Cache for successful payment verifications
  private verifiedPayments = new Map<string, PaymentStatus>();

  public async createSubscription(galleryId: string, subscriptionOption: SubscriptionOption): Promise<Subscription> {
    try {
      console.log('Creating subscription for gallery:', galleryId, subscriptionOption);
      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/subscriptions`;

      const response = await axios.post<{ success: boolean; subscription: Subscription }>(
        url,
        {
          galleryId,
          duration: subscriptionOption.duration,
          price: subscriptionOption.price,
          subscriptionType: subscriptionOption.label
        },
        {
          headers,
          withCredentials: true
        }
      );

      if (!response.data.success || !response.data.subscription) {
        throw new Error('Failed to create subscription');
      }

      console.log('Subscription created:', response.data.subscription);
      return response.data.subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
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
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${tokenService.getAccessToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    console.log('Using headers:', headers);
    return headers;
  }
  private async getSignedUrls(): Promise<GalleryImage[]> {
    try {
      console.log('Fetching signed URLs and image details');
      const headers = await this.getAuthenticatedHeaders();
      
      // Fetch signed URLs
      const signedUrlResponse = await axios.get<{ success: boolean; urls: Array<{ imageId: string; signedUrl: string }> }>(
        `${API_URLS.GALLERY}/signed-urls`,
        {
          headers,
          withCredentials: true
        }
      );
      
      // Fetch image details
      const imagesResponse = await axios.get<{ success: boolean; images: GalleryImage[] }>(
        `${API_URLS.GALLERY}/images`,
        {
          headers,
          withCredentials: true
        }
      );

      if (!signedUrlResponse.data.success || !signedUrlResponse.data.urls) {
        throw new Error('Failed to fetch signed URLs');
      }

      if (!imagesResponse.data.success || !imagesResponse.data.images) {
        throw new Error('Failed to fetch image details');
      }

      // Create a map of signed URLs
      const signedUrlMap = new Map(
        signedUrlResponse.data.urls.map(({ imageId, signedUrl }) => [imageId, signedUrl])
      );

      // Combine image details with signed URLs
      const combinedImages = imagesResponse.data.images.map(image => ({
        ...image,
        signedUrl: signedUrlMap.get(image.imageId) || '',
        mongoId: image._id // Add explicit mongoId field for clarity
      }));

      console.log('Combined images with signed URLs:', combinedImages);
      return combinedImages;
    } catch (error) {
      console.error('Error fetching image data:', error);
      throw error;
    }
  }

  public async fetchAllGalleryGroups(): Promise<GalleryGroup[]> {
    try {
      console.log('Starting fetchAllGalleryGroups...');
      const headers = await this.getAuthenticatedHeaders();
      
      const response = await axios.get<GalleryGroupsResponse>(`${API_URLS.GALLERY}/groups/all`, {
        headers,
        withCredentials: true
      });
      
      console.log('Raw API response:', response.data);

      if (!response.data.groups) {
        console.warn('No groups found in response data');
        return [];
      }

      console.log('Number of groups received:', response.data.groups.length);      // No need to fetch signed URLs if there are no images
      const galleriesWithImages = response.data.groups.filter(gallery => 
        gallery.images && gallery.images.length > 0
      );
      
      console.log('Galleries with images:', galleriesWithImages.map(g => ({
        galleryId: g._id,
        imageCount: g.images.length,
        imageIds: g.images.map(img => img.imageId)
      })));      if (galleriesWithImages.length > 0) {
        console.log('Fetching signed URLs for galleries with images...');
        // Get both image details and signed URLs in parallel
        const [imagesResponse, signedUrlResponse] = await Promise.all([
          axios.get<{ success: boolean; images: GalleryImage[] }>(
            `${API_URLS.GALLERY}/images`,
            {
              headers,
              withCredentials: true
            }
          ),
          axios.get<{ success: boolean; urls: Array<{ imageId: string; signedUrl: string }> }>(
            `${API_URLS.GALLERY}/signed-urls`,
            {
              headers,
              withCredentials: true
            }
          )
        ]);        if (!signedUrlResponse.data.success || !signedUrlResponse.data.urls) {
          throw new Error('Failed to fetch signed URLs');
        }
        
        if (!imagesResponse.data.success || !imagesResponse.data.images) {
          throw new Error('Failed to fetch image details');
        }        // Create map of signed URLs
        const signedUrlMap = new Map(signedUrlResponse.data.urls.map(({ imageId, signedUrl }) => [imageId, signedUrl]));
        
        // Create map of image details
        const imageDetailsMap = new Map(imagesResponse.data.images.map(image => [image._id, image]));
        
        console.log('Created signed URL map with keys:', Array.from(signedUrlMap.keys()));
        console.log('Created image details map with keys:', Array.from(imageDetailsMap.keys()));

        // Debug: Check if we can match image IDs
        const sampleImageId = galleriesWithImages[0]?.images[0]?.imageId;
        if (sampleImageId) {
          console.log('Sample image ID lookup:', {
            imageId: sampleImageId,
            foundUrl: signedUrlMap.get(sampleImageId)
          });
        }        // Update each gallery's images with signed URLs and image details
        const updatedGroups = response.data.groups.map(gallery => ({
          ...gallery,
          images: gallery.images.map(image => {
            // If we have image details from /images endpoint, use them
            const imageDetails = imageDetailsMap.get(image._id);
            if (imageDetails) {
              const signedUrl = signedUrlMap.get(imageDetails.imageId) || '';
              return {
                ...image,
                ...imageDetails,
                signedUrl
              };
            }
            // Otherwise, use the image data from groups/all and match by imageId
            const signedUrl = signedUrlMap.get(image.imageId) || '';
            return {
              ...image,
              signedUrl
            };
          })
        }));

        console.log('First gallery after update:', {
          galleryId: updatedGroups[0]?._id,
          firstImage: updatedGroups[0]?.images[0]
        });

        return updatedGroups;
      }

      // Return galleries as is if no images need signed URLs
      console.log('No images found in galleries, returning without signed URLs');
      return response.data.groups;

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
  }  public async fetchGalleryGroupById(id: string): Promise<GalleryGroup | null> {
    try {
      console.log('Fetching gallery group by ID:', id);
      const headers = await this.getAuthenticatedHeaders();
      
      // Get the specific gallery first
      const response = await axios.get<GalleryGroupResponse>(
        `${API_URLS.GALLERY}/groups/all`,
        {
          headers,
          withCredentials: true
        }
      );

      if (!response.data.groups) {
        console.warn('No groups found in response data');
        return null;
      }

      // Find the specific gallery
      const gallery = response.data.groups.find(g => g._id === id);
      if (!gallery) {
        console.warn('No gallery found with ID:', id);
        return null;
      }

      // If gallery has images, get signed URLs
      if (gallery.images?.length > 0) {
        console.log('Gallery has images, fetching signed URLs...');
        
        // Get signed URLs
        const signedUrlResponse = await axios.get<{ success: boolean; urls: Array<{ imageId: string; signedUrl: string }> }>(
          `${API_URLS.GALLERY}/signed-urls`,
          {
            headers,
            withCredentials: true
          }
        );

        if (!signedUrlResponse.data.success || !signedUrlResponse.data.urls) {
          throw new Error('Failed to fetch signed URLs');
        }

        // Create map of signed URLs
        const signedUrlMap = new Map(
          signedUrlResponse.data.urls.map(({ imageId, signedUrl }) => [imageId, signedUrl])
        );

        // Update gallery images with signed URLs
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
      console.log('Creating gallery group with data:', data);      // Validate request data
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

      // Validate baseCurrency is provided and is USD
      if (!data.baseCurrency || data.baseCurrency !== 'USD') {
        throw new Error('Base currency is required and must be USD');
      }

      // Validate subscription options
      if (!Array.isArray(data.subscriptionOptions) || data.subscriptionOptions.length === 0) {
        throw new Error('At least one subscription option is required');
      }

      // Validate each subscription option
      data.subscriptionOptions.forEach((option, index) => {
        if (!option.duration || !option.price || !option.label) {
          throw new Error(`Subscription option ${index + 1} is missing required fields`);
        }
        if (option.price <= 0) {
          throw new Error(`Subscription option ${index + 1} must have a positive price`);
        }
        if (option.duration <= 0) {
          throw new Error(`Subscription option ${index + 1} must have a positive duration`);
        }
        if (typeof option.isActive !== 'boolean') {
          throw new Error(`Subscription option ${index + 1} must specify if it's active`);
        }
      });      // Prepare request data according to expected structure
      const requestData: CreateGalleryGroupRequest = {
        name: data.name.trim(),
        description: data.description.trim(),
        imageIds: data.imageIds,
        baseCurrency: data.baseCurrency,
        subscriptionOptions: data.subscriptionOptions
      };

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
  }  public async getArtistImages(): Promise<GalleryImage[]> {
    try {
      const headers = await this.getAuthenticatedHeaders();
      console.log('Making request to fetch artist images...');
      
      // Get both image details and signed URLs in parallel
      const [imagesResponse, signedUrlResponse] = await Promise.all([
        axios.get<{ success: boolean; images: GalleryImage[] }>(
          `${API_URLS.GALLERY}/images`, 
          { 
            headers,
            withCredentials: true 
          }
        ),
        axios.get<{ success: boolean; urls: Array<{ imageId: string; signedUrl: string }> }>(
          `${API_URLS.GALLERY}/signed-urls`,
          {
            headers,
            withCredentials: true
          }
        )
      ]);
      
      if (!imagesResponse.data.success || !imagesResponse.data.images) {
        console.error('No images found in response:', imagesResponse.data);
        return [];
      }
        // Validate signed URLs response
      if (!signedUrlResponse.data.success || !signedUrlResponse.data.urls) {
        throw new Error('Failed to fetch signed URLs');
      }

      // Create map of signed URLs and combine with image details
      const signedUrlMap = new Map(signedUrlResponse.data.urls.map(({ imageId, signedUrl }) => [imageId, signedUrl]));
      const combinedImages = imagesResponse.data.images.map(image => ({
        ...image,
        imageUrl: signedUrlMap.get(image.imageId) || '', // Use imageUrl for gallery UI
        signedUrl: signedUrlMap.get(image.imageId) || '', // Keep original signedUrl field for consistency
        _id: image._id, // Keep MongoDB _id
        mongoId: image._id // Add explicit mongoId field for clarity
      }));

      if (combinedImages.length > 0) {
        console.log('Example of combined image data:', {
          sampleImage: combinedImages[0],
          totalImages: combinedImages.length
        });
      }

      console.log('Successfully combined images with signed URLs');
      return combinedImages;
    } catch (error) {
      console.error('Error fetching artist images:', error);
      throw error;
    }
  }

  public async deleteArtistImage(mongoId: string): Promise<void> {
    try {
      console.log('Deleting artist image with mongoId:', mongoId);
      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/delete/${mongoId}`;
      
      const response = await axios.delete(url, {
        headers,
        withCredentials: true
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete image');
      }

      console.log('Image deleted successfully:', response.data);
    } catch (error) {
      console.error('Error deleting artist image:', error);
      throw error;
    }
  }  public async verifyPayment(
    galleryId: string,
    orderId: string | null,
    userId: string,
    subscriptionOptionId?: string
  ): Promise<PaymentStatus> {
    try {
      // If no orderId is provided, we're just checking access status
      // Check the cache first in this case
      if (!orderId) {
        const cacheKey = `${galleryId}:${userId}`;
        const cached = this.verifiedPayments.get(cacheKey);
        if (cached) {
          console.log('📋 Using cached verification:', cached);
          if (cached.subscription?.isActive && new Date(cached.subscription.endDate) > new Date()) {
            return cached;
          } else {
            // Clear expired cache
            this.verifiedPayments.delete(cacheKey);
          }
        }
      }

      console.log('🔍 Verifying payment:', { galleryId, orderId, userId, subscriptionOptionId });
      
      const payload = {
        galleryId,
        userId,
        ...(orderId && { orderId }),
        ...(subscriptionOptionId && { subscriptionOptionId })
      };

      const headers = await this.getAuthenticatedHeaders();
      
      const response = await axios.post<PaymentStatus>(
        `${API_URLS.GALLERY}/v0.1/verify-payment`,
        payload,
        {
          headers,
          withCredentials: true
        }
      );
      
      console.log('📦 Payment verification response:', response.data);
      
      // Check if we have a subscription and it's active
      const subscription = response.data.subscription;
      const hasAccess = subscription ? 
        subscription.isActive && new Date(subscription.endDate) > new Date() : 
        false;

      console.log('🔐 Access status:', { 
        hasSubscription: !!subscription,
        isActive: subscription?.isActive,
        hasAccess,
        endDate: subscription?.endDate
      });

      const result = {
        ...response.data,
        hasAccess,
        subscription
      };

      // Cache successful payment verifications with active subscriptions
      if (hasAccess && subscription?.isActive) {
        const cacheKey = `${galleryId}:${userId}`;
        this.verifiedPayments.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      // Try using cached result if available
      const cacheKey = `${galleryId}:${userId}`;
      const cached = this.verifiedPayments.get(cacheKey);
      if (cached?.subscription?.isActive && new Date(cached.subscription.endDate) > new Date()) {
        console.log('📋 Using cached verification after error:', cached);
        return cached;
      }
      return {
        hasAccess: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }  public async submitArtistApplication(email: string): Promise<ArtistApplicationResponse> {
    try {
      console.log('🎨 Submitting artist application for email:', email);
      const headers = await this.getAuthenticatedHeaders();
      const response = await axios.post(`${API_URLS.GALLERY}/artist/apply`, { email }, {
        headers,
        withCredentials: true
      });
      console.log('✅ Artist application submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting artist application:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: axios.isAxiosError(error) ? error.response?.data : undefined
      });
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to submit application');
      }
      throw new Error('Failed to submit application');
    }
  }

  public async approveArtistApplication(email: string): Promise<ArtistActionResponse> {
    try {
      console.log('🎨 Approving artist application for email:', email);
      const headers = await this.getAuthenticatedHeaders();
      const response = await axios.post<ArtistActionResponse>(`${API_URLS.GALLERY}/artist/approve`, { email }, {
        headers,
        withCredentials: true
      });
      console.log('✅ Artist application approved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error approving artist application:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: axios.isAxiosError(error) ? error.response?.data : undefined
      });
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to approve application');
      }
      throw new Error('Failed to approve application');
    }
  }

  public async getArtistApplications(): Promise<ArtistApplication[]> {
    try {
      const headers = await this.getAuthenticatedHeaders();
      const response = await axios.get(`${API_URLS.GALLERY}/artist/applications`, {
        headers,
        withCredentials: true
      });
      console.log("Artists Applications:", response.data);  
      return response.data || [];
    } catch (error) {
      console.error('Error fetching artist applications:', error);
      throw error;
    }
  }

  public async getApprovedArtists(): Promise<Artist[]> {
    try {
      console.log('🎨 Fetching approved artists...');
      const headers = await this.getAuthenticatedHeaders();
      
      const response = await axios.get<Artist[]>(`${API_URLS.GALLERY}/artists`, {
        headers,
        withCredentials: true
      });

      console.log('✅ Successfully fetched approved artists:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching approved artists:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: axios.isAxiosError(error) ? error.response?.data : undefined
      });
      throw error;
    }
  }

  public async updateGalleryGroup(galleryId: string, updates: {
    name?: string;
    subscriptionOptions?: Array<{
      duration: number;
      price: number;
      label: string;
      isActive: boolean;
    }>;
  }): Promise<GalleryGroup> {
    try {
      console.log('Updating gallery group:', { galleryId, updates });
      const headers = await this.getAuthenticatedHeaders();
      const url = `${API_URLS.GALLERY}/groups/${galleryId}`;

      const requestData = {
        ...updates,
        action: 'update' as const
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

      console.log('Update gallery response:', response.data);
      if (!response.data.group) {
        throw new Error(response.data.message || 'Failed to update gallery group');
      }

      return response.data.group;
    } catch (error) {
      console.error('Error updating gallery group:', error);
      throw error;
    }
  }
}

export const galleryService = new GalleryService();
