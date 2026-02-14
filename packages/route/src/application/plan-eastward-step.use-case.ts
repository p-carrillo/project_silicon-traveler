import { calculateDestination, calculateDistance, Point } from '@silicon-traveler/shared';
import { TravelMode } from '../domain/route-point.entity';
import { IRoutingPort } from '../ports/routing.port';
import { CalculateNextPointUseCase } from './calculate-next-point.use-case';

type Heading = 'east' | 'west' | 'north' | 'south';

export interface PlanEastwardStepInput {
  currentPosition: Point;
  heading: Heading;
  minDistanceKm: number;
  maxDistanceKm: number;
}

export interface PlanEastwardStepConfig {
  bearingMin: number;
  bearingMax: number;
  candidateMinDistanceKm: number;
  candidateMaxDistanceKm: number;
  candidateBearingCount: number;
  candidateDistanceCount: number;
}

export interface PlannedRouteStep {
  coordinates: Point;
  travelMode: TravelMode;
  distanceFromPrevious: number;
}

const DEFAULT_CONFIG: PlanEastwardStepConfig = {
  bearingMin: parseNumber(process.env.ROUTE_EAST_BEARING_MIN, 65),
  bearingMax: parseNumber(process.env.ROUTE_EAST_BEARING_MAX, 115),
  candidateMinDistanceKm: 25,
  candidateMaxDistanceKm: 60,
  candidateBearingCount: 7,
  candidateDistanceCount: 4,
};

function parseNumber(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export class PlanEastwardStepUseCase {
  private readonly config: PlanEastwardStepConfig;

  constructor(
    private readonly routingPort: IRoutingPort,
    private readonly calculateNextPoint: CalculateNextPointUseCase,
    config: Partial<PlanEastwardStepConfig> = {}
  ) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  async execute(input: PlanEastwardStepInput): Promise<PlannedRouteStep | null> {
    const stepDistanceKm = this.pickDistance(input.minDistanceKm, input.maxDistanceKm);

    if (input.heading !== 'east') {
      const fallback = this.calculateNextPoint.execute(input);
      return {
        coordinates: fallback,
        travelMode: 'land',
        distanceFromPrevious: calculateDistance(input.currentPosition, fallback),
      };
    }

    const bearings = this.buildCandidates(
      this.config.bearingMin,
      this.config.bearingMax,
      this.config.candidateBearingCount
    );
    const distances = this.buildCandidates(
      this.config.candidateMinDistanceKm,
      this.config.candidateMaxDistanceKm,
      this.config.candidateDistanceCount
    );

    let best: { point: Point; score: number } | null = null;

    for (const bearing of bearings) {
      for (const distanceKm of distances) {
        const candidate = calculateDestination(input.currentPosition, distanceKm, bearing);
        const route = await this.routingPort.getRoute(input.currentPosition, candidate, 'driving');

        if (!route || route.coordinates.length < 2) {
          continue;
        }

        const stepped = this.interpolateAtDistance(route.coordinates, stepDistanceKm);
        if (!stepped) {
          continue;
        }

        const eastDelta = this.eastDeltaDegrees(input.currentPosition.lng, stepped.lng);
        if (eastDelta <= 0) {
          continue;
        }

        const bearingToStepped = this.calculateBearing(input.currentPosition, stepped);
        const deviation = Math.abs(90 - bearingToStepped);
        const latitudeDrift = Math.abs(stepped.lat - input.currentPosition.lat);
        const score = eastDelta * 12 - deviation * 0.08 - latitudeDrift * 0.25;

        if (!best || score > best.score) {
          best = {
            point: stepped,
            score,
          };
        }
      }
    }

    if (!best) {
      return null;
    }

    return {
      coordinates: best.point,
      travelMode: 'land',
      distanceFromPrevious: calculateDistance(input.currentPosition, best.point),
    };
  }

  private pickDistance(minDistanceKm: number, maxDistanceKm: number): number {
    if (maxDistanceKm <= minDistanceKm) {
      return minDistanceKm;
    }

    return minDistanceKm + Math.random() * (maxDistanceKm - minDistanceKm);
  }

  private buildCandidates(min: number, max: number, count: number): number[] {
    if (count <= 1 || max <= min) {
      return [min];
    }

    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, index) => min + step * index);
  }

  private interpolateAtDistance(path: Point[], distanceKm: number): Point | null {
    if (path.length < 2) {
      return null;
    }

    let traversedKm = 0;

    for (let index = 1; index < path.length; index += 1) {
      const start = path[index - 1];
      const end = path[index];
      const segmentKm = calculateDistance(start, end);

      if (segmentKm <= 0) {
        continue;
      }

      if (traversedKm + segmentKm >= distanceKm) {
        const remainingKm = distanceKm - traversedKm;
        const fraction = remainingKm / segmentKm;

        return {
          lat: start.lat + (end.lat - start.lat) * fraction,
          lng: start.lng + (end.lng - start.lng) * fraction,
        };
      }

      traversedKm += segmentKm;
    }

    return null;
  }

  private eastDeltaDegrees(fromLng: number, toLng: number): number {
    let delta = toLng - fromLng;

    if (delta > 180) {
      delta -= 360;
    } else if (delta < -180) {
      delta += 360;
    }

    return delta;
  }

  private calculateBearing(from: Point, to: Point): number {
    const lat1 = this.toRad(from.lat);
    const lat2 = this.toRad(to.lat);
    const deltaLng = this.toRad(to.lng - from.lng);

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    const bearing = (this.toDeg(Math.atan2(y, x)) + 360) % 360;
    return bearing;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  private toDeg(value: number): number {
    return (value * 180) / Math.PI;
  }
}
