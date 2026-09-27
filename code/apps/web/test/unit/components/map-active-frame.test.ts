import { describe, expect, it } from 'vitest';
import { resolveActiveFrame } from '../../../src/components/map/active-frame';

describe('resolveActiveFrame', () => {
  it('prioritizes selected pin over latest photo', () => {
    const selectedPin = {
      title: 'Pin title',
      location: 'Pin location',
      narrative: 'Pin narrative',
      thumbnail_path: 'images/pin-thumb.jpg',
      published_at: '2026-02-07T12:00:00.000Z',
    };
    const latestPhoto = {
      title: 'Latest title',
      location: 'Latest location',
      narrative: 'Latest narrative',
      thumbnail_path: 'images/latest-thumb.jpg',
      published_at: '2026-02-06T12:00:00.000Z',
    };

    const frame = resolveActiveFrame(selectedPin, latestPhoto);

    expect(frame).toMatchObject({
      title: 'Pin title',
      location: 'Pin location',
      narrative: 'Pin narrative',
      publishedAt: '2026-02-07T12:00:00.000Z',
      imageSrc: '/api/images/pin-thumb.jpg',
    });
  });

  it('falls back to latest photo when no selected pin', () => {
    const latestPhoto = {
      title: 'Latest title',
      location: 'Latest location',
      narrative: 'Latest narrative',
      thumbnail_path: '/images/latest-thumb.jpg',
      published_at: '2026-02-06T12:00:00.000Z',
    };

    const frame = resolveActiveFrame(null, latestPhoto);

    expect(frame).toMatchObject({
      title: 'Latest title',
      publishedAt: '2026-02-06T12:00:00.000Z',
      imageSrc: '/api/images/latest-thumb.jpg',
    });
  });

  it('returns null when there is no selected pin and no latest photo', () => {
    expect(resolveActiveFrame(null, null)).toBeNull();
  });
});
