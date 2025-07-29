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
          // Markdown editor core
          'markdown-editor': ['@uiw/react-md-editor'],
          // Math rendering
          'markdown-math': ['remark-math', 'rehype-katex', 'katex'],
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
