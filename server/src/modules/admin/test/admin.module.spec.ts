import { Test, TestingModule } from '@nestjs/testing';
import { AdminModule } from '../admin.module';
import { AdminAuthController } from '../infrastructure/controllers/admin-auth.controller';
import { AdminAuthGuard } from '../infrastructure/guards/admin-auth.guard';
import { AdminAuthService } from '../application/services/admin-auth.service';

describe('AdminModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AdminModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide admin auth controller', () => {
    expect(module.get(AdminAuthController)).toBeDefined();
  });

  it('should provide admin auth service', () => {
    expect(module.get(AdminAuthService)).toBeDefined();
  });

  it('should provide admin auth guard', () => {
    expect(module.get(AdminAuthGuard)).toBeDefined();
  });
});
