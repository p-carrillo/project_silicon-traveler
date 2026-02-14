import { describe, expect, it, vi } from 'vitest';
import { CircuitOpenError, ResilientHttpClient } from '../../../src/adapters/resilient-http.client';

describe('ResilientHttpClient', () => {
  it('retries transient failures and eventually succeeds', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const client = new ResilientHttpClient();
    const request = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockImplementation(async (attempt) => {
        if (attempt < 3) {
          throw { response: { status: 503 }, message: 'temporary failure' };
        }
        return 'ok';
      });

    const result = await client.execute({
      provider: 'test-provider',
      operation: 'retry-op',
      request,
      maxAttempts: 3,
      baseDelayMs: 1,
      maxDelayMs: 1,
      circuitFailureThreshold: 10,
      circuitOpenMs: 1000,
    });

    expect(result.data).toBe('ok');
    expect(result.attempts).toBe(3);
    expect(request).toHaveBeenCalledTimes(3);

    randomSpy.mockRestore();
  });

  it('does not retry non-transient client errors', async () => {
    const client = new ResilientHttpClient();
    const request = vi.fn().mockRejectedValue({ response: { status: 400 }, message: 'bad request' });

    await expect(
      client.execute({
        provider: 'test-provider',
        operation: 'no-retry-op',
        request,
        maxAttempts: 3,
        baseDelayMs: 1,
        maxDelayMs: 1,
        circuitFailureThreshold: 10,
        circuitOpenMs: 1000,
      })
    ).rejects.toBeTruthy();

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('opens circuit after threshold and blocks next request', async () => {
    const client = new ResilientHttpClient();
    const failingRequest = vi.fn().mockRejectedValue({ response: { status: 503 }, message: 'down' });

    await expect(
      client.execute({
        provider: 'test-provider',
        operation: 'circuit-op',
        request: failingRequest,
        maxAttempts: 1,
        baseDelayMs: 1,
        maxDelayMs: 1,
        circuitFailureThreshold: 1,
        circuitOpenMs: 10000,
      })
    ).rejects.toBeTruthy();

    await expect(
      client.execute({
        provider: 'test-provider',
        operation: 'circuit-op',
        request: failingRequest,
        maxAttempts: 1,
        baseDelayMs: 1,
        maxDelayMs: 1,
        circuitFailureThreshold: 1,
        circuitOpenMs: 10000,
      })
    ).rejects.toBeInstanceOf(CircuitOpenError);

    expect(failingRequest).toHaveBeenCalledTimes(1);
  });
});
