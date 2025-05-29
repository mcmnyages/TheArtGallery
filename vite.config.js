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
  GALLERY_URL: process.env.VITE_GALLERY_API_URL || 'http://localhost:3002'
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
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Update SERVICE_URLS with loaded environment variables
  SERVICE_URLS.AUTH = env.VITE_AUTH_API_URL || 'http://localhost:3000';
  SERVICE_URLS.GALLERY_URL = env.VITE_GALLERY_API_URL || 'http://localhost:3002';
  
  return {
    server: {
      host: "::",
      port: 8080,      proxy: {
        // Auth Service - handles all authentication related endpoints
        '^/(login|register|logout|profile)': createServiceProxy(SERVICE_URLS.AUTH, {
          rewrite: (path) => `/v0.1/users${path}`
        }),
        
        // OtherURL Service - handles all OtherURL related endpoints
        '^/(images|upload|delete)': createServiceProxy(SERVICE_URLS.OtherURL),

        // Gallery Service - handles all gallery related endpoints
        '^/gallery/?(.*)': createServiceProxy(SERVICE_URLS.GALLERY_URL, {
          rewrite: (path) => path.replace(/^\/gallery/, '')
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
