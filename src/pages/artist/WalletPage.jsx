import React, { useState, useEffect } from 'react';
import WalletOverview from '../../components/artist/wallet/WalletOverview';
import TransactionHistory from '../../components/artist/wallet/TransactionHistory';
import WithdrawFunds from '../../components/artist/wallet/WithdrawFunds';
import WalletActivation from '../../components/artist/wallet/WalletActivation';
import SuspendWalletModal from '../../components/artist/wallet/SuspendWalletModal';
import { treasuryService } from '../../services/treasuryService';
import { useMessage } from '../../hooks/useMessage';

const WalletPage = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWalletId, setCurrentWalletId] = useState(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const { addMessage } = useMessage();
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      
      // First check if user has a wallet
      const walletStatus = await treasuryService.checkWallet();
      console.log('Wallet status:', walletStatus);
      
      if (walletStatus.statusCode === 404) {
        // User doesn't have a wallet
        setBalance(null);
        setTransactions([]);
        return;
      }      if (walletStatus.statusCode === 200 && walletStatus.walletId) {
        // Get wallet details
        const walletDetails = await treasuryService.getWalletById(walletStatus.walletId);
        if (walletDetails) {
          setCurrentWalletId(walletDetails.walletId);
          setBalance({
            available: parseFloat(walletDetails.balance),
            pending: 0, // You can add pending balance if available from API
            total: parseFloat(walletDetails.balance),
            status: walletDetails.status
          });
          setTransactions([]); // You'll need to update this with actual transactions from your API
        }
      }
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
  }, []);  const handleWithdraw = async (amount, paymentMethod) => {
    try {
      // TODO: Implement actual withdrawal functionality with treasury service
      addMessage({
        text: 'Withdrawal functionality coming soon',
        type: 'info'
      });
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
  }  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your earnings and withdrawals
        </p>
      </div>

      {/* Show wallet activation if balance is null (indicating no wallet) */}
      {balance === null ? (
        <WalletActivation onWalletActivated={() => fetchWalletData()} />
      ) : (        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <WalletOverview balance={balance} />
            <TransactionHistory transactions={transactions} />
            
            {/* Suspend Wallet Button */}
            {balance?.status !== 'suspended' && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsSuspendModalOpen(true)}
                  className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Suspend Wallet
                </button>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <WithdrawFunds 
              onWithdraw={handleWithdraw}
              availableBalance={balance?.available || 0}
              disabled={balance?.status === 'suspended'}
            />
          </div>
        </div>
      )}

      {/* Suspend Wallet Modal */}
      <SuspendWalletModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        walletId={currentWalletId}
        onWalletSuspended={fetchWalletData}
      />
    </div>
  );
};

export default WalletPage;
