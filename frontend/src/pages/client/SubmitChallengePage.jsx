import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { problemService } from '../../services/problemService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  FileText,
  MapPin,
  Upload,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Trash2,
  Navigation,
  ArrowRight,
  Info,
  ShieldAlert,
  Layers
} from 'lucide-react';

const DISTRICT_COORDINATES = {
  'Central Delhi': { lat: 28.6448, lng: 77.2167 },
  'East Delhi': { lat: 28.6280, lng: 77.2950 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'North Delhi': { lat: 28.7041, lng: 77.1025 },
  'North East Delhi': { lat: 28.7180, lng: 77.2750 },
  'North West Delhi': { lat: 28.7500, lng: 77.1200 },
  'Shahdara': { lat: 28.6738, lng: 77.2882 },
  'South Delhi': { lat: 28.5355, lng: 77.2250 },
  'South East Delhi': { lat: 28.5500, lng: 77.2700 },
  'South West Delhi': { lat: 28.5921, lng: 77.0460 },
  'West Delhi': { lat: 28.6667, lng: 77.0667 }
};

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

const SubmitChallengePage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdChallenge, setCreatedChallenge] = useState(null);
  const [locationCoords, setLocationCoords] = useState(DISTRICT_COORDINATES['Central Delhi']);
  const [detectingGps, setDetectingGps] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
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
      estimatedPeopleAffected: '1000 - 5000',
      affectedGroups: 'Local residents and daily commuters',
      existingAttempts: '',
      tags: ''
    }
  });

  const selectedDistrict = watch('district');

  // When district changes, update default coordinates
  const handleDistrictChange = (e) => {
    const dist = e.target.value;
    setValue('district', dist);
    if (DISTRICT_COORDINATES[dist]) {
      setLocationCoords(DISTRICT_COORDINATES[dist]);
    }
  };

  // Browser Geolocation Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        });
        setDetectingGps(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setDetectingGps(false);
        alert('Could not retrieve GPS position. Defaulting to selected district center.');
      },
      { timeout: 8000 }
    );
  };

  // File Upload Handlers
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        alert(`File ${f.name} exceeds the 10MB limit.`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Form Submit
  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('description', data.description.trim());
      formData.append('category', data.category);
      if (data.subcategory) formData.append('subcategory', data.subcategory.trim());
      if (data.expectedOutcome) formData.append('expectedOutcome', data.expectedOutcome.trim());
      formData.append('district', data.district);

      const locationPayload = {
        area: data.area ? data.area.trim() : '',
        landmark: data.landmark ? data.landmark.trim() : '',
        coordinates: locationCoords
      };
      formData.append('location', JSON.stringify(locationPayload));

      const impactPayload = {
        estimatedPeopleAffected: data.estimatedPeopleAffected,
        affectedGroups: data.affectedGroups,
        existingAttempts: data.existingAttempts
      };
      formData.append('impact', JSON.stringify(impactPayload));

      formData.append('citizenUrgency', data.citizenUrgency);
      formData.append('citizenSeverity', data.citizenSeverity);

      if (data.tags) {
        const tagList = data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        formData.append('tags', JSON.stringify(tagList));
      }

      // Append files
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await problemService.createProblem(formData, true);
      const created = response?.data?.challenge || response?.challenge;
      setCreatedChallenge(created);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMsg(
        err.response?.data?.message || err.message || 'Failed to submit problem statement. Please check your network.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Success State View
  if (createdChallenge) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 font-serif py-6">
        <div className="bg-white border-2 border-emerald-600 rounded-sm p-8 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Official Grievance Registered
          </span>

          <h2 className="text-2xl font-bold text-gov-navy">
            Challenge Submitted Successfully
          </h2>

          <p className="text-xs text-gov-text-secondary max-w-md mx-auto leading-relaxed">
            Your societal challenge has been assigned an official GNCTD Reference Code and queued for screening by the Delhi District Innovation Cell.
          </p>

          <div className="p-4 bg-gov-sand-50 border border-gov-border rounded-xs inline-block my-2">
            <span className="text-[11px] text-gov-text-muted block">Official Tracking Code:</span>
            <span className="font-mono text-xl font-bold text-gov-maroon tracking-wider">
              {createdChallenge.code}
            </span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={`/client/challenges/${createdChallenge._id}`}>
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Track Challenge Progress
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreatedChallenge(null);
                setFiles([]);
              }}
            >
              Submit Another Challenge
            </Button>
            <Link to="/client">
              <Button variant="ghost" size="sm">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-serif">
      {/* Header Banner */}
      <div className="bg-white border border-gov-border rounded-sm p-6 shadow-gov-card">
        <div className="flex items-center space-x-2 text-xs text-gov-maroon font-bold uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Government of NCT of Delhi &bull; Public Innovation Registry</span>
        </div>
        <h1 className="text-2xl font-bold text-gov-navy">
          Lodge Societal Challenge
        </h1>
        <p className="text-xs text-gov-text-secondary mt-1 max-w-3xl leading-relaxed">
          Report recurring community challenges in sanitation, water supply, air quality, or urban infrastructure. Qualified submissions are verified by state authorities and adopted by research labs across Delhi universities for prototype development.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Problem Definition */}
        <Card accent="maroon" title="1. Problem Definition & Focus Area">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Challenge Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Chronic Stormwater Logging and Drain Siltation in Patparganj Industrial Area"
                {...register('title', {
                  required: 'Title is mandatory',
                  minLength: { value: 5, message: 'Minimum 5 characters' },
                  maxLength: { value: 250, message: 'Maximum 250 characters' }
                })}
                className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              />
              {errors.title && (
                <p className="text-red-600 text-[11px] mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Civic Category *
                </label>
                <select
                  {...register('category', { required: true })}
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
                  Subcategory (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Open drain overflow, Road cratering"
                  {...register('subcategory')}
                  className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Detailed Problem Description *
              </label>
              <textarea
                rows={5}
                placeholder="Describe the problem in detail: when does it occur, what root cause is suspected, what disruption does it cause to households, businesses, or public health..."
                {...register('description', {
                  required: 'Detailed description is mandatory',
                  minLength: { value: 20, message: 'Minimum 20 characters required' }
                })}
                className="w-full border border-gov-border rounded-xs p-3 text-xs leading-relaxed focus:ring-1 focus:ring-gov-maroon outline-none"
              />
              {errors.description && (
                <p className="text-red-600 text-[11px] mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Expected Practical Outcome (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Automated sensor-based silt clearing or decentralized water filtration unit"
                {...register('expectedOutcome')}
                className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Jurisdiction & Geographical Coordinates */}
        <Card accent="navy" title="2. Delhi Location & Geographic Coordinates">
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Delhi District *
                </label>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className="w-full border border-gov-border rounded-xs px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
                >
                  {Object.keys(DISTRICT_COORDINATES).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Ward / Locality / Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ward 42, Mayur Vihar Phase 1"
                  {...register('area')}
                  className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Prominent Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Mother Dairy Plant"
                  {...register('landmark')}
                  className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
                />
              </div>
            </div>

            {/* Coordinates Selector */}
            <div className="p-3.5 bg-gov-sand-50 border border-gov-border rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gov-maroon flex-shrink-0" />
                <span className="text-[11px] text-gov-text-secondary">
                  Geo Coordinates: <strong>Lat {locationCoords.lat}, Lng {locationCoords.lng}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingGps}
                className="inline-flex items-center px-3 py-1.5 bg-white border border-gov-border rounded-xs text-[11px] font-bold text-gov-navy hover:bg-gov-sand-100 transition-colors"
              >
                <Navigation className="w-3 h-3 mr-1 text-gov-maroon" />
                {detectingGps ? 'Detecting GPS...' : 'Use My GPS Location'}
              </button>
            </div>
          </div>
        </Card>

        {/* Section 3: Community Impact & Severity */}
        <Card accent="none" title="3. Community Impact & Grievance Severity">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Citizen Urgency Level
              </label>
              <select
                {...register('citizenUrgency')}
                className="w-full border border-gov-border rounded-xs px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              >
                <option value="low">Low (Routine concern)</option>
                <option value="medium">Medium (Recurring problem)</option>
                <option value="high">High (Severe disruption)</option>
                <option value="immediate">Immediate (Hazardous/Hazard risk)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Observed Severity
              </label>
              <select
                {...register('citizenSeverity')}
                className="w-full border border-gov-border rounded-xs px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              >
                <option value="minor">Minor (Inconvenience)</option>
                <option value="moderate">Moderate (Persistent nuisance)</option>
                <option value="severe">Severe (Health/safety impact)</option>
                <option value="critical">Critical (Immediate danger)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Estimated People Impacted
              </label>
              <select
                {...register('estimatedPeopleAffected')}
                className="w-full border border-gov-border rounded-xs px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              >
                <option value="Under 500">Under 500 residents</option>
                <option value="500 - 2,000">500 - 2,000 residents</option>
                <option value="2,000 - 10,000">2,000 - 10,000 residents</option>
                <option value="10,000+">10,000+ (Wide locality)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Prior Municipal Attempts / Past Complaints (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Lodged complaint with MCD sanitation ward in November, temporary dredging conducted but clogged again."
                {...register('existingAttempts')}
                className="w-full border border-gov-border rounded-xs px-3 py-2 text-xs focus:ring-1 focus:ring-gov-maroon outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Section 4: File Evidence & Attachments */}
        <Card accent="none" title="4. Evidence Documents & Site Photographs">
          <div className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-gov-border rounded-sm p-6 text-center hover:bg-gov-sand-50 transition-colors">
              <Upload className="w-8 h-8 text-gov-maroon mx-auto mb-2" />
              <div className="font-bold text-gov-navy">Upload Site Photos, Water/Air Logs, or Documents</div>
              <p className="text-[11px] text-gov-text-muted mt-0.5">
                Supports JPG, PNG, WEBP, and PDF files (Max 10MB per file, up to 5 attachments)
              </p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-evidence-input"
              />
              <label
                htmlFor="file-evidence-input"
                className="mt-3 inline-block px-4 py-1.5 bg-gov-navy text-white text-xs font-bold rounded-xs cursor-pointer hover:bg-gov-navy/90"
              >
                Browse Files
              </label>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-gov-navy block text-[11px] uppercase tracking-wider">
                  Attached Files ({files.length}/5):
                </span>
                <div className="divide-y divide-gov-border border border-gov-border rounded-xs bg-white">
                  {files.map((file, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate mr-3">
                        <Paperclip className="w-4 h-4 text-gov-maroon flex-shrink-0" />
                        <span className="truncate text-gov-navy font-medium">{file.name}</span>
                        <span className="text-[10px] text-gov-text-muted flex-shrink-0">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button & Confirmation Notice */}
        <div className="bg-gov-sand-50 border border-gov-border rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-gov-text-secondary leading-snug">
            By submitting, you certify under the Delhi Public Innovation Framework that this report represents a genuine community grievance in the NCT of Delhi.
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0 w-full sm:w-auto">
            <Link to="/client" className="w-full sm:w-auto">
              <Button variant="ghost" size="sm" fullWidth disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              fullWidth
              disabled={submitting}
              icon={Upload}
            >
              {submitting ? 'Submitting to Registry...' : 'Submit Challenge'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitChallengePage;
