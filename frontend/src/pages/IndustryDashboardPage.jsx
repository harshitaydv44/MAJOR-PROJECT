import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { challengeService } from '../services/challengeService';
import { Building2, Handshake, DollarSign, Rocket, Compass, CheckCircle2 } from 'lucide-react';

const IndustryDashboardPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pledgeSuccess, setPledgeSuccess] = useState('');

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await challengeService.getChallenges();
      if (res.data?.challenges) {
        setChallenges(res.data.challenges);
      }
    } catch (err) {
      console.error('Failed to load industry portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handlePledgeGrant = async (challengeId) => {
    const amountStr = prompt('Enter CSR Grant Pledge Amount in INR (e.g. 1000000 for ₹ 10 Lakh):', '1000000');
    if (!amountStr) return;

    try {
      await challengeService.sponsorChallenge(challengeId, {
        sponsoredAmount: Number(amountStr)
      });
      setPledgeSuccess(`CSR Grant of ₹ ${(Number(amountStr) / 100000).toFixed(1)} Lakh pledged successfully!`);
      setTimeout(() => setPledgeSuccess(''), 4000);
      fetchChallenges();
    } catch (err) {
      alert(err.message || 'Failed to pledge sponsorship');
    }
  };

  const sponsoredChallenges = challenges.filter((c) => c.sponsoredAmount > 0);
  const seekingSponsorship = challenges.filter((c) => !c.sponsoredAmount || c.sponsoredAmount === 0);
  const totalGrantPledged = sponsoredChallenges.reduce((acc, c) => acc + (c.sponsoredAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gov-navy-surface border border-gov-navy-border p-4 rounded-sm flex items-start space-x-3">
        <Building2 className="w-5 h-5 text-gov-navy flex-shrink-0 mt-0.5" />
        <div className="text-xs font-serif">
          <strong className="text-gov-navy font-bold">Industry & Startup Ecosystem Portal: </strong>
          Partner with Delhi universities to commercialize societal technologies, provide CSR innovation funding, offer engineering mentorship, and sponsor real-world pilot deployments.
        </div>
      </div>

      {pledgeSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-serif rounded-sm flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {pledgeSuccess}
        </div>
      )}

      {/* Industry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card accent="navy" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Sponsored Projects</div>
              <div className="text-2xl font-serif font-bold text-gov-navy mt-1">{sponsoredChallenges.length}</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-gov-navy-surface text-gov-navy flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Committed CSR Grants</div>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                ₹ {(totalGrantPledged / 100000).toFixed(1)} Lakh
              </div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Mentorship Hours</div>
              <div className="text-2xl font-serif font-bold text-gov-maroon mt-1">42 hrs</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-gov-maroon-surface text-gov-maroon flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Seeking Industry Support</div>
              <div className="text-2xl font-serif font-bold text-blue-700 mt-1">{seekingSponsorship.length}</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-700 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Innovation Sponsorship Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            accent="navy"
            title="University Solutions Seeking Industry Partnership"
            subtitle="Verified societal technologies requiring CSR grant funding, mentoring, or testing infrastructure"
          >
            {loading ? (
              <div className="py-8 text-center text-xs font-serif text-gov-text-muted">
                Loading portfolio from database...
              </div>
            ) : seekingSponsorship.length === 0 ? (
              <div className="py-8 text-center text-xs font-serif text-gov-text-muted">
                All current university initiatives have received corporate sponsorship.
              </div>
            ) : (
              <div className="divide-y divide-gov-border">
                {seekingSponsorship.map((c) => (
                  <div key={c._id} className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-gov-navy text-sm">
                        {c.title}
                      </h4>
                      <Badge variant="navy">Open for Sponsorship</Badge>
                    </div>
                    <p className="text-xs font-serif text-gov-text-secondary leading-relaxed">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs font-serif text-gov-text-muted">
                        District: <strong>{c.district}</strong> &bull; Category: {c.category}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePledgeGrant(c._id)}
                      >
                        Pledge CSR Grant
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Corporate Innovation Partnership" accent="none">
            <p className="text-xs font-serif text-gov-text-secondary leading-relaxed mb-4">
              Connect your company's Corporate Social Responsibility (CSR) and R&D resources with real civic problem solvers across Delhi.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => {
                  if (seekingSponsorship.length > 0) {
                    handlePledgeGrant(seekingSponsorship[0]._id);
                  }
                }}
              >
                Pledge Priority Grant (₹ 10 Lakh)
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => alert('Corporate Mentorship Enrollment Form will open next.')}
              >
                Register Corporate Mentor
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IndustryDashboardPage;
