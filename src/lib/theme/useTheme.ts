import { useContext } from 'react';
import { ThemeContextType } from './ThemeContext';
import { useThemeContext } from './ThemeContext';
 
export const useTheme = (): ThemeContextType => {
  return useThemeContext();
}; 