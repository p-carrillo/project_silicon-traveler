import { Module } from '@nestjs/common';
import { AdminAuthController } from './infrastructure/controllers/admin-auth.controller';
import { AdminAuthGuard } from './infrastructure/guards/admin-auth.guard';
import { AdminAuthService } from './application/services/admin-auth.service';

@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthGuard, AdminAuthService],
  exports: [AdminAuthGuard, AdminAuthService],
})
export class AdminModule {}
