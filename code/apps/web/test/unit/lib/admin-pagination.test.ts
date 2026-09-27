import { describe, expect, it } from 'vitest';
import {
  buildAdminListHref,
  buildAdminVisiblePages,
  computeAdminPagination,
  resolveAdminListOrder,
  resolveAdminPageLimit,
  resolveAdminPageOffset,
} from '../../../src/lib/admin-pagination';

describe('admin-pagination', () => {
  describe('resolveAdminPageLimit', () => {
    it('returns default limit when value is missing or invalid', () => {
      expect(resolveAdminPageLimit(undefined)).toBe(10);
      expect(resolveAdminPageLimit('')).toBe(10);
      expect(resolveAdminPageLimit('0')).toBe(10);
      expect(resolveAdminPageLimit('-10')).toBe(10);
      expect(resolveAdminPageLimit('abc')).toBe(10);
    });

    it('returns normalized integer limit for valid values', () => {
      expect(resolveAdminPageLimit('50')).toBe(50);
      expect(resolveAdminPageLimit('25.9')).toBe(25);
    });
  });

  describe('resolveAdminPageOffset', () => {
    it('returns zero when value is missing or invalid', () => {
      expect(resolveAdminPageOffset(undefined)).toBe(0);
      expect(resolveAdminPageOffset('')).toBe(0);
      expect(resolveAdminPageOffset('-1')).toBe(0);
      expect(resolveAdminPageOffset('abc')).toBe(0);
    });

    it('returns normalized integer offset for valid values', () => {
      expect(resolveAdminPageOffset('0')).toBe(0);
      expect(resolveAdminPageOffset('100')).toBe(100);
      expect(resolveAdminPageOffset('100.6')).toBe(100);
    });
  });

  describe('resolveAdminListOrder', () => {
    it('returns id_desc when value is missing or invalid', () => {
      expect(resolveAdminListOrder(undefined)).toBe('id_desc');
      expect(resolveAdminListOrder('')).toBe('id_desc');
      expect(resolveAdminListOrder('bad')).toBe('id_desc');
    });

    it('returns provided valid order', () => {
      expect(resolveAdminListOrder('id_desc')).toBe('id_desc');
      expect(resolveAdminListOrder('id_asc')).toBe('id_asc');
    });
  });

  describe('computeAdminPagination', () => {
    it('returns empty-state pagination when total is zero', () => {
      const state = computeAdminPagination({ total: 0, limit: 100, offset: 0 });

      expect(state.from).toBe(0);
      expect(state.to).toBe(0);
      expect(state.page).toBe(1);
      expect(state.totalPages).toBe(1);
      expect(state.hasPrev).toBe(false);
      expect(state.hasNext).toBe(false);
    });

    it('calculates middle page correctly', () => {
      const state = computeAdminPagination({ total: 250, limit: 100, offset: 100 });

      expect(state.from).toBe(101);
      expect(state.to).toBe(200);
      expect(state.page).toBe(2);
      expect(state.totalPages).toBe(3);
      expect(state.hasPrev).toBe(true);
      expect(state.hasNext).toBe(true);
      expect(state.prevOffset).toBe(0);
      expect(state.nextOffset).toBe(200);
    });

    it('clamps offset to last page when offset exceeds total', () => {
      const state = computeAdminPagination({ total: 250, limit: 100, offset: 9999 });

      expect(state.offset).toBe(200);
      expect(state.from).toBe(201);
      expect(state.to).toBe(250);
      expect(state.page).toBe(3);
      expect(state.totalPages).toBe(3);
      expect(state.hasNext).toBe(false);
      expect(state.hasPrev).toBe(true);
    });
  });

  describe('buildAdminListHref', () => {
    it('builds href with status, limit and offset', () => {
      expect(
        buildAdminListHref({
          filters: { status: 'published', city: 'Bilbao', order: 'id_asc' },
          limit: 50,
          offset: 100,
        })
      ).toBe(
        '/admin?status=published&city=Bilbao&order=id_asc&limit=50&offset=100'
      );
    });

    it('omits offset when zero', () => {
      expect(
        buildAdminListHref({
          filters: { status: '', city: '', order: 'id_desc' },
          limit: 10,
          offset: 0,
        })
      ).toBe('/admin?limit=10');
    });
  });

  describe('buildAdminVisiblePages', () => {
    it('returns all pages when total pages is small', () => {
      expect(buildAdminVisiblePages(1, 4, 7)).toEqual([1, 2, 3, 4]);
    });

    it('returns centered page window when total pages is large', () => {
      expect(buildAdminVisiblePages(6, 20, 7)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    });

    it('clamps page window near the end', () => {
      expect(buildAdminVisiblePages(19, 20, 7)).toEqual([14, 15, 16, 17, 18, 19, 20]);
    });
  });
});
