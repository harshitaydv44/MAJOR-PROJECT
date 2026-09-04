import api from './api';

export const challengeService = {
  getChallenges: async (params = {}) => {
    const response = await api.get('/challenges', { params });
    return response.data;
  },

  getChallengeById: async (id) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  createChallenge: async (challengeData) => {
    const response = await api.post('/challenges', challengeData);
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await api.patch(`/challenges/${id}/status`, statusData);
    return response.data;
  },

  assignCohort: async (id, cohortData) => {
    const response = await api.post(`/challenges/${id}/assign-cohort`, cohortData);
    return response.data;
  },

  sponsorChallenge: async (id, sponsorshipData) => {
    const response = await api.post(`/challenges/${id}/sponsor`, sponsorshipData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/challenges/stats');
    return response.data;
  }
};
