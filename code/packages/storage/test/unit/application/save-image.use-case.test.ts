import { describe, it, expect, vi } from 'vitest';
import { SaveImageUseCase } from '../../../src/application/save-image.use-case';

describe('SaveImageUseCase', () => {
  it('delegates to storage port', async () => {
    const storage = {
      saveImage: vi.fn().mockResolvedValue({ path: '2025/01/01/1.jpg', url: '/images/1.jpg' }),
    };

    const useCase = new SaveImageUseCase(storage as any);
    const result = await useCase.execute({
      buffer: Buffer.from('test'),
      filename: '1.jpg',
      date: new Date('2025-01-01T00:00:00Z'),
    });

    expect(storage.saveImage).toHaveBeenCalled();
    expect(result.url).toBe('/images/1.jpg');
  });
});
