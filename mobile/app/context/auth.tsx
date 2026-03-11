import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiService, LoginRequest, ApiError, RegisterRequest } from '../utils/api';
import { useRouter } from 'expo-router';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  profile_image: string;
  created_at: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  loginLoading: boolean;
  loginError: string | null;
  registerLoading: boolean;
  registerError: string | null;
  user: UserInfo | null;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userInfo: UserInfo) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userInfo');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
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

      const userInfo: UserInfo = {
        id: response.id,
        name: response.name,
        email: response.email,
        profile_image: response.profile_image || '',
        created_at: response.created_at,
      };
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      setUser(userInfo);

      setIsLoggedIn(true);
      await AsyncStorage.setItem('refreshToken', response.refresh_token);
      return { success: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.error : 'Login failed';
      setLoginError(message);
      return { success: false, error: message };
    } finally {
      setLoginLoading(false);
    }
  };

  const register = async (credentials: RegisterRequest) => {
    setRegisterLoading(true);
    setRegisterError(null);

    try {
      const response = await apiService.register(credentials);
      // Optional: Auto-login after register? For now just return success
      return { success: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.error : 'Register failed';
      setRegisterError(message);
      return { success: false, error: message };
    } finally {
      setRegisterLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await apiService.googleLogin(idToken);
      await AsyncStorage.setItem('userToken', response.token);

      const userInfo: UserInfo = {
        id: response.id,
        name: response.name,
        email: response.email,
        profile_image: response.profile_image || '',
        created_at: response.created_at,
      };
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      setUser(userInfo);

      setIsLoggedIn(true);
      await AsyncStorage.setItem('refreshToken', response.refresh_token);
      return { success: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.error : 'Google login failed';
      setLoginError(message);
      return { success: false, error: message };
    } finally {
      setLoginLoading(false);
    }
  };

  const updateUser = async (userInfo: UserInfo) => {
    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        loginLoading,
        loginError,
        registerLoading,
        registerError,
        user,
        login,
        googleLogin,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};