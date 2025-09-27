// 🎯 Centralized Responsive System for Omnia
// 3-tier breakpoints: mobile ≤768px, tablet 769-1200px, desktop >1200px

import { useState, useEffect } from 'react';

// Breakpoint constants
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1200,
  desktop: 1201
};

// Device type detection
export const getDeviceType = (width = window.innerWidth) => {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

// Main responsive hook
export const useResponsive = () => {
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setDeviceType(getDeviceType(width));
    };

    // Debounce resize events for performance
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    deviceType,
    screenWidth,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isTabletOrDesktop: deviceType !== 'mobile',
    isMobileOrTablet: deviceType !== 'desktop'
  };
};

// Static helper functions (for non-hook usage)
export const checkIsMobile = () => window.innerWidth <= BREAKPOINTS.mobile;
export const checkIsTablet = () => window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.tablet;
export const checkIsDesktop = () => window.innerWidth > BREAKPOINTS.tablet;

// Responsive style helpers
export const responsiveStyle = {
  // Padding helpers
  padding: (mobile, tablet, desktop) => {
    const width = window.innerWidth;
    if (width <= BREAKPOINTS.mobile) return mobile;
    if (width <= BREAKPOINTS.tablet) return tablet;
    return desktop;
  },

  // Font size helpers
  fontSize: (mobile, tablet, desktop) => {
    const width = window.innerWidth;
    if (width <= BREAKPOINTS.mobile) return mobile;
    if (width <= BREAKPOINTS.tablet) return tablet;
    return desktop;
  },

  // General value helper
  value: (mobile, tablet, desktop) => {
    const width = window.innerWidth;
    if (width <= BREAKPOINTS.mobile) return mobile;
    if (width <= BREAKPOINTS.tablet) return tablet;
    return desktop;
  }
};

export default useResponsive;