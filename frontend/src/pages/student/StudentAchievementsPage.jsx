import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import studentService from '../../services/studentService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import {
  Award,
  CheckCircle2,
  Flag,
  Cpu,
  FlaskConical,
  Radio,
  MapPin,
  Building2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  Coins,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  FolderKanban
} from 'lucide-react';

const StudentAchievementsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const fetchAchievements = async () => {
    try {
      setErrorMsg('');
      const res = await studentService.getAchievements();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load verified student achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (loading) {
    return <LoadingState message="Fetching verified municipal innovation achievements & credit ledger..." />;
  }

  const counts = data?.counts || {};
  const achievements = data?.achievements || {};
  const totalCredits = data?.totalCredits || 0;
  const creditsMessage = data?.creditsMessage || 'Credits will appear after verified innovation activities.';

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-serif pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-gov-maroon" />
              <h1 className="text-xl font-bold text-gov-navy">Verified Innovation Achievements</h1>
            </div>
            <p className="text-xs text-gov-text-secondary mt-1">
              Official collegiate ledger of state-certified engineering prototypes, verified test trials, ward deployments, and academic innovation credentials.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Council Verified Ledger</span>
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Innovation Credits Spotlight (Strict Zero-Fake-Score Compliance) */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                Innovation Credits & Academic Standing
              </span>
            </div>

            {totalCredits > 0 ? (
              <div className="space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gov-maroon font-mono">
                    {totalCredits}
                  </span>
                  <span className="text-xs font-semibold text-gov-navy uppercase">
                    Verified Innovation Credits
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-sans font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Officially sanctioned by Samadhan Setu Innovation Council evaluation matrix.</span>
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs space-y-1">
                <div className="text-xs font-bold text-gov-navy">
                  {creditsMessage}
                </div>
                <p className="text-[11px] text-gov-text-muted">
                  Innovation credits are awarded upon completion of sprint milestones, faculty-supervised testing runs, and verified societal impact. No arbitrary scores are assigned.
                </p>
              </div>
            )}
          </div>

          {/* Credit Criteria Pill Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
              <div className="text-gov-text-muted text-[10px] uppercase font-bold">Milestones</div>
              <div className="font-bold text-gov-navy">+50 Credits / sprint</div>
            </div>
            <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
              <div className="text-gov-text-muted text-[10px] uppercase font-bold">Passed Tests</div>
              <div className="font-bold text-gov-navy">+100 Credits / trial</div>
            </div>
            <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
              <div className="text-gov-text-muted text-[10px] uppercase font-bold">Industry Partner</div>
              <div className="font-bold text-gov-navy">+200 Credits / co-dev</div>
            </div>
            <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
              <div className="text-gov-text-muted text-[10px] uppercase font-bold">Community Impact</div>
              <div className="font-bold text-gov-navy">+300 Credits / claim</div>
            </div>
            <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
              <div className="text-gov-text-muted text-[10px] uppercase font-bold">Complete Project</div>
              <div className="font-bold text-gov-navy">+500 Credits / handover</div>
            </div>
            <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs flex items-center justify-center text-center">
              <span className="text-[10px] text-gov-maroon font-semibold">Self-award strictly disabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Verified Outcomes Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gov-text-muted">
            <span className="text-[10px] uppercase font-bold">Completed Projects</span>
            <FolderKanban className="w-3.5 h-3.5 text-gov-maroon" />
          </div>
          <div className="text-2xl font-bold text-gov-navy">{counts.completedProjects || 0}</div>
          <div className="text-[10px] text-gov-text-muted">Lifecycle Handover Done</div>
        </div>

        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gov-text-muted">
            <span className="text-[10px] uppercase font-bold">Completed Milestones</span>
            <Flag className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gov-navy">{counts.completedMilestones || 0}</div>
          <div className="text-[10px] text-gov-text-muted">Verified by Faculty Mentor</div>
        </div>

        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gov-text-muted">
            <span className="text-[10px] uppercase font-bold">Active Prototypes</span>
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gov-navy">{counts.prototypes || 0}</div>
          <div className="text-[10px] text-gov-text-muted">Testing / Validated Stage</div>
        </div>

        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gov-text-muted">
            <span className="text-[10px] uppercase font-bold">Successful Tests</span>
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gov-navy">{counts.successfulTests || 0}</div>
          <div className="text-[10px] text-gov-text-muted">Passed Bench Trials</div>
        </div>

        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gov-text-muted">
            <span className="text-[10px] uppercase font-bold">Ward Pilots</span>
            <Radio className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gov-navy">{counts.pilots || 0}</div>
          <div className="text-[10px] text-gov-text-muted">Ground Field Trials</div>
        </div>

        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gov-text-muted">
            <span className="text-[10px] uppercase font-bold">Deployments</span>
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-gov-navy">{counts.deployments || 0}</div>
          <div className="text-[10px] text-gov-text-muted">Permanent Ward Handover</div>
        </div>

        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gov-text-muted">
            <span className="text-[10px] uppercase font-bold">Community Impact</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gov-navy">{counts.communityImpact || 0}</div>
          <div className="text-[10px] text-gov-text-muted">Verified Citizen Relief</div>
        </div>

        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gov-text-muted">
            <span className="text-[10px] uppercase font-bold">Startup Outcomes</span>
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-gov-navy">{counts.startupOutcomes || 0}</div>
          <div className="text-[10px] text-gov-text-muted">Corporate Partnerships</div>
        </div>
      </div>

      {/* 4. Detailed Verified Achievement Cards */}
      <div className="space-y-4">
        {/* Section A: Verified Prototypes */}
        <Card accent="none" title="Engineered & Validated Prototypes">
          {(achievements.prototypes || []).length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs italic">
              No prototype records in testing/validated status yet. Prototypes are logged from the project workspace.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {achievements.prototypes.map((pt, idx) => (
                <div key={idx} className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gov-navy text-xs">{pt.prototypeName}</span>
                    <Badge variant={pt.status === 'VALIDATED' ? 'emerald' : 'purple'}>
                      {pt.status}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-gov-text-muted flex items-center justify-between">
                    <span>Project: {pt.projectTitle}</span>
                    <span className="font-mono">{pt.version}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-1 border-t border-gov-border">
                    {pt.repositoryUrl && (
                      <a
                        href={pt.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gov-maroon hover:underline flex items-center space-x-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Source Repo</span>
                      </a>
                    )}
                    {pt.demoUrl && (
                      <a
                        href={pt.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline flex items-center space-x-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    <Link
                      to={`/projects/${pt.projectId}`}
                      className="ml-auto text-gov-navy hover:underline text-[11px] font-semibold"
                    >
                      Open Workspace &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section B: Passed Testing Trials */}
        <Card accent="none" title="Empirical Testing Trials Verified by Faculty">
          {(achievements.successfulTests || []).length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs italic">
              No passed test trials recorded yet. Trials appear after faculty evaluation in the testing matrix.
            </div>
          ) : (
            <div className="divide-y divide-gov-border text-xs">
              {achievements.successfulTests.map((t, idx) => (
                <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-gov-navy">{t.testName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-mono font-bold">
                        PASSED
                      </span>
                    </div>
                    <div className="text-[11px] text-gov-text-muted">
                      Evaluated by: <strong>{t.reviewedByName}</strong> &bull; Project: {t.projectTitle}
                    </div>
                  </div>

                  <Link
                    to={`/projects/${t.projectId}?tab=testing`}
                    className="inline-flex items-center space-x-1 text-xs text-gov-maroon hover:underline font-semibold"
                  >
                    <span>View Evidence</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section C: Completed Milestones */}
        <Card accent="none" title="Supervised Milestones Completed">
          {(achievements.completedMilestones || []).length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs italic">
              No completed milestones registered yet. Milestones are marked complete upon faculty review.
            </div>
          ) : (
            <div className="divide-y divide-gov-border text-xs">
              {achievements.completedMilestones.map((m, idx) => (
                <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Flag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-bold text-gov-navy">{m.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-mono font-bold">
                        100% COMPLETE
                      </span>
                    </div>
                    <div className="text-[11px] text-gov-text-muted">
                      Project: {m.projectTitle} &bull; Verified: {new Date(m.completedDate).toLocaleDateString('en-IN')}
                    </div>
                    {m.deliverables && m.deliverables.length > 0 && (
                      <div className="text-[11px] text-gov-text-secondary">
                        Deliverables: {m.deliverables.join(', ')}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/projects/${m.projectId}?tab=milestones`}
                    className="inline-flex items-center space-x-1 text-xs text-gov-maroon hover:underline font-semibold"
                  >
                    <span>Open Milestone</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section D: Startup Outcomes & Corporate Partnerships */}
        <Card accent="none" title="Industry Co-Development & Startup Partnerships">
          {(achievements.startupOutcomes || []).length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs italic">
              No active industry partnerships yet. Outreach can be initiated through the Industry Collaboration directory.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {achievements.startupOutcomes.map((st, idx) => (
                <div key={idx} className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gov-navy">{st.company}</span>
                    <Badge variant="emerald">{st.status}</Badge>
                  </div>
                  <div className="text-[11px] text-gov-text-muted">
                    Support Type: <strong>{st.supportType}</strong>
                    {st.assignedMentor && ` &bull; Mentor: ${st.assignedMentor}`}
                  </div>
                  <div className="text-right pt-1 border-t border-gov-border">
                    <Link
                      to="/student/industry"
                      className="text-gov-maroon hover:underline text-[11px] font-semibold"
                    >
                      View Industry Agreement &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section E: Verified Community Impact */}
        <Card accent="none" title="Verified Municipal Societal Impact">
          {(achievements.communityImpact || []).length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs italic">
              No certified municipal impact reports submitted yet. Impact reports are registered upon municipal pilot handover.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {achievements.communityImpact.map((imp, idx) => (
                <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">{imp.projectTitle}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                      VERIFIED IMPACT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-gray-500 block">Citizens Benefited</span>
                      <span className="font-bold text-emerald-800 text-sm">
                        {(imp.peopleBenefited || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Municipal Wards</span>
                      <span className="font-semibold text-gov-navy">{imp.communitiesCovered}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentAchievementsPage;
