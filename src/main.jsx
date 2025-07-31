import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker with update handling
const updateSW = registerSW({
  onNeedRefresh() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('🔥 PWA UPDATE NEEDED - DISPATCHING EVENT!');
    console.log('📱 Device info:', { isMobile, isPWA, userAgent: navigator.userAgent });
    console.log('📱 Document state:', document.readyState);
    console.log('📱 Window focused:', document.hasFocus());
    
    // Store the update function globally immediately
    window.pendingUpdateSW = updateSW;
    
    // Dispatch custom event for update notification
    console.log('📱 Dispatching pwa-update-available event...');
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
    console.log('📱 Event dispatched:', event);
  },
  onOfflineReady() {
    console.log('🔄 PWA ready to work offline');
    // Optional: Show offline ready notification
    window.dispatchEvent(new CustomEvent('pwa-offline-ready'));
  },
  onRegistered(registration) {
    console.log('✅ PWA Service Worker registered:', registration);
    // Make updateSW globally available for manual updates
    window.updatePWA = updateSW;
    console.log('🔧 window.updatePWA is now available');
  },
  onRegisterError(error) {
    console.error('❌ PWA Service Worker registration failed:', error);
  }
});

// Immediate fallback
window.updatePWA = updateSW;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
