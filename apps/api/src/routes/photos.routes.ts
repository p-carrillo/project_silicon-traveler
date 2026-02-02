import { Router, type Request, type Response } from 'express';
import { pool } from '@silicon-traveler/shared';

export const photosRouter: Router = Router();

// GET /api/photos/latest - Get the most recent published photo
photosRouter.get('/latest', async (_req: Request, res: Response) => {
  try {
    const rows = await pool.query<any[]>(
      `SELECT 
        id, route_point_id, title, narrative, location,
        ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude,
        camera_model, lens, iso, shutter_speed,
        roll_number, frame_number, series_name, volume_issue,
        image_path, thumbnail_path, published_at, created_at
      FROM photos 
      ORDER BY published_at DESC 
      LIMIT 1`
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No published photos found' });
    }

    // Transform for web app format
    const photo = {
      ...rows[0],
      coordinates: {
        x: rows[0].longitude,
        y: rows[0].latitude
      }
    };
    delete photo.longitude;
    delete photo.latitude;

    return res.json(photo);
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

    // Get total count
    const countResult = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM photos`
    );
    const totalCount = Number(countResult[0].total);

    const rows = await pool.query<any[]>(
      `SELECT 
        id, route_point_id, title, narrative, location,
        ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude,
        camera_model, lens, iso, shutter_speed,
        roll_number, frame_number, series_name, volume_issue,
        image_path, thumbnail_path, published_at, created_at
      FROM photos 
      ORDER BY published_at DESC 
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const photos = rows.map((row) => {
      const photo = {
        ...row,
        coordinates: {
          x: row.longitude,
          y: row.latitude,
        },
      };
      delete photo.longitude;
      delete photo.latitude;
      return photo;
    });

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
        image_path, thumbnail_path, published_at, created_at
      FROM photos 
      WHERE id = ?
      LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const photo = {
      ...rows[0],
      coordinates: {
        x: rows[0].longitude,
        y: rows[0].latitude,
      },
    };
    delete photo.longitude;
    delete photo.latitude;

    return res.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return res.status(500).json({ error: 'Failed to fetch photo' });
  }
});
