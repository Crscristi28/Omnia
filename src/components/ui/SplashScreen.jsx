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
      background: '#0a1428',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '30px',
      zIndex: 10000,
      transform: 'translateZ(0)'
    }}>
      
      {/* OMNIA SPHERE - vylepšený fluid design */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        position: 'relative',
        background: `
          radial-gradient(ellipse 60% 40% at 35% 25%, 
            rgba(255, 255, 255, 0.9) 0%,
            rgba(0, 200, 255, 0.8) 15%,
            rgba(0, 150, 255, 0.9) 30%,
            rgba(80, 100, 255, 1) 50%,
            rgba(150, 80, 255, 1) 70%,
            rgba(200, 50, 200, 1) 85%,
            rgba(50, 20, 100, 1) 100%
          ),
          radial-gradient(ellipse 80% 60% at 60% 70%, 
            transparent 0%,
            rgba(0, 255, 200, 0.3) 20%,
            rgba(100, 150, 255, 0.4) 40%,
            rgba(200, 100, 255, 0.3) 60%,
            transparent 80%
          )
        `,
        overflow: 'hidden'
      }}>
        
        {/* Fluid tekutý vnitřní efekt */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '70%',
          height: '60%',
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse 70% 50% at 40% 30%,
              rgba(255, 255, 255, 0.6) 0%,
              rgba(0, 255, 255, 0.4) 25%,
              rgba(100, 200, 255, 0.3) 50%,
              transparent 75%
            )
          `,
          filter: 'blur(1px)'
        }} />
        
        {/* Další fluid vrstva pro depth */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '30%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: `
            radial-gradient(circle,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(200, 255, 255, 0.5) 40%,
              transparent 70%
            )
          `,
          filter: 'blur(0.5px)'
        }} />
      </div>
      
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