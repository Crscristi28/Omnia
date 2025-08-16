// 📁 src/components/ui/SplashScreen.jsx
// 🎨 PWA Splash Screen Component

import React from 'react';

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
      
      {/* FLUID LOGO - přesně jako na fotce */}
      <div style={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        position: 'relative',
        background: `
          radial-gradient(ellipse at 30% 20%, 
            #00ffff 0%,
            #0096ff 25%,
            #6432ff 50%,
            #9932cc 75%,
            #ff006e 90%,
            #8b5cf6 100%
          )
        `,
        boxShadow: `
          0 0 60px rgba(0, 255, 255, 0.6),
          0 0 120px rgba(100, 50, 255, 0.4),
          inset 0 0 40px rgba(255, 255, 255, 0.1)
        `,
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        
        {/* Fluid layer 1 */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at 40% 30%, 
              rgba(0, 255, 255, 0.9) 0%,
              rgba(0, 150, 255, 0.7) 30%,
              rgba(100, 50, 255, 0.5) 60%,
              transparent 100%
            )
          `,
          filter: 'blur(3px)'
        }} />
        
        {/* Fluid layer 2 */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at 70% 70%, 
              rgba(147, 51, 234, 0.8) 0%,
              rgba(100, 50, 255, 0.6) 40%,
              rgba(0, 150, 255, 0.4) 70%,
              transparent 100%
            )
          `,
          filter: 'blur(2px)'
        }} />
        
        {/* Highlight */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '40%',
          height: '30%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.3)',
          filter: 'blur(8px)'
        }} />
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