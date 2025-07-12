import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = (userToken) => {
    if (userToken) {
      localStorage.setItem('token', userToken);
      setTokenState(userToken);
    } else {
      localStorage.removeItem('token');
      setTokenState('');
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setTokenState('');
    setUser(null);
  };

  useEffect(() => {
    // Check if token exists and is valid
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setTokenState(storedToken);
      // You could add token validation here
    }
    setLoading(false);
  }, []);

  const value = {
    token,
    user,
    setToken,
    setUser,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
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
