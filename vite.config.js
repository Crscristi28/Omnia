import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        skipWaiting: false,
        clientsClaim: false,
        maximumFileSizeToCacheInBytes: 5000000, // 5MB limit
        runtimeCaching: [
          // API calls - Network first with fallback
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Static assets - Cache first
          {
            urlPattern: /\.(?:js|css|woff2?|ttf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          // Images - Cache first with fallback
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
              }
            }
          },
          // Documents and files - Network first
          {
            urlPattern: /\.(?:pdf|doc|docx|txt)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'documents',
              networkTimeoutSeconds: 15,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 24 * 60 * 60 // 1 day
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Omnia - AI Asistent',
        short_name: 'Omnia',
        description: 'Inteligentní AI asistent s Claude a GPT-4',
        theme_color: '#007bff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/omnia.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/omnia-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
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
