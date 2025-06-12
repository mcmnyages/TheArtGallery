import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../hooks/useMessage';
import { authService } from '../../services/authService';
import QRScannerView from './QRScannerView';

const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  const scannerHandlersRef = useRef(null);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addMessage } = useMessage();

  // Safe state setter that checks if component is still mounted
  const safeSetState = useCallback((setter) => {
    if (mountedRef.current) {
      setter();
    }
  }, []);

  const cleanupScanner = useCallback(async () => {
    console.log('🧹 Starting scanner cleanup');
    
    try {
      // Stop scanning if active
      if (scannerRef.current) {
        try {
          const state = await scannerRef.current.getState();
          if (state === Html5Qrcode.SCANNING) {
            console.log('📤 Stopping active scan');
            await scannerRef.current.stop();
          }
        } catch (err) {
          console.warn('Error checking scanner state:', err);
        }

        // Attempt to clear QR scanner
        try {
          await scannerRef.current.clear();
        } catch (err) {
          console.warn('Error clearing scanner:', err);
        }
        
        scannerRef.current = null;
      }

      // Clean up any remaining video streams
      try {
        const mediaDevices = navigator.mediaDevices;
        if (mediaDevices && mediaDevices.getTracks) {
          const tracks = await mediaDevices.getTracks();
          tracks.forEach(track => track.stop());
        }
      } catch (err) {
        console.warn('Error stopping media tracks:', err);
      }

      const qrReaderElement = document.getElementById('qr-reader');
      if (qrReaderElement) {
        const videos = qrReaderElement.querySelectorAll('video');
        videos.forEach(video => {
          if (video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(track => {
              track.stop();
              console.log('📤 Stopped video track');
            });
            video.srcObject = null;
          }
          video.remove(); // Remove video element
        });

        // Clean up any hidden elements that might have been created
        const hiddenElements = qrReaderElement.querySelectorAll('div[hidden]');
        hiddenElements.forEach(el => el.remove());
      }

      // Reset states
      safeSetState(() => {
        setScanning(false);
        setError(null);
        setIsProcessing(false);
      });
      
      processingRef.current = false;

      console.log('✅ Cleanup completed successfully');
    } catch (err) {
      console.error('❌ Error during cleanup:', err);
      // Force reset state even if cleanup fails
      scannerRef.current = null;
      processingRef.current = false;
      safeSetState(() => {
        setScanning(false);
        setError(null);
        setIsProcessing(false);
      });

      // Try one last time to stop all tracks
      try {
        const tracks = await navigator.mediaDevices.getTracks();
        tracks.forEach(track => track.stop());
      } catch (cleanupErr) {
        console.warn('Final cleanup attempt failed:', cleanupErr);
      }
    }
  }, [safeSetState]);

  const processQRCode = useCallback((decodedText) => {
    console.log('📱 Processing QR code:', decodedText);
    
    // Reset any previous errors
    setError(null);

    let qrToken = null;
    let redirectUrl = null;

    try {
      if (!decodedText || typeof decodedText !== 'string') {
        throw new Error('Invalid QR code data');
      }

      const trimmedText = decodedText.trim();

      // Method 1: Try parsing as JSON
      if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmedText);
          if (typeof parsed === 'object' && parsed !== null) {
            qrToken = parsed.qrToken || parsed.token;
            redirectUrl = parsed.redirectUrl || parsed.redirect;
          }
        } catch (jsonError) {
          console.warn('Failed to parse QR code as JSON:', jsonError);
        }
      }

      // Method 2: Try parsing as URL
      if (!qrToken && trimmedText.startsWith('http')) {
        try {
          const url = new URL(trimmedText);
          const pathSegments = url.pathname.split('/').filter(Boolean);
          
          // Look for token in various URL patterns
          if (pathSegments.length >= 2 && pathSegments[0] === 'v') {
            qrToken = pathSegments[1];
          } else if (pathSegments.length >= 1) {
            qrToken = pathSegments[pathSegments.length - 1];
          }
          
          // Check URL parameters
          const urlParams = new URLSearchParams(url.search);
          if (!qrToken && urlParams.has('token')) {
            qrToken = urlParams.get('token');
          }
          if (!qrToken && urlParams.has('qrToken')) {
            qrToken = urlParams.get('qrToken');
          }
          if (urlParams.has('redirect')) {
            redirectUrl = urlParams.get('redirect');
          }
        } catch (urlError) {
          console.warn('Failed to parse QR code as URL:', urlError);
        }
      }

      // Method 3: Treat as plain token if it matches expected format
      if (!qrToken && trimmedText.length > 0) {
        // Basic validation - you might want to adjust this based on your token format
        if (/^[A-Za-z0-9_-]+$/.test(trimmedText)) {
          qrToken = trimmedText;
        }
      }

      if (!qrToken) {
        throw new Error('No valid token found in QR code');
      }

      // Validate token format
      if (!/^[A-Za-z0-9_-]+$/.test(qrToken)) {
        throw new Error('Invalid token format');
      }

      console.log('✅ Extracted token:', qrToken);
      return { qrToken, redirectUrl };

    } catch (err) {
      console.error('❌ Failed to parse QR code:', err);
      throw new Error(err.message || 'Invalid QR code format');
    }
  }, []);

  const handleSuccessfulScan = useCallback(async (decodedText) => {
    // Prevent multiple simultaneous processing
    if (processingRef.current || isProcessing) {
      console.log('🔄 Already processing, ignoring scan');
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    try {
      console.log('🎯 Starting QR code processing');
      
      // Stop scanning immediately to prevent multiple scans
      if (scannerRef.current) {
        try {
          const state = await scannerRef.current.getState();
          if (state === Html5Qrcode.SCANNING) {
            await scannerRef.current.stop();
          }
        } catch (err) {
          console.warn('Error stopping scanner:', err);
        }
      }

      // Process the QR code
      const scanData = processQRCode(decodedText);
      if (!scanData) {
        throw new Error('Invalid QR code format');
      }
      
      setScanResult(scanData);

      console.log('📤 Sending token to server:', scanData.qrToken);
      const result = await authService.approveQRToken(scanData.qrToken);
      console.log('📥 Server response:', result);
      
      if (result.success) {
        console.log('✨ QR code approved successfully');
        
        safeSetState(() => {
          addMessage({
            type: 'success',
            text: result.message || 'QR code successfully approved'
          });
        });
        
        // Clean up before navigation
        await cleanupScanner();
        
        // Navigate to appropriate page
        const targetUrl = scanData.redirectUrl || '/galleries';
        console.log('🔄 Navigating to:', targetUrl);
        navigate(targetUrl);
      } else {
        throw new Error(result.error || 'Failed to approve QR code');
      }
    } catch (error) {
      console.error('❌ QR processing error:', error);
      
      safeSetState(() => {
        setError(error.message);
        addMessage({
          type: 'error',
          text: error.message || 'Error processing QR code'
        });
      });

      // Reset processing state
      processingRef.current = false;
      safeSetState(() => setIsProcessing(false));
      
      // Try to restart scanner after delay
      if (mountedRef.current && !scanResult) {
        setTimeout(() => {
          if (mountedRef.current && !scanResult) {
            startScanner().catch(console.error);
          }
        }, 2000);
      }
    }
  }, [processQRCode, cleanupScanner, navigate, addMessage, safeSetState, isProcessing, scanResult]);

  const initializeScanner = useCallback(async () => {
    try {
      const config = {
        fps: 10,
        qrbox: {
          width: Math.min(250, window.innerWidth - 50),
          height: Math.min(250, window.innerWidth - 50)
        },
        aspectRatio: 1.0
      };
      
      const scanner = new Html5Qrcode("qr-reader");
      
      // Store scanner handlers
      scannerHandlersRef.current = {
        onScanSuccess: (decodedText) => {
          if (mountedRef.current && !processingRef.current) {
            console.log('📱 QR code detected:', decodedText);
            handleSuccessfulScan(decodedText);
          }
        },
        onScanError: (errorMessage) => {
          if (!errorMessage.includes('NotFoundException') && 
              !errorMessage.includes('No MultiFormat Readers') &&
              !errorMessage.includes('No QR code found')) {
            console.warn('Scanner error:', errorMessage);
          }
        }
      };

      console.log('🚀 Starting HTML5 QR Code scanner');

      await scanner.start(
        { facingMode: "environment" },
        config,
        scannerHandlersRef.current.onScanSuccess,
        scannerHandlersRef.current.onScanError
      );

      // Wait for video element to be ready
      const qrReaderElement = document.getElementById('qr-reader');
      if (qrReaderElement) {
        const videoElement = qrReaderElement.querySelector('video');
        if (videoElement) {
          // Wait for video to start playing
          await new Promise((resolve) => {
            const checkVideo = () => {
              if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA or better
                resolve();
              } else {
                setTimeout(checkVideo, 100);
              }
            };
            checkVideo();
          });
        }
      }

      scannerRef.current = scanner;
      safeSetState(() => setScanning(true));
      console.log('✅ Scanner started successfully');
      return true;
    } catch (err) {
      console.error('❌ Error initializing scanner:', err);
      throw err;
    }
  }, [handleSuccessfulScan, safeSetState]);

  const startScanner = useCallback(async () => {
    if (scanning || !isAuthenticated || processingRef.current) {
      console.log('🛑 Scanner start blocked:', { scanning, isAuthenticated, processing: processingRef.current });
      return;
    }
    
    console.log('🎥 Starting scanner initialization');
    setError(null);

    try {
      // Clean up any existing scanner
      await cleanupScanner();
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200));

      // Request camera permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" },
          audio: false
        });
        // Stop the test stream right away
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('❌ Camera access error:', err);
        throw new Error('Camera permission denied. Please allow camera access.');
      }

      // Now initialize the scanner
      await initializeScanner();

    } catch (err) {
      console.error('❌ Error starting scanner:', err);
      safeSetState(() => {
        setError(err.message);
        addMessage({
          type: 'error',
          text: err.message || 'Could not start camera'
        });
      });
    }
  }, [scanning, isAuthenticated, cleanupScanner, initializeScanner, addMessage, safeSetState]);

  const handleClose = useCallback(async () => {
    console.log('🚪 Closing QR scanner');
    mountedRef.current = false;
    
    try {
      await cleanupScanner();
      navigate('/galleries');
    } catch (err) {
      console.error('Error during close:', err);
      navigate('/galleries');
    }
  }, [cleanupScanner, navigate]);

  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying scanner');
    setError(null);
    setScanResult(null);
    processingRef.current = false;
    setIsProcessing(false);
    startScanner();
  }, [startScanner]);

  // Initialize scanner when component mounts
  useEffect(() => {
    if (isAuthenticated && !scanning && !scanResult && !error) {
      console.log('🟢 Initializing scanner');
      startScanner();
    }
  }, [isAuthenticated, scanning, scanResult, error, startScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🔴 Component unmounting');
      mountedRef.current = false;
      cleanupScanner().catch(err => {
        console.error('Cleanup error on unmount:', err);
      });
    };
  }, [cleanupScanner]);

  return (
    <QRScannerView 
      isAuthenticated={isAuthenticated}
      scanning={scanning}
      error={error}
      isProcessing={isProcessing}
      onClose={handleClose}
      onRetry={handleRetry}
      onLogin={() => navigate('/login')}
    />
  );
};

export default QRCodeScanner;