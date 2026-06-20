import { useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { SET_THEME } from '../constants/actionTypes';

/**
 * Hook to synchronize theme (light/dark) state with document styles.
 * Ensures the theme works seamlessly with Tailwind CSS dark mode class-based styling.
 */
export function useThemeSync() {
  const { state, dispatch } = useContext(WorkspaceContext);
  const { theme } = state;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    dispatch({
      type: SET_THEME,
      payload: theme === 'light' ? 'dark' : 'light',
    });
  };

  return {
    theme,
    toggleTheme,
    isLight: theme === 'light',
  };
}
