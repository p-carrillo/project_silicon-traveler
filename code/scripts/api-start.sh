#!/bin/sh
set -e

echo "⏳ Ejecutando migraciones..."
node scripts/run-migrations.js

echo "📸 Verificando fotos en la base de datos..."
PHOTO_COUNT=$(node -e "
const { pool } = require('./packages/shared/dist/index.js');
pool.query('SELECT COUNT(*) as count FROM photos')
  .then(([result]) => {
    console.log(Number(result.count));
    process.exit(0);
  })
  .catch(() => {
    console.log('0');
    process.exit(0);
  });
" 2>/dev/null || echo "0")

if [ "$PHOTO_COUNT" = "0" ]; then
  echo "📸 Cargando fotos de ejemplo..."
  node scripts/seed-photos.js
else
  echo "✓ Ya hay $PHOTO_COUNT fotos en la base de datos"
fi

echo "🚀 Iniciando API..."
exec pnpm --filter @silicon-traveler/api dev
