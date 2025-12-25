

// Robust environment variable extraction
let apiUrl = 'http://localhost:5000/api';

try {
  // Safety check: access import.meta carefully
  const meta = import.meta as any;
  if (meta && meta.env && meta.env.VITE_API_URL) {
    apiUrl = meta.env.VITE_API_URL;
  }
} catch (e) {
  console.warn('Environment variables not accessible, using default API URL:', apiUrl);
}

// Debug: Log the API URL being used
console.log('🔗 API_URL configured as:', apiUrl);
console.log('🔍 Environment check:', import.meta.env.VITE_API_URL);

export const API_URL = apiUrl;

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