import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const SERVER_URL = import.meta.env.VITE_API_URL || 'https://one00mexicanos-back.onrender.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchProfile(token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async (t) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setToken(null);
      }
    } catch (err) {
      console.error(err);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const loginContext = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const logoutContext = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, loginContext, logoutContext, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
