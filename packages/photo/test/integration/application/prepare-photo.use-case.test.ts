import { describe, it, expect, vi } from 'vitest';
import { PreparePhotoUseCase } from '../../../src/application/prepare-photo.use-case';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from 'axios';

describe('PreparePhotoUseCase (integration)', () => {
  it('orchestrates the photo preparation flow', async () => {
    const routePoint: any = {
      id: 1,
      journeyId: 1,
      status: 'pending',
      placeName: 'Test City',
      country: 'Testland',
      region: 'Region',
      isFferryCrossing: false,
      updateStatus(status: string) {
        this.status = status;
      },
    };

    const routeRepo = {
      findById: vi.fn().mockResolvedValue(routePoint),
      update: vi.fn().mockResolvedValue(undefined),
    };

    const braveSearch = {
      search: vi.fn().mockResolvedValue([{ description: 'Info' }]),
    };

    const llm = {
      generateContent: vi.fn().mockResolvedValue({
        imagePrompt: 'Prompt',
        narrative: 'Narrative',
        cameraMetadata: {
          camera: 'Leica',
          lens: '35mm',
          iso: 100,
          shutterSpeed: '1/100',
          aperture: 'f/2.8',
        },
      }),
    };

    const imageGenerator = {
      generate: vi.fn().mockResolvedValue({ url: 'http://image', revisedPrompt: null }),
    };

    const thumbnailGenerator = {
      generate: vi.fn().mockResolvedValue(
        new Map([
          ['_grid', Buffer.from('grid')],
          ['_hero', Buffer.from('hero')],
        ])
      ),
    };

    const storage = {
      saveImage: vi.fn().mockResolvedValue({ path: '1.jpg', url: '/images/1.jpg' }),
      saveThumbnail: vi.fn().mockResolvedValue({ path: '1_grid.jpg', url: '/images/1_grid.jpg' }),
    };

    const mockedAxios = axios as any;
    mockedAxios.get.mockResolvedValue({ data: Buffer.from('image') });

    const useCase = new PreparePhotoUseCase(
      routeRepo as any,
      braveSearch as any,
      llm as any,
      imageGenerator as any,
      thumbnailGenerator as any,
      storage as any
    );

    const result = await useCase.execute(1);

    expect(result.imageUrl).toBe('/images/1.jpg');
    expect(routeRepo.update).toHaveBeenCalled();
    expect(imageGenerator.generate).toHaveBeenCalledWith('Prompt');
    expect(thumbnailGenerator.generate).toHaveBeenCalled();
  });
});
