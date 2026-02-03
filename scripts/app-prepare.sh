#!/bin/sh
set -e

READY_FILE="/app/.dev_ready"
LOCKFILE="/app/pnpm-lock.yaml"
LOCK_HASH_FILE="/app/node_modules/.pnpm-lock.hash"

rm -f "$READY_FILE"

LOCK_HASH=""
if [ -f "$LOCKFILE" ]; then
  LOCK_HASH=$(sha256sum "$LOCKFILE" | awk '{print $1}')
fi

INSTALL_NEEDED=0
if [ ! -d "/app/node_modules" ] || [ ! -f "/app/node_modules/.modules.yaml" ]; then
  INSTALL_NEEDED=1
elif [ -n "$LOCK_HASH" ]; then
  if [ ! -f "$LOCK_HASH_FILE" ] || [ "$(cat "$LOCK_HASH_FILE")" != "$LOCK_HASH" ]; then
    INSTALL_NEEDED=1
  fi
fi

if [ "$INSTALL_NEEDED" = "0" ]; then
  for dir in /app/packages/* /app/apps/*; do
    if [ -d "$dir" ] && [ ! -d "$dir/node_modules" ]; then
      INSTALL_NEEDED=1
      break
    fi
  done
fi

if [ "$INSTALL_NEEDED" = "1" ]; then
  echo "📦 Installing dependencies..."
  CI=1 pnpm install --frozen-lockfile --force
  if [ -n "$LOCK_HASH" ]; then
    echo "$LOCK_HASH" > "$LOCK_HASH_FILE"
  fi
else
  echo "✓ Dependencies already installed"
fi

NEEDS_BUILD=0
for file in \
  /app/packages/shared/dist/index.js \
  /app/packages/journey/dist/index.js \
  /app/packages/route/dist/index.js \
  /app/packages/photo/dist/index.js \
  /app/packages/map/dist/index.js
do
  if [ ! -f "$file" ]; then
    NEEDS_BUILD=1
    break
  fi
done

if [ "$NEEDS_BUILD" = "1" ]; then
  echo "🔨 Building workspace packages..."
  pnpm --filter "./packages/*" build
else
  echo "✓ Packages already built"
fi

touch "$READY_FILE"
echo "✅ Dev workspace ready"
exec tail -f /dev/null
