export interface Photo {
  id: number;
  journeyId: number;
  routePointId: number;
  imageUrl: string;
  gridThumbnailUrl: string;
  heroThumbnailUrl: string;
  narrative: string;
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
  revisedPrompt: string | null;
  publishedAt: Date;
  createdAt: Date;
}

export interface CreatePhotoInput {
  journeyId: number;
  routePointId: number;
  imageUrl: string;
  gridThumbnailUrl: string;
  heroThumbnailUrl: string;
  narrative: string;
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
  revisedPrompt: string | null;
  publishedAt: Date;
}

export interface IPhotoRepository {
  create(input: CreatePhotoInput): Promise<number>;
  findById(id: number): Promise<Photo | null>;
  findByJourneyId(journeyId: number, limit?: number, offset?: number): Promise<Photo[]>;
  findLatest(limit?: number): Promise<Photo[]>;
}
