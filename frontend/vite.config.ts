import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/detect': 'http://127.0.0.1:5000',
      '/gemini': 'http://127.0.0.1:5000',
      '/gemini_convert': 'http://127.0.0.1:5000',
      '/generate_gif': 'http://127.0.0.1:5000',
      '/performative_convert': 'http://127.0.0.1:5000',
      '/play': 'http://127.0.0.1:5000',
      '/static': 'http://127.0.0.1:5000',
    },
  },
});
