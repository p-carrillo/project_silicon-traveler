import type { Point } from '@silicon-traveler/shared';
import { getI18nConfig, type QueryExecutor } from '@silicon-traveler/shared';
import type { IPhotoRepository } from '../domain/photo.repository';
import { buildPhotoLocation, buildPhotoTitle } from './photo-localization';

export interface SyncPublishedPhotoFromRoutePointUseCaseInput {
  routePointId: number;
  placeName: string | null;
  region: string | null;
  country: string | null;
  coordinates: Point;
}

export class SyncPublishedPhotoFromRoutePointUseCase {
  constructor(private readonly photoRepository: IPhotoRepository) {}

  async execute(
    input: SyncPublishedPhotoFromRoutePointUseCaseInput,
    options?: { queryExecutor?: QueryExecutor }
  ): Promise<void> {
    const i18n = getI18nConfig();

    const title = buildPhotoTitle(input.placeName, i18n.defaultLanguage);
    const location = buildPhotoLocation(
      input.placeName,
      input.region,
      input.country,
      i18n.defaultLanguage
    );

    await this.photoRepository.syncPublishedPhotoFromRoutePoint({
      routePointId: input.routePointId,
      title,
      location,
      coordinates: input.coordinates,
      translations: i18n.supportedLanguages.map((language) => ({
        language,
        title: buildPhotoTitle(input.placeName, language),
        location: buildPhotoLocation(input.placeName, input.region, input.country, language),
      })),
    }, options?.queryExecutor);
  }
}
