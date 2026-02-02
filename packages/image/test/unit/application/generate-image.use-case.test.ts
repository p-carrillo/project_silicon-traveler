import { describe, it, expect, vi } from 'vitest';
import { GenerateImageUseCase } from '../../../src/application/generate-image.use-case';

describe('GenerateImageUseCase', () => {
  it('delegates to the image generator port', async () => {
    const generator = {
      generate: vi.fn().mockResolvedValue({ url: 'http://image', revisedPrompt: 'rev' }),
    };

    const useCase = new GenerateImageUseCase(generator as any);
    const result = await useCase.execute('Prompt');

    expect(generator.generate).toHaveBeenCalledWith('Prompt');
    expect(result.url).toBe('http://image');
  });
});
