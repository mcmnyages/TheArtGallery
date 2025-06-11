import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../hooks/useMessage';

const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [qrCodeInstance, setQrCodeInstance] = useState(null);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = React.useRef(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { addMessage } = useMessage();

  // Clean up function to ensure proper cleanup of QR scanner
  const cleanupScanner = async () => {
    if (qrCodeInstance) {
      try {
        if (qrCodeInstance.isScanning) {
          await qrCodeInstance.stop();
        }
        await qrCodeInstance.clear();
        setQrCodeInstance(null);
        setScanning(false);
      } catch (err) {
        console.error('Error cleaning up scanner:', err);
      }
    }
  };

  useEffect(() => {    const startScanner = async () => {
      setError(null);
      setIsStarting(true);
      try {
        // Clean up any existing instance
        await cleanupScanner();
        
        // Create new instance only if there isn't one already
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode("qr-reader");
          setQrCodeInstance(scannerRef.current);
        }
        
        setScanning(true);

        const qrCodeSuccessCallback = (decodedText) => {
          try {
            const scanData = JSON.parse(decodedText);
            if (scanData.galleryId && scanData.syncToken) {
              setScanResult(scanData);
              handleSuccessfulScan(scanData);
            } else {
              addMessage({
                type: 'error',
                text: 'Invalid QR code format'
              });
            }
          } catch (error) {
            addMessage({
              type: 'error',
              text: 'Could not parse QR code data'
            });
          }
        };

        const config = {
          fps: 10,
          qrbox: { width: 450, height: 450 },
          aspectRatio: 1.0
        };        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          (errorMessage) => {
            console.log('QR Code scanning error:', errorMessage);
          }
        );
      } catch (err) {        console.error('Error starting scanner:', err);
        setError('Could not start camera. Please make sure you have granted camera permissions.');
        addMessage({
          type: 'error',
          text: 'Could not start camera. Please make sure you have granted camera permissions.'
        });
      } finally {
        setIsStarting(false);
      }
    };

    if (!scanning && !scanResult && !error) {
      startScanner();
    }    // Component cleanup function
    return () => {
      cleanupScanner();
      scannerRef.current = null;
    };
  }, []);

  const handleSuccessfulScan = async (scanData) => {
    try {
      // Here you would typically make an API call to your backend
      // to validate the sync token and get access to the synced gallery
      const response = await fetch('/api/gallery/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          galleryId: scanData.galleryId,
          syncToken: scanData.syncToken,
          userId: user?.id
        })
      });

      if (response.ok) {
        addMessage({
          type: 'success',
          text: 'Successfully synced with gallery display'
        });
        navigate(`/gallery/${scanData.galleryId}`);
      } else {
        addMessage({
          type: 'error',
          text: 'Failed to sync with gallery display'
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      addMessage({
        type: 'error',
        text: 'Error syncing with gallery display'
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          Please log in to use the QR code scanner
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Log In
        </button>
      </div>
    );
  }  const handleClose = async () => {
    try {
      await cleanupScanner();
      scannerRef.current = null;
      navigate('/galleries');
    } catch (err) {
      console.error('Error closing scanner:', err);
    }
  };
  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupScanner();
      } else if (!scanning && !scanResult) {
        startScanner();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [scanning, scanResult]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Scan Gallery QR Code
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div 
          id="qr-reader" 
          className="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
          style={{ width: '100%', minHeight: '300px' }}
        />
        
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Position the QR code within the frame to sync with the gallery display
        </p>

        <button
          onClick={handleClose}
          className="mt-6 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
        >
          Cancel Scanning
        </button>
      </div>
    </div>
  );
};

export default QRCodeScanner;
