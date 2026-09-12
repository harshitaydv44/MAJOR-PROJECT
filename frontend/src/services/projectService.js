import api from './api';

export const projectService = {
  // Projects
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getStudentProjects: async (params = {}) => {
    const response = await api.get('/student/projects', { params });
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Lifecycle Stage Transition
  transitionStage: async (projectId, { targetStage, notes }) => {
    const response = await api.post(`/projects/${projectId}/transition`, { targetStage, notes });
    return response.data;
  },

  // Milestones
  addMilestone: async (projectId, milestoneData) => {
    const response = await api.post(`/projects/${projectId}/milestones`, milestoneData);
    return response.data;
  },

  updateMilestone: async (projectId, milestoneId, milestoneData) => {
    const response = await api.put(`/projects/${projectId}/milestones/${milestoneId}`, milestoneData);
    return response.data;
  },

  deleteMilestone: async (projectId, milestoneId) => {
    const response = await api.delete(`/projects/${projectId}/milestones/${milestoneId}`);
    return response.data;
  },

  addMilestoneComment: async (projectId, milestoneId, comment) => {
    const response = await api.post(`/projects/${projectId}/milestones/${milestoneId}/comments`, { comment });
    return response.data;
  },

  // Deliverables & Documents (Cloudinary)
  uploadDocument: async (projectId, formData) => {
    const response = await api.post(`/projects/${projectId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Activity Updates & Timeline
  addUpdate: async (projectId, { title, content, type }) => {
    const response = await api.post(`/projects/${projectId}/updates`, { title, content, type });
    return response.data;
  },

  // Collaboration Comments
  addComment: async (projectId, { comment }) => {
    const response = await api.post(`/projects/${projectId}/comments`, { comment });
    return response.data;
  },

  // Verified Societal Impact
  submitImpactOutcome: async (projectId, impactData) => {
    const response = await api.post(`/projects/${projectId}/impact`, impactData);
    return response.data;
  },

  // Admin Workflow Intervention
  adminIntervene: async (projectId, { targetStage, interventionNotes, action }) => {
    const response = await api.post(`/projects/${projectId}/admin-intervene`, {
      targetStage,
      interventionNotes,
      action
    });
    return response.data;
  },

  // Proposal & Mentorship
  assignMentor: async (projectId, facultyId) => {
    const response = await api.post(`/projects/${projectId}/assign-mentor`, { facultyId });
    return response.data;
  },

  submitProposal: async (projectId, proposalData) => {
    const response = await api.post(`/projects/${projectId}/proposal`, proposalData);
    return response.data;
  },

  reviewProposal: async (projectId, reviewData) => {
    const response = await api.put(`/projects/${projectId}/proposal/review`, reviewData);
    return response.data;
  },

  // Faculty
  getFaculty: async () => {
    const response = await api.get('/faculty');
    return response.data;
  },

  addFaculty: async (facultyData) => {
    const response = await api.post('/faculty', facultyData);
    return response.data;
  },

  updateFaculty: async (id, facultyData) => {
    const response = await api.put(`/faculty/${id}`, facultyData);
    return response.data;
  },

  removeFaculty: async (id) => {
    const response = await api.delete(`/faculty/${id}`);
    return response.data;
  },

  // Students
  getStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  addStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  removeStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  // Teams
  getTeams: async () => {
    const response = await api.get('/teams');
    return response.data;
  },

  createTeam: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  updateTeam: async (id, teamData) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },

  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  // AI-Assisted Industry Matching
  recommendIndustries: async (id) => {
    const response = await api.post(`/projects/${id}/recommend-industries`);
    return response.data;
  },

  acceptIndustryRecommendation: async (id, industryId, notes = '') => {
    const response = await api.post(`/projects/${id}/recommend-industries/accept`, {
      industryId,
      notes
    });
    return response.data;
  },

  ignoreIndustryRecommendation: async (id, industryId) => {
    const response = await api.post(`/projects/${id}/recommend-industries/ignore`, {
      industryId
    });
    return response.data;
  },

  requestIndustryCollaboration: async (id, collaborationData) => {
    const response = await api.post(`/projects/${id}/request-industry`, collaborationData);
    return response.data;
  },

  // Proposal Draft
  saveProposalDraft: async (id, proposalData) => {
    const response = await api.post(`/projects/${id}/proposal`, { ...proposalData, isDraft: true });
    return response.data;
  },

  // Mentorship Reviews
  requestMentorReview: async (id, data) => {
    const response = await api.post(`/projects/${id}/mentor/request-review`, data);
    return response.data;
  },

  submitMentorFeedback: async (id, data) => {
    const response = await api.post(`/projects/${id}/mentor/feedback`, data);
    return response.data;
  },

  // Team Member Management & Invitations
  inviteTeamMember: async (teamId, data) => {
    const response = await api.post(`/teams/${teamId}/invite`, data);
    return response.data;
  },

  respondTeamInvite: async (teamId, data) => {
    const response = await api.post(`/teams/${teamId}/respond-invite`, data);
    return response.data;
  },

  updateTeamMember: async (teamId, memberId, data) => {
    const response = await api.put(`/teams/${teamId}/members/${memberId}`, data);
    return response.data;
  },

  removeTeamMember: async (teamId, memberId) => {
    const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
    return response.data;
  },

  initStudentProject: async () => {
    const response = await api.post('/student/projects/init');
    return response.data;
  },

  // Student Milestones & Deliverables
  getStudentMilestones: async () => {
    const response = await api.get('/student/milestones');
    return response.data;
  },

  updateStudentMilestoneProgress: async (milestoneId, data) => {
    const response = await api.put(`/student/milestones/${milestoneId}/progress`, data);
    return response.data;
  },

  submitStudentMilestoneReview: async (milestoneId, data) => {
    const response = await api.post(`/student/milestones/${milestoneId}/submit-review`, data);
    return response.data;
  },

  submitStudentDeliverable: async (milestoneId, formData) => {
    const response = await api.post(`/student/milestones/${milestoneId}/deliverables`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Student Documents (Isolated Project Scope)
  getStudentDocuments: async (params) => {
    const response = await api.get('/student/documents', { params });
    return response.data;
  },

  uploadStudentDocument: async (formData) => {
    const response = await api.post('/student/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Prototype Tracking
  updateProjectPrototype: async (id, data) => {
    const response = await api.put(`/projects/${id}/prototype`, data);
    return response.data;
  },

  // Empirical Test Trials & Evidence
  getProjectTests: async (id) => {
    const response = await api.get(`/projects/${id}/tests`);
    return response.data;
  },

  createProjectTest: async (id, data) => {
    const response = await api.post(`/projects/${id}/tests`, data);
    return response.data;
  },

  uploadTestEvidence: async (id, testId, formData) => {
    const response = await api.post(`/projects/${id}/tests/${testId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  reviewProjectTest: async (id, testId, data) => {
    const response = await api.post(`/projects/${id}/tests/${testId}/review`, data);
    return response.data;
  },

  // Student Industry Collaboration (Task S9)
  getStudentIndustryPartners: async (params) => {
    const response = await api.get('/student/industry', { params });
    return response.data;
  },

  requestStudentIndustryCollaboration: async (data) => {
    const response = await api.post('/student/industry/collaborate', data);
    return response.data;
  },

  getStudentPartnerships: async () => {
    const response = await api.get('/student/industry/partnerships');
    return response.data;
  },

  getProjectPartnerships: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/partnerships`);
    return response.data;
  },

  updatePartnershipStatus: async (projectId, partnershipId, data) => {
    const response = await api.put(`/projects/${projectId}/partnerships/${partnershipId}/status`, data);
    return response.data;
  }
};

export default projectService;
