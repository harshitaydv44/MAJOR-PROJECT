import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import StatusBadge from '../components/common/StatusBadge';
import { problemService } from '../services/problemService';
import { notificationService } from '../services/notificationService';
import { getSocket } from '../services/socket';
import SubmitChallengePage from './client/SubmitChallengePage';
import {
  PlusCircle,
  Bookmark,
  Bell,
  HelpCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Mail,
  Building,
  Info,
  ExternalLink,
  Trash2,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react';

/**
 * Submit a Challenge Launchpad (renders full dynamic SubmitChallengePage)
 */
export const SubmitLaunchpadPage = SubmitChallengePage;

/**
 * Saved Challenges Page (Fully dynamic connected to MongoDB)
 */
export const SavedChallengesPage = () => {
  const navigate = useNavigate();
  const [savedProblems, setSavedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchSaved = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await problemService.getSavedProblems();
      setSavedProblems(res?.data?.problems || res?.problems || []);
    } catch (err) {
      console.error('Failed to load saved challenges:', err);
      setError(err.message || 'Failed to fetch bookmarked challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (id, e) => {
    e.stopPropagation();
    setActionId(id);
    try {
      await problemService.unsaveProblem(id);
      setSavedProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Failed to unsave challenge:', err);
      alert('Failed to remove bookmark. Please try again.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">Saved Challenges & Bookmarks</h1>
          <p className="text-xs text-gov-text-secondary mt-1">
            Community problem statements you have bookmarked to monitor research cohort breakthroughs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={fetchSaved} icon={RefreshCw}>
            Refresh
          </Button>
          <Link to="/client/challenges">
            <Button variant="outline" size="sm">
              Explore All My Challenges
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your saved challenges..." />
      ) : error ? (
        <Card accent="none">
          <ErrorState
            title="Failed to Load Bookmarks"
            message={error}
            onRetry={fetchSaved}
          />
        </Card>
      ) : savedProblems.length === 0 ? (
        <Card accent="none">
          <EmptyState
            icon={Bookmark}
            title="No Saved Challenges Yet"
            description="You haven't bookmarked any challenges yet. When inspecting a challenge, click 'Bookmark' to keep track of its prototype lifecycle."
            actionLabel="View My Challenges"
            onAction={() => navigate('/client/challenges')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedProblems.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/client/challenges/${p._id}`)}
              className="bg-white border border-gov-border rounded-sm p-5 shadow-gov-card hover:border-gov-maroon cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-gov-maroon bg-gov-maroon-surface px-2 py-0.5 rounded-xs border border-gov-maroon-border">
                    {p.code}
                  </span>
                  <StatusBadge status={p.status} />
                </div>

                <h3 className="font-bold text-gov-navy text-sm line-clamp-2 leading-snug">
                  {p.title}
                </h3>

                <p className="text-xs text-gov-text-secondary mt-2 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gov-border flex items-center justify-between text-xs">
                <div className="flex items-center text-gov-text-muted text-[11px]">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-gov-maroon" />
                  <span>{p.district}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionId === p._id}
                  onClick={(e) => handleUnsave(p._id, e)}
                  className="text-red-600 hover:text-red-800 text-[11px] h-7 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Notifications Center Page (Connected to MongoDB & Socket.IO)
 */
export const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications();
      const notifs = res?.data?.notifications || res?.notifications || [];
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();

    // Socket.IO real-time notification listener
    const socket = getSocket();
    if (socket) {
      const handleRealtimeNotif = (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      };
      socket.on('notification', handleRealtimeNotif);
      socket.on('new_notification', handleRealtimeNotif);

      return () => {
        socket.off('notification', handleRealtimeNotif);
        socket.off('new_notification', handleRealtimeNotif);
      };
    }
  }, []);

  const handleMarkOne = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAll = async () => {
    setActionLoading(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const isUnread = (n) => !n.isRead && !n.read;
  const filtered =
    filter === 'unread' ? notifications.filter(isUnread) : notifications;
  const unreadCount = notifications.filter(isUnread).length;

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">Notifications & State Alerts</h1>
          <p className="text-xs text-gov-text-secondary mt-1">
            Official government communications regarding your reported civic problems.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xs border text-xs font-semibold ${
              filter === 'all'
                ? 'bg-gov-maroon text-white border-gov-maroon shadow-xs'
                : 'bg-white text-gov-navy border-gov-border hover:bg-gov-sand-50'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xs border text-xs font-semibold ${
              filter === 'unread'
                ? 'bg-gov-maroon text-white border-gov-maroon shadow-xs'
                : 'bg-white text-gov-navy border-gov-border hover:bg-gov-sand-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={actionLoading}
              className="text-xs text-gov-maroon hover:underline font-bold ml-2 cursor-pointer"
            >
              {actionLoading ? 'Marking...' : 'Mark all read'}
            </button>
          )}
        </div>
      </div>

      <Card accent="none">
        {loading ? (
          <div className="py-12 text-center text-xs text-gov-text-muted">
            <LoadingState message="Loading government notifications..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-gov-text-muted">
            {filter === 'unread'
              ? 'You have caught up with all notifications.'
              : 'No state notifications logged for your account yet.'}
          </div>
        ) : (
          <div className="divide-y divide-gov-border">
            {filtered.map((n) => {
              const unread = isUnread(n);
              const targetId = n.challenge?._id || n.challenge || n.relatedEntityId;

              return (
                <div
                  key={n._id}
                  className={`p-4 transition-colors ${
                    unread ? 'bg-gov-sand-50/80 border-l-4 border-gov-maroon' : 'hover:bg-gov-sand-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center space-x-2">
                      {unread && (
                        <span className="w-2 h-2 rounded-full bg-gov-maroon flex-shrink-0"></span>
                      )}
                      <span className="font-bold text-gov-navy text-xs">
                        {n.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-[11px] text-gov-text-muted">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      {unread && (
                        <button
                          onClick={(e) => handleMarkOne(n._id, e)}
                          className="text-[11px] text-gov-maroon hover:underline font-semibold ml-2"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gov-text-secondary leading-relaxed pl-4">
                    {n.message}
                  </p>

                  {targetId && (
                    <div className="mt-2.5 pl-4">
                      <Link
                        to={`/client/challenges/${targetId}`}
                        className="text-[11px] text-gov-maroon hover:underline font-bold inline-flex items-center"
                      >
                        <span>View Challenge Tracking & Details</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

/**
 * Help & Support Page
 */
export const HelpSupportPage = () => {
  const faqs = [
    {
      q: 'How long does government review take for reported challenges?',
      a: 'Initial screening by the Delhi District Innovation Cell typically takes 3-5 working days. Once verified, statements are made available in the State Problem Bank for university research cohort adoption.'
    },
    {
      q: 'What happens after my challenge is assigned to a university?',
      a: 'The assigned engineering or urban planning faculty lead deploys student teams to survey the ground site, formulate a technical proposal, and engineer a deployable prototype.'
    },
    {
      q: 'How can I submit additional evidence after lodging a challenge?',
      a: 'Navigate to Challenge Details page where attachments can be viewed. If district administrators mark your challenge as "Needs Information", an interactive submission box will appear to attach supplementary logs.'
    },
    {
      q: 'Can I edit my challenge details after submission?',
      a: 'Yes, as long as your challenge is in "Submitted" or "Needs Information" status, you can use the "Edit Challenge" button. Once verified or assigned to an engineering cohort, editing is locked to preserve academic scope.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Helpdesk & Citizen Support</h1>
        <p className="text-xs text-gov-text-secondary mt-1">
          Guidance and official contact channels for the Samadhan Setu Portal.
        </p>
      </div>

      {/* Contacts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card accent="maroon" className="p-4">
          <div className="flex items-start space-x-3">
            <PhoneCall className="w-5 h-5 text-gov-maroon flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gov-navy text-xs uppercase">Civic Grievance Helpline</h4>
              <div className="text-lg font-bold text-gov-maroon mt-1">1800-11-DELHI</div>
              <p className="text-[11px] text-gov-text-muted mt-0.5">Toll-free / 24x7 State Support</p>
            </div>
          </div>
        </Card>

        <Card accent="navy" className="p-4">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-gov-navy flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gov-navy text-xs uppercase">Nodal Email Support</h4>
              <div className="text-sm font-bold text-gov-navy mt-1">innovation.portal@delhi.gov.in</div>
              <p className="text-[11px] text-gov-text-muted mt-0.5">Response within 24 working hours</p>
            </div>
          </div>
        </Card>
      </div>

      {/* FAQs */}
      <Card accent="none" title="Frequently Asked Questions">
        <div className="space-y-4 divide-y divide-gov-border">
          {faqs.map((faq, idx) => (
            <div key={idx} className={idx !== 0 ? 'pt-4' : ''}>
              <h4 className="text-xs font-bold text-gov-navy">{faq.q}</h4>
              <p className="text-xs text-gov-text-secondary leading-relaxed mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
