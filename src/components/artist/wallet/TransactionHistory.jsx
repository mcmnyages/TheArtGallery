import React from 'react';
import { format } from 'date-fns';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

const TransactionHistory = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    return type === 'credit' ? (
      <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
        <HiArrowDown className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
    ) : (
      <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
        <HiArrowUp className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {transactions?.map((transaction) => (
          <div key={transaction.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getTransactionIcon(transaction.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${
                  transaction.type === 'credit' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </span>
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
