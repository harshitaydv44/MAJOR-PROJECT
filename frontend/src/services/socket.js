import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => socket;

export const socketService = {
  /**
   * Connect to Socket.IO server and bind authenticated user room
   */
  connect: (userId) => {
    if (socket && socket.connected) {
      if (userId) socket.emit('join_user', userId);
      return socket;
    }

    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      if (userId) {
        socket.emit('join_user', userId);
      }
    });

    return socket;
  },

  /**
   * Join private user room for direct notification delivery
   */
  joinUserRoom: (userId) => {
    if (socket && userId) {
      socket.emit('join_user', userId);
    }
  },

  /**
   * Join project room for project-specific activities & discussion feed
   */
  joinProjectRoom: (projectId) => {
    if (socket && projectId) {
      socket.emit('join_project', projectId);
    }
  },

  /**
   * Subscribe to new real-time notification
   */
  onNotification: (callback) => {
    if (!socket) return () => {};
    socket.on('new_notification', callback);
    return () => socket.off('new_notification', callback);
  },

  /**
   * Subscribe to real-time unread count updates
   */
  onUnreadCount: (callback) => {
    if (!socket) return () => {};
    socket.on('unread_count', callback);
    return () => socket.off('unread_count', callback);
  },

  /**
   * Subscribe to real-time project messages
   */
  onProjectMessage: (callback) => {
    if (!socket) return () => {};
    socket.on('project_message', callback);
    return () => socket.off('project_message', callback);
  },

  /**
   * Subscribe to real-time project milestone/status updates
   */
  onProjectUpdate: (callback) => {
    if (!socket) return () => {};
    socket.on('project_update', callback);
    return () => socket.off('project_update', callback);
  },

  /**
   * Disconnect socket cleanly
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
};

export default socketService;
