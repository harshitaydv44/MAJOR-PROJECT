const Notification = require('../models/Notification');
const { sendRealtimeNotification } = require('./socketService');

/**
 * Centralized Notification Dispatcher
 * Persists notification to MongoDB and emits real-time WebSocket alert via Socket.IO
 */
const dispatchNotification = async ({
  recipient,
  sender,
  senderName,
  type = 'GENERAL',
  title,
  message,
  relatedEntity = 'Challenge',
  relatedEntityId
}) => {
  try {
    if (!recipient || !title || !message) {
      console.warn('[Notification Warning] Missing recipient, title, or message');
      return null;
    }

    // 1. Persist in MongoDB
    const notification = await Notification.create({
      recipient,
      sender: sender || undefined,
      senderName: senderName || 'Delhi State Innovation Council',
      type,
      title: title.trim(),
      message: message.trim(),
      relatedEntity,
      relatedEntityId: relatedEntityId || undefined,
      challenge: relatedEntity === 'Challenge' ? relatedEntityId : undefined,
      isRead: false,
      read: false
    });

    // 2. Count active unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient,
      $or: [{ isRead: false }, { read: false }]
    });

    // 3. Emit real-time WebSocket notification to user's private room
    sendRealtimeNotification(recipient.toString(), notification, unreadCount);

    return notification;
  } catch (error) {
    console.error('[Notification Dispatch Error]', error);
    return null;
  }
};

module.exports = {
  dispatchNotification
};
