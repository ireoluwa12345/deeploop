import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { apiService, LoginRequest, ApiError } from '../utils/api';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await apiService.login(credentials);
      await AsyncStorage.setItem('userToken', response.token);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login failed';
      setLoginError(message);
      return { success: false, error: message };
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    isLoggedIn,
    loading,
    loginLoading,
    loginError,
    login,
    logout
  };
};