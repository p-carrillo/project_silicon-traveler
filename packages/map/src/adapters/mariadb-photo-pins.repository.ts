import { pool } from '@silicon-traveler/shared';
import { PhotoPin } from '../domain/photo-pin.entity';
import { IPhotoPinsRepository, PhotoPinsQuery } from '../ports/photo-pins.repository.port';

export class MariaDBPhotoPinsRepository implements IPhotoPinsRepository {
  async findByBoundingBox(query: PhotoPinsQuery): Promise<PhotoPin[]> {
    const bboxWkt = `POLYGON((${query.bbox.minLng} ${query.bbox.minLat}, ${query.bbox.maxLng} ${query.bbox.minLat}, ${query.bbox.maxLng} ${query.bbox.maxLat}, ${query.bbox.minLng} ${query.bbox.maxLat}, ${query.bbox.minLng} ${query.bbox.minLat}))`;

    const filters: string[] = [
      'MBRContains(ST_GeomFromText(?, 4326), coordinates)',
    ];
    const params: any[] = [bboxWkt];

    if (query.query) {
      const term = `%${query.query.toLowerCase()}%`;
      filters.push(
        `(
          LOWER(title) LIKE ? OR
          LOWER(narrative) LIKE ? OR
          LOWER(location) LIKE ? OR
          LOWER(COALESCE(tags, '')) LIKE ?
        )`
      );
      params.push(term, term, term, term);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const rows = await pool.query<any[]>(
      `SELECT
        id,
        title,
        location,
        narrative,
        ST_X(coordinates) as longitude,
        ST_Y(coordinates) as latitude,
        thumbnail_path,
        published_at
      FROM photos
      ${whereClause}
      ORDER BY published_at DESC
      LIMIT ?`,
      [...params, query.limit]
    );

    return rows.map((row) => ({
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
