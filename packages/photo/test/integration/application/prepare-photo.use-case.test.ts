import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PreparePhotoUseCase } from '../../../src/application/prepare-photo.use-case';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from 'axios';

describe('PreparePhotoUseCase (integration)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-01T10:00:00Z'));
    process.env.I18N_LANGUAGES = 'es,en';
    process.env.I18N_DEFAULT_LANGUAGE = 'es';
    process.env.I18N_CONTENT_BASE_LANGUAGE = 'en';
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = { ...originalEnv };
  });

  it('orchestrates the photo preparation flow', async () => {
    const routePoint: any = {
      id: 1,
      journeyId: 1,
      status: 'pending',
      placeName: 'Test City',
      country: 'Testland',
      region: 'Region',
      isFferryCrossing: false,
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      imagePath: null,
      thumbnailPath: null,
      updateStatus(status: string) {
        this.status = status;
      },
      updateResearch(summary: string, osmData: any) {
        this.researchSummary = summary;
        this.osmData = osmData;
        this.status = 'researched';
      },
      updateContent(imagePrompt: string, narrativePrompt: string, cameraMetadata: any) {
        this.imagePrompt = imagePrompt;
        this.narrativePrompt = narrativePrompt;
        this.cameraMetadata = cameraMetadata;
        this.status = 'content_generated';
      },
      updateImages(imagePath: string, thumbnailPath: string) {
        this.imagePath = imagePath;
        this.thumbnailPath = thumbnailPath;
        this.status = 'image_ready';
      },
    };

    const routeRepo = {
      findById: vi.fn().mockResolvedValue(routePoint),
      findFirstScheduledByJourney: vi.fn().mockResolvedValue(routePoint),
      update: vi.fn().mockResolvedValue(undefined),
      upsertContentTranslations: vi.fn().mockResolvedValue(undefined),
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
      translateContent: vi.fn().mockResolvedValue({
        imagePrompt: 'Prompt ES',
        narrative: 'Narrativa',
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
    expect(routeRepo.upsertContentTranslations).toHaveBeenCalledTimes(1);
    expect(imageGenerator.generate).toHaveBeenCalledWith('Prompt');
    expect(thumbnailGenerator.generate).toHaveBeenCalled();
    expect(result.narrative).toBe('Narrativa');
  });

  it('normalizes non-string image prompts', async () => {
    const routePoint: any = {
      id: 2,
      journeyId: 1,
      status: 'pending',
      placeName: 'Test City',
      country: 'Testland',
      region: 'Region',
      isFferryCrossing: false,
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      imagePath: null,
      thumbnailPath: null,
      updateStatus(status: string) {
        this.status = status;
      },
      updateResearch(summary: string, osmData: any) {
        this.researchSummary = summary;
        this.osmData = osmData;
        this.status = 'researched';
      },
      updateContent(imagePrompt: string, narrativePrompt: string, cameraMetadata: any) {
        this.imagePrompt = imagePrompt;
        this.narrativePrompt = narrativePrompt;
        this.cameraMetadata = cameraMetadata;
        this.status = 'content_generated';
      },
      updateImages(imagePath: string, thumbnailPath: string) {
        this.imagePath = imagePath;
        this.thumbnailPath = thumbnailPath;
        this.status = 'image_ready';
      },
    };

    const routeRepo = {
      findById: vi.fn().mockResolvedValue(routePoint),
      findFirstScheduledByJourney: vi.fn().mockResolvedValue(routePoint),
      update: vi.fn().mockResolvedValue(undefined),
      upsertContentTranslations: vi.fn().mockResolvedValue(undefined),
    };

    const braveSearch = {
      search: vi.fn().mockResolvedValue([{ description: 'Info' }]),
    };

    const llm = {
      generateContent: vi.fn().mockResolvedValue({
        imagePrompt: { text: 'Prompt' },
        narrative: 'Narrative',
        cameraMetadata: {
          camera: 'Leica',
          lens: '35mm',
          iso: 100,
          shutterSpeed: '1/100',
          aperture: 'f/2.8',
        },
      }),
      translateContent: vi.fn().mockResolvedValue({
        imagePrompt: 'Prompt ES',
        narrative: 'Narrativa',
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
      saveImage: vi.fn().mockResolvedValue({ path: '2.jpg', url: '/images/2.jpg' }),
      saveThumbnail: vi.fn().mockResolvedValue({ path: '2_grid.jpg', url: '/images/2_grid.jpg' }),
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

    await useCase.execute(2);

    expect(imageGenerator.generate).toHaveBeenCalledWith('{"text":"Prompt"}');
    expect(routePoint.imagePrompt).toBe('Prompt ES');
  });

  it('stores images in the scheduled future day based on sequence', async () => {
    const routePoint: any = {
      id: 3,
      journeyId: 1,
      sequence: 7,
      status: 'pending',
      placeName: 'Test City',
      country: 'Testland',
      region: 'Region',
      isFferryCrossing: false,
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      imagePath: null,
      thumbnailPath: null,
      updateStatus(status: string) {
        this.status = status;
      },
      updateResearch(summary: string, osmData: any) {
        this.researchSummary = summary;
        this.osmData = osmData;
        this.status = 'researched';
      },
      updateContent(imagePrompt: string, narrativePrompt: string, cameraMetadata: any) {
        this.imagePrompt = imagePrompt;
        this.narrativePrompt = narrativePrompt;
        this.cameraMetadata = cameraMetadata;
        this.status = 'content_generated';
      },
      updateImages(imagePath: string, thumbnailPath: string) {
        this.imagePath = imagePath;
        this.thumbnailPath = thumbnailPath;
        this.status = 'image_ready';
      },
    };

    const routeRepo = {
      findById: vi.fn().mockResolvedValue(routePoint),
      findFirstScheduledByJourney: vi
        .fn()
        .mockResolvedValue({ ...routePoint, sequence: 5 }),
      update: vi.fn().mockResolvedValue(undefined),
      upsertContentTranslations: vi.fn().mockResolvedValue(undefined),
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
      translateContent: vi.fn().mockResolvedValue({
        imagePrompt: 'Prompt ES',
        narrative: 'Narrativa',
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
      saveImage: vi.fn().mockResolvedValue({ path: '3.jpg', url: '/images/3.jpg' }),
      saveThumbnail: vi.fn().mockResolvedValue({ path: '3_grid.jpg', url: '/images/3_grid.jpg' }),
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

    await useCase.execute(3);

    const savedDate = storage.saveImage.mock.calls[0][2] as Date;
    expect(savedDate.toISOString().slice(0, 10)).toBe('2026-02-03');
  });
});
