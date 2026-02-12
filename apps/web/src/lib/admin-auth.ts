const TOKEN_VERSION = 1;
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 12;

export const ADMIN_SESSION_COOKIE_NAME = 'admin_session';
export const ADMIN_SESSION_TTL_SECONDS = DEFAULT_SESSION_TTL_SECONDS;

export interface AdminSessionCookieConfig {
  name: string;
  value: string;
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
}

interface AdminSessionPayload {
  v: number;
  u: string;
  exp: number;
}

export function getAdminCredentials(): { user: string; password: string } | null {
  const user = process.env.ADMIN_BASIC_USER;
  const password = process.env.ADMIN_BASIC_PASSWORD;

  if (!user || !password) {
    return null;
  }

  return { user, password };
}

export function getAdminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.trim().length === 0) {
    return null;
  }

  return secret;
}

export async function createAdminSessionToken(
  user: string,
  options?: { nowMs?: number; ttlSeconds?: number }
): Promise<string> {
  const signingSecret = getAdminSessionSecret();
  if (!signingSecret) {
    throw new Error('Missing required ADMIN_SESSION_SECRET');
  }

  const nowMs = options?.nowMs ?? Date.now();
  const ttlSeconds = options?.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS;

  const payload: AdminSessionPayload = {
    v: TOKEN_VERSION,
    u: user,
    exp: nowMs + ttlSeconds * 1000,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(payloadEncoded, signingSecret);

  return `${payloadEncoded}.${signature}`;
}

export async function isValidAdminSessionToken(
  token: string,
  expectedUser: string,
  nowMs: number = Date.now()
): Promise<boolean> {
  const signingSecret = getAdminSessionSecret();
  if (!signingSecret) {
    return false;
  }

  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) {
    return false;
  }

  const expectedSignature = await hmacSha256(payloadEncoded, signingSecret);
  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  const payloadText = base64UrlDecode(payloadEncoded);
  if (!payloadText) {
    return false;
  }

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(payloadText) as AdminSessionPayload;
  } catch {
    return false;
  }

  if (payload.v !== TOKEN_VERSION) {
    return false;
  }

  if (payload.u !== expectedUser) {
    return false;
  }

  if (!Number.isFinite(payload.exp) || payload.exp <= nowMs) {
    return false;
  }

  return true;
}

export function createAdminSessionCookie(
  value: string,
  options?: { nodeEnv?: string; maxAge?: number }
): AdminSessionCookieConfig {
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: 'lax',
    secure: (options?.nodeEnv ?? process.env.NODE_ENV) === 'production',
    path: '/admin',
    maxAge: options?.maxAge ?? ADMIN_SESSION_TTL_SECONDS,
  };
}

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return toBase64Url(btoa(binary));
}

function base64UrlDecode(value: string): string | null {
  try {
    const binary = atob(fromBase64Url(value));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  return `${base64}${padding}`;
}

async function hmacSha256(payload: string, signingSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const bytes = new Uint8Array(digest);

  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return toBase64Url(btoa(binary));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
