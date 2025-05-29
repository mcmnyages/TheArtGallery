import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import process from 'node:process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define base URLs for different services
const SERVICE_URLS = {
  AUTH: 'https://authentication.secretstartups.org',
  GALLERY: 'https://gallery.secretstartups.org',
  GROUPS: process.env.VITE_NGROK_API_URL || 'http://localhost:3000'
};

// Define proxy configurations for different service types
const createServiceProxy = (target, pathRewrite = path => path) => ({
  target,
  changeOrigin: true,
  secure: false,
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
      if (target === SERVICE_URLS.GROUPS) {
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
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Update SERVICE_URLS with environment variables if needed
  if (env.VITE_NGROK_API_URL) {
    SERVICE_URLS.GROUPS = env.VITE_NGROK_API_URL;
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Auth Service - handles all authentication related endpoints
        '^/api/auth/.*': {
          ...createServiceProxy(SERVICE_URLS.AUTH),
          rewrite: (path) => path.replace(/^\/api\/auth/, '/v0.1/users')
        },
        
        // Gallery Service - handles all gallery related endpoints
        '^/api/gallery/.*': {
          ...createServiceProxy(SERVICE_URLS.GALLERY),
          rewrite: (path) => {
            if (path.includes('/upload')) return '/upload';
            if (path.includes('/delete/')) return path.replace('/api/gallery/delete', '/delete');
            return path.replace('/api/gallery', '/images');
          }
        },
        
        // Groups Service - handles all group related endpoints
        '^/api/groups/.*': {
          ...createServiceProxy(SERVICE_URLS.GROUPS),
          rewrite: (path) => path.replace(/^\/api\/groups/, '/groups')
        }
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
