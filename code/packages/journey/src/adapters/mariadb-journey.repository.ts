import { pool, Point, pointToWKT } from '@silicon-traveler/shared';
import { IJourneyRepository } from '../ports/journey-repository.port';
import { Journey } from '../domain/journey.entity';

export class MariaDBJourneyRepository implements IJourneyRepository {
  async create(journey: Omit<Journey, 'id' | 'createdAt' | 'updatedAt'>): Promise<Journey> {
    const conn = await pool.getConnection();
    try {
      const result = await conn.query(
        `INSERT INTO journey (name, origin_point, current_position, heading, started_at)
         VALUES (?, ST_GeomFromText(?, 4326), ST_GeomFromText(?, 4326), ?, ?)`,
        [
          journey.name,
          pointToWKT(journey.originPoint),
          pointToWKT(journey.currentPosition),
          journey.heading,
          journey.startedAt,
        ]
      );

      return new Journey(
        result.insertId,
        journey.name,
        journey.originPoint,
        journey.currentPosition,
        journey.heading,
        journey.startedAt,
        new Date(),
        new Date()
      );
    } finally {
      conn.release();
    }
  }

  async findById(id: number): Promise<Journey | null> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT id, name, 
                ST_AsText(origin_point) as origin_point,
                ST_AsText(current_position) as current_position,
                heading, started_at, created_at, updated_at
         FROM journey WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return this.toDomain(rows[0]);
    } finally {
      conn.release();
    }
  }

  async findActive(): Promise<Journey | null> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT id, name,
                ST_AsText(origin_point) as origin_point,
                ST_AsText(current_position) as current_position,
                heading, started_at, created_at, updated_at
         FROM journey
         ORDER BY started_at DESC
         LIMIT 1`
      );

      if (rows.length === 0) {
        return null;
      }

      return this.toDomain(rows[0]);
    } finally {
      conn.release();
    }
  }

  async update(journey: Journey): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `UPDATE journey
         SET current_position = ST_GeomFromText(?, 4326), updated_at = NOW()
         WHERE id = ?`,
        [pointToWKT(journey.currentPosition), journey.id]
      );
    } finally {
      conn.release();
    }
  }

  private toDomain(row: any): Journey {
    return new Journey(
      row.id,
      row.name,
      this.parsePoint(row.origin_point),
      this.parsePoint(row.current_position),
      row.heading,
      new Date(row.started_at),
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private parsePoint(wkt: string): Point {
    const match = wkt.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (!match) {
      throw new Error(`Invalid WKT format: ${wkt}`);
    }
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2]),
    };
  }
}
