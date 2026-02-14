import express, { Router, type Request, type Response } from 'express';
import { pool } from '@silicon-traveler/shared';
import {
  CreateFutureRoutePointUseCase,
  DeleteRoutePointAdminUseCase,
  GeocodePlaceUseCase,
  ListRoutePointsUseCase,
  MariaDBRouteRepository,
  NominatimAdapter,
  UpdateRoutePointAdminUseCase,
} from '@silicon-traveler/route';
import type { RoutePoint, RouteStatus } from '@silicon-traveler/route';
import {
  MariaDBPhotoRepository,
  PublishPhotoUseCase,
  SyncPublishedPhotoFromRoutePointUseCase,
} from '@silicon-traveler/photo';
import { LocalStorageAdapter } from '@silicon-traveler/storage';
import { SharpAdapter } from '@silicon-traveler/image';
import {
  parseOffsetInt,
  parsePoint,
  parsePositiveInt,
  parseRoutePointOrder,
  parseStatusesParam,
} from './admin.utils';
import { DeleteAdminRoutePointUseCase } from '../application/admin/delete-admin-route-point.use-case';
import { deriveThumbnailPath } from '../application/admin/photo-prepared.factory';
import { UpdateAdminRoutePointUseCase } from '../application/admin/update-admin-route-point.use-case';

export const adminRouter: Router = Router();

const JOURNEY_ID = 1;

const routeRepository = new MariaDBRouteRepository();
const photoRepository = new MariaDBPhotoRepository(pool);

const listRoutePointsUseCase = new ListRoutePointsUseCase(routeRepository);
const createFutureRoutePointUseCase = new CreateFutureRoutePointUseCase(routeRepository);
const updateRoutePointAdminUseCase = new UpdateRoutePointAdminUseCase(routeRepository);
const deleteRoutePointAdminUseCase = new DeleteRoutePointAdminUseCase(routeRepository);
const geocodePlaceUseCase = new GeocodePlaceUseCase(new NominatimAdapter());
const publishPhotoUseCase = new PublishPhotoUseCase(photoRepository, routeRepository);
const syncPublishedPhotoFromRoutePointUseCase = new SyncPublishedPhotoFromRoutePointUseCase(photoRepository);

const storage = new LocalStorageAdapter();
const thumbnailGenerator = new SharpAdapter();
const updateAdminRoutePointUseCase = new UpdateAdminRoutePointUseCase(
  routeRepository,
  photoRepository,
  updateRoutePointAdminUseCase,
  publishPhotoUseCase,
  syncPublishedPhotoFromRoutePointUseCase
);
const deleteAdminRoutePointUseCase = new DeleteAdminRoutePointUseCase(
  routeRepository,
  deleteRoutePointAdminUseCase,
  storage
);

adminRouter.get('/route-points', async (req: Request, res: Response) => {
  try {
    const statusesResult = parseStatusesParam(req.query.statuses ?? req.query.status);
    if ('error' in statusesResult) {
      return res.status(400).json({ error: statusesResult.error });
    }

    const limitResult = parsePositiveInt(req.query.limit, 100, { min: 1, max: 500 });
    if ('error' in limitResult) {
      return res.status(400).json({ error: `limit: ${limitResult.error}` });
    }

    const offsetResult = parseOffsetInt(req.query.offset, 0);
    if ('error' in offsetResult) {
      return res.status(400).json({ error: `offset: ${offsetResult.error}` });
    }

    const orderResult = parseRoutePointOrder(req.query.order);
    if ('error' in orderResult) {
      return res.status(400).json({ error: orderResult.error });
    }

    const cityQuery = normalizeQueryString(req.query.city);

    const result = await listRoutePointsUseCase.execute({
      journeyId: JOURNEY_ID,
      statuses: statusesResult.value,
      cityQuery,
      order: orderResult.value,
      limit: limitResult.value,
      offset: offsetResult.value,
    });

    return res.json({
      route_points: result.routePoints.map((rp: RoutePoint) => ({
        id: rp.id,
        journey_id: rp.journeyId,
        sequence: rp.sequence,
        place_name: rp.placeName,
        country: rp.country,
        region: rp.region,
        coordinates: rp.coordinates,
        status: rp.status,
        image_prompt: rp.imagePrompt,
        narrative_prompt: rp.narrativePrompt,
        image_path: rp.imagePath,
        thumbnail_path: rp.thumbnailPath,
        error_message: rp.errorMessage,
        created_at: rp.createdAt,
        updated_at: rp.updatedAt,
        published_at: rp.publishedAt,
      })),
      pagination: {
        limit: result.limit,
        offset: result.offset,
        total: result.total,
      },
    });
  } catch (error) {
    console.error('Error listing route points (admin):', error);
    return res.status(500).json({ error: 'Failed to list route points' });
  }
});

