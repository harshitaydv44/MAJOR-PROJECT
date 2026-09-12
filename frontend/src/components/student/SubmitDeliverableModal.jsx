import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { projectService } from '../../services/projectService';
import Button from '../common/Button';
import {
  Upload,
  FileCheck,
  X,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  Paperclip
} from 'lucide-react';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'zip', 'webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SubmitDeliverableModal = ({
  milestone,
  milestones = [],
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      milestoneId: milestone?._id || (milestones[0]?._id || ''),
      title: '',
      description: '',
      submissionNote: '',
      externalLink: ''
    }
  });

  const activeMilestoneId = watch('milestoneId');
  const activeMilestone = milestones.find((m) => m._id === activeMilestoneId) || milestone;

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setApiError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setApiError(`Invalid file format .${ext}. Permitted formats: PDF, DOC, DOCX, ZIP, PNG, JPG.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setApiError(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      setApiError('Please select a deliverable file attachment (PDF, DOC, ZIP, or Image).');
      return;
    }

    const targetMilestoneId = data.milestoneId || milestone?._id;
    if (!targetMilestoneId) {
      setApiError('Please select an active milestone for this deliverable.');
      return;
    }

    setSubmitting(true);
    setApiError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', data.title.trim());
      formData.append('description', data.description.trim());
      if (data.submissionNote?.trim()) {
        formData.append('submissionNote', data.submissionNote.trim());
      }
      if (data.externalLink?.trim()) {
        formData.append('externalLink', data.externalLink.trim());
      }

      await projectService.submitStudentDeliverable(targetMilestoneId, formData);

      reset();
      setSelectedFile(null);
      if (onSuccess) {
        onSuccess(targetMilestoneId);
      }
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to submit deliverable');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
      <div className="bg-white border border-gov-border rounded-sm max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-gov-maroon/10 border border-gov-maroon/20 flex items-center justify-center text-gov-maroon">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gov-navy text-base">Submit Milestone Deliverable</h3>
              <p className="text-[11px] text-gov-text-secondary">
                Upload formal engineering artifact for Faculty Mentor & Council validation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {apiError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          {/* Milestone Selection (if multiple) */}
          {milestones.length > 1 && !milestone ? (
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Target Project Milestone *
              </label>
              <select
                {...register('milestoneId', { required: 'Please select a milestone' })}
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 text-xs bg-gov-sand-50/50 outline-none focus:border-gov-maroon"
              >
                {milestones.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.projectTitle ? `[${m.projectTitle}] ` : ''}
                    {m.title} ({m.status})
                  </option>
                ))}
              </select>
              {errors.milestoneId && (
                <p className="text-rose-600 text-[11px] mt-0.5">{errors.milestoneId.message}</p>
              )}
            </div>
          ) : activeMilestone ? (
            <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Milestone Target</span>
              <div className="font-bold text-gov-navy text-xs">{activeMilestone.title}</div>
              {activeMilestone.projectTitle && (
                <div className="text-[11px] text-gov-text-secondary">Project: {activeMilestone.projectTitle}</div>
              )}
            </div>
          ) : null}

          {/* Deliverable Title */}
          <div>
            <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
              Deliverable Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Acoustic Transducer PCB Schematic & Lab Test Bench Logs"
              {...register('title', {
                required: 'Deliverable title is required',
                minLength: { value: 4, message: 'Title must be at least 4 characters' }
              })}
              className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 text-xs outline-none focus:border-gov-maroon"
            />
            {errors.title && (
              <p className="text-rose-600 text-[11px] mt-0.5">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
              Technical Description & Methodology *
            </label>
            <textarea
              rows={3}
              placeholder="Summarize the technical outputs, engineering methodology, and test results included in this submission..."
              {...register('description', {
                required: 'Technical description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
              className="w-full font-serif border border-gov-border rounded-xs p-2.5 text-xs outline-none focus:border-gov-maroon"
            />
            {errors.description && (
              <p className="text-rose-600 text-[11px] mt-0.5">{errors.description.message}</p>
            )}
          </div>

          {/* Submission Note */}
          <div>
            <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
              Submission Note for Faculty Mentor (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Provide special instructions, calibration caveats, or specific aspects you want the mentor to evaluate..."
              {...register('submissionNote')}
              className="w-full font-serif border border-gov-border rounded-xs p-2 text-xs outline-none focus:border-gov-maroon"
            />
          </div>

          {/* External Link */}
          <div>
            <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1 flex items-center space-x-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-gov-maroon" />
              <span>External Repository or Hardware Demo Link (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/delhi-innovation/iot-sensor-firmware"
              {...register('externalLink', {
                pattern: {
                  value: /^https?:\/\/.+/i,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
              className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 text-xs outline-none focus:border-gov-maroon"
            />
            {errors.externalLink && (
              <p className="text-rose-600 text-[11px] mt-0.5">{errors.externalLink.message}</p>
            )}
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
              Deliverable Artifact File * (Max 10MB)
            </label>
            <div className="border-2 border-dashed border-gov-border hover:border-gov-maroon rounded-xs p-4 bg-gov-sand-50/50 text-center space-y-2 transition-colors">
              <input
                type="file"
                id="deliverable-file-input"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.webp"
              />
              <label
                htmlFor="deliverable-file-input"
                className="cursor-pointer inline-flex items-center space-x-2 text-gov-maroon font-bold hover:underline"
              >
                <Paperclip className="w-4 h-4" />
                <span>{selectedFile ? 'Replace Attached File' : 'Browse & Attach File'}</span>
              </label>

              {selectedFile ? (
                <div className="p-2 bg-white border border-emerald-300 rounded-xs flex items-center justify-between text-left">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span className="font-semibold text-gov-navy truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    Ready
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-gov-text-muted">
                  Supported formats: PDF, DOC, DOCX, ZIP, PNG, JPG (Cloudinary Secure Vault)
                </p>
              )}
            </div>
          </div>

          {/* Cloudinary Metadata Policy Note */}
          <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs text-[10px] text-gov-text-secondary leading-relaxed">
            <strong>Data Integrity:</strong> Uploaded files are vaulted via Cloudinary CDN. File metadata (title, URL, MIME type, upload timestamp, and submitter credentials) is permanently archived in the official innovation register.
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={submitting}
              icon={Upload}
              className="bg-gov-maroon text-white"
            >
              {submitting ? 'Vaulting & Submitting...' : 'Upload & Submit Deliverable'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitDeliverableModal;
