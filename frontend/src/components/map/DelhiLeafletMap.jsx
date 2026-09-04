import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { ExternalLink, MapPin, AlertTriangle, CheckCircle, Layers } from 'lucide-react';

// Status colors
const STATUS_COLORS = {
  SUBMITTED: '#6b7280',
  UNDER_REVIEW: '#d97706',
  VALIDATED: '#2563eb',
  ASSIGNED: '#4f46e5',
  IN_PROGRESS: '#b8860b',
  SOLUTION_PROPOSED: '#9333ea',
  PILOT_TESTING: '#0891b2',
  RESOLVED: '#059669',
  REJECTED: '#e11d48'
};

// Custom SVG Pin Maker
const createCustomPin = (color = '#142a45') => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -26]
  });
};

// District Bubble Marker with Count
const createDistrictBubble = (count, hasHighPriority = false, isSelected = false) => {
  const bg = isSelected ? '#b8860b' : hasHighPriority ? '#7a1f2d' : '#142a45';
  const size = Math.max(34, Math.min(52, 34 + count * 2));

  return L.divIcon({
    className: 'custom-district-bubble',
    html: `
      <div style="
        background: ${bg};
        color: #ffffff;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)'};
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: Georgia, serif;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span style="font-size: ${size > 40 ? '14px' : '12px'}; line-height: 1;">${count}</span>
        <span style="font-size: 8px; opacity: 0.85; text-transform: uppercase;">Wards</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Re-center component
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

const DelhiLeafletMap = ({
  districts = [],
  markers = [],
  onSelectDistrict,
  selectedDistrict,
  center = { lat: 28.6139, lng: 77.2090 },
  zoom = 11,
  showDistrictBubbles = true,
  showChallengeMarkers = true
}) => {
  return (
    <div className="w-full h-full relative rounded-xs overflow-hidden border border-gov-border">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0 font-serif"
        style={{ minHeight: '500px', height: '100%', width: '100%' }}
      >
        <RecenterMap center={center} zoom={zoom} />

        {/* OpenStreetMap Standard Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; GNCTD Spatial Infrastructure'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* 1. District Summary Bubbles */}
        {showDistrictBubbles &&
          districts.map((d) => {
            const isSelected = selectedDistrict?.district === d.district;
            const hasHighPriority = (d.highPriorityChallenges || 0) > 0;
            const icon = createDistrictBubble(d.challengeCount, hasHighPriority, isSelected);

            return (
              <Marker
                key={d.district}
                position={[d.coordinates.lat, d.coordinates.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    if (onSelectDistrict) onSelectDistrict(d);
                  }
                }}
              >
                <Popup>
                  <div className="font-serif text-xs p-1 space-y-1.5 min-w-[180px]">
                    <div className="font-bold text-gov-navy border-b border-gray-200 pb-1 flex items-center justify-between">
                      <span>{d.district}</span>
                      <span className="bg-gov-sand-100 text-gov-navy text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {d.challengeCount} Total
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gov-text-secondary pt-1">
                      <div>
                        Active Projects: <span className="font-bold text-gov-navy">{d.activeProjects}</span>
                      </div>
                      <div>
                        Resolved: <span className="font-bold text-emerald-700">{d.resolvedChallenges}</span>
                      </div>
                      <div>
                        Urgent/High: <span className="font-bold text-gov-maroon">{d.highPriorityChallenges}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectDistrict && onSelectDistrict(d)}
                      className="w-full mt-2 py-1 bg-gov-navy hover:bg-gov-navy-dark text-white rounded-xs text-[10px] font-bold transition-colors text-center block cursor-pointer"
                    >
                      Inspect District Details &rarr;
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 2. Individual Challenge Point Markers */}
        {showChallengeMarkers &&
          markers.map((m) => {
            const lat = m.location?.coordinates?.lat;
            const lng = m.location?.coordinates?.lng;
            if (!lat || !lng) return null;

            const color = STATUS_COLORS[m.status] || '#142a45';
            const pinIcon = createCustomPin(color);

            return (
              <Marker key={m._id} position={[lat, lng]} icon={pinIcon}>
                <Popup>
                  <div className="font-serif text-xs p-1 space-y-1.5 min-w-[220px] max-w-[280px]">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                      <span className="font-bold text-[10px] text-gov-maroon tracking-wider font-mono">
                        {m.code}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full text-white"
                        style={{ backgroundColor: color }}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-gov-navy text-xs leading-snug">
                      {m.title}
                    </h4>

                    <div className="text-[11px] text-gov-text-secondary space-y-0.5">
                      <div>
                        <strong>Category:</strong> {m.category}
                      </div>
                      <div>
                        <strong>District:</strong> {m.district}
                      </div>
                      {m.location?.area && (
                        <div>
                          <strong>Area:</strong> {m.location.area}
                        </div>
                      )}
                      <div>
                        <strong>Priority:</strong>{' '}
                        <span className={`font-bold capitalize ${m.priority === 'high' || m.priority === 'critical' ? 'text-gov-maroon' : 'text-gray-600'}`}>
                          {m.priority}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-end">
                      <Link
                        to={`/admin/challenges/${m._id}`}
                        className="text-gov-maroon font-bold text-[11px] hover:underline flex items-center space-x-1"
                      >
                        <span>Examine Challenge</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default DelhiLeafletMap;
