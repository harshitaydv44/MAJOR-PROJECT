import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Button from '../common/Button';
import LoadingState from '../common/LoadingState';
import { Building, GraduationCap, X, CheckCircle2, AlertCircle } from 'lucide-react';

const AssignUniversityModal = ({ challenge, onClose, onSuccess }) => {
  const [universities, setUniversities] = useState([]);
  const [selectedUniId, setSelectedUniId] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [department, setDepartment] = useState('');
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUnis = async () => {
      setLoading(true);
      try {
        const res = await adminService.getUniversities();
        const list = res.data?.universities || [];
        setUniversities(list);
        if (list.length > 0) {
          setSelectedUniId(list[0]._id);
        }
      } catch (err) {
        setError('Failed to load registered universities');
      } finally {
        setLoading(false);
      }
    };

    fetchUnis();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUniId) {
      setError('Please select an accredited university partner');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await adminService.assignUniversity(challenge._id, {
        universityId: selectedUniId,
        facultyLeadName: facultyName.trim(),
        facultyLeadDepartment: department.trim(),
        comment: comment.trim()
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to allocate university partner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
      <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-gov-maroon" />
            <h3 className="font-bold text-gov-navy text-base">
              Assign Challenge to University Partner
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Challenge Snippet */}
        <div className="bg-gov-sand-50 p-3 rounded-xs border border-gov-border text-xs space-y-1">
          <div className="font-bold text-gov-navy truncate">
            [{challenge.code || 'DEL-...'}] {challenge.title}
          </div>
          <div className="text-[11px] text-gov-text-muted">
            District: <strong>{challenge.district}</strong> &bull; Category: <strong>{challenge.category}</strong>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <LoadingState message="Loading registered universities..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Select University Partner *
              </label>
              <select
                required
                value={selectedUniId}
                onChange={(e) => setSelectedUniId(e.target.value)}
                className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
              >
                {universities.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} — {u.organization || 'Higher Education Lab'} ({u.district})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Designated Faculty Mentor
                </label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="e.g. Prof. S. K. Sharma"
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Academic Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Environmental Engineering"
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Administrative Directives / Scope
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Specify research directives, deliverables expectation, or funding sanction remarks..."
                className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
              />
            </div>

            <div className="pt-2 border-t border-gov-border flex items-center justify-end space-x-2">
              <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                {submitting ? 'Allocating Cohort...' : 'Confirm Allocation'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignUniversityModal;
