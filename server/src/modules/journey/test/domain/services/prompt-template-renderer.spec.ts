import { renderPromptTemplate } from '../../../domain/services/prompt-template-renderer';

describe('renderPromptTemplate', () => {
  it('should replace placeholders with variables', () => {
    const template = 'Photo of {{location}} on {{date}} (stage {{stage}})';
    const result = renderPromptTemplate(template, {
      location: 'Lisbon',
      date: '2024-01-01',
      stage: '1',
    });

    expect(result).toBe('Photo of Lisbon on 2024-01-01 (stage 1)');
  });

  it('should throw when a variable is missing', () => {
    const template = 'Story about {{location}} and {{weather}}';

    expect(() =>
      renderPromptTemplate(template, { location: 'Lisbon' }),
    ).toThrow('Missing prompt variable: weather');
  });
});
