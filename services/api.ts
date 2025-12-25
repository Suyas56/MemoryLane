

// Use Vite's environment variable directly
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API_URL configured as:', API_URL);

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include' as RequestCredentials, // Essential for cross-origin cookies between Vercel and Render
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    // Some endpoints might return empty bodies (like 204 No Content)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
};