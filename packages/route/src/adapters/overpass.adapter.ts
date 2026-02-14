import axios from 'axios';
import { Point } from '@silicon-traveler/shared';
import { IOverpassPort, PlaceInfo } from '../ports/overpass.port';
import { logGeoEvent } from './geo-observability';
import { ResilientHttpClient } from './resilient-http.client';
import { TtlLruCache } from './ttl-lru-cache';

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

interface OverpassAdapterConfig {
  baseUrl: string;
  timeoutMs: number;
  maxAttempts: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
  circuitFailureThreshold: number;
  circuitOpenMs: number;
  cacheMaxEntries: number;
  cacheTtlWaterMs: number;
  cacheTtlCityMs: number;
}

const DEFAULT_CONFIG: OverpassAdapterConfig = {
  baseUrl: process.env.OVERPASS_BASE_URL || 'https://overpass-api.de/api/interpreter',
  timeoutMs: parseNumber(process.env.OVERPASS_TIMEOUT_MS, 5000),
  maxAttempts: parseNumber(process.env.GEO_RETRY_MAX_ATTEMPTS, 3),
  retryBaseDelayMs: parseNumber(process.env.GEO_RETRY_BASE_DELAY_MS, 200),
  retryMaxDelayMs: parseNumber(process.env.GEO_RETRY_MAX_DELAY_MS, 2000),
  circuitFailureThreshold: parseNumber(process.env.GEO_CIRCUIT_FAILURE_THRESHOLD, 5),
  circuitOpenMs: parseNumber(process.env.GEO_CIRCUIT_OPEN_MS, 120000),
  cacheMaxEntries: parseNumber(process.env.GEO_CACHE_MAX_ENTRIES, 2000),
  cacheTtlWaterMs: parseNumber(process.env.GEO_CACHE_TTL_MS_WATER, 86400000),
  cacheTtlCityMs: parseNumber(process.env.GEO_CACHE_TTL_MS_CITY, 21600000),
};

export class OverpassAdapter implements IOverpassPort {
  private readonly config: OverpassAdapterConfig;
  private readonly httpClient = new ResilientHttpClient();
  private readonly waterCache: TtlLruCache<string, boolean>;
  private readonly cityCache: TtlLruCache<string, PlaceInfo | null>;

  constructor(config: Partial<OverpassAdapterConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.waterCache = new TtlLruCache<string, boolean>(this.config.cacheMaxEntries);
    this.cityCache = new TtlLruCache<string, PlaceInfo | null>(this.config.cacheMaxEntries);
  }

  async findNearestCity(point: Point, radiusKm: number): Promise<PlaceInfo | null> {
    const operation = 'findNearestCity';
    const key = this.cityCacheKey(point, radiusKm);
    const cached = this.cityCache.get(key);
    if (cached !== undefined) {
      logGeoEvent({
        provider: 'overpass',
        operation,
        event: 'cache_hit',
        cacheHit: true,
        status: 'cached',
      });
      return cached;
    }

    const radiusMeters = Math.max(1, Math.round(radiusKm * 1000));

    const query = `
      [out:json];
      (
        node["place"~"^(city|town|village)$"](around:${radiusMeters},${point.lat},${point.lng});
        way["place"~"^(city|town|village)$"](around:${radiusMeters},${point.lat},${point.lng});
      );
      out center 1;
    `;

    try {
      const response = await this.httpClient.execute<OverpassResponse>({
        provider: 'overpass',
        operation,
        request: async () => {
          const result = await axios.post(this.config.baseUrl, `data=${encodeURIComponent(query)}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: this.config.timeoutMs,
          });

          return result.data as OverpassResponse;
        },
        maxAttempts: this.config.maxAttempts,
        baseDelayMs: this.config.retryBaseDelayMs,
        maxDelayMs: this.config.retryMaxDelayMs,
        circuitFailureThreshold: this.config.circuitFailureThreshold,
        circuitOpenMs: this.config.circuitOpenMs,
      });

      const city = this.toPlaceInfo(response.data);
      this.cityCache.set(key, city, this.config.cacheTtlCityMs);
      return city;
    } catch (error: unknown) {
      logGeoEvent({
        provider: 'overpass',
        operation,
        event: 'degraded',
        status: extractStatus(error),
        cacheHit: false,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async isWater(point: Point): Promise<boolean> {
    const operation = 'isWater';
    const key = this.waterCacheKey(point);
    const cached = this.waterCache.get(key);
    if (cached !== undefined) {
      logGeoEvent({
        provider: 'overpass',
        operation,
        event: 'cache_hit',
        cacheHit: true,
        status: 'cached',
      });
      return cached;
    }

    const query = `
      [out:json];
      is_in(${point.lat},${point.lng});
      area._["natural"="water"];
      out;
    `;

    try {
      const response = await this.httpClient.execute<OverpassResponse>({
        provider: 'overpass',
        operation,
        request: async () => {
          const result = await axios.post(this.config.baseUrl, `data=${encodeURIComponent(query)}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: this.config.timeoutMs,
          });

          return result.data as OverpassResponse;
        },
        maxAttempts: this.config.maxAttempts,
        baseDelayMs: this.config.retryBaseDelayMs,
        maxDelayMs: this.config.retryMaxDelayMs,
        circuitFailureThreshold: this.config.circuitFailureThreshold,
        circuitOpenMs: this.config.circuitOpenMs,
      });

      const isWater = Boolean(response.data.elements && response.data.elements.length > 0);
      this.waterCache.set(key, isWater, this.config.cacheTtlWaterMs);
      return isWater;
    } catch (error: unknown) {
      logGeoEvent({
        provider: 'overpass',
        operation,
        event: 'degraded',
        status: extractStatus(error),
        cacheHit: false,
        message: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  private waterCacheKey(point: Point): string {
    return `water:${point.lat.toFixed(3)}:${point.lng.toFixed(3)}`;
  }

  private cityCacheKey(point: Point, radiusKm: number): string {
    return `city:${point.lat.toFixed(3)}:${point.lng.toFixed(3)}:${radiusKm.toFixed(2)}`;
  }

  private toPlaceInfo(response: OverpassResponse): PlaceInfo | null {
    const first = response.elements?.find((element) => {
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      return Number.isFinite(lat) && Number.isFinite(lon);
    });

    if (!first) {
      return null;
    }

    const lat = first.lat ?? first.center?.lat;
    const lon = first.lon ?? first.center?.lon;

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return null;
    }

    return {
      name: first.tags?.name || 'Unknown',
      type: first.tags?.place || 'unknown',
      lat,
      lon,
      tags: first.tags,
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
