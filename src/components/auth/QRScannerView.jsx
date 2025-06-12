import React from 'react';
import '../../../public/assets//css/QRScanner.css';

const QRScannerView = ({ onClose, isAuthenticated, onLogin }) => {
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          Please log in to use the QR code scanner
        </p>
        <button
          onClick={onLogin}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Scan Gallery QR Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
          <div className="qr-container rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          <div 
            id="qr-reader" 
            style={{ width: '100%' }}
          />
        </div>
        
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Position the QR code within the frame to scan
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
        >
          Cancel Scanning
        </button>
      </div>
    </div>
  );
};

export default QRScannerView;
