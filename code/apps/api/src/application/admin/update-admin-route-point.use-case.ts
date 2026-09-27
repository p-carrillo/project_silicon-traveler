import {
  type RoutePoint,
  type RoutePointContentTranslation,
  type RouteStatus,
  type IRouteRepository,
  UpdateRoutePointAdminUseCase,
} from '@silicon-traveler/route';
import {
  type IPhotoRepository,
  PublishPhotoUseCase,
  SyncPublishedPhotoFromRoutePointUseCase,
} from '@silicon-traveler/photo';
import { runInTransaction } from '@silicon-traveler/shared';
import { buildPreparedPhotoFromRoutePoint } from './photo-prepared.factory';

export interface UpdateAdminRoutePointInput {
  id: number;
  placeName?: string | null;
  country?: string | null;
  region?: string | null;
  coordinates?: { lat: number; lng: number };
  imagePrompt?: string | null;
  narrativePrompt?: string | null;
  imagePath?: string | null;
  thumbnailPath?: string | null;
  status?: RouteStatus;
  errorMessage?: string | null;
  translations?: RoutePointContentTranslation[];
}

export class UpdateAdminRoutePointUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly photoRepository: IPhotoRepository,
    private readonly updateRoutePointAdminUseCase: UpdateRoutePointAdminUseCase,
    private readonly publishPhotoUseCase: PublishPhotoUseCase,
    private readonly syncPublishedPhotoFromRoutePointUseCase: SyncPublishedPhotoFromRoutePointUseCase
  ) {}

  async execute(input: UpdateAdminRoutePointInput): Promise<RoutePoint> {
    return await runInTransaction(async (queryExecutor) => {
      const currentRoutePoint = await this.routeRepository.findById(input.id, queryExecutor);
      if (!currentRoutePoint) {
        throw new Error(`RoutePoint ${input.id} not found`);
      }

      const requestedStatus = input.status;
      const isPublishingTransition =
        requestedStatus === 'published' && currentRoutePoint.status !== 'published';
      const hasExistingPhoto = isPublishingTransition
        ? await this.photoRepository.hasByRoutePointId(input.id, queryExecutor)
        : false;
      const statusForUpdate =
        isPublishingTransition && !hasExistingPhoto ? undefined : requestedStatus;

      const updated = await this.updateRoutePointAdminUseCase.execute(
        {
          ...input,
          status: statusForUpdate,
        },
        { queryExecutor }
      );

      if (input.translations?.length) {
        await this.routeRepository.upsertContentTranslations(input.id, input.translations, queryExecutor);
      }

      if (currentRoutePoint.status === 'published' && updated.status !== 'published') {
        await this.photoRepository.deleteByRoutePointId(updated.id, queryExecutor);
      }

      if (isPublishingTransition && !hasExistingPhoto) {
        this.assertRoutePointCanBePublished(updated);
        await this.publishPhotoUseCase.execute(
          updated.id,
          buildPreparedPhotoFromRoutePoint(updated),
          { queryExecutor }
        );
      } else if (updated.status === 'published') {
        await this.syncPublishedPhotoFromRoutePointUseCase.execute(
          {
            routePointId: updated.id,
            placeName: updated.placeName,
            country: updated.country,
            region: updated.region,
            coordinates: updated.coordinates,
            imagePath: updated.imagePath ?? undefined,
            thumbnailPath: updated.thumbnailPath ?? undefined,
          },
          { queryExecutor }
        );
      }

      return updated;
    });
  }

  private assertRoutePointCanBePublished(routePoint: RoutePoint): void {
    if (routePoint.status !== 'image_ready') {
      throw new Error('Route point must be image_ready to publish');
    }

    if (!routePoint.imagePath || !routePoint.thumbnailPath) {
      throw new Error('Route point requires image assets before publishing');
    }
  }
}
