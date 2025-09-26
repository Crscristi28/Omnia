// src/components/input/GlassInputContainer.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const GlassInputContainer = ({ children }) => {
  const { isDark } = useTheme();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      background: isDesktop ? 'transparent' : 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.8))',
      backdropFilter: 'blur(20px)',
      padding: isMobile ? '1.2rem' : '1.6rem',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1.2rem)' : '1.6rem',
      zIndex: 10,
      flexShrink: 0
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        display: 'flex', 
        gap: '0.8rem', 
        alignItems: 'center'
      }}>
        {children}
      </div>
    </div>
  );
};

export default GlassInputContainer;