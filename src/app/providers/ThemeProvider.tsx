'use client';

// ThemeProvider - simplified as dark mode has been removed from the application

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark mode functionality has been removed
  // This provider is kept for backwards compatibility
  return <>{children}</>;
}

export function useTheme() {
  // Dark mode functionality has been removed
  // This hook is kept for backwards compatibility
  return {
    theme: 'light',
    toggleTheme: () => {},
    setTheme: () => {},
  };
}
