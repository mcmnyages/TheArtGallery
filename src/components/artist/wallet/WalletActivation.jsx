import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { treasuryService } from '../../../services/treasuryService';
import { useMessage } from '../../../hooks/useMessage';

const WalletActivation = () => {
  const [loading, setLoading] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { addMessage } = useMessage();

  useEffect(() => {
    checkWalletStatus();
  }, []);
  const checkWalletStatus = async () => {
    try {
      setError(null);
      const walletStatus = await treasuryService.checkWallet();
      console.log('Wallet status response:', walletStatus);
      
      // If we get a 200 response with a walletId, that means the user has a wallet
      if (walletStatus.statusCode === 200 && walletStatus.walletId) {
        setHasWallet(true);
        console.log('User has wallet with ID:', walletStatus.walletId);
      } else if (walletStatus.statusCode === 404) {
        // User doesn't have a wallet
        setHasWallet(false);
      } else {
        throw new Error('Invalid wallet status response');
      }
    } catch (error) {
      console.error('Error checking wallet status:', error);
      setError(error.message || 'Failed to check wallet status');
      addMessage({
        type: 'error',
        text: 'Failed to check wallet status. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };  const handleActivateWallet = async () => {
    try {
      setError(null);
      setActivating(true);
      console.log('Attempting to create wallet...');
      
      const response = await treasuryService.createWallet({ currency: "USD" });
      console.log('Wallet creation response:', response);
      
      if (response.statusCode === 200 && response.walletId) {
        setHasWallet(true);
        addMessage({
          type: 'success',
          text: 'Wallet activated successfully! You can now receive payments.'
        });
      } else {
        throw new Error('Failed to create wallet');
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to activate wallet';
      setError(errorMessage);
      addMessage({
        type: 'error',
        text: `Failed to activate wallet: ${errorMessage}`
      });
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Activate Your Wallet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to activate your wallet to start receiving payments.
          </p>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleActivateWallet}
          disabled={activating}
          className={`
            w-full max-w-xs px-4 py-2 rounded-lg font-medium text-white
            transition-all duration-200 transform
            ${activating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
            }
          `}
        >
          {activating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Activating...
            </div>
          ) : (
            'Activate Wallet'
          )}
        </button>
      </div>
    );
  }

  return null; // Don't show anything if wallet is already activated
};

export default WalletActivation;
