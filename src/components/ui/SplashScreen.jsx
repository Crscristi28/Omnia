// 🎨 OMNIA AI SPLASH SCREEN - Custom Logo Design
// 🚀 Clean design with custom AI brain logo and smooth animations

import React from 'react';

const OmniaSplashScreen = ({ isVisible, onComplete }) => {
  const [fadeOut, setFadeOut] = React.useState(false);
  const [showLogo, setShowLogo] = React.useState(false);
  const [showText, setShowText] = React.useState(false);

  React.useEffect(() => {
    if (isVisible) {
      // Show logo after 300ms
      setTimeout(() => setShowLogo(true), 300);

      // Show text after logo (1.2s total)
      setTimeout(() => setShowText(true), 1200);

      // Start fade out after 3s
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
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }

        @keyframes logoGlow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.3)) blur(0px);
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(140, 82, 255, 0.5)) blur(0px);
          }
        }
      `}</style>

      {/* Main Splash Container */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000', // Pure black background
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        opacity: fadeOut ? 0 : 1,
        filter: fadeOut ? 'blur(10px)' : 'blur(0px)',
        transform: fadeOut ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 600ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        overflow: 'hidden'
      }}>

        {/* Logo Container */}
        <div style={{
          marginBottom: '60px',
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          filter: showLogo ? 'blur(0px)' : 'blur(10px)',
          transition: 'all 800ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          animation: showLogo ? 'logoGlow 3s ease-in-out infinite' : 'none'
        }}>
          <img
            src="/images/omnia-ai-logo.jpg"
            alt="Omnia AI Logo"
            style={{
              width: '350px',
              height: 'auto',
              maxWidth: '80vw',
              objectFit: 'contain',
              borderRadius: '20px',
              boxShadow: '0 0 50px rgba(0, 212, 255, 0.2)'
            }}
          />
        </div>

        {/* Text Container */}
        <div style={{
          textAlign: 'center',
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateY(0)' : 'translateY(30px)',
          filter: showText ? 'blur(0px)' : 'blur(5px)',
          transition: 'all 600ms cubic-bezier(0.4, 0.0, 0.2, 1) 0.2s'
        }}>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #8c52ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.3rem',
            margin: '0 0 20px 0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textShadow: '0 0 30px rgba(0, 212, 255, 0.3)'
          }}>
            OMNIA ONE AI
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
            fontWeight: '300',
            color: 'rgba(255, 255, 255, 0.8)',
            letterSpacing: '0.2rem',
            margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textTransform: 'uppercase'
          }}>
            Think Global. Answer Local.
          </p>
        </div>

      </div>
    </>
  );
};

export default OmniaSplashScreen;