import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(true);

  // Validate and sync authenticated profile on mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = authService.getStoredToken();
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (isMounted && res?.data?.user) {
            setUser(res.data.user);
            setToken(storedToken);
          }
        } catch (error) {
          console.warn('[Session Verification] Invalid or expired token. Clearing session.');
          if (isMounted) {
            authService.logout();
            setUser(null);
            setToken(null);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { user: loggedInUser, token: authToken } = res.data || {};
    setUser(loggedInUser);
    setToken(authToken);
    return res;
  };

  const register = async (registrationData) => {
    const res = await authService.register(registrationData);
    const { user: registeredUser, token: authToken } = res.data || {};
    setUser(registeredUser);
    setToken(authToken);
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
