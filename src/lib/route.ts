import type { BusinessLead } from "./types";

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const earthRadius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

export function optimizeRoute(
  leads: BusinessLead[],
  start: { lat: number; lng: number }
) {
  const pending = [...leads].sort((a, b) => b.potentialScore - a.potentialScore);
  const route: BusinessLead[] = [];
  let current = start;

  while (pending.length) {
    let bestIndex = 0;
    let bestValue = Number.POSITIVE_INFINITY;

    pending.forEach((lead, index) => {
      const distance = distanceKm(current, lead);
      const value = distance - lead.potentialScore / 100;
      if (value < bestValue) {
        bestValue = value;
        bestIndex = index;
      }
    });

    const [next] = pending.splice(bestIndex, 1);
    route.push({ ...next, status: next.status === "new" ? "routed" : next.status });
    current = next;
  }

  return route.map((lead, index) => ({
    ...lead,
    routeOrder: index + 1
  }));
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}
