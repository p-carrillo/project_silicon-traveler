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

export interface ContentInput {
  placeName: string;
  country: string;
  region: string;
  researchSummary: string;
  isFferryCrossing: boolean;
}

export interface ILLMPort {
  generateContent(input: ContentInput): Promise<GeneratedContent>;
}
