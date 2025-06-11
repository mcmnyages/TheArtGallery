import React from 'react';
import QRCodeScanner from '../components/auth/QRCodeScanner';
import { useTheme } from '../contexts/ThemeContext';

const QRScannerPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Gallery Sync
            </h1>
            <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Scan a gallery QR code to sync with the display system
            </p>
          </div>
          
          <QRCodeScanner />
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;
