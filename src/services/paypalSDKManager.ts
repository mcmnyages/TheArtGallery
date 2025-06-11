import { PayPalSDK } from '../components/subscription/PayPalButton';

type SDKLoadState = {
  loading: boolean;
  error: Error | null;
  instance: PayPalSDK | null;
};

class PayPalSDKManager {
  private static instance: PayPalSDKManager;
  private loadState: SDKLoadState = {
    loading: false,
    error: null,
    instance: null,
  };
  private loadPromise: Promise<void> | null = null;
  private debug: boolean = false;

  private constructor() {}

  static getInstance(): PayPalSDKManager {
    if (!PayPalSDKManager.instance) {
      PayPalSDKManager.instance = new PayPalSDKManager();
    }
    return PayPalSDKManager.instance;
  }

  private debugLog(message: string, ...args: any[]) {
    if (this.debug) {
      console.log(`[PayPalSDKManager] ${message}`, ...args);
    }
  }

  setDebug(debug: boolean) {
    this.debug = debug;
  }

  private cleanup() {
    this.debugLog('Cleaning up PayPal SDK');
    // Remove global PayPal instance
    if (window.paypal) {
      // @ts-ignore
      window.paypal = undefined;
    }

    // Remove any existing script tags
    const scripts = document.querySelectorAll('script[src*="paypal.com/sdk/js"]');
    scripts.forEach(script => script.remove());

    this.loadState.instance = null;
    this.loadPromise = null;
  }

  async loadSDK(clientId: string, currency: string = 'USD', debug: boolean = false): Promise<PayPalSDK> {
    this.setDebug(debug);
    
    // If SDK is already loaded and working, return it
    if (window.paypal?.Buttons && this.loadState.instance) {
      this.debugLog('PayPal SDK already loaded, returning existing instance');
      return this.loadState.instance;
    }

    // If already loading, return existing promise
    if (this.loadPromise) {
      this.debugLog('SDK already loading, returning existing promise');
      return this.loadPromise.then(() => {
        if (!this.loadState.instance) {
          throw new Error('PayPal SDK failed to load');
        }
        return this.loadState.instance;
      });
    }

    // Clean up any existing PayPal resources
    this.cleanup();

    this.loadPromise = new Promise<void>((resolve, reject) => {
      this.debugLog('Starting PayPal SDK load');
      this.loadState.loading = true;
      this.loadState.error = null;

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&disable-funding=card&components=buttons&debug=${debug}`;
      script.async = true;

      let timeoutId: number;
      let checkInterval: number;

      const cleanup = () => {
        if (timeoutId) window.clearTimeout(timeoutId);
        if (checkInterval) window.clearInterval(checkInterval);
      };

      script.onload = () => {
        this.debugLog('Script loaded, checking for PayPal object');
        checkInterval = window.setInterval(() => {
          if (window.paypal?.Buttons) {
            cleanup();
            this.loadState.loading = false;
            this.loadState.instance = window.paypal;
            resolve();
          }
        }, 100);

        timeoutId = window.setTimeout(() => {
          cleanup();
          const error = new Error('PayPal SDK initialization timeout');
          this.loadState.error = error;
          this.loadState.loading = false;
          reject(error);
        }, 5000);
      };

      script.onerror = (event) => {
        cleanup();
        const error = new Error('Failed to load PayPal SDK script');
        this.loadState.error = error;
        this.loadState.loading = false;
        reject(error);
      };

      document.head.appendChild(script);
    });

    try {
      await this.loadPromise;
      if (!this.loadState.instance) {
        throw new Error('PayPal SDK failed to load');
      }
      return this.loadState.instance;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }
}

export const paypalSDKManager = PayPalSDKManager.getInstance();
