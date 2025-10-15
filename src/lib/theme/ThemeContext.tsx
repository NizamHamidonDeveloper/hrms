'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

const THEME_STORAGE_KEY = 'theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeState(stored);
      }
    }
  }, []);

  // Save theme to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  // System theme detection
  useEffect(() => {
    if (theme === 'system') {
      const updateSystemTheme = () => {
        setResolvedTheme(getSystemTheme());
      };
      updateSystemTheme();
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateSystemTheme);
      return () => {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateSystemTheme);
      };
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  // Set theme class on <html> element
  useEffect(() => {
    console.log('[ThemeProvider] theme:', theme, 'resolvedTheme:', resolvedTheme);
    const root = window.document.documentElement;
    if ((theme === 'dark') || (theme === 'system' && resolvedTheme === 'dark')) {
      root.classList.add('dark');
      console.log('[ThemeProvider] Added dark class to <html>');
    } else {
      root.classList.remove('dark');
      console.log('[ThemeProvider] Removed dark class from <html>');
    }
  }, [theme, resolvedTheme]);

  // setTheme wrapper to update state and persist
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // localStorage is updated by useEffect
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
}; 