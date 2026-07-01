import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ✅ FIXED: Accept object instead of separate parameters
  const login = async (credentials) => {
    try {
      console.log('🔐 Login data being sent:', credentials);
      
      const { data } = await authAPI.login(credentials);
      
      console.log('✅ Login response:', data);
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('❌ Login error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // ✅ FIXED: Accept object instead of separate parameters
  const signup = async (userData) => {
    try {
      console.log('📝 Signup data being sent:', userData);
      
      const { data } = await authAPI.signup(userData);
      
      console.log('✅ Signup response:', data);
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      console.error('❌ Signup error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Updates the locally cached user (e.g. after a profile edit) without re-login
  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
