import React from 'react';
import Card from '../common/Card';
import {
  Briefcase,
  Target,
  Flag,
  CheckCircle,
  Users,
  Award
} from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, accent }) => (
  <Card accent={accent} className="p-4 flex flex-col justify-between h-full">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0 pr-2">
        <div className="text-[11px] font-serif text-gov-text-secondary uppercase tracking-wider">{title}</div>
        <div className="text-2xl font-serif font-bold text-gov-navy mt-1">{value}</div>
      </div>
      <div className="w-9 h-9 rounded-sm bg-gov-sand-100 text-gov-navy flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
    </div>
    {subtext && (
      <div className="text-[10px] font-serif text-gov-text-muted mt-2 pt-2 border-t border-gov-border/60 leading-tight">
        {subtext}
      </div>
    )}
  </Card>
);

const StudentStats = ({ stats }) => {
  const displayStats = stats || {
    activeProjects: 0,
    assignedChallenges: 0,
    pendingMilestones: 0,
    completedMilestones: 0,
    teamMembers: 0,
    innovationCredits: 0
  };

  const hasCredits = typeof displayStats.innovationCredits === 'number' && displayStats.innovationCredits > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard 
        title="Active Projects" 
        value={displayStats.activeProjects} 
        subtext={displayStats.activeProjects === 0 ? "No active projects yet." : `${displayStats.activeProjects} Active`}
        icon={Briefcase} 
        accent="none" 
      />
      <StatCard 
        title="Assigned Challenges" 
        value={displayStats.assignedChallenges} 
        subtext={displayStats.assignedChallenges === 0 ? "No challenges assigned yet." : `${displayStats.assignedChallenges} Assigned`}
        icon={Target} 
        accent="none" 
      />
      <StatCard 
        title="Pending Milestones" 
        value={displayStats.pendingMilestones} 
        subtext={displayStats.pendingMilestones === 0 ? "No upcoming milestones." : `${displayStats.pendingMilestones} In Progress`}
        icon={Flag} 
        accent="none" 
      />
      <StatCard 
        title="Completed Milestones" 
        value={displayStats.completedMilestones} 
        subtext={displayStats.completedMilestones === 0 ? "0 Completed" : `${displayStats.completedMilestones} Completed`}
        icon={CheckCircle} 
        accent="none" 
      />
      <StatCard 
        title="Team Members" 
        value={displayStats.teamMembers} 
        subtext={displayStats.teamMembers === 0 ? "No team assigned" : `${displayStats.teamMembers} Members`}
        icon={Users} 
        accent="none" 
      />
      <StatCard 
        title="Innovation Credits" 
        value={hasCredits ? displayStats.innovationCredits : 0} 
        subtext={hasCredits ? "Verified innovation credits" : "Credits will appear after verified innovation activities."}
        icon={Award} 
        accent="maroon" 
      />
    </div>
  );
};

export default StudentStats;
