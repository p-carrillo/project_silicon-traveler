import { Router, type Request, type Response } from 'express';
import { pool } from '@silicon-traveler/shared';
import { buildPhotoSearchFilter, parseDateParam } from './photos.search';

export const photosRouter: Router = Router();

const parseTags = (raw: unknown): string[] => {
  if (typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

const parseMetadata = (raw: unknown): Record<string, unknown> | null => {
  if (!raw) return null;
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
};

const buildPhotoResponse = (row: any) => {
  const photo = {
    ...row,
    tags: parseTags(row.tags),
    metadata: parseMetadata(row.metadata),
    coordinates: {
      x: row.longitude,
      y: row.latitude,
    },
  };
  delete photo.longitude;
  delete photo.latitude;
  return photo;
};

// GET /api/photos/latest - Get the most recent published photo
photosRouter.get('/latest', async (_req: Request, res: Response) => {
  try {
    const rows = await pool.query<any[]>(
      `SELECT 
        id, route_point_id, title, narrative, location,
        ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude,
        camera_model, lens, iso, shutter_speed,
        roll_number, frame_number, series_name, volume_issue,
        tags, metadata,
        image_path, thumbnail_path, published_at, created_at
      FROM photos 
      ORDER BY published_at DESC 
      LIMIT 1`
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No published photos found' });
    }

    // Transform for web app format
    return res.json(buildPhotoResponse(rows[0]));
  } catch (error) {
    console.error('Error fetching latest photo:', error);
    return res.status(500).json({ error: 'Failed to fetch latest photo' });
  }
});

// GET /api/photos - Get published photos with optional filters
photosRouter.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }
    
    if (offset < 0) {
      return res.status(400).json({ error: 'Offset must be non-negative' });
    }

    const startDateResult = parseDateParam(req.query.start_date, 'start_date');
    if (startDateResult.error) {
      return res.status(400).json({ error: startDateResult.error });
    }

    const endDateResult = parseDateParam(req.query.end_date, 'end_date');
    if (endDateResult.error) {
      return res.status(400).json({ error: endDateResult.error });
    }

    if (
      startDateResult.value &&
      endDateResult.value &&
      startDateResult.value > endDateResult.value
    ) {
      return res.status(400).json({
        error: 'start_date must be before or equal to end_date',
      });
    }

    const searchFilter = buildPhotoSearchFilter(req.query.q, {
      startDate: startDateResult.value,
      endDate: endDateResult.value,
    });

    // Get total count
    const countResult = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM photos ${searchFilter.whereClause}`,
      searchFilter.params
    );
    const totalCount = Number(countResult[0].total);

    const rows = await pool.query<any[]>(
      `SELECT 
        id, route_point_id, title, narrative, location,
        ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude,
        camera_model, lens, iso, shutter_speed,
        roll_number, frame_number, series_name, volume_issue,
        tags, metadata,
        image_path, thumbnail_path, published_at, created_at
      FROM photos 
      ${searchFilter.whereClause}
      ORDER BY published_at DESC 
      LIMIT ? OFFSET ?`,
      [...searchFilter.params, limit, offset]
    );

    const photos = rows.map(buildPhotoResponse);

    return res.json({
      photos,
      pagination: {
        limit,
        offset,
        count: totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// GET /api/photos/:id - Get specific photo by ID
photosRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    const rows = await pool.query<any[]>(
      `SELECT 
        id, route_point_id, title, narrative, location,
        ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude,
        camera_model, lens, iso, shutter_speed,
        roll_number, frame_number, series_name, volume_issue,
        tags, metadata,
        image_path, thumbnail_path, published_at, created_at
      FROM photos 
      WHERE id = ?
      LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    return res.json(buildPhotoResponse(rows[0]));
  } catch (error) {
    console.error('Error fetching photo:', error);
    return res.status(500).json({ error: 'Failed to fetch photo' });
  }
});
