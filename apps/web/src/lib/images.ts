export function toProxyImageSrc(path: string): string {
  const normalizedPath = path.replace(/^\//, '').replace(/^images\//, '');
  return `/api/images/${normalizedPath}`;
}
