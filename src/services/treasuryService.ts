import axios from 'axios';
import * as tokenService from './tokenService';

// Base URL for treasury API endpoints
const API_URLS = {
  TREASURY: '/treasury' // Base path for all treasury-related endpoints
};

export interface CreateWalletRequest {
  currency: string;
}

export interface Wallet {
  _id: string;
  userId: string;
  currency: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponse {
  message: string;
  wallet: Wallet;
}

export class TreasuryService {
  // Get authenticated headers (similar to gallery service)
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

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${tokenService.getAccessToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    console.log('Using headers:', headers);
    return headers;
  }

  // Create a new wallet
  public async createWallet(data: CreateWalletRequest): Promise<Wallet> {
    try {
      console.log('Creating wallet with currency:', data.currency);
      
      // Validate request data
      if (!data.currency || typeof data.currency !== 'string' || data.currency.trim().length === 0) {
        throw new Error('Currency is required and must be a string');
      }

      const requestData: CreateWalletRequest = {
        currency: data.currency.trim().toUpperCase()
      };

      const headers = await this.getAuthenticatedHeaders();
      const response = await axios.post<WalletResponse>(
        `${API_URLS.TREASURY}/wallet`,
        requestData,
        {
          headers,
          withCredentials: true
        }
      );

      console.log('Wallet creation response:', response.data);
      if (!response.data.wallet) {
        throw new Error(response.data.message || 'Failed to create wallet');
      }

      return response.data.wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  // Get wallet by ID
  public async getWalletById(walletId: string): Promise<Wallet | null> {
    try {
      console.log('Fetching wallet by ID:', walletId);
      
      if (!walletId || typeof walletId !== 'string' || walletId.trim().length === 0) {
        throw new Error('Wallet ID is required and must be a string');
      }

      const headers = await this.getAuthenticatedHeaders();
      const response = await axios.get<WalletResponse>(
        `${API_URLS.TREASURY}/wallet/${walletId}`,
        {
          headers,
          withCredentials: true
        }
      );

      console.log('Wallet fetch response:', response.data);
      if (!response.data.wallet) {
        console.warn('No wallet found with ID:', walletId);
        return null;
      }

      return response.data.wallet;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const treasuryService = new TreasuryService();