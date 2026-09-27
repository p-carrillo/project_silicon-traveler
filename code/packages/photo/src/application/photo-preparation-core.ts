import axios from 'axios';
import { getI18nConfig } from '@silicon-traveler/shared';
import {
  type ILLMPort,
  type EditorialGenerationConfig,
  GenerateEditorialContentUseCase,
  getEditorialGenerationConfig,
} from '@silicon-traveler/content';
import { type IImageGeneratorPort, type IThumbnailGeneratorPort } from '@silicon-traveler/image';
import { ResearchPlaceUseCase, type IBraveSearchPort, type SearchResult } from '@silicon-traveler/research';
import type { RoutePointContentTranslation } from '@silicon-traveler/route';
import { getVerifiedPlaceObservations } from './verified-place-observations';
import type { VisualBrief } from '@silicon-traveler/content';

export interface PhotoPreparationInput {
  placeName: string | null;
  country: string | null;
  region: string | null;
  osmData: unknown | null;
  sequence?: number;
  coordinates?: { lat: number; lng: number } | null;
  distanceFromPrevious?: number | null;
  recentNarratives?: readonly string[];
}

export interface PhotoPreparationCoreResult {
  researchSummary: string;
  translations: RoutePointContentTranslation[];
  imagePrompt: string;
  narrative: string;
  cameraMetadata: { camera: string; lens: string; iso: number; shutterSpeed: string; aperture: string };
  imageBuffer: Buffer;
  thumbnails: Map<string, Buffer>;
  revisedPrompt: string | null;
  visualBrief: VisualBrief;
}

export interface IImageDownloadPort { download(url: string): Promise<Buffer>; }
export interface PhotoPreparationHooks {
  researchStarted?(): Promise<void>;
  researched?(researchSummary: string): Promise<void>;
  researchSources?(sources: Array<Pick<SearchResult, 'title' | 'url'>>): Promise<void>;
  contentGenerationStarted?(): Promise<void>;
  contentGenerated(input: { imagePrompt: string; narrative: string; cameraMetadata: PhotoPreparationCoreResult['cameraMetadata']; translations: RoutePointContentTranslation[]; visualBrief: VisualBrief }): Promise<void>;
  visualBriefFinalized?(visualBrief: VisualBrief): Promise<void>;
  imageGenerationStarted?(): Promise<void>;
  imageGenerated?(): Promise<void>;
  thumbnailGenerationStarted?(): Promise<void>;
  thumbnailsGenerated?(): Promise<void>;
}

export class AxiosImageDownloadAdapter implements IImageDownloadPort {
  async download(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
}

/** Shared, persistence-free photo pipeline for production and ephemeral runs. */
export class PhotoPreparationCore {
  private readonly researchPlace: ResearchPlaceUseCase;
  private readonly editorialContent: GenerateEditorialContentUseCase;

  constructor(
    braveSearch: IBraveSearchPort,
    private readonly llm: ILLMPort,
    private readonly imageGenerator: IImageGeneratorPort,
    private readonly thumbnailGenerator: IThumbnailGeneratorPort,
    private readonly imageDownloader: IImageDownloadPort = new AxiosImageDownloadAdapter(),
    editorialConfig: EditorialGenerationConfig = getEditorialGenerationConfig()
  ) {
    this.researchPlace = new ResearchPlaceUseCase(braveSearch, llm);
    this.editorialContent = new GenerateEditorialContentUseCase(llm, editorialConfig);
  }

  async execute(input: PhotoPreparationInput, hooks?: PhotoPreparationHooks): Promise<PhotoPreparationCoreResult> {
    const location = input.placeName?.trim() ?? '';
    const { supportedLanguages, defaultLanguage, contentBaseLanguage } = getI18nConfig();
    const baseLanguage = contentBaseLanguage || defaultLanguage;
    const summaryLanguage = baseLanguage.toLowerCase().startsWith('es') ? 'es' : 'en';
    await hooks?.researchStarted?.();
    const research = await this.researchPlace.executeForPlace(location, { summaryLanguage });
    const researchSummary = research.summary;
    await hooks?.researched?.(researchSummary);
    await hooks?.researchSources?.(research.sources);
    await hooks?.contentGenerationStarted?.();
    const { content, visualBrief } = await this.editorialContent.execute({
      placeName: input.placeName || 'Unknown Place', country: input.country || 'Unknown Country',
      region: input.region || 'Unknown Region', researchSummary, language: baseLanguage,
    }, {
      sequence: input.sequence ?? 0,
      coordinates: input.coordinates,
      distanceFromPrevious: input.distanceFromPrevious,
      recentNarratives: input.recentNarratives,
      verifiedGeographicObservations: getVerifiedPlaceObservations(input.osmData, input.placeName),
    });
    const baseImagePrompt = normalizePrompt(content.imagePrompt);
    const translations: RoutePointContentTranslation[] = [{ language: baseLanguage, imagePrompt: baseImagePrompt, narrative: content.narrative }];
    for (const language of supportedLanguages) {
      if (language === baseLanguage) continue;
      const translated = await this.llm.translateContent({ sourceLanguage: baseLanguage, targetLanguage: language, narrative: content.narrative, imagePrompt: baseImagePrompt });
      translations.push({ language, imagePrompt: normalizePrompt(translated.imagePrompt), narrative: translated.narrative });
    }
    const preferred = translations.find((translation) => translation.language === defaultLanguage) ?? translations[0];
    const imagePrompt = normalizePrompt(preferred.imagePrompt ?? baseImagePrompt);
    const narrative = preferred.narrative || content.narrative;
    const initialVisualBrief: VisualBrief = { ...visualBrief, reflection: content.narrative, originalPrompt: baseImagePrompt, revisedPrompt: null };
    await hooks?.contentGenerated({ imagePrompt, narrative, cameraMetadata: content.cameraMetadata, translations, visualBrief: initialVisualBrief });
    await hooks?.imageGenerationStarted?.();
    const image = await this.imageGenerator.generate(baseImagePrompt);
    const revisedPrompt = image.revisedPrompt || null;
    const auditedVisualBrief: VisualBrief = { ...initialVisualBrief, revisedPrompt };
    await hooks?.visualBriefFinalized?.(auditedVisualBrief);
    const imageBuffer = await this.imageDownloader.download(image.url);
    await hooks?.imageGenerated?.();
    await hooks?.thumbnailGenerationStarted?.();
    const thumbnails = await this.thumbnailGenerator.generate(imageBuffer, [
      { width: 400, height: 400, suffix: '_grid' }, { width: 1024, height: 1024, suffix: '_hero' },
    ]);
    await hooks?.thumbnailsGenerated?.();
    return { researchSummary, translations, imagePrompt, narrative, cameraMetadata: content.cameraMetadata, imageBuffer, thumbnails, revisedPrompt, visualBrief: auditedVisualBrief };
  }
}

function normalizePrompt(prompt: unknown): string {
  if (typeof prompt === 'string' && prompt.trim()) return prompt;
  try { const value = JSON.stringify(prompt); if (value && value !== 'null') return value; } catch { /* safe fallback */ }
  return 'A documentary black and white photograph of a street scene';
}
