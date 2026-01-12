import { PostResponseDto } from '../../../infrastructure/dto/post-response.dto';

describe('PostResponseDto', () => {
  it('should create a DTO with id and value', () => {
    const dto = new PostResponseDto(1, 'DB works');

    expect(dto.id).toBe(1);
    expect(dto.value).toBe('DB works');
  });

  it('should have correct property types', () => {
    const dto = new PostResponseDto(42, 'Test value');

    expect(typeof dto.id).toBe('number');
    expect(typeof dto.value).toBe('string');
  });

  it('should be serializable to JSON', () => {
    const dto = new PostResponseDto(1, 'DB works');
    const json = JSON.stringify(dto);
    const parsed = JSON.parse(json);

    expect(parsed.id).toBe(1);
    expect(parsed.value).toBe('DB works');
  });
});
