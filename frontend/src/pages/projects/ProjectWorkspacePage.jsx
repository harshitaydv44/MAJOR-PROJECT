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
import ProposalSection from '../../components/student/ProposalSection';
import TeamSection from '../../components/student/TeamSection';
import FacultyMentorSection from '../../components/student/FacultyMentorSection';
import PrototypeSection from '../../components/student/PrototypeSection';
import TestingSection from '../../components/student/TestingSection';
import IndustrySection from '../../components/student/IndustrySection';
import DiscussionSection from '../../components/student/DiscussionSection';
import {
  Compass,
  AlertCircle,
  FileText,
  Users2,
  GraduationCap,
  Layers,
  FileCheck,
  Upload,
  Cpu,
  FlaskConical,
  Building2,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  X,
  ExternalLink,
  Shield,
  Activity,
  Lock,
  Check,
  AlertTriangle,
  Info,
  MapPin,
  Calendar,
  DollarSign,
  Award
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
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-800 font-bold' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 font-bold' },
  DELAYED: { label: 'Delayed', color: 'bg-rose-100 text-rose-800 font-bold' }
};

const WORKSPACE_TABS = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'problem', label: 'Problem', icon: AlertCircle },
  { id: 'proposal', label: 'Proposal', icon: FileText },
  { id: 'team', label: 'Team', icon: Users2 },
  { id: 'mentor', label: 'Faculty Mentor', icon: GraduationCap },
  { id: 'milestones', label: 'Milestones', icon: Layers },
  { id: 'deliverables', label: 'Deliverables', icon: FileCheck },
  { id: 'documents', label: 'Documents', icon: Upload },
  { id: 'prototype', label: 'Prototype', icon: Cpu },
  { id: 'testing', label: 'Testing', icon: FlaskConical },
  { id: 'industry', label: 'Industry', icon: Building2 },
  { id: 'discussion', label: 'Discussion', icon: MessageSquare },
  { id: 'impact', label: 'Impact', icon: Sparkles }
];

const ProjectWorkspacePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showUpdateMilestoneModal, setShowUpdateMilestoneModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showIndustryRequestModal, setShowIndustryRequestModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showInterveneModal, setShowInterveneModal] = useState(false);

  // Selected Milestone for update
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [milestoneUpdateForm, setMilestoneUpdateForm] = useState({
    status: 'IN_PROGRESS',
    progress: 50,
    deliverablesText: ''
  });

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

  // Proposal form
  const [proposalForm, setProposalForm] = useState({
    problemUnderstanding: '',
    proposedSolution: '',
    methodology: '',
    technology: '',
    timeline: '',
    expectedImpact: ''
  });

  // Industry collaboration request form
  const [industryRequestForm, setIndustryRequestForm] = useState({
    partnerName: '',
    areaOfInterest: 'Prototype Component Sourcing & Hardware Testing Access',
    message: ''
  });

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
  const [industryRecLoading, setIndustryRecLoading] = useState(false);

  const isStudent = user?.role === 'STUDENT';
  const isUniversity = user?.role === 'UNIVERSITY';
  const isFaculty = user?.role === 'FACULTY';
  const isAdmin = user?.role === 'ADMIN';

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjectById(id);
      const proj = res.data?.project;
      setProject(proj);

      if (proj) {
        if (proj.proposal) {
          setProposalForm({
            problemUnderstanding: proj.proposal.problemUnderstanding || '',
            proposedSolution: proj.proposal.proposedSolution || '',
            methodology: proj.proposal.methodology || '',
            technology: Array.isArray(proj.proposal.technology)
              ? proj.proposal.technology.join(', ')
              : proj.proposal.technology || '',
            timeline: proj.proposal.timeline || '',
            expectedImpact: proj.proposal.expectedImpact || ''
          });
        }
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
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load project lifecycle workspace');
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

  // 3. Open Milestone Update Modal
  const openMilestoneUpdate = (milestone) => {
    setSelectedMilestone(milestone);
    setMilestoneUpdateForm({
      status: milestone.status === 'COMPLETED' ? 'COMPLETED' : milestone.status || 'IN_PROGRESS',
      progress: milestone.progress || 0,
      deliverablesText: (milestone.deliverables || []).join(', ')
    });
    setShowUpdateMilestoneModal(true);
  };

  // 4. Submit Milestone Update (With Student Self-Approval Guard)
  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    // Student self-approval validation
    if (isStudent && (milestoneUpdateForm.status === 'COMPLETED' || Number(milestoneUpdateForm.progress) >= 100)) {
      setErrorMsg('Students cannot approve their own milestones. Only the Supervising Faculty Mentor or University Lead can verify 100% completion.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const deliverablesArray = milestoneUpdateForm.deliverablesText
        ? milestoneUpdateForm.deliverablesText.split(',').map((d) => d.trim()).filter(Boolean)
        : selectedMilestone.deliverables;

      await projectService.updateMilestone(id, selectedMilestone._id, {
        status: milestoneUpdateForm.status,
        progress: Number(milestoneUpdateForm.progress),
        deliverables: deliverablesArray
      });

      setActionSuccess(`Milestone "${selectedMilestone.title}" updated successfully!`);
      setShowUpdateMilestoneModal(false);
      setSelectedMilestone(null);
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update milestone');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Upload Document / Deliverable
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
      setActionSuccess('Deliverable document vaulted successfully!');
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

  // 6. Post Discussion Comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await projectService.addComment(id, { comment: newComment.trim() });
      setNewComment('');
      fetchProject();
      setActionSuccess('Comment posted to project collaboration thread');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post comment');
    }
  };

  // 7. Submit Proposal
  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const techArray = proposalForm.technology
        ? proposalForm.technology.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await projectService.submitProposal(id, {
        ...proposalForm,
        technology: techArray
      });

      setActionSuccess('Formal technical proposal submitted to Samadhan Setu Innovation Council!');
      setShowProposalModal(false);
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  // 8. Request Industry Collaboration
  const handleRequestIndustryCollaboration = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await projectService.requestIndustryCollaboration(id, industryRequestForm);
      setActionSuccess('Corporate co-development collaboration inquiry logged successfully!');
      setShowIndustryRequestModal(false);
      setIndustryRequestForm({
        partnerName: '',
        areaOfInterest: 'Prototype Component Sourcing & Hardware Testing Access',
        message: ''
      });
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit industry request');
    } finally {
      setSubmitting(false);
    }
  };

  // 9. AI-Assisted Industry Matching
  const handleGenerateIndustryRecommendations = async () => {
    setIndustryRecLoading(true);
    try {
      await projectService.recommendIndustries(id);
      await fetchProject();
      setActionSuccess('AI industry co-development recommendations refreshed!');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate industry recommendations');
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
      setErrorMsg(err.message || 'Failed to onboard industry partner');
    }
  };

  const handleIgnoreIndustryRecommendation = async (indId) => {
    try {
      await projectService.ignoreIndustryRecommendation(id, indId);
      await fetchProject();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to ignore recommendation');
    }
  };

  // 10. Register Verified Societal Impact
  const handleSubmitImpact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await projectService.submitImpactOutcome(id, impactData);
      setActionSuccess('Verified societal impact metrics registered with State Innovation Council!');
      setShowImpactModal(false);
      fetchProject();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit impact metrics');
    } finally {
      setSubmitting(false);
    }
  };

  // 11. Admin Intervention
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
      <div className="max-w-xl mx-auto py-12 font-serif">
        <ErrorState
          title="Project Not Found or Access Restricted"
          message={errorMsg || 'The requested innovation project could not be found or your account does not have authorization to view it.'}
          onRetry={fetchProject}
          retryLabel="Retry Loading Project"
        />
        <div className="text-center mt-3">
          <Link
            to={isStudent ? '/student/projects' : '/university/projects'}
            className="text-gov-maroon underline text-xs font-semibold"
          >
            &larr; Return to My Projects Directory
          </Link>
        </div>
      </div>
    );
  }

  // Derived helpers for Overview & Deliverables
  const milestonesList = project.milestones || [];
  const completedMilestones = milestonesList.filter((m) => m.status === 'COMPLETED').length;
  const nextPendingMilestone = milestonesList.find((m) => m.status !== 'COMPLETED');
  const allDeliverables = milestonesList.flatMap((m) =>
    (m.deliverables || []).map((d) => ({
      deliverable: d,
      milestoneId: m._id,
      milestoneTitle: m.title,
      milestoneStatus: m.status,
      dueDate: m.dueDate
    }))
  );

  return (
    <div className="space-y-6 font-serif max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={isStudent ? '/student/projects' : isUniversity ? '/university/projects' : '/projects'}
          className="inline-flex items-center space-x-1 text-xs text-gov-maroon hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {isStudent ? 'My Innovation Projects' : 'Projects Directory'}</span>
        </Link>
        <span className="text-[11px] text-gov-text-muted font-mono">
          PROJECT ID: {project._id}
        </span>
      </div>

      {/* Top Header Card */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="font-mono font-bold text-gov-maroon bg-gov-sand-50 px-2.5 py-0.5 rounded-xs border border-gov-border text-xs">
              [{project.challengeId?.code || 'DEL-PROJ'}]
            </span>
            <Badge variant="navy">{project.challengeId?.category || 'Civic Infrastructure'}</Badge>
            <span className="text-[11px] text-gov-text-muted flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-gov-maroon" />
              <span>District: <strong>{project.challengeId?.district || 'Central Delhi'}</strong></span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="subtle" size="sm" onClick={fetchProject} icon={RefreshCw}>
              Refresh
            </Button>

            {isAdmin && (
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
              <span>University: <strong>{project.universityId?.name || 'Designated Institute'}</strong></span>
              <span>&bull;</span>
              <span>Faculty Mentor: <strong>{project.mentor?.name || 'Academic Lead'}</strong></span>
              <span>&bull;</span>
              <span>Timeline: <strong>{project.timeline || '6 Months'}</strong></span>
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
              {completedMilestones} of {milestonesList.length} milestones completed
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
                        {isPassed ? '✓ Done' : isCurrent ? '● Active' : `Stage ${idx + 1}`}
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
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 13-Tab Navigation Bar */}
      <div className="flex items-center space-x-1 border-b border-gov-border overflow-x-auto text-xs font-semibold scrollbar-thin">
        {WORKSPACE_TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-t-xs flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? 'border-gov-maroon text-gov-maroon bg-white font-bold'
                  : 'border-transparent text-gov-navy hover:bg-gov-sand-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card accent="none" className="p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Current Stage</span>
              <span className="text-sm font-bold text-gov-navy mt-1 block truncate">
                {STAGE_LABELS[project.status]}
              </span>
            </Card>
            <Card accent="none" className="p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Overall Progress</span>
              <span className="text-sm font-bold text-gov-maroon mt-1 block">
                {project.overallProgress || 0}%
              </span>
            </Card>
            <Card accent="none" className="p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Milestones Completed</span>
              <span className="text-sm font-bold text-emerald-800 mt-1 block">
                {completedMilestones} / {milestonesList.length}
              </span>
            </Card>
            <Card accent="none" className="p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Deliverables Count</span>
              <span className="text-sm font-bold text-gov-navy mt-1 block">
                {allDeliverables.length}
              </span>
            </Card>
            <Card accent="none" className="p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Team Roster</span>
              <span className="text-sm font-bold text-gov-navy mt-1 block">
                {project.team?.members?.length || 1} Members
              </span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Project Description & Next Milestone */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Solution Synopsis */}
              <Card accent="maroon" title="Technical Solution Overview">
                <p className="text-xs text-gov-text-secondary leading-relaxed">
                  {project.proposedSolution || project.description}
                </p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="pt-3 border-t border-gov-border mt-3">
                    <span className="text-[10px] font-bold text-gov-navy uppercase block mb-1.5">
                      Core Technology Stack
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="bg-gov-sand-50 text-gov-navy border border-gov-border px-2 py-0.5 rounded-xs text-[11px] font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Next Milestone Spotlight */}
              <Card accent="navy" title="Upcoming Sprint Milestone">
                {nextPendingMilestone ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gov-navy text-sm">{nextPendingMilestone.title}</h4>
                        {nextPendingMilestone.description && (
                          <p className="text-gov-text-secondary mt-1">{nextPendingMilestone.description}</p>
                        )}
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs ${MILESTONE_STATUS_CONFIG[nextPendingMilestone.status]?.color}`}>
                        {MILESTONE_STATUS_CONFIG[nextPendingMilestone.status]?.label}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gov-text-muted">
                        <span>Sprint Progress</span>
                        <span className="font-bold text-gov-navy">{nextPendingMilestone.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gov-sand-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gov-maroon h-full rounded-full transition-all"
                          style={{ width: `${nextPendingMilestone.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gov-border flex items-center justify-between text-[11px]">
                      <span className="text-gov-text-muted">
                        Target Date: <strong>{nextPendingMilestone.dueDate ? new Date(nextPendingMilestone.dueDate).toLocaleDateString('en-IN') : 'TBD'}</strong>
                      </span>
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => openMilestoneUpdate(nextPendingMilestone)}
                        className="text-gov-maroon font-bold"
                      >
                        Update Progress &rarr;
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-gov-text-muted space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="font-bold text-gov-navy">All Planned Milestones Completed</p>
                    <p>Prepare testing logs and municipal validation deliverables.</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Right 1 Col: Stakeholders & Recent Activity */}
            <div className="space-y-6 text-xs">
              {/* Supervising Mentor Card */}
              <Card accent="navy" title="Supervising Faculty Mentor">
                {project.mentor ? (
                  <div className="space-y-1.5">
                    <div className="font-bold text-gov-navy text-sm">{project.mentor.name}</div>
                    <div className="text-gov-maroon font-semibold text-xs">{project.mentor.department}</div>
                    <div className="text-gray-500 text-[11px]">Specialization: {project.mentor.specialization || 'Engineering'}</div>
                    <div className="text-gray-500 text-[11px]">Email: {project.mentor.email}</div>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Supervising mentor assignment in progress.</p>
                )}
              </Card>

              {/* Student Cohort Summary */}
              <Card accent="maroon" title={`Innovation Cohort (${project.team?.name || 'Assigned Team'})`}>
                {project.team?.members && project.team.members.length > 0 ? (
                  <div className="divide-y divide-gov-border">
                    {project.team.members.map((m, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gov-navy">{m.student?.name || 'Student Innovator'}</div>
                          <div className="text-[10px] text-gray-500">{m.student?.department} &bull; {m.student?.year}</div>
                        </div>
                        <Badge variant="navy">{m.role}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Team roster loading.</p>
                )}
              </Card>

              {/* Recent Activity Log */}
              <Card accent="none" title="Latest Activity Updates">
                {(project.updates || []).length === 0 ? (
                  <p className="text-gray-400 italic py-2 text-center">No recent activity logged.</p>
                ) : (
                  <div className="divide-y divide-gov-border">
                    {project.updates.slice(0, 4).map((upd, idx) => (
                      <div key={idx} className="py-2 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-gov-maroon truncate max-w-[160px]">{upd.title}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(upd.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-gov-text-secondary text-[11px] leading-snug line-clamp-2">{upd.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROBLEM (READ-ONLY GOVERNMENT AUTHORITY RECORD) */}
      {activeTab === 'problem' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-xs flex items-start space-x-3 text-xs text-amber-950">
            <Lock className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Government Authority Civic Problem Statement:</strong> This record reflects the official municipal problem filed by Delhi civic authorities. It is authenticated and read-only to guarantee problem integrity during solution engineering.
            </div>
          </div>

          {project.challengeId ? (
            <Card accent="maroon" title={`Official Challenge: [${project.challengeId.code}] ${project.challengeId.title}`}>
              <div className="space-y-4 text-xs">
                {/* Meta Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gov-sand-50 rounded-xs border border-gov-border text-[11px]">
                  <div>
                    <span className="text-gray-500 block uppercase text-[10px]">District & Ward</span>
                    <strong className="text-gov-navy">{project.challengeId.district || 'Delhi'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[10px]">Civic Category</span>
                    <strong className="text-gov-navy">{project.challengeId.category || 'Civic Infrastructure'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[10px]">Urgency Priority</span>
                    <strong className="text-gov-maroon">{project.challengeId.priority || 'High'}</strong>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="space-y-1">
                  <h4 className="font-bold text-gov-navy text-xs uppercase tracking-wider">Problem Statement & Scope</h4>
                  <p className="text-gov-text-secondary leading-relaxed bg-white p-3 border border-gov-border rounded-xs">
                    {project.challengeId.description}
                  </p>
                </div>

                {/* Community Reality / Impact */}
                {project.challengeId.communityImpact && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-gov-navy text-xs uppercase tracking-wider">Ground Reality & Citizen Impact</h4>
                    <p className="text-gov-text-secondary leading-relaxed bg-gov-sand-50 p-3 border border-gov-border rounded-xs">
                      {project.challengeId.communityImpact}
                    </p>
                  </div>
                )}

                {/* Expected Civic Outcome */}
                {project.challengeId.expectedOutcome && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-gov-navy text-xs uppercase tracking-wider">Mandatory Resolution Benchmarks</h4>
                    <p className="text-gov-text-secondary leading-relaxed bg-emerald-50/50 p-3 border border-emerald-200 rounded-xs">
                      {project.challengeId.expectedOutcome}
                    </p>
                  </div>
                )}

                {/* Supporting Documents / Media */}
                {project.challengeId.documents && project.challengeId.documents.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-gov-border">
                    <h4 className="font-bold text-gov-navy text-xs uppercase tracking-wider">Official Civic Evidence & Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.challengeId.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-white border border-gov-border hover:border-gov-navy text-gov-navy rounded-xs text-[11px] flex items-center space-x-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-gov-maroon" />
                          <span>{doc.title || `Civic Attachment ${idx + 1}`}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gov-border flex justify-end">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setActiveTab('proposal')}
                    className="text-gov-maroon font-bold"
                  >
                    View Engineering Proposal &rarr;
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card accent="none" className="py-8 text-center text-xs text-gov-text-muted">
              Originating challenge metadata unavailable.
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: PROPOSAL */}
      {activeTab === 'proposal' && (
        <ProposalSection
          project={project}
          user={user}
          onProjectUpdate={fetchProject}
        />
      )}

      {/* TAB 4: TEAM */}
      {activeTab === 'team' && (
        <TeamSection
          project={project}
          user={user}
          onProjectUpdate={fetchProject}
        />
      )}

      {/* TAB 5: FACULTY MENTOR */}
      {activeTab === 'mentor' && (
        <FacultyMentorSection
          project={project}
          user={user}
          onProjectUpdate={fetchProject}
        />
      )}


      {/* TAB 6: MILESTONES */}
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
            {milestonesList.length === 0 ? (
              <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
                <Layers className="w-8 h-8 text-gov-maroon mx-auto" />
                <p className="font-bold text-gov-navy text-sm">No Sprint Milestones Defined</p>
                <p>Add milestones to map out research, prototyping, and validation phases.</p>
              </Card>
            ) : (
              milestonesList.map((m, idx) => {
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
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => openMilestoneUpdate(m)}
                          title="Update sprint progress and submit deliverables"
                          className="text-gov-maroon font-bold text-xs"
                        >
                          {isStudent ? 'Update & Submit Review' : 'Edit Milestone'}
                        </Button>
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
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 7: DELIVERABLES */}
      {activeTab === 'deliverables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gov-text-secondary">
              Consolidated registry of all technical deliverables and verification documents across milestones.
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

          {allDeliverables.length === 0 ? (
            <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
              <FileCheck className="w-8 h-8 text-gov-maroon mx-auto" />
              <p className="font-bold text-gov-navy text-sm">No Deliverables Listed</p>
              <p>Add milestones with deliverables to generate a consolidated checklist.</p>
            </Card>
          ) : (
            <div className="bg-white border border-gov-border rounded-xs overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gov-sand-50 border-b border-gov-border text-[11px] font-bold text-gov-navy uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Deliverable Item</th>
                      <th className="p-3">Associated Milestone</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Milestone Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gov-border">
                    {allDeliverables.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gov-sand-50/50 transition-colors">
                        <td className="p-3 font-bold text-gov-navy flex items-center space-x-2">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span>{item.deliverable}</span>
                        </td>
                        <td className="p-3 text-gov-text-secondary">{item.milestoneTitle}</td>
                        <td className="p-3 text-gray-500 font-mono text-[11px]">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN') : 'TBD'}
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-xs ${MILESTONE_STATUS_CONFIG[item.milestoneStatus]?.color}`}>
                            {item.milestoneStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setUploadDoc({ title: `${item.deliverable} Doc`, milestoneId: item.milestoneId, file: null });
                              setShowDocumentModal(true);
                            }}
                            className="text-gov-maroon font-bold text-[11px] hover:underline"
                          >
                            Vault File &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gov-text-secondary">
              Cloudinary-backed cryptographic document vault storing schematics, lab test reports, and certifications.
            </span>
            <div className="flex items-center space-x-2">
              {isStudent && (
                <Link
                  to="/student/documents"
                  className="text-xs text-gov-maroon underline font-semibold hover:text-gov-maroon-dark mr-2"
                >
                  Document Repository &rarr;
                </Link>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowDocumentModal(true)}
                icon={Upload}
                className="bg-gov-maroon text-white"
              >
                Upload Document
              </Button>
            </div>
          </div>

          {(project.documents || []).length === 0 ? (
            <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
              <Upload className="w-8 h-8 text-gov-maroon mx-auto" />
              <p className="font-bold text-gov-navy text-sm">No Deliverable Documents Vaulted Yet</p>
              <p className="max-w-md mx-auto">
                Upload CAD models, circuit schematics, calibration sheets, or municipal pilot agreements.
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
                    <span>Uploaded by: <strong>{doc.uploaderName || 'Stakeholder'}</strong> ({doc.uploaderRole})</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: PROTOTYPE */}
      {activeTab === 'prototype' && (
        <PrototypeSection
          project={project}
          onProjectUpdated={fetchProject}
          userRole={user?.role}
        />
      )}

      {/* TAB 10: TESTING */}
      {activeTab === 'testing' && (
        <TestingSection
          project={project}
          onProjectUpdated={fetchProject}
          userRole={user?.role}
          currentUserId={user?._id || user?.id}
        />
      )}

      {/* TAB 11: INDUSTRY */}
      {activeTab === 'industry' && (
        <IndustrySection
          project={project}
          onProjectUpdated={fetchProject}
          userRole={user?.role}
        />
      )}

      {/* TAB 12: DISCUSSION */}
      {activeTab === 'discussion' && (
        <DiscussionSection project={project} onProjectUpdated={fetchProject} />
      )}

      {/* TAB 13: IMPACT */}
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
                    Location: {project.impactOutcome.deploymentLocation || 'Central Delhi'}
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
              <Sparkles className="w-8 h-8 text-gov-maroon mx-auto" />
              <p className="font-bold text-gov-navy text-sm">Societal Impact Report Pending Official Verification</p>
              <p className="max-w-md mx-auto">
                Once the project completes live ward pilot trials, authorized university coordinators and municipal officers certify verified citizen outcomes and IP filings.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal 1: Advance Stage (University/Faculty/Admin only) */}
      {showTransitionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
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

      {/* Modal 2: Add Milestone (University/Faculty/Admin only) */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
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

      {/* Modal 3: Update Milestone (Includes Student Self-Approval Guard) */}
      {showUpdateMilestoneModal && selectedMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Layers className="w-5 h-5 text-gov-maroon" />
                <span>Update Milestone Progress</span>
              </h3>
              <button onClick={() => setShowUpdateMilestoneModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMilestone} className="space-y-4 text-xs">
              <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
                <span className="font-mono text-xs font-bold text-gov-maroon block">MILESTONE</span>
                <span className="font-bold text-gov-navy text-sm block">{selectedMilestone.title}</span>
                {selectedMilestone.description && (
                  <p className="text-gray-500 text-[11px] mt-1">{selectedMilestone.description}</p>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={milestoneUpdateForm.status}
                  onChange={(e) => setMilestoneUpdateForm({ ...milestoneUpdateForm, status: e.target.value })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="UNDER_REVIEW">Under Review (Submit for Faculty Sign-Off)</option>
                  {!isStudent && <option value="COMPLETED">Completed (Faculty / Admin Sign-off)</option>}
                  {!isStudent && <option value="DELAYED">Delayed</option>}
                </select>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-gov-navy">
                  <span>Sprint Progress Percentage</span>
                  <span className="text-gov-maroon">{milestoneUpdateForm.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={isStudent ? '99' : '100'}
                  value={milestoneUpdateForm.progress}
                  onChange={(e) => setMilestoneUpdateForm({ ...milestoneUpdateForm, progress: e.target.value })}
                  className="w-full accent-gov-maroon cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0%</span>
                  {isStudent ? (
                    <span className="text-amber-800 font-semibold">Max student progress: 99% (Faculty sign-off required for 100%)</span>
                  ) : (
                    <span>100%</span>
                  )}
                </div>
              </div>

              {/* Deliverables summary */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Deliverables Checklist (Comma-separated)
                </label>
                <input
                  type="text"
                  value={milestoneUpdateForm.deliverablesText}
                  onChange={(e) => setMilestoneUpdateForm({ ...milestoneUpdateForm, deliverablesText: e.target.value })}
                  placeholder="e.g. Firmware report, PCB schematics"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              {isStudent && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xs text-[11px] text-amber-900 flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Faculty Sign-off Required:</strong> Students can update sprint progress up to 99% and submit deliverables for review. Final 100% completion sign-off is certified exclusively by your Supervising Faculty Mentor.
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowUpdateMilestoneModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Saving...' : 'Save Milestone Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Upload Deliverable Document */}
      {showDocumentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Upload className="w-5 h-5 text-gov-maroon" />
                <span>Upload Deliverable to Vault</span>
              </h3>
              <button onClick={() => setShowDocumentModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadDoc.title}
                  onChange={(e) => setUploadDoc({ ...uploadDoc, title: e.target.value })}
                  placeholder="e.g. Field Calibration Report"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Associated Milestone (Optional)
                </label>
                <select
                  value={uploadDoc.milestoneId}
                  onChange={(e) => setUploadDoc({ ...uploadDoc, milestoneId: e.target.value })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none"
                >
                  <option value="">-- General Project Document --</option>
                  {milestonesList.map((m, idx) => (
                    <option key={m._id || idx} value={m._id}>
                      M{idx + 1}: {m.title}
                    </option>
                  ))}
                </select>
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
                  {submitting ? 'Vaulting File...' : 'Upload to Vault'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Formulate & Submit Proposal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
          <div className="bg-white border border-gov-border rounded-sm max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gov-maroon" />
                <span>Formulate Technical Solution Proposal</span>
              </h3>
              <button onClick={() => setShowProposalModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  1. Problem Understanding & Analysis *
                </label>
                <textarea
                  rows={3}
                  required
                  value={proposalForm.problemUnderstanding}
                  onChange={(e) => setProposalForm({ ...proposalForm, problemUnderstanding: e.target.value })}
                  placeholder="Detail your engineering analysis of the civic problem and root causes..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  2. Proposed Technical Solution & Architecture *
                </label>
                <textarea
                  rows={3}
                  required
                  value={proposalForm.proposedSolution}
                  onChange={(e) => setProposalForm({ ...proposalForm, proposedSolution: e.target.value })}
                  placeholder="Explain your technical solution, subsystem design, and engineering innovations..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  3. Engineering Methodology & Validation Plan *
                </label>
                <textarea
                  rows={2}
                  required
                  value={proposalForm.methodology}
                  onChange={(e) => setProposalForm({ ...proposalForm, methodology: e.target.value })}
                  placeholder="Prototyping methodology, safety checks, and field testing steps..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    4. Technology Stack (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={proposalForm.technology}
                    onChange={(e) => setProposalForm({ ...proposalForm, technology: e.target.value })}
                    placeholder="e.g. ESP32, LoRaWAN, Piezo Sensors, React"
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    5. Implementation Timeline
                  </label>
                  <input
                    type="text"
                    value={proposalForm.timeline}
                    onChange={(e) => setProposalForm({ ...proposalForm, timeline: e.target.value })}
                    placeholder="e.g. 6 Months (3 Sprints)"
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  6. Anticipated Civic Relief & Impact *
                </label>
                <textarea
                  rows={2}
                  required
                  value={proposalForm.expectedImpact}
                  onChange={(e) => setProposalForm({ ...proposalForm, expectedImpact: e.target.value })}
                  placeholder="Estimated citizens benefited and ground relief..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowProposalModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Submitting to Council...' : 'Submit Proposal for Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Request Industry Collaboration */}
      {showIndustryRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-gov-maroon" />
                <span>Request Industry Co-Development</span>
              </h3>
              <button onClick={() => setShowIndustryRequestModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestIndustryCollaboration} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Target Industry Organization / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={industryRequestForm.partnerName}
                  onChange={(e) => setIndustryRequestForm({ ...industryRequestForm, partnerName: e.target.value })}
                  placeholder="e.g. Havells India, Tata Power-DDL, Bosch India"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Collaboration Area of Interest
                </label>
                <select
                  value={industryRequestForm.areaOfInterest}
                  onChange={(e) => setIndustryRequestForm({ ...industryRequestForm, areaOfInterest: e.target.value })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none"
                >
                  <option value="Hardware Components & Testing Facilities">Hardware Components & Testing Facilities</option>
                  <option value="Industrial Technical Mentorship">Industrial Technical Mentorship</option>
                  <option value="Pilot Ward Deployment Site Access">Pilot Ward Deployment Site Access</option>
                  <option value="CSR Innovation Co-Sponsorship Grant">CSR Innovation Co-Sponsorship Grant</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Collaboration Proposal Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={industryRequestForm.message}
                  onChange={(e) => setIndustryRequestForm({ ...industryRequestForm, message: e.target.value })}
                  placeholder="State your technical support requirements and mutual benefit..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowIndustryRequestModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Submitting Request...' : 'Send Collaboration Inquiry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Verified Societal Impact Report (University/Admin only) */}
      {showImpactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
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

      {/* Modal 8: Admin Workflow Intervention (Admin only) */}
      {showInterveneModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-700" />
                <span>Samadhan Setu Innovation Council Administrative Intervention</span>
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
