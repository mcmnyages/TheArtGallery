import React from 'react';
import '../../../public/assets/css/QRScanner.css';

const QRScannerView = ({ 
  onClose, 
  isAuthenticated, 
  onLogin, 
  scanning, 
  error, 
  isProcessing,
  onRetry 
}) => {
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Please log in to use the QR code scanner
          </p>
          <button
            onClick={onLogin}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Scan Gallery QR Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scanner Container */}
        <div className="qr-container rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
          <div 
            id="qr-reader" 
            className={scanning ? 'scanner-ready' : ''}
            style={{ width: '100%' }}
          />
            {/* Loading overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm font-medium">Processing QR code...</p>
              </div>
            </div>
          )}

          {/* Scanning guide overlay */}
          {scanning && !isProcessing && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-2 border-green-400 rounded-lg shadow-lg"></div>
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {scanning && !isProcessing && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg">
            <div className="flex items-center">
              <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                Camera active - Position QR code within the frame
              </p>
            </div>
          </div>
        )}        {/* Instructions */}
        {scanning && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
            Position the QR code within the frame to scan
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          {error && (
            <button
              onClick={onRetry}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              disabled={isProcessing}
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Cancel Scanning'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerView;