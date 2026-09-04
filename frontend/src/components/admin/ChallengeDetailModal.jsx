import React from 'react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import Timeline from '../common/Timeline';
import {
  X,
  Calendar,
  MapPin,
  Building,
  User,
  Paperclip,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const ChallengeDetailModal = ({ challenge, onClose, onValidate, onReject, onAssign }) => {
  if (!challenge) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isPending = ['SUBMITTED', 'UNDER_REVIEW'].includes(challenge.status?.toUpperCase());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
      <div className="bg-white border border-gov-border rounded-sm max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gov-border flex items-start justify-between bg-gov-sand-50">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-xs font-bold text-gov-maroon bg-white px-2 py-0.5 rounded-xs border border-gov-border">
                {challenge.code || `DEL-${challenge._id.slice(-4).toUpperCase()}`}
              </span>
              <StatusBadge status={challenge.status} />
              <span className="text-[11px] font-bold text-gov-navy uppercase">
                {challenge.category}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gov-navy leading-snug">
              {challenge.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gov-sand-50 rounded-xs border border-gov-border text-[11px]">
            <div>
              <span className="text-gov-text-muted block">District:</span>
              <strong className="text-gov-navy">{challenge.district}</strong>
            </div>
            <div>
              <span className="text-gov-text-muted block">Submitted Date:</span>
              <strong className="text-gov-navy">{formatDate(challenge.createdAt)}</strong>
            </div>
            <div>
              <span className="text-gov-text-muted block">Priority Level:</span>
              <strong className="capitalize text-gov-maroon">{challenge.priority || 'Medium'}</strong>
            </div>
            <div>
              <span className="text-gov-text-muted block">Submitter:</span>
              <strong className="text-gov-navy truncate block">
                {challenge.submittedBy?.name || 'Citizen'}
              </strong>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-gov-navy uppercase tracking-wider mb-1">
              Problem Description & Societal Statement
            </h4>
            <p className="text-gov-text-secondary leading-relaxed whitespace-pre-line bg-white p-3 border border-gov-border rounded-xs">
              {challenge.description}
            </p>
          </div>

          {/* Location & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border border-gov-border rounded-xs">
              <div className="flex items-center space-x-1.5 font-bold text-gov-navy mb-1">
                <MapPin className="w-4 h-4 text-gov-maroon" />
                <span>Geographic Location</span>
              </div>
              <p className="text-gov-text-secondary">
                {challenge.location?.area || 'Area Not Specified'}
                {challenge.location?.landmark ? ` (Near ${challenge.location.landmark})` : ''}
              </p>
              {challenge.location?.coordinates && (
                <div className="text-[10px] text-gov-text-muted mt-1 font-mono">
                  Coordinates: {challenge.location.coordinates.lat?.toFixed(4)}, {challenge.location.coordinates.lng?.toFixed(4)}
                </div>
              )}
            </div>

            {/* University Assignment */}
            <div className="p-3 border border-gov-border rounded-xs">
              <div className="flex items-center space-x-1.5 font-bold text-gov-navy mb-1">
                <Building className="w-4 h-4 text-blue-700" />
                <span>Assigned Higher Education Lab</span>
              </div>
              {challenge.assignedUniversity ? (
                <div>
                  <div className="font-bold text-gov-navy">{challenge.assignedUniversity.name}</div>
                  <div className="text-gov-text-muted text-[11px]">
                    {challenge.facultyLead?.name ? `Faculty Lead: ${challenge.facultyLead.name}` : 'Academic Mentorship Active'}
                  </div>
                </div>
              ) : (
                <p className="text-gov-text-muted italic">
                  Not yet assigned to a university cohort.
                </p>
              )}
            </div>
          </div>

          {/* Submitted Evidence */}
          <div>
            <h4 className="font-bold text-gov-navy uppercase tracking-wider mb-1">
              Evidence Attachments ({challenge.evidence?.length || 0})
            </h4>
            {challenge.evidence && challenge.evidence.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {challenge.evidence.map((ev, idx) => (
                  <div key={idx} className="p-2 border border-gov-border rounded-xs flex items-center justify-between">
                    <span className="truncate mr-2 font-medium">{ev.title}</span>
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gov-maroon hover:underline flex items-center text-[11px] font-bold flex-shrink-0"
                    >
                      <span>View File</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gov-text-muted italic">No attached evidence files.</p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-bold text-gov-navy uppercase tracking-wider mb-2">
              Lifecycle Progress Timeline
            </h4>
            <Timeline currentStatus={challenge.status} events={challenge.timeline || []} />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 border-t border-gov-border bg-gov-sand-50 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {isPending && (
              <>
                <Button
                  variant="subtle"
                  size="sm"
                  className="text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    onReject && onReject(challenge);
                    onClose();
                  }}
                >
                  Reject Submission
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onValidate && onValidate(challenge);
                    onClose();
                  }}
                >
                  Validate Challenge
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onAssign && onAssign(challenge);
                onClose();
              }}
            >
              {challenge.assignedUniversity ? 'Re-assign Institution' : 'Assign to University'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailModal;
