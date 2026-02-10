import { pool, Point, pointToWKT } from '@silicon-traveler/shared';
import {
  FindRoutePointsByJourneyParams,
  IRouteRepository,
  RoutePointContentTranslation,
  RoutePointCreateParams,
} from '../ports/route-repository.port';
import { RoutePoint, RouteStatus } from '../domain/route-point.entity';

export class MariaDBRouteRepository implements IRouteRepository {
  async create(routePoint: RoutePointCreateParams): Promise<RoutePoint> {
    const conn = await pool.getConnection();
    try {
      const result = await conn.query(
        `INSERT INTO route_points (
          journey_id, sequence, place_name, coordinates, country, region,
          is_ferry_crossing, distance_from_previous, osm_data, research_summary,
          image_prompt, narrative_prompt, camera_metadata, status, error_message,
          image_path, thumbnail_path, published_at
        ) VALUES (?, ?, ?, ST_GeomFromText(?, 4326), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          routePoint.journeyId,
          routePoint.sequence,
          routePoint.placeName,
          pointToWKT(routePoint.coordinates),
          routePoint.country,
          routePoint.region,
          routePoint.isFferryCrossing,
          routePoint.distanceFromPrevious,
          routePoint.osmData ? JSON.stringify(routePoint.osmData) : null,
          routePoint.researchSummary,
          routePoint.imagePrompt,
          routePoint.narrativePrompt,
          routePoint.cameraMetadata ? JSON.stringify(routePoint.cameraMetadata) : null,
          routePoint.status,
          routePoint.errorMessage,
          routePoint.imagePath,
          routePoint.thumbnailPath,
          routePoint.publishedAt,
        ]
      );

      return new RoutePoint(
        result.insertId,
        routePoint.journeyId,
        routePoint.sequence,
        routePoint.placeName,
        routePoint.coordinates,
        routePoint.country,
        routePoint.region,
        routePoint.isFferryCrossing,
        routePoint.distanceFromPrevious,
        routePoint.osmData,
        routePoint.researchSummary,
        routePoint.imagePrompt,
        routePoint.narrativePrompt,
        routePoint.cameraMetadata,
        routePoint.status,
        routePoint.errorMessage,
        routePoint.imagePath,
        routePoint.thumbnailPath,
        new Date(),
        routePoint.publishedAt,
        new Date()
      );
    } finally {
      conn.release();
    }
  }

  async findById(id: number): Promise<RoutePoint | null> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT id, journey_id, sequence, place_name,
                ST_AsText(coordinates) as coordinates,
                country, region, is_ferry_crossing, distance_from_previous,
                osm_data, research_summary, image_prompt, narrative_prompt,
                camera_metadata, status, error_message, image_path, thumbnail_path,
                created_at, published_at, updated_at
         FROM route_points WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) return null;
      return this.toDomain(rows[0]);
    } finally {
      conn.release();
    }
  }

  async findByStatus(status: RouteStatus, limit: number = 10): Promise<RoutePoint[]> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT id, journey_id, sequence, place_name,
                ST_AsText(coordinates) as coordinates,
                country, region, is_ferry_crossing, distance_from_previous,
                osm_data, research_summary, image_prompt, narrative_prompt,
                camera_metadata, status, error_message, image_path, thumbnail_path,
                created_at, published_at, updated_at
         FROM route_points
         WHERE status = ?
         ORDER BY sequence ASC
         LIMIT ?`,
        [status, limit]
      );

      return rows.map((row: any) => this.toDomain(row));
    } finally {
      conn.release();
    }
  }

