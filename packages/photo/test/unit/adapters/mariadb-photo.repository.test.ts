import { describe, it, expect } from 'vitest';
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
});
