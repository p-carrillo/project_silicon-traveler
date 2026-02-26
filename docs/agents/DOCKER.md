# Silicon Traveler - Docker Deployment

This guide explains how to run the application with Docker Compose in development and production.

## Requirements

- Docker Engine 20.10 or newer
- Docker Compose v2.0 or newer
- `.env` file with required environment variables

## Initial Setup

1. Copy the environment example:
```bash
cp .env.example .env
```

2. Edit `.env` with your real values:
```bash
# Use strong passwords in production
DB_PASSWORD=your_secure_password
DB_ROOT_PASSWORD=your_secure_root_password
API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key
WIKIPEDIA_USER_AGENT=silicon-traveler/1.0 (https://github.com)
```

## Development

### Start the application in dev mode

```bash
# Build images (first run or after Dockerfile changes)
docker compose build

# Start all services
docker compose up -d

# Tail logs
docker compose logs -f

# Tail logs for a specific service
docker compose logs -f api
docker compose logs -f web
```

### Services and ports (development)
- API: http://localhost:3010
- Web: http://localhost:3011
- MariaDB: localhost:3316

### Run commands inside containers

```bash
# Run migrations
docker compose exec api node scripts/run-migrations.js

# Run tests
docker compose exec app pnpm test

# Open a shell
docker compose exec app sh
```

### Stop services

```bash
# Stop without removing volumes
docker compose down

# Stop and remove volumes (clean reset)
docker compose down -v
```

## Production

### Deploy in production

```bash
# Build production images
docker compose -f docker-compose.prod.yml build --no-cache

# Start services
docker compose -f docker-compose.prod.yml up -d

# Verify status
docker compose -f docker-compose.prod.yml ps

# Tail logs
docker compose -f docker-compose.prod.yml logs -f
```

### Services and ports (production)
- API: http://localhost:3000 (adjust port if you change mappings)
- Web: http://localhost:3001 (adjust port if you change mappings)
- Scheduler: background jobs
- MariaDB: localhost:3316

### Production characteristics

- Optimized production builds
- Healthchecks for all services
- Restart policy: `unless-stopped`
- API runs migrations on startup
- Production-only dependencies
- Multi-stage builds for smaller images

### Update a production deployment

```bash
# Pull updated code
git pull

# Rebuild and update

docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Verify everything is healthy
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api

# Verify Next.js images proxy route is active
curl -i http://localhost:3001/api/images/images-proxy-smoke-test.jpg
```

Expected smoke test response:
- HTTP status `404`
- Body `Image not found`

### Stop production

```bash
# Stop services (keep data)
docker compose -f docker-compose.prod.yml down

# Backup before deleting volumes
docker compose -f docker-compose.prod.yml exec mariadb \
  mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > backup.sql

# Stop and remove everything
docker compose -f docker-compose.prod.yml down -v
```

## Monitoring and Maintenance

### Check container status
```bash
docker compose ps
```

### Resource usage
```bash
docker stats
```

### Tail recent logs
```bash
docker compose logs --tail=100 api
```

### Manual health checks
```bash
# Development
curl http://localhost:3010/health
curl http://localhost:3011

# Production
curl http://localhost:3000/health
curl http://localhost:3001
```

### Access the database
```bash
# From the host
docker compose exec mariadb mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME}

# From inside the api container
docker compose exec api node -e "const { pool } = require('./packages/shared/src/database/pool'); pool.query('SELECT 1').then(console.log)"
```

## Troubleshooting

### Containers do not start
```bash
# Detailed logs
docker compose logs

# Validate config
docker compose config

# Clean restart
docker compose down -v && docker compose up -d
```

### Missing modules
```bash
# Rebuild images without cache
docker compose build --no-cache

# Remove node_modules volume
docker volume rm project_silicon-traveler_node_modules
docker compose up -d
```

### Database connection failures
```bash
# Check MariaDB health
docker compose ps mariadb

# Tail MariaDB logs
docker compose logs mariadb

# Test connection
docker compose exec mariadb mysql -u root -p${DB_ROOT_PASSWORD} -e "SHOW DATABASES;"
```

## Container Architecture

### Development (`docker-compose.yml`)
- `mariadb`: Persistent database
- `app`: Base container with dependencies installed
- `api`: REST API in watch mode
- `web`: Next.js dev server with hot reload
- `scheduler`: Optional scheduled jobs

### Production (`docker-compose.prod.yml`)
- `mariadb`: Persistent database
- `api`: Production API with automatic migrations
- `web`: Production-optimized Next.js
- `scheduler`: Scheduled jobs

## Required Environment Variables

See `.env.example` for the full list of variables.

### Critical for production
- `DB_PASSWORD`: Database user password
- `DB_ROOT_PASSWORD`: MariaDB root password
- `API_KEY`: API authentication key
- `OPENAI_API_KEY`: OpenAI key
- `WIKIPEDIA_USER_AGENT`: Optional custom User-Agent for Wikipedia requests
- `CORS_ORIGINS`: Allowed CORS origins

## Volumes

- `mariadb_data`: Persistent MariaDB data
- `node_modules` (dev only): Node.js dependencies

Important: In production, ensure regular backups of the `mariadb_data` volume.
