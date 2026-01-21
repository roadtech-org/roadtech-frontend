import apiClient from './client';
import type { Location, MechanicProfile, ServiceRequest, UpdateMechanicProfileForm } from '../types';

export const mechanicApi = {
  getProfile: async (): Promise<MechanicProfile> => {
    const response = await apiClient.get<MechanicProfile>('/mechanic/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateMechanicProfileForm): Promise<MechanicProfile> => {
    const response = await apiClient.put<MechanicProfile>('/mechanic/profile', data);
    return response.data;
  },

  toggleAvailability: async (isAvailable: boolean): Promise<MechanicProfile> => {
    const response = await apiClient.put<MechanicProfile>('/mechanic/availability', {
      isAvailable,
    });
    return response.data;
  },

   // Get active requests (assigned + in-progress)
  getActiveRequests: async (): Promise<ServiceRequest[]> => {
    const response = await apiClient.get<ServiceRequest[]>('/mechanic/requests/active');
    return response.data;
  },
  
  updateLocation: async (location: Location): Promise<void> => {
    await apiClient.put('/mechanic/location', location);
  },

  getAssignedRequests: async (): Promise<ServiceRequest[]> => {
    const response = await apiClient.get<ServiceRequest[]>('/mechanic/requests');
    return response.data;
  },

  getPendingRequests: async (): Promise<ServiceRequest[]> => {
    const response = await apiClient.get<ServiceRequest[]>('/mechanic/requests/pending');
    return response.data;
  },

  acceptRequest: async (requestId: number): Promise<ServiceRequest> => {
    const response = await apiClient.put<ServiceRequest>(
      `/mechanic/requests/${requestId}/accept`
    );
    return response.data;
  },

  rejectRequest: async (requestId: number): Promise<ServiceRequest> => {
    const response = await apiClient.put<ServiceRequest>(
      `/mechanic/requests/${requestId}/reject`
    );
    return response.data;
  },

  startService: async (requestId: number): Promise<ServiceRequest> => {
    const response = await apiClient.put<ServiceRequest>(
      `/mechanic/requests/${requestId}/start`
    );
    return response.data;
  },

  completeService: async (requestId: number): Promise<ServiceRequest> => {
    const response = await apiClient.put<ServiceRequest>(
      `/mechanic/requests/${requestId}/complete`
    );
    return response.data;
  },
};

export default mechanicApi;
