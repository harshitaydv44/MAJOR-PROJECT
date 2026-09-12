import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  Briefcase,
  Target,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Crown
} from 'lucide-react';

const STAGE_STYLES = {
  CHALLENGE_ACCEPTED: 'bg-stone-100 text-stone-700 border-stone-300',
  PROJECT_CREATED: 'bg-stone-100 text-stone-700 border-stone-300',
  PROPOSAL_SUBMITTED: 'bg-amber-50 text-amber-800 border-amber-300',
  APPROVED: 'bg-blue-50 text-blue-800 border-blue-300',
  RESEARCH: 'bg-indigo-50 text-indigo-800 border-indigo-300',
  PROTOTYPE: 'bg-purple-50 text-purple-800 border-purple-300',
  TESTING: 'bg-amber-50 text-amber-800 border-amber-300',
  PILOT: 'bg-cyan-50 text-cyan-800 border-cyan-300',
  VALIDATION: 'bg-teal-50 text-teal-800 border-teal-300',
  DEPLOYMENT: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  COMPLETED: 'bg-emerald-100 text-emerald-900 border-emerald-300'
};

const ProjectCard = ({ project }) => {
  const {
    _id,
    title,
    challenge,
    category,
    district,
    currentStage,
    stageLabel,
    progress = 0,
    facultyMentor,
    teamSize = 1,
    isTeamLead = false,
    userRole,
    nextMilestone,
    nextDeadline,
    lastUpdated
  } = project;

  const formattedUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '—';

  const formattedDeadline = nextDeadline
    ? new Date(nextDeadline).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : null;

  const stageBadgeStyle = STAGE_STYLES[currentStage] || 'bg-stone-100 text-stone-700 border-stone-200';

  return (
    <Card accent="none" className="p-5 flex flex-col justify-between h-full bg-white hover:border-gov-maroon/50 transition-colors">
      <div className="space-y-3">
        {/* Top Header: Code, Badges, Stage */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-serif font-bold text-gov-maroon uppercase tracking-wider">
                {challenge?.code || 'DEL-PROJ'}
              </span>
              <span className="text-gov-border">&bull;</span>
              <Badge variant="navy">{category || 'Civic Technology'}</Badge>
              {isTeamLead && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-serif font-semibold bg-amber-50 text-amber-800 border border-amber-300 rounded-sm">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Team Lead</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-serif font-bold text-gov-navy leading-snug">
              {title}
            </h3>
          </div>

          <span
            className={`px-2.5 py-1 text-[11px] font-serif font-semibold border rounded-xs whitespace-nowrap shrink-0 ${stageBadgeStyle}`}
          >
            {stageLabel || currentStage?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Linked Challenge Title */}
        <div className="p-2.5 bg-gov-sand-50/70 border border-gov-border/70 rounded-xs">
          <div className="text-[10px] font-serif font-semibold text-gov-text-muted uppercase">
            Civic Challenge
          </div>
          <p className="text-xs font-serif font-medium text-gov-navy line-clamp-1 mt-0.5">
            {challenge?.title || 'Delhi Municipal Grievance Challenge'}
          </p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-serif mb-1">
            <span className="text-gov-text-muted">Lifecycle Progress</span>
            <span className="font-bold text-gov-navy">{progress}%</span>
          </div>
          <div className="w-full bg-gov-sand-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gov-maroon h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* Meta Grid: District, Faculty Mentor, Team Size */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gov-border/60 text-xs font-serif text-gov-text-secondary">
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-gov-maroon shrink-0" />
            <span className="truncate">{district || 'Central Delhi'}</span>
          </div>
          <div className="flex items-center space-x-1.5 truncate">
            <Users className="w-3.5 h-3.5 text-gov-navy shrink-0" />
            <span>
              {teamSize} Member{teamSize === 1 ? '' : 's'}
              {userRole ? ` (${userRole})` : ''}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 col-span-2 text-gov-navy truncate">
            <GraduationCap className="w-3.5 h-3.5 text-gov-gold shrink-0" />
            <span className="truncate">
              {facultyMentor?.name || 'Faculty Mentor Assigned'}
              {facultyMentor?.department ? ` • ${facultyMentor.department}` : ''}
            </span>
          </div>
        </div>

        {/* Next Milestone & Deadline */}
        <div className="pt-2 border-t border-gov-border/60 space-y-1 text-xs font-serif">
          <div className="flex items-start space-x-1.5">
            <Target className="w-3.5 h-3.5 text-gov-navy shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gov-text-muted uppercase block">Next Milestone</span>
              <p className="text-xs font-medium text-gov-navy truncate">
                {nextMilestone || 'All milestones completed'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gov-text-muted pt-1">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Deadline:{' '}
                {formattedDeadline ? (
                  <strong className="text-gov-navy font-semibold">{formattedDeadline}</strong>
                ) : (
                  <span className="italic">No pending deadline</span>
                )}
              </span>
            </div>
            <div>Updated: {formattedUpdated}</div>
          </div>
        </div>
      </div>

      {/* Action: Open Workspace */}
      <div className="pt-3 mt-3 border-t border-gov-border">
        <Link to={`/projects/${_id}`} className="block">
          <Button variant="primary" size="sm" icon={ExternalLink} fullWidth>
            Open Workspace
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ProjectCard;
