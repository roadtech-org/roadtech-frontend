const isDevelopment = import.meta.env.DEV;

export const BASE_API_URL = isDevelopment 
  ? '/api' 
  : import.meta.env.VITE_BASE_API_URL || 'https://roadtech-backend-production.up.railway.app/api';

console.log('Environment:', isDevelopment ? 'Development' : 'Production');
console.log('API URL:', BASE_API_URL);