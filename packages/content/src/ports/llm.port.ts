import type { PortraitParameters } from '../config/portrait';
export type ContentTravelMode = 'land' | 'air';

export interface GeneratedContent {
  imagePrompt: string;
  narrative: string;
  cameraMetadata: {
    camera: string;
    lens: string;
    iso: number;
    shutterSpeed: string;
    aperture: string;
  };
}

export interface TranslatedContent {
  imagePrompt: string;
  narrative: string;
}

export interface TranslateContentInput {
  sourceLanguage: string;
  targetLanguage: string;
  narrative: string;
  imagePrompt: string;
}

export interface ContentInput {
  placeName: string;
  country: string;
  region: string;
  researchSummary: string;
  travelMode: ContentTravelMode;
  isFferryCrossing?: boolean; // legacy compatibility
  language?: string;
  portraitParameters?: PortraitParameters;
}

export interface ILLMPort {
  generateContent(input: ContentInput): Promise<GeneratedContent>;
  translateContent(input: TranslateContentInput): Promise<TranslatedContent>;
}
