import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Fix default marker icon for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * MapPreview renders job pins and, when a crew/day route is selected,
 * draws road-following driving directions with per-segment time labels.
 *
 * Props:
 *   jobs        – all job objects to pin
 *   routeJobs   – ordered array of jobs for the selected crew/day (straight-line fallback)
 *   roadRoute   – OSRM route object { geometry, legs, duration, distance } from useRouteDirections
 *   routeLoading – boolean: true while OSRM is fetching
 */
const MapPreview = ({
  jobs = [],
  onJobClick = null,
  height = "300px",
  showSatellite = false,
  onToggleSatellite = null,
  routeJobs = null,
  roadRoute = null,
  routeLoading = false,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const routeLayer = useRef(null);   // road polyline(s)
  const segmentLabels = useRef([]); // drive-time label markers
  const [layerMode, setLayerMode] = useState(showSatellite ? 'satellite' : 'street');

  // ── Initialise map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current) return;

    const bounds = jobs.filter(j => j.lat && j.lng).map(j => [j.lat, j.lng]);
    const center = bounds.length > 0 ? bounds[Math.floor(bounds.length / 2)] : [-31.9505, 115.8605];

    map.current = L.map(mapContainer.current).setView(center, 10);

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 19,
    });

    const baseLayers = { 'Street Map': streetLayer, 'Satellite': satelliteLayer };

    if (layerMode === 'satellite') {
      satelliteLayer.addTo(map.current);
    } else {
      streetLayer.addTo(map.current);
    }

    L.control.layers(baseLayers).addTo(map.current);

    map.current.on('baselayerchange', (e) => {
      setLayerMode(e.name === 'Satellite' ? 'satellite' : 'street');
      if (onToggleSatellite) onToggleSatellite(e.name === 'Satellite');
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // ── Re-render markers + route whenever data changes ────────────────────────
  useEffect(() => {
    if (!map.current) return;

    // Clear markers
    markers.current.forEach(m => map.current.removeLayer(m));
    markers.current = [];

    // Clear route layer
    if (routeLayer.current) {
      map.current.removeLayer(routeLayer.current);
      routeLayer.current = null;
    }

    // Clear segment labels
    segmentLabels.current.forEach(l => map.current.removeLayer(l));
    segmentLabels.current = [];

    // ── Job pins ─────────────────────────────────────────────────────────────
    const jobsWithLocation = jobs.filter(j => j.lat && j.lng);

    jobsWithLocation.forEach((job) => {
      const isScheduled = job.status === 'scheduled';
      const isOnRoute = routeJobs && routeJobs.some(r => r.id === job.id);

      const stopIndex = isOnRoute
        ? routeJobs.filter(r => r.lat && r.lng).findIndex(r => r.id === job.id)
        : -1;

      const statusLabel = isOnRoute
        ? `🗺️ Stop ${stopIndex + 1}`
        : isScheduled ? '✅ Scheduled' : '📋 Backlog';

      const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`;
      const appleMapsNavUrl = `https://maps.apple.com/?daddr=${job.lat},${job.lng}&dirflg=d`;

      const popupContent = `
        <div style="font-size: 12px; max-width: 220px;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #111;">
            ${escapeHtml(job.site)}
          </h4>
          <p style="margin: 2px 0; color: #555; font-size: 11px;">${statusLabel}</p>
          <p style="margin: 2px 0; color: #444;">
            💰 $${Number(job.cost || 0).toFixed(2)}
          </p>
          <p style="margin: 2px 0; color: #444;">
            🏷️ ${escapeHtml(job.requiredTicket || 'WAH')}
          </p>
          ${job.run ? `<p style="margin: 2px 0; color: #666; font-size: 11px;">📍 ${escapeHtml(job.run)}</p>` : ''}
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #999;">
            ${job.lat.toFixed(4)}, ${job.lng.toFixed(4)}
          </p>
          ${isOnRoute ? `
          <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
            <a href="${googleMapsNavUrl}" target="_blank" rel="noopener noreferrer"
              style="display: inline-block; padding: 4px 9px; background: #0f766e; color: #ffffff; border-radius: 4px; font-size: 11px; font-weight: 600; text-decoration: none;">
              🗺 Google Maps
            </a>
            <a href="${appleMapsNavUrl}" target="_blank" rel="noopener noreferrer"
              style="display: inline-block; padding: 4px 9px; background: #1d4ed8; color: #ffffff; border-radius: 4px; font-size: 11px; font-weight: 600; text-decoration: none;">
              🍎 Apple Maps
            </a>
          </div>` : ''}
        </div>
      `;

      const colors = {
        'WAH': '#3b82f6',
        'EWP': '#06b6d4',
        'ROPE': '#a855f7',
        'CSE': '#f59e0b',
      };

      const baseColor = colors[job.requiredTicket] || '#64748b';
      const opacity = isScheduled ? '1' : '0.5';
      const stroke = isOnRoute ? '%23ffffff' : 'none';
      const strokeW = isOnRoute ? '2' : '0';

      // Show stop number badge for on-route jobs
      const iconHtml = isOnRoute
        ? `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='13' fill='${encodeURIComponent(baseColor)}' stroke='%23ffffff' stroke-width='2.5'/%3E%3Ctext x='15' y='19' text-anchor='middle' font-size='11' font-weight='bold' fill='%23ffffff' font-family='sans-serif'%3E${stopIndex + 1}%3C/text%3E%3C/svg%3E`
        : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='${encodeURIComponent(baseColor)}' fill-opacity='${opacity}' stroke='${stroke}' stroke-width='${strokeW}'/%3E%3C/svg%3E`;

      const iconSize = isOnRoute ? 28 : 20;
      const iconAnchor = isOnRoute ? 14 : 10;

      const icon = L.icon({
        iconUrl: iconHtml,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconAnchor, iconAnchor],
        popupAnchor: [0, -iconAnchor - 2],
      });

      const marker = L.marker([job.lat, job.lng], { icon }).addTo(map.current);
      marker.bindPopup(popupContent);
      if (onJobClick) marker.on('click', () => onJobClick(job));
      markers.current.push(marker);
    });

    // ── Route drawing ─────────────────────────────────────────────────────────
    const validRouteJobs = routeJobs ? routeJobs.filter(j => j.lat && j.lng) : [];

    if (validRouteJobs.length > 1) {
      if (roadRoute && roadRoute.geometry) {
        // ── Road-following polyline from OSRM ──────────────────────────────
        // OSRM returns coordinates as [lng, lat]; Leaflet needs [lat, lng]
        const roadCoords = roadRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        routeLayer.current = L.polyline(roadCoords, {
          color: '#14b8a6',
          weight: 4,
          opacity: 0.9,
        }).addTo(map.current);

        // ── Per-segment drive-time labels ──────────────────────────────────
        if (roadRoute.legs && roadRoute.legs.length > 0) {
          roadRoute.legs.forEach((leg, i) => {
            const from = validRouteJobs[i];
            const to = validRouteJobs[i + 1];
            if (!from || !to) return;

            const midLat = (from.lat + to.lat) / 2;
            const midLng = (from.lng + to.lng) / 2;

            const mins = Math.round(leg.duration / 60);
            const km = (leg.distance / 1000).toFixed(1);

            const labelIcon = L.divIcon({
              className: '',
              html: `<div style="
                background: #0f172a;
                border: 1px solid #14b8a6;
                color: #5eead4;
                padding: 2px 7px;
                border-radius: 20px;
                font-size: 10px;
                white-space: nowrap;
                font-weight: 700;
                font-family: sans-serif;
                box-shadow: 0 1px 4px rgba(0,0,0,0.5);
                pointer-events: none;
              ">${mins} min · ${km} km</div>`,
              iconAnchor: [38, 10],
            });

            const label = L.marker([midLat, midLng], { icon: labelIcon, interactive: false })
              .addTo(map.current);
            segmentLabels.current.push(label);
          });
        }
      } else {
        // ── Fallback: straight dashed line while loading or on error ──────
        const points = validRouteJobs.map(j => [j.lat, j.lng]);
        routeLayer.current = L.polyline(points, {
          color: '#14b8a6',
          weight: 3,
          opacity: routeLoading ? 0.4 : 0.85,
          dashArray: '10 5',
        }).addTo(map.current);
      }
    }

    // ── Fit bounds ────────────────────────────────────────────────────────────
    if (markers.current.length > 0) {
      const group = L.featureGroup(markers.current);
      map.current.fitBounds(group.getBounds().pad(0.15));
    }
  }, [jobs, routeJobs, roadRoute, routeLoading, onJobClick]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-700 shadow-lg" style={{ height }}>
      <div
        ref={mapContainer}
        style={{ height: '100%' }}
        className="bg-slate-800 w-full"
      />

      {/* Top overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/80 to-transparent p-3 text-white text-xs font-semibold pointer-events-none">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-400" />
          <span>{jobs.filter(j => j.lat && j.lng).length} sites with coordinates</span>
          {routeLoading && (
            <span className="ml-2 text-teal-400 animate-pulse">⟳ Loading road route…</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 bg-slate-950/90 p-3 rounded-tr-lg text-xs text-slate-300 space-y-1">
        <div className="font-semibold text-white mb-1">Ticket Legend:</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>WAH</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500"></div><span>EWP</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span>ROPE</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span>CSE</span></div>
      </div>

      {jobs.filter(j => j.lat && j.lng).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="text-center text-slate-400">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No jobs with location data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPreview;
