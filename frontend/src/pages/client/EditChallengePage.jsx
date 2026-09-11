import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { problemService } from '../../services/problemService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

const CATEGORIES = [
  'Education',
  'Healthcare',
  'Agriculture',
  'Water Management',
  'Sanitation',
  'Environment',
  'Energy',
  'Urban Infrastructure',
  'Accessibility',
  'Public Services',
  'Rural Livelihoods',
  'Other'
];

const DISTRICTS = [
  'Central Delhi',
  'East Delhi',
  'New Delhi',
  'North Delhi',
  'North East Delhi',
  'North West Delhi',
  'Shahdara',
  'South Delhi',
  'South East Delhi',
  'South West Delhi',
  'West Delhi'
];

const EditChallengePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Water Management',
    subcategory: '',
    expectedOutcome: '',
    district: 'Central Delhi',
    area: '',
    landmark: '',
    citizenUrgency: 'medium',
    citizenSeverity: 'moderate',
    tags: ''
  });

  const [challengeStatus, setChallengeStatus] = useState('SUBMITTED');
  const [challengeCode, setChallengeCode] = useState('');

  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await problemService.getProblemById(id);
        const p = res?.data?.problem || res?.problem;
        if (!p) {
          setError('Challenge record not found');
          return;
        }

        setChallengeStatus(p.status);
        setChallengeCode(p.code || '');

        setFormData({
          title: p.title || '',
          description: p.description || '',
          category: p.category || 'Water Management',
          subcategory: p.subcategory || '',
          expectedOutcome: p.expectedOutcome || '',
          district: p.district || 'Central Delhi',
          area: p.location?.area || '',
          landmark: p.location?.landmark || '',
          citizenUrgency: p.citizenUrgency || p.urgency || 'medium',
          citizenSeverity: p.citizenSeverity || p.severity || 'moderate',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : ''
        });
      } catch (err) {
        console.error('Failed to load challenge for editing:', err);
        setError(err.message || 'Failed to load challenge details.');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory.trim(),
        expectedOutcome: formData.expectedOutcome.trim(),
        district: formData.district,
        location: {
          area: formData.area.trim(),
          landmark: formData.landmark.trim()
        },
        citizenUrgency: formData.citizenUrgency,
        citizenSeverity: formData.citizenSeverity,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : []
      };

      await problemService.updateProblem(id, payload);
      setSuccessMsg('Challenge details updated successfully in the state registry.');
      setTimeout(() => {
        navigate(`/client/challenges/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to update challenge:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to update challenge details.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading challenge details for editing..." />;
  }

  if (error && !formData.title) {
    return (
      <div className="py-12 max-w-lg mx-auto font-serif">
        <ErrorState
          title="Cannot Edit Challenge"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // If status does not allow editing
  const isEditable = ['SUBMITTED', 'NEEDS_INFORMATION'].includes(challengeStatus);
  if (!isEditable) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 font-serif py-8">
        <div className="bg-amber-50 border border-amber-300 rounded-sm p-6 text-center space-y-3">
          <Lock className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-xl font-bold text-gov-navy">Editing Locked</h2>
          <p className="text-xs text-gov-text-secondary leading-relaxed">
            This challenge is currently in <strong>{challengeStatus.replace('_', ' ')}</strong> status.
            Once a report has begun administrative vetting or university cohort assignment, specifications cannot be modified directly by the citizen.
          </p>
          <div className="pt-2">
            <Link to={`/client/challenges/${id}`}>
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Return to Challenge Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-serif">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/client/challenges/${id}`}
          className="inline-flex items-center text-xs text-gov-maroon hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Challenge
        </Link>
        <span className="font-mono text-xs font-bold text-gov-maroon bg-gov-maroon-surface px-2 py-0.5 rounded-xs border border-gov-maroon-border">
          {challengeCode || 'DEL-REPORT'}
        </span>
      </div>

      <div className="bg-white border border-gov-border rounded-sm p-6 shadow-gov-card">
        <h1 className="text-2xl font-bold text-gov-navy">Edit Societal Challenge</h1>
        <p className="text-xs text-gov-text-secondary mt-1">
          Revise your problem statement before final municipal verification and university cohort adoption.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card accent="maroon" title="Problem Specifications">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Challenge Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Civic Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gov-border rounded-xs px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Detailed Problem Description *
              </label>
              <textarea
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gov-border rounded-xs p-3 text-xs leading-relaxed focus:ring-1 focus:ring-gov-maroon outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Expected Practical Outcome
              </label>
              <input
                type="text"
                name="expectedOutcome"
                value={formData.expectedOutcome}
                onChange={handleChange}
                className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              />
            </div>
          </div>
        </Card>

        <Card accent="navy" title="Location Details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Delhi District *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full border border-gov-border rounded-xs px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Area / Locality
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              />
            </div>
          </div>
        </Card>

        <Card accent="none" title="Urgency & Impact Flags">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Urgency Level
              </label>
              <select
                name="citizenUrgency"
                value={formData.citizenUrgency}
                onChange={handleChange}
                className="w-full border border-gov-border rounded-xs px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="immediate">Immediate</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Observed Severity
              </label>
              <select
                name="citizenSeverity"
                value={formData.citizenSeverity}
                onChange={handleChange}
                className="w-full border border-gov-border rounded-xs px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. water-logging, road-cratering, east-delhi"
                className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link to={`/client/challenges/${id}`}>
            <Button variant="ghost" size="sm" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={saving}
            icon={Save}
          >
            {saving ? 'Saving Changes...' : 'Save & Submit Revisions'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditChallengePage;
