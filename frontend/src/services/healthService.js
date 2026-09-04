import api from './api';

export const healthService = {
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to reach server'
      };
    }
  }
};
