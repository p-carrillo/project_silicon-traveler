import { describe, expect, it, vi } from 'vitest';
import { GenerateEditorialContentUseCase, EditorialQualityError } from '../../../src/application/generate-editorial-content.use-case';
import { DEFAULT_EDITORIAL_GENERATION_CONFIG } from '../../../src/config/editorial';
import type { GeneratedContent } from '../../../src/ports/llm.port';

const validContent: GeneratedContent = {
  imagePrompt: 'Documentary image prompt',
  narrative: 'Pamplona is Navarre’s capital, and the Arga River crosses the city beside its historic centre. I follow that waterline through the route notes, where geography gives this entry its shape.',
  cameraMetadata: { camera: 'Leica', lens: '35mm', iso: 100, shutterSpeed: '1/100', aperture: 'f/2.8' },
};

const input = {
  placeName: 'Pamplona',
  country: 'Spain',
  region: 'Navarre',
  researchSummary: 'Pamplona is the capital city of Navarre in northern Spain. The Arga River crosses the city near its historic centre.',
  language: 'en',
};

const context = { sequence: 5, recentNarratives: [] as string[] };

describe('GenerateEditorialContentUseCase', () => {
  it('regenerates once with targeted feedback when the first draft fails quality checks', async () => {
    const generateContent = vi.fn()
      .mockResolvedValueOnce({ ...validContent, narrative: 'A timeless place where silence speaks through memory.' })
      .mockResolvedValueOnce(validContent);
    const useCase = new GenerateEditorialContentUseCase(
      { generateContent } as never,
      DEFAULT_EDITORIAL_GENERATION_CONFIG
    );

    const result = await useCase.execute(input, context);

    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(generateContent.mock.calls[1][0].qualityFeedback).toEqual(expect.arrayContaining([
      expect.stringContaining('concrete fact from the anchor'),
      expect.stringContaining('generic contemplative'),
    ]));
    expect(result.content.narrative).toBe(validContent.narrative);
    expect(result.visualBrief.category).toBe('built-environment');
  });

  it('fails after the single allowed regeneration if the narrative remains generic', async () => {
    const generic = { ...validContent, narrative: 'A timeless place where silence speaks through memory.' };
    const generateContent = vi.fn().mockResolvedValue(generic);
    const useCase = new GenerateEditorialContentUseCase(
      { generateContent } as never,
      DEFAULT_EDITORIAL_GENERATION_CONFIG
    );

    await expect(useCase.execute(input, context)).rejects.toBeInstanceOf(EditorialQualityError);
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('allows route observation when research is empty if the narrative names verified route facts', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      ...validContent,
      narrative: 'I record Pamplona in Navarre as the next point on the route. Its coordinates give this observation a fixed place, and the distance from the previous stop remains part of the record.',
    });
    const useCase = new GenerateEditorialContentUseCase(
      { generateContent } as never,
      DEFAULT_EDITORIAL_GENERATION_CONFIG
    );

    const result = await useCase.execute({ ...input, researchSummary: '' }, {
      sequence: 5,
      coordinates: { lat: 42.8125, lng: -1.6458 },
      distanceFromPrevious: 23.4,
    });

    expect(result.brief.narrativeMode).toBe('route-observation');
    expect(result.visualBrief.category).toBe('movement');
    expect(result.visualBrief.anchorSource).toBe('route');
    expect(result.content.narrative).toContain('Pamplona');
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
