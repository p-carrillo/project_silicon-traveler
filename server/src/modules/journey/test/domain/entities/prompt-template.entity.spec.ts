import { PromptTemplate } from '../../../domain/entities/prompt-template.entity';

describe('PromptTemplate', () => {
  it('should expose prompt template properties', () => {
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

    expect(template.id).toBe('template-id');
    expect(template.keyName).toBe('image_default');
    expect(template.kind).toBe('image');
    expect(template.template).toBe('Photo of {{location}}');
    expect(template.isActive).toBe(true);
    expect(template.createdAt).toBe(now);
    expect(template.updatedAt).toBe(now);
  });
});
