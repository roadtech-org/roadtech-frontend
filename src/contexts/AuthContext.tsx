import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { authApi, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      
      // Success toast with personalized message
      toast.success(`Welcome back, ${response.user.fullName.split(' ')[0]}! 🎉`, {
        duration: 3000,
        icon: '👋',
      });
    } catch (error: any) {
      // Extract error message from response
      let message = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.status === 403) {
        message = 'Your account has been disabled. Please contact support.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message, {
        duration: 4000,
        icon: '⚠️',
      });
      
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      
      // Success toast based on role
      const roleMessage = data.role === 'MECHANIC' 
        ? 'Mechanic account created! Welcome to RoadTech! 🔧'
        : data.role === 'PARTS_PROVIDER'
        ? 'Parts Provider account created! Start adding your inventory! 📦'
        : 'Account created successfully! Welcome to RoadTech! 🚗';
      
      toast.success(roleMessage, {
        duration: 4000,
        icon: '✅',
      });
    } catch (error: any) {
      // Extract error message
      let message = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 400) {
        message = 'Email already registered or invalid data provided.';
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        message = Object.values(errors)[0] as string;
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message, {
        duration: 4000,
        icon: '❌',
      });
      
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout errors
      }
    }
    clearTokens();
    setUser(null);
    
    toast.success('Logged out successfully. See you soon! 👋', {
      duration: 2000,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}