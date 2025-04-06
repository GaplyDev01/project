import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Remove the Content-Type header configuration - it's causing issues
  server: {
    fs: {
      strict: false, // Allow serving files from outside the root directory
    },
  },
  build: {
    // Ensure source maps are generated
    sourcemap: true,
  },
});