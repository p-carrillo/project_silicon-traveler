import type { AxiosError } from 'axios';
import { GeoCircuitState, logGeoEvent } from './geo-observability';

interface CircuitEntry {
  state: GeoCircuitState;
  failureCount: number;
  openUntil: number;
}

export interface ResilientHttpRequestOptions<T> {
  provider: string;
  operation: string;
  request: (attempt: number) => Promise<T>;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  circuitFailureThreshold: number;
  circuitOpenMs: number;
}

export interface ResilientHttpResult<T> {
  data: T;
  attempts: number;
  durationMs: number;
  circuitState: GeoCircuitState;
}

export class CircuitOpenError extends Error {
  constructor(
    public readonly provider: string,
    public readonly operation: string,
    public readonly openUntil: number
  ) {
    super(`Circuit open for ${provider}/${operation} until ${new Date(openUntil).toISOString()}`);
  }
}

const RETRYABLE_NODE_CODES = new Set([
  'ECONNABORTED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
  'ECONNREFUSED',
]);

export class ResilientHttpClient {
  private readonly circuits = new Map<string, CircuitEntry>();

  async execute<T>(options: ResilientHttpRequestOptions<T>): Promise<ResilientHttpResult<T>> {
    const key = `${options.provider}:${options.operation}`;
    const now = Date.now();
    const circuit = this.circuits.get(key);

    if (circuit && circuit.state === 'open' && circuit.openUntil > now) {
      logGeoEvent({
        provider: options.provider,
        operation: options.operation,
        event: 'circuit_open',
        circuitState: 'open',
        status: 'open',
      });
      throw new CircuitOpenError(options.provider, options.operation, circuit.openUntil);
    }

    if (circuit && circuit.state === 'open' && circuit.openUntil <= now) {
      this.circuits.set(key, {
        state: 'half_open',
        failureCount: circuit.failureCount,
        openUntil: 0,
      });
    }

    const maxAttempts = Math.max(1, options.maxAttempts);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const startedAt = Date.now();
      const currentState = this.getCircuitState(key);

      try {
        const data = await options.request(attempt);
        this.closeCircuit(key);

        const durationMs = Date.now() - startedAt;
        logGeoEvent({
          provider: options.provider,
          operation: options.operation,
          event: 'success',
          attempt,
          status: 'ok',
          durationMs,
          circuitState: this.getCircuitState(key),
        });

        return {
          data,
          attempts: attempt,
          durationMs,
          circuitState: this.getCircuitState(key),
        };
      } catch (error: unknown) {
        const durationMs = Date.now() - startedAt;
        const status = extractStatus(error);
        const retryable = isRetryable(error);

        if (attempt < maxAttempts && retryable) {
          logGeoEvent({
            provider: options.provider,
            operation: options.operation,
            event: 'retry',
            attempt,
            status,
            durationMs,
            circuitState: currentState,
          });

          const delayMs = computeBackoffMs(
            attempt,
            Math.max(1, options.baseDelayMs),
            Math.max(1, options.maxDelayMs)
          );
          await sleep(delayMs);
          continue;
        }

        this.recordFailure(key, options.circuitFailureThreshold, options.circuitOpenMs);

        logGeoEvent({
          provider: options.provider,
          operation: options.operation,
          event: 'failure',
          attempt,
          status,
          durationMs,
          circuitState: this.getCircuitState(key),
          message: error instanceof Error ? error.message : String(error),
        });

        throw error;
      }
    }

    throw new Error(`Unexpected resilient HTTP control flow for ${options.provider}/${options.operation}`);
  }

  private getCircuitState(key: string): GeoCircuitState {
    return this.circuits.get(key)?.state || 'closed';
  }

  private closeCircuit(key: string): void {
    this.circuits.set(key, {
      state: 'closed',
      failureCount: 0,
      openUntil: 0,
    });
  }

  private recordFailure(key: string, threshold: number, openMs: number): void {
    const current = this.circuits.get(key) || {
      state: 'closed' as GeoCircuitState,
      failureCount: 0,
      openUntil: 0,
    };

    const nextFailures = current.failureCount + 1;
    const safeThreshold = Math.max(1, threshold);

    if (nextFailures >= safeThreshold) {
      this.circuits.set(key, {
        state: 'open',
        failureCount: nextFailures,
        openUntil: Date.now() + Math.max(1, openMs),
      });
      return;
    }

    this.circuits.set(key, {
      state: current.state === 'half_open' ? 'open' : 'closed',
      failureCount: nextFailures,
      openUntil: current.openUntil,
    });
  }
}

function isRetryable(error: unknown): boolean {
  const status = extractStatus(error);
  if (typeof status === 'number') {
    if (status === 429) return true;
    if (status >= 500 && status <= 599) return true;
    return false;
  }

  const code = extractCode(error);
  return code ? RETRYABLE_NODE_CODES.has(code) : false;
}

function extractStatus(error: unknown): number | string {
  const axiosLike = error as AxiosError | undefined;
  const responseStatus = axiosLike?.response?.status;
  if (typeof responseStatus === 'number') {
    return responseStatus;
  }

  const code = extractCode(error);
  if (code) {
    return code;
  }

  return 'unknown';
}

function extractCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode === 'string' && maybeCode.length > 0) {
    return maybeCode;
  }

  return null;
}

function computeBackoffMs(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitterRatio = 0.5 + Math.random() * 0.5;
  return Math.round(exponential * jitterRatio);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
