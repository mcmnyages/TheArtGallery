import React from 'react';
import { HiCurrencyDollar, HiClock, HiTrendingUp } from 'react-icons/hi';

const WalletOverview = ({ balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Available Balance</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ${balance?.available?.toFixed(2)}
            </h3>
          </div>
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
            <HiCurrencyDollar className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Pending Balance</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ${balance?.pending?.toFixed(2)}
            </h3>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
            <HiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Earnings</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ${balance?.total?.toFixed(2)}
            </h3>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
            <HiTrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletOverview;
