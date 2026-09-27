# ADR 004: Image Storage and Thumbnail Strategy

## Status
Accepted

## Context
The Silicon Traveler application generates one high-resolution AI photo daily. We need to:
1. Store original images efficiently
2. Generate thumbnails for different UI contexts (grid, hero)
3. Serve images fast to web clients
4. Plan for future cloud migration (S3, Cloudflare R2, etc.)

The codebase must support local development while remaining cloud-agnostic.

## Decision

### Storage Architecture
We will use the **IStoragePort abstraction** with two implementations:
1. **LocalStorageAdapter** (MVP): Filesystem storage in `/images/YYYY/MM/DD/` structure
2. **CloudStorageAdapter** (Future): S3/R2-compatible object storage

### File Structure (Local)
```
/images/
├── 2026/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── 1.jpg          # Original image (route_point_id)
│   │   │   ├── 1_grid.jpg     # 400x400 thumbnail
│   │   │   ├── 1_hero.jpg     # 1920x1080 thumbnail
│   │   │   ├── 2.jpg
│   │   │   ├── 2_grid.jpg
│   │   │   └── 2_hero.jpg
│   │   ├── 16/
│   │   └── 17/
│   └── 02/
└── 2027/
```

### Thumbnail Sizes
1. **Grid Thumbnail** (`_grid.jpg`): 400x400px, cover fit, center crop
   - Used in: Archive page contact sheet, mobile gallery
   - Quality: 90% JPEG
   
2. **Hero Thumbnail** (`_hero.jpg`): 1920x1080px, cover fit, center crop
   - Used in: Homepage hero image, photo detail page
   - Quality: 90% JPEG

### Image Processing
- **Library:** Sharp (fast, Node.js native bindings to libvips)
- **Fit mode:** `cover` (maintains aspect ratio, crops excess)
- **Position:** `center` (crops equally from all sides)
- **Format:** JPEG (smaller files, web-optimized)

### URL Structure
- **Local:** `/images/2026/01/15/1_hero.jpg`
- **Cloud (future):** `https://cdn.example.com/images/2026/01/15/1_hero.jpg`

### Database Storage
The `photos` table stores URLs, not file paths:
```sql
image_url VARCHAR(500)         -- Original image URL
grid_thumbnail_url VARCHAR(500)  -- 400x400 thumbnail URL
hero_thumbnail_url VARCHAR(500)  -- 1920x1080 thumbnail URL
```

This allows swapping storage backends without database migration.

### Serving Strategy (MVP)
1. **Development:** Node.js static file server in API app
2. **Production (future):** Nginx reverse proxy or CDN (Cloudflare)

## Alternatives Considered

### 1. Store Images in Database (BLOB)
**Pros:**
- Atomic transactions
- No filesystem dependencies
- Simplified backups

**Cons:**
- MariaDB performance degrades with large BLOBs
- Harder to serve via CDN
- Database backups become huge
- No direct file access for debugging

**Verdict:** Rejected. Databases optimize for structured data, not binary blobs.

### 2. Single Thumbnail Size
**Pros:**
- Simpler code
- Less storage
- Faster generation

**Cons:**
- Homepage hero would upscale small thumbnails (pixelation)
- Archive grid would load unnecessarily large images (slow)
- Mobile responsiveness suffers

**Verdict:** Rejected. Two thumbnails (grid + hero) optimize for both use cases.

### 3. On-the-fly Thumbnail Generation (No Pre-generation)
**Pros:**
- Dynamic sizing (any dimension on-demand)
- No storage overhead
- Simpler upload flow

**Cons:**
- CPU-intensive per request
- Slower page loads
- Requires caching layer (complexity)
- Sharp processing not fast enough for real-time

**Verdict:** Rejected. Pre-generation trades storage for speed.

### 4. WebP Format Instead of JPEG
**Pros:**
- 25-35% smaller file sizes
- Better compression
- Modern browsers support

**Cons:**
- Safari < 14 unsupported (legacy iOS)
- Decoding slightly slower on old devices
- Less universal than JPEG

**Verdict:** Deferred. JPEG is safer for MVP. Consider WebP with JPEG fallback in v2.

### 5. Flat Directory Structure (`/images/123.jpg`)
**Pros:**
- Simpler paths
- Faster lookups (no nested dirs)

**Cons:**
- Filesystems slow with 10,000+ files in single directory
- Harder to archive/delete old years
- No chronological organization

**Verdict:** Rejected. Date-based hierarchy scales better and enables yearly archiving.

### 6. ImageKit / Cloudinary (Image CDN SaaS)
**Pros:**
- Automatic optimization
- Real-time transformations
- Global CDN
- Handles all complexity

**Cons:**
- $50-200/month for our volume
- Vendor lock-in
- Adds external dependency
- Overkill for one photo per day

**Verdict:** Rejected. Local storage + future Cloudflare R2 is cheaper and sufficient.

## Consequences

### Positive
- **IStoragePort abstraction:** Easy migration from local to cloud (single adapter swap)
- **Date-based hierarchy:** Filesystem-friendly, supports archiving by year
- **Pre-generated thumbnails:** Fast page loads, no on-the-fly processing
- **Sharp library:** Blazing fast image processing (native bindings)
- **URL-based storage:** Database-agnostic, works with any file host
- **Two thumbnail sizes:** Optimized for grid (small) and hero (large) use cases

### Negative
- **Disk space:** Storing 3 versions (original + 2 thumbnails) triples storage
  - ~5MB original + 0.5MB thumbnails = 5.5MB per photo
  - 365 days/year = ~2GB/year (acceptable)
- **Filesystem coupling:** LocalStorageAdapter assumes POSIX filesystem (Linux/macOS)
- **No automatic cleanup:** Deleting a photo requires manual file deletion (no foreign key cascade)
- **No image versioning:** Regenerating a photo overwrites existing files (use route_point_id as filename to ensure uniqueness)

### Neutral
- JPEG quality 90% balances file size and visual quality (may need tuning)
- Center crop may cut important subjects (consider smart cropping in v2)
- Sharp library requires native dependencies (pre-built binaries for Alpine Linux included)

## Performance Considerations

### Sharp Benchmarks (1792x1024 → 400x400)
- **Processing time:** ~50ms per thumbnail on 2-core container
- **Memory usage:** ~100MB peak during processing
- **Concurrency:** Single-threaded Sharp processes (no worker pool needed for 1 photo/day)

### Storage Growth (5 Years)
- **Daily:** 5.5MB × 365 = ~2GB/year
- **5 years:** ~10GB total (manageable on small VPS)

### Cloud Migration Path
When migrating to cloud storage:
1. Create `S3StorageAdapter` implementing `IStoragePort`
2. Update `docker-compose.yml` or environment config
3. No database changes required (URLs remain compatible)
4. Optional: Migrate existing files with script

## Implementation Notes
- `LocalStorageAdapter` constructor accepts `baseDir` and `baseUrl` (defaults: `/images`)
- `SaveImageUseCase` orchestrates single image save
- `SaveThumbnailsUseCase` orchestrates multiple thumbnail saves
- `buildPath()` method constructs `YYYY/MM/DD/filename` structure
- `ensureDir()` creates directories recursively (like `mkdir -p`)
- Filenames use `route_point_id` to guarantee uniqueness
- Thumbnails append `_grid` and `_hero` suffixes before extension

## Security Notes
- **No user uploads:** All images generated by DALL-E (trusted source)
- **No path traversal:** Filenames sanitized (route_point_id is integer)
- **No symlink attacks:** `fs.mkdir` with `recursive: true` is safe
- **Public access:** Images served via static file endpoint (no authentication required)
