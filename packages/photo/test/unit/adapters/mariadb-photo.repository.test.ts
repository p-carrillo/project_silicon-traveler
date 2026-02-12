import { describe, it, expect, vi } from 'vitest';
import { MariaDBPhotoRepository } from '../../../src/adapters/mariadb-photo.repository';

const makeInput = () => ({
  routePointId: 1,
  title: 'Title',
  narrative: 'Narrative',
  location: 'Location',
  coordinates: { lat: 1, lng: 2 },
  camera: 'Leica',
  lens: '35mm',
  iso: 100,
  shutterSpeed: '1/100',
  rollNumber: 'ROLL 01',
  frameNumber: '01',
  seriesName: null,
  volumeIssue: null,
  tags: ['tag'],
  metadata: null,
  imageUrl: '/images/1.jpg',
  gridThumbnailUrl: '/images/1_grid.jpg',
  publishedAt: new Date('2026-02-04T00:00:00Z'),
  translations: [],
});

describe('MariaDBPhotoRepository (unit)', () => {
  it('coerces insertId to number', async () => {
    const pool = {
      query: async () => ({ insertId: BigInt(42) }),
    } as any;

    const repo = new MariaDBPhotoRepository(pool);
    const result = await repo.create(makeInput());

    expect(result).toBe(42);
  });

  it('updates published photo and translations from route point data', async () => {
    const query = vi.fn().mockResolvedValue(undefined);
    const pool = { query } as any;

    const repo = new MariaDBPhotoRepository(pool);

    await repo.syncPublishedPhotoFromRoutePoint({
      routePointId: 33,
      title: 'Segovia',
      location: 'Segovia, Castilla y Leon, Spain',
      coordinates: { lat: 40.95, lng: -4.12 },
      translations: [
        { language: 'es', title: 'Segovia', location: 'Segovia, Castilla y Leon, Spain' },
        { language: 'en', title: 'Segovia', location: 'Segovia, Castilla y Leon, Spain' },
      ],
    });

    expect(query).toHaveBeenCalledTimes(3);
    expect(query.mock.calls[0][0]).toContain('UPDATE photos');
    expect(query.mock.calls[1][0]).toContain('UPDATE photo_translations');
    expect(query.mock.calls[2][0]).toContain('UPDATE photo_translations');
  });

  it('checks if photo exists by route point id', async () => {
    const pool = {
      query: vi.fn().mockResolvedValue([{ 1: 1 }]),
    } as any;

    const repo = new MariaDBPhotoRepository(pool);
    const exists = await repo.hasByRoutePointId(10);

    expect(exists).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM photos'), [10]);
  });

  it('deletes photo by route point id', async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({ affectedRows: 1 }),
    } as any;

    const repo = new MariaDBPhotoRepository(pool);
    const deleted = await repo.deleteByRoutePointId(10);

    expect(deleted).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM photos'), [10]);
  });
});
