// 🎨 Theme Context for Light/Dark mode management
import React, { createContext, useContext, useState, useEffect } from 'react';
import sessionManager from '../services/storage/sessionManager';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Helper function to detect system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // fallback
  };

  // Initialize theme with auto-detection for first-time users
  const [theme, setTheme] = useState(() => {
    const savedTheme = sessionManager.getTheme();

    // If no saved preference, auto-detect system theme
    if (!savedTheme) {
      const systemTheme = getSystemTheme();
      console.log('🎨 First launch detected, using system theme:', systemTheme);
      return systemTheme;
    }

    console.log('🎨 Using saved theme preference:', savedTheme);
    return savedTheme;
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    sessionManager.saveTheme(theme);
  }, [theme]);

  // Listen for system theme changes only if user hasn't set manual preference
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleSystemThemeChange = (e) => {
        const savedTheme = sessionManager.getTheme();
        // Only auto-update if no manual preference exists yet
        if (!savedTheme) {
          const newSystemTheme = e.matches ? 'dark' : 'light';
          console.log('🎨 System theme changed to:', newSystemTheme);
          setTheme(newSystemTheme);
        }
      };

      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🎨 User manually changed theme to:', newTheme);
    setTheme(newTheme);
    // Manual change will be saved via useEffect, marking user preference
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark',
    isAutoDetected: !sessionManager.getTheme(), // true if no manual preference saved
    systemTheme: getSystemTheme()
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};