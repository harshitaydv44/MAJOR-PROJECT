import api from './api';

export const problemService = {
  /**
   * Get authenticated citizen's challenges with optional filtering and pagination
   */
  getMyProblems: async (params = {}) => {
    const response = await api.get('/problems/my', { params });
    return response.data;
  },

  /**
   * Get single challenge details by ID or code
   */
  getProblemById: async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  /**
   * Submit a new civic problem / challenge
   */
  createProblem: async (data, isFormData = false) => {
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.post('/problems', data, config);
    return response.data;
  },

  /**
   * Update challenge details (allowed during SUBMITTED or NEEDS_INFORMATION)
   */
  updateProblem: async (id, data) => {
    const response = await api.put(`/problems/${id}`, data);
    return response.data;
  },

  /**
   * Submit supplementary info or evidence in response to administrative request
   */
  provideInformation: async (id, data) => {
    const response = await api.post(`/problems/${id}/information`, data);
    return response.data;
  },

  /**
   * Bookmark a challenge
   */
  saveProblem: async (id) => {
    const response = await api.post(`/problems/${id}/save`);
    return response.data;
  },

  /**
   * Remove a challenge bookmark
   */
  unsaveProblem: async (id) => {
    const response = await api.delete(`/problems/${id}/save`);
    return response.data;
  },

  /**
   * Get all bookmarked challenges for authenticated citizen
   */
  getSavedProblems: async () => {
    const response = await api.get('/problems/saved');
    return response.data;
  },

  /**
   * Update citizen user profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/client/profile', profileData);
    return response.data;
  }
};

export default problemService;
