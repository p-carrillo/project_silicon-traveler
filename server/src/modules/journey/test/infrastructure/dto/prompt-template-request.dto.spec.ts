import { PromptTemplateRequestDto } from '../../../infrastructure/dto/prompt-template-request.dto';

describe('PromptTemplateRequestDto', () => {
  it('should hold prompt template request data', () => {
    const dto = new PromptTemplateRequestDto();
    dto.keyName = 'image_default';
    dto.kind = 'image';
    dto.template = 'Photo of {{location}}';
    dto.isActive = true;

    expect(dto.keyName).toBe('image_default');
    expect(dto.kind).toBe('image');
    expect(dto.template).toBe('Photo of {{location}}');
    expect(dto.isActive).toBe(true);
  });
});
