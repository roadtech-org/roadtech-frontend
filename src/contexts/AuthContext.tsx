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
    const response = await authApi.login(data);
    setTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
    
    toast.success(`Welcome back, ${response.user.fullName.split(' ')[0]}! 🎉`, {
      icon: '👋',
      duration: 3000,
    });
    // Don't catch errors - let them propagate to Login component
  };

  const register = async (data: RegisterRequest) => {
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
      icon: '✅',
      duration: 4000,
    });
    // Don't catch errors - let them propagate to Register component
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

  // Show loading screen while initializing authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading RoadTech...</p>
        </div>
      </div>
    );
  }

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