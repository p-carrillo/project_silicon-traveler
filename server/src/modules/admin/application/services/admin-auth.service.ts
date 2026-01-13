import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export type AdminSession = {
  username: string;
  expiresAt: number;
};

type LoginAttempt = {
  count: number;
  resetAt: number;
};

@Injectable()
export class AdminAuthService {
  private readonly sessionCookieName = 'admin_session';
  private readonly username = process.env.ADMIN_USERNAME ?? '';
  private readonly passwordHash = process.env.ADMIN_PASSWORD_HASH ?? '';
  private readonly sessionSecret = process.env.ADMIN_SESSION_SECRET ?? '';
  private readonly sessionTtlMs =
    this.parseNumber(process.env.ADMIN_SESSION_TTL_MINUTES, 120) *
    60 *
    1000;
  private readonly loginMaxAttempts = this.parseNumber(
    process.env.ADMIN_LOGIN_MAX_ATTEMPTS,
    5,
  );
  private readonly loginWindowMs =
    this.parseNumber(process.env.ADMIN_LOGIN_WINDOW_MINUTES, 15) *
    60 *
    1000;
  private readonly loginAttempts = new Map<string, LoginAttempt>();

  getSessionCookieName(): string {
    return this.sessionCookieName;
  }

  getSessionTtlMs(): number {
    return this.sessionTtlMs;
  }

  registerLoginAttempt(ipAddress: string): {
    allowed: boolean;
    retryAfterSeconds?: number;
  } {
    if (!ipAddress) {
      return { allowed: true };
    }

    const now = Date.now();
    const existing = this.loginAttempts.get(ipAddress);

    if (!existing || existing.resetAt <= now) {
      this.loginAttempts.set(ipAddress, {
        count: 1,
        resetAt: now + this.loginWindowMs,
      });
      return { allowed: true };
    }

    if (existing.count >= this.loginMaxAttempts) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      };
    }

    existing.count += 1;
    return { allowed: true };
  }

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<boolean> {
    if (!this.username || !this.passwordHash) {
      return false;
    }

    if (username !== this.username) {
      return false;
    }

    return compare(password, this.passwordHash);
  }

  createSessionToken(username: string): string | null {
    if (!this.sessionSecret) {
      return null;
    }

    const payload = {
      username,
      exp: Date.now() + this.sessionTtlMs,
      nonce: randomBytes(16).toString('hex'),
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(encoded);

    return `${encoded}.${signature}`;
  }

  verifySessionToken(token: string | null | undefined): AdminSession | null {
    if (!token || !this.sessionSecret) {
      return null;
    }

    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) {
      return null;
    }

    const expected = this.sign(encoded);
    if (!this.safeCompare(signature, expected)) {
      return null;
    }

    const payload = this.parsePayload(encoded);
    if (!payload) {
      return null;
    }

    if (payload.exp <= Date.now()) {
      return null;
    }

    return { username: payload.username, expiresAt: payload.exp };
  }

  private parsePayload(
    encoded: string,
  ): { username: string; exp: number } | null {
    try {
      const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
      const payload = JSON.parse(decoded) as { username?: string; exp?: number };

      if (typeof payload.username !== 'string') {
        return null;
      }

      if (typeof payload.exp !== 'number') {
        return null;
      }

      return { username: payload.username, exp: payload.exp };
    } catch {
      return null;
    }
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.sessionSecret)
      .update(payload)
      .digest('base64url');
  }

  private safeCompare(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private parseNumber(value: string | undefined, fallback: number): number {
    if (!value) {
      return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
