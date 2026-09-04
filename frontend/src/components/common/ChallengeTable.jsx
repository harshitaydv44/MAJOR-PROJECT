import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import Button from './Button';
import { ArrowRight, Eye } from 'lucide-react';

const ChallengeTable = ({ challenges = [], onViewDetails, emptyMessage = 'No challenges found.' }) => {
  const navigate = useNavigate();

  const handleRowClick = (id) => {
    if (onViewDetails) {
      onViewDetails(id);
    } else {
      navigate(`/client/challenges/${id}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (challenges.length === 0) {
    return (
      <div className="py-10 text-center text-xs font-serif text-gov-text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs font-serif divide-y divide-gov-border">
        <thead>
          <tr className="bg-gov-sand-100 text-gov-navy font-bold uppercase tracking-wider text-[11px]">
            <th className="px-4 py-3 whitespace-nowrap">Challenge ID</th>
            <th className="px-4 py-3 min-w-[220px]">Title</th>
            <th className="px-4 py-3 whitespace-nowrap">Category</th>
            <th className="px-4 py-3 whitespace-nowrap">District</th>
            <th className="px-4 py-3 whitespace-nowrap">Submitted Date</th>
            <th className="px-4 py-3 whitespace-nowrap">Status</th>
            <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gov-border bg-white">
          {challenges.map((c) => (
            <tr
              key={c._id}
              onClick={() => handleRowClick(c._id)}
              className="hover:bg-gov-sand-50 cursor-pointer transition-colors duration-150"
            >
              <td className="px-4 py-3 whitespace-nowrap font-bold text-gov-maroon font-mono">
                {c.code || `DEL-${c._id.slice(-4).toUpperCase()}`}
              </td>

              <td className="px-4 py-3">
                <div className="font-semibold text-gov-navy leading-snug line-clamp-1 hover:text-gov-maroon">
                  {c.title}
                </div>
                {c.location?.landmark && (
                  <div className="text-[10px] text-gov-text-muted truncate mt-0.5">
                    Near {c.location.landmark}
                  </div>
                )}
              </td>

              <td className="px-4 py-3 whitespace-nowrap text-gov-text-secondary">
                {c.category}
              </td>

              <td className="px-4 py-3 whitespace-nowrap text-gov-text-secondary font-medium">
                {c.district}
              </td>

              <td className="px-4 py-3 whitespace-nowrap text-gov-text-muted">
                {formatDate(c.createdAt)}
              </td>

              <td className="px-4 py-3 whitespace-nowrap">
                <StatusBadge status={c.status} />
              </td>

              <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => handleRowClick(c._id)}
                  icon={Eye}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChallengeTable;
