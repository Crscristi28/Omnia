// 🎨 MODERN MINIMAL SPLASH SCREEN
// ✨ Clean design with smooth animations

import React from 'react';
import omniaSphere from '../../assets/omnia-sphere.png';

const ModernSplashScreen = ({ isVisible, onComplete }) => {
  const [fadeOut, setFadeOut] = React.useState(false);
  const [logoVisible, setLogoVisible] = React.useState(false);
  const [textVisible, setTextVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (isVisible) {
      // Smooth entrance sequence
      setTimeout(() => setLogoVisible(true), 200);
      setTimeout(() => setTextVisible(true), 800);
      
      // Start fade out
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => onComplete(), 600);
      }, 3000);
      
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

      {/* PURE BLACK CONTAINER */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
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
          gap: '40px'
        }}>
          
          {/* OMNIA SPHERE LOGO */}
          <img 
            src={omniaSphere}
            alt="Omnia Sphere Logo"
            style={{
              width: '220px',
              height: '220px',
              objectFit: 'contain',
              animation: logoVisible ? 'fadeInScale 0.8s ease-out, softPulse 3s ease-in-out infinite' : 'none',
              opacity: logoVisible ? 1 : 0,
              transform: logoVisible ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'drop-shadow(0 0 60px rgba(100, 150, 255, 0.5)) drop-shadow(0 0 100px rgba(200, 100, 255, 0.3))'
            }}
          />
          
          {/* TEXT SECTION */}
          <div style={{ 
            textAlign: 'center',
            opacity: textVisible ? 1 : 0,
            animation: textVisible ? 'fadeInUp 0.8s ease-out' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            
            {/* OMNIA ONE AI */}
            <div style={{
              marginBottom: '10px'
            }}>
              <h1 style={{
                fontSize: '3.2rem',
                fontWeight: '600',
                color: '#ffffff',
                letterSpacing: '0.3rem',
                margin: '0 0 8px 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                OMNIA
              </h1>
              
              <p style={{
                fontSize: '1.3rem',
                fontWeight: '300',
                color: 'rgba(255, 255, 255, 0.8)',
                letterSpacing: '0.2rem',
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                ONE AI
              </p>
            </div>
            
            {/* TAGLINE */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '20px',
              marginTop: '10px'
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '0.15rem',
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textTransform: 'uppercase'
              }}>
                THINK GLOBAL. ANSWER LOCAL
              </p>
            </div>
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