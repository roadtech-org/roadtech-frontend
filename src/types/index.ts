// src/types/index.ts - Complete type definitions

// User types
export type UserRole = 'USER' | 'MECHANIC' | 'PARTS_PROVIDER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export interface MechanicProfile {
  id: number;
  userId: number;
  specializations: string[];
  isAvailable: boolean;
  isVerified: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  rating: number;
  totalJobs: number;
  locationUpdatedAt: string | null;
}

export interface MechanicWithProfile extends User {
  profile?: MechanicProfile;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  rating?: number;
  totalJobs?: number;
}

// Parts Provider types
export interface PartsProvider {
  id: number;
  userId: number;
  shopName: string;
  address: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
  isOpen: boolean;
  rating: number;
  totalOrders: number;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Part {
  id: number;
  providerId: number;
  name: string;
  category: PartCategory;
  brand: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  provider?: PartsProvider;
  shopName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PartCategory =
  | 'TIRES'
  | 'BATTERIES'
  | 'ENGINE_PARTS'
  | 'BRAKE_PARTS'
  | 'FILTERS'
  | 'FLUIDS'
  | 'ELECTRICAL'
  | 'OTHER';

// Service Request types
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type IssueType =
  | 'FLAT_TIRE'
  | 'ENGINE_FAILURE'
  | 'BATTERY_DEAD'
  | 'OUT_OF_FUEL'
  | 'LOCKED_OUT'
  | 'ACCIDENT'
  | 'OTHER';

export interface ServiceRequest {
  location: any;
  customerName: any;
  serviceType: any;
  vehicleNumber: any;
  id: number;
  userId: number;
  mechanicId: number | null;
  issueType: IssueType;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  status: RequestStatus;
  estimatedArrival: string | null;
  createdAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt?: string;
  user?: User;
  mechanic?: MechanicWithProfile;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  specializations?: string[];
  shopName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp?: string;
}

// Admin types
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
  role: UserRole;
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
  issueType: IssueType;
  description?: string;
  latitude: number;
  longitude: number;
  status: RequestStatus;
  createdAt: string;
  completedAt?: string;
}

export interface VerificationRequest {
  id: number;
  userId: number;
  type: 'MECHANIC' | 'PARTS_PROVIDER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents?: string[];
  notes?: string;
  createdAt: string;
  user?: User;
}

export interface SystemLog {
  id: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  action: string;
  userId?: number;
  details: string;
  timestamp: string;
  ipAddress?: string;
  user?: User;
}

// API Response types
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// WebSocket message types
export interface WebSocketMessage<T = unknown> {
  type: 'LOCATION_UPDATE' | 'STATUS_UPDATE' | 'NEW_REQUEST' | 'REQUEST_CANCELLED';
  payload: T;
  timestamp: string | number;
}

export interface LocationUpdatePayload {
  requestId: number;
  mechanicId: number;
  latitude: number;
  longitude: number;
}

export interface StatusUpdatePayload {
  requestId: number;
  status: RequestStatus;
  estimatedArrival?: string;
}

// Form types
export interface CreateServiceRequestForm {
  issueType: IssueType;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface UpdateMechanicProfileForm {
  specializations: string[];
  isAvailable: boolean;
}

export interface CreatePartForm {
  name: string;
  category: PartCategory;
  brand: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdatePartForm {
  name?: string;
  category?: PartCategory;
  brand?: string;
  price?: number;
  stock?: number;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}