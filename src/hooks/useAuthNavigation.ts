import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to prevent blank screens on back button navigation
 * Use this in Login and Register components
 */
export function usePreventBackButtonBlank(isAuthenticated: boolean, redirectPath: string) {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      // Small delay ensures state is fully updated
      const timeoutId = setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, redirectPath, navigate]);
}

/**
 * Hook to handle page visibility changes (especially for mobile browsers)
 * This ensures auth state is rechecked when page becomes visible again
 */
export function usePageVisibilityAuth(refreshUser: () => Promise<void>) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, refresh auth state
        refreshUser().catch(() => {
          // Ignore errors, user will be logged out if token is invalid
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshUser]);
}