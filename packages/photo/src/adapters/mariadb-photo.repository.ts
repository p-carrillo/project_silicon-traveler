import type { Pool } from 'mariadb';
import { IPhotoRepository, Photo, CreatePhotoInput } from '../domain/photo.repository';

export class MariaDBPhotoRepository implements IPhotoRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: CreatePhotoInput): Promise<number> {
    const result = await this.pool.query(
      `INSERT INTO photos (
        journey_id, route_point_id, image_url, grid_thumbnail_url, hero_thumbnail_url,
        narrative, camera, lens, iso, shutter_speed, aperture, revised_prompt, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.journeyId,
        input.routePointId,
        input.imageUrl,
        input.gridThumbnailUrl,
        input.heroThumbnailUrl,
        input.narrative,
        input.camera,
        input.lens,
        input.iso,
        input.shutterSpeed,
        input.aperture,
        input.revisedPrompt,
        input.publishedAt,
      ]
    );

    return result.insertId;
  }

  async findById(id: number): Promise<Photo | null> {
    const rows = await this.pool.query<any[]>(
      'SELECT * FROM photos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;
    return this.mapToPhoto(rows[0]);
  }

  async findByJourneyId(journeyId: number, limit = 50, offset = 0): Promise<Photo[]> {
    const rows = await this.pool.query<any[]>(
      `SELECT p.* FROM photos p 
       INNER JOIN route_points rp ON p.route_point_id = rp.id 
       WHERE rp.journey_id = ? 
       ORDER BY p.published_at DESC 
       LIMIT ? OFFSET ?`,
      [journeyId, limit, offset]
    );

    return rows.map((row) => this.mapToPhoto(row));
  }

  async findLatest(limit = 10): Promise<Photo[]> {
    const rows = await this.pool.query<any[]>(
      'SELECT * FROM photos ORDER BY published_at DESC LIMIT ?',
      [limit]
    );

    return rows.map((row) => this.mapToPhoto(row));
  }

  private mapToPhoto(row: any): Photo {
    // Get journey_id from route_point if exists, otherwise use null
    const journeyId = row.journey_id || 0;
    
    return {
      id: row.id,
      journeyId,
      routePointId: row.route_point_id,
      imageUrl: row.image_path || '',
      gridThumbnailUrl: row.thumbnail_path || '',
      heroThumbnailUrl: row.thumbnail_path || '',
      narrative: row.narrative || '',
      camera: row.camera_model || '',
      lens: row.lens || '',
      iso: row.iso || 0,
      shutterSpeed: row.shutter_speed || '',
      aperture: '', // Not in schema
      revisedPrompt: null,
      publishedAt: new Date(row.published_at),
      createdAt: new Date(row.created_at),
    };
  }
}
