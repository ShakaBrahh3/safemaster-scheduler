import { useState, useEffect, useRef } from 'react';

/**
 * Fetches a road-following driving route from the OSRM public demo server.
 * Returns per-leg duration/distance and the full GeoJSON geometry.
 *
 * @param {Array<{lat: number, lng: number}>} waypoints
 * @returns {{ routeData: object|null, loading: boolean, error: string|null }}
 */
export function useRouteDirections(waypoints) {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    // Need at least 2 points with valid coords
    const valid = waypoints ? waypoints.filter(w => w && w.lat != null && w.lng != null) : [];
    if (valid.length < 2) {
      setRouteData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const coordStr = valid.map(w => `${w.lng},${w.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=false`;

    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
          throw new Error('No route returned');
        }
        setRouteData(data.routes[0]);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return; // ignore cancelled requests
        setError(err.message);
        setRouteData(null);
        setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints ? JSON.stringify(waypoints.map(w => w && `${w.lat},${w.lng}`)) : null]);

  return { routeData, loading, error };
}

/** Format seconds into "X hr Y min" or just "Y min" */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min`;
}

/** Format metres into "X.X km" */
export function formatDistance(metres) {
  if (!metres && metres !== 0) return '—';
  return `${(metres / 1000).toFixed(1)} km`;
}
