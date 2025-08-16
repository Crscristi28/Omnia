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
      background: '#0a1428',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      transform: 'translateZ(0)'
    }}>
      
      {/* OMNIA NETWORK LOGO - SVG */}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ marginBottom: '30px' }}
      >
        <defs>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="50%" stopColor="#357ABD" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </radialGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="30%" stopColor="#3B82F6" />
            <stop offset="70%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="25%" stopColor="#0891B2" />
            <stop offset="50%" stopColor="#0E7490" />
            <stop offset="75%" stopColor="#155E75" />
            <stop offset="100%" stopColor="#164E63" />
          </linearGradient>
        </defs>
        
        {/* Vnější kruh */}
        <circle 
          cx="100" 
          cy="100" 
          r="90" 
          fill="none" 
          stroke="url(#circleGradient)" 
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Vnitřní kruh */}
        <circle 
          cx="100" 
          cy="100" 
          r="35" 
          fill="none" 
          stroke="url(#circleGradient)" 
          strokeWidth="1.5"
          opacity="0.8"
        />
        
        {/* Síť propojení - radiální čáry */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const innerX = 100 + 35 * Math.cos(angle);
          const innerY = 100 + 35 * Math.sin(angle);
          const outerX = 100 + 85 * Math.cos(angle);
          const outerY = 100 + 85 * Math.sin(angle);
          
          return (
            <line
              key={`radial-${i}`}
              x1={innerX}
              y1={innerY}
              x2={outerX}
              y2={outerY}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}
        
        {/* Síť propojení - tangenciální čáry */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle1 = (i * 30 * Math.PI) / 180;
          const angle2 = ((i + 2) * 30 * Math.PI) / 180;
          const x1 = 100 + 70 * Math.cos(angle1);
          const y1 = 100 + 70 * Math.sin(angle1);
          const x2 = 100 + 70 * Math.cos(angle2);
          const y2 = 100 + 70 * Math.sin(angle2);
          
          return (
            <line
              key={`tangent-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#lineGradient)"
              strokeWidth="0.8"
              opacity="0.4"
            />
          );
        })}
        
        {/* Uzly na vnějším kruhu */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const x = 100 + 85 * Math.cos(angle);
          const y = 100 + 85 * Math.sin(angle);
          const size = i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 3;
          
          return (
            <circle
              key={`outer-node-${i}`}
              cx={x}
              cy={y}
              r={size}
              fill="url(#nodeGradient)"
              opacity="0.9"
            />
          );
        })}
        
        {/* Uzly na vnitřním kruhu */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x = 100 + 35 * Math.cos(angle);
          const y = 100 + 35 * Math.sin(angle);
          
          return (
            <circle
              key={`inner-node-${i}`}
              cx={x}
              cy={y}
              r="3"
              fill="url(#nodeGradient)"
              opacity="0.8"
            />
          );
        })}
        
        {/* Střední uzel */}
        <circle
          cx="100"
          cy="100"
          r="4"
          fill="url(#nodeGradient)"
          opacity="1"
        />
      </svg>
      
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