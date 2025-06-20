import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import process from 'node:process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define base URLs for different services
const SERVICE_URLS = {
  AUTH: process.env.VITE_AUTH_API_URL || 'http://localhost:3000',
  OtherURL: process.env.OTHER_SERVICE_URL || 'http://localhost:3001',
  AUTHZ_URL: process.env.VITE_AUTHZ_API_URL || 'http://localhost:3003',
  GALLERY_URL: process.env.VITE_GALLERY_API_URL || 'http://localhost:3002',
  TREASURY_URL: process.env.VITE_TREASURY_API_URL || 'http://localhost:3004'
};

// Define proxy configurations for different service types
const createServiceProxy = (target, options = {}) => {
  return {
    target,
    changeOrigin: true,
    secure: false,
    rewrite: options.rewrite,
    configure: (proxy, _options) => {
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        console.log(`Proxying ${req.method} request to ${target}:`, req.url);
        
        // Copy original headers
        const requestHeaders = { ...req.headers };
        delete requestHeaders.host;
        
        // Set necessary headers for the proxied request
        Object.entries(requestHeaders).forEach(([key, value]) => {
          proxyReq.setHeader(key, value);
        });

        // Add required headers for specific services
        if (target === SERVICE_URLS.GALLERY_URL) {
          proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
        }

        // Copy authorization header if present
        const authHeader = req.headers['authorization'];
        if (authHeader) {
          proxyReq.setHeader('Authorization', authHeader);
        }
      });

      proxy.on('proxyRes', (proxyRes, req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning');
        
        // Handle OPTIONS preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }
      });

      proxy.on('error', (err, req, res) => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:8080',
            'Access-Control-Allow-Credentials': 'true'
          });
          res.end(JSON.stringify({ 
            error: 'Proxy Error', 
            message: err.message 
          }));
        }
      });
    }
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Update SERVICE_URLS with loaded environment variables
  SERVICE_URLS.AUTH = env.VITE_AUTH_API_URL || 'http://localhost:3000';
  SERVICE_URLS.GALLERY_URL = env.VITE_GALLERY_API_URL || 'http://localhost:3002';
  SERVICE_URLS.AUTHZ_URL = env.VITE_AUTHZ_API_URL || 'http://localhost:3003';
  SERVICE_URLS.TREASURY_URL = env.VITE_TREASURY_API_URL || 'http://localhost:3004';
    return {
    server: {
      host: "localhost",
      port: 8080,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
      },
      proxy: {
        // Auth Service - handles all authentication related endpoints
        '^/(login|register|logout|profile|verify-otp|request-otp)': createServiceProxy(SERVICE_URLS.AUTH, {
          rewrite: (path) => `/v0.1/users${path}`
        }),
        
        // Authorization Service - handles all resource access checks
        '^/(resource/accessibleResources|resource/all|policy/add)': createServiceProxy(SERVICE_URLS.AUTHZ_URL, {
          rewrite: (path) => `/v0.1${path}`
        }),

        // OtherURL Service - handles all OtherURL related endpoints
        '^/(images|upload|delete)': createServiceProxy(SERVICE_URLS.OtherURL),

        // Gallery Service - handles all gallery related endpoints
        '^/gallery/?(.*)': createServiceProxy(SERVICE_URLS.GALLERY_URL, {
          rewrite: (path) => path.replace(/^\/gallery/, '')
        }),        // Treasury Service - handles all wallet and treasury related endpoints
        '^/treasury/?(.*)': createServiceProxy(SERVICE_URLS.TREASURY_URL, {
          rewrite: (path) => `/v0.1${path.replace(/^\/treasury/, '')}`
        })
      }
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': env
    }
  };
});
