export type GeoCircuitState = 'closed' | 'open' | 'half_open';

export type GeoEventType =
  | 'cache_hit'
  | 'retry'
  | 'success'
  | 'failure'
  | 'circuit_open'
  | 'degraded'
  | 'no_route';

export interface GeoLogEvent {
  provider: string;
  operation: string;
  event: GeoEventType;
  attempt?: number;
  status?: number | string;
  durationMs?: number;
  circuitState?: GeoCircuitState;
  cacheHit?: boolean;
  message?: string;
}

const counters = new Map<string, number>();

function nextCounter(provider: string, operation: string, event: GeoEventType): number {
  const key = `${provider}:${operation}:${event}`;
  const next = (counters.get(key) || 0) + 1;
  counters.set(key, next);
  return next;
}

export function logGeoEvent(event: GeoLogEvent): void {
  const count = nextCounter(event.provider, event.operation, event.event);
  const payload = {
    scope: 'geo',
    provider: event.provider,
    operation: event.operation,
    event: event.event,
    attempt: event.attempt,
    status: event.status,
    durationMs: event.durationMs,
    circuitState: event.circuitState,
    cacheHit: event.cacheHit,
    message: event.message,
    count,
    timestamp: new Date().toISOString(),
  };

  const serialized = JSON.stringify(payload);

  if (event.event === 'failure' || event.event === 'degraded' || event.event === 'circuit_open') {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}
