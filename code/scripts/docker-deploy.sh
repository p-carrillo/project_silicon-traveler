#!/bin/bash
set -e

# Script para desplegar Silicon Traveler

ENV=${1:-development}
ACTION=${2:-up}

if [ "$ENV" = "production" ] || [ "$ENV" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "🚀 Desplegando en modo PRODUCCIÓN"
else
    COMPOSE_FILE="docker-compose.yml"
    echo "🔧 Desplegando en modo DESARROLLO"
fi

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "   Copia .env.example a .env y configura las variables:"
    echo "   cp .env.example .env"
    exit 1
fi

case "$ACTION" in
    up|start)
        echo "📦 Construyendo imágenes..."
        docker compose -f $COMPOSE_FILE build
        
        echo "🚀 Iniciando servicios..."
        docker compose -f $COMPOSE_FILE up -d
        
        echo "⏳ Esperando a que los servicios estén listos..."
        sleep 5
        
        echo "📊 Estado de los contenedores:"
        docker compose -f $COMPOSE_FILE ps
        
        echo ""
        echo "✅ Servicios iniciados correctamente"
        
        if [ "$ENV" = "development" ]; then
            echo "   API: http://localhost:3000"
            echo "   Web: http://localhost:3001"
            echo "   MariaDB: localhost:3316"
        fi
        
        echo ""
        echo "Ver logs: docker compose -f $COMPOSE_FILE logs -f"
        ;;
        
    down|stop)
        echo "⏹️  Deteniendo servicios..."
        docker compose -f $COMPOSE_FILE down
        echo "✅ Servicios detenidos"
        ;;
        
    restart)
        echo "♻️  Reiniciando servicios..."
        docker compose -f $COMPOSE_FILE down
        docker compose -f $COMPOSE_FILE up -d
        echo "✅ Servicios reiniciados"
        ;;
        
    rebuild)
        echo "🔨 Reconstruyendo desde cero..."
        docker compose -f $COMPOSE_FILE down -v
        docker compose -f $COMPOSE_FILE build --no-cache
        docker compose -f $COMPOSE_FILE up -d
        echo "✅ Reconstrucción completada"
        ;;
        
    logs)
        docker compose -f $COMPOSE_FILE logs -f
        ;;
        
    ps|status)
        docker compose -f $COMPOSE_FILE ps
        ;;
        
    *)
        echo "Uso: $0 [environment] [action]"
        echo ""
        echo "Environments:"
        echo "  development|dev    - Modo desarrollo (default)"
        echo "  production|prod    - Modo producción"
        echo ""
        echo "Actions:"
        echo "  up|start          - Construir e iniciar servicios (default)"
        echo "  down|stop         - Detener servicios"
        echo "  restart           - Reiniciar servicios"
        echo "  rebuild           - Reconstruir desde cero"
        echo "  logs              - Ver logs en tiempo real"
        echo "  ps|status         - Ver estado de servicios"
        echo ""
        echo "Ejemplos:"
        echo "  $0                      # Iniciar en desarrollo"
        echo "  $0 dev up               # Iniciar en desarrollo"
        echo "  $0 prod up              # Iniciar en producción"
        echo "  $0 dev logs             # Ver logs de desarrollo"
        echo "  $0 prod rebuild         # Reconstruir producción desde cero"
        exit 1
        ;;
esac
