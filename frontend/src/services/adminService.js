import api from './api';

export const adminService = {
  getOverview: async () => {
    const response = await api.get('/admin/overview');
    return response.data;
  },

  getChallenges: async (params = {}) => {
    const response = await api.get('/admin/challenges', { params });
    return response.data;
  },

  getChallengeDetail: async (id) => {
    const response = await api.get(`/admin/challenges/${id}`);
    return response.data;
  },

  getValidationQueue: async () => {
    const response = await api.get('/admin/validation-queue');
    return response.data;
  },

  validateChallenge: async (id, comment) => {
    const response = await api.post(`/admin/challenges/${id}/validate`, { comment });
    return response.data;
  },

  rejectChallenge: async (id, reason) => {
    const response = await api.post(`/admin/challenges/${id}/reject`, { reason });
    return response.data;
  },

  requestMoreInformation: async (id, questions) => {
    const response = await api.post(`/admin/challenges/${id}/request-info`, { questions });
    return response.data;
  },

  markDuplicate: async (id, originalChallengeId, comment) => {
    const response = await api.post(`/admin/challenges/${id}/duplicate`, {
      originalChallengeId,
      comment
    });
    return response.data;
  },

  changePriority: async (id, payload) => {
    const response = await api.patch(`/admin/challenges/${id}/priority`, payload);
    return response.data;
  },

  addInternalNote: async (id, note) => {
    const response = await api.post(`/admin/challenges/${id}/notes`, { note });
    return response.data;
  },

  assignUniversity: async (id, assignmentData) => {
    const response = await api.post(`/admin/challenges/${id}/assign`, assignmentData);
    return response.data;
  },

  getAuditHistory: async (id) => {
    const response = await api.get(`/admin/challenges/${id}/audit-history`);
    return response.data;
  },

  updateChallengeStatus: async (id, status, comment) => {
    const response = await api.patch(`/admin/challenges/${id}/status`, { status, comment });
    return response.data;
  },

  getUniversities: async () => {
    const response = await api.get('/admin/universities');
    return response.data;
  },

  getIndustryPartners: async () => {
    const response = await api.get('/admin/industry');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/admin/profile', profileData);
    return response.data;
  },

  aiAnalyzeChallenge: async (id) => {
    const response = await api.post(`/admin/challenges/${id}/ai-analyze`);
    return response.data;
  },

  getAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },

  exportAnalyticsCSV: async (params = {}) => {
    const response = await api.get('/admin/analytics/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  getMapData: async (params = {}) => {
    const response = await api.get('/admin/map', { params });
    return response.data;
  },

  recommendUniversities: async (id) => {
    const response = await api.post(`/admin/challenges/${id}/recommend-universities`);
    return response.data;
  },

  acceptUniversityRecommendation: async (id, universityId, notes = '') => {
    const response = await api.post(`/admin/challenges/${id}/recommend-universities/accept`, {
      universityId,
      notes
    });
    return response.data;
  },

  ignoreUniversityRecommendation: async (id, universityId) => {
    const response = await api.post(`/admin/challenges/${id}/recommend-universities/ignore`, {
      universityId
    });
    return response.data;
  }
};
