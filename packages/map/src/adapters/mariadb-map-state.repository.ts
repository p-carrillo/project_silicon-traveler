import { pool } from '@silicon-traveler/shared';
import { MapState } from '../domain/map-state.entity';
import { DEFAULT_BOUNDING_BOX } from '../domain/bounding-box';
import { IMapStateRepository, SaveMapStateInput } from '../ports/map-state.repository.port';

export class MariaDBMapStateRepository implements IMapStateRepository {
  async get(): Promise<MapState | null> {
    const rows = await pool.query<any[]>(
      `SELECT id, min_lng, min_lat, max_lng, max_lat, zoom, last_photo_id, updated_at
       FROM map_state
       WHERE id = 1
       LIMIT 1`
    );

    if (rows.length === 0) {
      return null;
    }

    return this.toDomain(rows[0]);
  }

  async save(input: SaveMapStateInput): Promise<MapState> {
    await pool.query(
      `INSERT INTO map_state (
        id, min_lng, min_lat, max_lng, max_lat, zoom, last_photo_id, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, COALESCE((SELECT last_photo_id FROM map_state WHERE id = 1), NULL), NOW())
      ON DUPLICATE KEY UPDATE
        min_lng = VALUES(min_lng),
        min_lat = VALUES(min_lat),
        max_lng = VALUES(max_lng),
        max_lat = VALUES(max_lat),
        zoom = VALUES(zoom),
        updated_at = NOW()`,
      [
        input.bbox.minLng,
        input.bbox.minLat,
        input.bbox.maxLng,
        input.bbox.maxLat,
        input.zoom,
      ]
    );

    return (
      (await this.get()) ||
      new MapState(1, DEFAULT_BOUNDING_BOX, input.zoom, null, new Date())
    );
  }

  async touchLastPhoto(photoId: number): Promise<MapState> {
    await pool.query(
      `INSERT INTO map_state (id, min_lng, min_lat, max_lng, max_lat, zoom, last_photo_id, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
        last_photo_id = VALUES(last_photo_id),
        updated_at = NOW()`,
      [
        DEFAULT_BOUNDING_BOX.minLng,
        DEFAULT_BOUNDING_BOX.minLat,
        DEFAULT_BOUNDING_BOX.maxLng,
        DEFAULT_BOUNDING_BOX.maxLat,
        1.2,
        photoId,
      ]
    );

    const state = await this.get();
    if (!state) {
      return new MapState(1, DEFAULT_BOUNDING_BOX, 1.2, photoId, new Date());
    }

    return state;
  }

  private toDomain(row: any): MapState {
    return new MapState(
      row.id,
      {
        minLng: Number(row.min_lng),
        minLat: Number(row.min_lat),
        maxLng: Number(row.max_lng),
        maxLat: Number(row.max_lat),
      },
      Number(row.zoom),
      row.last_photo_id ? Number(row.last_photo_id) : null,
      new Date(row.updated_at)
    );
  }
}
