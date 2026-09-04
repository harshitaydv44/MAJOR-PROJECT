import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { industryService } from '../../services/industryService';
import { notificationService } from '../../services/notificationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import {
  Briefcase,
  Award,
  IndianRupee,
  Cpu,
  Send,
  Bell,
  RefreshCw,
  Compass,
  CheckCircle2
} from 'lucide-react';

/**
 * Supported Projects Page (/industry/projects)
 */
export const IndustryProjectsPage = () => {
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProj = async () => {
      setLoading(true);
      try {
        const res = await industryService.getPartnerships();
        setPartnerships(res.data?.partnerships || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProj();
  }, []);

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">Co-Sponsored Innovation Projects</h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            University prototypes receiving active corporate sponsorship, engineering mentorship, or pilot facilities.
          </p>
        </div>
        <Link to="/industry/opportunities">
          <Button variant="primary" size="sm" icon={Compass} className="bg-gov-maroon text-white">
            Discover More Opportunities
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingState message="Loading supported corporate projects..." />
      ) : partnerships.length === 0 ? (
        <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted">
          No corporate projects active yet. Browse innovation opportunities to co-sponsor a prototype.
        </Card>
      ) : (
        <div className="space-y-4">
          {partnerships.map((p) => (
            <Card key={p._id} accent="maroon" className="p-5">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gov-navy text-sm">{p.project?.title || 'Innovation Project'}</span>
                  <Badge variant="navy">Status: {p.status}</Badge>
                </div>
                <p className="text-gov-text-secondary">{p.description}</p>
                <div className="pt-2 border-t border-gov-border text-[11px] text-gov-text-muted flex justify-between">
                  <span>University: <strong>{p.university?.name}</strong></span>
                  <span>Modality: <strong>{p.supportType}</strong></span>
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
 * Mentorship Page (/industry/mentorship)
 */
export const IndustryMentorshipPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Corporate Engineering Mentorship</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Senior industry advisors providing architecture reviews and production hardening for student teams.
        </p>
      </div>
      <Card accent="none" className="p-6 text-xs text-gov-text-secondary">
        <p>Active mentorship sessions, sprint reviews, and technical evaluation committees.</p>
      </Card>
    </div>
  );
};

/**
 * Funding Page (/industry/funding)
 */
export const IndustryFundingPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">CSR Grants & Prototyping Sponsorship</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Disbursed innovation grants, milestone-based payments, and municipal CSR accounting statements.
        </p>
      </div>
      <Card accent="none" className="p-6 text-xs text-gov-text-secondary">
        <p>Financial ledger, grant agreements, and tax compliance certificates under GNCTD Innovation Cell.</p>
      </Card>
    </div>
  );
};

/**
 * Prototyping Page (/industry/prototyping)
 */
export const IndustryPrototypingPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Industrial Fabrication & Lab Access</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Cleanroom permits, rapid PCB assembly bookings, and high-voltage bench testing scheduling.
        </p>
      </div>
      <Card accent="none" className="p-6 text-xs text-gov-text-secondary">
        <p>Facility utilization schedules and prototype fabrication logs.</p>
      </Card>
    </div>
  );
};

/**
 * Pilot Projects Page (/industry/pilot-projects)
 */
export const IndustryPilotProjectsPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Live Delhi Ward Pilot Testbeds</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Field site permits, municipal utility testbed integrations, and citizen ground trials.
        </p>
      </div>
      <Card accent="none" className="p-6 text-xs text-gov-text-secondary">
        <p>Ward trial logs, sensor calibration field reports, and MCD/PWD co-sign approvals.</p>
      </Card>
    </div>
  );
};

/**
 * Notifications Page (/industry/notifications)
 */
export const IndustryNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchNotifs();
  }, []);

  return (
    <div className="space-y-6 font-serif">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Corporate Alerts & Bulletins</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Official partnership confirmations, university meeting requests, and state grant notifications.
        </p>
      </div>

      <Card accent="none">
        {loading ? (
          <div className="py-8 text-center text-xs text-gov-text-muted">Loading notices...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-gov-text-muted">No corporate notices found.</div>
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
