import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'vendor-react': ['react', 'react-dom'],
          // Large UI libraries
          'ui-markdown': ['@uiw/react-md-editor', 'remark-math', 'rehype-katex'],
          // Database
          'vendor-db': ['dexie'],
          // Icons and UI
          'vendor-ui': ['lucide-react'],
          // AI and utilities
          'vendor-utils': ['@google/generative-ai']
        }
      }
    }
  }
})
