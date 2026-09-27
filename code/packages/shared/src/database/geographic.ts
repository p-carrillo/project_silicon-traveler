export interface Point {
  lat: number;
  lng: number;
}

export function pointToWKT(point: Point): string {
  return `POINT(${point.lng} ${point.lat})`;
}

export function wktToPoint(wkt: string): Point {
  const match = wkt.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!match) {
    throw new Error(`Invalid WKT format: ${wkt}`);
  }
  return {
    lng: parseFloat(match[1]),
    lat: parseFloat(match[2]),
  };
}

// MariaDB returns POINT as Buffer, need to parse it
export function bufferToPoint(buffer: Buffer): Point {
  // Skip first 4 bytes (SRID), then read little-endian doubles
  const lng = buffer.readDoubleLE(4);
  const lat = buffer.readDoubleLE(12);
  return { lat, lng };
}

/**
 * Calculate distance between two points using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate new point at given distance and bearing from origin
 * @param origin Starting point
 * @param distanceKm Distance in kilometers
 * @param bearingDegrees Bearing in degrees (0 = north, 90 = east, etc.)
 * @returns New point
 */
export function calculateDestination(
  origin: Point,
  distanceKm: number,
  bearingDegrees: number
): Point {
  const R = 6371; // Earth's radius in km
  const bearing = toRad(bearingDegrees);
  const lat1 = toRad(origin.lat);
  const lng1 = toRad(origin.lng);
  const d = distanceKm;
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d / R) +
      Math.cos(lat1) * Math.sin(d / R) * Math.cos(bearing)
  );
  
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d / R) * Math.cos(lat1),
      Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
    );
  
  return {
    lat: toDeg(lat2),
    lng: toDeg(lng2),
  };
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}
