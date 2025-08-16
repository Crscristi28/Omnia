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
      background: 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      transform: 'translateZ(0)'
    }}>
      
      {/* OMNIA GRADIENT CIRCLE LOGO */}
      <div style={{
        width: '200px',
        height: '200px',
        marginBottom: '60px',
        borderRadius: '50%',
        background: `
          conic-gradient(from 0deg,
            #00d4ff 0deg,
            #0099ff 60deg,
            #4d79ff 120deg,
            #8c52ff 180deg,
            #b833ff 240deg,
            #ff33cc 300deg,
            #00d4ff 360deg
          )
        `,
        position: 'relative'
      }}>
        {/* Průhledný střed */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #000428, #004e92, #009ffd)'
        }} />
      </div>
      
      {/* OMNIA TEXT */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '600',
          color: '#ffffff',
          letterSpacing: '0.5rem',
          margin: '0 0 0.5rem 0',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          OMNIA
        </h1>
        <p style={{
          fontSize: '1.2rem',
          fontWeight: '300',
          color: '#94a3b8',
          letterSpacing: '0.2rem',
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          ONE AI
        </p>
      </div>
      
    </div>
  );
};

export default SplashScreen;