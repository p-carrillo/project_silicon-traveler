import { describe, expect, it } from 'vitest';
import { getEditorialGenerationConfig } from '../../../src/config/editorial';

describe('getEditorialGenerationConfig', () => {
  it('allows the recent history and mode windows to be configured', () => {
    expect(getEditorialGenerationConfig({
      EDITORIAL_RECENT_HISTORY_LIMIT: '12',
      EDITORIAL_MODE_RECENT_WINDOW: '6',
    })).toEqual({
      recentHistoryLimit: 12,
      modeRecentWindow: 6,
      maxRegenerations: 1,
    });
  });

  it('uses safe defaults for invalid or out-of-range values', () => {
    expect(getEditorialGenerationConfig({
      EDITORIAL_RECENT_HISTORY_LIMIT: '-1',
      EDITORIAL_MODE_RECENT_WINDOW: '8',
    })).toEqual({
      recentHistoryLimit: 5,
      modeRecentWindow: 3,
      maxRegenerations: 1,
    });
  });
});
