import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { PORTAL_TITLE } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { SamadhanSetuEmblem } from '../components/common/SamadhanSetuLogo';
import { User, Mail, Lock, Building, Phone, AlertCircle, ArrowLeft, CheckSquare, Eye, EyeOff, MapPin } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') || 'CLIENT').toUpperCase();

  const { register } = useAuth();

  // Registration Roles (Strictly exclude ADMIN from public registration)
  const registrationRoles = [
    { id: 'CLIENT', label: 'Citizen / Client', description: 'Report local community challenges' },
    { id: 'UNIVERSITY', label: 'University Dean / Admin', description: 'Coordinate university research cohort' },
    { id: 'FACULTY', label: 'Faculty Mentor', description: 'Supervise multidisciplinary projects' },
    { id: 'STUDENT', label: 'Student Innovator', description: 'Develop societal solutions & prototypes' },
    { id: 'INDUSTRY', label: 'Industry / Startup Partner', description: 'Fund, mentor, and sponsor technologies' }
  ];

  // Default to CLIENT if invalid or ADMIN passed in query
  const safeInitialRole = registrationRoles.some((r) => r.id === initialRole) ? initialRole : 'CLIENT';

  const [role, setRole] = useState(safeInitialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [district, setDistrict] = useState('Central Delhi');
  const [terms, setTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const delhiDistricts = [
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

  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Full legal name is required.';
    } else if (name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@domain.in).';
    }

    if (!phone.trim()) {
      errors.phone = 'Contact phone number is required.';
    } else if (!/^[0-9+\-\s]{8,15}$/.test(phone.trim())) {
      errors.phone = 'Please enter a valid phone number (8-15 digits).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (['UNIVERSITY', 'FACULTY', 'STUDENT', 'INDUSTRY'].includes(role) && !organization.trim()) {
      errors.organization = `Organization / Institution is required for ${role} registration.`;
    }

    if (!terms) {
      errors.terms = 'You must agree to the portal terms and Delhi digital public goods standards.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role,
        organization: organization.trim(),
        district,
        terms
      });

      // Role-based destination mapping
      const redirectMap = {
        CLIENT: '/client',
        UNIVERSITY: '/university',
        INDUSTRY: '/industry',
        FACULTY: '/faculty',
        STUDENT: '/student'
      };

      navigate(redirectMap[role] || '/client');
    } catch (err) {
      setGeneralError(err.message || 'Registration failed. Please check the provided information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Link
          to="/select-role"
          className="inline-flex items-center text-xs font-serif text-gov-maroon hover:underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Portal Role Selection
        </Link>
        <div className="flex justify-center mb-3">
          <SamadhanSetuEmblem size={52} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gov-navy">
          Stakeholder Account Onboarding
        </h2>
        <p className="text-xs font-serif text-gov-text-secondary mt-1">
          {PORTAL_TITLE} (समाधान सेतु) &bull; National & State Innovation Network
        </p>
      </div>

      <Card
        accent="maroon"
        title="Official Stakeholder Registration"
        subtitle="Create a verified identity to report challenges, build solutions, or sponsor projects"
      >
        {generalError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-serif rounded-sm flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stakeholder Role Selection */}
          <div>
            <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
              Select Stakeholder Role *
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setFieldErrors((prev) => ({ ...prev, organization: undefined }));
              }}
              className="w-full text-sm font-serif border border-gov-border rounded-sm px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-maroon"
            >
              {registrationRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} — {r.description}
                </option>
              ))}
            </select>
            <p className="text-[11px] font-serif text-gov-text-muted mt-1">
              Note: Government administrative credentials cannot be self-registered and are provisioned directly by the state nodal cell.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
              Full Legal Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Verma / Priya Sharma"
                className={`w-full text-sm font-serif border rounded-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-maroon ${
                  fieldErrors.name ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                }`}
              />
              <User className="w-4 h-4 text-gov-text-muted absolute left-3 top-2.5" />
            </div>
            {fieldErrors.name && (
              <p className="text-xs text-red-600 font-serif mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
                Official / Personal Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@institution.edu.in"
                  className={`w-full text-sm font-serif border rounded-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-maroon ${
                    fieldErrors.email ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                  }`}
                />
                <Mail className="w-4 h-4 text-gov-text-muted absolute left-3 top-2.5" />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-600 font-serif mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
                Contact Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full text-sm font-serif border rounded-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-maroon ${
                    fieldErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                  }`}
                />
                <Phone className="w-4 h-4 text-gov-text-muted absolute left-3 top-2.5" />
              </div>
              {fieldErrors.phone && (
                <p className="text-xs text-red-600 font-serif mt-1">{fieldErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Organization / Affiliation (Required for institutional roles, optional for citizens) */}
          <div>
            <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
              Organization / University / Resident Welfare Association {role !== 'CLIENT' && '*'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={
                  role === 'CLIENT'
                    ? 'e.g. RWA Mayur Vihar or Individual Resident'
                    : 'e.g. Delhi Technological University (DTU) / Tata Power'
                }
                className={`w-full text-sm font-serif border rounded-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-maroon ${
                  fieldErrors.organization ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                }`}
              />
              <Building className="w-4 h-4 text-gov-text-muted absolute left-3 top-2.5" />
            </div>
            {fieldErrors.organization && (
              <p className="text-xs text-red-600 font-serif mt-1">{fieldErrors.organization}</p>
            )}
          </div>

          {/* Delhi District */}
          <div>
            <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
              Delhi District *
            </label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-sm font-serif border border-gov-border rounded-sm pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-maroon"
              >
                {delhiDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-gov-text-muted absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
                Password (min 6 characters) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  className={`w-full text-sm font-serif border rounded-sm pl-9 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-gov-maroon ${
                    fieldErrors.password ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                  }`}
                />
                <Lock className="w-4 h-4 text-gov-text-muted absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gov-text-muted hover:text-gov-navy"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 font-serif mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full text-sm font-serif border rounded-sm pl-9 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-gov-maroon ${
                    fieldErrors.confirmPassword ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                  }`}
                />
                <Lock className="w-4 h-4 text-gov-text-muted absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gov-text-muted hover:text-gov-navy"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600 font-serif mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-2">
            <label className="flex items-start space-x-2.5 cursor-pointer text-xs font-serif text-gov-text-secondary">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 accent-gov-maroon rounded-xs w-4 h-4"
              />
              <span>
                I agree to the <strong>Delhi Public Sector Innovation Terms of Service</strong>, Privacy Policy, and digital public goods guidelines.
              </span>
            </label>
            {fieldErrors.terms && (
              <p className="text-xs text-red-600 font-serif mt-1">{fieldErrors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating Official Account...' : 'Register as Stakeholder'}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gov-border text-center text-xs font-serif text-gov-text-secondary">
          <span>Already registered with the portal? </span>
          <Link
            to="/login"
            className="text-gov-maroon font-semibold hover:underline"
          >
            Sign In Here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
