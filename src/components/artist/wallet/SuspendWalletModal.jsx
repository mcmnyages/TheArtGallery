import React from 'react';
import { treasuryService } from '../../../services/treasuryService';
import { useMessage } from '../../../hooks/useMessage';

const SuspendWalletModal = ({ isOpen, onClose, walletId, onWalletSuspended }) => {
  const { addMessage } = useMessage();

  const handleSuspend = async () => {
    try {
      const response = await treasuryService.suspendWallet(walletId);
      addMessage({
        type: 'success',
        text: 'Wallet suspended successfully'
      });
      onWalletSuspended();
      onClose();
    } catch (error) {
      console.error('Error suspending wallet:', error);
      addMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to suspend wallet'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Suspend Wallet</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to suspend your wallet? This action will temporarily disable your ability to receive payments.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSuspend}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Suspend Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendWalletModal;
