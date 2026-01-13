import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  TooManyRequestsException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminAuthService } from '../../application/services/admin-auth.service';
import { AdminAuthGuard, AdminRequest } from '../guards/admin-auth.guard';
import { AdminLoginRequestDto } from '../dto/admin-login-request.dto';
import { AdminMeResponseDto } from '../dto/admin-me-response.dto';

@Controller('admin')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  @HttpCode(204)
  async login(
    @Body() body: AdminLoginRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const ipAddress = this.resolveIp(request);
    const rateLimit = this.authService.registerLoginAttempt(ipAddress);

    if (!rateLimit.allowed) {
      throw new TooManyRequestsException(
        `Too many login attempts. Try again in ${rateLimit.retryAfterSeconds ?? 60} seconds.`,
      );
    }

    if (!body.username || !body.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.authService.validateCredentials(
      body.username,
      body.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.authService.createSessionToken(body.username);

    if (!token) {
      throw new InternalServerErrorException(
        'Admin authentication is not configured',
      );
    }

    response.cookie(this.authService.getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.authService.getSessionTtlMs(),
      path: '/',
    });
  }

  @UseGuards(AdminAuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    response.cookie(this.authService.getSessionCookieName(), '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  }

  @UseGuards(AdminAuthGuard)
  @Get('me')
  async getMe(@Req() request: AdminRequest): Promise<AdminMeResponseDto> {
    const username = request.adminUser?.username ?? 'admin';
    return new AdminMeResponseDto(username);
  }

  private resolveIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];

    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() ?? request.ip;
    }

    if (Array.isArray(forwarded)) {
      return forwarded[0] ?? request.ip;
    }

    return request.ip || '';
  }
}
