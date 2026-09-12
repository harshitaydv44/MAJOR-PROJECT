import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { projectService } from '../../services/projectService';
import {
  Cpu,
  GitBranch,
  ExternalLink,
  Code2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings2,
  Sparkles,
  Layers,
  Terminal,
  ShieldCheck,
  X,
  Save,
  Link as LinkIcon
} from 'lucide-react';

const PROTOTYPE_STATUS_CONFIG = {
  PLANNING: { label: 'Planning & Architecture', color: 'bg-stone-100 text-stone-700 border-stone-300' },
  DEVELOPMENT: { label: 'Active Development', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  READY_FOR_TESTING: { label: 'Ready for Testing', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  TESTING: { label: 'Empirical Testing', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  VALIDATED: { label: 'Field Validated', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
};

const TESTING_STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', color: 'bg-stone-100 text-stone-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  PASSED: { label: 'Passed Benchmarks', color: 'bg-emerald-100 text-emerald-800 font-bold' },
  FAILED: { label: 'Failed Validation', color: 'bg-rose-100 text-rose-800 font-bold' },
  RETEST_REQUIRED: { label: 'Retest Required', color: 'bg-amber-100 text-amber-900 font-bold' }
};

const PrototypeSection = ({ project, onProjectUpdated, userRole }) => {
  const prototype = project.prototype || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit form state
  const [form, setForm] = useState({
    name: prototype.name || `${project.title} Prototype`,
    version: prototype.version || 'v0.1.0-alpha',
    description: prototype.description || project.proposedSolution || '',
    technologyUsed: Array.isArray(prototype.technologyUsed)
      ? prototype.technologyUsed.join(', ')
      : (project.technologies || []).join(', '),
    repositoryUrl: prototype.repositoryUrl || '',
    demoUrl: prototype.demoUrl || '',
    prototypeStatus: prototype.prototypeStatus || 'DEVELOPMENT',
    testingStatus: prototype.testingStatus || 'IN_PROGRESS'
  });

  const handleOpenModal = () => {
    setForm({
      name: prototype.name || `${project.title} Prototype`,
      version: prototype.version || 'v0.1.0-alpha',
      description: prototype.description || project.proposedSolution || '',
      technologyUsed: Array.isArray(prototype.technologyUsed)
        ? prototype.technologyUsed.join(', ')
        : (project.technologies || []).join(', '),
      repositoryUrl: prototype.repositoryUrl || '',
      demoUrl: prototype.demoUrl || '',
      prototypeStatus: prototype.prototypeStatus || 'DEVELOPMENT',
      testingStatus: prototype.testingStatus || 'IN_PROGRESS'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const techArray = form.technologyUsed
        ? form.technologyUsed.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: form.name.trim(),
        version: form.version.trim(),
        description: form.description.trim(),
        technologyUsed: techArray,
        repositoryUrl: form.repositoryUrl.trim(),
        demoUrl: form.demoUrl.trim(),
        prototypeStatus: form.prototypeStatus,
        testingStatus: form.testingStatus
      };

      await projectService.updateProjectPrototype(project._id, payload);
      setSuccessMsg('Prototype technical specifications updated successfully!');
      setIsModalOpen(false);
      if (onProjectUpdated) onProjectUpdated();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update prototype specifications');
    } finally {
      setSubmitting(false);
    }
  };

  const hasRepo = Boolean(prototype.repositoryUrl && prototype.repositoryUrl.trim());
  const hasDemo = Boolean(prototype.demoUrl && prototype.demoUrl.trim());
  const techList = prototype.technologyUsed && prototype.technologyUsed.length > 0
    ? prototype.technologyUsed
    : project.technologies || [];

  return (
    <div className="space-y-6 font-serif">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gov-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border">
              ENGINEERING ARTIFACT
            </span>
            <span className="text-xs text-gov-text-muted">Lifecycle Stage: {project.status}</span>
          </div>
          <h2 className="text-xl font-bold text-gov-navy mt-1">
            {prototype.name || `${project.title} Prototype`}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenModal}
            icon={Settings2}
            className="bg-gov-maroon text-white font-bold text-xs"
          >
            Configure Prototype
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xs flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Prototype Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <Card accent="none" className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Version Build</span>
          <span className="text-lg font-mono font-bold text-gov-navy mt-1 block">
            {prototype.version || 'v0.1.0-alpha'}
          </span>
        </Card>

        <Card accent="none" className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Prototype Status</span>
          <div className="mt-2 inline-block">
            <span className={`px-2.5 py-1 rounded-xs font-bold border text-[11px] ${
              PROTOTYPE_STATUS_CONFIG[prototype.prototypeStatus || 'DEVELOPMENT']?.color
            }`}>
              {PROTOTYPE_STATUS_CONFIG[prototype.prototypeStatus || 'DEVELOPMENT']?.label}
            </span>
          </div>
        </Card>

        <Card accent="none" className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Testing Sign-Off</span>
          <div className="mt-2 inline-block">
            <span className={`px-2.5 py-1 rounded-xs text-[11px] font-bold ${
              TESTING_STATUS_CONFIG[prototype.testingStatus || 'IN_PROGRESS']?.color
            }`}>
              {TESTING_STATUS_CONFIG[prototype.testingStatus || 'IN_PROGRESS']?.label}
            </span>
          </div>
        </Card>

        <Card accent="none" className="p-4 text-center">
          <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Last Spec Update</span>
          <span className="text-xs font-mono text-gov-text-secondary mt-2 block">
            {prototype.updatedAt ? new Date(prototype.updatedAt).toLocaleDateString('en-IN') : 'Initial Draft'}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description, Architecture & Tech Stack */}
        <div className="lg:col-span-2 space-y-6">
          {/* Architecture Description */}
          <Card accent="maroon" title="Engineering Description & System Architecture">
            <p className="text-xs text-gov-text-secondary leading-relaxed whitespace-pre-line">
              {prototype.description || project.proposedSolution || 'No detailed prototype architecture description provided yet. Click "Configure Prototype" to document the system specifications.'}
            </p>

            {/* Tech Stack Pills */}
            <div className="pt-4 border-t border-gov-border mt-4">
              <span className="text-[10px] font-bold text-gov-navy uppercase block mb-2 tracking-wider">
                Technology & Tooling Stack
              </span>
              {techList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {techList.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-gov-sand-100 text-gov-navy border border-gov-border px-2.5 py-1 rounded-xs text-xs font-mono font-medium flex items-center space-x-1"
                    >
                      <Code2 className="w-3 h-3 text-gov-maroon" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gov-text-muted italic">
                  No technologies specified yet.
                </span>
              )}
            </div>
          </Card>

          {/* Prototype Lifecycle Pipeline */}
          <Card accent="navy" title="Prototyping Lifecycle Stages">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
              {[
                { id: 'PLANNING', label: '1. Planning' },
                { id: 'DEVELOPMENT', label: '2. Development' },
                { id: 'READY_FOR_TESTING', label: '3. Ready for Testing' },
                { id: 'TESTING', label: '4. Testing' },
                { id: 'VALIDATED', label: '5. Validated' }
              ].map((step) => {
                const current = (prototype.prototypeStatus || 'DEVELOPMENT') === step.id;
                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xs border transition-all ${
                      current
                        ? 'bg-gov-maroon text-white font-bold border-gov-maroon shadow-xs'
                        : 'bg-gov-sand-50 text-gov-text-muted border-gov-border'
                    }`}
                  >
                    <div className="text-xs">{step.label}</div>
                    {current && <div className="text-[9px] uppercase tracking-wider mt-1 opacity-90">Active Stage</div>}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Repositories, Live Demos & Access */}
        <div className="space-y-6">
          {/* Code Repository Card */}
          <Card accent="gold" title="Source Code Repository">
            <div className="space-y-3 text-xs">
              {hasRepo ? (
                <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs space-y-2">
                  <div className="flex items-center space-x-1.5 text-gov-navy font-mono font-bold text-xs truncate">
                    <GitBranch className="w-4 h-4 text-gov-maroon shrink-0" />
                    <span className="truncate">{prototype.repositoryUrl}</span>
                  </div>
                  <a
                    href={prototype.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-gov-maroon hover:underline font-bold"
                  >
                    <span>Open External Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-gov-sand-50 border border-gov-border rounded-xs text-center space-y-2">
                  <GitBranch className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="font-semibold text-gov-navy text-xs">
                    No repository linked yet.
                  </p>
                  <p className="text-[11px] text-gov-text-secondary leading-normal">
                    Link your team's Git/code repository in the prototype configuration once code is published.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Live Demonstration / Testbed URL */}
          <Card accent="none" title="Live Demonstration URL">
            <div className="space-y-3 text-xs">
              {hasDemo ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-mono font-bold text-xs truncate">
                    <LinkIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="truncate">{prototype.demoUrl}</span>
                  </div>
                  <a
                    href={prototype.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-emerald-800 hover:underline font-bold"
                  >
                    <span>Launch Live Demonstration</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-gov-sand-50 border border-gov-border rounded-xs text-center space-y-1">
                  <ExternalLink className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="font-semibold text-gov-navy text-xs">
                    No live demo deployed yet.
                  </p>
                  <p className="text-[11px] text-gov-text-secondary">
                    Provide a staging link or hosted interface for municipal and faculty evaluation.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Integrity Note */}
          <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs flex items-start space-x-2 text-[11px] text-gov-text-secondary">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              All prototype updates are recorded in the immutable project timeline for Samadhan Setu Innovation Council audit.
            </span>
          </div>
        </div>
      </div>

      {/* Edit Prototype Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Configure Prototype Specifications
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gov-navy transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Prototype Name & Version */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Prototype Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Build Version <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
                    placeholder="v1.0.0"
                    required
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-mono focus:outline-hidden focus:border-gov-navy"
                  />
                </div>
              </div>

              {/* Prototype Status & Testing Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Prototype Lifecycle Status
                  </label>
                  <select
                    value={form.prototypeStatus}
                    onChange={(e) => setForm((prev) => ({ ...prev, prototypeStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                  >
                    <option value="PLANNING">Planning & Architecture</option>
                    <option value="DEVELOPMENT">Active Development</option>
                    <option value="READY_FOR_TESTING">Ready for Testing</option>
                    <option value="TESTING">Empirical Testing</option>
                    <option value="VALIDATED">Field Validated</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Testing Verification Status
                  </label>
                  <select
                    value={form.testingStatus}
                    onChange={(e) => setForm((prev) => ({ ...prev, testingStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="FAILED">Failed</option>
                    <option value="RETEST_REQUIRED">Retest Required</option>
                    {['FACULTY', 'UNIVERSITY', 'ADMIN'].includes(userRole) && (
                      <option value="PASSED">Passed Benchmarks (Authority Sign-Off)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Technical Architecture & Specifications
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="System design, hardware/software stack, pinout connections, sensors used..."
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Technology Used */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Technologies / Tooling (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={form.technologyUsed}
                  onChange={(e) => setForm((prev) => ({ ...prev, technologyUsed: e.target.value }))}
                  placeholder="ESP32, Hydrophone Sensors, LoRaWAN, Python FFT, Docker"
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Repository URL */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Repository URL (Leave empty if none)
                </label>
                <input
                  type="url"
                  value={form.repositoryUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, repositoryUrl: e.target.value }))}
                  placeholder="https://github.com/your-org/leak-detector"
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-mono focus:outline-hidden focus:border-gov-navy"
                />
                <span className="text-[10px] text-gov-text-muted mt-0.5 block">
                  Leave blank if no public or private code repository has been linked yet.
                </span>
              </div>

              {/* Demo URL */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Live Demonstration / Testbed URL (Optional)
                </label>
                <input
                  type="url"
                  value={form.demoUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, demoUrl: e.target.value }))}
                  placeholder="https://testbed.example.org"
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-mono focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  icon={Save}
                  className="bg-gov-maroon text-white font-bold"
                >
                  {submitting ? 'Saving Specs...' : 'Save Prototype Specifications'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrototypeSection;
