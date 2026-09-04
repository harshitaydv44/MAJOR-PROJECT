import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import Button from '../common/Button';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  Sliders,
  AlertCircle
} from 'lucide-react';

const WorkflowActionModal = ({ challenge, mode, onClose, onSuccess }) => {
  // Modes: 'VALIDATE' | 'REJECT' | 'REQUEST_INFO' | 'MARK_DUPLICATE' | 'CHANGE_PRIORITY'
  const [comment, setComment] = useState('');
  const [duplicateId, setDuplicateId] = useState('');
  const [priority, setPriority] = useState(challenge?.priority || 'medium');
  const [urgency, setUrgency] = useState(challenge?.urgency || 'medium');
  const [severity, setSeverity] = useState(challenge?.severity || 'moderate');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const titles = {
    VALIDATE: 'Approve & Validate Challenge Statement',
    REJECT: 'Reject Challenge Submission',
    REQUEST_INFO: 'Request More Information from Submitter',
    MARK_DUPLICATE: 'Mark as Duplicate Submission',
    CHANGE_PRIORITY: 'Update Priority, Urgency & Severity'
  };

  const icons = {
    VALIDATE: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    REJECT: <XCircle className="w-5 h-5 text-rose-600" />,
    REQUEST_INFO: <HelpCircle className="w-5 h-5 text-amber-600" />,
    MARK_DUPLICATE: <Copy className="w-5 h-5 text-zinc-600" />,
    CHANGE_PRIORITY: <Sliders className="w-5 h-5 text-gov-navy" />
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'VALIDATE') {
        await adminService.validateChallenge(
          challenge._id,
          comment.trim() || 'Formally vetted and validated by Delhi State Innovation Council'
        );
      } else if (mode === 'REJECT') {
        if (!comment.trim()) {
          setError('Mandatory rejection justification is required for official audit records');
          setLoading(false);
          return;
        }
        await adminService.rejectChallenge(challenge._id, comment.trim());
      } else if (mode === 'REQUEST_INFO') {
        if (!comment.trim()) {
          setError('Please specify the questions or documents requested from the citizen');
          setLoading(false);
          return;
        }
        await adminService.requestMoreInformation(challenge._id, comment.trim());
      } else if (mode === 'MARK_DUPLICATE') {
        if (!duplicateId.trim()) {
          setError('Please provide the reference Original Challenge ID');
          setLoading(false);
          return;
        }
        await adminService.markDuplicate(challenge._id, duplicateId.trim(), comment.trim());
      } else if (mode === 'CHANGE_PRIORITY') {
        await adminService.changePriority(challenge._id, {
          priority,
          urgency,
          severity,
          comment: comment.trim() || 'Priority reassessed by state administration'
        });
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Workflow action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
      <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2">
            {icons[mode]}
            <h3 className="font-bold text-gov-navy text-base">{titles[mode]}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Challenge Context */}
        <div className="bg-gov-sand-50 p-3 rounded-xs border border-gov-border text-xs space-y-1">
          <div className="font-bold text-gov-navy truncate">
            [{challenge?.code}] {challenge?.title}
          </div>
          <div className="text-[11px] text-gov-text-muted">
            Current Status: <strong>{challenge?.status}</strong> &bull; District:{' '}
            <strong>{challenge?.district}</strong>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'VALIDATE' && (
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                State Validation Directive / Compliance Note
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Confirming municipal impact and suitability for university prototype grant..."
                className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:ring-1 focus:ring-emerald-700 outline-none"
              />
            </div>
          )}

          {mode === 'REJECT' && (
            <div>
              <label className="block font-bold text-rose-900 uppercase tracking-wider mb-1">
                Official Rejection Reason * (Will be notified to submitter)
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="State clearly why this submission was rejected (e.g. out of municipal jurisdiction, commercial advertising, or lacking evidence)..."
                className="w-full text-xs font-serif border border-rose-300 rounded-xs px-3 py-2 focus:ring-1 focus:ring-rose-700 outline-none"
              />
            </div>
          )}

          {mode === 'REQUEST_INFO' && (
            <div>
              <label className="block font-bold text-amber-900 uppercase tracking-wider mb-1">
                Inquiries & Evidence Requirements * (Citizen will be notified)
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Specify missing photos, laboratory test logs, exact geo-coordinates, or clarification needed..."
                className="w-full text-xs font-serif border border-amber-300 rounded-xs px-3 py-2 focus:ring-1 focus:ring-amber-700 outline-none"
              />
            </div>
          )}

          {mode === 'MARK_DUPLICATE' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Reference Original Challenge ID / MongoDB Object ID *
                </label>
                <input
                  required
                  type="text"
                  value={duplicateId}
                  onChange={(e) => setDuplicateId(e.target.value)}
                  placeholder="e.g. 672... or Original Challenge MongoDB ID"
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:ring-1 focus:ring-gov-navy outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Cross-Reference Remarks
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Notes explaining relationship with original challenge..."
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:ring-1 focus:ring-gov-navy outline-none"
                />
              </div>
            </div>
          )}

          {mode === 'CHANGE_PRIORITY' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-gov-border rounded-xs px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-gov-navy"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full border border-gov-border rounded-xs px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-gov-navy"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="immediate">Immediate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full border border-gov-border rounded-xs px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-gov-navy"
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Reason for Rating Adjustment
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Ground inspection confirmed severe public health risk"
                  className="w-full border border-gov-border rounded-xs px-3 py-1.5 focus:ring-1 focus:ring-gov-navy"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={loading}
              className={
                mode === 'VALIDATE'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : mode === 'REJECT'
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : ''
              }
            >
              {loading ? 'Executing...' : 'Confirm Action'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkflowActionModal;
