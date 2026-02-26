import { describe, it, expect } from 'vitest';
import { selectPortraitParameters } from '../../../src/config/portrait';

describe('selectPortraitParameters', () => {
  it('returns values within allowed ranges', () => {
    const parameters = selectPortraitParameters();

    const genderOptions = ['woman', 'man', 'non-binary'];
    const incomeClassOptions = [
      'indigent',
      'working poor',
      'working class',
      'lower middle class',
      'middle class',
      'upper middle class',
      'affluent',
      'wealthy',
      'multimillionaire',
    ];
    const shotTypeOptions = [
      'extreme close-up',
      'close-up',
      'head-and-shoulders',
      'medium close-up',
      'medium (waist-up)',
      'three-quarter',
      'full body',
    ];
    const expressionOptions = [
      'neutral',
      'pensive',
      'joyful',
      'tired',
      'defiant',
      'serene',
      'wary',
    ];
    const gazeOptions = ['direct to camera', 'looking away', 'downcast', 'sideways', 'upward'];
    const postureOptions = ['standing', 'sitting', 'leaning', 'walking', 'crouched'];
    const timeOfDayOptions = ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night'];
    const activityOptions = ['resting', 'working', 'commuting', 'socializing', 'waiting', 'observing'];
    const lightingContrastOptions = ['soft', 'medium', 'high contrast'];
    const filmGrainOptions = ['fine', 'medium', 'coarse'];
    const cameraHeightOptions = ['eye level', 'slightly above', 'slightly below', 'waist level'];
    const depthOfFieldOptions = ['shallow', 'moderate', 'deep'];

    expect(genderOptions).toContain(parameters.gender);
    expect(parameters.age).toBeGreaterThanOrEqual(0);
    expect(parameters.age).toBeLessThanOrEqual(112);
    expect(incomeClassOptions).toContain(parameters.incomeClass);
    expect(shotTypeOptions).toContain(parameters.shotType);
    expect(expressionOptions).toContain(parameters.expression);
    expect(gazeOptions).toContain(parameters.gaze);
    expect(postureOptions).toContain(parameters.posture);
    expect(timeOfDayOptions).toContain(parameters.timeOfDay);
    expect(activityOptions).toContain(parameters.activity);
    expect(lightingContrastOptions).toContain(parameters.lightingContrast);
    expect(filmGrainOptions).toContain(parameters.filmGrain);
    expect(cameraHeightOptions).toContain(parameters.cameraHeight);
    expect(depthOfFieldOptions).toContain(parameters.depthOfField);
  });
});
