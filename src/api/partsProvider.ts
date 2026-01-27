import apiClient from './client';
import type { PartsProvider, Part, CreatePartForm, UpdatePartForm } from '../types';

export const partsProviderApi = {
  getProfile: async (): Promise<PartsProvider> => {
    const response = await apiClient.get<PartsProvider>('/parts-provider/profile');
    return response.data;
  },

  toggleStatus: async (isOpen: boolean): Promise<PartsProvider> => {
    const response = await apiClient.put<PartsProvider>('/parts-provider/status', { isOpen });
    return response.data;
  },

  getMyParts: async (): Promise<Part[]> => {
    const response = await apiClient.get<Part[]>('/parts-provider/parts');
    return response.data;
  },

  addPart: async (data: CreatePartForm): Promise<Part> => {
    const response = await apiClient.post<Part>('/parts-provider/parts', data);
    return response.data;
  },

  updatePart: async (id: number, data: UpdatePartForm): Promise<Part> => {
    const response = await apiClient.put<Part>(`/parts-provider/parts/${id}`, data);
    return response.data;
  },

  deletePart: async (id: number): Promise<void> => {
    await apiClient.delete(`/parts-provider/parts/${id}`);
  },

  searchNearbyParts: async (
    category: string | null,
    search: string | null,
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<Part[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    params.append('latitude', latitude.toString());
    params.append('longitude', longitude.toString());
    params.append('radiusKm', radiusKm.toString());

    const response = await apiClient.get<Part[]>(`/parts/search?${params}`);
    return response.data;
  },

  getNearbyProviders: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<PartsProvider[]> => {
    const response = await apiClient.get<PartsProvider[]>(
      `/parts/providers/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`
    );
    return response.data;
  },
};