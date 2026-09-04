import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import Button from './Button';
import { MapPin, Calendar, ArrowRight, Building } from 'lucide-react';

const ChallengeCard = ({ challenge }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gov-border rounded-sm p-5 shadow-gov-card hover:shadow-gov-hover hover:border-gov-maroon transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold text-gov-maroon bg-gov-maroon-surface px-2 py-0.5 rounded-xs">
            {challenge.code || `DEL-${challenge._id?.slice(-4).toUpperCase()}`}
          </span>
          <StatusBadge status={challenge.status} />
        </div>

        {/* Title */}
        <h3 className="text-base font-serif font-bold text-gov-navy leading-snug mb-2 group-hover:text-gov-maroon transition-colors line-clamp-2">
          {challenge.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-xs font-serif text-gov-text-secondary leading-relaxed line-clamp-3 mb-4">
          {challenge.description}
        </p>

        {/* Details Meta */}
        <div className="space-y-1.5 pt-3 border-t border-gov-border text-[11px] font-serif text-gov-text-muted">
          <div className="flex items-center">
            <span className="font-semibold text-gov-navy mr-1.5">Category:</span>
            <span>{challenge.category}</span>
          </div>

          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 text-gov-maroon mr-1 flex-shrink-0" />
            <span className="truncate">{challenge.district} {challenge.location?.landmark ? `• ${challenge.location.landmark}` : ''}</span>
          </div>

          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 text-gov-text-muted mr-1 flex-shrink-0" />
            <span>Submitted on {formatDate(challenge.createdAt)}</span>
          </div>

          {challenge.assignedUniversity && (
            <div className="flex items-center text-gov-navy font-medium pt-1">
              <Building className="w-3.5 h-3.5 text-blue-700 mr-1 flex-shrink-0" />
              <span className="truncate">Assigned to: {challenge.assignedUniversity.name || 'University Partner'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="pt-4 mt-4 border-t border-gov-border">
        <Link to={`/client/challenges/${challenge._id}`} className="block">
          <Button variant="subtle" size="sm" fullWidth icon={ArrowRight}>
            View Full Progress
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ChallengeCard;
