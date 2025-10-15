import React from 'react';
import { useTheme } from '@/lib/theme/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 items-center" role="group" aria-label="Theme toggle">
      <button
        className={`px-3 py-2 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-theme-primary transition ${theme === 'light' ? 'bg-theme-primary text-white' : 'bg-gray-100 text-theme-primary dark:bg-gray-800 dark:text-theme-primary'}`}
        aria-label="Switch to light theme"
        onClick={() => setTheme('light')}
        type="button"
      >
        <span aria-hidden="true">🌞</span>
      </button>
      <button
        className={`px-3 py-2 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-theme-primary transition ${theme === 'dark' ? 'bg-theme-primary text-white' : 'bg-gray-100 text-theme-primary dark:bg-gray-800 dark:text-theme-primary'}`}
        aria-label="Switch to dark theme"
        onClick={() => setTheme('dark')}
        type="button"
      >
        <span aria-hidden="true">🌚</span>
      </button>
      <button
        className={`px-3 py-2 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-theme-primary transition ${theme === 'system' ? 'bg-theme-primary text-white' : 'bg-gray-100 text-theme-primary dark:bg-gray-800 dark:text-theme-primary'}`}
        aria-label="Switch to system theme"
        onClick={() => setTheme('system')}
        type="button"
      >
        <span aria-hidden="true">💻</span>
      </button>
    </div>
  );
};

export default ThemeToggle; 