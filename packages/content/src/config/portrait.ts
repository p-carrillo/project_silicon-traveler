export interface PortraitParameters {
  gender: string;
  age: number;
  incomeClass: string;
  shotType: string;
  background: string;
  expression: string;
  gaze: string;
  posture: string;
  timeOfDay: string;
  activity: string;
  lightingContrast: string;
  filmGrain: string;
  cameraHeight: string;
  depthOfField: string;
}

const genderOptions = ['woman', 'man'] as const;
const incomeClassOptions = [
  'indigent',
  'working poor',
  'working class',
  'lower middle class',
  'middle class',
  'upper middle class',
  'affluent',
  'wealthy',
] as const;
const shotTypeOptions = [
  'extreme close-up',
  'close-up',
  'head-and-shoulders',
  'medium close-up',
  'medium (waist-up)',
  'three-quarter',
  'full body',
] as const;
const backgroundOptions = [
  'street',
  'subject home',
  'bar',
  'subject workplace',
  'landscape',
  'market',
  'public transit',
  'park',
  'community space',
] as const;
const expressionOptions = [
  'neutral',
  'pensive',
  'joyful',
  'tired',
  'defiant',
  'serene',
  'wary',
] as const;
const gazeOptions = [
  'direct to camera',
  'looking away',
  'downcast',
  'sideways',
  'upward',
] as const;
const postureOptions = ['standing', 'sitting', 'leaning', 'walking', 'crouched'] as const;
const timeOfDayOptions = ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night'] as const;
const activityOptions = ['resting', 'working', 'commuting', 'socializing', 'waiting', 'observing'] as const;
const lightingContrastOptions = ['soft', 'medium', 'high contrast'] as const;
const filmGrainOptions = ['fine', 'medium', 'coarse'] as const;
const cameraHeightOptions = ['eye level', 'slightly above', 'slightly below', 'waist level'] as const;
const depthOfFieldOptions = ['shallow', 'moderate', 'deep'] as const;

const pick = <T>(options: readonly T[]): T => {
  const index = Math.floor(Math.random() * options.length);
  return options[index];
};

const randomAge = (): number => 5 + Math.floor(Math.random() * 76);

export const selectPortraitParameters = (): PortraitParameters => ({
  gender: pick(genderOptions),
  age: randomAge(),
  incomeClass: pick(incomeClassOptions),
  shotType: pick(shotTypeOptions),
  background: pick(backgroundOptions),
  expression: pick(expressionOptions),
  gaze: pick(gazeOptions),
  posture: pick(postureOptions),
  timeOfDay: pick(timeOfDayOptions),
  activity: pick(activityOptions),
  lightingContrast: pick(lightingContrastOptions),
  filmGrain: pick(filmGrainOptions),
  cameraHeight: pick(cameraHeightOptions),
  depthOfField: pick(depthOfFieldOptions),
});
