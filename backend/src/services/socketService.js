let io = null;

/**
 * Initialize Socket.IO with HTTP Server
 */
const initSocket = (server) => {
  const { Server } = require('socket.io');
  const config = require('../config/env');

  io = new Server(server, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // 1. Private User Room for direct notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // 2. Project Discussion Room for project participants
    socket.on('join_project', (projectId) => {
      if (projectId) {
        socket.join(`project_${projectId}`);
      }
    });

    // 3. Challenge Room
    socket.on('join_challenge', (challengeId) => {
      if (challengeId) {
        socket.join(`challenge_${challengeId}`);
      }
    });

    // 4. Role Room
    socket.on('join_role_room', (role) => {
      if (role) {
        socket.join(`role_${role}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });

  return io;
};

/**
 * Get active Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    return null;
  }
  return io;
};

/**
 * Send real-time notification to user's private room
 */
const sendRealtimeNotification = (recipientId, notification, unreadCount) => {
  try {
    if (!io || !recipientId) return;
    io.to(`user_${recipientId}`).emit('new_notification', notification);
    if (typeof unreadCount === 'number') {
      io.to(`user_${recipientId}`).emit('unread_count', { unreadCount });
    }
  } catch (err) {
    console.warn('[Socket Warning] Failed to emit real-time notification:', err.message);
  }
};

/**
 * Broadcast real-time message to project collaboration room
 */
const sendRealtimeProjectMessage = (projectId, message) => {
  try {
    if (!io || !projectId) return;
    io.to(`project_${projectId}`).emit('project_message', message);
  } catch (err) {
    console.warn('[Socket Warning] Failed to emit project message:', err.message);
  }
};

/**
 * Broadcast real-time project status/milestone update to project room
 */
const sendRealtimeProjectUpdate = (projectId, update) => {
  try {
    if (!io || !projectId) return;
    io.to(`project_${projectId}`).emit('project_update', update);
  } catch (err) {
    console.warn('[Socket Warning] Failed to emit project update:', err.message);
  }
};

module.exports = {
  initSocket,
  getIO,
  sendRealtimeNotification,
  sendRealtimeProjectMessage,
  sendRealtimeProjectUpdate
};
