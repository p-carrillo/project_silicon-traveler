import { describe, expect, it } from 'vitest';

const {
  parseDateOnly,
  normalizeStoragePath,
  buildTargetRelativePath,
  formatDatabasePath,
  resolveTargetDate,
} = require('../../../../../scripts/realign-photo-storage-dates.js');

describe('realign-photo-storage-dates helpers', () => {
  it('normalizes local storage paths and strips optional images prefix', () => {
    expect(normalizeStoragePath('/images/2026/02/01/photo-1.jpg')).toBe('2026/02/01/photo-1.jpg');
    expect(normalizeStoragePath('images/2026/02/01/photo-1.jpg')).toBe('2026/02/01/photo-1.jpg');
    expect(normalizeStoragePath('2026/02/01/photo-1.jpg')).toBe('2026/02/01/photo-1.jpg');
  });

  it('ignores external URLs when normalizing storage paths', () => {
    expect(normalizeStoragePath('https://cdn.example.com/photo.jpg')).toBeNull();
  });

  it('builds target date folder preserving filename', () => {
    const target = buildTargetRelativePath('/images/2026/02/01/photo-7_grid.jpg', new Date('2026-02-04T12:00:00Z'));
    expect(target).toBe('2026/02/04/photo-7_grid.jpg');
  });

  it('formats db path preserving existing prefix style', () => {
    expect(formatDatabasePath('/images/2026/02/01/a.jpg', '2026/02/03/a.jpg')).toBe('/images/2026/02/03/a.jpg');
    expect(formatDatabasePath('images/2026/02/01/a.jpg', '2026/02/03/a.jpg')).toBe('images/2026/02/03/a.jpg');
    expect(formatDatabasePath('2026/02/01/a.jpg', '2026/02/03/a.jpg')).toBe('2026/02/03/a.jpg');
  });

  it('uses photo published_at as priority target date', () => {
    const today = parseDateOnly('2026-02-01');
    const firstScheduledByJourney = new Map<number, number>([[1, 5]]);

    const routePoint = {
      journey_id: 1,
      sequence: 7,
      status: 'image_ready',
      published_at: null,
    };
    const photo = {
      published_at: '2026-02-10 18:30:00',
    };

    const target = resolveTargetDate(routePoint, photo, firstScheduledByJourney, today);
    expect(target.toISOString().slice(0, 10)).toBe('2026-02-10');
  });

  it('uses sequence offset against first scheduled route point when unpublished', () => {
    const today = parseDateOnly('2026-02-01');
    const firstScheduledByJourney = new Map<number, number>([[1, 5]]);

    const routePoint = {
      journey_id: 1,
      sequence: 7,
      status: 'image_ready',
      published_at: null,
    };

    const target = resolveTargetDate(routePoint, null, firstScheduledByJourney, today);
    expect(target.toISOString().slice(0, 10)).toBe('2026-02-03');
  });
});
