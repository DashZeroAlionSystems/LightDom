import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/ml': path.resolve(__dirname, './src/ml'),
      '@/database': path.resolve(__dirname, './src/database'),
      '@/crawler': path.resolve(__dirname, './src/crawler'),
      '@/design-system': path.resolve(__dirname, './src/design-system'),
      '@/neural': path.resolve(__dirname, './src/neural'),
      '@/rag': path.resolve(__dirname, './src/rag'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/vscode': path.resolve(__dirname, './src/components/vscode'),
      '@/admin': path.resolve(__dirname, './src/components/admin'),
      '@/stories': path.resolve(__dirname, './src/stories'),
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('\n[Vite Proxy Error] Failed to proxy API request to backend server');
            console.log('→ Make sure the API server is running on port 3001');
            console.log('→ Start it with: npm run start:dev (or make dev-full)');
            console.log('→ Error:', (err as any).code || err.message);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log(`[Vite Proxy] ${req.method} ${req.url} → http://localhost:3001${req.url}`);
          });
        },
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log(
              '\n[Vite WebSocket Proxy Error] Failed to proxy WebSocket to backend server'
            );
            console.log('→ Make sure the API server is running on port 3001');
            console.log('→ Error:', (err as any).code || err.message);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          utils: ['axios', 'uuid'],
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
});
