import { apiRequest } from './api';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

interface WalletBalance {
  available: number;
  pending: number;
  total: number;
  currency: string;
}

// Mock data for testing
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 250.00,
    type: 'credit',
    description: 'Artwork Sale - Modern Abstract #123',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '2',
    amount: 150.00,
    type: 'debit',
    description: 'Withdrawal to Bank Account',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '3',
    amount: 180.00,
    type: 'credit',
    description: 'Commission - Portrait Commission',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  }
];

export const getBalance = async (): Promise<WalletBalance> => {
  // In a real app, this would call the actual API
  // For demo, we'll simulate a successful balance fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        available: 450.00,
        pending: 120.00,
        total: 570.00,
        currency: 'USD'
      });
    }, 300);
  });
};

export const getTransactions = async (page: number = 1, limit: number = 10): Promise<{ transactions: Transaction[], total: number }> => {
  // In a real app, this would call the actual API
  // For demo, we'll return mock transactions
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * limit;
      const paginatedTransactions = mockTransactions.slice(start, start + limit);
      
      resolve({
        transactions: paginatedTransactions,
        total: mockTransactions.length
      });
    }, 500);
  });
};

export const withdrawFunds = async (amount: number, paymentMethod: string) => {
  // In a real app, this would call the actual API
  // For demo, we'll simulate a successful withdrawal
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transaction: {
          id: Math.random().toString(36).substr(2, 9),
          amount: amount,
          type: 'debit',
          description: `Withdrawal to ${paymentMethod}`,
          date: new Date().toISOString(),
          status: 'pending'
        }
      });
    }, 1000);
  });
};

export const getLinkPaymentMethod = async () => {
  // In a real app, this would call the actual API
  // For demo, we'll simulate getting a link
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: 'https://mock-payment-provider.com/connect',
        expiresIn: 3600
      });
    }, 300);
  });
};
