import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  MapPin,
  AlertCircle,
  Calendar,
  Building2,
  Target,
  ArrowRight,
  Heart
} from 'lucide-react';

const ChallengeCard = ({ challenge, activeTab, onExpressInterest }) => {
  const {
    _id,
    code,
    title,
    description,
    category,
    district,
    priority,
    status,
    createdAt,
    assignedUniversity,
    hasExpressedInterest,
    interestStatus,
    tags,
    aiRecommendedExpertise,
    aiSummary,
    impact
  } = challenge;

  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-IN')
    : '—';

  const canExpressInterest = (status === 'VALIDATED' || status === 'ASSIGNED') && !hasExpressedInterest;
  const interestPending = interestStatus === 'PENDING';
  const interestAccepted = interestStatus === 'ACCEPTED';
  const interestRejected = interestStatus === 'REJECTED';

  const getPriorityColor = (p) => {
    switch ((p || '').toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gov-text-secondary bg-gov-sand-100 border-gov-border';
    }
  };

  // Combine tags and recommended expertise for required skills
  const skills = [
    ...(Array.isArray(tags) ? tags : []),
    ...(Array.isArray(aiRecommendedExpertise) ? aiRecommendedExpertise : [])
  ].filter(Boolean);

  const problemSummary = aiSummary?.problem || description;
  const expectedOutcome = aiSummary?.expectedOutcome || impact || 'Measurable community improvement and technical validation.';

  return (
    <Card accent="none" className="p-5 flex flex-col justify-between h-full">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-serif font-bold text-gov-maroon uppercase tracking-wider">
                {code || 'DEL'}
              </span>
              <Badge variant="navy">{category}</Badge>
            </div>
            <h3 className="text-base font-serif font-bold text-gov-navy leading-snug">
              {title}
            </h3>
          </div>
          {priority && (
            <div className={`px-2 py-0.5 border rounded-sm flex items-center space-x-1 text-[10px] font-serif font-semibold uppercase ${getPriorityColor(priority)}`}>
              <AlertCircle className="w-3 h-3" />
              <span>{priority}</span>
            </div>
          )}
        </div>

        {/* Problem Summary */}
        <div>
          <div className="text-[10px] font-serif font-semibold text-gov-text-muted uppercase mb-0.5">Problem Summary</div>
          <p className="text-xs font-serif text-gov-text-secondary line-clamp-2 leading-relaxed">
            {problemSummary}
          </p>
        </div>

        {/* Expected Outcome */}
        <div>
          <div className="text-[10px] font-serif font-semibold text-gov-text-muted uppercase mb-0.5">Expected Outcome</div>
          <p className="text-xs font-serif text-gov-navy line-clamp-1">
            {expectedOutcome}
          </p>
        </div>

        {/* Required Skills */}
        {skills.length > 0 && (
          <div>
            <div className="text-[10px] font-serif font-semibold text-gov-text-muted uppercase mb-1">Required Skills</div>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gov-sand-100 text-gov-navy border border-gov-border rounded-sm text-[10px] font-serif"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="text-[10px] font-serif text-gov-text-muted self-center">
                  +{skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Details: District, Date, University */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gov-border/60 text-[11px] font-serif text-gov-text-secondary">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-gov-maroon flex-shrink-0" />
            <span className="truncate">{district}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-gov-navy flex-shrink-0" />
            <span>Submitted: {formattedDate}</span>
          </div>
          <div className="flex items-center space-x-1.5 col-span-2 text-gov-navy font-medium">
            <Building2 className="w-3.5 h-3.5 text-gov-gold flex-shrink-0" />
            <span className="truncate">
              {assignedUniversity?.name || assignedUniversity?.organization || 'Pending University Allocation'}
            </span>
          </div>
        </div>

        {/* Status & Interest Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-gov-border/60">
          <Badge variant={status === 'VALIDATED' ? 'emerald' : status === 'RESOLVED' ? 'navy' : 'gold'}>
            {(status || '').replace('_', ' ')}
          </Badge>
          {interestPending && (
            <span className="text-[11px] font-serif text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm font-medium">
              Application Pending
            </span>
          )}
          {interestAccepted && (
            <span className="text-[11px] font-serif text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm font-medium">
              Interest Accepted
            </span>
          )}
          {interestRejected && (
            <span className="text-[11px] font-serif text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-sm font-medium">
              Application Closed
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gov-border">
        <Link to={`/student/challenges/${_id}`} className="flex-1">
          <Button variant="outline" size="sm" icon={ArrowRight} fullWidth>
            View Details
          </Button>
        </Link>
        {canExpressInterest && (
          <Button
            variant="primary"
            size="sm"
            icon={Heart}
            onClick={() => onExpressInterest(challenge)}
          >
            Express Interest
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ChallengeCard;
