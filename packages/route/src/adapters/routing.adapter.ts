import axios from 'axios';
import { Point } from '@silicon-traveler/shared';
import { IRoutingPort, RoutePath, RoutingProfile } from '../ports/routing.port';
import { logGeoEvent } from './geo-observability';
import { ResilientHttpClient } from './resilient-http.client';
import { TtlLruCache } from './ttl-lru-cache';

interface OsrmRouteResponse {
  code?: string;
  routes?: Array<{
    distance?: number;
    geometry?: {
      coordinates?: number[][];
    };
  }>;
}

interface RoutingAdapterConfig {
  baseUrl: string;
  timeoutMs: number;
  maxAttempts: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
  circuitFailureThreshold: number;
  circuitOpenMs: number;
  cacheMaxEntries: number;
  cacheTtlRouteMs: number;
}

const DEFAULT_CONFIG: RoutingAdapterConfig = {
  baseUrl: process.env.OSRM_BASE_URL || 'https://router.project-osrm.org',
  timeoutMs: parseNumber(process.env.OSRM_TIMEOUT_MS, 5000),
  maxAttempts: parseNumber(process.env.GEO_RETRY_MAX_ATTEMPTS, 3),
  retryBaseDelayMs: parseNumber(process.env.GEO_RETRY_BASE_DELAY_MS, 200),
  retryMaxDelayMs: parseNumber(process.env.GEO_RETRY_MAX_DELAY_MS, 2000),
  circuitFailureThreshold: parseNumber(process.env.GEO_CIRCUIT_FAILURE_THRESHOLD, 5),
  circuitOpenMs: parseNumber(process.env.GEO_CIRCUIT_OPEN_MS, 120000),
  cacheMaxEntries: parseNumber(process.env.GEO_CACHE_MAX_ENTRIES, 2000),
  cacheTtlRouteMs: parseNumber(process.env.GEO_CACHE_TTL_MS_ROUTE, 3600000),
};

export class RoutingAdapter implements IRoutingPort {
  private readonly config: RoutingAdapterConfig;
  private readonly httpClient = new ResilientHttpClient();
  private readonly routeCache: TtlLruCache<string, RoutePath | null>;

  constructor(config: Partial<RoutingAdapterConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    this.routeCache = new TtlLruCache<string, RoutePath | null>(this.config.cacheMaxEntries);
  }

  async getRoute(from: Point, to: Point, profile: RoutingProfile = 'driving'): Promise<RoutePath | null> {
    const operation = 'getRoute';
    const key = this.routeCacheKey(from, to, profile);

    const cached = this.routeCache.get(key);
    if (cached !== undefined) {
      logGeoEvent({
        provider: 'osrm',
        operation,
        event: 'cache_hit',
        cacheHit: true,
        status: 'cached',
      });
      return cached;
    }

    const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const url = `${this.config.baseUrl.replace(/\/+$/, '')}/route/v1/${profile}/${coordinates}`;

    try {
      const result = await this.httpClient.execute<OsrmRouteResponse>({
        provider: 'osrm',
        operation,
        request: async () => {
          const response = await axios.get<OsrmRouteResponse>(url, {
            params: {
              overview: 'full',
              alternatives: false,
              steps: false,
              geometries: 'geojson',
            },
            timeout: this.config.timeoutMs,
          });

          return response.data;
        },
        maxAttempts: this.config.maxAttempts,
        baseDelayMs: this.config.retryBaseDelayMs,
        maxDelayMs: this.config.retryMaxDelayMs,
        circuitFailureThreshold: this.config.circuitFailureThreshold,
        circuitOpenMs: this.config.circuitOpenMs,
      });

      const route = this.toRoutePath(result.data);
      if (!route) {
        this.routeCache.set(key, null, this.config.cacheTtlRouteMs);
        logGeoEvent({
          provider: 'osrm',
          operation,
          event: 'no_route',
          attempt: result.attempts,
          status: result.data.code || 'no_route',
          durationMs: result.durationMs,
          circuitState: result.circuitState,
          cacheHit: false,
        });
        return null;
      }

      this.routeCache.set(key, route, this.config.cacheTtlRouteMs);
      return route;
    } catch (error: unknown) {
      logGeoEvent({
        provider: 'osrm',
        operation,
        event: 'degraded',
        status: extractStatus(error),
        cacheHit: false,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private routeCacheKey(from: Point, to: Point, profile: RoutingProfile): string {
    return [
      'route',
      profile,
      from.lat.toFixed(4),
      from.lng.toFixed(4),
      to.lat.toFixed(4),
      to.lng.toFixed(4),
    ].join(':');
  }

  private toRoutePath(response: OsrmRouteResponse): RoutePath | null {
    const route = response.routes?.[0];
    const geometry = route?.geometry?.coordinates;
    const distanceMeters = route?.distance;

    if (!geometry || geometry.length < 2 || typeof distanceMeters !== 'number') {
      return null;
    }

    const coordinates = geometry
      .filter((coordinate) => Array.isArray(coordinate) && coordinate.length >= 2)
      .map((coordinate) => ({
        lng: Number(coordinate[0]),
        lat: Number(coordinate[1]),
      }))
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

    if (coordinates.length < 2) {
      return null;
    }

    return {
      distanceKm: distanceMeters / 1000,
      coordinates,
    };
  }
}

function parseNumber(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractStatus(error: unknown): number | string {
  if (!error || typeof error !== 'object') {
    return 'unknown';
  }

  const maybeResponse = (error as { response?: { status?: unknown } }).response;
  if (maybeResponse && typeof maybeResponse.status === 'number') {
    return maybeResponse.status;
  }

  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode === 'string' && maybeCode.length > 0) {
    return maybeCode;
  }

  return 'unknown';
}
