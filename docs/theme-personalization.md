# Theme Personalization Implementation Guide

## Overview
This document outlines the step-by-step implementation of theme personalization in the HRMS application, allowing users to switch between light and dark themes, with system theme detection and persistence.

## Implementation Checklist

### Phase 1: Infrastructure Setup

#### 1. Theme Context and Provider
- [x] Create `src/lib/theme/ThemeContext.tsx` (Created with basic context and provider structure)
  ```typescript
  // Basic structure
  type Theme = 'light' | 'dark' | 'system'
  interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
  }
  ```
- [x] Create `src/lib/theme/useTheme.ts` hook (Custom hook created for accessing and updating the theme)
- [x] Add theme state management (ThemeProvider now sets the theme class on the <html> element)
- [x] Implement system theme detection (ThemeProvider now detects and responds to system theme changes)
- [x] Add theme persistence logic (Theme is now saved to and loaded from localStorage)

#### 2. Tailwind Configuration
- [x] Update `tailwind.config.ts` for dark mode (Class-based dark mode and semantic color variables are now enabled)
  ```javascript
  module.exports = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          // Theme-aware colors
          'theme-primary': 'var(--color-primary)',
          'theme-secondary': 'var(--color-secondary)',
          'theme-background': 'var(--color-background)',
          'theme-text': 'var(--color-text)',
        }
      }
    }
  }
  ```
- [x] Define semantic color variables (CSS custom properties for both themes are now set in globals.css)
- [x] Create dark theme palette (CSS custom properties for both themes are now set in globals.css)
- [x] Test configuration (Settings page now includes a theme test area using theme-aware colors and buttons)

### Phase 2: Component Implementation

#### 3. Theme Toggle Component
- [x] Create `src/components/common/ThemeToggle.tsx` (Component provides accessible buttons for light, dark, and system themes)
  ```typescript
  const ThemeToggle = () => {
    const { theme, setTheme } = useTheme()
    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {/* Toggle UI */}
      </button>
    )
  }
  ```
- [x] Add toggle button styles (Manager settings now uses explicit Light/Dark buttons with icons, matching employee design)
- [x] Implement smooth transitions (Tailwind transitions and focus states applied)
- [x] Add keyboard accessibility (Buttons are accessible and focusable)
- [x] Add aria labels and roles (Icons and buttons are accessible)

#### 4. CSS Variables Setup
- [x] Update `src/app/globals.css`
  ```css
  :root {
    /* Light theme variables */
    --color-primary: #089e8e;
    --color-secondary: #64748b;
    --color-background: #ffffff;
    --color-text: #334155;
    --theme-transition: background-color 0.3s, color 0.3s, border-color 0.3s;
  }
  .dark {
    /* Dark theme variables */
    --color-primary: #0fbfac;
    --color-secondary: #94a3b8;
    --color-background: #1e293b;
    --color-text: #f1f5f9;
  }
  body, html {
    transition: var(--theme-transition);
  }
  ```
- [x] Define light theme colors
- [x] Define dark theme colors
- [x] Add transition properties
- [ ] Test color contrast
> Color contrast reviewed and robust for both themes. Full accessibility testing will be done in a later checklist item.

#### 5. Layout Integration
- [x] Update `src/app/layout.tsx`
- [x] Add ThemeProvider wrapper
- [ ] Add theme toggle to header
- [ ] Test provider ordering
- [ ] Verify SSR compatibility
> ThemeProvider is globally integrated in layout.tsx. Theme toggle is currently only present in settings pages, not in the global header.

### Phase 3: Component Updates

#### 6. Update Existing Components
- [x] Manager Leave Approvals page updated for robust theme support (serves as a future example)
- [x] Manager Team page updated for robust theme support (follows same best practices)
- [x] Manager Team Approvals page updated for robust theme support (follows same best practices)
- [x] Manager Performance page updated for robust theme support
- [x] Manager Reports page updated for robust theme support
- [x] Manager Settings page updated for robust theme support
- [x] Manager Dashboard page updated for robust theme support
- [ ] Update Button components
  ```typescript
  // Example button update
  const Button = ({ children, ...props }) => (
    <button 
      className="bg-theme-primary text-white dark:bg-theme-primary-dark"
      {...props}
    >
      {children}
    </button>
  )
  ```
- [ ] Update Card components
- [ ] Update Table components
- [ ] Update Form components
- [ ] Update Modal components
- [ ] Update Navigation components

> **Note:** All major manager pages (dashboard, reports, settings, team, team approvals, performance, leave approvals) have been updated for robust theme support. Shared and employee pages are not yet complete.

#### 7. Theme Persistence
- [x] Implement localStorage saving
  ```typescript
  const saveTheme = (theme: Theme) => {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  }
  ```
- [x] Add system theme detection
- [x] Handle theme change events
- [ ] Test persistence across sessions
> Theme persistence, system theme detection, and change event handling are implemented in ThemeProvider and verified in code. Manual/QA testing of persistence is still pending.

### Phase 4: Testing and Validation

#### 8. Functionality Testing
- [ ] Test theme toggle
- [ ] Verify system theme detection
- [ ] Check persistence
- [ ] Test SSR behavior
- [ ] Verify no flash of wrong theme

#### 9. Accessibility Testing
- [ ] Verify color contrast (WCAG 2.1)
- [ ] Test keyboard navigation
- [ ] Verify screen reader support
- [ ] Check focus indicators
- [ ] Test with reduced motion

#### 10. Performance Testing
- [ ] Check bundle size impact
- [ ] Measure paint times
- [ ] Test transition smoothness
- [ ] Verify no layout shifts
- [ ] Profile memory usage

### Phase 5: Documentation and Polish

#### 11. Documentation
- [ ] Update README.md
- [ ] Add theme customization guide
- [ ] Document color system
- [ ] Add accessibility notes
- [ ] Include performance considerations

#### 12. Final Polish
- [ ] Add loading states
- [ ] Refine transitions
- [ ] Add theme icons
- [ ] Test edge cases
- [ ] Final QA review

## Success Criteria
- [ ] Theme toggle functions correctly
- [ ] Theme persists across sessions
- [ ] System theme is detected and applied
- [ ] All components support both themes
- [ ] Smooth transitions between themes
- [ ] Proper color contrast in both themes
- [ ] Keyboard accessible theme toggle
- [ ] No UI flicker on theme change
- [ ] SSR works correctly
- [ ] Documentation is complete

## Testing Scenarios

### Functionality
1. Toggle between themes manually
2. Check system theme detection
3. Verify theme persistence after refresh
4. Test SSR initial load
5. Verify all components in both themes

### Accessibility
1. Navigate using keyboard only
2. Test with screen readers
3. Verify color contrast
4. Check focus indicators
5. Test with animations disabled

### Performance
1. Measure initial load time
2. Check theme switch performance
3. Verify no layout shifts
4. Test memory usage
5. Profile bundle size

## Notes
- All color values are examples and should be adjusted to match design system
- Test in multiple browsers and devices
- Consider adding theme preview in settings
- Plan for future custom theme support
- Document any known limitations

## Resources
- [Tailwind Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Next.js Dark Mode Example](https://github.com/vercel/next.js/tree/canary/examples/dark-mode) 