#!/bin/bash

set -euo pipefail

./scripts/docker-run.sh pnpm test "$@"
