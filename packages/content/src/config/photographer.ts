import photographerConfig from './photographer.json';

export interface CameraConfig {
  model: string;
  lenses: string[];
}

export interface PhotographerConfig {
  cameras: CameraConfig[];
}

export interface CameraSelection {
  camera: string;
  lens: string;
}

const config = photographerConfig as PhotographerConfig;

const fallbackSelection: CameraSelection = {
  camera: 'Leica M11',
  lens: '35mm f/1.4',
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

export const selectCamera = (seed: string): CameraSelection => {
  if (!config.cameras?.length) {
    return fallbackSelection;
  }

  const cameraIndex = hashString(seed) % config.cameras.length;
  const camera = config.cameras[cameraIndex];

  if (!camera.lenses?.length) {
    return {
      camera: camera.model,
      lens: fallbackSelection.lens,
    };
  }

  const lensIndex = hashString(`${seed}:${camera.model}`) % camera.lenses.length;
  return {
    camera: camera.model,
    lens: camera.lenses[lensIndex],
  };
};

export const getDefaultCamera = (): CameraSelection => selectCamera('default');
