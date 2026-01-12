import { PromptTemplateListResponseDto } from '../../../infrastructure/dto/prompt-template-list-response.dto';
import { PromptTemplate } from '../../../domain/entities/prompt-template.entity';

describe('PromptTemplateListResponseDto', () => {
  it('should map prompt templates to list response', () => {
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

    const dto = new PromptTemplateListResponseDto([template]);

    expect(dto.templates).toHaveLength(1);
    expect(dto.templates[0].id).toBe('template-id');
  });
});
