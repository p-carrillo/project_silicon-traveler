import { describe, it, expect } from 'vitest';
import { isPrivateIp } from '../../../src/lib/network';

describe('isPrivateIp', () => {
  describe('when input is undefined or empty', () => {
    it('should return false for undefined', () => {
      expect(isPrivateIp(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isPrivateIp('')).toBe(false);
    });
  });

  describe('IPv4 private ranges', () => {
    it('should return true for loopback 127.0.0.1', () => {
      expect(isPrivateIp('127.0.0.1')).toBe(true);
    });

    it('should return true for loopback 127.255.255.255', () => {
      expect(isPrivateIp('127.255.255.255')).toBe(true);
    });

    it('should return true for Class A private 10.0.0.1', () => {
      expect(isPrivateIp('10.0.0.1')).toBe(true);
    });

    it('should return true for Class A private 10.255.255.255', () => {
      expect(isPrivateIp('10.255.255.255')).toBe(true);
    });

    it('should return true for Class B private 172.18.0.5 (Docker)', () => {
      expect(isPrivateIp('172.18.0.5')).toBe(true);
    });

    it('should return true for Class C private 192.168.1.1', () => {
      expect(isPrivateIp('192.168.1.1')).toBe(true);
    });
  });

  describe('IPv4 public addresses', () => {
    it('should return false for 8.8.8.8', () => {
      expect(isPrivateIp('8.8.8.8')).toBe(false);
    });

    it('should return false for 64.89.163.143', () => {
      expect(isPrivateIp('64.89.163.143')).toBe(false);
    });
  });

  describe('IPv4 Class B boundary cases (172.16-31)', () => {
    it('should return false for 172.15.0.1 (just below range)', () => {
      expect(isPrivateIp('172.15.0.1')).toBe(false);
    });

    it('should return true for 172.16.0.1 (start of range)', () => {
      expect(isPrivateIp('172.16.0.1')).toBe(true);
    });

    it('should return true for 172.31.255.255 (end of range)', () => {
      expect(isPrivateIp('172.31.255.255')).toBe(true);
    });

    it('should return false for 172.32.0.1 (just above range)', () => {
      expect(isPrivateIp('172.32.0.1')).toBe(false);
    });
  });

  describe('IPv4-mapped IPv6 addresses', () => {
    it('should return true for ::ffff:172.18.0.5 (Docker internal)', () => {
      expect(isPrivateIp('::ffff:172.18.0.5')).toBe(true);
    });

    it('should return false for ::ffff:8.8.8.8 (public)', () => {
      expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false);
    });

    it('should return true for uppercase ::FFFF:172.18.0.5', () => {
      expect(isPrivateIp('::FFFF:172.18.0.5')).toBe(true);
    });

    it('should return true for mixed case ::Ffff:10.0.0.1', () => {
      expect(isPrivateIp('::Ffff:10.0.0.1')).toBe(true);
    });
  });

  describe('IPv6 addresses', () => {
    it('should return true for loopback ::1', () => {
      expect(isPrivateIp('::1')).toBe(true);
    });

    it('should return true for unique-local fd00::1', () => {
      expect(isPrivateIp('fd00::1')).toBe(true);
    });

    it('should return true for unique-local fdab:1234::1', () => {
      expect(isPrivateIp('fdab:1234::1')).toBe(true);
    });

    it('should return true for link-local fe80::1', () => {
      expect(isPrivateIp('fe80::1')).toBe(true);
    });

    it('should return false for public 2001:db8::1', () => {
      expect(isPrivateIp('2001:db8::1')).toBe(false);
    });
  });
});
