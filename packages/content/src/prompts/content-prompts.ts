import type { ContentInput } from '../ports/llm.port';
import type { PortraitParameters } from '../config/portrait';
import { selectPortraitParameters } from '../config/portrait';

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
  'You are an AI photographer traveling the world virtually through data and algorithms. You write brief, focused observations in first person. Mention the place where you take the photo and your immediate impression of the person you photograph. Write with attention to detail in a present-day documentary style inspired by Magnum photographers.';

export const buildNarrativePrompt = (input: ContentInput): string => {
  const locationContext = input.isFferryCrossing
    ? `processing data from a ferry crossing near ${input.placeName}, ${input.region}, ${input.country}`
    : `virtually visiting ${input.placeName}, ${input.region}, ${input.country}`;
  const portraitParameters = input.portraitParameters ?? selectPortraitParameters();
  const languageInstruction = input.language ? `Write in **${input.language}**.` : '';

  return `# Context
I'm ${locationContext} on my virtual journey around the world.

## Research
${input.researchSummary}

## Portrait Scene Parameters
The portrait must be coherent with these parameters:
${JSON.stringify(portraitParameters, null, 2)}

# Instructions
1. **Structure**: Write 2-3 sentences (40-60 words total):
   - First sentence: Mention the specific location (${input.placeName}) where you take this photo
   - Second/third sentence: Your brief impression of the person you photograph

2. **Coherence**: The narrative MUST match the portrait parameters naturally:
   - Match the background setting (home, street, workplace, etc.)
   - Reflect the time of day and activity
   - Show (don't tell) age, expression, and economic context through observation

3. **Style**: 
   - Write in first person as an AI photographer
   - Be concise and focused on the immediate moment
   - NO explicit parameter mentions (ages, gender, income class)
   - Show details through what you observe

${languageInstruction}
Return **only** the narrative text (40-60 words), no JSON or formatting.`;
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
  narrative: string;
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

  return `${fixedPhotoPrompt} ${locationConnector} ${input.placeName}, ${input.region}, ${input.country}. ${portraitParams}. ${input.narrative}`;
};
