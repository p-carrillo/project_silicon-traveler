import { UpdatePromptTemplateRequestDto } from '../../../infrastructure/dto/update-prompt-template-request.dto';

describe('UpdatePromptTemplateRequestDto', () => {
  it('should hold prompt template updates', () => {
    const dto = new UpdatePromptTemplateRequestDto();
    dto.keyName = 'image_updated';
    dto.template = 'Updated template';
    dto.isActive = false;

    expect(dto.keyName).toBe('image_updated');
    expect(dto.template).toBe('Updated template');
    expect(dto.isActive).toBe(false);
  });
});
