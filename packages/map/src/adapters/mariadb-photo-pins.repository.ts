import { pool } from '@silicon-traveler/shared';
import { PhotoPin } from '../domain/photo-pin.entity';
import { IPhotoPinsRepository, PhotoPinsQuery } from '../ports/photo-pins.repository.port';

export class MariaDBPhotoPinsRepository implements IPhotoPinsRepository {
  async findByBoundingBox(query: PhotoPinsQuery): Promise<PhotoPin[]> {
    type PhotoPinRow = {
      id: number;
      title: string;
      location: string;
      narrative: string | null;
      longitude: number | string;
      latitude: number | string;
      thumbnail_path: string;
      published_at: string | Date;
    };

    const bboxWkt = `POLYGON((${query.bbox.minLng} ${query.bbox.minLat}, ${query.bbox.maxLng} ${query.bbox.minLat}, ${query.bbox.maxLng} ${query.bbox.maxLat}, ${query.bbox.minLng} ${query.bbox.maxLat}, ${query.bbox.minLng} ${query.bbox.minLat}))`;
    const language = query.language ?? null;

    const filters: string[] = [
      'MBRContains(ST_GeomFromText(?, 4326), p.coordinates)',
    ];
    const params: any[] = [language, bboxWkt];

    if (query.query) {
      const term = `%${query.query.toLowerCase()}%`;
      filters.push(
        `(
          LOWER(COALESCE(pt.title, p.title)) LIKE ? OR
          LOWER(COALESCE(pt.narrative, p.narrative)) LIKE ? OR
          LOWER(COALESCE(pt.location, p.location)) LIKE ? OR
          LOWER(COALESCE(p.tags, '')) LIKE ?
        )`
      );
      params.push(term, term, term, term);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const rows = await pool.query<PhotoPinRow[]>(
      `SELECT
        p.id,
        COALESCE(pt.title, p.title) as title,
        COALESCE(pt.location, p.location) as location,
        COALESCE(pt.narrative, p.narrative) as narrative,
        ST_X(p.coordinates) as longitude,
        ST_Y(p.coordinates) as latitude,
        p.thumbnail_path,
        p.published_at
      FROM photos p
      LEFT JOIN photo_translations pt
        ON pt.photo_id = p.id AND pt.language = ?
      ${whereClause}
      ORDER BY p.published_at DESC
      LIMIT ?`,
      [...params, query.limit]
    );

    return rows.map((row: PhotoPinRow) => ({
      id: row.id,
      title: row.title,
      location: row.location,
      narrative: row.narrative || '',
      coordinates: {
        lng: Number(row.longitude),
        lat: Number(row.latitude),
      },
      thumbnailPath: row.thumbnail_path,
      publishedAt: new Date(row.published_at),
    }));
  }
}
