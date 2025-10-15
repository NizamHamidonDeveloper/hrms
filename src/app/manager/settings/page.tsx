'use client';
import React from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '@/lib/theme/useTheme';

export default function ManagerSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen bg-white dark:bg-gray-900" role="main" aria-labelledby="page-title">
      <h1 id="page-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Settings (Manager)</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Manage your preferences and account settings below.</p>
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Theme</h2>
        <div className="flex items-center gap-4">
          <label className="text-gray-700 dark:text-gray-200 font-medium">Choose theme:</label>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`px-4 py-2 rounded-full border ${theme === 'light' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'} border-gray-200 hover:bg-teal-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 transition`}
          >
            <FiSun className="inline mr-1" /> Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 rounded-full border ${theme === 'dark' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'} border-gray-200 hover:bg-teal-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 transition`}
          >
            <FiMoon className="inline mr-1" /> Dark
          </button>
        </div>
      </section>

      {/* Other settings sections would go here */}
    </main>
  );
} 