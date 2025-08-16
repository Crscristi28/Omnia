// 📁 src/components/ui/SplashScreen.jsx
// 🎨 PWA Splash Screen Component

import React from 'react';
import fluidSphere from '../../assets/fluid-sphere.png';

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
      background: '#0a1428',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '30px',
      zIndex: 10000,
      transform: 'translateZ(0)'
    }}>
      
      {/* OMNIA SPHERE - tvůj originální fluid design */}
      <img 
        src={fluidSphere}
        alt="OMNIA Fluid Sphere"
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'contain'
        }}
      />
      
      {/* OMNIA TEXT */}
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '300',
        color: '#ffffff',
        letterSpacing: '0.3rem',
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        OMNIA
      </h1>
      
    </div>
  );
};

export default SplashScreen;