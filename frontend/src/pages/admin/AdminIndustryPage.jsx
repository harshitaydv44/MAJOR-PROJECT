import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Building2, Award, Mail, Phone, MapPin, RefreshCw } from 'lucide-react';

const AdminIndustryPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPartners = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getIndustryPartners();
      setPartners(res.data?.partners || []);
    } catch (err) {
      console.error('Failed to load industry partners:', err);
      setError(err.message || 'Failed to load corporate partners registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Industry & Corporate Partners ({partners.length})
          </h1>
          <p className="text-xs text-gov-text-secondary mt-1">
            Private enterprises, CSR foundations, and incubator networks co-sponsoring societal technology pilots in Delhi.
          </p>
        </div>

        <Button variant="subtle" size="sm" onClick={fetchPartners} icon={RefreshCw}>
          Refresh Partners
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading corporate partners..." />
      ) : error ? (
        <Card accent="none">
          <ErrorState
            title="Corporate Partners Unavailable"
            message={error}
            onRetry={fetchPartners}
            retryLabel="Retry Connection"
          />
        </Card>
      ) : partners.length === 0 ? (
        <Card accent="none">
          <EmptyState
            title="No Corporate Partners Registered"
            description="There are currently no industry or CSR partners registered in the platform."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {partners.map((partner) => (
            <Card key={partner._id} accent="navy" className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xs bg-gov-navy-surface text-gov-navy flex items-center justify-center border border-gov-border">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <Badge variant="gold">Ecosystem Sponsor</Badge>
                </div>

                <h3 className="text-base font-bold text-gov-navy leading-snug">
                  {partner.name}
                </h3>
                <p className="text-xs text-gov-text-secondary mt-0.5">
                  {partner.organization || 'Corporate CSR Foundation'}
                </p>

                <div className="mt-4 pt-3 border-t border-gov-border space-y-1.5 text-xs text-gov-text-muted">
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-gov-maroon" />
                    <span>Regional Office: <strong>{partner.district || 'Delhi NCR'}</strong></span>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-gov-maroon" />
                    <span>{partner.email}</span>
                  </div>

                  {partner.phone && (
                    <div className="flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-gov-maroon" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gov-border flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                  <Award className="w-4 h-4" />
                  <span>CSR Innovation Grant Active</span>
                </div>

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => alert(`Reviewing CSR grant details for: ${partner.name}`)}
                >
                  Portfolio
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminIndustryPage;
