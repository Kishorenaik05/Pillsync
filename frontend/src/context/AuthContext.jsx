import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Pad the base64 string to a multiple of 4
        const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
        const jsonPayload = decodeURIComponent(window.atob(base64 + pad).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

        const payload = JSON.parse(jsonPayload);
        setUser({ email: payload.sub, role: payload.role });
      } catch (e) {
        console.error("Token decoding failed:", e);
        setToken(null);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    setToken(response.data.access_token);
    localStorage.setItem('token', response.data.access_token);
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
