// src/types/admin.ts
// Create this file for admin-specific types

export interface DashboardStats {
  totalUsers: number;
  totalMechanics: number;
  totalPartsProviders: number;
  totalRequests: number;
  pendingRequests: number;
  activeRequests: number;
  completedToday?: number;
  availableMechanics?: number;
  totalLogs?: number;
  errorLogs?: number;
}

export interface UserManagement {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export interface MechanicVerification {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  specializations: string[];
  isVerified: boolean;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface PartsProviderVerification {
  id: number;
  userId: number;
  email: string;
  shopName: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
  createdAt: string;
  user?: {
    email: string;
    phone: string;
  };
}

export interface SystemLogEntry {
  id: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  action: string;
  userId?: number;
  userEmail?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
  user?: {
    fullName: string;
    email: string;
  };
}

export interface ServiceRequestManagement {
  id: number;
  userId: number;
  userEmail: string;
  mechanicId?: number;
  mechanicEmail?: string;
  issueType: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}