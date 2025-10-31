import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            rewrite: (path) => path,
          },
        },
      },
      plugins: [react()],
      define: {
        // NOTE: Never expose sensitive API keys to the client.
        // The GEMINI_API_KEY should ONLY be used in backend/server functions.
        // Clients should call a backend endpoint instead.
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
