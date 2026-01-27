export { 
  default as apiClient, 
  getAccessToken, 
  getRefreshToken, 
  setTokens, 
  clearTokens 
} from './client';

export { authApi } from './auth';
export { serviceRequestApi } from './serviceRequest';
export { mechanicApi } from './mechanic';
export { partsProviderApi } from './partsProvider';
export { partsApi } from './parts';
export { adminApi } from './admin';

export { default } from './client';