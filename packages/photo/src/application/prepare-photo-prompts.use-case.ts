import { IRouteRepository, RoutePointContentTranslation } from '@silicon-traveler/route';
import { IBraveSearchPort } from '@silicon-traveler/research';
import {
  ILLMPort,
  ContentInput,
  buildNarrativePrompt,
  NARRATIVE_SYSTEM_PROMPT,
  selectPortraitParameters,
} from '@silicon-traveler/content';
import { Point, getI18nConfig } from '@silicon-traveler/shared';

export interface PreparePhotoPromptsResult {
  routePointId: number;
  journeyId: number;
  sequence: number;
  placeName: string | null;
  region: string | null;
  country: string | null;
  coordinates: Point;
  isFerryCrossing: boolean;
  researchQuery: string;
  researchSummary: string;
  llmSystemPrompt: string;
  llmUserPrompt: string;
  contentStatus: 'generated';
  imagePrompt: string | null;
  narrative: string | null;
  cameraMetadata: {
    camera: string;
    lens: string;
    iso: number;
    shutterSpeed: string;
    aperture: string;
  } | null;
}

export class PreparePhotoPromptsUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly braveSearch: IBraveSearchPort,
    private readonly llm: ILLMPort
  ) {}

  async execute(routePointId: number): Promise<PreparePhotoPromptsResult> {
    const routePoint = await this.routeRepository.findById(routePointId);
    if (!routePoint) {
      throw new Error(`RoutePoint ${routePointId} not found`);
    }

    if (routePoint.status !== 'pending') {
      throw new Error(`RoutePoint ${routePointId} already processed (status: ${routePoint.status})`);
    }

    const query = `${routePoint.placeName || 'Unknown'} ${routePoint.country || ''} history culture tourism`;
    const searchResults = await this.braveSearch.search(query, 3);
    const researchSummary = searchResults.map((r) => r.description).join(' ');

    routePoint.updateResearch(researchSummary, routePoint.osmData);
    await this.routeRepository.update(routePoint);

    const { supportedLanguages, defaultLanguage, contentBaseLanguage } = getI18nConfig();
    const baseLanguage = contentBaseLanguage || defaultLanguage;

    const portraitParameters = selectPortraitParameters();
    const input: ContentInput = {
      placeName: routePoint.placeName || 'Unknown Place',
      country: routePoint.country || 'Unknown Country',
      region: routePoint.region || 'Unknown Region',
      researchSummary,
      isFferryCrossing: routePoint.isFferryCrossing,
      language: baseLanguage,
      portraitParameters,
    };

    const llmUserPrompt = buildNarrativePrompt(input);

    const content = await this.llm.generateContent(input);

    const baseImagePrompt = this.normalizePrompt(content.imagePrompt);
    const translations: RoutePointContentTranslation[] = [
      {
        language: baseLanguage,
        imagePrompt: baseImagePrompt,
        narrative: content.narrative,
      },
    ];

    for (const language of supportedLanguages) {
      if (language === baseLanguage) continue;
      const translated = await this.llm.translateContent({
        sourceLanguage: baseLanguage,
        targetLanguage: language,
        narrative: content.narrative,
        imagePrompt: baseImagePrompt,
      });

      translations.push({
        language,
        imagePrompt: this.normalizePrompt(translated.imagePrompt),
        narrative: translated.narrative,
      });
    }

    const defaultTranslation =
      translations.find((translation) => translation.language === defaultLanguage) ??
      translations[0];

    const imagePrompt = this.normalizePrompt(defaultTranslation.imagePrompt ?? baseImagePrompt);
    const narrative = defaultTranslation.narrative || content.narrative;

    routePoint.updateContent(imagePrompt, narrative, content.cameraMetadata);
    await this.routeRepository.update(routePoint);
    await this.routeRepository.upsertContentTranslations(routePoint.id, translations);

    return {
      routePointId: routePoint.id,
      journeyId: routePoint.journeyId,
      sequence: routePoint.sequence,
      placeName: routePoint.placeName,
      region: routePoint.region,
      country: routePoint.country,
      coordinates: routePoint.coordinates,
      isFerryCrossing: routePoint.isFferryCrossing,
      researchQuery: query,
      researchSummary,
      llmSystemPrompt: NARRATIVE_SYSTEM_PROMPT,
      llmUserPrompt,
      contentStatus: 'generated',
      imagePrompt,
      narrative,
      cameraMetadata: content.cameraMetadata,
    };
  }

  private normalizePrompt(prompt: unknown): string {
    if (typeof prompt === 'string' && prompt.trim().length > 0) {
      return prompt;
    }

    if (prompt !== null && prompt !== undefined) {
      try {
        const stringified = JSON.stringify(prompt);
        if (stringified && stringified !== 'null') {
          return stringified;
        }
      } catch (error) {
        console.warn('Failed to stringify image prompt:', error);
      }
    }

    return 'A documentary black and white photograph of a street scene';
  }
}
