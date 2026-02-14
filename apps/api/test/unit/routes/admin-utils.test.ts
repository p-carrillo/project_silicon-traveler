import { describe, it, expect } from 'vitest';
import {
  parsePoint,
  parsePositiveInt,
  parseOffsetInt,
  parseStatusesParam,
  parseRoutePointOrder,
} from '../../../src/routes/admin.utils';

describe('admin.utils', () => {
  it('parses limit with fallback and range', () => {
    expect(parsePositiveInt(undefined, 10, { min: 1, max: 500 })).toEqual({ value: 10 });
    expect(parsePositiveInt('20', 10, { min: 1, max: 500 })).toEqual({ value: 20 });
    expect(parsePositiveInt('0', 10, { min: 1, max: 500 })).toHaveProperty('error');
  });

  it('parses offset as non-negative integer', () => {
    expect(parseOffsetInt(undefined, 0)).toEqual({ value: 0 });
    expect(parseOffsetInt('5', 0)).toEqual({ value: 5 });
    expect(parseOffsetInt('-1', 0)).toHaveProperty('error');
  });

  it('parses coordinates and validates ranges', () => {
    expect(parsePoint({ lat: 10, lng: 20 })).toEqual({ value: { lat: 10, lng: 20 } });
    expect(parsePoint({ lat: 100, lng: 20 })).toHaveProperty('error');
    expect(parsePoint({ lat: 10, lng: 200 })).toHaveProperty('error');
  });

  it('parses statuses from csv', () => {
    expect(parseStatusesParam('pending,image_ready')).toEqual({ value: ['pending', 'image_ready'] });
    expect(parseStatusesParam('nope')).toHaveProperty('error');
  });

  it('parses route-point order', () => {
    expect(parseRoutePointOrder(undefined)).toEqual({ value: 'id_desc' });
    expect(parseRoutePointOrder('id_asc')).toEqual({ value: 'id_asc' });
    expect(parseRoutePointOrder('bad')).toHaveProperty('error');
  });
});
