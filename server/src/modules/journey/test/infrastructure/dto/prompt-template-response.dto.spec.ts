import { PromptTemplateResponseDto } from '../../../infrastructure/dto/prompt-template-response.dto';
import { PromptTemplate } from '../../../domain/entities/prompt-template.entity';

describe('PromptTemplateResponseDto', () => {
  it('should map prompt template to response data', () => {
    const now = new Date();
    const template = new PromptTemplate(
      'template-id',
      'image_default',
      'image',
      'Photo of {{location}}',
      true,
      now,
      now,
    );

    const dto = new PromptTemplateResponseDto(template);

    expect(dto.template.id).toBe('template-id');
    expect(dto.template.keyName).toBe('image_default');
    expect(dto.template.kind).toBe('image');
  });
});
