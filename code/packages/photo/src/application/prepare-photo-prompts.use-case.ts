import { IRouteRepository, RoutePointContentTranslation } from '@silicon-traveler/route';
import { IBraveSearchPort, ResearchPlaceUseCase } from '@silicon-traveler/research';
import type { VisualBrief } from '@silicon-traveler/content';
import {
  ILLMPort,
  ContentInput,
  buildNarrativePrompt,
  NARRATIVE_SYSTEM_PROMPT,
  GenerateEditorialContentUseCase,
  getEditorialGenerationConfig,
  type EditorialGenerationConfig,
} from '@silicon-traveler/content';
import { Point, getI18nConfig } from '@silicon-traveler/shared';
import { getVerifiedPlaceObservations } from './verified-place-observations';

export interface PreparePhotoPromptsResult {
  routePointId: number;
  journeyId: number;
  sequence: number;
  placeName: string | null;
  region: string | null;
  country: string | null;
  coordinates: Point;
  researchQuery: string;
  researchSummary: string;
  llmSystemPrompt: string;
  llmUserPrompt: string;
  contentStatus: 'generated';
  imagePrompt: string | null;
  narrative: string | null;
  visualBrief: VisualBrief;
  cameraMetadata: {
    camera: string;
    lens: string;
    iso: number;
    shutterSpeed: string;
    aperture: string;
  } | null;
}

export class PreparePhotoPromptsUseCase {
  private readonly researchPlace: ResearchPlaceUseCase;
  private readonly editorialContent: GenerateEditorialContentUseCase;
  private readonly editorialConfig: EditorialGenerationConfig;

  constructor(
    private readonly routeRepository: IRouteRepository,
    braveSearch: IBraveSearchPort,
    private readonly llm: ILLMPort,
    editorialConfig: EditorialGenerationConfig = getEditorialGenerationConfig()
  ) {
    this.researchPlace = new ResearchPlaceUseCase(braveSearch, llm);
    this.editorialConfig = editorialConfig;
    this.editorialContent = new GenerateEditorialContentUseCase(llm, editorialConfig);
  }

  async execute(routePointId: number): Promise<PreparePhotoPromptsResult> {
    const routePoint = await this.routeRepository.findById(routePointId);
    if (!routePoint) {
      throw new Error(`RoutePoint ${routePointId} not found`);
    }

    if (routePoint.status !== 'pending') {
      throw new Error(`RoutePoint ${routePointId} already processed (status: ${routePoint.status})`);
    }

    const { supportedLanguages, defaultLanguage, contentBaseLanguage } = getI18nConfig();
    const baseLanguage = contentBaseLanguage || defaultLanguage;
    const summaryLanguage = baseLanguage.toLowerCase().startsWith('es') ? 'es' : 'en';
    const research = await this.researchPlace.executeForPlace(routePoint.placeName || '', { summaryLanguage });
    const query = research.query;
    const researchSummary = research.summary;

    const recentNarratives = this.editorialConfig.recentHistoryLimit > 0
      ? await this.routeRepository.findRecentNarrativesByJourney(
          routePoint.journeyId, routePoint.sequence, this.editorialConfig.recentHistoryLimit
        )
      : [];
    routePoint.updateResearch(researchSummary, routePoint.osmData);
    await this.routeRepository.update(routePoint);

    const input: ContentInput = {
      placeName: routePoint.placeName || 'Unknown Place',
      country: routePoint.country || 'Unknown Country',
      region: routePoint.region || 'Unknown Region',
      researchSummary,
      language: baseLanguage,
    };

    let generated: Awaited<ReturnType<GenerateEditorialContentUseCase['execute']>>;
    try {
      generated = await this.editorialContent.execute(input, {
        sequence: routePoint.sequence,
        coordinates: routePoint.coordinates,
        distanceFromPrevious: routePoint.distanceFromPrevious,
        recentNarratives: recentNarratives.map((entry) => entry.narrative),
        verifiedGeographicObservations: getVerifiedPlaceObservations(routePoint.osmData, routePoint.placeName),
      });
    } catch (error: unknown) {
      routePoint.updateStatus('failed', error instanceof Error ? error.message : 'Editorial generation failed');
      await this.routeRepository.update(routePoint);
      throw error;
    }
    const { content, brief, visualBrief } = generated;
    const llmUserPrompt = buildNarrativePrompt({ ...input, editorialBrief: brief });

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

    const auditedVisualBrief: VisualBrief = { ...visualBrief, originalPrompt: baseImagePrompt, revisedPrompt: null };
    routePoint.updateContent(imagePrompt, narrative, content.cameraMetadata, auditedVisualBrief);
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
      researchQuery: query,
      researchSummary,
      llmSystemPrompt: NARRATIVE_SYSTEM_PROMPT,
      llmUserPrompt,
      contentStatus: 'generated',
      imagePrompt,
      narrative,
      visualBrief: auditedVisualBrief,
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
