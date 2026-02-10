import { Point } from '@silicon-traveler/shared';
import type { RoutePointCreateParams } from '../ports/route-repository.port';

export type RouteStatus = 'pending' | 'researched' | 'content_generated' | 'image_ready' | 'published' | 'failed';

export class RoutePoint {
  constructor(
    public readonly id: number,
    public readonly journeyId: number,
    public readonly sequence: number,
    public placeName: string | null,
    public coordinates: Point,
    public country: string | null,
    public region: string | null,
    public readonly isFferryCrossing: boolean,
    public readonly distanceFromPrevious: number | null,
    public osmData: any | null,
    public researchSummary: string | null,
    public imagePrompt: string | null,
    public narrativePrompt: string | null,
    public cameraMetadata: any | null,
    public status: RouteStatus,
    public errorMessage: string | null,
    public imagePath: string | null,
    public thumbnailPath: string | null,
    public readonly createdAt: Date,
    public publishedAt: Date | null,
    public updatedAt: Date
  ) {}

  updateStatus(status: RouteStatus, errorMessage: string | null = null): void {
    this.status = status;
    this.errorMessage = errorMessage;
    this.updatedAt = new Date();
  }

  updateResearch(summary: string, osmData: any): void {
    this.researchSummary = summary;
    this.osmData = osmData;
    this.status = 'researched';
    this.updatedAt = new Date();
  }

  updateContent(imagePrompt: string, narrativePrompt: string, cameraMetadata: any): void {
    this.imagePrompt = imagePrompt;
    this.narrativePrompt = narrativePrompt;
    this.cameraMetadata = cameraMetadata;
    this.status = 'content_generated';
    this.updatedAt = new Date();
  }

  updateImages(imagePath: string, thumbnailPath: string): void {
    this.imagePath = imagePath;
    this.thumbnailPath = thumbnailPath;
    this.status = 'image_ready';
    this.updatedAt = new Date();
  }

  markPublished(): void {
    this.status = 'published';
    this.publishedAt = new Date();
    this.updatedAt = new Date();
  }

  static create(
    journeyId: number,
    sequence: number,
    coordinates: Point,
    isFerry: boolean = false,
    distance: number | null = null
  ): RoutePointCreateParams {
    return {
      journeyId,
      sequence,
      placeName: null,
      coordinates,
      country: null,
      region: null,
      isFferryCrossing: isFerry,
      distanceFromPrevious: distance,
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      status: 'pending',
      errorMessage: null,
      imagePath: null,
      thumbnailPath: null,
      publishedAt: null,
    };
  }
}
