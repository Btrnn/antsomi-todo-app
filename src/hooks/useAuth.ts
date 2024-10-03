// Libraries
import { useEffect, useState } from 'react';

// Services
import { checkAuthority } from 'services/authentication';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // Handlers function check authenticated in here

  const checkAuthentication = async () => {
    try {
      const isChecked = await checkAuthority();

      if (isChecked.data) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  return { isAuthenticated, loading };
};
