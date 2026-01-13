import { AdminMeResponseDto } from '../../../infrastructure/dto/admin-me-response.dto';

describe('AdminMeResponseDto', () => {
  it('should expose username', () => {
    const dto = new AdminMeResponseDto('admin');

    expect(dto.username).toBe('admin');
  });
});
