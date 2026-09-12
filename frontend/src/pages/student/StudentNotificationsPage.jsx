import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';
import socketService from '../../services/socket';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  Bell,
  CheckCheck,
  Check,
  FolderKanban,
  Flag,
  Users,
  GraduationCap,
  Building2,
  ExternalLink,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Radio,
  CheckCircle2,
  FileText,
  MessageSquare
} from 'lucide-react';

const FILTER_TABS = [
  { id: 'ALL', label: 'All', icon: Bell },
  { id: 'UNREAD', label: 'Unread', icon: AlertCircle },
  { id: 'PROJECT', label: 'Project', icon: FolderKanban },
  { id: 'MILESTONE', label: 'Milestone', icon: Flag },
  { id: 'TEAM', label: 'Team', icon: Users },
  { id: 'MENTOR', label: 'Mentor', icon: GraduationCap },
  { id: 'INDUSTRY', label: 'Industry', icon: Building2 }
];

const NOTIF_TYPE_CONFIG = {
  CHALLENGE_ASSIGNED: { label: 'Challenge Assigned', variant: 'navy' },
  PROJECT_CREATED: { label: 'Project Created', variant: 'emerald' },
  PROPOSAL_SUBMITTED: { label: 'Proposal Submitted', variant: 'navy' },
  PROPOSAL_APPROVED: { label: 'Proposal Approved', variant: 'emerald' },
  PROPOSAL_REVISION_REQUESTED: { label: 'Proposal Revision', variant: 'maroon' },
  MILESTONE_DUE: { label: 'Milestone Due', variant: 'amber' },
  MILESTONE_REVIEWED: { label: 'Milestone Reviewed', variant: 'purple' },
  MILESTONE_UPDATED: { label: 'Milestone Updated', variant: 'navy' },
  MILESTONE_COMPLETED: { label: 'Milestone Completed', variant: 'emerald' },
  DELIVERABLE_APPROVED: { label: 'Deliverable Approved', variant: 'emerald' },
  DELIVERABLE_REJECTED: { label: 'Deliverable Rejected', variant: 'maroon' },
  FACULTY_FEEDBACK: { label: 'Faculty Feedback', variant: 'purple' },
  TEAM_INVITATION: { label: 'Team Invitation', variant: 'amber' },
  TEAM_INVITATION_ACCEPTED: { label: 'Invitation Accepted', variant: 'emerald' },
  INDUSTRY_REQUEST: { label: 'Industry Request', variant: 'amber' },
  INDUSTRY_REQUEST_ACCEPTED: { label: 'Industry Accepted', variant: 'emerald' },
  PROJECT_STAGE_CHANGED: { label: 'Stage Changed', variant: 'navy' },
  STAGE_TRANSITION: { label: 'Stage Transition', variant: 'navy' },
  PROJECT_DISCUSSION: { label: 'Discussion', variant: 'maroon' },
  GENERAL: { label: 'Notice', variant: 'stone' }
};

const StudentNotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      setErrorMsg('');
      const res = await notificationService.getMyNotifications('all');
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Socket.IO Real-Time Delivery
  useEffect(() => {
    if (!user) return;
    const userId = user._id || user.id;
    socketService.connect(userId);

    // Listen for new notification
    const unsubNotif = socketService.onNotification((newNotif) => {
      if (!newNotif) return;
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === newNotif._id);
        if (exists) return prev;
        return [newNotif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
      setActionSuccess(`New notification: ${newNotif.title}`);
      setTimeout(() => setActionSuccess(''), 4000);
    });

    // Listen for unread count updates
    const unsubCount = socketService.onUnreadCount(({ unreadCount: count }) => {
      if (typeof count === 'number') {
        setUnreadCount(count);
      }
    });

    return () => {
      if (typeof unsubNotif === 'function') unsubNotif();
      if (typeof unsubCount === 'function') unsubCount();
    };
  }, [user]);

  // Mark single as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      setUnreadCount(0);
      setActionSuccess('All notifications marked as read');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Navigate to related project or entity
  const handleOpenRelated = (item) => {
    // If unread, mark as read
    if (!item.isRead && !item.read) {
      handleMarkAsRead(item._id);
    }

    const linkedProject = item.project?._id || item.project;
    if (linkedProject) {
      navigate(`/projects/${linkedProject}`);
      return;
    }

    if (item.relatedEntity === 'Project' && item.relatedEntityId) {
      navigate(`/projects/${item.relatedEntityId}`);
      return;
    }

    if (item.relatedEntity === 'Challenge' && (item.challenge?._id || item.relatedEntityId)) {
      navigate(`/student/challenges/${item.challenge?._id || item.relatedEntityId}`);
      return;
    }

    if (item.relatedEntity === 'Milestone') {
      navigate('/student/milestones');
      return;
    }

    if (item.relatedEntity === 'Team') {
      navigate('/student/team');
      return;
    }

    if (item.relatedEntity === 'Partnership' || item.relatedEntity === 'Industry') {
      navigate('/student/industry');
      return;
    }
  };

  // Category Filter Function
  const matchesCategory = (n, category) => {
    const type = n.type || 'GENERAL';
    const entity = n.relatedEntity || '';

    switch (category) {
      case 'UNREAD':
        return !n.isRead && !n.read;
      case 'PROJECT':
        return (
          [
            'PROJECT_CREATED',
            'CHALLENGE_ASSIGNED',
            'PROJECT_STAGE_CHANGED',
            'STAGE_TRANSITION',
            'STATUS_CHANGE',
            'PROJECT_COMPLETED',
            'PROJECT_DELAYED',
            'PROJECT_DISCUSSION'
          ].includes(type) || entity === 'Project'
        );
      case 'MILESTONE':
        return (
          [
            'MILESTONE_DUE',
            'MILESTONE_REVIEWED',
            'MILESTONE_UPDATED',
            'MILESTONE_COMPLETED',
            'MILESTONE_REVIEW_REQUESTED',
            'MILESTONE_DELIVERABLE_SUBMITTED',
            'MILESTONE_REVISION_REQUESTED',
            'DELIVERABLE_APPROVED',
            'DELIVERABLE_REJECTED'
          ].includes(type) || entity === 'Milestone'
        );
      case 'TEAM':
        return (
          ['TEAM_INVITATION', 'TEAM_INVITATION_ACCEPTED'].includes(type) ||
          entity === 'Team'
        );
      case 'MENTOR':
        return (
          [
            'FACULTY_FEEDBACK',
            'MENTORSHIP_OFFER',
            'PROPOSAL_SUBMITTED',
            'PROPOSAL_APPROVED',
            'PROPOSAL_REVISION_REQUESTED'
          ].includes(type)
        );
      case 'INDUSTRY':
        return (
          [
            'INDUSTRY_REQUEST',
            'INDUSTRY_REQUEST_ACCEPTED',
            'INDUSTRY_INTEREST',
            'PARTNERSHIP_REQUEST',
            'FUNDING_OFFER'
          ].includes(type) ||
          entity === 'Partnership' ||
          entity === 'Industry'
        );
      case 'ALL':
      default:
        return true;
    }
  };

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const catMatch = matchesCategory(n, activeTab);
      if (!catMatch) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (n.title || '').toLowerCase();
      const msg = (n.message || '').toLowerCase();
      const proj = (n.project?.title || '').toLowerCase();
      const sender = (n.senderName || n.sender?.name || '').toLowerCase();
      return title.includes(q) || msg.includes(q) || proj.includes(q) || sender.includes(q);
    });
  }, [notifications, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = {};
    FILTER_TABS.forEach((t) => {
      counts[t.id] = notifications.filter((n) => matchesCategory(n, t.id)).length;
    });
    return counts;
  }, [notifications]);

  if (loading) {
    return <LoadingState message="Connecting to Samadhan Setu Notification Engine..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-serif pb-16">
      {/* 1. Page Header */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gov-navy">Student Notification Center</h1>
              {unreadCount > 0 ? (
                <span className="bg-gov-maroon text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} Unread
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>All caught up</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gov-text-secondary mt-1">
              Real-time administrative alerts, project milestones, proposal reviews, faculty feedback, and industry collaboration notices.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-gov-sand-100 hover:bg-gov-sand-200 text-gov-navy text-xs font-semibold rounded-xs border border-gov-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-gov-maroon" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Filter Navigation & Search Bar */}
      <div className="bg-white border border-gov-border rounded-xs p-3 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const count = tabCounts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xs flex items-center space-x-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-gov-maroon text-white font-bold shadow-2xs'
                      : 'text-gov-navy hover:bg-gov-sand-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-gov-sand-200 text-gov-text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gov-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-serif border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-gov-sand-50"
            />
          </div>
        </div>
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-gov-border rounded-xs p-12 text-center text-gray-400 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-gov-sand-300 stroke-1" />
            <p className="text-sm font-semibold text-gov-navy">No notifications in this view</p>
            <p className="text-xs text-gov-text-muted">
              {searchQuery
                ? `No notifications matched "${searchQuery}".`
                : `You do not have any ${activeTab.toLowerCase()} notifications at this time.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isUnread = !item.isRead && !item.read;
            const typeConfig = NOTIF_TYPE_CONFIG[item.type] || {
              label: item.type || 'Notice',
              variant: 'stone'
            };

            const relatedProject =
              item.project ||
              (item.relatedEntity === 'Project' && item.relatedEntityId ? { _id: item.relatedEntityId } : null);

            const hasRelatedTarget =
              relatedProject ||
              item.challenge ||
              ['Project', 'Challenge', 'Milestone', 'Team', 'Partnership', 'Industry'].includes(
                item.relatedEntity
              );

            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recently';

            return (
              <div
                key={item._id}
                className={`bg-white border rounded-xs p-4 transition-all shadow-2xs hover:shadow-xs ${
                  isUnread
                    ? 'border-l-4 border-l-gov-maroon border-gov-border bg-amber-50/15'
                    : 'border-gov-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Indicator, Type, Content */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-gov-maroon flex-shrink-0 animate-pulse" />
                      )}

                      <Badge variant={typeConfig.variant}>
                        {typeConfig.label}
                      </Badge>

                      {item.senderName && (
                        <span className="text-[11px] text-gov-text-muted">
                          from <strong>{item.senderName}</strong>
                        </span>
                      )}

                      <span className="text-[11px] text-gov-text-muted flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-sm ${
                        isUnread ? 'font-bold text-gov-navy' : 'font-semibold text-gov-navy'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {/* Message Body */}
                    <p className="text-xs text-gov-text-secondary leading-relaxed font-sans">
                      {item.message}
                    </p>

                    {/* Related Project Badge / Link */}
                    {item.project?.title && (
                      <div className="pt-1 flex items-center space-x-1.5 text-xs text-gov-maroon">
                        <FolderKanban className="w-3.5 h-3.5 text-gov-maroon flex-shrink-0" />
                        <span className="font-semibold truncate">
                          Project: {item.project.title}
                        </span>
                        {item.project.stage && (
                          <span className="text-[10px] bg-gov-sand-100 text-gov-navy px-1.5 py-0.2 rounded-full border border-gov-border">
                            {item.project.stage}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gov-border">
                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkAsRead(item._id, e)}
                        className="inline-flex items-center space-x-1 text-xs text-gov-maroon hover:underline font-semibold"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as read</span>
                      </button>
                    )}

                    {hasRelatedTarget && (
                      <button
                        onClick={() => handleOpenRelated(item)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gov-sand-100 hover:bg-gov-sand-200 text-gov-navy text-xs font-semibold rounded-xs border border-gov-border transition-colors"
                      >
                        <span>Open Related Project</span>
                        <ExternalLink className="w-3 h-3 text-gov-maroon" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentNotificationsPage;
