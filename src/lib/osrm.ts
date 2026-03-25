const OSRM_BASE = "https://router.project-osrm.org";
const MAX_WAYPOINTS = 100;

function downsample(points: { lat: number; lng: number }[], max: number) {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

export interface SnappedRoute {
  route: [number, number][];
  distanceKm: number;
}

export async function snapRouteToRoads(
  points: { lat: number; lng: number }[]
): Promise<SnappedRoute> {
  const fallback: SnappedRoute = {
    route: points.map((p) => [p.lat, p.lng]),
    distanceKm: 0,
  };

  if (points.length < 2) return fallback;

  const sampled = downsample(points, MAX_WAYPOINTS);
  const coordStr = sampled.map((p) => `${p.lng},${p.lat}`).join(";");
  const radiuses = sampled.map(() => "50").join(";");

  // 1. Try Match API (snaps GPS trace to roads)
  try {
    const res = await fetch(
      `${OSRM_BASE}/match/v1/driving/${coordStr}?overview=full&geometries=geojson&radiuses=${radiuses}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.matchings?.length > 0) {
        const snapped: [number, number][] = [];
        let totalDistance = 0;
        for (const matching of data.matchings) {
          totalDistance += matching.distance ?? 0;
          for (const [lng, lat] of matching.geometry.coordinates) {
            snapped.push([lat, lng]);
          }
        }
        if (snapped.length >= 2) {
          return { route: snapped, distanceKm: totalDistance / 1000 };
        }
      }
    }
  } catch {
    // fall through to Route API
  }

  // 2. Fall back to Route API (always returns a road-following path)
  try {
    const res = await fetch(
      `${OSRM_BASE}/route/v1/driving/${coordStr}?overview=full&geometries=geojson`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes?.length > 0) {
        const r = data.routes[0];
        return {
          route: r.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
          distanceKm: (r.distance ?? 0) / 1000,
        };
      }
    }
  } catch {
    // fall through to raw points
  }

  return fallback;
}
