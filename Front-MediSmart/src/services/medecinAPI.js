import { getToken } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make authenticated requests
const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Get doctor dashboard statistics
export const getDoctorDashboardStats = async () => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/medecins/dashboard-stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor dashboard stats:', error);
    throw error;
  }
};