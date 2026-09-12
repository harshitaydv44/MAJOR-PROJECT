import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PORTAL_TITLE } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { SamadhanSetuEmblem } from '../components/common/SamadhanSetuLogo';
import { Lock, Mail, AlertCircle, ArrowLeft, Key, Sparkles, Eye, EyeOff, HelpCircle, X } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // 1-Click Demo Accounts for testing all 6 stakeholder roles
  const demoAccounts = [
    { role: 'CLIENT', label: 'Citizen', email: 'citizen@delhi.gov.in', pwd: 'Password123', badge: 'Civic Reporter' },
    { role: 'ADMIN', label: 'Admin (IAS)', email: 'admin@delhi.gov.in', pwd: 'Password123', badge: 'Nodal Officer' },
    { role: 'UNIVERSITY', label: 'DTU Dean', email: 'university@dtu.ac.in', pwd: 'Password123', badge: 'Academic Dean' },
    { role: 'FACULTY', label: 'Prof. Sharma', email: 'faculty@dtu.ac.in', pwd: 'Password123', badge: 'Faculty Lead' },
    { role: 'STUDENT', label: 'Student Lead', email: 'student@nsut.ac.in', pwd: 'Password123', badge: 'Solution Dev' },
    { role: 'INDUSTRY', label: 'Tata Power', email: 'industry@tatapower.com', pwd: 'Password123', badge: 'Ecosystem Partner' }
  ];

  // Role to destination route mapping
  const roleRedirectMap = {
    CLIENT: '/client',
    ADMIN: '/admin',
    UNIVERSITY: '/university',
    INDUSTRY: '/industry',
    FACULTY: '/faculty',
    STUDENT: '/student'
  };

  const handleLoginSuccess = (userRole) => {
    const defaultPath = roleRedirectMap[userRole?.toUpperCase()] || '/student';
    const fromPath = location.state?.from?.pathname;

    // Only honor fromPath if it belongs to this role's workspace
    if (fromPath && fromPath !== '/login' && fromPath.startsWith(defaultPath)) {
      navigate(fromPath, { replace: true });
    } else {
      navigate(defaultPath, { replace: true });
    }
  };

  const handleQuickLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.pwd);
    setError('');
    setLoading(true);

    try {
      const res = await login({
        email: acc.email,
        password: acc.pwd,
        rememberMe: true
      });
      const userRole = res.data?.user?.role || acc.role;
      const targetPath = roleRedirectMap[userRole?.toUpperCase()] || '/student';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both registered email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login({
        email: email.trim().toLowerCase(),
        password,
        rememberMe
      });
      const userRole = res.data?.user?.role;
      handleLoginSuccess(userRole);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
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
          Stakeholder Sign In
        </h2>
        <p className="text-xs font-serif text-gov-text-secondary mt-1">
          {PORTAL_TITLE} (समाधान सेतु) &bull; Official Digital Public Access
        </p>
      </div>

      {/* 1-Click Quick Demo Login Strip */}
      <div className="bg-white border border-gov-border rounded-sm p-4 shadow-gov-card">
        <div className="flex items-center space-x-2 text-xs font-serif text-gov-navy font-bold mb-2.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>1-Click Stakeholder Demo Access:</span>
          <span className="text-[11px] text-gov-text-muted font-normal">(Instant test login across all 6 roles)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {demoAccounts.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleQuickLogin(acc)}
              className="p-2 text-left rounded-sm border border-gov-border hover:border-gov-maroon bg-white hover:bg-gov-sand-50 transition-all text-xs font-serif cursor-pointer shadow-xs"
            >
              <div className="font-semibold text-gov-navy truncate">{acc.label}</div>
              <div className="text-[10px] text-gov-maroon font-medium truncate">{acc.role}</div>
            </button>
          ))}
        </div>
      </div>

      <Card
        accent="maroon"
        title="Sign In with Credentials"
        subtitle="Access your authorized stakeholder dashboard and services"
      >
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-serif rounded-sm flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider mb-1">
              Registered Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., citizen@delhi.gov.in"
                className="w-full text-sm font-serif border border-gov-border rounded-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-maroon"
              />
              <Mail className="w-4 h-4 text-gov-text-muted absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-serif font-bold text-gov-navy uppercase tracking-wider">
                Account Password *
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-serif text-gov-maroon hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full text-sm font-serif border border-gov-border rounded-sm pl-9 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-gov-maroon"
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
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs font-serif text-gov-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-gov-maroon w-4 h-4 rounded-xs"
              />
              <span>Remember my session on this public computer</span>
            </label>
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
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gov-border text-center text-xs font-serif text-gov-text-secondary">
          <span>New stakeholder without an account? </span>
          <Link
            to="/register"
            className="text-gov-maroon font-semibold hover:underline"
          >
            Register Here
          </Link>
        </div>
      </Card>

      {/* Forgot Password UI Placeholder Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-2">
              <h3 className="text-base font-serif font-bold text-gov-navy flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-gov-maroon" />
                Forgot Account Password
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-serif text-gov-text-secondary leading-relaxed">
              Under Delhi Government public sector cybersecurity regulations, password resets for verified institutional stakeholders (Universities, Administrators, and Industry) are processed through your affiliated institutional nodal coordinator.
            </p>

            <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-sm text-xs font-serif">
              <strong>Citizen Helpline:</strong> Dial 1800-11-DELHI or email <span className="text-gov-maroon">support.innovation@delhi.gov.in</span> with your registered mobile number for OTP credential recovery.
            </div>

            <div className="text-right pt-2">
              <Button variant="primary" size="sm" onClick={() => setShowForgotModal(false)}>
                Understood, Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
