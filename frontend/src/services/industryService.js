import api from './api';

export const industryService = {
  getProfile: async () => {
    const response = await api.get('/industry/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/industry/profile', profileData);
    return response.data;
  },

  getOpportunities: async (params = {}) => {
    const response = await api.get('/industry/opportunities', { params });
    return response.data;
  },

  getPartnerships: async () => {
    const response = await api.get('/industry/partnerships');
    return response.data;
  },

  createPartnership: async (partnershipData) => {
    const response = await api.post('/industry/partnerships', partnershipData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/industry/stats');
    return response.data;
  }
};
