import api from './api';

export const studentService = {
  getDashboard: async () => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },

  getStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/students/profile', data);
    return response.data;
  },

  uploadProfileImage: async (formData) => {
    const response = await api.post('/students/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/students/achievements');
    return response.data;
  }
};

export default studentService;
