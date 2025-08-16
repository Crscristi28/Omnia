// 📁 src/components/ui/SplashScreen.jsx
// 🎨 PWA Splash Screen Component

import React from 'react';
import omniaLogo from '../../assets/omnia-logo.png';

const SplashScreen = ({ isVisible, onComplete }) => {
  
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500); // 1.5 sekund
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      transform: 'translateZ(0)'
    }}>
      
      {/* FLUID LOGO - přesně tvůj design */}
      <div style={{
        width: '200px',
        height: '200px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={omniaLogo}
          alt="OMNIA Logo"
          style={{
            width: '200px',
            height: '200px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 40px rgba(0, 255, 255, 0.5))'
          }}
        />
      </div>
      
      {/* OMNIA TEXT */}
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '300',
        color: '#ffffff',
        letterSpacing: '0.5rem',
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
      }}>
        OMNIA
      </h1>
      
    </div>
  );
};

export default SplashScreen;