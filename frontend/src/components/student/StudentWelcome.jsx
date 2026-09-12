import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Badge from '../common/Badge';

const StudentWelcome = ({ student }) => {
  const { user } = useAuth();

  const displayName = student?.name || user?.name || 'Student';
  const universityName = student?.university?.name || student?.university?.organization || user?.organization || '—';
  const department = student?.department || '—';
  const year = student?.year || '—';

  return (
    <Card accent="gold" className="p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gov-navy">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm font-serif text-gov-text-secondary mt-2">
            Continue developing solutions that create measurable impact for Delhi communities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gov-border text-xs font-serif">
          <div>
            <span className="text-gov-text-muted">University:</span>{' '}
            <span className="font-semibold text-gov-navy">{universityName}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-gov-text-muted">Department:</span>{' '}
            <span className="font-semibold text-gov-navy">{department}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-gov-text-muted">Course:</span>{' '}
            <span className="font-semibold text-gov-navy">—</span>
          </div>
          <div>
            <span className="text-gov-text-muted">Academic Year:</span>{' '}
            <span className="font-semibold text-gov-navy">{year}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentWelcome;
