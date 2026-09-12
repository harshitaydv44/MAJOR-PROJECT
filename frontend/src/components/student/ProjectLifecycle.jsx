import React from 'react';
import Card from '../common/Card';
import { CheckCircle, Circle } from 'lucide-react';

const LIFECYCLE_STAGES = [
  { id: 'CHALLENGE_ACCEPTED', label: 'Challenge Accepted' },
  { id: 'PROJECT_CREATED', label: 'Project Created' },
  { id: 'PROPOSAL_SUBMITTED', label: 'Proposal Submitted' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'RESEARCH', label: 'Research' },
  { id: 'PROTOTYPE', label: 'Prototype' },
  { id: 'TESTING', label: 'Testing' },
  { id: 'PILOT', label: 'Pilot' },
  { id: 'VALIDATION', label: 'Validation' },
  { id: 'DEPLOYMENT', label: 'Deployment' },
  { id: 'COMPLETED', label: 'Completed' }
];

const ProjectLifecycle = ({ currentStage }) => {
  const currentIndex = LIFECYCLE_STAGES.findIndex((stage) => stage.id === currentStage);

  return (
    <Card accent="none" className="p-6">
      <h3 className="text-sm font-serif font-bold text-gov-navy mb-4">Project Lifecycle</h3>
      
      <div className="space-y-3">
        {LIFECYCLE_STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-gov-maroon text-white flex items-center justify-center ring-2 ring-amber-400">
                    <Circle className="w-3 h-3 fill-current" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gov-sand-100 text-gov-text-muted flex items-center justify-center">
                    <Circle className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div
                className={`flex-1 text-xs font-serif ${
                  isCompleted
                    ? 'text-emerald-800'
                    : isCurrent
                    ? 'text-gov-maroon font-semibold'
                    : 'text-gov-text-muted'
                }`}
              >
                {stage.label}
                {isCurrent && <span className="ml-2 text-[10px] uppercase">(Current)</span>}
                {isCompleted && <span className="ml-2 text-[10px] text-emerald-600">✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ProjectLifecycle;
