import React, { useState, useEffect } from 'react';
import { industryService } from '../../services/industryService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  DELHI_DISTRICTS,
  CHALLENGE_CATEGORIES
} from '../../utils/constants';
import {
  Compass,
  Filter,
  Handshake,
  Award,
  IndianRupee,
  Cpu,
  Send,
  Heart,
  X,
  Building,
  GraduationCap,
  MapPin,
  CheckCircle,
  RefreshCw,
  Search,
  Layers
} from 'lucide-react';

const SUPPORT_TYPE_OPTIONS = [
  { id: 'EXPRESS_INTEREST', label: 'Express Interest', icon: Heart, desc: 'General exploration of collaboration and lab meetings' },
  { id: 'MENTORSHIP', label: 'Offer Mentorship', icon: Award, desc: 'Corporate engineering mentorship and sprint advisement' },
  { id: 'FUNDING', label: 'Offer Funding', icon: IndianRupee, desc: 'CSR grant or hardware prototype co-sponsorship' },
  { id: 'TECHNOLOGY', label: 'Offer Technology', icon: Cpu, desc: 'Proprietary software, sensor toolkits, or cloud API access' },
  { id: 'PROTOTYPING', label: 'Offer Prototyping Support', icon: Layers, desc: 'Industrial PCB assembly, CNC fabrication, or cleanroom access' },
  { id: 'PILOT_SUPPORT', label: 'Offer Pilot Support', icon: Send, desc: 'Live ward testbed access, distribution circle pilots, and site permits' }
];

const STAGE_OPTIONS = [
  { value: 'all', label: 'All Project Stages' },
  { value: 'PROJECT_CREATED', label: 'Project Created' },
  { value: 'TEAM_FORMED', label: 'Team Formed' },
  { value: 'PROPOSAL_SUBMITTED', label: 'Proposal Submitted' },
  { value: 'DEVELOPMENT', label: 'In Development' },
  { value: 'APPROVED', label: 'Approved' }
];

const IndustryOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedTech, setSelectedTech] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Partnership Request Modal State
  const [partnerProject, setPartnerProject] = useState(null);
  const [supportType, setSupportType] = useState('FUNDING');
  const [description, setDescription] = useState('');
  const [resourcesOffered, setResourcesOffered] = useState('');
  const [expectedInvolvement, setExpectedInvolvement] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDomain !== 'all') params.domain = selectedDomain;
      if (selectedDistrict !== 'all') params.district = selectedDistrict;
      if (selectedStage !== 'all') params.stage = selectedStage;
      if (selectedTech.trim()) params.technology = selectedTech.trim();
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await industryService.getOpportunities(params);
      setOpportunities(res.data?.opportunities || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load innovation opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedDomain, selectedDistrict, selectedStage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleOpenPartnerModal = (opp, defaultType = 'EXPRESS_INTEREST') => {
    setPartnerProject(opp);
    setSupportType(defaultType);
    setDescription(`We would like to collaborate with ${opp.university} on project "${opp.projectTitle}".`);
    setResourcesOffered('Technical advisement, utility field testing sites, and prototype sponsorship');
    setExpectedInvolvement('Monthly sprint reviews, milestone validation, and Delhi ward pilot commissioning');
    setFundingAmount(defaultType === 'FUNDING' ? '500000' : '');
  };

  const handleSubmitPartnership = async (e) => {
    e.preventDefault();
    if (!partnerProject || !description.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        projectId: partnerProject._id,
        supportType,
        description: description.trim(),
        resourcesOffered: resourcesOffered.split(',').map((r) => r.trim()).filter(Boolean),
        expectedInvolvement: expectedInvolvement.trim(),
        fundingAmount: Number(fundingAmount) || 0
      };

      await industryService.createPartnership(payload);
      setActionSuccess(`Partnership proposal [${supportType}] submitted successfully to ${partnerProject.university}!`);
      setPartnerProject(null);
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit partnership request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-gov-maroon" />
            <span>Academic-Industry Collaboration Exchange</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Innovation Opportunities ({opportunities.length})
          </h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Active university research projects vetted by the Delhi State Innovation Council ready for corporate co-sponsorship and testbed pilots.
          </p>
        </div>

        <Button variant="subtle" size="sm" onClick={fetchOpportunities} icon={RefreshCw}>
          Refresh Catalog
        </Button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs">
          {errorMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <Card accent="none" className="p-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Keyword Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Biogas, Telemetry, Najafgarh..."
                  className="w-full font-serif border border-gov-border rounded-xs pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-gov-navy"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Domain / Category */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Domain / Sector
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs outline-none"
              >
                <option value="all">All Delhi Civic Domains</option>
                {CHALLENGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Revenue District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs outline-none"
              >
                <option value="all">All Delhi Districts</option>
                {DELHI_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Stage */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Current Project Stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs outline-none"
              >
                {STAGE_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gov-border text-[11px] text-gov-text-muted">
            <span>Showing {opportunities.length} filtered opportunity statement(s)</span>
            <div className="space-x-2">
              <Button variant="subtle" size="sm" type="button" onClick={() => {
                setSelectedDomain('all');
                setSelectedDistrict('all');
                setSelectedStage('all');
                setSelectedTech('');
                setSearchQuery('');
                fetchOpportunities();
              }}>
                Reset Filters
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-gov-navy text-white">
                Apply Search
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Opportunities Grid */}
      {loading ? (
        <LoadingState message="Loading university innovation opportunities & corporate partnership openings..." />
      ) : errorMsg ? (
        <ErrorState
          title="Opportunities Connection Error"
          message={errorMsg}
          onRetry={fetchOpportunities}
          retryLabel="Retry Loading Opportunities"
        />
      ) : opportunities.length === 0 ? (
        <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
          <p className="font-bold text-gov-navy text-sm">No Matching Innovation Opportunities Found</p>
          <p className="text-[11px] max-w-md mx-auto">
            Try adjusting your search query, sector domain, or district filter to view active university research cohorts.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <Card key={opp._id} accent="maroon" className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border text-xs">
                      {opp.challengeCode}
                    </span>
                    <Badge variant="navy">{opp.category}</Badge>
                    <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded-xs">
                      Stage: {opp.currentStage}
                    </span>
                  </div>
                  <span className="text-gov-text-muted text-[11px] flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-gov-maroon" />
                    {opp.district}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-gov-navy text-base leading-snug">
                    {opp.projectTitle}
                  </h3>
                  <div className="text-[11px] text-gov-maroon font-semibold mt-0.5 flex items-center">
                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                    <span>{opp.university}</span>
                    <span className="text-gray-400 mx-1.5">&bull;</span>
                    <span className="text-gray-600 font-normal">{opp.mentor}</span>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="p-2.5 bg-gov-sand-50 rounded-xs border border-gov-border text-xs">
                  <span className="font-bold text-gov-navy uppercase text-[10px] block mb-1">
                    Ground Problem Statement
                  </span>
                  <p className="text-gov-text-secondary leading-relaxed line-clamp-3">
                    {opp.problem}
                  </p>
                </div>

                {/* Technology Chips */}
                <div>
                  <span className="font-bold text-gov-navy uppercase text-[10px] block mb-1">
                    Technologies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {opp.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] font-semibold px-1.5 py-0.2 rounded-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Impact & Support Required */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xs">
                    <span className="font-bold text-emerald-900 uppercase text-[10px] block">
                      Expected Societal Impact
                    </span>
                    <p className="text-emerald-800 text-[11px] leading-snug mt-0.5 line-clamp-2">
                      {opp.expectedImpact}
                    </p>
                  </div>

                  <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-xs">
                    <span className="font-bold text-amber-900 uppercase text-[10px] block">
                      Support Required
                    </span>
                    <p className="text-amber-800 text-[11px] leading-snug mt-0.5 line-clamp-2">
                      {opp.supportRequired}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-gov-border flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-gov-text-muted">
                  Timeline: <strong>{opp.timeline}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => handleOpenPartnerModal(opp, 'EXPRESS_INTEREST')}
                    icon={Heart}
                    title="Express Interest"
                  >
                    Interest
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPartnerModal(opp, 'MENTORSHIP')}
                    icon={Award}
                    className="text-purple-800 border-purple-300 hover:bg-purple-50"
                  >
                    Mentor
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenPartnerModal(opp, 'FUNDING')}
                    icon={IndianRupee}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Offer Funding
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenPartnerModal(opp, 'PILOT_SUPPORT')}
                    icon={Send}
                    className="bg-gov-maroon hover:bg-gov-maroon-dark text-white"
                  >
                    Offer Pilot Support
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Partnership Request */}
      {partnerProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <div>
                <span className="font-mono text-gov-maroon text-xs font-bold">
                  [{partnerProject.challengeCode}] {partnerProject.university}
                </span>
                <h3 className="font-bold text-gov-navy text-lg leading-snug">
                  Corporate Partnership Proposal
                </h3>
              </div>
              <button
                onClick={() => setPartnerProject(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border text-xs">
              <div className="font-bold text-gov-navy text-sm leading-snug">
                {partnerProject.projectTitle}
              </div>
              <div className="text-gov-text-muted text-[11px] mt-0.5">
                District: {partnerProject.district} &bull; Estimated Budget: ₹{partnerProject.estimatedBudget?.toLocaleString('en-IN')}
              </div>
            </div>

            <form onSubmit={handleSubmitPartnership} className="space-y-4 text-xs">
              {/* Support Type Selector */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-2">
                  Select Corporate Collaboration Modality *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUPPORT_TYPE_OPTIONS.map((opt) => {
                    const selected = supportType === opt.id;
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSupportType(opt.id)}
                        className={`p-2.5 rounded-xs border cursor-pointer transition-colors ${
                          selected
                            ? 'bg-gov-maroon text-white border-gov-maroon shadow-xs'
                            : 'bg-white text-gov-navy border-gov-border hover:bg-gov-sand-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 font-bold text-xs">
                          <Icon className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </div>
                        <div className={`text-[10px] mt-1 leading-snug ${selected ? 'text-amber-100' : 'text-gov-text-muted'}`}>
                          {opt.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Funding Amount if FUNDING selected */}
              {supportType === 'FUNDING' && (
                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    CSR / Prototyping Grant Commitment (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-700 font-bold"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Partnership Description & Collaboration Objectives *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the technical capability, mentorship scope, or sponsorship terms your organization is offering..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              {/* Resources Offered */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Pledged Corporate Resources & Facilities (Comma-separated)
                </label>
                <input
                  type="text"
                  value={resourcesOffered}
                  onChange={(e) => setResourcesOffered(e.target.value)}
                  placeholder="e.g. High-voltage test bench, LoRaWAN gateways, Pilot truck, Cleanroom access"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              {/* Expected Involvement */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Expected Corporate Involvement & Review Cadence
                </label>
                <input
                  type="text"
                  value={expectedInvolvement}
                  onChange={(e) => setExpectedInvolvement(e.target.value)}
                  placeholder="e.g. Bi-weekly technical sprint reviews, joint field trial validation at Ghazipur"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs text-[11px] text-emerald-900">
                <strong>Notification Dispatch:</strong> Submitting this proposal automatically alerts the supervising University nodal coordinator and records this partnership under the Delhi State Innovation Council.
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setPartnerProject(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Submitting Proposal...' : 'Submit Partnership Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustryOpportunitiesPage;
