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
  pnpm install --frozen-lockfile
  if [ -n "$LOCK_HASH" ]; then
    echo "$LOCK_HASH" > "$LOCK_HASH_FILE"
  fi
else
  echo "✓ Dependencies already installed"
fi

NEEDS_BUILD=0
for dir in /app/packages/*; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    if [ ! -d "$dir/dist" ] || [ -z "$(ls -A "$dir/dist" 2>/dev/null)" ]; then
      echo "⚠️  Package $(basename "$dir") missing dist/"
      NEEDS_BUILD=1
      break
    fi
    
    # Check if any .ts file is newer than the dist/ directory
    NEWER_FILES=$(find "$dir/src" -type f -name "*.ts" -newer "$dir/dist" 2>/dev/null | head -n 1)
    if [ -n "$NEWER_FILES" ]; then
      echo "⚠️  Package $(basename "$dir") has changes since last build"
      NEEDS_BUILD=1
      break
    fi
  fi
done

if [ "$NEEDS_BUILD" = "1" ]; then
  echo "🔨 Building all workspace packages..."
  pnpm --filter "./packages/*" build
else
  echo "✓ All packages already built and up to date"
fi

touch "$READY_FILE"
echo "✅ Dev workspace ready"
exec tail -f /dev/null
