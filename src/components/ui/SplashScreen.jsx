// 🎨 PROFESIONÁLNÍ SPLASH SCREEN - PREVIEW NÁVRH
// 🚀 Modern design s pokročilými animacemi

import React from 'react';

const ProfessionalSplashScreen = ({ isVisible, onComplete }) => {
  const [fadeOut, setFadeOut] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [showContent, setShowContent] = React.useState(false);
  
  React.useEffect(() => {
    if (isVisible) {
      // Fade in content po 200ms
      setTimeout(() => setShowContent(true), 200);
      
      // Simulace loading progress
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 150);
      
      // Start fade out po 2.5s
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => onComplete(), 800);
      }, 2500);
      
      return () => {
        clearTimeout(fadeTimer);
        clearInterval(progressTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      {/* CSS ANIMACE - Professional keyframes */}
      <style jsx>{`
        @keyframes gradientSpin {
          0% { transform: rotate(0deg) scale(0.8); filter: blur(20px); }
          50% { transform: rotate(180deg) scale(1.1); filter: blur(0px); }
          100% { transform: rotate(360deg) scale(1); filter: blur(0px); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 0 0 40px rgba(0, 212, 255, 0.4),
                        0 0 80px rgba(153, 102, 255, 0.2),
                        inset 0 0 40px rgba(255, 255, 255, 0.1);
          }
          50% { 
            box-shadow: 0 0 80px rgba(0, 212, 255, 0.8),
                        0 0 160px rgba(153, 102, 255, 0.4),
                        inset 0 0 60px rgba(255, 255, 255, 0.2);
          }
        }
        
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px) blur(10px); }
          100% { opacity: 1; transform: translateY(0) blur(0px); }
        }
        
        @keyframes typewriter {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        @keyframes particles {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* MAIN SPLASH CONTAINER */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: `
          radial-gradient(ellipse at top, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at bottom, rgba(153, 102, 255, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        opacity: fadeOut ? 0 : 1,
        filter: fadeOut ? 'blur(10px)' : 'blur(0px)',
        transform: fadeOut ? 'scale(0.9)' : 'scale(1)',
        transition: 'all 800ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        overflow: 'hidden'
      }}>

        {/* FLOATING PARTICLES BACKGROUND - VERTICAL ONLY */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              borderRadius: '50%',
              background: `rgba(${Math.random() > 0.5 ? '0, 212, 255' : '153, 102, 255'}, ${Math.random() * 0.6 + 0.3})`,
              left: Math.random() * 100 + '%',
              top: '100vh',
              animation: `particles ${Math.random() * 8 + 6}s linear infinite`,
              animationDelay: Math.random() * 4 + 's'
            }}
          />
        ))}

        {/* CONTENT CONTAINER - Direct on background */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: showContent ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          opacity: showContent ? 1 : 0,
          transition: 'all 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}>
          
          {/* ROTATING GRADIENT LOGO RING */}
          <div style={{
            width: '240px',
            height: '240px',
            marginBottom: '50px',
            borderRadius: '50%',
            background: `conic-gradient(from 0deg,
              #00d4ff 0deg,
              #0099ff 60deg,
              #4d79ff 120deg,
              #8c52ff 180deg,
              #b833ff 240deg,
              #ff33cc 300deg,
              #00d4ff 360deg
            )`,
            animation: 'gradientSpin 3s ease-in-out forwards, pulseGlow 2s ease-in-out infinite',
            position: 'relative'
          }}>
            {/* INNER CIRCLE WITH SUBTLE GLASSMORPHISM */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
                rgba(0, 0, 0, 0.3)
              `,
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              
              {/* AI BRAIN ICON */}
              <div style={{
                fontSize: '70px',
                background: 'linear-gradient(45deg, #00d4ff, #8c52ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 25px rgba(0, 212, 255, 0.6))'
              }}>
                🧠
              </div>
            </div>
          </div>
          
          {/* ANIMATED TEXT */}
          <div style={{ 
            textAlign: 'center',
            animation: 'fadeInUp 1.2s cubic-bezier(0.4, 0.0, 0.2, 1) 0.5s both'
          }}>
            
            {/* OMNIA TITLE */}
            <h1 style={{
              fontSize: '4rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #8c52ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.3rem',
              margin: '0 0 8px 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              filter: 'drop-shadow(0 0 30px rgba(0, 212, 255, 0.3))',
              textShadow: '0 0 40px rgba(140, 82, 255, 0.3)',
              animation: 'fadeInUp 1s cubic-bezier(0.4, 0.0, 0.2, 1) 0.8s both'
            }}>
              OMNIA
            </h1>
            
            {/* SUBTITLE WITH TYPEWRITER EFFECT */}
            <div style={{ overflow: 'hidden', height: '40px' }}>
              <p style={{
                fontSize: '1.3rem',
                fontWeight: '300',
                color: 'rgba(255, 255, 255, 0.8)',
                letterSpacing: '0.25rem',
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                whiteSpace: 'nowrap',
                borderRight: '2px solid #00d4ff',
                animation: 'typewriter 1.5s steps(20) 1.2s both, fadeInUp 0.5s ease 1.2s both',
                paddingRight: '5px'
              }}>
                ONE AI ASSISTANT
              </p>
            </div>
          </div>
        </div>

        {/* ELEGANT PROGRESS BAR */}
        <div style={{
          position: 'absolute',
          bottom: '80px',
          width: '300px',
          height: '2px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          opacity: showContent ? 1 : 0,
          transition: 'opacity 1s ease 1.5s'
        }}>
          <div style={{
            width: `${Math.min(progress, 100)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00d4ff, #8c52ff)',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
          }} />
        </div>

        {/* PROGRESS PERCENTAGE */}
        <div style={{
          position: 'absolute',
          bottom: '45px',
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: '300',
          letterSpacing: '0.1rem',
          opacity: showContent ? 1 : 0,
          transition: 'opacity 1s ease 1.8s'
        }}>
          {Math.round(Math.min(progress, 100))}%
        </div>
      </div>
    </>
  );
};

export default ProfessionalSplashScreen;