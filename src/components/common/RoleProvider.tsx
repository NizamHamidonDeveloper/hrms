"use client";

import React, { createContext, useState, useEffect } from 'react';

export const RoleContext = createContext<{
  activeRole: number | null;
  setActiveRole: (role: number) => void;
}>({ activeRole: null, setActiveRole: () => {} });

interface RoleProviderProps {
  children: React.ReactNode;
  initialRole?: number | null;
}

export function RoleProvider({ children, initialRole }: RoleProviderProps) {
  const [activeRole, setActiveRole] = useState<number | null>(typeof initialRole === 'number' ? initialRole : null);

  // Persist role in localStorage
  useEffect(() => {
    if (typeof activeRole === 'number') {
      localStorage.setItem('hrms-active-role', String(activeRole));
    }
  }, [activeRole]);

  useEffect(() => {
    const stored = localStorage.getItem('hrms-active-role');
    if (stored && !isNaN(Number(stored))) setActiveRole(Number(stored));
  }, []);

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
} 