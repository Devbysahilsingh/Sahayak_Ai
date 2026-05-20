import { LocationPoint } from "@/types/domain";

export function distanceMeters(first?: LocationPoint | null, second?: LocationPoint | null) {
  if (!first || !second) return null;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRad(second.latitude - first.latitude);
  const dLon = toRad(second.longitude - first.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(first.latitude)) * Math.cos(toRad(second.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
