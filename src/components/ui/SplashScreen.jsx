// 🎨 MODERN MINIMAL SPLASH SCREEN
// ✨ Clean design with smooth animations

import React from 'react';

const ModernSplashScreen = ({ isVisible, onComplete }) => {
  const [fadeOut, setFadeOut] = React.useState(false);
  const [logoVisible, setLogoVisible] = React.useState(false);
  const [textVisible, setTextVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (isVisible) {
      // Smooth entrance sequence
      setTimeout(() => setLogoVisible(true), 100);
      setTimeout(() => setTextVisible(true), 400);
      
      // Start fade out
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => onComplete(), 500);
      }, 2000);
      
      return () => {
        clearTimeout(fadeTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      {/* MODERN ANIMATIONS */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: scale(0.9);
          }
          100% { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        
        @keyframes fadeInUp {
          0% { 
            opacity: 0; 
            transform: translateY(20px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes softPulse {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.05);
          }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* CLEAN MODERN CONTAINER */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #151931 50%, #1a1f3a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 500ms ease-out',
        overflow: 'hidden'
      }}>


        {/* LOGO AND TEXT CONTAINER */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '50px'
        }}>
          
          {/* COLORFUL GRADIENT LOGO */}
          <div style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, 
              #00d4ff 0%, 
              #7e57ff 25%, 
              #ff57d0 50%, 
              #ffb457 75%, 
              #00d4ff 100%)`,
            backgroundSize: '200% 200%',
            animation: logoVisible ? 'fadeInScale 0.6s ease-out, gradientShift 3s ease infinite' : 'none',
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'scale(1)' : 'scale(0.9)',
            transition: 'all 0.6s ease-out',
            boxShadow: `
              0 10px 40px rgba(126, 87, 255, 0.3),
              0 20px 60px rgba(0, 212, 255, 0.2)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* INNER WHITE CIRCLE */}
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.05)'
            }}>
              {/* OMNIA LOGO TEXT */}
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #00d4ff 0%, #7e57ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                O
              </div>
            </div>
          </div>
          
          {/* CLEAN TEXT */}
          <div style={{ 
            textAlign: 'center',
            opacity: textVisible ? 1 : 0,
            animation: textVisible ? 'fadeInUp 0.6s ease-out' : 'none'
          }}>
            
            {/* OMNIA TITLE */}
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: '0.4rem',
              margin: '0 0 10px 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              OMNIA
            </h1>
            
            {/* SUBTITLE */}
            <p style={{
              fontSize: '1.1rem',
              fontWeight: '300',
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '0.3rem',
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              textTransform: 'uppercase'
            }}>
              ONE AI
            </p>
          </div>
        </div>

        {/* SIMPLE LOADING DOTS */}
        <div style={{
          position: 'absolute',
          bottom: '80px',
          display: 'flex',
          gap: '8px',
          opacity: textVisible ? 0.6 : 0,
          transition: 'opacity 0.5s ease-out'
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.5)',
                animation: `softPulse 1.5s infinite`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ModernSplashScreen;