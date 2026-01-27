// src/api/admin.ts
import apiClient from './client';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // Mechanics
  getPendingMechanics: async () => {
    const response = await apiClient.get('/admin/mechanics/pending');
    return response.data;
  },

 verifyMechanic: async (id: number, reason: string) => {
  const response = await apiClient.put(
    `/admin/mechanics/${id}/verify`,
    { reason }
  );
  return response.data;
},

  rejectMechanic: async (id: number, reason: string) => {
    const response = await apiClient.put(`/admin/mechanics/${id}/reject`, { reason });
    return response.data;
  },

  // Parts Providers
  getPendingProviders: async () => {
    const response = await apiClient.get('/admin/parts-providers/pending');
    return response.data;
  },

  verifyProvider: async (id: number, reason: string) => {
    const response = await apiClient.put(`/admin/parts-providers/${id}/verify`, { reason });
    return response.data;
  },

  rejectProvider: async (id: number, reason: string) => {
    const response = await apiClient.put(`/admin/parts-providers/${id}/reject`, { reason });
    return response.data;
  },

  // Users
  getAllUsers: async (role?: string, search?: string, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const response = await apiClient.get(`/admin/users?${params}`);
    return response.data;
  },

  toggleUserActive: async (id: number) => {
    const response = await apiClient.put(`/admin/users/${id}/toggle-active`);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  // Logs
  getSystemLogs: async (
    level?: string,
    action?: string,
    userId?: number,
    page: number = 0,
    size: number = 20
  ) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (level) params.append('level', level);
    if (action) params.append('action', action);
    if (userId) params.append('userId', userId.toString());
    const response = await apiClient.get(`/admin/logs?${params}`);
    return response.data;
  },

  deleteLog: async (id: number) => {
    await apiClient.delete(`/admin/logs/${id}`);
  },

  clearOldLogs: async (daysOld: number = 30) => {
    const response = await apiClient.delete(`/admin/logs/clear?daysOld=${daysOld}`);
    return response.data;
  },
};