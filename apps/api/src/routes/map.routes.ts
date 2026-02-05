import { Router, type Request, type Response } from 'express';
import {
  GetMapStateUseCase,
  SaveMapStateUseCase,
  SearchPhotoPinsByBboxUseCase,
  RefreshMapUseCase,
  MariaDBMapStateRepository,
  MariaDBPhotoPinsRepository,
} from '@silicon-traveler/map';
import { parseBboxParam, parseLimitParam, parseZoomParam } from './map.utils';
import { resolveRequestLanguage } from '../lib/language';

export const mapRouter: Router = Router();

const mapStateRepository = new MariaDBMapStateRepository();
const photoPinsRepository = new MariaDBPhotoPinsRepository();

const getMapStateUseCase = new GetMapStateUseCase(mapStateRepository);
const saveMapStateUseCase = new SaveMapStateUseCase(mapStateRepository);
const searchPinsUseCase = new SearchPhotoPinsByBboxUseCase(photoPinsRepository);
const refreshMapUseCase = new RefreshMapUseCase(mapStateRepository);

mapRouter.get('/state', async (_req: Request, res: Response) => {
  try {
    const state = await getMapStateUseCase.execute();

    return res.json({
      id: state.id,
      bbox: state.bbox,
      zoom: state.zoom,
      lastPhotoId: state.lastPhotoId,
      updatedAt: state.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching map state:', error);
    return res.status(500).json({ error: 'Failed to fetch map state' });
  }
});

mapRouter.put('/state', async (req: Request, res: Response) => {
  try {
    const bboxInput = req.body?.bbox;
    const zoomInput = req.body?.zoom;

    if (!bboxInput || typeof bboxInput !== 'object') {
      return res.status(400).json({ error: 'bbox is required' });
    }

    const bbox = {
      minLng: Number(bboxInput.minLng),
      minLat: Number(bboxInput.minLat),
      maxLng: Number(bboxInput.maxLng),
      maxLat: Number(bboxInput.maxLat),
    };

    if (Object.values(bbox).some((value) => !Number.isFinite(value))) {
      return res.status(400).json({ error: 'bbox must contain numeric values' });
    }

    const zoomResult = parseZoomParam(zoomInput);
    if (zoomResult.error) {
      return res.status(400).json({ error: zoomResult.error });
    }

    if (zoomResult.value === null) {
      return res.status(400).json({ error: 'zoom is required' });
    }

    const state = await saveMapStateUseCase.execute({
      bbox,
      zoom: zoomResult.value,
    });

    return res.json({
      id: state.id,
      bbox: state.bbox,
      zoom: state.zoom,
      lastPhotoId: state.lastPhotoId,
      updatedAt: state.updatedAt,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to save map state';
    const status = message.includes('Invalid') ? 400 : 500;
    console.error('Error saving map state:', error);
    return res.status(status).json({ error: message });
  }
});

mapRouter.get('/pins', async (req: Request, res: Response) => {
  try {
    const language = resolveRequestLanguage(req);
    const bboxResult = parseBboxParam(req.query.bbox);
    if (bboxResult.error || !bboxResult.value) {
      return res.status(400).json({ error: bboxResult.error || 'bbox is required' });
    }

    const limitResult = parseLimitParam(req.query.limit, 200);
    if (limitResult.error) {
      return res.status(400).json({ error: limitResult.error });
    }

    const query = typeof req.query.q === 'string' ? req.query.q : undefined;

    const pins = await searchPinsUseCase.execute({
      bbox: bboxResult.value,
      limit: limitResult.value,
      query,
      language,
    });

    return res.json({
      pins: pins.map((pin) => ({
        id: pin.id,
        title: pin.title,
        location: pin.location,
        narrative: pin.narrative,
        coordinates: {
          x: pin.coordinates.lng,
          y: pin.coordinates.lat,
        },
        thumbnail_path: pin.thumbnailPath,
        published_at: pin.publishedAt,
      })),
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch map pins';
    const status = message.includes('Invalid') ? 400 : 500;
    console.error('Error fetching map pins:', error);
    return res.status(status).json({ error: message });
  }
});

mapRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const rawPhotoId = req.body?.photo_id ?? req.body?.photoId;
    const photoId = Number(rawPhotoId);

    if (!Number.isFinite(photoId) || photoId <= 0) {
      return res.status(400).json({ error: 'photo_id must be a positive number' });
    }

    const state = await refreshMapUseCase.execute(photoId);

    return res.json({
      id: state.id,
      bbox: state.bbox,
      zoom: state.zoom,
      lastPhotoId: state.lastPhotoId,
      updatedAt: state.updatedAt,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to refresh map state';
    const status = message.includes('Invalid') ? 400 : 500;
    console.error('Error refreshing map state:', error);
    return res.status(status).json({ error: message });
  }
});
