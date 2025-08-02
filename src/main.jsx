import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker with automatic updates
registerSW({
  onNeedRefresh() {
    console.log('🔄 PWA update available - refreshing automatically...');
    // Force page reload to get new version
    window.location.reload();
  },
  onOfflineReady() {
    console.log('🔄 PWA ready to work offline');
  },
  onRegistered(registration) {
    console.log('✅ PWA Service Worker registered:', registration);
    
    // Check for updates every 60 seconds
    setInterval(() => {
      registration.update().then(() => {
        console.log('🔍 PWA checking for updates...');
      });
    }, 60000);
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
