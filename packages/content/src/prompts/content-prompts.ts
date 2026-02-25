import type { ContentInput } from '../ports/llm.port';
import type { PortraitParameters } from '../config/portrait';

const FIXED_PHOTO_PROMPT_BY_LANGUAGE = {
  en: 'A realistic black and white documentary photograph in the style of the Magnum Photos agency. Shot with a Hasselblad 500 series. Natural lighting, authentic moment, present-day documentary aesthetic. Avoid the look of over-processed HDR. Do not include the location name in the photograph.',
  es: 'Una fotografía documental realista en blanco y negro al estilo de la agencia Magnum Photos. Disparada con Hasselblad serie 500. Iluminación natural, momento auténtico, estética documental del presente. Evitar el aspecto HDR sobreprocesado. No incluir el nombre de la ubicación en la fotografía.',
} as const;

const resolvePromptLanguage = (language?: string): keyof typeof FIXED_PHOTO_PROMPT_BY_LANGUAGE => {
  if (language && language.toLowerCase().startsWith('es')) {
    return 'es';
  }
  return 'en';
};

const formatPortraitParametersInline = (parameters: PortraitParameters): string =>
  [
    `gender: ${parameters.gender}`,
    `age: ${parameters.age}`,
    `incomeClass: ${parameters.incomeClass}`,
    `shotType: ${parameters.shotType}`,
    `background: ${parameters.background}`,
    `expression: ${parameters.expression}`,
    `gaze: ${parameters.gaze}`,
    `posture: ${parameters.posture}`,
    `timeOfDay: ${parameters.timeOfDay}`,
    `activity: ${parameters.activity}`,
    `lightingContrast: ${parameters.lightingContrast}`,
    `filmGrain: ${parameters.filmGrain}`,
    `cameraHeight: ${parameters.cameraHeight}`,
    `depthOfField: ${parameters.depthOfField}`,
  ].join(' | ');

export const NARRATIVE_SYSTEM_PROMPT =
  'You are an AI traveling the world virtually through data and algorithms. You write brief, introspective reflections about the places you pass through. Write in first person with a contemplative tone, inspired by travel journals and documentary photography captions.';

export const buildNarrativePrompt = (input: ContentInput): string => {
  const locationContext = `passing through ${input.placeName}, ${input.region}, ${input.country}`;
  const languageInstruction = input.language ? `Write in **${input.language}**.` : '';

  return `# Context
I'm ${locationContext} on my virtual journey around the world.

## Research about this place
${input.researchSummary}

# Instructions
Write a short reflection (2-3 sentences, 40-60 words) about this place.

1. **Focus**: Your impression of ${input.placeName} — what strikes you, what you notice, what this place evokes.
2. **Style**: First person, contemplative, present tense. You are an AI aware of being software, processing the world through data.
3. **Avoid**: Do not mention people, portraits, or photography. This is purely about the place.

${languageInstruction}
Return **only** the reflection text (40-60 words), no JSON or formatting.`;
};

export const buildTranslationPrompt = (input: {
  sourceLanguage: string;
  targetLanguage: string;
  narrative: string;
  imagePrompt: string;
}): string => {
  return `Translate the following content from ${input.sourceLanguage} to ${input.targetLanguage}.

Return ONLY valid JSON with:
1. "imagePrompt": The translated image prompt.
2. "narrative": The translated narrative.

Image prompt:
"""${input.imagePrompt}"""

Narrative:
"""${input.narrative}"""`;
};

export const buildImagePrompt = (input: {
  portraitParameters: PortraitParameters;
  placeName: string;
  region: string;
  country: string;
  language?: string;
}): string => {
  const promptLanguage = resolvePromptLanguage(input.language);
  const fixedPhotoPrompt = FIXED_PHOTO_PROMPT_BY_LANGUAGE[promptLanguage];
  const portraitParams = formatPortraitParametersInline(input.portraitParameters);
  const locationConnector = promptLanguage === 'es' ? 'Fotografiada en' : 'Shot in';

  return `${fixedPhotoPrompt} ${locationConnector} ${input.placeName}, ${input.region}, ${input.country}. ${portraitParams}.`;
};
