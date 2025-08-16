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
      
      {/* FLUID SPHERE - CSS vytvořená koule */}
      <div style={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        marginBottom: '80px',
        position: 'relative',
        background: `
          radial-gradient(circle at 30% 30%, 
            #ffffff 0%,
            #00ccff 8%,
            #0088ff 25%,
            #4466ff 45%,
            #8844ff 65%,
            #cc22ff 85%,
            #000044 100%
          )
        `,
        boxShadow: `
          0 0 80px rgba(0, 200, 255, 0.8),
          0 0 160px rgba(200, 100, 255, 0.6),
          0 0 240px rgba(255, 50, 200, 0.4),
          inset 0 0 50px rgba(255, 255, 255, 0.15)
        `,
        overflow: 'hidden'
      }}>
        
        {/* Fluid vlny efekt */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: `
            conic-gradient(from 45deg,
              transparent 0deg,
              rgba(0, 255, 255, 0.3) 60deg,
              rgba(147, 51, 234, 0.4) 120deg,
              transparent 180deg,
              rgba(0, 150, 255, 0.3) 240deg,
              transparent 300deg
            )
          `,
          filter: 'blur(4px)',
          animation: 'rotate 8s linear infinite'
        }} />
        
        {/* Highlight efekt */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '25%',
          width: '40%',
          height: '30%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
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

      {/* CSS animace pro rotaci */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
    </div>
  );
};

export default SplashScreen;