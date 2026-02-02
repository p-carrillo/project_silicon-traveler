# Silicon Traveler - Docker Deployment

Esta guía explica cómo desplegar la aplicación usando Docker Compose tanto en desarrollo como en producción.

## Requisitos

- Docker Engine 20.10 o superior
- Docker Compose v2.0 o superior
- Archivo `.env` con las variables de entorno necesarias

## Configuración Inicial

1. Copia el archivo de ejemplo de variables de entorno:
```bash
cp .env.example .env
```

2. Edita `.env` con tus valores reales:
```bash
# Cambia las contraseñas por valores seguros en producción
DB_PASSWORD=tu_password_seguro
DB_ROOT_PASSWORD=tu_root_password_seguro
API_KEY=tu_api_key
OPENAI_API_KEY=tu_openai_key
BRAVE_SEARCH_API_KEY=tu_brave_key
```

## Desarrollo

### Iniciar la aplicación en modo desarrollo:

```bash
# Construir las imágenes (primera vez o después de cambios en Dockerfile)
docker compose build

# Levantar todos los servicios
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f api
docker compose logs -f web
```

### Servicios disponibles en desarrollo:
- **API**: http://localhost:3000
- **Web**: http://localhost:3001
- **MariaDB**: localhost:3316

### Ejecutar comandos dentro del contenedor:

```bash
# Ejecutar migraciones
docker compose exec api node scripts/run-migrations.js

# Ejecutar tests
docker compose exec app pnpm test

# Acceder a la shell del contenedor
docker compose exec app sh
```

### Detener los servicios:

```bash
# Detener sin eliminar volúmenes
docker compose down

# Detener y eliminar volúmenes (reinicio limpio)
docker compose down -v
```

## Producción

### Desplegar en producción:

```bash
# Construir las imágenes de producción
docker compose -f docker-compose.prod.yml build --no-cache

# Levantar los servicios
docker compose -f docker-compose.prod.yml up -d

# Verificar el estado
docker compose -f docker-compose.prod.yml ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### Servicios en producción:
- **API**: http://localhost:3000 (cambiar puerto según tu configuración)
- **Web**: http://localhost:3001 (cambiar puerto según tu configuración)
- **Scheduler**: Ejecuta tareas programadas en segundo plano
- **MariaDB**: localhost:3316

### Características de producción:

- ✅ Builds optimizados de producción
- ✅ Healthchecks para todos los servicios
- ✅ Restart automático con `unless-stopped`
- ✅ Migraciones ejecutadas automáticamente al iniciar API
- ✅ Dependencias de producción únicamente
- ✅ Multi-stage build para imágenes más ligeras

### Actualizar la aplicación en producción:

```bash
# Pull del código actualizado
git pull

# Reconstruir y actualizar
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Verificar que todo funciona
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

### Detener en producción:

```bash
# Detener servicios (mantiene datos)
docker compose -f docker-compose.prod.yml down

# Backup antes de eliminar volúmenes
docker compose -f docker-compose.prod.yml exec mariadb \
  mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > backup.sql

# Detener y limpiar todo
docker compose -f docker-compose.prod.yml down -v
```

## Monitoreo y Mantenimiento

### Ver estado de los contenedores:
```bash
docker compose ps
```

### Ver uso de recursos:
```bash
docker stats
```

### Ver logs históricos:
```bash
docker compose logs --tail=100 api
```

### Healthcheck manual:
```bash
# API
curl http://localhost:3000/health

# Web
curl http://localhost:3001
```

### Acceder a la base de datos:
```bash
# Desde el host
docker compose exec mariadb mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME}

# Desde dentro del contenedor api
docker compose exec api node -e "const db = require('./packages/shared/src/database/connection'); db.query('SELECT 1').then(console.log)"
```

## Troubleshooting

### Los contenedores no inician:
```bash
# Ver logs detallados
docker compose logs

# Verificar configuración
docker compose config

# Reiniciar limpio
docker compose down -v && docker compose up -d
```

### Error de módulos faltantes:
```bash
# Reconstruir imágenes sin cache
docker compose build --no-cache

# Eliminar volumen de node_modules
docker volume rm project_silicon-traveler_node_modules
docker compose up -d
```

### Base de datos no conecta:
```bash
# Verificar que MariaDB está healthy
docker compose ps mariadb

# Ver logs de MariaDB
docker compose logs mariadb

# Test de conexión
docker compose exec mariadb mysql -u root -p${DB_ROOT_PASSWORD} -e "SHOW DATABASES;"
```

## Arquitectura de Contenedores

### Desarrollo (docker-compose.yml):
- **mariadb**: Base de datos persistente
- **app**: Contenedor base con todas las dependencias instaladas
- **api**: API REST en modo watch (hot reload)
- **web**: Next.js dev server con hot reload
- **scheduler**: (opcional) Tareas programadas

### Producción (docker-compose.prod.yml):
- **mariadb**: Base de datos persistente
- **api**: API en modo producción con migraciones automáticas
- **web**: Next.js optimizado para producción
- **scheduler**: Tareas programadas en producción

## Variables de Entorno Requeridas

Ver `.env.example` para la lista completa de variables requeridas.

### Variables críticas para producción:
- `DB_PASSWORD`: Contraseña segura para la base de datos
- `DB_ROOT_PASSWORD`: Contraseña root de MariaDB
- `API_KEY`: Clave para autenticar peticiones a la API
- `OPENAI_API_KEY`: Clave de OpenAI
- `BRAVE_SEARCH_API_KEY`: Clave de Brave Search
- `CORS_ORIGINS`: Orígenes permitidos para CORS

## Volúmenes

- `mariadb_data`: Datos persistentes de MariaDB
- `node_modules` (solo dev): Dependencias de Node.js

**IMPORTANTE**: En producción, asegúrate de hacer backups regulares del volumen `mariadb_data`.
