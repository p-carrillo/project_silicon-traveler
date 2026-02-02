#!/bin/bash

# Helper script to run commands inside the app container

if [ $# -eq 0 ]; then
  echo "Usage: ./scripts/docker-run.sh <command>"
  echo "Example: ./scripts/docker-run.sh pnpm build"
  exit 1
fi

docker compose exec app "$@"
