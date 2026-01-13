import { AdminLoginRequestDto } from '../../../infrastructure/dto/admin-login-request.dto';

describe('AdminLoginRequestDto', () => {
  it('should hold login data', () => {
    const dto = new AdminLoginRequestDto();
    dto.username = 'admin';
    dto.password = 'secret';

    expect(dto.username).toBe('admin');
    expect(dto.password).toBe('secret');
  });
});
