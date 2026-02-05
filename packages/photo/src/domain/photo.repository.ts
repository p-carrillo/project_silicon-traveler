import type { Point } from '@silicon-traveler/shared';

export interface PhotoMetadata {
  aperture?: string | null;
  revisedPrompt?: string | null;
  heroThumbnailUrl?: string | null;
  imagePrompt?: string | null;
  isFerryCrossing?: boolean;
}

export interface PhotoTranslation {
  language: string;
  title: string;
  narrative: string;
  location: string;
}

export interface Photo {
  id: number;
  journeyId: number;
  routePointId: number;
  title: string;
  narrative: string;
  location: string;
  coordinates: Point;
  camera: string | null;
  lens: string | null;
  iso: number | null;
  shutterSpeed: string | null;
  rollNumber: string | null;
  frameNumber: string | null;
  seriesName: string | null;
  volumeIssue: string | null;
  tags: string[] | null;
  metadata: PhotoMetadata | null;
  imageUrl: string;
  gridThumbnailUrl: string;
  heroThumbnailUrl: string;
  publishedAt: Date;
  createdAt: Date;
}

export interface CreatePhotoInput {
  routePointId: number;
  title: string;
  narrative: string;
  location: string;
  coordinates: Point;
  camera: string | null;
  lens: string | null;
  iso: number | null;
  shutterSpeed: string | null;
  rollNumber: string | null;
  frameNumber: string | null;
  seriesName: string | null;
  volumeIssue: string | null;
  tags: string[] | null;
  metadata: PhotoMetadata | null;
  imageUrl: string;
  gridThumbnailUrl: string;
  translations: PhotoTranslation[];
  publishedAt: Date;
}

export interface IPhotoRepository {
  create(input: CreatePhotoInput): Promise<number>;
  findById(id: number): Promise<Photo | null>;
  findByJourneyId(journeyId: number, limit?: number, offset?: number): Promise<Photo[]>;
  findLatest(limit?: number): Promise<Photo[]>;
}
