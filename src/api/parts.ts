import { apiClient } from './client';

export interface Part {
  id: number;
  providerId: number;
  shopName: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface PartsProvider {
  id: number;
  shopName: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  rating?: number;
  openingTime?: string;
  closingTime?: string;
}

export const partsApi = {
  searchParts: async (params: {
    category?: string;
    search?: string;
    latitude: number;
    longitude: number;
    radiusKm?: number;
  }): Promise<Part[]> => {
    const response = await apiClient.get('/parts/search', { params });
    return response.data;
  },

  getNearbyProviders: async (params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
  }): Promise<PartsProvider[]> => {
    const response = await apiClient.get('/parts/providers/nearby', { params });
    return response.data;
  },
};