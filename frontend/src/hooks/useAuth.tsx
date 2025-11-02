import { useEffect, useState } from 'react';
import { AUTH_EVENT, AUTH_STORAGE_KEY } from '@/services/auth';

const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse stored auth user', error);
    return null;
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<any>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);

    const handleAuthChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setUser(detail ?? null);
    };

    window.addEventListener(AUTH_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_EVENT, handleAuthChange);
    };
  }, []);

  return { user, isLoading };
};
