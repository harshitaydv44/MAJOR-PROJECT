import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { challengeService } from '../services/challengeService';
import { GraduationCap, Users, BookOpen, Layers, PlusCircle, Search, CheckCircle2 } from 'lucide-react';

const UniversityDashboardPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await challengeService.getChallenges();
      if (res.data?.challenges) {
        setChallenges(res.data.challenges);
      }
    } catch (err) {
      console.error('Failed to load university challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleAssignCohort = async (challengeId) => {
    const lead = prompt('Enter Faculty Lead Name & Department (e.g. Dr. Rajesh Kumar, Dept of Civil Engg):');
    if (!lead) return;

    try {
      await challengeService.assignCohort(challengeId, {
        facultyLead: { name: lead, department: 'Engineering' },
        solutionNotes: 'University cohort officially deployed for prototype testing.'
      });
      setActionSuccess('Cohort assigned successfully! Project is now in progress.');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchChallenges();
    } catch (err) {
      alert(err.message || 'Failed to assign cohort');
    }
  };

  const assignedChallenges = challenges.filter((c) => c.status === 'in_progress' || c.status === 'assigned');
  const availableToClaim = challenges.filter((c) => c.status === 'verified');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gov-maroon-surface border border-gov-maroon-border p-4 rounded-sm flex items-start space-x-3">
        <GraduationCap className="w-5 h-5 text-gov-maroon flex-shrink-0 mt-0.5" />
        <div className="text-xs font-serif">
          <strong className="text-gov-maroon font-bold">University Research Hub: </strong>
          Discover verified civic challenges allocated by the Delhi Government, establish cross-departmental student research labs, and supervise deployable innovations.
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-serif rounded-sm flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {actionSuccess}
        </div>
      )}

      {/* University Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card accent="maroon" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Active Lab Projects</div>
              <div className="text-2xl font-serif font-bold text-gov-navy mt-1">{assignedChallenges.length}</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-gov-maroon-surface text-gov-maroon flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Verified Problems Available</div>
              <div className="text-2xl font-serif font-bold text-gov-maroon mt-1">{availableToClaim.length}</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-700 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Student Teams Formed</div>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">6 Cohorts</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Grant Backing</div>
              <div className="text-2xl font-serif font-bold text-amber-700 mt-1">₹ 29.5 Lakh</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Available Problem Bank & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Verified Delhi Societal Problem Bank"
            subtitle="Problems vetted by GNCTD awaiting multidisciplinary research cohort assignment"
          >
            {loading ? (
              <div className="py-8 text-center text-xs font-serif text-gov-text-muted">
                Loading problem statements...
              </div>
            ) : availableToClaim.length === 0 && assignedChallenges.length === 0 ? (
              <div className="py-8 text-center text-xs font-serif text-gov-text-muted">
                No active problem statements in the bank.
              </div>
            ) : (
              <div className="divide-y divide-gov-border">
                {availableToClaim.map((c) => (
                  <div key={c._id} className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-gov-navy text-sm">
                        {c.title}
                      </h4>
                      <Badge variant="navy">Ready for Adoption</Badge>
                    </div>
                    <p className="text-xs font-serif text-gov-text-secondary leading-relaxed">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs font-serif text-gov-text-muted">
                        District: <strong>{c.district}</strong> &bull; Category: {c.category}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAssignCohort(c._id)}
                      >
                        Adopt & Form Cohort
                      </Button>
                    </div>
                  </div>
                ))}

                {assignedChallenges.map((c) => (
                  <div key={c._id} className="py-4 space-y-2 bg-gov-sand-50/50 p-3 rounded-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-gov-navy text-sm">
                        {c.title}
                      </h4>
                      <Badge variant="gold">In Progress</Badge>
                    </div>
                    <p className="text-xs font-serif text-gov-text-secondary leading-relaxed">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs font-serif text-gov-text-muted">
                        Faculty Lead: <strong>{c.facultyLead?.name || 'Assigned to Faculty'}</strong> &bull; District: {c.district}
                      </div>
                      <span className="text-xs font-serif text-emerald-700 font-bold">
                        {c.milestones?.filter((m) => m.completed).length || 0} / {c.milestones?.length || 4} Milestones Met
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Academic Grant & Cohort Guidelines" accent="maroon">
            <p className="text-xs font-serif text-gov-text-secondary mb-4 leading-relaxed">
              Delhi State Innovation Policy permits dual-credit recognition for students contributing to registered municipal challenges.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => {
                  if (availableToClaim.length > 0) {
                    handleAssignCohort(availableToClaim[0]._id);
                  } else {
                    alert('All current verified problems have active cohorts.');
                  }
                }}
              >
                Adopt Highest Priority Challenge
              </Button>
              <Button variant="outline" size="sm" fullWidth onClick={fetchChallenges}>
                Refresh Problem Bank
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboardPage;
