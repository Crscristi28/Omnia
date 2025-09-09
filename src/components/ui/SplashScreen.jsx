// ⚡ ULTRA MODERN NEON SPLASH SCREEN
// 🎯 Minimalist design with electric glow effects

import React from 'react';

const NeonSplashScreen = ({ isVisible, onComplete }) => {
  const [fadeOut, setFadeOut] = React.useState(false);
  const [logoState, setLogoState] = React.useState('off'); // off, flicker, on
  const [textVisible, setTextVisible] = React.useState(false);
  const [scanlinePosition, setScanlinePosition] = React.useState(0);
  
  React.useEffect(() => {
    if (isVisible) {
      // Scanline animation
      const scanInterval = setInterval(() => {
        setScanlinePosition(prev => (prev + 1) % 100);
      }, 50);
      
      // Logo flicker sequence
      setTimeout(() => setLogoState('flicker'), 200);
      setTimeout(() => setLogoState('on'), 600);
      
      // Text appears after logo
      setTimeout(() => setTextVisible(true), 800);
      
      // Start fade out
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => onComplete(), 600);
      }, 2500);
      
      return () => {
        clearTimeout(fadeTimer);
        clearInterval(scanInterval);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      {/* NEON CSS ANIMATIONS */}
      <style jsx>{`
        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 20px rgba(0, 255, 255, 1))
                    drop-shadow(0 0 40px rgba(0, 255, 255, 0.8))
                    drop-shadow(0 0 60px rgba(0, 255, 255, 0.6));
          }
          20%, 24%, 55% {
            opacity: 0.3;
            filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
          }
        }
        
        @keyframes neonPulse {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(0, 255, 255, 1))
                    drop-shadow(0 0 60px rgba(0, 255, 255, 0.8))
                    drop-shadow(0 0 90px rgba(0, 255, 255, 0.6))
                    drop-shadow(0 0 120px rgba(0, 255, 255, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(0, 255, 255, 1))
                    drop-shadow(0 0 80px rgba(0, 255, 255, 0.9))
                    drop-shadow(0 0 110px rgba(0, 255, 255, 0.7))
                    drop-shadow(0 0 140px rgba(0, 255, 255, 0.5));
          }
        }
        
        @keyframes textGlow {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes electricSpark {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(2); }
        }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      {/* PURE BLACK CONTAINER WITH NEON */}
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
        transition: 'opacity 600ms ease-out',
        overflow: 'hidden'
      }}>

        {/* SUBTLE SCANLINE EFFECT */}
        <div style={{
          position: 'absolute',
          top: `${scanlinePosition}%`,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent)',
          pointerEvents: 'none',
          opacity: 0.5
        }} />
        
        {/* ELECTRIC SPARKS ON LOGO ACTIVATION */}
        {logoState === 'flicker' && (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#00ffff',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 72}deg) translateX(150px)`,
                  animation: 'electricSpark 0.4s ease-out forwards',
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </>
        )}

        {/* NEON LOGO CONTAINER */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '60px'
        }}>
          
          {/* NEON CIRCLE LOGO */}
          <div style={{
            position: 'relative',
            width: '200px',
            height: '200px'
          }}>
            {/* NEON RING */}
            <svg
              width="200"
              height="200"
              style={{
                position: 'absolute',
                opacity: logoState === 'off' ? 0 : 1,
                animation: logoState === 'flicker' ? 'neonFlicker 0.5s' : logoState === 'on' ? 'neonPulse 2s infinite' : 'none',
                transition: 'opacity 0.3s'
              }}
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#00ffff"
                strokeWidth="2"
                style={{
                  filter: 'url(#neonGlow)'
                }}
              />
              <defs>
                <filter id="neonGlow">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
            </svg>
            
            {/* CENTER LETTER O */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '80px',
              fontWeight: '100',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: '#00ffff',
              opacity: logoState === 'off' ? 0 : 1,
              animation: logoState === 'flicker' ? 'neonFlicker 0.5s' : logoState === 'on' ? 'neonPulse 2s infinite' : 'none',
              transition: 'opacity 0.3s'
            }}>
              O
            </div>
            
            {/* REFLECTION ON FLOOR */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%) scaleY(-0.3)',
              width: '200px',
              height: '200px',
              opacity: logoState === 'on' ? 0.2 : 0,
              transition: 'opacity 1s',
              pointerEvents: 'none'
            }}>
              <svg width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#00ffff"
                  strokeWidth="2"
                  opacity="0.3"
                />
              </svg>
            </div>
          </div>
          
          {/* NEON TEXT */}
          <div style={{ 
            textAlign: 'center',
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out'
          }}>
            
            {/* OMNIA TITLE - ULTRA THIN */}
            <h1 style={{
              fontSize: '5rem',
              fontWeight: '100',
              color: '#00ffff',
              letterSpacing: '1.5rem',
              margin: '0 0 20px 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
              textShadow: `
                0 0 10px rgba(0, 255, 255, 0.8),
                0 0 20px rgba(0, 255, 255, 0.6),
                0 0 30px rgba(0, 255, 255, 0.4),
                0 0 40px rgba(0, 255, 255, 0.2)
              `,
              animation: textVisible ? 'textGlow 0.8s ease-out' : 'none'
            }}>
              OMNIA
            </h1>
            
            {/* SUBTITLE - MINIMAL */}
            <p style={{
              fontSize: '1rem',
              fontWeight: '200',
              color: 'rgba(0, 255, 255, 0.7)',
              letterSpacing: '0.8rem',
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
              textTransform: 'uppercase',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
            }}>
              ONE AI
            </p>
          </div>
        </div>

        {/* MINIMAL LOADING INDICATOR */}
        <div style={{
          position: 'absolute',
          bottom: '60px',
          display: 'flex',
          gap: '10px',
          opacity: textVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-out'
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: '#00ffff',
                opacity: 0.5,
                animation: `neonPulse 1.5s infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default NeonSplashScreen;