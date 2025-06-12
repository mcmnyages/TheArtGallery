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
  const [scanAttempts, setScanAttempts] = useState(0);
  const scannerRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addMessage } = useMessage();  const cleanupScanner = useCallback(async () => {
    console.log('🧹 Starting scanner cleanup');
    
    try {
      // First, stop scanning if it's active
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          console.log('📤 Stopping active scan');
          try {
            await scannerRef.current.stop();
            // Small delay to ensure stop completes
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (stopError) {
            console.warn('Non-critical stop error:', stopError);
          }
        }
      }

      // Next, handle all active media tracks
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.log('No active media stream to clean up');
      }

      // Clean up any remaining video elements
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(videoElement => {
        if (videoElement && videoElement.srcObject) {
          const tracks = videoElement.srcObject.getTracks();
          tracks.forEach(track => {
            track.stop();
            console.log('📤 Stopped media track:', track.kind);
          });
          videoElement.srcObject = null;
          videoElement.removeAttribute('src');
          videoElement.load();
        }
      });

      // Finally clear the scanner instance
      if (scannerRef.current) {
        try {
          console.log('🧹 Clearing scanner instance');
          await scannerRef.current.clear();
        } catch (clearError) {
          console.warn('Non-critical clear error:', clearError);
        }
        scannerRef.current = null;
      }

      // Reset state
      setScanning(false);
      setScanResult(null);
      setScanAttempts(0);

      console.log('✅ Cleanup completed successfully');
    } catch (err) {
      console.error('❌ Error during cleanup:', err);
      // Even if we hit an error, make sure we reset the state
      scannerRef.current = null;
      setScanning(false);
      setScanResult(null);
      setScanAttempts(0);
    }
  }, []);

  const handleSuccessfulScan = useCallback(async (scanData) => {
    try {
      console.log('🎯 Starting QR token approval process:', scanData);
      // Stop scanning before making the API call
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      console.log('📤 Sending QR token to server:', scanData.qrToken);
      const result = await authService.approveQRToken(scanData.qrToken);
      console.log('📥 Server response:', result);
      
      if (result.success) {
        console.log('✨ QR code approved successfully');
        addMessage({
          type: 'success',
          text: result.message || 'QR code successfully approved'
        });
        
        // Clean up before navigation
        await cleanupScanner();
        
        if (scanData.redirectUrl) {
          console.log('🔄 Navigating to:', scanData.redirectUrl);
          navigate(scanData.redirectUrl);
        } else {
          console.log('🔄 Navigating to default path: /galleries');
          navigate('/galleries');
        }
      } else {
        throw new Error(result.error || 'Failed to approve QR code');
      }
    } catch (error) {
      console.error('QR approval error:', error);
      addMessage({
        type: 'error',
        text: error.message || 'Error processing QR code'
      });
      // Clean up and restart scanner after error
      await cleanupScanner();
      setTimeout(() => {
        if (!scanResult) startScanner();
      }, 2000);
    }
  }, [cleanupScanner, navigate, addMessage]);

  const startScanner = useCallback(async () => {
    if (scanning || !isAuthenticated) return;
    
    console.log('🎥 Starting scanner initialization');
    try {
      await cleanupScanner();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        throw new Error('Camera permission denied. Please allow camera access to scan QR codes.');
      }

      const config = {
        fps: 10,
        qrbox: 250, // Match the CSS overlay size
        aspectRatio: 1,
        disableFlip: false,
        forceVideoConstraints: true,
        videoConstraints: {
          facingMode: "environment",
          width: { min: 300, ideal: 720, max: 1920 },
          height: { min: 300, ideal: 720, max: 1080 }
        }
      };
      
      const scanner = new Html5Qrcode("qr-reader");      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        console.log('📱 Raw QR code scan result:', decodedText, decodedResult);
        
        // Try parsing as JSON first
        try {
          // If it starts with { or [, treat as JSON
          if (decodedText.trim().startsWith('{') || decodedText.trim().startsWith('[')) {
            const scanData = JSON.parse(decodedText);
            if (scanData.qrToken) {
              console.log('✅ Valid QR token found:', scanData.qrToken);
              setScanResult(scanData);
              handleSuccessfulScan(scanData);
              return;
            }
          }
          
          // Check if it's a valid URL with our expected format
          if (decodedText.startsWith('http')) {
            const url = new URL(decodedText);
            const segments = url.pathname.split('/');
            if (segments.length >= 3 && segments[1] === 'v') {
              const token = segments[2];
              console.log('✅ Valid QR token found from URL:', token);
              setScanResult({ qrToken: token });
              handleSuccessfulScan({ qrToken: token });
              return;
            }
          }
          
          // If we get here, it's not a format we recognize
          console.warn('❌ Unrecognized QR code format:', decodedText);
          addMessage({
            type: 'error',
            text: 'QR code format not recognized. Please scan a valid gallery QR code.'
          });
        } catch (error) {
          console.error('❌ Failed to process QR code data:', error, 'Raw text:', decodedText);
          addMessage({
            type: 'error',
            text: 'Invalid QR code format. Please scan a valid gallery QR code.'
          });
        }
      };

      const qrCodeErrorCallback = (errorMessage, error) => {
        // Silently handle NotFoundException as it's expected
        if (error?.type === 0 || errorMessage === 'NotFoundException') {
          return;
        }
        console.error('Scanner error:', errorMessage, error);
      };

      console.log('Starting scanner with config:', config);
      await scanner.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      );
      scannerRef.current = scanner;
      setScanning(true);
      console.log('✅ Scanner started successfully');

    } catch (err) {
      console.error('Error starting scanner:', err);
      addMessage({
        type: 'error',
        text: 'Could not start camera. Please make sure you have granted camera permissions.'
      });
      setScanning(false);
    }
  }, [scanning, isAuthenticated, cleanupScanner, handleSuccessfulScan, addMessage]);

  const handleClose = useCallback(async () => {
    console.log('🚪 Closing QR scanner');
    try {
      await cleanupScanner();
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate('/galleries');
    } catch (err) {
      console.error('Error during close:', err);
      // Force cleanup one more time before navigation
      try {
        await cleanupScanner();
      } catch (finalErr) {
        console.error('Final cleanup attempt failed:', finalErr);
      }
      navigate('/galleries');
    }
  }, [cleanupScanner, navigate]);

  // Restart scanner if too many failed attempts
  useEffect(() => {
    if (scanAttempts > 5) {
      console.log('Too many scan attempts, restarting scanner');
      setScanAttempts(0);
      startScanner();
    }
  }, [scanAttempts, startScanner]);

  // Component mount/unmount effect
  useEffect(() => {
    const initialize = async () => {
      if (isAuthenticated && !scanning && !scanResult) {
        console.log('🟢 Conditions met, starting scanner');
        await startScanner();
      }
    };

    const cleanup = async () => {
      console.log('🔴 Component unmounting');
      try {
        // First stop scanning
        if (scannerRef.current && scannerRef.current.isScanning) {
          await scannerRef.current.stop();
          // Small delay to ensure stop completes
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Then do full cleanup
        await cleanupScanner();
      } catch (err) {
        console.error('Cleanup error during unmount:', err);
        // Force cleanup of any remaining resources
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (_) {
          // Ignore errors here as we're already in cleanup
        }
      }
    };

    initialize();

    // Cleanup function
    return () => {
      cleanup().catch(err => {
        console.error('Final cleanup attempt failed:', err);
        // Last resort: try to stop any remaining video tracks
        try {
          const videoElements = document.querySelectorAll('video');
          videoElements.forEach(video => {
            if (video.srcObject) {
              video.srcObject.getTracks().forEach(track => track.stop());
              video.srcObject = null;
            }
          });
        } catch (_) {
          // Ignore any errors in final cleanup
        }
      });
    };
  }, [isAuthenticated, scanning, scanResult, startScanner, cleanupScanner]);

  return (
    <QRScannerView 
      isAuthenticated={isAuthenticated}
      onClose={handleClose}
      onLogin={() => navigate('/login')}
    />
  );
};

export default QRCodeScanner;
