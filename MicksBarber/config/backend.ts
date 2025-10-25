// Backend Configuration
// Easy way to switch between different backend URLs

export const BACKEND_CONFIG = {
  // Primary hosted backend (HTTPS)
  PRIMARY: 'https://micksbarber.ccshub.uk',
  
  // Fallback hosted backend (HTTP)
  FALLBACK: 'http://109.123.227.37:3000',
  
  // Local development
  LOCAL: 'http://localhost:3000',
  
  // Current active backend
  ACTIVE: 'PRIMARY' as 'PRIMARY' | 'FALLBACK' | 'LOCAL'
};

// Get the current backend URL
export function getBackendUrl(): string {
  const baseUrl = BACKEND_CONFIG[BACKEND_CONFIG.ACTIVE];
  return `${baseUrl}/api`;
}

// Get the base URL for image serving
export function getBaseUrl(): string {
  return BACKEND_CONFIG[BACKEND_CONFIG.ACTIVE];
}
