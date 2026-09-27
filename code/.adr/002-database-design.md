# ADR 002: Database Design & Schema

**Status:** Accepted  
**Date:** 2026-02-02  

## Context

We need a database schema to support:
- A single journey from Oleiros heading east around the world
- Route points generated every 15-20km with various states (pending, researched, content_generated, image_ready, published, failed)
- Full metadata for each location (coordinates, country, region, OSM data, research summaries, prompts)
- Published photos with display metadata (camera settings, narrative, image paths)
- Idempotent schedulers that query by status to maintain buffer of 10 ready photos
- Error handling with failed status and error messages
- Geographic queries (nearest cities, distance calculations)

Per project requirements:
- MariaDB 11 without ORM (direct SQL with parameterized queries)
- Connection pooling for performance
- Versioned migrations
- Support for geographic data types (POINT)

## Decision

### Database Driver: mariadb (Node.js)

We choose the **`mariadb`** npm package over `mysql2` because:
- Native MariaDB protocol support (faster, more features)
- Better connection pooling out of the box
- Built-in promise support (no need for `.promise()` wrapper)
- Better handling of POINT/geographic types
- Active development focused on MariaDB-specific features

### Schema Design

#### Table: `journey`

Stores the single journey around the world.

```sql
CREATE TABLE journey (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'Around the World on Foot',
  origin_point POINT NOT NULL SRID 4326,
  current_position POINT NOT NULL SRID 4326,
  heading VARCHAR(10) NOT NULL DEFAULT 'east',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  SPATIAL INDEX idx_origin (origin_point),
  SPATIAL INDEX idx_current (current_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Uses MariaDB's native POINT type with SRID 4326 (WGS 84 coordinate system)
- Spatial indexes for geographic queries
- Single row expected (enforced at application level)

#### Table: `route_points`

Stores all generated route points with their processing status.

```sql
CREATE TABLE route_points (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  journey_id INT UNSIGNED NOT NULL,
  sequence INT UNSIGNED NOT NULL,
  
  -- Geographic data
  place_name VARCHAR(255),
  coordinates POINT NOT NULL SRID 4326,
  country VARCHAR(100),
  region VARCHAR(255),
  is_ferry_crossing BOOLEAN NOT NULL DEFAULT FALSE,
  distance_from_previous DECIMAL(6,2), -- km, e.g., 15.75
  
  -- Research & content data
  osm_data JSON, -- Raw data from Overpass API
  research_summary TEXT, -- From Brave Search
  image_prompt TEXT,
  narrative_prompt TEXT,
  camera_metadata JSON, -- { camera, lens, iso, shutter_speed, ... }
  
  -- Processing status
  status ENUM('pending', 'researched', 'content_generated', 'image_ready', 'published', 'failed') NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- Image paths
  image_path VARCHAR(500),
  thumbnail_path VARCHAR(500),
  
  -- Timestamps
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (journey_id) REFERENCES journey(id) ON DELETE CASCADE,
  UNIQUE KEY uk_journey_sequence (journey_id, sequence),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_country (country),
  SPATIAL INDEX idx_coordinates (coordinates)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- `sequence` ensures order of route points
- `status` tracks pipeline progress for idempotent processing
- `osm_data` and `camera_metadata` use JSON for flexibility
- `error_message` captures failures for manual review
- Indexes on `status` for scheduler queries, `published_at` for chronological display
- Spatial index on `coordinates` for geographic queries

#### Table: `photos`

Stores published photos for display (denormalized for query performance).

```sql
CREATE TABLE photos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  route_point_id INT UNSIGNED NOT NULL UNIQUE,
  
  -- Display metadata
  title VARCHAR(255) NOT NULL,
  narrative TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  coordinates POINT NOT NULL SRID 4326,
  
  -- Camera metadata (denormalized from route_points.camera_metadata)
  camera_model VARCHAR(100),
  lens VARCHAR(100),
  iso INT UNSIGNED,
  shutter_speed VARCHAR(20),
  
  -- Additional metadata
  roll_number VARCHAR(50),
  frame_number VARCHAR(50),
  series_name VARCHAR(255),
  volume_issue VARCHAR(50),
  
  -- Image paths
  image_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500) NOT NULL,
  
  -- Timestamps
  published_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (route_point_id) REFERENCES route_points(id) ON DELETE CASCADE,
  INDEX idx_published_at (published_at DESC),
  INDEX idx_location (location),
  SPATIAL INDEX idx_coordinates (coordinates)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Denormalized for fast read queries (gallery, archive, search)
- 1:1 relationship with route_points (UNIQUE on route_point_id)
- Indexes optimized for common queries: latest photo, date range, location search

### Migration Strategy

**Versioned migrations** in `migrations/` directory:
- Format: `YYYYMMDDHHMMSS_description.sql`
- Example: `20260202100000_create_journey_table.sql`
- Idempotent: Check existence before creating tables
- Separate migration tracking table:

```sql
CREATE TABLE IF NOT EXISTS migrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

**Migration runner:**
- CLI command: `pnpm db:migrate`
- Reads all `.sql` files from `migrations/`
- Skips already applied (checks `migrations` table)
- Runs in transaction for rollback on error
- Logs each migration execution

### Connection Pool Configuration

```typescript
// packages/shared/database/pool.ts
import mariadb from 'mariadb';

export const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'app',
  connectionLimit: 10,
  idleTimeout: 30000,
  acquireTimeout: 30000,
  timezone: 'Z', // UTC
});
```

### Repository Pattern

Each module implements repositories as adapters:

```typescript
// Example: packages/route/adapters/mariadb-route-repository.ts
export class MariaDBRouteRepository implements IRouteRepository {
  async findByStatus(status: RouteStatus, limit: number): Promise<RoutePoint[]> {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        'SELECT * FROM route_points WHERE status = ? ORDER BY sequence ASC LIMIT ?',
        [status, limit]
      );
      return rows.map(this.toDomain);
    } finally {
      conn.release();
    }
  }
  
  // Always use parameterized queries for SQL injection prevention
}
```

### Seed Data

Initial journey seed (applied by CLI init script):

```sql
INSERT INTO journey (name, origin_point, current_position, heading)
VALUES (
  'Around the World on Foot',
  ST_GeomFromText('POINT(-8.3186 43.3328)', 4326), -- Oleiros, Spain
  ST_GeomFromText('POINT(-8.3186 43.3328)', 4326),
  'east'
);
```

## Alternatives Considered

### Option A: mysql2 Driver
Native MySQL protocol with broader compatibility.

**Rejected because:**
- MariaDB-specific features not fully supported
- Requires `.promise()` wrapper for async/await
- Less optimized for MariaDB 11

### Option B: TypeORM or Prisma
ORM for type-safe queries and migrations.

**Rejected because:**
- Project requirement: No ORM, direct SQL
- Want full control over queries and performance
- Hexagonal architecture benefits from manual repository implementation

### Option C: Single `photos` Table
Store all route point data directly in photos table without separate route_points.

**Rejected because:**
- Loses processing pipeline visibility
- Can't track failed generations
- No buffer management (need to see pending/ready states)
- Mixing concerns (route planning vs published content)

### Option D: Separate Tables for Camera Metadata
Normalize camera models, lenses into separate tables.

**Rejected because:**
- Over-normalization for generated data
- Camera metadata is fictional (generated by LLM)
- No need for referential integrity on fictional data
- JSON storage is more flexible for evolving prompts

## Consequences

### Positive
- **Direct SQL control**: Full visibility and optimization of queries
- **Geographic support**: Native POINT type for distance calculations
- **Status tracking**: Clear pipeline visibility for debugging
- **Idempotent queries**: Schedulers can safely query by status
- **Error handling**: Failed states prevent silent failures
- **Performance**: Indexes on common query patterns
- **Denormalization**: Fast reads for gallery/archive pages

### Negative
- **Manual mapping**: No ORM auto-mapping (must write toDomain/toRow methods)
- **Migration management**: Manual tracking and execution
- **Schema changes**: Requires careful migration scripts
- **Data duplication**: Photos table duplicates route_points data
- **JSON queries**: Can't efficiently query inside JSON fields

### Follow-ups
- Implement migration runner CLI tool
- Create database connection health check
- Add monitoring for connection pool exhaustion
- Document common query patterns in README
- Create database backup strategy
- Consider adding full-text search indexes for narrative/location search
- Add database seeding for development/testing
