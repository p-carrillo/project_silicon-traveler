import { Router, type Request, type Response } from 'express';
import { MariaDBJourneyRepository } from '@silicon-traveler/journey';
import { MariaDBRouteRepository } from '@silicon-traveler/route';
import { pool } from '@silicon-traveler/shared';

export const journeyRouter: Router = Router();

const journeyRepo = new MariaDBJourneyRepository();
const routeRepo = new MariaDBRouteRepository();

// GET /api/journey/stats - Get journey statistics
journeyRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const journey = await journeyRepo.findById(1);
    
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Get route point counts by status
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM route_points
      WHERE journey_id = ?
      GROUP BY status
    `;
    const statusRows = await pool.query(statusQuery, [journey.id]);
    
    // Convert BigInt counts to Numbers for JSON serialization
    const statusData = (statusRows as any[]).map((row: any) => ({
      status: row.status,
      count: Number(row.count),
    }));

    // Calculate total distance
    const totalQuery = `
      SELECT SUM(distance_from_previous) as total_distance
      FROM route_points
      WHERE journey_id = ?
    `;
    const totalRows = await pool.query(totalQuery, [journey.id]);
    const totalDistance = Number((totalRows as any)[0]?.total_distance || 0);

    // Get published photos count
    const photosQuery = `
      SELECT COUNT(*) as count
      FROM photos
      WHERE route_point_id IN (
        SELECT id FROM route_points WHERE journey_id = ?
      )
    `;
    const photosRows = await pool.query(photosQuery, [journey.id]);
    const photosCount = Number((photosRows as any)[0]?.count || 0);

    return res.json({
      journey: {
        id: journey.id,
        name: journey.name,
        started_at: journey.startedAt,
        updated_at: journey.updatedAt,
      },
      stats: {
        total_distance_km: parseFloat((Number(totalDistance)).toFixed(2)),
        route_points: statusData,
        photos_published: photosCount,
      },
    });
  } catch (error) {
    console.error('Error fetching journey stats:', error);
    return res.status(500).json({ error: 'Failed to fetch journey statistics' });
  }
});

// GET /api/journey/route - Get all route points with optional filters
journeyRouter.get('/route', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    if (limit < 1 || limit > 500) {
      return res.status(400).json({ error: 'Limit must be between 1 and 500' });
    }

    let query = `
      SELECT 
        id,
        journey_id,
        sequence,
        ST_X(coordinates) as longitude,
        ST_Y(coordinates) as latitude,
        distance_from_previous as distance_km,
        place_name as city_name,
        country as country_name,
        travel_mode as travel_mode,
        status,
        created_at,
        updated_at
      FROM route_points
      WHERE journey_id = 1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY sequence ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await pool.query(query, params);

    return res.json({
      route_points: rows,
      pagination: {
        limit,
        offset,
        count: (rows as any[]).length,
      },
    });
  } catch (error) {
    console.error('Error fetching route points:', error);
    return res.status(500).json({ error: 'Failed to fetch route points' });
  }
});

// GET /api/journey/route/:id - Get specific route point by ID
journeyRouter.get('/route/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid route point ID' });
    }

    const routePoint = await routeRepo.findById(id);
    
    if (!routePoint) {
      return res.status(404).json({ error: 'Route point not found' });
    }

    return res.json({
      id: routePoint.id,
      journeyId: routePoint.journeyId,
      sequence: routePoint.sequence,
      placeName: routePoint.placeName,
      coordinates: routePoint.coordinates,
      country: routePoint.country,
      region: routePoint.region,
      isFferryCrossing: routePoint.isFferryCrossing,
      travelMode: routePoint.travelMode,
      travel_mode: routePoint.travelMode,
      distanceFromPrevious: routePoint.distanceFromPrevious,
      osmData: routePoint.osmData,
      researchSummary: routePoint.researchSummary,
      imagePrompt: routePoint.imagePrompt,
      narrativePrompt: routePoint.narrativePrompt,
      cameraMetadata: routePoint.cameraMetadata,
      status: routePoint.status,
      errorMessage: routePoint.errorMessage,
      imagePath: routePoint.imagePath,
      thumbnailPath: routePoint.thumbnailPath,
      createdAt: routePoint.createdAt,
      publishedAt: routePoint.publishedAt,
      updatedAt: routePoint.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching route point:', error);
    return res.status(500).json({ error: 'Failed to fetch route point' });
  }
});
