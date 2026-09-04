import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { GraduationCap, MapPin, Mail, Phone, FolderKanban, RefreshCw, ExternalLink } from 'lucide-react';

const AdminUniversitiesPage = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUniversities = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getUniversities();
      setUniversities(res.data?.universities || []);
    } catch (err) {
      console.error('Failed to load universities:', err);
      setError(err.message || 'Failed to load universities registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Partner University Institutions ({universities.length})
          </h1>
          <p className="text-xs text-gov-text-secondary mt-1">
            Higher education institutes and technical universities participating in the Delhi Societal Innovation Network.
          </p>
        </div>

        <Button variant="subtle" size="sm" onClick={fetchUniversities} icon={RefreshCw}>
          Refresh Registry
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading registered universities..." />
      ) : error ? (
        <Card accent="none">
          <ErrorState
            title="University Registry Unavailable"
            message={error}
            onRetry={fetchUniversities}
            retryLabel="Retry Registry Connection"
          />
        </Card>
      ) : universities.length === 0 ? (
        <Card accent="none">
          <EmptyState
            title="No Partner Universities Registered"
            description="There are currently no accredited universities registered in the state innovation portal."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {universities.map((uni) => (
            <Card key={uni._id} accent="maroon" className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xs bg-gov-maroon-surface text-gov-maroon flex items-center justify-center border border-gov-maroon-border">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <Badge variant="navy">Accredited Node</Badge>
                </div>

                <h3 className="text-base font-bold text-gov-navy leading-snug">
                  {uni.name}
                </h3>
                <p className="text-xs text-gov-text-secondary mt-0.5">
                  {uni.organization || 'Higher Education & Research Institution'}
                </p>

                <div className="mt-4 pt-3 border-t border-gov-border space-y-1.5 text-xs text-gov-text-muted">
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-gov-maroon" />
                    <span>Jurisdiction: <strong>{uni.district || 'NCT of Delhi'}</strong></span>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-gov-maroon" />
                    <span>{uni.email}</span>
                  </div>

                  {uni.phone && (
                    <div className="flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-gov-maroon" />
                      <span>{uni.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gov-border flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gov-navy">
                  <FolderKanban className="w-4 h-4 text-gov-maroon" />
                  <span>{uni.assignedChallengesCount || 0} Assigned Challenges</span>
                </div>

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => alert(`Reviewing academic research cohorts for: ${uni.name}`)}
                >
                  View Cohorts
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUniversitiesPage;
