import { hash } from 'bcryptjs';
import { AdminAuthService } from '../../../application/services/admin-auth.service';

describe('AdminAuthService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should validate credentials with bcrypt hash', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD_HASH = await hash('secret', 4);
    process.env.ADMIN_SESSION_SECRET = 'session-secret';

    const service = new AdminAuthService();

    await expect(service.validateCredentials('admin', 'secret')).resolves.toBe(
      true,
    );
    await expect(service.validateCredentials('admin', 'wrong')).resolves.toBe(
      false,
    );
    await expect(service.validateCredentials('other', 'secret')).resolves.toBe(
      false,
    );
  });

  it('should create and verify session tokens', () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD_HASH = 'hash';
    process.env.ADMIN_SESSION_SECRET = 'session-secret';
    process.env.ADMIN_SESSION_TTL_MINUTES = '60';

    const service = new AdminAuthService();
    const token = service.createSessionToken('admin');

    expect(token).toBeTruthy();

    const session = service.verifySessionToken(token ?? '');
    expect(session?.username).toBe('admin');
  });

  it('should reject invalid session tokens', () => {
    process.env.ADMIN_SESSION_SECRET = 'session-secret';

    const service = new AdminAuthService();
    const token = service.createSessionToken('admin');

    expect(service.verifySessionToken('bad.token')).toBeNull();

    if (token) {
      const tampered = `${token}x`;
      expect(service.verifySessionToken(tampered)).toBeNull();
    }
  });

  it('should enforce rate limiting per ip', () => {
    process.env.ADMIN_LOGIN_MAX_ATTEMPTS = '2';
    process.env.ADMIN_LOGIN_WINDOW_MINUTES = '10';

    const service = new AdminAuthService();

    expect(service.registerLoginAttempt('1.2.3.4').allowed).toBe(true);
    expect(service.registerLoginAttempt('1.2.3.4').allowed).toBe(true);
    const blocked = service.registerLoginAttempt('1.2.3.4');

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeDefined();
  });
});
