import { describe, expect, it } from 'vitest';
import {
  E2EConflictError,
  E2EExecutionCoordinator,
  E2E_MAX_ASSET_BYTES,
} from '../../../../src/application/e2e/e2e-execution';

describe('E2EExecutionCoordinator', () => {
  it('allows only one active execution per session', () => {
    const coordinator = new E2EExecutionCoordinator();
    const first = coordinator.start('session-a', () => undefined);

    expect(() => coordinator.start('session-a', () => undefined)).toThrow(E2EConflictError);

    first.complete();
    expect(() => coordinator.start('session-a', () => undefined)).not.toThrow();
  });

  it('keeps an asset private to its session and enforces the memory limit', () => {
    const coordinator = new E2EExecutionCoordinator();
    const execution = coordinator.start('session-a', () => undefined);
    const assetId = execution.context.saveAsset({ buffer: Buffer.from('image'), contentType: 'image/jpeg' });

    expect(coordinator.getAsset('session-a', execution.runId, assetId)?.buffer.toString()).toBe('image');
    expect(coordinator.getAsset('session-b', execution.runId, assetId)).toBeNull();
    expect(() => execution.context.saveAsset({ buffer: Buffer.alloc(E2E_MAX_ASSET_BYTES), contentType: 'image/jpeg' })).toThrow('memory limit');
  });

  it('provides the ordered event transport used by internal test commands', async () => {
    const coordinator = new E2EExecutionCoordinator();
    const events: string[] = [];
    coordinator.register('internal-test', async (context) => {
      context.emit({ type: 'progress', index: 1, total: 1 });
      context.emit({ type: 'result', index: 1, total: 1, data: { value: 'ok' } });
    });
    const execution = coordinator.start('session-a', (event) => events.push(event.type));
    execution.context.emit({ type: 'started', index: 0, total: 1 });
    await coordinator.getCommand('internal-test')!(execution.context, {});
    execution.context.emit({ type: 'completed', index: 1, total: 1 });
    execution.complete();

    expect(events).toEqual(['started', 'progress', 'result', 'completed']);
  });
});
