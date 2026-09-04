import React, { useState, useEffect } from 'react';
import { industryService } from '../../services/industryService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import {
  Handshake,
  Award,
  IndianRupee,
  Cpu,
  Send,
  Heart,
  Layers,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building,
  GraduationCap
} from 'lucide-react';

const SUPPORT_TYPE_INFO = {
  EXPRESS_INTEREST: { label: 'Expression of Interest', icon: Heart, color: 'bg-stone-100 text-stone-800' },
  MENTORSHIP: { label: 'Mentorship', icon: Award, color: 'bg-purple-100 text-purple-800' },
  FUNDING: { label: 'Grant Funding', icon: IndianRupee, color: 'bg-emerald-100 text-emerald-800' },
  TECHNOLOGY: { label: 'Technology / Hardware', icon: Cpu, color: 'bg-blue-100 text-blue-800' },
  PROTOTYPING: { label: 'Prototyping Facility', icon: Layers, color: 'bg-indigo-100 text-indigo-800' },
  PILOT_SUPPORT: { label: 'Pilot Field Testing', icon: Send, color: 'bg-amber-100 text-amber-900 font-bold' }
};

const IndustryPartnershipsPage = () => {
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPartnerships = async () => {
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

  useEffect(() => {
    fetchPartnerships();
  }, []);

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Handshake className="w-4 h-4 text-gov-maroon" />
            <span>Corporate Collaboration Proposals</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Partnership Requests ({partnerships.length})
          </h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Status of corporate support proposals, grant funding allocations, testbed approvals, and field trials.
          </p>
        </div>

        <Button variant="subtle" size="sm" onClick={fetchPartnerships} icon={RefreshCw}>
          Refresh Requests
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading corporate partnership requests..." />
      ) : partnerships.length === 0 ? (
        <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
          <p className="font-bold text-gov-navy text-sm">No Partnership Requests Submitted</p>
          <p className="max-w-md mx-auto text-[11px]">
            Explore open innovation opportunities in the catalog to submit your organization's sponsorship or testbed support.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {partnerships.map((p) => {
            const typeInfo = SUPPORT_TYPE_INFO[p.supportType] || { label: p.supportType, icon: Handshake, color: 'bg-gray-100 text-gray-700' };
            const Icon = typeInfo.icon;
            return (
              <Card key={p._id} accent="navy" className="p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-2.5 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs flex items-center space-x-1 ${typeInfo.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      <span>{typeInfo.label}</span>
                    </span>

                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border ${
                      p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      p.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      p.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      Status: {p.status}
                    </span>
                  </div>

                  <span className="text-gov-text-muted text-[11px]">
                    Submitted on {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Project & University */}
                <div>
                  <h3 className="font-bold text-gov-navy text-base leading-snug">
                    {p.project?.title || 'Academic Innovation Project'}
                  </h3>
                  <div className="text-[11px] text-gov-maroon font-semibold mt-0.5 flex items-center">
                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                    <span>Partner Institution: {p.university?.name || 'Delhi University Lab'}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gov-text-secondary leading-relaxed">
                  {p.description}
                </p>

                {/* Resources Pledged */}
                {p.resourcesOffered && p.resourcesOffered.length > 0 && (
                  <div>
                    <span className="font-bold text-gov-navy uppercase text-[10px] block mb-1">
                      Pledged Resources & Testbeds
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {p.resourcesOffered.map((res, idx) => (
                        <span key={idx} className="bg-gov-sand-100 text-gov-navy border border-gov-border px-2 py-0.5 rounded-xs text-[10px] font-semibold">
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Details Bar */}
                <div className="pt-2 border-t border-gov-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-gov-text-muted">
                  <div>
                    Involvement Cadence: <strong>{p.expectedInvolvement}</strong>
                  </div>

                  {p.fundingAmount > 0 && (
                    <div className="font-bold text-emerald-800 text-xs">
                      Grant Committed: ₹{p.fundingAmount.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IndustryPartnershipsPage;
