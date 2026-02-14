import { describe, it, expect } from 'vitest';
import { GenerateContentUseCase } from '../../../src/application/generate-content.use-case';

describe('GenerateContentUseCase', () => {
  it('delegates to the LLM port', async () => {
    const llm = {
      generateContent: async () => ({
        imagePrompt: 'Image',
        narrative: 'Narrative',
        cameraMetadata: {
          camera: 'Leica',
          lens: '35mm',
          iso: 200,
          shutterSpeed: '1/200',
          aperture: 'f/2',
        },
      }),
    };

    const useCase = new GenerateContentUseCase(llm as any);
    const result = await useCase.execute({
      placeName: 'Test',
      country: 'Country',
      region: 'Region',
      researchSummary: 'Summary',
      travelMode: 'land',
      language: 'en',
    });

    expect(result.imagePrompt).toBe('Image');
    expect(result.narrative).toBe('Narrative');
  });
});
