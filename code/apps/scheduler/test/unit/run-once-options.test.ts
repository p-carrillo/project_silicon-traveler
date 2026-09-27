import { describe, expect, it } from 'vitest';
import { resolveRunOnceOptions } from '../../src/run-once-options';

describe('resolveRunOnceOptions', () => {
  it('defaults to generator when no args or env provided', () => {
    const result = resolveRunOnceOptions([], undefined);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.options.job).toBe('generator');
    }
  });

  it('uses --job flag when provided', () => {
    const result = resolveRunOnceOptions(['--job', 'publisher'], undefined);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.options.job).toBe('publisher');
    }
  });

  it('accepts --job=value syntax', () => {
    const result = resolveRunOnceOptions(['--job=all'], undefined);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.options.job).toBe('all');
    }
  });

  it('falls back to env job when args are missing', () => {
    const result = resolveRunOnceOptions([], 'publisher');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.options.job).toBe('publisher');
    }
  });

  it('prefers args over env', () => {
    const result = resolveRunOnceOptions(['--job', 'generator'], 'publisher');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.options.job).toBe('generator');
    }
  });

  it('returns an error for invalid job values', () => {
    const result = resolveRunOnceOptions(['--job', 'nope'], undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Invalid job');
    }
  });

  it('returns an error when --job is missing a value', () => {
    const result = resolveRunOnceOptions(['--job'], undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Missing value');
    }
  });
});