adminRouter.get('/geocode', async (req: Request, res: Response) => {
  try {
    const placeName = normalizeQueryString(req.query.place_name ?? req.query.city);
    if (!placeName) {
      return res.status(400).json({ error: 'place_name is required' });
    }

    const country = normalizeQueryString(req.query.country);
    const region = normalizeQueryString(req.query.region);
    const query = [placeName, region, country].filter(Boolean).join(', ');

    const result = await geocodePlaceUseCase.execute(query);
    if (!result) {
      return res.status(404).json({ error: 'Location not found' });
    }

    return res.json({
      query,
      coordinates: result.coordinates,
      place_name: result.placeName,
      country: result.country,
      region: result.region,
      display_name: result.displayName,
    });
  } catch (error) {
    console.error('Error geocoding admin place:', error);
    return res.status(500).json({ error: 'Failed to geocode place' });
  }
});

adminRouter.get('/route-points/:id', async (req: Request, res: Response) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid route point ID' });
    }

    const routePoint = await routeRepository.findById(id);
    if (!routePoint) {
      return res.status(404).json({ error: 'Route point not found' });
    }

    const translations = await routeRepository.findContentTranslations(id);

    return res.json({
      id: routePoint.id,
      journey_id: routePoint.journeyId,
      sequence: routePoint.sequence,
      place_name: routePoint.placeName,
      country: routePoint.country,
      region: routePoint.region,
      coordinates: routePoint.coordinates,
      status: routePoint.status,
      image_prompt: routePoint.imagePrompt,
      narrative_prompt: routePoint.narrativePrompt,
      image_path: routePoint.imagePath,
      thumbnail_path: routePoint.thumbnailPath,
      error_message: routePoint.errorMessage,
      created_at: routePoint.createdAt,
      updated_at: routePoint.updatedAt,
      published_at: routePoint.publishedAt,
      translations,
    });
  } catch (error) {
    console.error('Error fetching route point (admin):', error);
    return res.status(500).json({ error: 'Failed to fetch route point' });
  }
});

adminRouter.post('/route-points', async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;

    const coordinatesResult = parsePoint(body.coordinates);
    if ('error' in coordinatesResult) {
      return res.status(400).json({ error: coordinatesResult.error });
    }

    const status = body.status ? String(body.status) : undefined;
    if (status && !isRouteStatus(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const created = await createFutureRoutePointUseCase.execute({
      journeyId: JOURNEY_ID,
      coordinates: coordinatesResult.value,
      placeName: body.place_name !== undefined ? (body.place_name as string | null) : undefined,
      country: body.country !== undefined ? (body.country as string | null) : undefined,
      region: body.region !== undefined ? (body.region as string | null) : undefined,
      status: status as RouteStatus | undefined,
    });

    return res.status(201).json({
      id: Number(created.id),
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to create route point';
    console.error('Error creating route point (admin):', error);
    return res.status(500).json({ error: message });
  }
});

adminRouter.put('/route-points/:id', async (req: Request, res: Response) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid route point ID' });
    }

    const body = (req.body ?? {}) as Record<string, unknown>;

    let coordinatesValue: { lat: number; lng: number } | undefined;
    if (body.coordinates !== undefined) {
      const coordinatesResult = parsePoint(body.coordinates);
      if ('error' in coordinatesResult) {
        return res.status(400).json({ error: coordinatesResult.error });
      }
      coordinatesValue = coordinatesResult.value;
    }

    const status = body.status !== undefined ? String(body.status) : undefined;
    if (status !== undefined && !isRouteStatus(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const rawTranslations = body.translations;
    const translations = Array.isArray(rawTranslations)
      ? rawTranslations
          .map((translation) =>
            translation && typeof translation === 'object'
              ? (translation as Record<string, unknown>)
              : null
          )
          .filter(Boolean)
          .map((translation) => ({
            language: String(translation!.language),
            imagePrompt:
              translation!.imagePrompt === null || translation!.imagePrompt === undefined
                ? null
                : String(translation!.imagePrompt),
            narrative:
              translation!.narrative === null || translation!.narrative === undefined
                ? null
                : String(translation!.narrative),
          }))
      : undefined;

    const updated = await updateAdminRoutePointUseCase.execute({
      id,
      placeName: body.place_name as string | null | undefined,
      country: body.country as string | null | undefined,
      region: body.region as string | null | undefined,
      coordinates: coordinatesValue,
      imagePrompt: body.image_prompt as string | null | undefined,
      narrativePrompt: body.narrative_prompt as string | null | undefined,
      imagePath: body.image_path as string | null | undefined,
      thumbnailPath: body.thumbnail_path as string | null | undefined,
      status: status as RouteStatus | undefined,
      errorMessage: body.error_message as string | null | undefined,
      translations,
    });

    return res.json({
      id: Number(updated.id),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update route point';
    const status =
      message.includes('not found')
        ? 404
        : message.includes('image_ready') || message.includes('image assets')
          ? 400
          : 500;
    console.error('Error updating route point (admin):', error);
    return res.status(status).json({ error: message });
  }
});

adminRouter.delete('/route-points/:id', async (req: Request, res: Response) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid route point ID' });
    }

    await deleteAdminRoutePointUseCase.execute(id);
    return res.status(204).send();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete route point';
    const status = message.includes('not found') ? 404 : 500;
    console.error('Error deleting route point (admin):', error);
    return res.status(status).json({ error: message });
  }
});

