import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Badge from '../common/Badge';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

// Custom SVG icon generator for map markers
const createCategoryIcon = (category, priority) => {
  const colorMap = {
    'Waste Management': '#7a1113', // Maroon
    'Water Supply & Sanitation': '#142a45', // Navy
    'Air Quality & Pollution': '#b45309', // Amber
    'Traffic & Public Transport': '#4338ca', // Indigo
    'Urban Infrastructure': '#047857', // Emerald
    'Other': '#4b5563'
  };

  const bg = colorMap[category] || '#7a1113';
  const isCritical = priority === 'critical' || priority === 'high';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.16 24.84 0 16 0 Z" fill="${bg}" filter="url(#shadow)" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="16" cy="15" r="7" fill="#ffffff" />
      <circle cx="16" cy="15" r="4" fill="${bg}" />
      ${isCritical ? '<circle cx="25" cy="7" r="4" fill="#dc2626" stroke="#fff" stroke-width="1"/>' : ''}
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38]
  });
};

const DelhiChallengeMap = ({ challenges = [], onSelectChallenge, height = '450px' }) => {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const delhiCenter = [28.6139, 77.2090]; // Connaught Place, Central Delhi

  // Filtered markers
  const filteredChallenges = challenges.filter((c) => {
    const districtMatch = selectedDistrict === 'All' || c.district === selectedDistrict;
    const categoryMatch = selectedCategory === 'All' || c.category === selectedCategory;
    const hasCoordinates = c.location?.coordinates?.lat && c.location?.coordinates?.lng;
    return districtMatch && categoryMatch && hasCoordinates;
  });

  const categories = [
    'All',
    'Waste Management',
    'Water Supply & Sanitation',
    'Air Quality & Pollution',
    'Traffic & Public Transport',
    'Urban Infrastructure'
  ];

  const districts = [
    'All',
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

  return (
    <div className="bg-white border border-gov-border rounded-sm shadow-gov-card overflow-hidden">
      {/* Map Control Toolbar */}
      <div className="p-4 border-b border-gov-border bg-gov-sand-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-serif text-gov-navy font-bold">
          <MapPin className="w-4 h-4 text-gov-maroon" />
          <span>Geotagged Societal Challenges across NCT of Delhi</span>
          <span className="text-gov-text-muted font-normal">
            ({filteredChallenges.length} challenges mapped)
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 text-xs font-serif">
          <div>
            <label className="mr-1 text-gov-text-secondary">District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border border-gov-border rounded-sm px-2 py-1 bg-white focus:ring-1 focus:ring-gov-maroon outline-none"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mr-1 text-gov-text-secondary">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gov-border rounded-sm px-2 py-1 bg-white focus:ring-1 focus:ring-gov-maroon outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div style={{ height, width: '100%' }}>
        <MapContainer
          center={delhiCenter}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredChallenges.map((challenge) => {
            const position = [
              challenge.location.coordinates.lat,
              challenge.location.coordinates.lng
            ];
            const icon = createCategoryIcon(challenge.category, challenge.priority);

            return (
              <Marker key={challenge._id} position={position} icon={icon}>
                <Popup className="custom-gov-popup">
                  <div className="p-1 font-serif text-xs space-y-1.5 max-w-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-gov-border pb-1">
                      <span className="font-bold text-gov-maroon text-[11px] uppercase">
                        {challenge.district}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-gov-navy-surface text-gov-navy rounded font-semibold">
                        {challenge.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-gov-navy text-xs leading-snug">
                      {challenge.title}
                    </h4>

                    <p className="text-gov-text-secondary text-[11px] line-clamp-2 leading-relaxed">
                      {challenge.description}
                    </p>

                    <div className="text-[10px] text-gov-text-muted pt-1">
                      <strong>Category:</strong> {challenge.category}
                      {challenge.location?.landmark && (
                        <div>
                          <strong>Landmark:</strong> {challenge.location.landmark}
                        </div>
                      )}
                    </div>

                    {onSelectChallenge && (
                      <button
                        onClick={() => onSelectChallenge(challenge)}
                        className="mt-2 w-full py-1 bg-gov-maroon text-white text-[11px] rounded-sm hover:bg-gov-maroon-dark transition-colors"
                      >
                        Inspect Challenge Details
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="p-2.5 bg-gov-sand-100 border-t border-gov-border flex flex-wrap items-center justify-center gap-4 text-[11px] font-serif text-gov-text-secondary">
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-gov-maroon mr-1.5 inline-block"></span>
          Waste Management
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-gov-navy mr-1.5 inline-block"></span>
          Water Quality
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-amber-600 mr-1.5 inline-block"></span>
          Air Pollution
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-indigo-700 mr-1.5 inline-block"></span>
          Public Transit
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-emerald-700 mr-1.5 inline-block"></span>
          Infrastructure
        </span>
      </div>
    </div>
  );
};

export default DelhiChallengeMap;
