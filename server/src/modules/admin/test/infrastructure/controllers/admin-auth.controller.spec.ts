import {
  InternalServerErrorException,
  TooManyRequestsException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminAuthController } from '../../../infrastructure/controllers/admin-auth.controller';
import { AdminAuthService } from '../../../application/services/admin-auth.service';

describe('AdminAuthController', () => {
  let controller: AdminAuthController;
  let authService: jest.Mocked<AdminAuthService>;

  beforeEach(() => {
    authService = {
      registerLoginAttempt: jest.fn(),
      validateCredentials: jest.fn(),
      createSessionToken: jest.fn(),
      getSessionCookieName: jest.fn(),
      getSessionTtlMs: jest.fn(),
    } as unknown as jest.Mocked<AdminAuthService>;

    controller = new AdminAuthController(authService);
  });

  it('should set session cookie on login', async () => {
    authService.registerLoginAttempt.mockReturnValue({ allowed: true });
    authService.validateCredentials.mockResolvedValue(true);
    authService.createSessionToken.mockReturnValue('token');
    authService.getSessionCookieName.mockReturnValue('admin_session');
    authService.getSessionTtlMs.mockReturnValue(3600000);

    const response = { cookie: jest.fn() } as any;
    const request = { headers: {}, ip: '127.0.0.1' } as any;

    await controller.login(
      { username: 'admin', password: 'secret' },
      request,
      response,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      'admin_session',
      'token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('should reject invalid credentials', async () => {
    authService.registerLoginAttempt.mockReturnValue({ allowed: true });
    authService.validateCredentials.mockResolvedValue(false);

    await expect(
      controller.login(
        { username: 'admin', password: 'bad' },
        { headers: {}, ip: '127.0.0.1' } as any,
        { cookie: jest.fn() } as any,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should enforce rate limiting', async () => {
    authService.registerLoginAttempt.mockReturnValue({
      allowed: false,
      retryAfterSeconds: 60,
    });

    await expect(
      controller.login(
        { username: 'admin', password: 'secret' },
        { headers: {}, ip: '127.0.0.1' } as any,
        { cookie: jest.fn() } as any,
      ),
    ).rejects.toThrow(TooManyRequestsException);
  });

  it('should throw when session cannot be created', async () => {
    authService.registerLoginAttempt.mockReturnValue({ allowed: true });
    authService.validateCredentials.mockResolvedValue(true);
    authService.createSessionToken.mockReturnValue(null);

    await expect(
      controller.login(
        { username: 'admin', password: 'secret' },
        { headers: {}, ip: '127.0.0.1' } as any,
        { cookie: jest.fn() } as any,
      ),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should clear cookie on logout', async () => {
    authService.getSessionCookieName.mockReturnValue('admin_session');
    const response = { cookie: jest.fn() } as any;

    await controller.logout(response);

    expect(response.cookie).toHaveBeenCalledWith(
      'admin_session',
      '',
      expect.objectContaining({ maxAge: 0 }),
    );
  });

  it('should return admin identity', async () => {
    const result = await controller.getMe({
      adminUser: { username: 'admin' },
    } as any);

    expect(result.username).toBe('admin');
  });
});
