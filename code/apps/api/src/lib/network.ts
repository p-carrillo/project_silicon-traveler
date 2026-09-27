const PRIVATE_IPV4_RANGES = [
  /^127\./, // loopback
  /^10\./, // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private (Docker uses this range)
  /^192\.168\./, // Class C private
];

/**
 * Checks whether an IP address belongs to a private/internal network (RFC 1918 + RFC 4193).
 *
 * Handles:
 * - IPv4 private ranges (10.x, 172.16-31.x, 192.168.x, 127.x)
 * - IPv4-mapped IPv6 addresses (e.g. ::ffff:172.18.0.5) in any case
 * - IPv6 loopback (::1)
 * - IPv6 unique-local (fd00::/8)
 * - IPv6 link-local (fe80::/10)
 */
export function isPrivateIp(ip: string | undefined): boolean {
  if (!ip) return false;

  // Normalize to lowercase to handle ::FFFF: from proxy headers
  const lower = ip.toLowerCase();

  // Strip IPv4-mapped IPv6 prefix (::ffff:172.18.0.5 → 172.18.0.5)
  const normalized = lower.startsWith('::ffff:') ? lower.slice(7) : lower;

  // IPv6 loopback
  if (normalized === '::1') return true;

  // IPv6 link-local (fe80::/10)
  if (normalized.startsWith('fe80:')) return true;

  // IPv6 unique-local (fd00::/8)
  if (normalized.startsWith('fd')) return true;

  return PRIVATE_IPV4_RANGES.some((range) => range.test(normalized));
}
