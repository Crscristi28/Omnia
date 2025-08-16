// 📁 src/components/ui/OmniaLogos.jsx
// 🎨 All OMNIA logo variations in one file

import React from 'react';

// 🎨 MAIN OMNIA LOGO - Fluid animated logo with liquid effect
export const OmniaLogo = ({ size = 80, animate = false, shouldHide = false, isListening = false }) => {
  if (shouldHide) return null;
  
  return (
    <div
      className="omnia-logo-fluid"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#0a0a0a',
        boxShadow: `
          0 0 ${size * 0.3}px rgba(0, 255, 255, 0.4),
          0 0 ${size * 0.6}px rgba(100, 50, 255, 0.3),
          inset 0 0 ${size * 0.1}px rgba(255, 255, 255, 0.1)
        `,
        border: '2px solid rgba(0, 255, 255, 0.2)',
        transform: 'translateZ(0)'
      }}
    >
      {/* Fluid layer 1 - Main liquid */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at 30% 20%, 
              rgba(0, 255, 255, 0.9) 0%,
              rgba(0, 150, 255, 0.8) 25%,
              rgba(100, 50, 255, 0.7) 50%,
              rgba(150, 50, 200, 0.6) 75%,
              transparent 100%
            )
          `,
          animation: 'fluidMove1 6s ease-in-out infinite',
          filter: 'blur(2px)'
        }}
      />
      
      {/* Fluid layer 2 - Secondary waves */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at 70% 80%, 
              rgba(150, 50, 200, 0.8) 0%,
              rgba(100, 50, 255, 0.6) 30%,
              rgba(0, 150, 255, 0.4) 60%,
              transparent 100%
            )
          `,
          animation: 'fluidMove2 8s ease-in-out infinite reverse',
          filter: 'blur(1px)'
        }}
      />
      
      {/* Fluid layer 3 - Small bubbles */}
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '25%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 50% 50%, 
              rgba(0, 255, 255, 0.7) 0%,
              rgba(0, 200, 255, 0.5) 40%,
              transparent 70%
            )
          `,
          animation: 'fluidMove3 4s ease-in-out infinite',
          filter: 'blur(0.5px)'
        }}
      />
      
      {/* Organic highlight */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '25%',
          width: '30%',
          height: '25%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          filter: 'blur(6px)',
          animation: 'fluidHighlight 5s ease-in-out infinite'
        }}
      />
    </div>
  );
};

// 🎨 MINI OMNIA LOGO - Small clickable logo for voice screen
export const MiniOmniaLogo = ({
  size = 28,
  onClick,
  isAudioPlaying = false,
  loading = false,
  streaming = false,
  isListening = false
}) => {
  const getLogoStyle = () => ({
    width: size,
    height: size,
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transform: 'translateZ(0)',
    pointerEvents: 'auto'
  });

  return (
    <div
      style={{
        ...getLogoStyle(),
        visibility: 'visible !important',
        opacity: '1 !important',
        display: 'flex !important',
        pointerEvents: 'auto !important'
      }}
      onClick={onClick}
      title={isListening ? "Poslouchám..." : "Voice Screen"}
    >
      <div
        style={{
          width: '40%',
          height: '50%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: `${6 + i * 3}px`,
              backgroundColor: 'white',
              borderRadius: 1,
              animation: isListening
                ? `equalizerPulse ${0.5 + i * 0.2}s ease-in-out infinite`
                : 'none',
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 🎨 CHAT OMNIA LOGO - Tiny logo for chat messages
export const ChatOmniaLogo = ({ size = 14 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 30% 40%, 
            #00ffff 0%,
            #0096ff 30%,
            #6432ff 60%,
            #9932cc 80%,
            #4b0082 100%
          )
        `,
        boxShadow: `0 0 ${size * 0.6}px rgba(100, 50, 255, 0.6)`,
        display: 'inline-block',
        marginRight: '6px',
        flexShrink: 0,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    />
  );
};

// Export all logos
export default {
  OmniaLogo,
  MiniOmniaLogo,
  ChatOmniaLogo
};