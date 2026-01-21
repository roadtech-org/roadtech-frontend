import apiClient from './client';
import type { CreateServiceRequestForm, ServiceRequest } from '../types';

export const serviceRequestApi = {
  create: async (data: CreateServiceRequestForm): Promise<ServiceRequest> => {
    const response = await apiClient.post<ServiceRequest>('/service-requests', data);
    return response.data;
  },

  getById: async (id: number): Promise<ServiceRequest> => {
    const response = await apiClient.get<ServiceRequest>(`/service-requests/${id}`);
    return response.data;
  },

  getUserRequests: async (): Promise<ServiceRequest[]> => {
    const response = await apiClient.get<ServiceRequest[]>('/service-requests');
    return response.data;
  },

  cancel: async (id: number): Promise<ServiceRequest> => {
    const response = await apiClient.put<ServiceRequest>(`/service-requests/${id}/cancel`);
    return response.data;
  },

  getActiveRequest: async (): Promise<ServiceRequest | null> => {
    const response = await apiClient.get<ServiceRequest | null>('/service-requests/active');
    return response.data;
  },
};

export default serviceRequestApi;
