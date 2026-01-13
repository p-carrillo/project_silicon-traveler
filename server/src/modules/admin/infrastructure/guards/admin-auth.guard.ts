import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from '../../application/services/admin-auth.service';

export type AdminRequest = Request & { adminUser?: { username: string } };

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly authService: AdminAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const token = this.extractToken(request.headers.cookie);
    const session = this.authService.verifySessionToken(token);

    if (!session) {
      throw new UnauthorizedException('Admin session required');
    }

    request.adminUser = { username: session.username };
    return true;
  }

  private extractToken(cookieHeader?: string): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookieName = this.authService.getSessionCookieName();
    const cookies = cookieHeader.split(';');

    for (const cookie of cookies) {
      const [name, ...rest] = cookie.trim().split('=');
      if (name === cookieName) {
        return rest.join('=') || null;
      }
    }

    return null;
  }
}
