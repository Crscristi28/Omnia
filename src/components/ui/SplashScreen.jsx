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
      
      {/* OMNIA 3D NETWORK LOGO - SVG s 3D efekty */}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ marginBottom: '30px' }}
      >
        <defs>
          {/* 3D gradient pro uzly */}
          <radialGradient id="node3D" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="20%" stopColor="#7dd3fc" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#0284c7" stopOpacity="1" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="1" />
          </radialGradient>
          
          {/* Gradient pro connection lines s perspektivou */}
          <linearGradient id="connection3D" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#0891b2" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#164e63" stopOpacity="0.2" />
          </linearGradient>
          
          {/* Glow efekt */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Stín pro depth */}
          <filter id="shadow">
            <feDropShadow dx="2" dy="3" stdDeviation="1" floodColor="#0c4a6e" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Pozadí kruhu s 3D efektem */}
        <circle 
          cx="100" 
          cy="100" 
          r="85" 
          fill="none" 
          stroke="url(#connection3D)" 
          strokeWidth="1"
          opacity="0.3"
        />
        
        {/* Komplexní síť spojení - více vrstev pro 3D efekt */}
        {/* Vrstva 1 - nejzadnější */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const radius1 = 75 + Math.sin(i * 0.5) * 10; // variabilní vzdálenost
          const radius2 = 45 + Math.cos(i * 0.3) * 8;
          const x1 = 100 + radius1 * Math.cos(angle);
          const y1 = 100 + radius1 * Math.sin(angle) * 0.8; // perspektiva
          const x2 = 100 + radius2 * Math.cos(angle + 1.2);
          const y2 = 100 + radius2 * Math.sin(angle + 1.2) * 0.9;
          
          return (
            <line
              key={`back-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#connection3D)"
              strokeWidth="1"
              opacity="0.2"
            />
          );
        })}
        
        {/* Vrstva 2 - střední */}
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i * 20 * Math.PI) / 180;
          const radius1 = 65 + Math.sin(i * 0.7) * 8;
          const radius2 = 35 + Math.cos(i * 0.4) * 6;
          const x1 = 100 + radius1 * Math.cos(angle);
          const y1 = 100 + radius1 * Math.sin(angle) * 0.85;
          const x2 = 100 + radius2 * Math.cos(angle + 0.8);
          const y2 = 100 + radius2 * Math.sin(angle + 0.8) * 0.95;
          
          return (
            <line
              key={`mid-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#connection3D)"
              strokeWidth="1.2"
              opacity="0.4"
              filter="url(#glow)"
            />
          );
        })}
        
        {/* Vrstva 3 - přední */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const radius1 = 55 + Math.sin(i * 0.9) * 6;
          const radius2 = 25 + Math.cos(i * 0.6) * 4;
          const x1 = 100 + radius1 * Math.cos(angle);
          const y1 = 100 + radius1 * Math.sin(angle) * 0.9;
          const x2 = 100 + radius2 * Math.cos(angle + 0.5);
          const y2 = 100 + radius2 * Math.sin(angle + 0.5);
          
          return (
            <line
              key={`front-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#connection3D)"
              strokeWidth="1.5"
              opacity="0.6"
              filter="url(#glow)"
            />
          );
        })}
        
        {/* 3D Uzly - zadní vrstva */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i * 18 * Math.PI) / 180;
          const radius = 70 + Math.sin(i * 0.4) * 12;
          const x = 100 + radius * Math.cos(angle);
          const y = 100 + radius * Math.sin(angle) * 0.8; // perspektiva
          const size = 2 + Math.sin(i * 0.8) * 1.5;
          
          return (
            <circle
              key={`back-node-${i}`}
              cx={x}
              cy={y}
              r={size}
              fill="url(#node3D)"
              opacity="0.4"
              filter="url(#shadow)"
            />
          );
        })}
        
        {/* 3D Uzly - střední vrstva */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const radius = 50 + Math.sin(i * 0.6) * 8;
          const x = 100 + radius * Math.cos(angle);
          const y = 100 + radius * Math.sin(angle) * 0.85;
          const size = 3 + Math.sin(i * 0.5) * 2;
          
          return (
            <circle
              key={`mid-node-${i}`}
              cx={x}
              cy={y}
              r={size}
              fill="url(#node3D)"
              opacity="0.7"
              filter="url(#glow)"
            />
          );
        })}
        
        {/* 3D Uzly - přední vrstva */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const radius = 30 + Math.sin(i * 0.8) * 5;
          const x = 100 + radius * Math.cos(angle);
          const y = 100 + radius * Math.sin(angle) * 0.9;
          const size = 4 + Math.sin(i * 0.3) * 2;
          
          return (
            <circle
              key={`front-node-${i}`}
              cx={x}
              cy={y}
              r={size}
              fill="url(#node3D)"
              opacity="0.9"
              filter="url(#glow)"
            />
          );
        })}
        
        {/* Centrální uzel s maximální 3D efekt */}
        <circle
          cx="100"
          cy="100"
          r="6"
          fill="url(#node3D)"
          opacity="1"
          filter="url(#glow)"
        />
        
        {/* Světelný efekt v centru */}
        <circle
          cx="100"
          cy="100"
          r="2"
          fill="#ffffff"
          opacity="0.8"
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