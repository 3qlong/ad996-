import React, { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'auto') return getSystemTheme();
  return mode;
};

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'auto',
  setThemeMode: () => {},
  effectiveTheme: getSystemTheme(),
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(getSystemTheme());

  // 初始化从本地存储加载
  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as ThemeMode;
    if (stored) setThemeMode(stored);
  }, []);

  // 根据模式更新有效主题，auto 模式监听系统变化
  useEffect(() => {
    const update = () => setEffectiveTheme(getEffectiveTheme(themeMode));
    update();
    if (themeMode === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
  }, [themeMode]);

  // 同步 document class 和 localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, [effectiveTheme]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  return React.createElement(
    ThemeContext.Provider,
    { value: { themeMode, setThemeMode, effectiveTheme } },
    children
  );
};

export const useTheme = () => useContext(ThemeContext);
