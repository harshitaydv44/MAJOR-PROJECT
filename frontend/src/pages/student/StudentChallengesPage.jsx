import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { challengeService } from '../../services/challengeService';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ChallengeCard from '../../components/student/ChallengeCard';
import ChallengeFilters from '../../components/student/ChallengeFilters';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Heart, X, CheckCircle, AlertCircle } from 'lucide-react';

const TABS = [
  { id: 'available', label: 'Available Challenges' },
  { id: 'assigned', label: 'Assigned Challenges' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' }
];

const StudentChallengesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    district: '',
    priority: '',
    status: '',
    university: '',
    requiredSkills: '',
    search: ''
  });

  // Express Interest Modal State
  const [interestModalChallenge, setInterestModalChallenge] = useState(null);
  const [interestNotes, setInterestNotes] = useState('');
  const [interestSubmitting, setInterestSubmitting] = useState(false);
  const [interestFeedback, setInterestFeedback] = useState(null);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        tab: activeTab,
        ...filters
      };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const res = await challengeService.getStudentChallenges(params);
      setChallenges(res.data?.challenges || []);
    } catch (err) {
      setError(err.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchParams({ tab: activeTab });
    fetchChallenges();
  }, [activeTab]);

  useEffect(() => {
    fetchChallenges();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleOpenInterestModal = (challenge) => {
    setInterestModalChallenge(challenge);
    setInterestNotes('');
    setInterestFeedback(null);
  };

  const handleCloseInterestModal = () => {
    setInterestModalChallenge(null);
    setInterestNotes('');
    setInterestFeedback(null);
  };

  const handleSubmitInterest = async (e) => {
    e.preventDefault();
    if (!interestModalChallenge) return;

    setInterestSubmitting(true);
    setInterestFeedback(null);
    try {
      await challengeService.expressInterest(interestModalChallenge._id, interestNotes);
      setInterestFeedback({
        type: 'success',
        message: 'Your expression of interest has been submitted successfully to the innovation council for review.'
      });
      await fetchChallenges();
      setTimeout(() => {
        handleCloseInterestModal();
      }, 1500);
    } catch (err) {
      setInterestFeedback({
        type: 'error',
        message: err.data?.message || err.message || 'Failed to submit expression of interest.'
      });
    } finally {
      setInterestSubmitting(false);
    }
  };

  if (loading && challenges.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <LoadingState message="Loading civic challenges from Delhi portal..." />
      </div>
    );
  }

  if (error && challenges.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ErrorState
          title="Failed to Load Challenges"
          message={error}
          onRetry={fetchChallenges}
          retryLabel="Retry Loading Challenges"
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-gov-navy">My Challenges</h1>
        <p className="text-sm font-serif text-gov-text-secondary mt-1">
          Explore validated grassroots problems across Delhi's 11 districts and submit innovation proposals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gov-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-serif font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-gov-maroon text-gov-maroon bg-white'
                : 'border-transparent text-gov-text-secondary hover:text-gov-navy hover:bg-gov-sand-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <ChallengeFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        activeTab={activeTab}
      />

      {/* Challenges List */}
      {challenges.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gov-border rounded-sm p-8">
          <p className="font-serif font-semibold text-gov-navy text-sm">
            {activeTab === 'assigned'
              ? 'No challenges assigned yet.'
              : 'No challenges found matching your criteria.'}
          </p>
          <p className="text-xs font-serif text-gov-text-muted mt-2">
            {activeTab === 'available'
              ? 'Try adjusting your filters or search terms to discover open municipal challenges.'
              : 'Assigned challenges will appear here as your multidisciplinary team joins university cohorts.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              activeTab={activeTab}
              onExpressInterest={handleOpenInterestModal}
            />
          ))}
        </div>
      )}

      {/* Express Interest Modal */}
      {interestModalChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-gov-border rounded-sm shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-gov-border bg-gov-sand-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-serif font-bold text-gov-maroon uppercase">
                  {interestModalChallenge.code || 'CHALLENGE'}
                </span>
                <h3 className="text-base font-serif font-bold text-gov-navy">
                  Express Student Innovation Interest
                </h3>
              </div>
              <button
                onClick={handleCloseInterestModal}
                className="text-gov-text-muted hover:text-gov-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInterest} className="p-6 space-y-4">
              <div className="p-3 bg-gov-sand-100/70 border border-gov-border rounded-sm text-xs font-serif">
                <div className="font-semibold text-gov-navy">{interestModalChallenge.title}</div>
                <div className="text-gov-text-secondary mt-1">
                  District: <span className="font-medium text-gov-navy">{interestModalChallenge.district}</span> &bull; Category:{' '}
                  <span className="font-medium text-gov-navy">{interestModalChallenge.category}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-gov-navy mb-1">
                  Innovation Proposal / Multidisciplinary Pitch Notes
                </label>
                <p className="text-[11px] font-serif text-gov-text-muted mb-2">
                  Outline your team's proposed technological approach, relevant engineering skills, and prototype roadmap.
                </p>
                <textarea
                  rows={4}
                  value={interestNotes}
                  onChange={(e) => setInterestNotes(e.target.value)}
                  placeholder="e.g. Our 3rd-year engineering team proposes an IoT sensor grid with low-power LoRa telemetry to continuously monitor turbidity and dispatch municipal alert webhooks..."
                  className="w-full p-3 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon resize-none"
                />
              </div>

              {/* Feedback Alerts */}
              {interestFeedback && (
                <div
                  className={`p-3 rounded-sm text-xs font-serif flex items-center space-x-2 ${
                    interestFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {interestFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{interestFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gov-border">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={handleCloseInterestModal}
                  disabled={interestSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={interestSubmitting}
                  icon={Heart}
                >
                  {interestSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChallengesPage;
