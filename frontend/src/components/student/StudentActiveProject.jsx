import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Briefcase, Target, MapPin, GraduationCap, Users, Flag, Calendar, ArrowRight } from 'lucide-react';

const StudentActiveProject = ({ project }) => {
  if (!project) {
    return (
      <Card accent="none" className="p-8 text-center">
        <div className="text-gov-text-muted text-xs font-serif">
          <Briefcase className="w-8 h-8 mx-auto mb-3 text-gov-text-secondary" />
          <p className="font-semibold text-gov-navy mb-1">No active projects yet.</p>
          <p>You will see your active project here once assigned to a team.</p>
        </div>
      </Card>
    );
  }

  const formattedDeadline = project.deadline 
    ? new Date(project.deadline).toLocaleDateString('en-IN')
    : '—';

  return (
    <Card accent="gold" className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-serif font-bold text-gov-navy">{project.title || '—'}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-serif text-gov-text-secondary">
              {project.challenge ? (
                <div className="flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>{project.challenge}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-gov-text-muted">
                  <Target className="w-3.5 h-3.5" />
                  <span>No challenges assigned yet.</span>
                </div>
              )}
              {project.category && (
                <Badge variant="navy">{project.category}</Badge>
              )}
              {project.district && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{project.district}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="gold">{project.status || '—'}</Badge>
        </div>

        {/* Progress */}
        {project.progress !== undefined && (
          <div>
            <div className="flex justify-between text-xs font-serif mb-1">
              <span className="text-gov-text-secondary">Overall Progress</span>
              <span className="font-semibold text-gov-navy">{project.progress}%</span>
            </div>
            <div className="w-full bg-gov-sand-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gov-maroon h-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gov-border text-xs font-serif">
          <div>
            <div className="flex items-center space-x-1 text-gov-text-muted">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculty Mentor</span>
            </div>
            <div className="font-semibold text-gov-navy mt-1">{project.mentor || '—'}</div>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gov-text-muted">
              <Users className="w-3.5 h-3.5" />
              <span>Team Size</span>
            </div>
            <div className="font-semibold text-gov-navy mt-1">{project.teamSize || '—'}</div>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gov-text-muted">
              <Flag className="w-3.5 h-3.5" />
              <span>Next Milestone</span>
            </div>
            <div className="font-semibold text-gov-navy mt-1">{project.nextMilestone || '—'}</div>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gov-text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span>Deadline</span>
            </div>
            <div className="font-semibold text-gov-navy mt-1">{formattedDeadline}</div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-4 border-t border-gov-border">
          <Link to={`/projects/${project._id}`}>
            <Button variant="primary" size="sm" icon={ArrowRight} fullWidth>
              Open Project Workspace
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default StudentActiveProject;
