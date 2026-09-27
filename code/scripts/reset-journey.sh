#!/bin/bash

set -e

echo "🔄 Resetting Silicon Traveler to start fresh journey..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Reset database
echo -e "${BLUE}→ Resetting database...${NC}"
docker compose exec app node scripts/reset-db.js
echo -e "${GREEN}✓ Database reset${NC}\n"

# Step 2: Run migrations
echo -e "${BLUE}→ Running migrations...${NC}"
docker compose exec app node scripts/run-migrations.js
echo -e "${GREEN}✓ Migrations applied${NC}\n"

# Step 3: Clear images
echo -e "${BLUE}→ Clearing images directory...${NC}"
docker compose exec app sh -c 'rm -rf /app/images/* && echo "Images cleared"'
echo -e "${GREEN}✓ Images cleared${NC}\n"

# Step 4: Initialize journey
echo -e "${BLUE}→ Initializing new journey...${NC}"
docker compose exec app node apps/cli/dist/index.js init-journey
echo -e "${GREEN}✓ Journey initialized${NC}\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ All done! Journey is ready to start.${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the scheduler:  docker compose up scheduler"
echo "  2. Check the API:        http://localhost:3000"
echo "  3. View the web:         http://localhost:3001"
echo ""
