import 'server-only';

type ParsedCookie = {
  name: string;
  value: string;
  options: {
    path?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
  };
};

export function parseSetCookieHeader(header: string): ParsedCookie | null {
  if (!header) {
    return null;
  }

  const parts = header.split(';').map((part) => part.trim());
  const [nameValue, ...attributes] = parts;
  const [name, ...valueParts] = nameValue.split('=');

  if (!name || valueParts.length === 0) {
    return null;
  }

  const value = valueParts.join('=');
  const options: ParsedCookie['options'] = {};

  for (const attribute of attributes) {
    const [rawKey, ...rawValue] = attribute.split('=');
    const key = rawKey.toLowerCase();
    const attributeValue = rawValue.join('=');

    if (key === 'path') {
      options.path = attributeValue;
    } else if (key === 'max-age') {
      const maxAge = Number(attributeValue);
      if (Number.isFinite(maxAge)) {
        options.maxAge = maxAge;
      }
    } else if (key === 'httponly') {
      options.httpOnly = true;
    } else if (key === 'secure') {
      options.secure = true;
    } else if (key === 'samesite') {
      const normalized = attributeValue.toLowerCase();
      if (
        normalized === 'lax' ||
        normalized === 'strict' ||
        normalized === 'none'
      ) {
        options.sameSite = normalized;
      }
    }
  }

  return { name, value, options };
}