  async findFirstScheduledByJourney(journeyId: number): Promise<RoutePoint | null> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT id, journey_id, sequence, place_name,
                ST_AsText(coordinates) as coordinates,
                country, region, is_ferry_crossing, distance_from_previous,
                osm_data, research_summary, image_prompt, narrative_prompt,
                camera_metadata, status, error_message, image_path, thumbnail_path,
                created_at, published_at, updated_at
         FROM route_points
         WHERE journey_id = ?
           AND status IN ('pending', 'researched', 'content_generated', 'image_ready')
         ORDER BY sequence ASC
         LIMIT 1`,
        [journeyId]
      );

      if (rows.length === 0) return null;
      return this.toDomain(rows[0]);
    } finally {
      conn.release();
    }
  }

  async findNextBySequence(journeyId: number): Promise<RoutePoint | null> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT id, journey_id, sequence, place_name,
                ST_AsText(coordinates) as coordinates,
                country, region, is_ferry_crossing, distance_from_previous,
                osm_data, research_summary, image_prompt, narrative_prompt,
                camera_metadata, status, error_message, image_path, thumbnail_path,
                created_at, published_at, updated_at
         FROM route_points
         WHERE journey_id = ? AND status = 'image_ready'
         ORDER BY sequence ASC
         LIMIT 1`,
        [journeyId]
      );

      if (rows.length === 0) return null;
      return this.toDomain(rows[0]);
    } finally {
      conn.release();
    }
  }

  async findByJourney(journeyId: number, params: FindRoutePointsByJourneyParams): Promise<RoutePoint[]> {
    const conn = await pool.getConnection();
    try {
      const statuses = params.statuses?.length ? params.statuses : undefined;
      const where: string[] = ['journey_id = ?'];
      const queryParams: any[] = [journeyId];

      if (statuses) {
        const placeholders = statuses.map(() => '?').join(',');
        where.push(`status IN (${placeholders})`);
        queryParams.push(...statuses);
      }

      const rows = await conn.query(
        `SELECT id, journey_id, sequence, place_name,
                ST_AsText(coordinates) as coordinates,
                country, region, is_ferry_crossing, distance_from_previous,
                osm_data, research_summary, image_prompt, narrative_prompt,
                camera_metadata, status, error_message, image_path, thumbnail_path,
                created_at, published_at, updated_at
         FROM route_points
         WHERE ${where.join(' AND ')}
         ORDER BY sequence ASC
         LIMIT ? OFFSET ?`,
        [...queryParams, params.limit, params.offset]
      );

      return rows.map((row: any) => this.toDomain(row));
    } finally {
      conn.release();
    }
  }

  async countByJourney(journeyId: number, statuses?: RouteStatus[]): Promise<number> {
    const conn = await pool.getConnection();
    try {
      const where: string[] = ['journey_id = ?'];
      const queryParams: any[] = [journeyId];

      if (statuses?.length) {
        const placeholders = statuses.map(() => '?').join(',');
        where.push(`status IN (${placeholders})`);
        queryParams.push(...statuses);
      }

      const rows = await conn.query(
        `SELECT COUNT(*) as count
         FROM route_points
         WHERE ${where.join(' AND ')}`,
        queryParams
      );

      return Number(rows[0]?.count ?? 0);
    } finally {
      conn.release();
    }
  }

  async countByStatuses(statuses: RouteStatus[]): Promise<number> {
    const conn = await pool.getConnection();
    try {
      const placeholders = statuses.map(() => '?').join(',');
      const rows = await conn.query(
        `SELECT COUNT(*) as count
         FROM route_points
         WHERE status IN (${placeholders})`,
        statuses
      );

      return Number(rows[0].count ?? 0);
    } finally {
      conn.release();
    }
  }

  async upsertContentTranslations(
    routePointId: number,
    translations: RoutePointContentTranslation[]
  ): Promise<void> {
    if (!translations.length) return;

    const conn = await pool.getConnection();
    try {
      const values = translations.map(() => '(?, ?, ?, ?)').join(', ');
      const params = translations.flatMap((translation) => [
        routePointId,
        translation.language,
        translation.imagePrompt,
        translation.narrative,
      ]);

      await conn.query(
        `INSERT INTO route_point_translations
         (route_point_id, language, image_prompt, narrative)
         VALUES ${values}
         ON DUPLICATE KEY UPDATE
           image_prompt = VALUES(image_prompt),
           narrative = VALUES(narrative),
           updated_at = CURRENT_TIMESTAMP`,
        params
      );
    } finally {
      conn.release();
    }
  }

  async findContentTranslations(routePointId: number): Promise<RoutePointContentTranslation[]> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT language, image_prompt, narrative
         FROM route_point_translations
         WHERE route_point_id = ?`,
        [routePointId]
      );

      return rows.map((row: any) => ({
        language: row.language,
        imagePrompt: row.image_prompt ?? null,
        narrative: row.narrative ?? null,
      }));
    } finally {
      conn.release();
    }
  }

  async update(routePoint: RoutePoint): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `UPDATE route_points
         SET place_name = ?, coordinates = ST_GeomFromText(?, 4326), country = ?, region = ?,
             osm_data = ?, research_summary = ?,
             image_prompt = ?, narrative_prompt = ?, camera_metadata = ?,
             status = ?, error_message = ?,
             image_path = ?, thumbnail_path = ?,
             published_at = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          routePoint.placeName,
          pointToWKT(routePoint.coordinates),
          routePoint.country,
          routePoint.region,
          this.safeStringify(routePoint.osmData),
          routePoint.researchSummary,
          routePoint.imagePrompt,
          routePoint.narrativePrompt,
          this.safeStringify(routePoint.cameraMetadata),
          routePoint.status,
          routePoint.errorMessage,
          routePoint.imagePath,
          routePoint.thumbnailPath,
          routePoint.publishedAt,
          routePoint.id,
        ]
      );
    } finally {
      conn.release();
    }
  }

  async getLastSequence(journeyId: number): Promise<number> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT MAX(sequence) as max_seq FROM route_points WHERE journey_id = ?`,
        [journeyId]
      );

      return rows[0].max_seq || 0;
    } finally {
      conn.release();
    }
  }

  private toDomain(row: any): RoutePoint {
    return new RoutePoint(
      row.id,
      row.journey_id,
      row.sequence,
      row.place_name,
      this.parsePoint(row.coordinates),
      row.country,
      row.region,
      Boolean(row.is_ferry_crossing),
      row.distance_from_previous ? parseFloat(row.distance_from_previous) : null,
      row.osm_data ? this.safeJsonParse(row.osm_data) : null,
      row.research_summary,
      row.image_prompt,
      row.narrative_prompt,
      row.camera_metadata ? this.safeJsonParse(row.camera_metadata) : null,
      row.status as RouteStatus,
      row.error_message,
      row.image_path,
      row.thumbnail_path,
      new Date(row.created_at),
      row.published_at ? new Date(row.published_at) : null,
      new Date(row.updated_at)
    );
  }

  private parsePoint(wkt: string): Point {
    const match = wkt.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (!match) throw new Error(`Invalid WKT: ${wkt}`);
    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
  }

  private safeJsonParse(data: string | object): any {
    if (typeof data !== 'string') {
      return data;
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn(`Failed to parse JSON: ${data}`);
      return null;
    }
  }

  private safeStringify(data: any): string | null {
    if (!data) return null;
    if (typeof data === 'string') return data; // Already a string
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.warn(`Failed to stringify data: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}
