#!/usr/bin/env bash

set -euo pipefail

ENVIRONMENT=${1:-dev}

if [[ "$ENVIRONMENT" == "prod" || "$ENVIRONMENT" == "production" ]]; then
  COMPOSE_FILE="docker-compose.prod.yml"
else
  COMPOSE_FILE="docker-compose.yml"
fi

DEFAULT_URL="https://download.geofabrik.de/europe/spain-latest.osm.pbf"
OSRM_PBF_URL_VALUE="${OSRM_PBF_URL:-$DEFAULT_URL}"
OSRM_PBF_FILE_VALUE="${OSRM_PBF_FILE:-$(basename "$OSRM_PBF_URL_VALUE") }"
OSRM_PBF_FILE_VALUE="${OSRM_PBF_FILE_VALUE// /}"

echo "[osrm-bootstrap] compose file: $COMPOSE_FILE"
echo "[osrm-bootstrap] pbf url: $OSRM_PBF_URL_VALUE"
echo "[osrm-bootstrap] pbf file: $OSRM_PBF_FILE_VALUE"

echo "[osrm-bootstrap] downloading (if missing) and preparing dataset..."
OSRM_PBF_URL="$OSRM_PBF_URL_VALUE" OSRM_PBF_FILE="$OSRM_PBF_FILE_VALUE" \
  docker compose -f "$COMPOSE_FILE" --profile routing --profile routing-init run --rm osrm-init sh -c '
    set -e
    FILE="/data/${OSRM_PBF_FILE:-spain-latest.osm.pbf}"
    URL="${OSRM_PBF_URL:-https://download.geofabrik.de/europe/spain-latest.osm.pbf}"

    if [ ! -f "$FILE" ]; then
      echo "[osrm-bootstrap] downloading $URL -> $FILE"
      if command -v curl >/dev/null 2>&1; then
        curl -L --fail --retry 3 --retry-delay 2 -o "$FILE" "$URL"
      elif command -v wget >/dev/null 2>&1; then
        wget -O "$FILE" "$URL"
      else
        echo "[osrm-bootstrap] error: curl/wget not available in osrm image"
        exit 1
      fi
    else
      echo "[osrm-bootstrap] using existing pbf: $FILE"
    fi

    if [ -f "${FILE}.osrm.mldgr" ]; then
      echo "[osrm-bootstrap] preprocessed dataset already present"
      exit 0
    fi

    osrm-extract -p /opt/car.lua "$FILE"
    osrm-partition "$FILE"
    osrm-customize "$FILE"
  '

echo "[osrm-bootstrap] starting osrm service..."
OSRM_PBF_FILE="$OSRM_PBF_FILE_VALUE" docker compose -f "$COMPOSE_FILE" --profile routing up -d osrm

echo "[osrm-bootstrap] done"
