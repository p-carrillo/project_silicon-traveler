import { describe, it, expect } from 'vitest';
import {
  calculateDestination,
  calculateDistance,
  pointToWKT,
  wktToPoint,
} from '../../../src/database/geographic';

describe('geographic utilities', () => {
  it('round-trips WKT coordinates', () => {
    const point = { lat: 40.4168, lng: -3.7038 };
    const wkt = pointToWKT(point);
    const parsed = wktToPoint(wkt);

    expect(parsed.lat).toBeCloseTo(point.lat, 6);
    expect(parsed.lng).toBeCloseTo(point.lng, 6);
  });

  it('returns zero distance for the same point', () => {
    const point = { lat: 10, lng: 10 };
    const distance = calculateDistance(point, point);
    expect(distance).toBeCloseTo(0, 6);
  });

  it('calculates a destination roughly at the requested distance', () => {
    const origin = { lat: 0, lng: 0 };
    const destination = calculateDestination(origin, 1, 0); // 1km north
    const distance = calculateDistance(origin, destination);

    expect(distance).toBeCloseTo(1, 1);
  });
});
