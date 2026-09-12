import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { projectService } from '../../services/projectService';
import socketService from '../../services/socket';
import {
  MessageSquare,
  Send,
  Users,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Radio
} from 'lucide-react';
import Badge from '../common/Badge';

const ROLE_CONFIG = {
  STUDENT: {
    label: 'Student Innovator',
    badgeVariant: 'emerald',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    avatarBg: 'bg-emerald-700 text-white'
  },
  FACULTY: {
    label: 'Faculty Mentor',
    badgeVariant: 'navy',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    avatarBg: 'bg-gov-navy text-white'
  },
  UNIVERSITY: {
    label: 'University Lead',
    badgeVariant: 'purple',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    avatarBg: 'bg-purple-700 text-white'
  },
  INDUSTRY: {
    label: 'Industry Partner',
    badgeVariant: 'amber',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    avatarBg: 'bg-amber-600 text-white'
  },
  ADMIN: {
    label: 'Council Admin',
    badgeVariant: 'maroon',
    bgLight: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-gov-maroon',
    avatarBg: 'bg-gov-maroon text-white'
  }
};

const DiscussionSection = ({ project, onProjectUpdated }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(project?.comments || []);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const messagesEndRef = useRef(null);

  const projectId = project?._id;

  // Sync comments if parent project prop updates
  useEffect(() => {
    if (project?.comments) {
      setComments(project.comments);
    }
  }, [project?.comments]);

  // Connect Socket.IO to Project Discussion Room
  useEffect(() => {
    if (!projectId) return;

    // Join room
    socketService.joinProjectRoom(projectId);

    // Listen for incoming real-time comments
    const unsubscribe = socketService.onProjectMessage((incomingComment) => {
      if (!incomingComment) return;

      setComments((prev) => {
        // Prevent duplicates
        const exists = prev.some(
          (c) =>
            (c._id && incomingComment._id && c._id === incomingComment._id) ||
            (c.comment === incomingComment.comment &&
              c.userName === incomingComment.userName &&
              Math.abs(new Date(c.createdAt).getTime() - new Date(incomingComment.createdAt).getTime()) < 2000)
        );
        if (exists) return prev;
        return [...prev, incomingComment];
      });

      // Scroll to newest
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [projectId]);

  // Auto-scroll on initial load or new comments
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handlePostComment = async (e) => {
    e?.preventDefault();
    if (!commentText.trim() || submitting) return;

    const trimmed = commentText.trim();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await projectService.addComment(projectId, { comment: trimmed });
      setCommentText('');
      setSuccessMsg('Comment posted in collaboration thread');

      // Update local state if returned
      if (res?.data?.comment) {
        setComments((prev) => {
          const exists = prev.some(
            (c) => c._id && res.data.comment._id && c._id === res.data.comment._id
          );
          if (exists) return prev;
          return [...prev, res.data.comment];
        });
      }

      if (onProjectUpdated) {
        onProjectUpdated();
      }

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post message. Ensure you are an authorized participant.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handlePostComment(e);
    }
  };

  const teamMembers = project?.team?.members || [];
  const mentorName = project?.mentor?.name || 'Assigned Faculty Lead';
  const universityName = project?.universityId?.name || 'Host University';
  const industryPartnersCount = (project?.industryPartners || []).length;

  return (
    <div className="space-y-4 max-w-5xl font-serif">
      {/* 1. Stakeholders Collaboration Banner */}
      <div className="bg-white border border-gov-border rounded-xs p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-gov-maroon" />
            <h3 className="font-bold text-gov-navy text-sm">
              Authorized Multi-Stakeholder Discussion Forum
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-sans">
            <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 mr-1 animate-pulse" />
              Socket.IO Live Sync Active
            </span>
          </div>
        </div>

        {/* Stakeholder Roster Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {/* Teammates */}
          <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-gov-text-muted uppercase font-bold">Team Innovators</div>
              <div className="text-[11px] font-semibold text-gov-navy truncate">
                {teamMembers.length > 0
                  ? `${teamMembers.length} Members Enrolled`
                  : 'Project Student Team'}
              </div>
            </div>
          </div>

          {/* Faculty Mentor */}
          <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-gov-text-muted uppercase font-bold">Faculty Mentor</div>
              <div className="text-[11px] font-semibold text-gov-navy truncate">
                {mentorName}
              </div>
            </div>
          </div>

          {/* University Rep */}
          <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-gov-text-muted uppercase font-bold">University Rep</div>
              <div className="text-[11px] font-semibold text-gov-navy truncate">
                {universityName}
              </div>
            </div>
          </div>

          {/* Industry Partner */}
          <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-gov-text-muted uppercase font-bold">Industry Partner</div>
              <div className="text-[11px] font-semibold text-gov-navy truncate">
                {industryPartnersCount > 0
                  ? `${industryPartnersCount} Partner${industryPartnersCount > 1 ? 's' : ''} Linked`
                  : 'Authorized Industry'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Messages & Conversation Feed */}
      <div className="bg-white border border-gov-border rounded-xs shadow-xs flex flex-col min-h-[420px] max-h-[580px]">
        {/* Messages Header */}
        <div className="px-4 py-3 border-b border-gov-border bg-gov-sand-50 flex items-center justify-between">
          <span className="text-xs font-bold text-gov-navy">
            Project Conversation Stream ({comments.length} message{comments.length === 1 ? '' : 's'})
          </span>
          <span className="text-[10px] text-gov-text-muted font-sans">
            Sorted chronologically &bull; Press Ctrl+Enter to send
          </span>
        </div>

        {/* Message Items Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gov-border/40 scrollbar-thin">
          {comments.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-gov-sand-300 stroke-1" />
              <p className="text-xs italic font-serif">
                No discussion entries yet. Start the conversation with your teammates, mentor, and institutional partners!
              </p>
            </div>
          ) : (
            comments.map((item, index) => {
              const isCurrentUser =
                user &&
                (item.user === user._id ||
                  item.user === user.id ||
                  item.user?._id === user._id ||
                  item.user?._id === user.id ||
                  item.userName === user.name);

              const roleInfo = ROLE_CONFIG[item.userRole] || {
                label: item.userRole || 'Collaborator',
                badgeVariant: 'stone',
                bgLight: 'bg-stone-50',
                border: 'border-stone-200',
                text: 'text-stone-800',
                avatarBg: 'bg-stone-600 text-white'
              };

              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Just now';

              return (
                <div
                  key={item._id || index}
                  className={`pt-3 first:pt-0 transition-colors ${
                    isCurrentUser ? 'pl-2 sm:pl-6' : 'pr-2 sm:pr-6'
                  }`}
                >
                  <div
                    className={`rounded-xs p-3 border transition-all ${
                      isCurrentUser
                        ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                        : `${roleInfo.bgLight} ${roleInfo.border}`
                    }`}
                  >
                    {/* Comment Header: User info, Role Badge, Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center space-x-2">
                        {/* Avatar */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${roleInfo.avatarBg}`}
                        >
                          {(item.userName || 'U').charAt(0).toUpperCase()}
                        </div>

                        <span className="font-bold text-xs text-gov-navy">
                          {item.userName}
                          {isCurrentUser && (
                            <span className="ml-1 text-[10px] font-normal text-gov-text-muted">
                              (You)
                            </span>
                          )}
                        </span>

                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full border ${roleInfo.border} ${roleInfo.bgLight} ${roleInfo.text}`}
                        >
                          {roleInfo.label}
                        </span>
                      </div>

                      <div className="text-[10px] text-gov-text-muted flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Comment Body */}
                    <p className="text-xs text-gov-navy leading-relaxed whitespace-pre-wrap pl-8 font-sans">
                      {item.comment}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Comment Input Form */}
        <div className="p-3 border-t border-gov-border bg-gov-sand-50">
          {errorMsg && (
            <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handlePostComment} className="space-y-2">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={1000}
                placeholder="Post a technical update, query the faculty mentor, or sync with teammates..."
                className="w-full text-xs font-serif p-2.5 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gov-text-muted">
                {commentText.length}/1000 characters &bull; Stakeholders receive instant notifications
              </span>

              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-gov-maroon text-white text-xs font-semibold rounded-xs hover:bg-gov-maroon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Posting...' : 'Post Message'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiscussionSection;
