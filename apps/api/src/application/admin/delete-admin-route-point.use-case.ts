import type { IRouteRepository } from '@silicon-traveler/route';
import { DeleteRoutePointAdminUseCase } from '@silicon-traveler/route';
import type { IStoragePort } from '@silicon-traveler/storage';
import { runInTransaction } from '@silicon-traveler/shared';
import { deriveThumbnailPath } from './photo-prepared.factory';

interface DeleteRoutePointResult {
  routePointId: number;
  imagePath: string | null;
  thumbnailPath: string | null;
}

export class DeleteAdminRoutePointUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly deleteRoutePointAdminUseCase: DeleteRoutePointAdminUseCase,
    private readonly storage: IStoragePort
  ) {}

  async execute(routePointId: number): Promise<void> {
    const result = await runInTransaction(async (queryExecutor) => {
      const routePoint = await this.routeRepository.findById(routePointId, queryExecutor);
      if (!routePoint) {
        throw new Error(`RoutePoint ${routePointId} not found`);
      }

      await this.deleteRoutePointAdminUseCase.execute(routePointId, { queryExecutor });

      return {
        routePointId,
        imagePath: routePoint.imagePath,
        thumbnailPath: routePoint.thumbnailPath,
      } satisfies DeleteRoutePointResult;
    });

    await this.deleteRoutePointFiles(result);
  }

  private async deleteRoutePointFiles(result: DeleteRoutePointResult): Promise<void> {
    const paths = this.resolveImagePathsToDelete(result.imagePath, result.thumbnailPath);
    if (!paths.length) {
      return;
    }

    const operations = paths.map(async (path) => {
      try {
        await this.storage.deleteImage(path);
      } catch (error) {
        console.error('Admin route-point image cleanup failed', {
          routePointId: result.routePointId,
          path,
          error,
        });
      }
    });

    await Promise.allSettled(operations);
  }

  private resolveImagePathsToDelete(imagePath: string | null, thumbnailPath: string | null): string[] {
    const paths = new Set<string>();

    if (imagePath) {
      const normalized = normalizeRelativeImagePath(imagePath);
      paths.add(normalized);
      paths.add(deriveThumbnailPath(normalized, '_hero'));
    }

    if (thumbnailPath) {
      paths.add(normalizeRelativeImagePath(thumbnailPath));
    }

    return Array.from(paths);
  }
}

function normalizeRelativeImagePath(urlOrPath: string): string {
  if (urlOrPath.startsWith('/images/')) return urlOrPath.slice('/images/'.length);
  if (urlOrPath.startsWith('images/')) return urlOrPath.slice('images/'.length);
  return urlOrPath.replace(/^\//, '');
}
