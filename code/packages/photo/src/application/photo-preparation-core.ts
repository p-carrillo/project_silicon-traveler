import axios from 'axios';
import { getI18nConfig } from '@silicon-traveler/shared';
import { type ILLMPort, selectPortraitParameters } from '@silicon-traveler/content';
import { type IImageGeneratorPort, type IThumbnailGeneratorPort } from '@silicon-traveler/image';
import { type IBraveSearchPort, type SearchResult } from '@silicon-traveler/research';
import type { RoutePointContentTranslation } from '@silicon-traveler/route';

export interface PhotoPreparationInput {
  placeName: string | null;
  country: string | null;
  region: string | null;
  osmData: unknown | null;
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
}

export interface IImageDownloadPort { download(url: string): Promise<Buffer>; }
export interface PhotoPreparationHooks {
  researched?(researchSummary: string): Promise<void>;
  contentGenerated(input: { imagePrompt: string; narrative: string; cameraMetadata: PhotoPreparationCoreResult['cameraMetadata']; translations: RoutePointContentTranslation[] }): Promise<void>;
}

export class AxiosImageDownloadAdapter implements IImageDownloadPort {
  async download(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
}

/** Shared, persistence-free photo pipeline for production and ephemeral runs. */
export class PhotoPreparationCore {
  constructor(
    private readonly braveSearch: IBraveSearchPort,
    private readonly llm: ILLMPort,
    private readonly imageGenerator: IImageGeneratorPort,
    private readonly thumbnailGenerator: IThumbnailGeneratorPort,
    private readonly imageDownloader: IImageDownloadPort = new AxiosImageDownloadAdapter()
  ) {}

  async execute(input: PhotoPreparationInput, hooks?: PhotoPreparationHooks): Promise<PhotoPreparationCoreResult> {
    const query = `${input.placeName || 'Unknown'} ${input.country || ''} history culture tourism`;
    const searchResults = await this.braveSearch.search(query, 3);
    const researchSummary = searchResults.map((result: SearchResult) => result.description).join(' ');
    await hooks?.researched?.(researchSummary);
    const { supportedLanguages, defaultLanguage, contentBaseLanguage } = getI18nConfig();
    const baseLanguage = contentBaseLanguage || defaultLanguage;
    const content = await this.llm.generateContent({
      placeName: input.placeName || 'Unknown Place', country: input.country || 'Unknown Country',
      region: input.region || 'Unknown Region', researchSummary, language: baseLanguage,
      portraitParameters: selectPortraitParameters(),
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
    await hooks?.contentGenerated({ imagePrompt, narrative, cameraMetadata: content.cameraMetadata, translations });
    const image = await this.imageGenerator.generate(baseImagePrompt);
    const imageBuffer = await this.imageDownloader.download(image.url);
    const thumbnails = await this.thumbnailGenerator.generate(imageBuffer, [
      { width: 400, height: 400, suffix: '_grid' }, { width: 1024, height: 1024, suffix: '_hero' },
    ]);
    return { researchSummary, translations, imagePrompt, narrative, cameraMetadata: content.cameraMetadata, imageBuffer, thumbnails, revisedPrompt: image.revisedPrompt || null };
  }
}

function normalizePrompt(prompt: unknown): string {
  if (typeof prompt === 'string' && prompt.trim()) return prompt;
  try { const value = JSON.stringify(prompt); if (value && value !== 'null') return value; } catch { /* safe fallback */ }
  return 'A documentary black and white photograph of a street scene';
}
