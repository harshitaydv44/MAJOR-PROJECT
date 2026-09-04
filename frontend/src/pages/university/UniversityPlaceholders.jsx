import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { universityService } from '../../services/universityService';
import { notificationService } from '../../services/notificationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import {
  CheckSquare,
  Briefcase,
  Users2,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  Bell,
  RefreshCw,
  Plus
} from 'lucide-react';

/**
 * Assigned Challenges Page (/university/assigned)
 */
export const UniversityAssignedPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await universityService.getChallenges();
      setChallenges(res.data?.assignedChallenges || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Assigned Civic Challenges ({challenges.length})
          </h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Societal problems officially allocated by the Delhi Government to your university research cohorts.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={fetchData} icon={RefreshCw}>
            Refresh
          </Button>
          <Link to="/university/projects">
            <Button variant="primary" size="sm" icon={Briefcase} className="bg-gov-maroon text-white">
              View Innovation Projects
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading assigned challenges..." />
      ) : challenges.length === 0 ? (
        <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted">
          No challenges currently assigned to this institution.
        </Card>
      ) : (
        <div className="space-y-4">
          {challenges.map((c) => (
            <Card key={c._id} accent="maroon" className="p-5">
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border">
                      {c.code}
                    </span>
                    <StatusBadge status={c.status} />
                    <Badge variant="navy">{c.category}</Badge>
                  </div>
                  <span className="text-gov-text-muted text-[11px]">{c.district}</span>
                </div>

                <h3 className="text-base font-bold text-gov-navy">{c.title}</h3>
                <p className="text-gov-text-secondary leading-relaxed">{c.description}</p>

                <div className="pt-2 border-t border-gov-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-gov-text-muted">
                  <div>
                    {c.facultyLead?.name ? (
                      <span>
                        Faculty Lead: <strong>{c.facultyLead.name}</strong> ({c.facultyLead.department})
                      </span>
                    ) : (
                      <span className="text-amber-700 italic">Faculty lead pending designation</span>
                    )}
                  </div>

                  <Link to="/university/projects">
                    <Button variant="outline" size="sm" icon={Plus}>
                      Initiate Project for this Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Mentors Page (/university/mentors)
 */
export const UniversityMentorsPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Industry & Nodal Mentors</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Corporate leaders, retired civil engineers, and GNCTD technical advisors providing ground guidance.
        </p>
      </div>
      <Card accent="none" className="p-6 text-xs text-gov-text-secondary">
        <p>Ecosystem mentorship sessions and field milestone evaluation committees for Delhi ward pilots.</p>
      </Card>
    </div>
  );
};

/**
 * Research Page (/university/research)
 */
export const UniversityResearchPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Published Papers & Patent Applications</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Academic IP, patent filings, and peer-reviewed journals resulting from Delhi problem solving.
        </p>
      </div>
      <Card accent="none" className="p-6 text-xs text-gov-text-secondary">
        <p>Municipal patent filings, hardware schematics, and open data archives.</p>
      </Card>
    </div>
  );
};

/**
 * Notifications Page (/university/notifications)
 */
export const UniversityNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <div className="space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Institutional Notifications & Alerts</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Official communications from GNCTD, student team submissions, and grant disbursements.
        </p>
      </div>

      <Card accent="none">
        {loading ? (
          <div className="py-8 text-center text-xs text-gov-text-muted">Loading notices...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-gov-text-muted">No academic notifications found.</div>
        ) : (
          <div className="divide-y divide-gov-border text-xs">
            {notifications.map((n) => (
              <div key={n._id} className="py-3.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-gov-navy">
                  <span>{n.title}</span>
                  <span className="text-gray-400 font-normal">
                    {new Date(n.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-gov-text-secondary leading-snug">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
