import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix default marker icon for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPreview = ({ jobs = [], onJobClick = null, height = "300px", showSatellite = false, onToggleSatellite = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [layerMode, setLayerMode] = useState(showSatellite ? 'satellite' : 'street');

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      const bounds = jobs.filter(j => j.lat && j.lng).map(j => [j.lat, j.lng]);
      const center = bounds.length > 0 ? bounds[Math.floor(bounds.length / 2)] : [-31.9505, 115.8605];

      map.current = L.map(mapContainer.current).setView(center, 10);

      // Street map layer
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      });

      // Satellite layer (using Esri World Imagery)
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19,
      });

      // Layer control
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

      // Handle layer changes
      map.current.on('baselayerchange', (e) => {
        setLayerMode(e.name === 'Satellite' ? 'satellite' : 'street');
        if (onToggleSatellite) {
          onToggleSatellite(e.name === 'Satellite');
        }
      });
    }

    // Clear existing markers
    markers.current.forEach(marker => map.current.removeLayer(marker));
    markers.current = [];

    // Add job markers
    const jobsWithLocation = jobs.filter(j => j.lat && j.lng);
    if (jobsWithLocation.length > 0) {
      jobsWithLocation.forEach((job) => {
        const marker = L.marker([job.lat, job.lng]).addTo(map.current);
        
        // Create popup content
        const popupContent = `
          <div style="font-size: 12px; max-width: 200px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #333;">
              ${job.site}
            </h4>
            <p style="margin: 2px 0; color: #666;">
              💰 $${job.cost.toFixed(2)}
            </p>
            <p style="margin: 2px 0; color: #666;">
              🏷️ ${job.requiredTicket || 'WAH'}
            </p>
            <p style="margin: 2px 0; font-size: 11px; color: #999;">
              ${job.lat.toFixed(4)}, ${job.lng.toFixed(4)}
            </p>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        
        if (onJobClick) {
          marker.on('click', () => onJobClick(job));
        }

        // Color code markers by ticket type
        const colors = {
          'WAH': '#3b82f6',
          'EWP': '#06b6d4',
          'ROPE': '#a855f7',
          'CSE': '#f59e0b',
        };

        const color = colors[job.requiredTicket] || '#64748b';
        const icon = L.icon({
          iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/%3E%3C/svg%3E`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
        
        marker.setIcon(icon);
        markers.current.push(marker);
      });

      // Fit bounds to all markers
      if (jobsWithLocation.length > 0) {
        const group = L.featureGroup(markers.current);
        map.current.fitBounds(group.getBounds().pad(0.1));
      }
    }

    return () => {
      // Cleanup handled by map instance
    };
  }, [jobs, layerMode, onJobClick, onToggleSatellite]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-700 shadow-lg">
      <div
        ref={mapContainer}
        style={{ height }}
        className="bg-slate-800 w-full"
      />
      
      {/* Info overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/80 to-transparent p-3 text-white text-xs font-semibold pointer-events-none">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-400" />
          <span>{jobs.filter(j => j.lat && j.lng).length} sites with coordinates</span>
        </div>
      </div>

      {/* Legend */}
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

      {/* Empty state */}
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
