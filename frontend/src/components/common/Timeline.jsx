import React from 'react';
import { CheckCircle2, Clock, AlertCircle, CircleDot } from 'lucide-react';

const defaultStages = [
  { status: 'SUBMITTED', title: 'Submitted', description: 'Citizen report logged with evidence' },
  { status: 'UNDER_REVIEW', title: 'Under Review', description: 'Technical screening by district innovation cell' },
  { status: 'VALIDATED', title: 'Validated', description: 'Vetted as official societal challenge' },
  { status: 'ASSIGNED', title: 'Assigned', description: 'Routed to partner university research lab' },
  { status: 'IN_PROGRESS', title: 'In Progress', description: 'Multidisciplinary cohort prototyping solution' },
  { status: 'SOLUTION_PROPOSED', title: 'Solution Proposed', description: 'Engineering blueprint & test bench review' },
  { status: 'PILOT_TESTING', title: 'Pilot Testing', description: 'Field trial at Delhi municipal site' },
  { status: 'RESOLVED', title: 'Resolved', description: 'Certified & deployed by state authority' }
];

const statusOrder = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'VALIDATED',
  'ASSIGNED',
  'IN_PROGRESS',
  'SOLUTION_PROPOSED',
  'PILOT_TESTING',
  'RESOLVED'
];

const Timeline = ({ currentStatus = 'SUBMITTED', events = [] }) => {
  const currentIndex = statusOrder.indexOf(currentStatus.toUpperCase());
  const isRejected = currentStatus.toUpperCase() === 'REJECTED';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Map events by status for fast comment lookup
  const eventMap = {};
  events.forEach((ev) => {
    eventMap[ev.status] = ev;
  });

  if (isRejected) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-sm flex items-start space-x-3 text-xs font-serif text-rose-800">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-rose-900">Challenge Submission Rejected</div>
          <p className="mt-1">
            This submission did not meet the Delhi State Innovation Council eligibility criteria or was identified as an operational duplication.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-gov-border ml-4 space-y-6 my-4 pl-6">
      {defaultStages.map((stage, idx) => {
        const isCompleted = currentIndex > idx;
        const isCurrent = currentIndex === idx;
        const isFuture = currentIndex < idx;

        const eventData = eventMap[stage.status];

        return (
          <div key={stage.status} className="relative group">
            {/* Step Icon Node */}
            <div
              className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                isCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : isCurrent
                  ? 'bg-gov-maroon border-gov-maroon text-white animate-pulse'
                  : 'bg-white border-gov-border text-gov-text-muted'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isCurrent ? (
                <CircleDot className="w-3.5 h-3.5" />
              ) : (
                <span className="text-[10px] font-mono">{idx + 1}</span>
              )}
            </div>

            {/* Stage Details */}
            <div className={`text-xs font-serif ${isFuture ? 'opacity-50' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4
                  className={`font-bold ${
                    isCurrent ? 'text-gov-maroon text-sm' : isCompleted ? 'text-gov-navy' : 'text-gov-text-muted'
                  }`}
                >
                  {stage.title}
                </h4>

                {eventData?.date && (
                  <span className="text-[11px] font-serif text-gov-text-muted">
                    {formatDate(eventData.date)}
                  </span>
                )}
              </div>

              <p className="text-gov-text-secondary text-[11px] mt-0.5 leading-relaxed">
                {eventData?.comment || stage.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
