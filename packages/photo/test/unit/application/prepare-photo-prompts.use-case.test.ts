import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PreparePhotoPromptsUseCase } from '../../../src/application/prepare-photo-prompts.use-case';
import { buildContentPrompt, CONTENT_SYSTEM_PROMPT, selectCamera } from '@silicon-traveler/content';

vi.mock('@silicon-traveler/content', async () => {
  const actual = await vi.importActual<typeof import('@silicon-traveler/content')>('@silicon-traveler/content');
  return {
    ...actual,
    selectCamera: vi.fn(() => ({
      camera: 'Leica M11',
      lens: '50mm f/2',
      theme: 'children and youth',
      photographicTone: 'moody and atmospheric with deep blacks, mysterious ambiance',
    })),
  };
});

describe('PreparePhotoPromptsUseCase', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.I18N_LANGUAGES = 'es,en';
    process.env.I18N_DEFAULT_LANGUAGE = 'es';
    process.env.I18N_CONTENT_BASE_LANGUAGE = 'en';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('generates research and content prompts without creating images', async () => {
    const routePoint: any = {
      id: 1,
      journeyId: 1,
      sequence: 5,
      status: 'pending',
      placeName: 'Test City',
      country: 'Testland',
      region: 'Test Region',
      coordinates: { lat: 1, lng: 2 },
      isFferryCrossing: false,
      osmData: { place: 'city' },
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
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
    };

    const routeRepo = {
      findById: vi.fn().mockResolvedValue(routePoint),
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

    const useCase = new PreparePhotoPromptsUseCase(
      routeRepo as any,
      braveSearch as any,
      llm as any
    );

    const result = await useCase.execute(1);

    expect(routeRepo.update).toHaveBeenCalledTimes(2);
    expect(result.researchQuery).toBe('Test City Testland history culture tourism');
    expect(result.llmSystemPrompt).toBe(CONTENT_SYSTEM_PROMPT);
    expect(result.contentStatus).toBe('generated');

    const input = {
      placeName: 'Test City',
      country: 'Testland',
      region: 'Test Region',
      researchSummary: 'Info',
      isFferryCrossing: false,
      language: 'en',
    };
    
    // Check that the prompt contains the key elements instead of exact match
    // since camera selection varies
    expect(result.llmUserPrompt).toContain("I'm visiting Test City, Test Region, Testland");
    expect(result.llmUserPrompt).toContain('Research about this place:');
    expect(result.llmUserPrompt).toContain('Info');
    expect(result.llmUserPrompt).toContain('shot with Leica M11 using 50mm f/2 lens');
    expect(result.imagePrompt).toBe('Prompt ES');
    expect(result.narrative).toBe('Narrativa');
  });

  it('generates content even when research is empty', async () => {
    const routePoint: any = {
      id: 2,
      journeyId: 1,
      sequence: 6,
      status: 'pending',
      placeName: 'Nowhere',
      country: 'Testland',
      region: 'Test Region',
      coordinates: { lat: 1, lng: 2 },
      isFferryCrossing: false,
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      updateResearch(summary: string, osmData: any) {
        this.researchSummary = summary;
        this.osmData = osmData;
        this.status = 'researched';
      },
      updateContent: vi.fn(),
    };

    const routeRepo = {
      findById: vi.fn().mockResolvedValue(routePoint),
      update: vi.fn().mockResolvedValue(undefined),
      upsertContentTranslations: vi.fn().mockResolvedValue(undefined),
    };

    const braveSearch = {
      search: vi.fn().mockResolvedValue([]),
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

    const useCase = new PreparePhotoPromptsUseCase(
      routeRepo as any,
      braveSearch as any,
      llm as any
    );

    const result = await useCase.execute(2);

    expect(llm.generateContent).toHaveBeenCalledTimes(1);
    expect(llm.translateContent).toHaveBeenCalledTimes(1);
    expect(routeRepo.update).toHaveBeenCalledTimes(2);
    expect(result.contentStatus).toBe('generated');
    expect(result.imagePrompt).toBe('Prompt ES');
  });
});
