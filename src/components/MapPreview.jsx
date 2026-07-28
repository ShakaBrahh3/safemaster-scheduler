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

const MapPreview = ({ jobs = [], onJobClick = null, height = "300px", showSatellite = false, onToggleSatellite = null, routeJobs = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const routeLine = useRef(null);
  const [layerMode, setLayerMode] = useState(showSatellite ? 'satellite' : 'street');

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

    const baseLayers = {
      'Street Map': streetLayer,
      'Satellite': satelliteLayer,
    };

    if (layerMode === 'satellite') {
      satelliteLayer.addTo(map.current);
    } else {
      streetLayer.addTo(map.current);
    }

    L.control.layers(baseLayers).addTo(map.current);

    map.current.on('baselayerchange', (e) => {
      setLayerMode(e.name === 'Satellite' ? 'satellite' : 'street');
      if (onToggleSatellite) {
        onToggleSatellite(e.name === 'Satellite');
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach(marker => map.current.removeLayer(marker));
    markers.current = [];

    if (routeLine.current) {
      map.current.removeLayer(routeLine.current);
      routeLine.current = null;
    }

    const jobsWithLocation = jobs.filter(j => j.lat && j.lng);

    jobsWithLocation.forEach((job) => {
      const isScheduled = job.status === 'scheduled';
      const isOnRoute = routeJobs && routeJobs.some(r => r.id === job.id);

      const statusLabel = isOnRoute ? '🗺️ On Route' : isScheduled ? '✅ Scheduled' : '📋 Backlog';

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
        </div>
      `;

      const colors = {
        'WAH': '#3b82f6',
        'EWP': '#06b6d4',
        'ROPE': '#a855f7',
        'CSE': '#f59e0b',
      };

      // Scheduled jobs get a filled circle; backlog gets a lighter ring appearance
      const baseColor = colors[job.requiredTicket] || '#64748b';
      const fillColor = isScheduled ? baseColor : baseColor;
      const opacity = isScheduled ? '1' : '0.5';
      const stroke = isOnRoute ? '%23ffffff' : 'none';
      const strokeW = isOnRoute ? '2' : '0';

      const icon = L.icon({
        iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='${encodeURIComponent(fillColor)}' fill-opacity='${opacity}' stroke='${stroke}' stroke-width='${strokeW}'/%3E%3C/svg%3E`,
        iconSize: [isOnRoute ? 26 : 20, isOnRoute ? 26 : 20],
        iconAnchor: [isOnRoute ? 13 : 10, isOnRoute ? 13 : 10],
        popupAnchor: [0, isOnRoute ? -14 : -11],
      });

      const marker = L.marker([job.lat, job.lng], { icon }).addTo(map.current);
      marker.bindPopup(popupContent);

      if (onJobClick) {
        marker.on('click', () => onJobClick(job));
      }

      markers.current.push(marker);
    });

    // Draw route polyline
    if (routeJobs && routeJobs.length > 1) {
      const points = routeJobs.filter(j => j.lat && j.lng).map(j => [j.lat, j.lng]);
      if (points.length > 1) {
        routeLine.current = L.polyline(points, {
          color: '#14b8a6',
          weight: 3,
          opacity: 0.85,
          dashArray: '10 5',
        }).addTo(map.current);
      }
    }

    if (markers.current.length > 0) {
      const group = L.featureGroup(markers.current);
      map.current.fitBounds(group.getBounds().pad(0.15));
    }
  }, [jobs, routeJobs, onJobClick]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-700 shadow-lg" style={{ height }}>
      <div
        ref={mapContainer}
        style={{ height: '100%' }}
        className="bg-slate-800 w-full"
      />
      
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/80 to-transparent p-3 text-white text-xs font-semibold pointer-events-none">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-400" />
          <span>{jobs.filter(j => j.lat && j.lng).length} sites with coordinates</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 bg-slate-950/90 p-3 rounded-tr-lg text-xs text-slate-300 space-y-1">
        <div className="font-semibold text-white mb-1">Ticket Legend:</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>WAH</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span>EWP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>ROPE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>CSE</span>
        </div>
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
