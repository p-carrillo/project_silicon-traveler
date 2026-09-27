#!/usr/bin/env node

/**
 * Realign stored photo files to day folders that match their publication schedule.
 *
 * Default mode is dry-run. Use --apply to perform file moves and DB updates.
 *
 * Usage:
 *   node scripts/realign-photo-storage-dates.js
 *   node scripts/realign-photo-storage-dates.js --apply
 *   node scripts/realign-photo-storage-dates.js --apply --journey-id 1
 *   node scripts/realign-photo-storage-dates.js --today 2026-02-08
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const DEFAULT_STORAGE_DIR = path.join(rootDir, 'images');
const SCHEDULED_STATUSES = new Set(['pending', 'researched', 'content_generated', 'image_ready']);

function parseArgs(argv) {
  const args = {
    apply: false,
    journeyId: null,
    today: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--apply') {
      args.apply = true;
      continue;
    }

    if (arg === '--journey-id') {
      const next = argv[i + 1];
      if (!next || Number.isNaN(Number(next))) {
        throw new Error('--journey-id requires a numeric value');
      }
      args.journeyId = Number(next);
      i += 1;
      continue;
    }

    if (arg.startsWith('--journey-id=')) {
      const raw = arg.split('=')[1];
      if (!raw || Number.isNaN(Number(raw))) {
        throw new Error('--journey-id requires a numeric value');
      }
      args.journeyId = Number(raw);
      continue;
    }

    if (arg === '--today') {
      const next = argv[i + 1];
      args.today = parseDateOnly(next);
      i += 1;
      continue;
    }

    if (arg.startsWith('--today=')) {
      const raw = arg.split('=')[1];
      args.today = parseDateOnly(raw);
      continue;
    }
  }

  return args;
}

function parseDateOnly(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid date '${value}'. Expected YYYY-MM-DD.`);
  }

  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const day = Number(dayRaw);
  const date = new Date(year, monthIndex, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfDay(date) {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(date, days) {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

function coerceDate(value) {
  if (!value) return null;
  if (value instanceof Date) return new Date(value);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toDateFolder(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return { year, month, day, folder: `${year}/${month}/${day}` };
}

function normalizeStoragePath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return null;
  const trimmed = rawPath.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return null;

  let normalized = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
  if (normalized.startsWith('images/')) {
    normalized = normalized.slice('images/'.length);
  }

  return normalized || null;
}

function buildTargetRelativePath(rawPath, date) {
  const normalized = normalizeStoragePath(rawPath);
  if (!normalized) return null;
  const filename = path.posix.basename(normalized);
  const { folder } = toDateFolder(date);
  return `${folder}/${filename}`;
}

function formatDatabasePath(originalPath, targetRelativePath) {
  if (!originalPath || !targetRelativePath) return originalPath;
  if (originalPath.startsWith('/images/')) return `/images/${targetRelativePath}`;
  if (originalPath.startsWith('images/')) return `images/${targetRelativePath}`;
  return targetRelativePath;
}

function resolveTargetDate(routePoint, photo, firstScheduledSequenceByJourney, today) {
  const photoPublishedDate = coerceDate(photo?.published_at);
  if (photoPublishedDate) return startOfDay(photoPublishedDate);

  const routePublishedDate = coerceDate(routePoint.published_at);
  if (routePublishedDate) return startOfDay(routePublishedDate);

  if (SCHEDULED_STATUSES.has(routePoint.status)) {
    const firstSequence = firstScheduledSequenceByJourney.get(routePoint.journey_id);
    if (Number.isFinite(firstSequence)) {
      const offset = Math.max(routePoint.sequence - firstSequence, 0);
      return addDays(today, offset);
    }
  }

  return today;
}

function safeParseJson(value) {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function pathExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (_error) {
    return false;
  }
}

function moveFileIfNeeded(storageDir, sourceRelativePath, targetRelativePath, apply) {
  if (!sourceRelativePath || !targetRelativePath || sourceRelativePath === targetRelativePath) {
    return { status: 'unchanged' };
  }

  const sourcePath = path.join(storageDir, sourceRelativePath);
  const targetPath = path.join(storageDir, targetRelativePath);

  if (!pathExists(sourcePath)) {
    if (pathExists(targetPath)) {
      return { status: 'already-target' };
    }
    return { status: 'missing-source' };
  }

  if (pathExists(targetPath)) {
    return { status: 'target-exists' };
  }

  if (!apply) {
    return { status: 'would-move' };
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.renameSync(sourcePath, targetPath);
  return { status: 'moved' };
}

function mergeChange(map, id, field, value) {
  const key = Number(id);
  const current = map.get(key) || {};
  current[field] = value;
  map.set(key, current);
}

async function applyRoutePointUpdates(connection, updatesById) {
  for (const [id, fields] of updatesById.entries()) {
    const sets = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(fields, 'image_path')) {
      sets.push('image_path = ?');
      params.push(fields.image_path);
    }
    if (Object.prototype.hasOwnProperty.call(fields, 'thumbnail_path')) {
      sets.push('thumbnail_path = ?');
      params.push(fields.thumbnail_path);
    }

    if (!sets.length) continue;

    sets.push('updated_at = NOW()');
    params.push(id);

    await connection.query(
      `UPDATE route_points SET ${sets.join(', ')} WHERE id = ?`,
      params
    );
  }
}

async function applyPhotoUpdates(connection, updatesById) {
  for (const [id, fields] of updatesById.entries()) {
    const sets = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(fields, 'image_path')) {
      sets.push('image_path = ?');
      params.push(fields.image_path);
    }
    if (Object.prototype.hasOwnProperty.call(fields, 'thumbnail_path')) {
      sets.push('thumbnail_path = ?');
      params.push(fields.thumbnail_path);
    }
    if (Object.prototype.hasOwnProperty.call(fields, 'metadata')) {
      sets.push('metadata = ?');
      params.push(fields.metadata);
    }

    if (!sets.length) continue;

    params.push(id);
    await connection.query(
      `UPDATE photos SET ${sets.join(', ')} WHERE id = ?`,
      params
    );
  }
}

async function realignPhotoStorageDates(rawOptions = {}) {
  const options = {
    apply: Boolean(rawOptions.apply),
    journeyId: rawOptions.journeyId ?? null,
    today: rawOptions.today ? startOfDay(rawOptions.today) : startOfDay(new Date()),
  };

  const { pool } = require('../packages/shared/dist/index.js');
  const storageDir = process.env.STORAGE_DIR || DEFAULT_STORAGE_DIR;
  const connection = await pool.getConnection();

  const routePointUpdates = new Map();
  const photoUpdates = new Map();
  const fileMoveResults = [];

  try {
    const firstScheduledRows = await connection.query(
      `SELECT journey_id, MIN(sequence) AS min_sequence
       FROM route_points
       WHERE status IN ('pending', 'researched', 'content_generated', 'image_ready')
       GROUP BY journey_id`
    );

    const firstScheduledSequenceByJourney = new Map(
      firstScheduledRows.map((row) => [Number(row.journey_id), Number(row.min_sequence)])
    );

    const routeWhere = options.journeyId ? 'WHERE journey_id = ?' : '';
    const routeParams = options.journeyId ? [options.journeyId] : [];

    const routePoints = await connection.query(
      `SELECT id, journey_id, sequence, status, image_path, thumbnail_path, published_at
       FROM route_points
       ${routeWhere}
       ORDER BY journey_id ASC, sequence ASC`,
      routeParams
    );

    const photos = await connection.query(
      `SELECT id, route_point_id, image_path, thumbnail_path, metadata, published_at
       FROM photos`
    );

    const photosByRoutePointId = new Map(photos.map((photo) => [Number(photo.route_point_id), photo]));
    const movedPairs = new Set();

    for (const routePoint of routePoints) {
      const photo = photosByRoutePointId.get(Number(routePoint.id)) || null;
      const targetDate = resolveTargetDate(
        routePoint,
        photo,
        firstScheduledSequenceByJourney,
        options.today
      );

      const pathFields = [
        { owner: 'route_points', id: Number(routePoint.id), field: 'image_path', value: routePoint.image_path },
        {
          owner: 'route_points',
          id: Number(routePoint.id),
          field: 'thumbnail_path',
          value: routePoint.thumbnail_path,
        },
      ];

      if (photo) {
        pathFields.push(
          { owner: 'photos', id: Number(photo.id), field: 'image_path', value: photo.image_path },
          { owner: 'photos', id: Number(photo.id), field: 'thumbnail_path', value: photo.thumbnail_path }
        );
      }

      for (const pathField of pathFields) {
        const sourceRelativePath = normalizeStoragePath(pathField.value);
        const targetRelativePath = buildTargetRelativePath(pathField.value, targetDate);

        if (!sourceRelativePath || !targetRelativePath || sourceRelativePath === targetRelativePath) {
          continue;
        }

        const pairKey = `${sourceRelativePath}=>${targetRelativePath}`;
        if (!movedPairs.has(pairKey)) {
          const moveResult = moveFileIfNeeded(
            storageDir,
            sourceRelativePath,
            targetRelativePath,
            options.apply
          );
          fileMoveResults.push({
            sourceRelativePath,
            targetRelativePath,
            status: moveResult.status,
          });
          movedPairs.add(pairKey);
        }

        const dbPath = formatDatabasePath(pathField.value, targetRelativePath);
        if (pathField.owner === 'route_points') {
          mergeChange(routePointUpdates, pathField.id, pathField.field, dbPath);
        } else {
          mergeChange(photoUpdates, pathField.id, pathField.field, dbPath);
        }
      }

      if (photo) {
        const metadata = safeParseJson(photo.metadata);
        const heroPath = metadata?.heroThumbnailUrl;
        const sourceRelativePath = normalizeStoragePath(heroPath);
        const targetRelativePath = buildTargetRelativePath(heroPath, targetDate);

        if (sourceRelativePath && targetRelativePath && sourceRelativePath !== targetRelativePath) {
          const pairKey = `${sourceRelativePath}=>${targetRelativePath}`;
          if (!movedPairs.has(pairKey)) {
            const moveResult = moveFileIfNeeded(
              storageDir,
              sourceRelativePath,
              targetRelativePath,
              options.apply
            );
            fileMoveResults.push({
              sourceRelativePath,
              targetRelativePath,
              status: moveResult.status,
            });
            movedPairs.add(pairKey);
          }

          metadata.heroThumbnailUrl = formatDatabasePath(heroPath, targetRelativePath);
          mergeChange(photoUpdates, Number(photo.id), 'metadata', JSON.stringify(metadata));
        }
      }
    }

    const summary = {
      apply: options.apply,
      journeyId: options.journeyId,
      storageDir,
      routePointsScanned: routePoints.length,
      photosScanned: photos.length,
      routePointRowsToUpdate: routePointUpdates.size,
      photoRowsToUpdate: photoUpdates.size,
      fileMoves: fileMoveResults.length,
      fileMoveStatus: fileMoveResults.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}),
    };

    if (options.apply) {
      await connection.beginTransaction();
      try {
        await applyRoutePointUpdates(connection, routePointUpdates);
        await applyPhotoUpdates(connection, photoUpdates);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }

    return {
      summary,
      fileMoveResults,
      routePointUpdates,
      photoUpdates,
    };
  } finally {
    connection.release();
    await pool.end();
  }
}

if (require.main === module) {
  (async () => {
    const args = parseArgs(process.argv.slice(2));
    const result = await realignPhotoStorageDates(args);

    const mode = args.apply ? 'APPLY' : 'DRY-RUN';
    console.log(`🗂️  Realign photo storage dates (${mode})`);
    console.log(JSON.stringify(result.summary, null, 2));

    if (!args.apply) {
      console.log('\nNo changes were written. Re-run with --apply to execute.');
    }
  })().catch((error) => {
    console.error('❌ Failed to realign photo storage dates:', error.message);
    process.exit(1);
  });
}

module.exports = {
  parseDateOnly,
  normalizeStoragePath,
  buildTargetRelativePath,
  formatDatabasePath,
  resolveTargetDate,
  realignPhotoStorageDates,
};
