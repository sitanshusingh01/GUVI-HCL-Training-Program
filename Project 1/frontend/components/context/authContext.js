import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    if (authState.token) {
      loadUser();
    } else {
      setAuthState({
        ...authState,
        loading: false,
      });
    }
    // eslint-disable-next-line
  }, []);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth', {
        headers: {
          'x-auth-token': authState.token,
        },
      });

      setAuthState({
        ...authState,
        isAuthenticated: true,
        user: res.data,
        loading: false,
      });
    } catch (err) {
      localStorage.removeItem('token');
      setAuthState({
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth', formData);
      localStorage.setItem('token', res.data.token);

      setAuthState({
        ...authState,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
      });

      await loadUser();
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
