import { describe, it, expect, vi } from 'vitest';
import { PreparePhotoPromptsUseCase } from '../../../src/application/prepare-photo-prompts.use-case';
import { buildContentPrompt, CONTENT_SYSTEM_PROMPT, selectCamera } from '@silicon-traveler/content';

describe('PreparePhotoPromptsUseCase', () => {
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
    };
    const cameraSelection = selectCamera(`${input.placeName}|${input.region}|${input.country}`);
    expect(result.llmUserPrompt).toBe(buildContentPrompt(input, cameraSelection));
    expect(result.imagePrompt).toBe('Prompt');
    expect(result.narrative).toBe('Narrative');
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
    };

    const useCase = new PreparePhotoPromptsUseCase(
      routeRepo as any,
      braveSearch as any,
      llm as any
    );

    const result = await useCase.execute(2);

    expect(llm.generateContent).toHaveBeenCalledTimes(1);
    expect(routeRepo.update).toHaveBeenCalledTimes(2);
    expect(result.contentStatus).toBe('generated');
    expect(result.imagePrompt).toBe('Prompt');
  });
});
