import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth status
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return { user, isLoading };
};
