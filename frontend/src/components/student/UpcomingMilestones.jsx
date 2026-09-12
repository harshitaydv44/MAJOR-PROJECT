import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Flag, Calendar, Clock } from 'lucide-react';

const UpcomingMilestones = ({ milestones = [] }) => {
  if (!milestones || milestones.length === 0) {
    return (
      <Card accent="none" className="p-6">
        <h3 className="text-sm font-serif font-bold text-gov-navy mb-4">Upcoming Milestones</h3>
        <div className="text-center py-8 text-gov-text-muted text-xs font-serif">
          <Flag className="w-8 h-8 mx-auto mb-3 text-gov-text-secondary" />
          <p className="font-semibold text-gov-navy mb-1">No upcoming milestones.</p>
          <p>Upcoming milestones will appear here as your project progresses.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card accent="none" className="p-6">
      <h3 className="text-sm font-serif font-bold text-gov-navy mb-4">Upcoming Milestones</h3>
      
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const formattedDate = milestone.dueDate 
            ? new Date(milestone.dueDate).toLocaleDateString('en-IN')
            : '—';

          return (
            <div
              key={milestone._id || index}
              className="p-3 border border-gov-border rounded-sm bg-white space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-xs font-serif font-semibold text-gov-navy">
                    {milestone.title || '—'}
                  </h4>
                  {milestone.description && (
                    <p className="text-[11px] text-gov-text-secondary mt-1">{milestone.description}</p>
                  )}
                </div>
                <Badge variant={milestone.status === 'COMPLETED' ? 'emerald' : 'navy'}>
                  {milestone.status || 'NOT_STARTED'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-[10px] text-gov-text-muted">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </div>
                {milestone.progress !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{milestone.progress}% Complete</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default UpcomingMilestones;
