import React from 'react';
import Card from '../common/Card';
import { Activity, Clock } from 'lucide-react';

const RecentActivity = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card accent="none" className="p-6">
        <h3 className="text-sm font-serif font-bold text-gov-navy mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-gov-text-muted text-xs font-serif">
          <Activity className="w-8 h-8 mx-auto mb-3 text-gov-text-secondary" />
          <p>No recent activity</p>
        </div>
      </Card>
    );
  }

  return (
    <Card accent="none" className="p-6">
      <h3 className="text-sm font-serif font-bold text-gov-navy mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const formattedDate = activity.createdAt 
            ? new Date(activity.createdAt).toLocaleString('en-IN')
            : '—';

          return (
            <div
              key={activity._id || index}
              className="flex items-start space-x-3 p-3 border border-gov-border rounded-sm bg-white"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gov-sand-100 rounded-sm flex items-center justify-center">
                <Activity className="w-4 h-4 text-gov-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-serif font-semibold text-gov-navy truncate">
                  {activity.title || '—'}
                </h4>
                <p className="text-[11px] text-gov-text-secondary mt-1 line-clamp-2">
                  {activity.content || '—'}
                </p>
                {activity.createdAt && (
                  <div className="flex items-center space-x-1 mt-2 text-[10px] text-gov-text-muted">
                    <Clock className="w-3 h-3" />
                    <span>{formattedDate}</span>
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

export default RecentActivity;
