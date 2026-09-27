import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PreparePhotoPromptsUseCase } from '../../../src/application/prepare-photo-prompts.use-case';
import { NARRATIVE_SYSTEM_PROMPT } from '@silicon-traveler/content';

vi.mock('@silicon-traveler/content', async () => {
  const actual = await vi.importActual<typeof import('@silicon-traveler/content')>('@silicon-traveler/content');
  return {
    ...actual,
    selectPortraitParameters: vi.fn(() => ({
      gender: 'woman',
      age: 34,
      incomeClass: 'middle class',
      shotType: 'close-up',
      expression: 'pensive',
      gaze: 'looking away',
      posture: 'standing',
      timeOfDay: 'dusk',
      activity: 'waiting',
      lightingContrast: 'high contrast',
      filmGrain: 'medium',
      cameraHeight: 'eye level',
      depthOfField: 'shallow',
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
      findRecentNarrativesByJourney: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue(undefined),
      upsertContentTranslations: vi.fn().mockResolvedValue(undefined),
    };

    const braveSearch = {
      search: vi.fn().mockResolvedValue([{ title: 'Test City', description: 'Info', url: 'https://example.test' }]),
    };

    const llm = {
      generateContent: vi.fn().mockResolvedValue({
        imagePrompt: 'Prompt',
        narrative: 'I record Test City in Test Region, Testland as a specific point on the route. The coordinates mark where this entry belongs, while the distance from the previous stop gives it a measurable place in the sequence.',
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
      summarizeResearch: vi.fn().mockResolvedValue('LLM research summary'),
    };

    const useCase = new PreparePhotoPromptsUseCase(
      routeRepo as any,
      braveSearch as any,
      llm as any
    );

    const result = await useCase.execute(1);

    expect(routeRepo.update).toHaveBeenCalledTimes(2);
    expect(result.researchQuery).toBe('Test City');
    expect(result.llmSystemPrompt).toBe(NARRATIVE_SYSTEM_PROMPT);
    expect(result.contentStatus).toBe('generated');

    // Check that the prompt contains the key elements
    expect(result.llmUserPrompt).toContain("I'm passing through Test City, Test Region, Testland");
    expect(result.llmUserPrompt).toContain('## Research about this place');
    expect(result.llmUserPrompt).toContain('LLM research summary');
    expect(result.llmUserPrompt).toContain('40-60 words');
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
      findRecentNarrativesByJourney: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue(undefined),
      upsertContentTranslations: vi.fn().mockResolvedValue(undefined),
    };

    const braveSearch = {
      search: vi.fn().mockResolvedValue([]),
    };

    const llm = {
      generateContent: vi.fn().mockResolvedValue({
        imagePrompt: 'Prompt',
        narrative: 'I record Nowhere in Test Region, Testland as a specific point on the route. The coordinates mark where this entry belongs, while the distance from the previous stop gives it a measurable place in the sequence.',
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
  it('marks an editorially invalid entry as failed after its one regeneration', async () => {
    const routePoint: any = {
      id: 3, journeyId: 1, sequence: 3, status: 'pending', placeName: 'Pamplona',
      country: 'Spain', region: 'Navarre', coordinates: { lat: 42.8, lng: -1.6 },
      distanceFromPrevious: 20, osmData: null, researchSummary: null, narrativePrompt: null,
      updateStatus(status: string, errorMessage: string | null) {
        this.status = status;
        this.errorMessage = errorMessage;
      },
      updateResearch(summary: string) { this.researchSummary = summary; this.status = 'researched'; },
      updateContent: vi.fn(),
    };
    const routeRepo = {
      findById: vi.fn().mockResolvedValue(routePoint),
      findRecentNarrativesByJourney: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue(undefined),
      upsertContentTranslations: vi.fn().mockResolvedValue(undefined),
    };
    const braveSearch = { search: vi.fn().mockResolvedValue([]) };
    const llm = {
      generateContent: vi.fn().mockResolvedValue({
        imagePrompt: 'Prompt',
        narrative: 'A timeless place where silence speaks through memory.',
        cameraMetadata: { camera: 'Leica', lens: '35mm', iso: 100, shutterSpeed: '1/100', aperture: 'f/2.8' },
      }),
      translateContent: vi.fn(),
    };
    const useCase = new PreparePhotoPromptsUseCase(routeRepo as any, braveSearch as any, llm as any);

    await expect(useCase.execute(3)).rejects.toThrow('Editorial quality check failed after one regeneration');

    expect(llm.generateContent).toHaveBeenCalledTimes(2);
    expect(routePoint.status).toBe('failed');
    expect(routePoint.errorMessage).toContain('Editorial quality check failed');
  });

});
