import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Tenta recuperar o tema do localStorage, se não, usa 'dark' como padrão.
    const savedTheme = localStorage.getItem('nexus_theme') as Theme;
    return savedTheme || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme, toggleTheme };
}