// Upload/replace the route point photo.
// Body: raw JPEG bytes (Content-Type: image/jpeg)
adminRouter.put(
  '/route-points/:id/photo',
  express.raw({ type: ['image/jpeg'], limit: '15mb' }),
  async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'Invalid route point ID' });
      }

      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ error: 'JPEG body is required' });
      }

      const routePoint = await routeRepository.findById(id);
      if (!routePoint) {
        return res.status(404).json({ error: 'Route point not found' });
      }

      // Best-effort delete previous files (ignore missing).
      await deletePreviousImages(routePoint.imagePath, routePoint.thumbnailPath);

      const thumbnails = await thumbnailGenerator.generate(req.body, [
        { width: 400, height: 400, suffix: '_grid' },
        { width: 1024, height: 1024, suffix: '_hero' },
      ]);

      const filename = `${id}.jpg`;
      const storageDate = await resolveStorageDate(routePoint.journeyId, routePoint.sequence);
      const savedImage = await storage.saveImage(req.body, filename, storageDate);

      const savedThumbnails = new Map<string, string>();
      for (const [suffix, buffer] of thumbnails) {
        const saved = await storage.saveThumbnail(buffer, filename, suffix, storageDate);
        savedThumbnails.set(suffix, saved.url);
      }

      routePoint.imagePath = savedImage.url;
      routePoint.thumbnailPath = savedThumbnails.get('_grid') ?? null;
      routePoint.status = 'image_ready';
      routePoint.errorMessage = null;
      routePoint.updatedAt = new Date();
      await routeRepository.update(routePoint);

      return res.json({
        image_path: savedImage.url,
        thumbnail_path: savedThumbnails.get('_grid') ?? null,
        hero_thumbnail_path: savedThumbnails.get('_hero') ?? null,
      });
    } catch (error) {
      console.error('Error uploading route point photo (admin):', error);
      return res.status(500).json({ error: 'Failed to upload route point photo' });
    }
  }
);

function isRouteStatus(value: string): value is RouteStatus {
  return (
    value === 'pending' ||
    value === 'researched' ||
    value === 'content_generated' ||
    value === 'image_ready' ||
    value === 'published' ||
    value === 'failed'
  );
}

async function deletePreviousImages(imagePath: string | null, thumbnailPath: string | null): Promise<void> {
  const deletions: Promise<void>[] = [];

  const normalizeRelative = (urlOrPath: string): string => {
    if (urlOrPath.startsWith('/images/')) return urlOrPath.slice('/images/'.length);
    if (urlOrPath.startsWith('images/')) return urlOrPath.slice('images/'.length);
    return urlOrPath.replace(/^\//, '');
  };

  if (imagePath) {
    deletions.push(storage.deleteImage(normalizeRelative(imagePath)));
    const hero = deriveThumbnailPath(normalizeRelative(imagePath), '_hero');
    deletions.push(storage.deleteImage(hero));
  }

  if (thumbnailPath) {
    deletions.push(storage.deleteImage(normalizeRelative(thumbnailPath)));
  }

  await Promise.allSettled(deletions);
}

async function resolveStorageDate(journeyId: number, sequence: number): Promise<Date> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstScheduled = await routeRepository.findFirstScheduledByJourney(journeyId);
  if (!firstScheduled) {
    return today;
  }

  const offsetDays = Math.max(sequence - firstScheduled.sequence, 0);
  const scheduledDate = new Date(today);
  scheduledDate.setDate(scheduledDate.getDate() + offsetDays);
  return scheduledDate;
}

function normalizeQueryString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}
