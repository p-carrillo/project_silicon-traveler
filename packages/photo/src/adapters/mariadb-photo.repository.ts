import type { Pool } from 'mariadb';
import { pointToWKT, wktToPoint } from '@silicon-traveler/shared';
import {
  IPhotoRepository,
  Photo,
  CreatePhotoInput,
  SyncPublishedPhotoFromRoutePointInput,
} from '../domain/photo.repository';

export class MariaDBPhotoRepository implements IPhotoRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: CreatePhotoInput): Promise<number> {
    const tagsValue = input.tags?.length ? input.tags.join(', ') : null;
    const metadataValue = input.metadata ? JSON.stringify(input.metadata) : null;

    const result = await this.pool.query(
      `INSERT INTO photos (
        route_point_id, title, narrative, location, coordinates,
        camera_model, lens, iso, shutter_speed,
        roll_number, frame_number, series_name, volume_issue,
        tags, metadata, image_path, thumbnail_path, published_at
      ) VALUES (?, ?, ?, ?, ST_GeomFromText(?, 4326), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.routePointId,
        input.title,
        input.narrative,
        input.location,
        pointToWKT(input.coordinates),
        input.camera,
        input.lens,
        input.iso,
        input.shutterSpeed,
        input.rollNumber,
        input.frameNumber,
        input.seriesName,
        input.volumeIssue,
        tagsValue,
        metadataValue,
        input.imageUrl,
        input.gridThumbnailUrl,
        input.publishedAt,
      ]
    );

    const photoId = Number(result.insertId ?? 0);

    if (photoId && input.translations.length) {
      const values = input.translations.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const params = input.translations.flatMap((translation) => [
        photoId,
        translation.language,
        translation.title,
        translation.narrative,
        translation.location,
      ]);

      await this.pool.query(
        `INSERT INTO photo_translations
         (photo_id, language, title, narrative, location)
         VALUES ${values}
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           narrative = VALUES(narrative),
           location = VALUES(location),
           updated_at = CURRENT_TIMESTAMP`,
        params
      );
    }

    return photoId;
  }

  async findById(id: number): Promise<Photo | null> {
    const rows = await this.pool.query<any[]>(
      `SELECT 
        p.*,
        ST_AsText(p.coordinates) as coordinates,
        rp.journey_id as journey_id
       FROM photos p
       LEFT JOIN route_points rp ON p.route_point_id = rp.id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) return null;
    return this.mapToPhoto(rows[0]);
  }

  async findByJourneyId(journeyId: number, limit = 50, offset = 0): Promise<Photo[]> {
    const rows = await this.pool.query<any[]>(
      `SELECT 
        p.*,
        ST_AsText(p.coordinates) as coordinates,
        rp.journey_id as journey_id
       FROM photos p 
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
      `SELECT 
        p.*,
        ST_AsText(p.coordinates) as coordinates,
        rp.journey_id as journey_id
       FROM photos p
       LEFT JOIN route_points rp ON p.route_point_id = rp.id
       ORDER BY p.published_at DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map((row) => this.mapToPhoto(row));
  }

  async hasByRoutePointId(routePointId: number): Promise<boolean> {
    const rows = await this.pool.query<any[]>(
      `SELECT 1
       FROM photos
       WHERE route_point_id = ?
       LIMIT 1`,
      [routePointId]
    );

    return rows.length > 0;
  }

  async deleteByRoutePointId(routePointId: number): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM photos
       WHERE route_point_id = ?`,
      [routePointId]
    );

    return Number(result.affectedRows ?? 0) > 0;
  }

  async syncPublishedPhotoFromRoutePoint(input: SyncPublishedPhotoFromRoutePointInput): Promise<void> {
    await this.pool.query(
      `UPDATE photos
       SET title = ?,
           location = ?,
           coordinates = ST_GeomFromText(?, 4326)
       WHERE route_point_id = ?`,
      [
        input.title,
        input.location,
        pointToWKT(input.coordinates),
        input.routePointId,
      ]
    );

    for (const translation of input.translations) {
      await this.pool.query(
        `UPDATE photo_translations pt
         INNER JOIN photos p ON p.id = pt.photo_id
         SET pt.title = ?,
             pt.location = ?,
             pt.updated_at = CURRENT_TIMESTAMP
         WHERE p.route_point_id = ?
           AND pt.language = ?`,
        [
          translation.title,
          translation.location,
          input.routePointId,
          translation.language,
        ]
      );
    }
  }

  private mapToPhoto(row: any): Photo {
    const journeyId = row.journey_id || 0;
    const metadata = this.parseMetadata(row.metadata);
    const tags = this.parseTags(row.tags);

    return {
      id: row.id,
      journeyId,
      routePointId: row.route_point_id,
      title: row.title || '',
      narrative: row.narrative || '',
      location: row.location || '',
      coordinates: row.coordinates ? wktToPoint(row.coordinates) : { lat: 0, lng: 0 },
      camera: row.camera_model ?? null,
      lens: row.lens ?? null,
      iso: row.iso ?? null,
      shutterSpeed: row.shutter_speed ?? null,
      rollNumber: row.roll_number ?? null,
      frameNumber: row.frame_number ?? null,
      seriesName: row.series_name ?? null,
      volumeIssue: row.volume_issue ?? null,
      tags,
      metadata,
      imageUrl: row.image_path || '',
      gridThumbnailUrl: row.thumbnail_path || '',
      heroThumbnailUrl: (metadata?.heroThumbnailUrl ?? row.thumbnail_path) || '',
      publishedAt: new Date(row.published_at),
      createdAt: new Date(row.created_at),
    };
  }

  private parseTags(raw: unknown): string[] | null {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return null;
    }

    const tags = raw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    return tags.length ? tags : null;
  }

  private parseMetadata(raw: unknown): Photo['metadata'] {
    if (!raw) return null;

    if (typeof raw === 'object') {
      return raw as Photo['metadata'];
    }

    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as Photo['metadata'];
      } catch {
        return null;
      }
    }

    return null;
  }
}
