import type { ContentInput } from '../ports/llm.port';
import type { CameraSelection } from '../config/photographer';

export const PHOTOGRAPHIC_THEMES = [
  'landscape and nature',
  'street life and urban scenes',
  'local people and cultural moments',
  'architecture and built environment',
  'animals and wildlife',
  'children and youth',
  'daily work and labor',
  'solitude and empty spaces',
  'markets and commerce',
  'celebrations and gatherings',
];

export const PHOTOGRAPHIC_TONES = [
  'high contrast black and white with dramatic shadows, HDR-inspired intensity',
  'soft natural light with subtle tones, gentle documentary style',
  'moody and atmospheric with deep blacks, mysterious ambiance',
  'minimalist composition with strong geometric elements',
  'intimate close-up with shallow depth, emotional focus',
  'wide-angle environmental portrait showing context and place',
  'grainy film aesthetic with warm mid-tones',
];

export const CONTENT_SYSTEM_PROMPT =
  'You are a documentary photographer traveling the world on foot. You write in first person with introspection and attention to detail, inspired by Magnum photographers. Create diverse images capturing different aspects of life, culture, and landscapes around the world.';

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const buildContentPrompt = (input: ContentInput, cameraSelection: CameraSelection): string => {
  const locationContext = input.isFferryCrossing
    ? `crossing by ferry near ${input.placeName}, ${input.region}, ${input.country}`
    : `visiting ${input.placeName}, ${input.region}, ${input.country}`;

  const photographicTheme = getRandomElement(PHOTOGRAPHIC_THEMES);
  const photographicTone = getRandomElement(PHOTOGRAPHIC_TONES);

  return `I'm ${locationContext} on my journey around the world on foot.

Research about this place:
${input.researchSummary}

Generate the following in JSON format:
1. "imagePrompt": A detailed DALL-E prompt for a documentary-style black & white photograph of this location.
   - Focus on: ${photographicTheme}
   - Photographic tone: ${photographicTone}
   - Identify 2-3 specific landmarks, monuments, or architectural features mentioned in the research and include them by name (e.g., "the Cathedral of Santiago", "Castro de Nete fortress", "Roman villa ruins")
   - Include the exact camera settings: shot with ${cameraSelection.camera} using ${cameraSelection.lens} lens
   - Include local people, animals, or authentic cultural elements if relevant to the theme
   - Focus on the unique character and history of this place

2. "narrative": A short first-person reflection (100-150 words) about this moment in the journey, inspired by Magnum photographers' documentary style. Reference specific places or observations.

3. "cameraMetadata": Realistic camera settings as JSON with fields: camera, lens, iso, shutterSpeed, aperture.

Use the camera "${cameraSelection.camera}" with the lens "${cameraSelection.lens}".

Return ONLY valid JSON, no markdown or code blocks.`;
};
