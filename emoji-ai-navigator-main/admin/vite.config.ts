import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/admin': { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:8001', changeOrigin: true },
    },
  },
  build: { outDir: 'dist' },
});
