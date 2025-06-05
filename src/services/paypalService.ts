import axios from 'axios';

interface PayPalOrder {
  id: string;
  status: string;
  intent: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description: string;
  }>;
}

export class PayPalService {
  // Replace these with your actual PayPal client ID and secret in production
  private readonly clientId = process.env.VITE_PAYPAL_CLIENT_ID || '';
  private readonly clientSecret = process.env.VITE_PAYPAL_CLIENT_SECRET || '';
  private readonly baseURL = process.env.VITE_PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        `${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw new Error('Failed to get PayPal access token');
    }
  }

  public async createOrder(galleryId: string, amount: number, currency: string = 'USD'): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.post<PayPalOrder>(
        `${this.baseURL}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
              description: `Gallery Access: ${galleryId}`,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw new Error('Failed to create PayPal order');
    }
  }

  public async captureOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.post<PayPalOrder>(
        `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw new Error('Failed to capture PayPal order');
    }
  }

  public async verifyPayment(orderId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.get<PayPalOrder>(
        `${this.baseURL}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.status === 'COMPLETED';
    } catch (error) {
      console.error('Error verifying PayPal payment:', error);
      throw new Error('Failed to verify PayPal payment');
    }
  }
}

export const paypalService = new PayPalService();
