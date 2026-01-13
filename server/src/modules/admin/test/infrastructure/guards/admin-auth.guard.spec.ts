import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminAuthGuard } from '../../../infrastructure/guards/admin-auth.guard';
import { AdminAuthService } from '../../../application/services/admin-auth.service';

const createContext = (request: Record<string, any>): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as ExecutionContext;

describe('AdminAuthGuard', () => {
  it('should allow valid sessions and attach admin user', () => {
    const authService = {
      getSessionCookieName: jest.fn().mockReturnValue('admin_session'),
      verifySessionToken: jest.fn().mockReturnValue({ username: 'admin' }),
    } as unknown as AdminAuthService;

    const guard = new AdminAuthGuard(authService);
    const request = {
      headers: { cookie: 'admin_session=token' },
    };

    const result = guard.canActivate(createContext(request));

    expect(result).toBe(true);
    expect(request.adminUser).toEqual({ username: 'admin' });
  });

  it('should reject invalid sessions', () => {
    const authService = {
      getSessionCookieName: jest.fn().mockReturnValue('admin_session'),
      verifySessionToken: jest.fn().mockReturnValue(null),
    } as unknown as AdminAuthService;

    const guard = new AdminAuthGuard(authService);
    const request = {
      headers: { cookie: 'admin_session=bad' },
    };

    expect(() => guard.canActivate(createContext(request))).toThrow(
      UnauthorizedException,
    );
  });
});
