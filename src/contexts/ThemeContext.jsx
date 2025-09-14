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
  // Get saved theme or default to 'light' (current design)
  const [theme, setTheme] = useState(() => {
    return sessionManager.getTheme() || 'light';
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    sessionManager.saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};