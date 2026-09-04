import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { projectService } from '../../services/projectService';
import socketService from '../../services/socket';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  Briefcase,
  Compass,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  FileText,
  Upload,
  Plus,
  Trash2,
  MessageSquare,
  Users2,
  GraduationCap,
  Building2,
  Award,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  X,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  FileCheck,
  Activity
} from 'lucide-react';

const LIFECYCLE_STAGES = [
  'CHALLENGE_ACCEPTED',
  'PROJECT_CREATED',
  'PROPOSAL_SUBMITTED',
  'APPROVED',
  'RESEARCH',
  'PROTOTYPE',
  'TESTING',
  'PILOT',
  'VALIDATION',
  'DEPLOYMENT',
  'COMPLETED'
];

const STAGE_LABELS = {
  CHALLENGE_ACCEPTED: 'Challenge Accepted',
  PROJECT_CREATED: 'Project Created',
  PROPOSAL_SUBMITTED: 'Proposal Submitted',
  APPROVED: 'Council Approved',
  RESEARCH: 'Academic Research',
  PROTOTYPE: 'Prototype Fabrication',
  TESTING: 'Benchtop Testing',
  PILOT: 'Live Ward Pilot',
  VALIDATION: 'Municipal Validation',
  DEPLOYMENT: 'Ward Deployment',
  COMPLETED: 'Project Completed'
};

const MILESTONE_STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', color: 'bg-stone-100 text-stone-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 font-bold' },
  DELAYED: { label: 'Delayed', color: 'bg-rose-100 text-rose-800 font-bold' }
};

const ProjectWorkspacePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('milestones');

  // Modals
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showInterveneModal, setShowInterveneModal] = useState(false);

  // Form states
  const [nextStage, setNextStage] = useState('');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    deliverables: ''
  });
  const [uploadDoc, setUploadDoc] = useState({
    title: '',
    file: null,
    milestoneId: ''
  });
  const [newComment, setNewComment] = useState('');
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });

  // Impact form
  const [impactData, setImpactData] = useState({
    peopleBenefited: '',
    deploymentLocation: '',
    communitiesCovered: '',
    cost: '',
    outcome: '',
    technologyTransferred: '',
    patentIpInfo: '',
    startupCreated: '',
    scalabilityPotential: ''
  });

  // Admin Intervention form
  const [interveneData, setInterveneData] = useState({
    targetStage: '',
    interventionNotes: '',
    action: 'Executive Override'
  });

  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjectById(id);
      const proj = res.data?.project;
      setProject(proj);
      if (proj.impactOutcome) {
        setImpactData({
          peopleBenefited: proj.impactOutcome.peopleBenefited || '',
          deploymentLocation: proj.impactOutcome.deploymentLocation || '',
          communitiesCovered: proj.impactOutcome.communitiesCovered || '',
          cost: proj.impactOutcome.cost || '',
          outcome: proj.impactOutcome.outcome || '',
          technologyTransferred: proj.impactOutcome.technologyTransferred || '',
          patentIpInfo: proj.impactOutcome.patentIpInfo || '',
          startupCreated: proj.impactOutcome.startupCreated || '',
          scalabilityPotential: proj.impactOutcome.scalabilityPotential || ''
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load project lifecycle workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();

    if (id) {
      socketService.joinProjectRoom(id);

      const unsubMsg = socketService.onProjectMessage((newComment) => {
        setProject((prev) => {
          if (!prev) return prev;
          if (prev.comments?.some((c) => c._id === newComment._id)) return prev;
          return {
            ...prev,
            comments: [...(prev.comments || []), newComment]
          };
        });
      });

      const unsubUpd = socketService.onProjectUpdate((newUpdate) => {
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            updates: [newUpdate, ...(prev.updates || [])]
          };
        });
        fetchProject();
      });

      return () => {
        unsubMsg();
        unsubUpd();
      };
    }
  }, [id]);

  const currentStageIndex = project ? LIFECYCLE_STAGES.indexOf(project.status) : 0;
  const canAdvanceStage =
    currentStageIndex >= 0 &&
    currentStageIndex < LIFECYCLE_STAGES.length - 1 &&
    ['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(user?.role);

  const defaultNextStage = canAdvanceStage ? LIFECYCLE_STAGES[currentStageIndex + 1] : '';

  // 1. Advance Stage Handler
  const handleTransitionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await projectService.transitionStage(id, {
        targetStage: nextStage || defaultNextStage,
        notes: transitionNotes
      });
      setActionSuccess(`Project successfully advanced to ${STAGE_LABELS[nextStage || defaultNextStage]}!`);
      setShowTransitionModal(false);
      setTransitionNotes('');
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Stage transition failed');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Add Milestone
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.title.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      await projectService.addMilestone(id, {
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim(),
        dueDate: newMilestone.dueDate || undefined,
        deliverables: newMilestone.deliverables.split(',').map((d) => d.trim()).filter(Boolean)
      });
      setActionSuccess('Sprint milestone added to project plan!');
      setShowMilestoneModal(false);
      setNewMilestone({ title: '', description: '', dueDate: '', deliverables: '' });
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add milestone');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Quick Update Milestone Status & Progress
  const handleUpdateMilestoneProgress = async (milestoneId, currentStatus, currentProgress) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    const nextProgress = nextStatus === 'COMPLETED' ? 100 : 50;

    try {
      await projectService.updateMilestone(id, milestoneId, {
        status: nextStatus,
        progress: nextProgress
      });
      fetchProject();
    } catch (err) {
      alert(err.message || 'Failed to update milestone');
    }
  };

  // 4. Upload Document / Deliverable
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadDoc.file) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', uploadDoc.file);
      formData.append('title', uploadDoc.title || uploadDoc.file.name);
      if (uploadDoc.milestoneId) formData.append('milestoneId', uploadDoc.milestoneId);

      await projectService.uploadDocument(id, formData);
      setActionSuccess('Deliverable document uploaded and encrypted in project vault!');
      setShowDocumentModal(false);
      setUploadDoc({ title: '', file: null, milestoneId: '' });
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Document upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Post Discussion Comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await projectService.addComment(id, { comment: newComment.trim() });
      setNewComment('');
      fetchProject();
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    }
  };

  // 6. AI-Assisted Industry Matching
  const [industryRecLoading, setIndustryRecLoading] = useState(false);

  const handleGenerateIndustryRecommendations = async () => {
    setIndustryRecLoading(true);
    try {
      await projectService.recommendIndustries(id);
      await fetchProject();
      setActionSuccess('AI industry co-development recommendations generated!');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to generate industry recommendations');
    } finally {
      setIndustryRecLoading(false);
    }
  };

  const handleAcceptIndustryRecommendation = async (indId, indName) => {
    try {
      await projectService.acceptIndustryRecommendation(id, indId, `Onboarded through AI-assisted matching for ${indName}`);
      await fetchProject();
      setActionSuccess(`Corporate partner ${indName} onboarded successfully!`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to onboard industry partner');
    }
  };

  const handleIgnoreIndustryRecommendation = async (indId) => {
    try {
      await projectService.ignoreIndustryRecommendation(id, indId);
      await fetchProject();
    } catch (err) {
      alert(err.message || 'Failed to ignore recommendation');
    }
  };

  // 6. Register Verified Societal Impact
  const handleSubmitImpact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await projectService.submitImpactOutcome(id, impactData);
      setActionSuccess('Verified societal impact metrics submitted to State Innovation Council!');
      setShowImpactModal(false);
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit impact metrics');
    } finally {
      setSubmitting(false);
    }
  };

  // 7. Admin Intervention
  const handleAdminIntervene = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await projectService.adminIntervene(id, interveneData);
      setActionSuccess('State administrative intervention recorded and executed!');
      setShowInterveneModal(false);
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Admin intervention failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading project lifecycle workspace & collaboration matrix..." />;
  }

  if (!project) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Project Not Found or Access Restricted"
          message={errorMsg || "The requested innovation project could not be found or your account does not have authorization to view it."}
          onRetry={fetchProject}
          retryLabel="Retry Loading Project"
        />
        <div className="text-center mt-3">
          <Link to="/university/projects" className="text-gov-maroon underline text-xs">
            Return to Projects Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-serif max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-gov-maroon bg-gov-sand-50 px-2.5 py-0.5 rounded-xs border border-gov-border text-xs">
              [{project.challengeId?.code || 'DEL-PROJ'}]
            </span>
            <Badge variant="navy">{project.challengeId?.category || 'Civic Infrastructure'}</Badge>
            <span className="text-[11px] text-gov-text-muted">
              Location: <strong>{project.challengeId?.district || 'Delhi'}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="subtle" size="sm" onClick={fetchProject} icon={RefreshCw}>
              Refresh
            </Button>

            {user?.role === 'ADMIN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInterveneData({ targetStage: project.status, interventionNotes: '', action: 'Workflow Override' });
                  setShowInterveneModal(true);
                }}
                icon={Shield}
                className="border-amber-500 text-amber-900 hover:bg-amber-50"
              >
                Admin Intervene
              </Button>
            )}

            {canAdvanceStage && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setNextStage(defaultNextStage);
                  setShowTransitionModal(true);
                }}
                icon={Send}
                className="bg-gov-maroon hover:bg-gov-maroon-dark text-white"
              >
                Advance to {STAGE_LABELS[defaultNextStage]} &rarr;
              </Button>
            )}
          </div>
        </div>

        {/* Title & Progress Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gov-navy leading-snug">
              {project.title}
            </h1>
            <div className="text-xs text-gov-text-secondary flex flex-wrap items-center gap-2">
              <span>Institution: <strong>{project.universityId?.name}</strong></span>
              <span>&bull;</span>
              <span>Mentor: <strong>{project.mentor?.name || 'Designated Lead'}</strong></span>
              <span>&bull;</span>
              <span>Timeline: <strong>{project.timeline}</strong></span>
            </div>
          </div>

          {/* Dynamic Overall Progress Meter */}
          <div className="w-full md:w-64 bg-gov-sand-50 p-3 rounded-xs border border-gov-border text-xs">
            <div className="flex items-center justify-between font-bold text-gov-navy mb-1.5">
              <span>Overall Progress</span>
              <span className="text-gov-maroon text-sm">{project.overallProgress || 0}%</span>
            </div>
            <div className="w-full bg-gov-sand-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gov-maroon h-full transition-all duration-500 rounded-full"
                style={{ width: `${project.overallProgress || 0}%` }}
              />
            </div>
            <div className="text-[10px] text-gov-text-muted mt-1 text-right">
              Derived from {project.milestones?.length || 0} milestone(s)
            </div>
          </div>
        </div>

        {/* 11-Stage Horizontal Visual Pipeline Stepper */}
        <div className="pt-3 border-t border-gov-border">
          <span className="font-bold text-gov-navy uppercase text-[10px] tracking-wider block mb-2">
            11-Stage Project Lifecycle Pipeline
          </span>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-[900px] space-x-1">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage} className="flex-1 flex items-center">
                    <div
                      className={`flex-1 p-2 rounded-xs border text-center text-[10px] transition-colors ${
                        isCurrent
                          ? 'bg-gov-maroon text-white font-bold border-gov-maroon shadow-xs ring-2 ring-amber-400'
                          : isPassed
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                          : 'bg-white text-gray-400 border-gov-border'
                      }`}
                    >
                      <div className="truncate">{STAGE_LABELS[stage]}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">
                        {isPassed ? '✓ Complete' : isCurrent ? '● Active' : `Step ${idx + 1}`}
                      </div>
                    </div>
                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 mx-0.5 ${isPassed ? 'text-emerald-600' : 'text-gray-300'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs">
          {errorMsg}
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-1 border-b border-gov-border overflow-x-auto text-xs font-semibold">
        {[
          { id: 'milestones', label: `Milestones (${project.milestones?.length || 0})`, icon: Layers },
          { id: 'documents', label: `Deliverables & Vault (${project.documents?.length || 0})`, icon: FileText },
          { id: 'team', label: 'Stakeholders & Cohort', icon: Users2 },
          { id: 'updates', label: `Activity Timeline (${project.updates?.length || 0})`, icon: Activity },
          { id: 'comments', label: `Collaboration (${project.comments?.length || 0})`, icon: MessageSquare },
          { id: 'impact', label: 'Societal Impact & IP', icon: Sparkles }
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-xs flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? 'border-gov-maroon text-gov-maroon bg-white font-bold'
                  : 'border-transparent text-gov-navy hover:bg-gov-sand-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Milestones Board */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gov-text-secondary">
              Track progress, deliverables, and field verification schedules across innovation milestones.
            </span>
            {['UNIVERSITY', 'FACULTY', 'ADMIN'].includes(user?.role) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowMilestoneModal(true)}
                icon={Plus}
                className="bg-gov-maroon text-white"
              >
                Add Milestone
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {(project.milestones || []).map((m, idx) => {
              const statusInfo = MILESTONE_STATUS_CONFIG[m.status] || { label: m.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <Card key={m._id || idx} accent="none" className="p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gov-border pb-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-gov-maroon">M{idx + 1}</span>
                        <h4 className="font-bold text-gov-navy text-sm leading-snug">{m.title}</h4>
                      </div>
                      {m.description && (
                        <p className="text-xs text-gov-text-secondary mt-1">{m.description}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {['UNIVERSITY', 'FACULTY', 'ADMIN', 'STUDENT'].includes(user?.role) && (
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => handleUpdateMilestoneProgress(m._id, m.status, m.progress)}
                          title="Toggle completion status"
                        >
                          {m.status === 'COMPLETED' ? 'Mark In-Progress' : 'Mark Completed (100%)'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Slider / Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-gov-text-muted">
                      <span>Completion Progress</span>
                      <span className="font-bold text-gov-navy">{m.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gov-sand-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${m.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Deliverables checklist */}
                  {m.deliverables && m.deliverables.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-gov-navy uppercase block mb-1">
                        Deliverables Checklist
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.deliverables.map((deliv, dIdx) => (
                          <span
                            key={dIdx}
                            className="bg-gov-sand-100 text-gov-navy border border-gov-border px-2 py-0.5 rounded-xs text-[11px] flex items-center space-x-1"
                          >
                            <FileCheck className="w-3 h-3 text-emerald-700 mr-1" />
                            <span>{deliv}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates Bar */}
                  <div className="pt-2 border-t border-gov-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-gov-text-muted">
                    <div>
                      Due: <strong>{m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-IN') : 'TBD'}</strong>
                      {m.completedDate && (
                        <span className="text-emerald-700 ml-2 font-bold">
                          &bull; Completed {new Date(m.completedDate).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setUploadDoc({ ...uploadDoc, milestoneId: m._id, title: `${m.title} Deliverable` });
                        setShowDocumentModal(true);
                      }}
                      className="text-gov-maroon font-bold hover:underline flex items-center space-x-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Attach Deliverable Document</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Deliverables & Documents Vault */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gov-text-secondary">
              Cloudinary-backed cryptographic deliverable repository with uploaded schematics, reports, and certifications.
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowDocumentModal(true)}
              icon={Upload}
              className="bg-gov-maroon text-white"
            >
              Upload Deliverable
            </Button>
          </div>

          {(project.documents || []).length === 0 ? (
            <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
              <p className="font-bold text-gov-navy text-sm">No Deliverables Uploaded Yet</p>
              <p className="max-w-md mx-auto">
                Upload CAD schematics, laboratory reports, or municipal test agreements.
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowDocumentModal(true)} icon={Upload}>
                Upload First File
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.documents.map((doc, idx) => (
                <Card key={doc._id || idx} accent="navy" className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-gov-maroon flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gov-navy text-xs leading-snug truncate max-w-[240px]">
                          {doc.title}
                        </h4>
                        <span className="text-[10px] text-gray-500">{doc.fileType}</span>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gov-maroon hover:bg-gov-sand-100 rounded-xs border border-gov-border"
                      title="Open Document"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="pt-2 border-t border-gov-border flex items-center justify-between text-[10px] text-gov-text-muted">
                    <span>Uploaded by: <strong>{doc.uploaderName}</strong> ({doc.uploaderRole})</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Stakeholders & Cohort */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Faculty Mentor */}
          <Card accent="navy" title="Supervising Faculty Mentor">
            {project.mentor ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-gov-navy text-sm">{project.mentor.name}</div>
                <div className="text-gov-maroon font-semibold">{project.mentor.department}</div>
                <div className="text-gray-500 text-[11px]">Specialization: {project.mentor.specialization}</div>
                <div className="text-gray-500 text-[11px]">Email: {project.mentor.email}</div>
              </div>
            ) : (
              <p className="text-gray-400 italic text-xs">Supervising mentor pending assignment.</p>
            )}
          </Card>

          {/* Multidisciplinary Student Team */}
          <Card accent="maroon" title={`Student Innovation Cohort (${project.team?.name || 'Assigned Team'})`}>
            {project.team?.members && project.team.members.length > 0 ? (
              <div className="divide-y divide-gov-border">
                {project.team.members.map((m, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gov-navy">{m.student?.name || 'Student'}</div>
                      <div className="text-[10px] text-gray-500">{m.student?.department} &bull; {m.student?.year}</div>
                    </div>
                    <Badge variant="navy">{m.role}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-xs">Student team formation in progress.</p>
            )}
          </Card>

          {/* Industry Partners */}
          <Card accent="gold" title={`Corporate Co-Sponsors (${project.industryPartners?.length || 0})`}>
            {project.industryPartners && project.industryPartners.length > 0 ? (
              <div className="divide-y divide-gov-border">
                {project.industryPartners.map((ind, idx) => (
                  <div key={idx} className="py-2 space-y-1">
                    <div className="font-bold text-gov-navy">{ind.organization || ind.name}</div>
                    <div className="text-[11px] text-gray-500">{ind.email}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-xs">No corporate co-sponsors registered yet.</p>
            )}
          </Card>

          {/* AI-Assisted Industry Co-Development Matching */}
          <Card accent="gold" title="AI-Assisted Industry Co-Development Matching" className="lg:col-span-2">
            <div className="space-y-3 font-serif">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border pb-2">
                <div>
                  <div className="text-xs font-bold text-gov-navy">
                    Potential Corporate Sponsors & Pilot Deployment Partners
                  </div>
                  <p className="text-[11px] text-gov-text-secondary">
                    Recommended based on technical capability, CSR alignment and pilot testing infrastructure.
                  </p>
                </div>

                {['UNIVERSITY', 'ADMIN'].includes(user?.role) && (
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={handleGenerateIndustryRecommendations}
                    disabled={industryRecLoading}
                    icon={RefreshCw}
                  >
                    {industryRecLoading ? 'Analyzing...' : 'Find Industry Partners'}
                  </Button>
                )}
              </div>

              {(!project.aiRecommendedIndustries || project.aiRecommendedIndustries.length === 0) ? (
                <div className="p-4 bg-gov-sand-50 rounded-xs border border-gov-border text-center space-y-2">
                  <p className="text-xs text-gov-text-secondary italic">
                    No corporate partner recommendations generated yet for this project.
                  </p>
                  {['UNIVERSITY', 'ADMIN'].includes(user?.role) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleGenerateIndustryRecommendations}
                      disabled={industryRecLoading}
                      className="bg-gov-navy hover:bg-gov-navy-dark text-white text-xs"
                    >
                      Calculate Industry Matches
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {project.aiRecommendedIndustries.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xs border transition-colors ${
                        rec.status === 'ACCEPTED'
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : rec.status === 'IGNORED'
                          ? 'bg-gray-50/80 border-gray-200 opacity-60'
                          : 'bg-white border-gov-border hover:border-gov-navy'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-bold text-gov-navy text-xs sm:text-sm">
                            {rec.organizationName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gov-sand-100 text-gov-maroon border border-gov-border">
                            {rec.percentage}% Match
                          </span>
                          <span className="text-[11px] text-gray-500">
                            ({rec.organizationType} &bull; {rec.industrySector})
                          </span>
                          {rec.status === 'ACCEPTED' && (
                            <Badge variant="emerald" className="text-[9px]">
                              Onboarded Partner
                            </Badge>
                          )}
                          {rec.status === 'IGNORED' && (
                            <Badge variant="subtle" className="text-[9px]">
                              Ignored
                            </Badge>
                          )}
                        </div>

                        {rec.status === 'PENDING' && ['UNIVERSITY', 'ADMIN'].includes(user?.role) && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAcceptIndustryRecommendation(rec.industryId, rec.organizationName)}
                              className="bg-gov-navy hover:bg-gov-navy-dark text-white text-[11px] py-1 px-2.5"
                            >
                              Onboard Partner
                            </Button>
                            <Button
                              variant="subtle"
                              size="sm"
                              onClick={() => handleIgnoreIndustryRecommendation(rec.industryId)}
                              className="text-[11px] py-1 px-2.5"
                            >
                              Ignore
                            </Button>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 italic mt-1">
                        {rec.explainableSummary}
                      </p>

                      {rec.matchingReasons && rec.matchingReasons.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-gov-text-secondary list-disc list-inside">
                          {rec.matchingReasons.map((reason, rIdx) => (
                            <li key={rIdx} className="leading-snug">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  <div className="p-2.5 bg-amber-50/60 rounded-xs border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Human Discretion Mandatory:</strong> AI recommendations assist project coordinators and do not form binding contracts. Formal onboarding occurs upon mutual administrative consent.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Originating Challenge */}
          <Card accent="none" title="Originating Challenge & Civic Location">
            <div className="space-y-2 text-xs">
              <div className="font-bold text-gov-navy text-sm">
                [{project.challengeId?.code}] {project.challengeId?.title}
              </div>
              <p className="text-gov-text-secondary">{project.challengeId?.description}</p>
              <div className="pt-2 border-t border-gov-border text-[11px] text-gov-text-muted">
                District: <strong>{project.challengeId?.district}</strong> &bull; Priority: <strong>{project.challengeId?.priority}</strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Activity Timeline */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          <Card accent="none" title="Real-Time Project Activity Timeline">
            {(project.updates || []).length === 0 ? (
              <p className="text-gray-400 italic text-xs py-4 text-center">No activity updates logged yet.</p>
            ) : (
              <div className="divide-y divide-gov-border text-xs">
                {project.updates.map((upd, idx) => (
                  <div key={idx} className="py-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gov-maroon flex items-center space-x-1">
                        <Activity className="w-3.5 h-3.5 text-gov-maroon mr-1" />
                        <span>{upd.title}</span>
                      </span>
                      <span className="text-gray-400 font-normal">
                        {new Date(upd.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gov-text-secondary leading-snug">{upd.content}</p>
                    <div className="text-[10px] text-gray-500">
                      Logged by: <strong>{upd.userName}</strong> ({upd.userRole})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 5: Collaboration Comments */}
      {activeTab === 'comments' && (
        <div className="space-y-4 max-w-3xl">
          <Card accent="none" title="Multi-Stakeholder Collaboration Forum">
            <div className="divide-y divide-gov-border text-xs max-h-96 overflow-y-auto mb-4">
              {(project.comments || []).length === 0 ? (
                <p className="text-gray-400 italic text-xs py-6 text-center">No messages posted yet. Start the conversation below.</p>
              ) : (
                project.comments.map((c, idx) => (
                  <div key={idx} className="py-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gov-navy">
                        {c.userName} <span className="text-gray-400 font-normal">({c.userRole})</span>
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gov-text-secondary leading-relaxed bg-gov-sand-50 p-2 rounded-xs border border-gov-border">
                      {c.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="flex items-center space-x-2 pt-3 border-t border-gov-border">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post collaboration update, meeting note, or technical clarification..."
                className="flex-1 font-serif border border-gov-border rounded-xs px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-gov-navy"
              />
              <Button variant="primary" size="sm" type="submit" icon={Send} className="bg-gov-maroon text-white">
                Send
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Tab 6: Societal Impact & Verified IP */}
      {activeTab === 'impact' && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gov-text-secondary">
              Verified ground impact metrics, technology transfers, and municipal patents resulting from this innovation.
            </span>
            {['UNIVERSITY', 'ADMIN'].includes(user?.role) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowImpactModal(true)}
                icon={Sparkles}
                className="bg-emerald-700 text-white"
              >
                {project.impactOutcome?.isClaimed ? 'Edit Impact Report' : 'Register Verified Impact'}
              </Button>
            )}
          </div>

          {project.impactOutcome?.isClaimed ? (
            <Card accent="emerald" title="Verified Societal Impact & Technology Transfer Report">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xs">
                  <span className="font-bold text-emerald-900 uppercase text-[10px] block">
                    Citizens Benefited
                  </span>
                  <span className="text-2xl font-bold text-emerald-800">
                    {(project.impactOutcome.peopleBenefited || 0).toLocaleString('en-IN')}
                  </span>
                  <div className="text-[11px] text-emerald-900 mt-1">
                    Areas: {project.impactOutcome.communitiesCovered || 'Delhi municipal wards'}
                  </div>
                </div>

                <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs">
                  <span className="font-bold text-gov-navy uppercase text-[10px] block">
                    Total Implementation Cost
                  </span>
                  <span className="text-2xl font-bold text-gov-navy">
                    ₹{(project.impactOutcome.cost || 0).toLocaleString('en-IN')}
                  </span>
                  <div className="text-[11px] text-gov-text-muted mt-1">
                    Location: {project.impactOutcome.deploymentLocation}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <span className="font-bold text-gov-navy uppercase text-[10px] block">
                    Measurable Civic Outcome
                  </span>
                  <p className="text-gov-text-secondary leading-relaxed bg-white p-2.5 border border-gov-border rounded-xs">
                    {project.impactOutcome.outcome}
                  </p>
                </div>

                {project.impactOutcome.patentIpInfo && (
                  <div className="space-y-1">
                    <span className="font-bold text-gov-navy uppercase text-[10px] block">
                      Patent & Intellectual Property Information
                    </span>
                    <p className="text-gov-text-secondary p-2 bg-gov-sand-50 border border-gov-border rounded-xs">
                      {project.impactOutcome.patentIpInfo}
                    </p>
                  </div>
                )}

                {project.impactOutcome.technologyTransferred && (
                  <div className="space-y-1">
                    <span className="font-bold text-gov-navy uppercase text-[10px] block">
                      Technology Transferred / Licensee
                    </span>
                    <p className="text-gov-text-secondary p-2 bg-gov-sand-50 border border-gov-border rounded-xs">
                      {project.impactOutcome.technologyTransferred}
                    </p>
                  </div>
                )}

                {project.impactOutcome.startupCreated && (
                  <div className="space-y-1">
                    <span className="font-bold text-gov-navy uppercase text-[10px] block">
                      University Spin-off / Startup Created
                    </span>
                    <p className="text-gov-text-secondary p-2 bg-gov-sand-50 border border-gov-border rounded-xs">
                      {project.impactOutcome.startupCreated}
                    </p>
                  </div>
                )}

                {project.impactOutcome.scalabilityPotential && (
                  <div className="space-y-1">
                    <span className="font-bold text-gov-navy uppercase text-[10px] block">
                      Scalability & State-Wide Expansion Potential
                    </span>
                    <p className="text-gov-text-secondary p-2 bg-gov-sand-50 border border-gov-border rounded-xs">
                      {project.impactOutcome.scalabilityPotential}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
              <p className="font-bold text-gov-navy text-sm">Societal Impact Report Pending Registration</p>
              <p className="max-w-md mx-auto">
                Once the project reaches validation or deployment, authorized university leads can record verified people benefited and IP disclosures.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Modal 1: Advance Stage */}
      {showTransitionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Send className="w-5 h-5 text-gov-maroon" />
                <span>Advance Project Lifecycle Stage</span>
              </h3>
              <button onClick={() => setShowTransitionModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransitionSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
                <div className="text-gray-500 text-[11px]">Current Lifecycle Stage:</div>
                <div className="font-bold text-gov-navy text-sm">{STAGE_LABELS[project.status]}</div>
                <div className="text-gov-maroon font-bold text-xs mt-1">
                  &darr; Transitioning to: {STAGE_LABELS[nextStage || defaultNextStage]}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Transition Verification Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Summarize completed milestones and deliverables justifying stage advancement..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowTransitionModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Transitioning...' : `Confirm Advancement to ${STAGE_LABELS[nextStage || defaultNextStage]}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Milestone */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Layers className="w-5 h-5 text-gov-maroon" />
                <span>Add Sprint Milestone</span>
              </h3>
              <button onClick={() => setShowMilestoneModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="e.g. PCB telemetry benchtop testing"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Description & Deliverable Scope
                </label>
                <textarea
                  rows={2}
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="Scope of work..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Deliverables Checklist (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newMilestone.deliverables}
                  onChange={(e) => setNewMilestone({ ...newMilestone, deliverables: e.target.value })}
                  placeholder="e.g. Sensor test bench report, Firmware schematic"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowMilestoneModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Adding...' : 'Save Milestone'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Upload Deliverable Document */}
      {showDocumentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Upload className="w-5 h-5 text-gov-maroon" />
                <span>Upload Deliverable Document</span>
              </h3>
              <button onClick={() => setShowDocumentModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadDoc.title}
                  onChange={(e) => setUploadDoc({ ...uploadDoc, title: e.target.value })}
                  placeholder="e.g. Field Inspection Certification"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  File Attachment (PDF, DOC, PNG, JPEG) *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadDoc({ ...uploadDoc, file: e.target.files[0] })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDocumentModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Uploading to Vault...' : 'Upload Deliverable'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Verified Societal Impact Report */}
      {showImpactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <span>Register Verified Societal Impact Report</span>
              </h3>
              <button onClick={() => setShowImpactModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitImpact} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    Estimated Citizens Benefited *
                  </label>
                  <input
                    type="number"
                    required
                    value={impactData.peopleBenefited}
                    onChange={(e) => setImpactData({ ...impactData, peopleBenefited: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    Deployment Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={impactData.deploymentLocation}
                    onChange={(e) => setImpactData({ ...impactData, deploymentLocation: e.target.value })}
                    placeholder="e.g. Ghazipur Mandi Gate 2, East Delhi"
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Communities & Wards Covered
                </label>
                <input
                  type="text"
                  value={impactData.communitiesCovered}
                  onChange={(e) => setImpactData({ ...impactData, communitiesCovered: e.target.value })}
                  placeholder="e.g. Ghazipur Village, Anand Vihar, Mayur Vihar Phase 3"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Measurable Civic Outcome & Ground Relief *
                </label>
                <textarea
                  rows={2}
                  required
                  value={impactData.outcome}
                  onChange={(e) => setImpactData({ ...impactData, outcome: e.target.value })}
                  placeholder="e.g. 85% leachate odor reduction and 120 kg/day biogas generation for municipal trucks"
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    Patent / IP Information
                  </label>
                  <input
                    type="text"
                    value={impactData.patentIpInfo}
                    onChange={(e) => setImpactData({ ...impactData, patentIpInfo: e.target.value })}
                    placeholder="e.g. Indian Patent App # 20261109823"
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    Technology Transferred
                  </label>
                  <input
                    type="text"
                    value={impactData.technologyTransferred}
                    onChange={(e) => setImpactData({ ...impactData, technologyTransferred: e.target.value })}
                    placeholder="e.g. Licensed to MCD Waste Management Dept"
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowImpactModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-emerald-700 text-white">
                  {submitting ? 'Registering...' : 'Confirm Impact Report'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Admin Workflow Intervention */}
      {showInterveneModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-700" />
                <span>Delhi Innovation Council Administrative Intervention</span>
              </h3>
              <button onClick={() => setShowInterveneModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminIntervene} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Target Stage Override
                </label>
                <select
                  value={interveneData.targetStage}
                  onChange={(e) => setInterveneData({ ...interveneData, targetStage: e.target.value })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none font-semibold"
                >
                  {LIFECYCLE_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {STAGE_LABELS[st]} ({st})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Administrative Action Title
                </label>
                <input
                  type="text"
                  value={interveneData.action}
                  onChange={(e) => setInterveneData({ ...interveneData, action: e.target.value })}
                  placeholder="e.g. Stage Override, Fast-Track Pilot Permit"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Intervention Justification & Council Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={interveneData.interventionNotes}
                  onChange={(e) => setInterveneData({ ...interveneData, interventionNotes: e.target.value })}
                  placeholder="State reasons for executive workflow modification..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowInterveneModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-amber-700 text-white">
                  {submitting ? 'Executing...' : 'Execute Admin Intervention'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspacePage;
