import { describe, expect, it } from 'vitest';

import {
  buildPhotoSearchFilter,
  parseDateParam,
} from '../../../src/routes/photos.search';

describe('buildPhotoSearchFilter', () => {
  it('returns empty filter when query is blank', () => {
    expect(buildPhotoSearchFilter('   ')).toEqual({
      whereClause: '',
      params: [],
    });
  });

  it('builds a case-insensitive filter for search fields', () => {
    const result = buildPhotoSearchFilter('Coast');

    expect(result.whereClause).toContain('LOWER(title) LIKE ?');
    expect(result.whereClause).toContain('LOWER(narrative) LIKE ?');
    expect(result.whereClause).toContain('LOWER(location) LIKE ?');
    expect(result.whereClause).toContain("LOWER(COALESCE(tags, '')) LIKE ?");
    expect(result.params).toEqual([
      '%coast%',
      '%coast%',
      '%coast%',
      '%coast%',
    ]);
  });

  it('adds published_at range filters when dates are provided', () => {
    const result = buildPhotoSearchFilter('', {
      startDate: '2026-02-01',
      endDate: '2026-02-03',
    });

    expect(result.whereClause).toContain('published_at >= ?');
    expect(result.whereClause).toContain('published_at < ?');
    expect(result.params).toEqual(['2026-02-01', '2026-02-04']);
  });
});

describe('parseDateParam', () => {
  it('returns null for empty inputs', () => {
    expect(parseDateParam(undefined, 'start_date')).toEqual({ value: null });
    expect(parseDateParam('', 'start_date')).toEqual({ value: null });
  });

  it('returns an error for invalid formats', () => {
    const result = parseDateParam('02-03-2026', 'start_date');
    expect(result.error).toBe('start_date must be in YYYY-MM-DD format');
  });

  it('returns an error for invalid dates', () => {
    const result = parseDateParam('2026-02-30', 'end_date');
    expect(result.error).toBe('end_date must be a valid date');
  });

  it('accepts valid dates', () => {
    expect(parseDateParam('2026-02-03', 'start_date')).toEqual({
      value: '2026-02-03',
    });
  });
});
