import React, { useState, useEffect } from 'react';
import WalletOverview from '../../components/artist/wallet/WalletOverview';
import TransactionHistory from '../../components/artist/wallet/TransactionHistory';
import WithdrawFunds from '../../components/artist/wallet/WithdrawFunds';
import { getBalance, getTransactions, withdrawFunds } from '../../services/walletService';
import { useMessage } from '../../hooks/useMessage';

const WalletPage = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addMessage } = useMessage();

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);      const [balanceData, transactionsData] = await Promise.all([
        getBalance(),
        getTransactions(1, 10)
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      addMessage({ 
        text: 'Failed to load wallet data',
        type: 'error'
      });
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);
  const handleWithdraw = async (amount, paymentMethod) => {
    try {
      await withdrawFunds(amount, paymentMethod);
      addMessage({
        text: 'Withdrawal request submitted successfully',
        type: 'success'
      });
      fetchWalletData(); // Refresh wallet data
    } catch (error) {
      addMessage({
        text: 'Failed to process withdrawal',
        type: 'error'
      });
      console.error('Error processing withdrawal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your earnings and withdrawals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <WalletOverview balance={balance} />
          <TransactionHistory transactions={transactions} />
        </div>
        
        <div className="lg:col-span-1">
          <WithdrawFunds 
            onWithdraw={handleWithdraw}
            availableBalance={balance?.available || 0}
          />
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
