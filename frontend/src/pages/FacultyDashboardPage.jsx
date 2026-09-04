import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { challengeService } from '../services/challengeService';
import { BookOpen, Users, Award, CheckCircle2, FileText, Compass } from 'lucide-react';

const FacultyDashboardPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoading(true);
      try {
        const res = await challengeService.getChallenges();
        if (res.data?.challenges) {
          setChallenges(res.data.challenges);
        }
      } catch (err) {
        console.error('Failed to load faculty projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssigned();
  }, []);

  const mentoredProjects = challenges.filter((c) => c.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gov-maroon-surface border border-gov-maroon-border p-4 rounded-sm flex items-start space-x-3">
        <BookOpen className="w-5 h-5 text-gov-maroon flex-shrink-0 mt-0.5" />
        <div className="text-xs font-serif">
          <strong className="text-gov-maroon font-bold">Faculty Academic Supervision: </strong>
          Mentor multidisciplinary student cohorts addressing registered Delhi municipal problems. Review sprint milestones, approve hardware/software deliverables, and certify state innovation credits.
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card accent="maroon" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Mentored Cohorts</div>
              <div className="text-2xl font-serif font-bold text-gov-navy mt-1">{mentoredProjects.length || 2}</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-gov-maroon-surface text-gov-maroon flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Active Students</div>
              <div className="text-2xl font-serif font-bold text-blue-700 mt-1">8 Students</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Milestone Approvals</div>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">5 Reviewed</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Research Grant Pool</div>
              <div className="text-2xl font-serif font-bold text-amber-700 mt-1">₹ 23.5 Lakh</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cohort Supervision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            accent="maroon"
            title="Supervised Student Engineering Cohorts"
            subtitle="Undergraduate and postgraduate research teams assigned to Delhi municipal challenges"
          >
            {loading ? (
              <div className="py-8 text-center text-xs font-serif text-gov-text-muted">
                Loading supervised cohorts...
              </div>
            ) : mentoredProjects.length === 0 ? (
              <div className="py-8 text-center text-xs font-serif text-gov-text-muted">
                No active projects assigned yet.
              </div>
            ) : (
              <div className="divide-y divide-gov-border">
                {mentoredProjects.map((p) => (
                  <div key={p._id} className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-gov-navy text-sm">
                        {p.title}
                      </h4>
                      <Badge variant="gold">In Progress</Badge>
                    </div>
                    <p className="text-xs font-serif text-gov-text-secondary leading-relaxed">
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-serif text-gov-text-muted">
                        District: {p.district} &bull; Category: {p.category}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => alert(`Reviewing deliverables for: ${p.title}`)}
                      >
                        Approve Milestone
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Faculty Advisory Actions" accent="none">
            <p className="text-xs font-serif text-gov-text-secondary leading-relaxed mb-4">
              Faculty members evaluate technical feasibility, ensure ethical guidelines, and liaise with Delhi municipal departments.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => alert('Certificate issuance dialog.')}
              >
                Certify Student Innovation Credits
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => alert('Research grant report downloaded.')}
                icon={FileText}
              >
                Download Grant Utilization Report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboardPage;
