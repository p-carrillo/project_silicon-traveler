import metadataConfig from './photo-metadata.json';

export interface PhotoMetadataConfig {
  seriesName: string;
  volumeIssue: string;
  framesPerRoll: number;
  rollPrefix: string;
}

const defaultConfig: PhotoMetadataConfig = {
  seriesName: 'Around the World on Foot',
  volumeIssue: '01 // 26',
  framesPerRoll: 36,
  rollPrefix: 'ROLL',
};

export const photoMetadataConfig: PhotoMetadataConfig = {
  ...defaultConfig,
  ...metadataConfig,
};
