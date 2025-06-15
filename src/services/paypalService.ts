import axios from 'axios';

interface PayPalOrderAmount {
  currency_code: string;
  value: string;
}

interface PayPalCapture {
  id: string;
  status: string;
  amount: PayPalOrderAmount;
}

interface PayPalPayments {
  captures?: PayPalCapture[];
}

interface PayPalPurchaseUnit {
  amount: PayPalOrderAmount;
  description: string;
  custom_id?: string;
  payments?: PayPalPayments;
}

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: PayPalPurchaseUnit[];
}

export class PayPalService {
  // Replace these with your actual PayPal client ID and secret in production
  private readonly clientId = process.env.VITE_PAYPAL_CLIENT_ID || '';
  private readonly clientSecret = process.env.VITE_PAYPAL_CLIENT_SECRET || '';
  private readonly baseURL = process.env.VITE_PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
  private async getAccessToken(): Promise<string> {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('PayPal client ID or secret is not configured');
      }

      const auth = btoa(`${this.clientId}:${this.clientSecret}`);
      const response = await axios.post(
        `${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!response.data?.access_token) {
        throw new Error('Invalid response from PayPal OAuth endpoint');
      }

      return response.data.access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error_description || error.message;
        throw new Error(`PayPal authentication failed: ${message}`);
      }
      console.error('Error getting PayPal access token:', error);
      throw error instanceof Error ? error : new Error('Failed to get PayPal access token');
    }
  }  public async createOrder(
    galleryId: string,
    userId: string,
    amount: number,
    currency: string = 'USD',
    subscriptionOptionId?: string,
    ownerId?: string
  ): Promise<PayPalOrder> {
    try {
      if (!galleryId || !userId || amount <= 0) {
        throw new Error('Invalid gallery ID, user ID, or amount');
      }

      console.log('🛍️ Creating PayPal order:', {
        galleryId,
        userId,
        amount,
        currency,
        subscriptionOptionId,
        ownerId
      });

      const accessToken = await this.getAccessToken();
      const response = await axios.post<PayPalOrder>(
        `${this.baseURL}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency.toUpperCase(),
                value: amount.toFixed(2),
              },
              description: `Gallery Access: ${galleryId}`,
              custom_id: subscriptionOptionId ? 
                `${galleryId}:${userId}:${subscriptionOptionId}:${ownerId}` : 
                `${galleryId}:${userId}:${ownerId}`,
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!response.data?.id || response.data.status === 'ERROR') {
        throw new Error('Invalid response from PayPal create order endpoint');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to create PayPal order: ${message}`);
      }
      console.error('Error creating PayPal order:', error);
      throw error instanceof Error ? error : new Error('Failed to create PayPal order');
    }
  }
  public async captureOrder(orderId: string): Promise<PayPalOrder> {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const accessToken = await this.getAccessToken();
      const response = await axios.post<PayPalOrder>(
        `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          timeout: 15000, // 15 second timeout for captures
        }
      );

      if (!response.data?.id || response.data.status !== 'COMPLETED') {
        throw new Error(`Order capture failed: ${response.data?.status || 'unknown status'}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Order has already been captured or is invalid');
        }
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to capture PayPal order: ${message}`);
      }
      console.error('Error capturing PayPal order:', error);
      throw error instanceof Error ? error : new Error('Failed to capture PayPal order');
    }
  }
  public async verifyPayment(orderId: string): Promise<boolean> {
    try {
      if (!orderId) {
        throw new Error('Order ID is required for verification');
      }

      const accessToken = await this.getAccessToken();
      const response = await axios.get<PayPalOrder>(
        `${this.baseURL}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (!response.data) {
        throw new Error('Invalid response from PayPal verification endpoint');
      }

      // Verify both the status and the payment capture
      const isCompleted = response.data.status === 'COMPLETED';
      const payment = response.data.purchase_units?.[0]?.payments?.captures?.[0];
      
      if (!isCompleted || !payment) {
        console.warn('Payment verification failed:', { 
          status: response.data.status,
          hasPayment: !!payment
        });
        return false;
      }

      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to verify PayPal payment: ${message}`);
      }
      console.error('Error verifying PayPal payment:', error);
      throw error instanceof Error ? error : new Error('Failed to verify PayPal payment');
    }
  }
}

export const paypalService = new PayPalService();
