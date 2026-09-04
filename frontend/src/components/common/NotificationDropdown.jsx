import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';
import socketService from '../../services/socket';
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Clock,
  Sparkles,
  Layers,
  Building2,
  FileCheck,
  AlertCircle,
  X
} from 'lucide-react';

const EVENT_ICONS = {
  CHALLENGE_SUBMITTED: AlertCircle,
  CHALLENGE_VALIDATED: Check,
  CHALLENGE_REJECTED: X,
  NEEDS_INFORMATION: AlertCircle,
  UNIVERSITY_INTEREST: Sparkles,
  CHALLENGE_ASSIGNED: Building2,
  PROJECT_CREATED: Layers,
  PROPOSAL_SUBMITTED: Layers,
  PROPOSAL_APPROVED: CheckCheck,
  INDUSTRY_INTEREST: Building2,
  PARTNERSHIP_REQUEST: Building2,
  MENTORSHIP_OFFER: Sparkles,
  FUNDING_OFFER: Sparkles,
  MILESTONE_UPDATED: Layers,
  MILESTONE_COMPLETED: FileCheck,
  PROJECT_DELAYED: AlertCircle,
  PROJECT_COMPLETED: Sparkles,
  GENERAL: Bell
};

const NotificationDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('unread'); // 'unread' | 'all'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications(activeTab);
      const list = res.data?.notifications || [];
      setNotifications(list);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.warn('[Notifications] Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Connect socket and listen for real-time notifications
  useEffect(() => {
    if (!user?._id) return;

    socketService.connect(user._id);

    const unsubscribeNotif = socketService.onNotification((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    const unsubscribeCount = socketService.onUnreadCount(({ unreadCount: count }) => {
      setUnreadCount(count);
    });

    return () => {
      unsubscribeNotif();
      unsubscribeCount();
    };
  }, [user?._id]);

  // Fetch when tab changes or dropdown opens
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [activeTab, isOpen, user?._id]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark single as read
  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark read:', err.message);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all read:', err.message);
    }
  };

  // Navigate to related entity
  const handleNotificationClick = async (notif) => {
    if (!notif.isRead && !notif.read) {
      try {
        await notificationService.markAsRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }

    setIsOpen(false);

    // Deep navigation based on entity and user role
    const entityId = notif.relatedEntityId || notif.challenge?._id || notif.challenge;
    if (notif.relatedEntity === 'Project') {
      navigate(`/projects/${entityId}`);
    } else if (notif.relatedEntity === 'Partnership') {
      navigate(user?.role === 'INDUSTRY' ? '/industry/partnerships' : `/projects/${entityId}`);
    } else if (notif.relatedEntity === 'Challenge' || notif.challenge) {
      if (user?.role === 'ADMIN') {
        navigate(`/admin/challenges/${entityId}`);
      } else if (user?.role === 'UNIVERSITY') {
        navigate(`/university/marketplace`);
      } else {
        navigate(`/client/challenges/${entityId}`);
      }
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead && !n.read;
    return true;
  });

  return (
    <div className="relative font-serif" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gov-navy hover:bg-gov-sand-100 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gov-navy" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gov-maroon px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-sm bg-white shadow-xl border border-gov-border z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 bg-gov-sand-50 border-b border-gov-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gov-navy text-xs">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-gov-maroon text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-gov-maroon font-semibold hover:underline flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-0.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Unread / All Filter Tabs */}
          <div className="flex border-b border-gov-border text-xs font-semibold bg-gov-sand-50/50">
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                activeTab === 'unread'
                  ? 'border-gov-maroon text-gov-maroon bg-white font-bold'
                  : 'border-transparent text-gray-500 hover:text-gov-navy'
              }`}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'border-gov-maroon text-gov-maroon bg-white font-bold'
                  : 'border-transparent text-gray-500 hover:text-gov-navy'
              }`}
            >
              All Notifications
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gov-border text-xs">
            {loading ? (
              <div className="p-6 text-center text-gray-400 italic">Checking for alerts...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-gray-300 stroke-1" />
                <p className="text-xs">No {activeTab === 'unread' ? 'unread ' : ''}notifications.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isUnread = !n.isRead && !n.read;
                const IconComponent = EVENT_ICONS[n.type] || Bell;

                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 transition-colors cursor-pointer flex items-start space-x-2.5 ${
                      isUnread ? 'bg-amber-50/40 hover:bg-amber-50/80 font-medium' : 'hover:bg-gov-sand-50'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${
                        isUnread ? 'bg-gov-maroon text-white' : 'bg-gov-sand-100 text-gov-navy'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gov-navy text-xs leading-snug truncate">
                          {n.title}
                        </span>
                        {isUnread && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, n._id)}
                            title="Mark as read"
                            className="text-gray-400 hover:text-gov-maroon p-0.5 ml-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-gov-text-secondary text-[11px] leading-snug line-clamp-2">
                        {n.message}
                      </p>
                      <div className="text-[10px] text-gray-400 flex items-center space-x-1 pt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {n.senderName && <span>&bull; {n.senderName}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
