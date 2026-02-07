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
  camera: 'Hasselblad 500 series',
  lens: '50mm f/1.4',
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

export interface CameraMetadata {
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
}

const ISO_VALUES = [100, 200, 400, 800, 1600];
const SHUTTER_SPEEDS = ['1/60', '1/125', '1/250', '1/500', '1/1000'];
const APERTURES = ['f/1.4', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/8'];

export const generateCameraMetadata = (seed: string): CameraMetadata => {
  const selection = selectCamera(seed);
  const hash = hashString(seed);

  const iso = ISO_VALUES[hash % ISO_VALUES.length];
  const shutterSpeed = SHUTTER_SPEEDS[(hash >> 4) % SHUTTER_SPEEDS.length];
  const aperture = APERTURES[(hash >> 8) % APERTURES.length];

  return {
    camera: selection.camera,
    lens: selection.lens,
    iso,
    shutterSpeed,
    aperture,
  };
};
