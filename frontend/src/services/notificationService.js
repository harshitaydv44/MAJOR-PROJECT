import api from './api';

export const notificationService = {
  getMyNotifications: async (status = 'all') => {
    const response = await api.get('/notifications', {
      params: { status }
    });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
};

export default notificationService;
