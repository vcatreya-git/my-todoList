'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeId, THEMES } from '@/types';

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'todolist-theme';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark = theme.id === 'dark';

  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--background-secondary', isDark ? '#252525' : '#f7f6f3');
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--card-bg', theme.colors.cardBg);
  root.style.setProperty('--card-hover', theme.colors.cardHover);
  root.style.setProperty('--card-solid', theme.colors.cardBg);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--border-hover', isDark ? '#4a4a4a' : '#c7c7c5');
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--accent-hover', theme.colors.accentHover);
  root.style.setProperty('--danger', theme.colors.danger);
  root.style.setProperty('--danger-muted', isDark ? 'rgba(255, 107, 107, 0.12)' : 'rgba(224, 62, 62, 0.08)');
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--success-muted', isDark ? 'rgba(76, 195, 138, 0.12)' : 'rgba(15, 155, 88, 0.1)');
  root.style.setProperty('--muted', theme.colors.muted);
  root.style.setProperty('--track-empty', isDark ? '#373737' : '#e9e9e7');
  root.style.setProperty('--gradient-start', theme.colors.accent);
  root.style.setProperty('--gradient-end', theme.colors.accent);
  root.style.setProperty('--shadow-sm', isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(15,15,15,0.06)');
  root.style.setProperty('--shadow-md', isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(15,15,15,0.08)');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (stored && THEMES.some((t) => t.id === stored)) {
      setThemeId(stored);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      applyTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  }, [theme, themeId, isHydrated]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
