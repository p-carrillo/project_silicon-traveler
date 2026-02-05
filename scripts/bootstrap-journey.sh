#!/bin/bash

# Bootstrap journey: reset, migrate, init, generate and publish first photo
# Usage: ./scripts/bootstrap-journey.sh
#        docker compose exec api sh /app/scripts/bootstrap-journey.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌍 Silicon Traveler - Bootstrap Journey${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running inside Docker or on host
if [ -f "/.dockerenv" ]; then
  # Inside Docker container
  NODE_CMD="node"
  PNPM_CMD="pnpm"
else
  # On host machine
  NODE_CMD="docker compose exec api node"
  PNPM_CMD="docker compose exec api pnpm"
fi

# Step 1: Reset database
echo -e "${BLUE}[1/6] Resetting database...${NC}"
$NODE_CMD /app/scripts/reset-db.js
echo -e "${GREEN}✓ Database reset${NC}\n"

# Step 2: Run migrations
echo -e "${BLUE}[2/6] Running migrations...${NC}"
$NODE_CMD /app/scripts/run-migrations.js
echo -e "${GREEN}✓ Migrations applied${NC}\n"

# Step 3: Initialize journey
echo -e "${BLUE}[3/6] Initializing journey from Oleiros...${NC}"
$PNPM_CMD --filter @silicon-traveler/cli init-journey
echo -e "${GREEN}✓ Journey initialized (11 route points created)${NC}\n"

# Step 4: Generate first photo (research + prompts + image)
echo -e "${BLUE}[4/6] Generating first photo...${NC}"
echo -e "${YELLOW}   (This may take 30-60 seconds: research + GPT-4 + DALL-E 3)${NC}"
$PNPM_CMD --filter @silicon-traveler/cli prepare-prompts -- 1 --journey-id 1
echo -e "${GREEN}✓ First photo generated${NC}\n"

# Step 5: Publish first photo
echo -e "${BLUE}[5/6] Publishing first photo...${NC}"
$NODE_CMD /app/scripts/publish-photo.js
echo -e "${GREEN}✓ First photo published${NC}\n"

# Step 6: Show journey stats
echo -e "${BLUE}[6/6] Journey stats:${NC}"
$NODE_CMD /app/scripts/test-journey.js

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Bootstrap complete! Your journey has started.${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "  • View the published photo:  http://localhost:3011"
echo "  • Check the API:             http://localhost:3010/api/photos/latest"
echo "  • Generate more photos:      docker compose exec api pnpm --filter @silicon-traveler/cli prepare-prompts -- 5 --journey-id 1"
echo "  • Start scheduler:           docker compose up scheduler"
echo ""
