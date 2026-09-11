import api from './api';

export const clientService = {
  /**
   * Get dynamic citizen dashboard metrics
   */
  getDashboard: async () => {
    const response = await api.get('/client/dashboard');
    return response.data;
  },

  /**
   * Get authenticated citizen profile
   */
  getProfile: async () => {
    const response = await api.get('/client/profile');
    return response.data;
  },

  /**
   * Update authenticated citizen profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/client/profile', profileData);
    return response.data;
  }
};

export default clientService;
