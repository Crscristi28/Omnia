import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker with automatic updates
registerSW({
  onOfflineReady() {
    console.log('🔄 PWA ready to work offline');
  },
  onRegistered(registration) {
    console.log('✅ PWA Service Worker registered:', registration);
  },
  onRegisterError(error) {
    console.error('❌ PWA Service Worker registration failed:', error);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
