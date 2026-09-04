import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import DelhiLeafletMap from '../../components/map/DelhiLeafletMap';
import Card from '../../components/common/Card';
import MetricCard from '../../components/common/MetricCard';
import LoadingState from '../../components/common/LoadingState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  MapPin,
  Filter,
  RefreshCw,
  X,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { CHALLENGE_CATEGORIES } from '../../utils/constants';

const STATUS_OPTIONS = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'VALIDATED',
  'ASSIGNED',
  'IN_PROGRESS',
  'SOLUTION_PROPOSED',
  'PILOT_TESTING',
  'RESOLVED',
  'REJECTED'
];

const AdminMapPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [mapZoom, setMapZoom] = useState(11);

  // Layer toggles
  const [showDistrictBubbles, setShowDistrictBubbles] = useState(true);
  const [showChallengeMarkers, setShowChallengeMarkers] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    category: 'All Categories',
    status: 'All Statuses',
    priority: 'All Priorities',
    dateRange: 'all'
  });

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getMapData(filters);
      setData(res.data);
      // Keep selected district updated if one was open
      if (selectedDistrict) {
        const updated = res.data?.districts?.find(
          (d) => d.district === selectedDistrict.district
        );
        if (updated) setSelectedDistrict(updated);
      }
    } catch (err) {
      console.error('Failed to load geographic intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'All Categories',
      status: 'All Statuses',
      priority: 'All Priorities',
      dateRange: 'all'
    });
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    if (district.coordinates) {
      setMapCenter(district.coordinates);
      setMapZoom(12);
    }
  };

  const handleCloseDetail = () => {
    setSelectedDistrict(null);
    setMapCenter({ lat: 28.6139, lng: 77.2090 });
    setMapZoom(11);
  };

  const { districts = [], markers = [], summary = {} } = data || {};

  // Filter markers belonging to selected district for detail drawer
  const districtChallenges = selectedDistrict
    ? markers.filter((m) => m.district === selectedDistrict.district)
    : [];

  return (
    <div className="space-y-4 font-serif max-w-7xl mx-auto pb-8">
      {/* Header Bar */}
      <div className="bg-white border border-gov-border rounded-xs p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gov-maroon font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4 text-gov-maroon" />
            <span>State GIS & Territorial Redressal Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Delhi District-Wise Challenge Distribution Map
          </h1>
          <p className="text-xs text-gov-text-secondary mt-1">
            Spatial monitoring across Delhi's 11 administrative revenue districts using OpenStreetMap telemetry.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={fetchMapData} icon={RefreshCw}>
            Refresh
          </Button>

          <div className="hidden sm:flex items-center space-x-2 bg-gov-sand-50 border border-gov-border rounded-xs px-3 py-1.5 text-xs">
            <span className="font-bold text-gov-navy">{summary.totalChallenges || 0} Total</span>
            <span className="text-gray-300">|</span>
            <span className="text-gov-maroon font-bold">{summary.totalHighPriority || 0} High Urgency</span>
            <span className="text-gray-300">|</span>
            <span className="text-emerald-700 font-bold">{summary.totalResolved || 0} Resolved</span>
          </div>
        </div>
      </div>

      {/* Interactive Filters & Layer Controls */}
      <div className="bg-white border border-gov-border rounded-xs p-3.5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Filters Form */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-1 font-bold text-gov-navy">
              <Filter className="w-3.5 h-3.5 text-gov-maroon" />
              <span>Filters:</span>
            </div>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gov-border rounded-xs px-2 py-1 bg-white outline-none text-xs font-serif"
            >
              <option value="All Categories">All Categories</option>
              {CHALLENGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gov-border rounded-xs px-2 py-1 bg-white outline-none text-xs font-serif"
            >
              <option value="All Statuses">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>

            {/* Priority */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="border border-gov-border rounded-xs px-2 py-1 bg-white outline-none text-xs font-serif"
            >
              <option value="All Priorities">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Date Range */}
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="border border-gov-border rounded-xs px-2 py-1 bg-white outline-none text-xs font-serif"
            >
              <option value="all">All Time</option>
              <option value="30d">Past 30 Days</option>
              <option value="90d">Past 90 Days</option>
              <option value="1y">Past 1 Year</option>
            </select>

            {(filters.category !== 'All Categories' ||
              filters.status !== 'All Statuses' ||
              filters.priority !== 'All Priorities' ||
              filters.dateRange !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-gov-maroon font-bold hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Layer toggles */}
          <div className="flex items-center space-x-2 border-l border-gov-border pl-3">
            <button
              onClick={() => setShowDistrictBubbles(!showDistrictBubbles)}
              className={`px-2.5 py-1 rounded-xs border text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
                showDistrictBubbles
                  ? 'bg-gov-navy text-white border-gov-navy'
                  : 'bg-white text-gray-500 border-gov-border'
              }`}
            >
              {showDistrictBubbles ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>District Aggregates</span>
            </button>

            <button
              onClick={() => setShowChallengeMarkers(!showChallengeMarkers)}
              className={`px-2.5 py-1 rounded-xs border text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
                showChallengeMarkers
                  ? 'bg-gov-maroon text-white border-gov-maroon'
                  : 'bg-white text-gray-500 border-gov-border'
              }`}
            >
              {showChallengeMarkers ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Challenge Pins ({markers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map & Detail Layout */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Map Container */}
        <div className={`transition-all duration-200 ${selectedDistrict ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-white border border-gov-border rounded-xs shadow-xs p-2 h-[640px]">
            {loading && !data ? (
              <LoadingState message="Connecting to Delhi GIS telemetry and OpenStreetMap tiles..." />
            ) : (
              <DelhiLeafletMap
                districts={districts}
                markers={markers}
                onSelectDistrict={handleSelectDistrict}
                selectedDistrict={selectedDistrict}
                center={mapCenter}
                zoom={mapZoom}
                showDistrictBubbles={showDistrictBubbles}
                showChallengeMarkers={showChallengeMarkers}
              />
            )}
          </div>

          {/* Map Legend */}
          <div className="bg-white border border-gov-border rounded-xs p-3 mt-2 flex flex-wrap items-center justify-between text-xs text-gov-text-secondary gap-3">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-gov-navy uppercase text-[10px]">Territorial Legend:</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-gov-navy inline-block"></span>
                <span className="text-[11px]">District Aggregation Bubble</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-gov-maroon inline-block"></span>
                <span className="text-[11px]">High-Urgency Concentration</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="text-[11px]">Selected District Focus</span>
              </div>
            </div>

            <span className="text-[10px] italic text-gray-400">
              Click any district bubble to inspect ward telemetry or pin markers for problem details.
            </span>
          </div>
        </div>

        {/* Selected District Detail Slideout Panel */}
        {selectedDistrict && (
          <div className="lg:col-span-4 bg-white border border-gov-border rounded-xs p-4 shadow-lg space-y-4 max-h-[640px] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gov-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-gov-maroon tracking-wider">
                  Administrative Revenue District
                </span>
                <h3 className="text-xl font-bold text-gov-navy leading-tight">
                  {selectedDistrict.district}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">
                  Centroid: {selectedDistrict.coordinates?.lat.toFixed(4)}&deg;N, {selectedDistrict.coordinates?.lng.toFixed(4)}&deg;E
                </span>
              </div>

              <button
                onClick={handleCloseDetail}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 transition-colors"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 District Indicators */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-gov-sand-50 rounded-xs border border-gov-border">
                <div className="text-xl font-bold text-gov-navy">
                  {selectedDistrict.challengeCount}
                </div>
                <div className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">
                  Challenge Count
                </div>
              </div>

              <div className="p-2.5 bg-gov-sand-50 rounded-xs border border-gov-border">
                <div className="text-xl font-bold text-gov-navy">
                  {selectedDistrict.activeProjects}
                </div>
                <div className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">
                  Active Projects
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xs border border-emerald-200">
                <div className="text-xl font-bold text-emerald-800">
                  {selectedDistrict.resolvedChallenges}
                </div>
                <div className="text-[10px] uppercase font-bold text-emerald-900 mt-0.5">
                  Resolved
                </div>
              </div>

              <div className="p-2.5 bg-rose-50 rounded-xs border border-rose-200">
                <div className="text-xl font-bold text-gov-maroon">
                  {selectedDistrict.highPriorityChallenges}
                </div>
                <div className="text-[10px] uppercase font-bold text-rose-950 mt-0.5">
                  High Priority
                </div>
              </div>
            </div>

            {/* District Challenges Listing */}
            <div className="space-y-2 pt-2 border-t border-gov-border">
              <div className="flex items-center justify-between text-xs font-bold text-gov-navy uppercase tracking-wider">
                <span>Reported Problems ({districtChallenges.length})</span>
                <span className="text-[10px] text-gray-400 font-normal">Active in this zone</span>
              </div>

              {districtChallenges.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs italic bg-gov-sand-50 rounded-xs border border-gov-border">
                  No registered challenges in {selectedDistrict.district} matching current filters.
                </div>
              ) : (
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {districtChallenges.map((ch) => (
                    <div
                      key={ch._id}
                      className="p-2.5 bg-gov-sand-50/70 hover:bg-gov-sand-100 rounded-xs border border-gov-border transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-gov-maroon">
                          {ch.code}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                          ch.status === 'VALIDATED' ? 'bg-blue-100 text-blue-800' :
                          ch.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ch.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h5 className="font-bold text-gov-navy text-xs leading-snug line-clamp-2">
                        {ch.title}
                      </h5>

                      <div className="flex items-center justify-between text-[10px] text-gov-text-secondary pt-0.5">
                        <span>{ch.category}</span>
                        <Link
                          to={`/admin/challenges/${ch._id}`}
                          className="text-gov-maroon font-bold hover:underline flex items-center space-x-0.5"
                        >
                          <span>Examine</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMapPage;
