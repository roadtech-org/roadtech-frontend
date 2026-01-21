// User types
export type UserRole = 'USER' | 'MECHANIC' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface MechanicProfile {
  id: number;
  userId: number;
  specializations: string[];
  isAvailable: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  rating: number;
  totalJobs: number;
  locationUpdatedAt: string | null;
}

export interface MechanicWithProfile extends User {
  profile: MechanicProfile;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  rating?: number;
  totalJobs?: number;
}

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
  timestamp: string;
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
  timestamp: string;
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
