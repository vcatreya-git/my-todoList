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
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--card-bg', theme.colors.cardBg);
  root.style.setProperty('--card-hover', theme.colors.cardHover);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--accent-hover', theme.colors.accentHover);
  root.style.setProperty('--danger', theme.colors.danger);
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--muted', theme.colors.muted);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('dark');
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
