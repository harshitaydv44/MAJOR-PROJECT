import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  FileText,
  Upload,
  Search,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Calendar,
  User,
  Layers,
  FileCode,
  FileCheck,
  Download,
  X,
  Plus,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

const DOCUMENT_TYPE_FILTERS = [
  { id: 'all', label: 'All Formats' },
  { id: 'pdf', label: 'PDF Reports' },
  { id: 'image', label: 'Images & Diagrams' },
  { id: 'sheet', label: 'Data & Sheets' },
  { id: 'zip', label: 'Archives' }
];

const StudentDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedDocType, setSelectedDocType] = useState('all');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formData, setFormData] = useState({
    projectId: '',
    milestoneId: '',
    title: '',
    description: '',
    submissionNote: '',
    externalLink: '',
    file: null
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch student projects to populate selector and isolate access
      const projectsRes = await projectService.getStudentProjects();
      const projList = projectsRes.data?.projects || projectsRes.projects || [];
      setProjects(projList);

      // Default first project in modal if available
      if (projList.length > 0 && !formData.projectId) {
        setFormData((prev) => ({ ...prev, projectId: projList[0]._id }));
      }

      // 2. Fetch student documents
      const docsRes = await projectService.getStudentDocuments();
      const docList = docsRes.data?.documents || docsRes.documents || [];
      setDocuments(docList);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load project documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenUploadModal = () => {
    setUploadError('');
    if (projects.length > 0 && !formData.projectId) {
      setFormData((prev) => ({ ...prev, projectId: projects[0]._id }));
    }
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadError('');
    setFormData({
      projectId: projects[0]?._id || '',
      milestoneId: '',
      title: '',
      description: '',
      submissionNote: '',
      externalLink: '',
      file: null
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        file: selected,
        title: prev.title || selected.name
      }));
    }
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      setUploadError('Please select an enrolled project');
      return;
    }
    if (!formData.file) {
      setUploadError('Please choose a file to upload');
      return;
    }
    if (!formData.title.trim()) {
      setUploadError('Please provide a document title');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    try {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('projectId', formData.projectId);
      if (formData.milestoneId) data.append('milestoneId', formData.milestoneId);
      data.append('title', formData.title.trim());
      if (formData.description) data.append('description', formData.description.trim());
      if (formData.submissionNote) data.append('submissionNote', formData.submissionNote.trim());
      if (formData.externalLink) data.append('externalLink', formData.externalLink.trim());

      await projectService.uploadStudentDocument(data);
      setSuccessMsg('Document successfully uploaded to project repository and verified!');
      handleCloseUploadModal();
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload document to Cloudinary');
    } finally {
      setUploadLoading(false);
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    // Project filter
    if (selectedProjectId !== 'all' && doc.projectId !== selectedProjectId) {
      return false;
    }

    // Document type filter
    if (selectedDocType !== 'all') {
      const ft = (doc.fileType || '').toLowerCase();
      if (selectedDocType === 'pdf' && !ft.includes('pdf')) return false;
      if (selectedDocType === 'image' && !ft.includes('image') && !ft.includes('png') && !ft.includes('jpg')) return false;
      if (selectedDocType === 'sheet' && !ft.includes('sheet') && !ft.includes('csv') && !ft.includes('excel')) return false;
      if (selectedDocType === 'zip' && !ft.includes('zip') && !ft.includes('tar') && !ft.includes('compressed')) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (doc.title || '').toLowerCase().includes(q);
      const matchProject = (doc.projectTitle || '').toLowerCase().includes(q);
      const matchDesc = (doc.description || '').toLowerCase().includes(q);
      const matchNote = (doc.submissionNote || '').toLowerCase().includes(q);
      if (!matchTitle && !matchProject && !matchDesc && !matchNote) return false;
    }

    return true;
  });

  // Selected project in upload form to dynamically show its milestones
  const activeUploadProject = projects.find((p) => p._id === formData.projectId);
  const projectMilestones = activeUploadProject?.milestones || [];

  return (
    <div className="space-y-6 font-serif max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gov-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-gov-sand-100 text-gov-maroon font-mono text-[11px] font-bold px-2 py-0.5 rounded-xs border border-gov-border">
                PROJECT REPOSITORY
              </span>
              <span className="text-xs text-gov-text-muted flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Isolated Project Vault</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gov-navy tracking-tight">
              Student Project Documents
            </h1>
            <p className="text-xs text-gov-text-secondary leading-relaxed max-w-3xl">
              Centralized repository for technical specifications, research dossiers, CAD/schematics, and deliverable submissions belonging exclusively to your enrolled civic innovation projects.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="subtle"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              icon={RefreshCw}
              className="text-gov-navy"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenUploadModal}
              icon={Upload}
              className="bg-gov-maroon text-white font-bold"
            >
              Upload Document
            </Button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-center text-xs">
          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <span className="text-[10px] font-bold text-gov-text-muted uppercase block">Total Vaulted Docs</span>
            <span className="text-lg font-bold text-gov-navy mt-0.5 block">{documents.length}</span>
          </div>
          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <span className="text-[10px] font-bold text-gov-text-muted uppercase block">Enrolled Projects</span>
            <span className="text-lg font-bold text-gov-maroon mt-0.5 block">{projects.length}</span>
          </div>
          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <span className="text-[10px] font-bold text-gov-text-muted uppercase block">Milestone Deliverables</span>
            <span className="text-lg font-bold text-emerald-800 mt-0.5 block">
              {documents.filter((d) => d.milestoneId).length}
            </span>
          </div>
          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <span className="text-[10px] font-bold text-gov-text-muted uppercase block">Storage Backend</span>
            <span className="text-xs font-mono font-bold text-gov-navy mt-1 block">Cloudinary Secure</span>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xs flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card accent="none" className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by document title, project name, or keywords..."
              className="w-full pl-9 pr-4 py-2 border border-gov-border rounded-xs text-xs font-sans focus:outline-hidden focus:border-gov-navy focus:ring-1 focus:ring-gov-navy bg-gov-sand-50"
            />
          </div>

          {/* Project Dropdown Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gov-text-muted font-bold whitespace-nowrap">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 border border-gov-border rounded-xs text-xs font-sans bg-white focus:outline-hidden focus:border-gov-navy"
            >
              <option value="all">All Enrolled Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Format Filter Tabs */}
        <div className="flex items-center space-x-1 border-t border-gov-border mt-3 pt-3 overflow-x-auto text-xs">
          <span className="text-[11px] text-gov-text-muted font-bold mr-2 uppercase tracking-wider">Format:</span>
          {DOCUMENT_TYPE_FILTERS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDocType(tab.id)}
              className={`px-3 py-1 rounded-xs font-medium text-xs transition-colors whitespace-nowrap ${
                selectedDocType === tab.id
                  ? 'bg-gov-navy text-white font-bold'
                  : 'text-gov-text-secondary hover:bg-gov-sand-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Loading student project documents..." />
      ) : error ? (
        <ErrorState
          title="Error Loading Documents"
          message={error}
          onRetry={fetchData}
          retryLabel="Retry Loading"
        />
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white border border-gov-border rounded-xs p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gov-sand-100 flex items-center justify-center mx-auto text-gov-maroon">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gov-navy">No Project Documents Found</h3>
            <p className="text-xs text-gov-text-secondary max-w-md mx-auto">
              {documents.length === 0
                ? "You haven't uploaded any technical documents or deliverable files to your projects yet. Upload your first document to establish the project archive."
                : 'No documents match the current filter criteria. Try clearing search filters or changing the project selector.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenUploadModal}
            icon={Upload}
            className="bg-gov-maroon text-white font-bold text-xs"
          >
            Upload Document Now
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gov-text-muted px-1">
            <span>
              Showing <strong>{filteredDocuments.length}</strong> of {documents.length} documents
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              const isPdf = (doc.fileType || '').toLowerCase().includes('pdf');
              const isImage = (doc.fileType || '').toLowerCase().includes('image');

              return (
                <Card
                  key={doc._id}
                  accent={isPdf ? 'maroon' : isImage ? 'gold' : 'navy'}
                  className="flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Top Type & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs bg-gov-sand-100 text-gov-navy border border-gov-border">
                          {isPdf ? 'PDF' : isImage ? 'IMAGE' : 'DOC'}
                        </span>
                        {doc.milestoneTitle ? (
                          <span className="text-[10px] text-purple-800 bg-purple-50 font-bold px-1.5 py-0.5 rounded-xs border border-purple-200 truncate max-w-[130px]">
                            {doc.milestoneTitle}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-xs">
                            General Vault
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                        {doc.status || 'VAULTED'}
                      </span>
                    </div>

                    {/* Document Title & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-gov-navy hover:text-gov-maroon transition-colors line-clamp-1">
                        {doc.title}
                      </h4>
                      {doc.description && (
                        <p className="text-xs text-gov-text-secondary line-clamp-2 mt-1">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    {/* Associated Project */}
                    <div className="pt-2 border-t border-gov-border text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-gov-text-muted">
                        <FolderGit2 className="w-3.5 h-3.5 text-gov-maroon shrink-0" />
                        <Link
                          to={`/student/projects`}
                          className="font-semibold text-gov-navy hover:underline truncate"
                        >
                          {doc.projectTitle || 'Civic Innovation Project'}
                        </Link>
                      </div>

                      {doc.submissionNote && (
                        <div className="p-2 bg-gov-sand-50 rounded-xs border border-gov-border text-[11px] text-gray-600 italic">
                          "{doc.submissionNote}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-gov-border mt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gov-text-muted">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{doc.uploaderName || 'Student'}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-gov-navy bg-gov-sand-100 hover:bg-gov-sand-200 border border-gov-border py-1.5 px-3 rounded-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>
                      {doc.externalLink && (
                        <a
                          href={doc.externalLink}
                          target="_blank"
                          rel="noreferrer"
                          title="External Reference"
                          className="p-1.5 border border-gov-border rounded-xs hover:bg-gov-sand-100 text-gov-navy"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Upload Project Document to Vault
                </h3>
              </div>
              <button
                onClick={handleCloseUploadModal}
                className="text-gray-400 hover:text-gov-navy transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitUpload} className="p-5 space-y-4 text-xs">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Target Project Selection */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Target Project <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectId: e.target.value,
                      milestoneId: '' // reset milestone when project changes
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gov-text-muted mt-0.5 block">
                  Only projects where you are an enrolled team member appear here.
                </span>
              </div>

              {/* Target Milestone Selection (Optional) */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Link to Milestone (Optional)
                </label>
                <select
                  value={formData.milestoneId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, milestoneId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  <option value="">General Project Document (No Milestone)</option>
                  {projectMilestones.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Title */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Document Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Acoustic Leakage Waveform Analysis & Lab Results"
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  File Attachment (Cloudinary) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="w-full p-2 border border-dashed border-gov-border rounded-xs bg-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-gov-sand-100 file:text-gov-navy hover:file:bg-gov-sand-200"
                />
                <span className="text-[10px] text-gov-text-muted mt-0.5 block">
                  Accepted: PDF, Images (PNG, JPG), CAD/Drawings, Word/Docs, Zip archives (Max 25MB).
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Technical Description / Abstract
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief synopsis of methodology, findings, or document scope..."
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Submission Note */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Submission Notes for Faculty / Mentor
                </label>
                <input
                  type="text"
                  value={formData.submissionNote}
                  onChange={(e) => setFormData((prev) => ({ ...prev, submissionNote: e.target.value }))}
                  placeholder="e.g. Incorporates feedback from Professor Sharma on calibration"
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* External Link */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  External Repository / Live Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.externalLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, externalLink: e.target.value }))}
                  placeholder="https://drive.google.com/... or https://cad.onshape.com/..."
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={handleCloseUploadModal}
                  disabled={uploadLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={uploadLoading}
                  className="bg-gov-maroon text-white font-bold"
                >
                  {uploadLoading ? 'Uploading to Cloudinary...' : 'Upload & Vault Document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocumentsPage;
