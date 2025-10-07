import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface UseAuthOptions {
  baseUrl?: string;
  onAuthStateChanged?: (user: User | null) => void;
  storageKey?: string;
}

export interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Hook for authentication and user management
 */
export const useAuth = (options: UseAuthOptions = {}): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);
  
  const baseUrl = options.baseUrl || '/api/auth';
  const storageKey = options.storageKey || 'auth_token';
  
  const getToken = useCallback((): string | null => {
    return localStorage.getItem(storageKey);
  }, [storageKey]);
  
  const setToken = useCallback((token: string | null): void => {
    if (token) {
      localStorage.setItem(storageKey, token);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);
  
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const token = getToken();
    
    if (!token) {
      return null;
    }
    
    try {
      const response = await fetch(`${baseUrl}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Token might be invalid or expired
        setToken(null);
        return null;
      }
      
      const userData = await response.json();
      return userData;
    } catch (err) {
      setToken(null);
      return null;
    }
  }, [baseUrl, getToken, setToken]);
  
  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          message: data.message || 'Login failed',
          code: data.code,
        };
      }
      
      setToken(data.token);
      
      const userData = await fetchCurrentUser();
      setUser(userData);
      
      if (options.onAuthStateChanged) {
        options.onAuthStateChanged(userData);
      }
      
      return userData;
    } catch (err) {
      const errorObj: AuthError = {
        message: err.message || 'An error occurred during login',
        code: err.code,
      };
      
      setError(errorObj);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, fetchCurrentUser, setToken, options.onAuthStateChanged]);
  
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const token = getToken();
      
      if (token) {
        await fetch(`${baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      // Ignore errors during logout
    } finally {
      setToken(null);
      setUser(null);
      
      if (options.onAuthStateChanged) {
        options.onAuthStateChanged(null);
      }
      
      setIsLoading(false);
    }
  }, [baseUrl, getToken, setToken, options.onAuthStateChanged]);
  
  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        const userData = await fetchCurrentUser();
        
        if (isMounted) {
          setUser(userData);
          
          if (options.onAuthStateChanged) {
            options.onAuthStateChanged(userData);
          }
        }
      } catch (err) {
        // Ignore errors during initialization
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser, options.onAuthStateChanged]);
  
  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
};

export default useAuth;
