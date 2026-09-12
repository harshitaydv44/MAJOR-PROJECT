const Notification = require('../models/Notification');
const { sendRealtimeNotification } = require('../services/socketService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get authenticated user's notifications
 * GET /api/notifications?status=unread|all
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { recipient: req.user.id };

    if (status === 'unread') {
      filter.$or = [{ isRead: false }, { read: false }];
    }

    const Project = require('../models/Project');
    const notifications = await Notification.find(filter)
      .populate('sender', 'name organization role')
      .populate('challenge', 'code title status category district')
      .populate('project', 'title code stage progress')
      .sort({ createdAt: -1 })
      .limit(100);

    const enrichedNotifications = await Promise.all(
      notifications.map(async (n) => {
        const notifObj = n.toObject();
        if (!notifObj.project && notifObj.relatedEntity === 'Project' && notifObj.relatedEntityId) {
          try {
            const p = await Project.findById(notifObj.relatedEntityId).select('title code stage progress');
            if (p) notifObj.project = p;
          } catch (_) {}
        }
        return notifObj;
      })
    );

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      $or: [{ isRead: false }, { read: false }]
    });

    return successResponse(res, 'Notifications retrieved successfully', {
      unreadCount,
      count: enrichedNotifications.length,
      notifications: enrichedNotifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, read: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 'Notification not found or access denied', null, 404);
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      $or: [{ isRead: false }, { read: false }]
    });

    // Realtime badge sync
    const { getIO } = require('../services/socketService');
    const io = getIO();
    if (io) {
      io.to(`user_${req.user.id}`).emit('unread_count', { unreadCount });
    }

    return successResponse(res, 'Notification marked as read', { notification, unreadCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all user notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, $or: [{ isRead: false }, { read: false }] },
      { isRead: true, read: true }
    );

    // Realtime badge sync to 0
    const { getIO } = require('../services/socketService');
    const io = getIO();
    if (io) {
      io.to(`user_${req.user.id}`).emit('unread_count', { unreadCount: 0 });
    }

    return successResponse(res, 'All notifications marked as read', { unreadCount: 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
