import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import process from 'node:process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const sharedProxyOptions = {
    changeOrigin: true,
    secure: mode === 'production',
    configure: (proxy, options) => {
      // Log all requests
      proxy.on('proxyReq', (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} request:`, req.url);
        
        // Copy original headers
        const requestHeaders = { ...req.headers };
        delete requestHeaders.host; // Remove host header as it should point to target
        
        // Set necessary headers for the proxied request
        Object.entries(requestHeaders).forEach(([key, value]) => {
          proxyReq.setHeader(key, value);
        });
      });

      proxy.on('proxyRes', (proxyRes, req, res) => {
        // Set CORS headers before any response is sent
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning');
        
        // Handle OPTIONS preflight requests
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Content-Length', '0');
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
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy all API requests
        '/api/v0.1/users': {
          target: 'https://authentication.secretstartups.org',
          rewrite: (path) => path.replace('/api/v0.1/users', '/v0.1/users'),
          ...sharedProxyOptions
        },
        '/api/v0.1/gallery': {
          target: env.VITE_GALLERY_API_URL.replace('/v01', ''),
          rewrite: (path) => path.replace('/api/v0.1/gallery', '/v01'),
          ...sharedProxyOptions
        },
        '/api/groups': {
          target: env.VITE_NGROK_API_URL,
          changeOrigin: true,
          rewrite: (path) => {
            // Remove /api prefix and add /groups
            return path.replace('/api/groups', '/groups');
          },
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`Proxying ${req.method} request to: ${proxyReq.path}`);
              // Add ngrok-skip-browser-warning header to the proxied request
              proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
            });

            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Set CORS headers
              res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
              res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
              
              if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.end();
                return;
              }
            });

            proxy.on('error', (err, _req, _res) => {
              console.error('Proxy error:', err);
            });
          }
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
