# Skill: architecture.md

## Objetivo
Definir y mantener la arquitectura hexagonal por modulos en el monorepo, con limites claros, dependencias correctas y contratos estables.

## Alcance
- Estructura de carpetas y paquetes.
- Separacion de capas (dominio, aplicacion, adaptadores).
- Definicion de puertos y contratos publicos entre modulos.
- Criterios de dependencia y acoplamiento.

## Entradas esperadas
- Requisitos funcionales y no funcionales.
- Lista de modulos y sus responsabilidades.
- Integraciones externas (DB, colas, APIs, etc.).

## Salidas esperadas
- Propuesta de estructura de monorepo y layout de modulos.
- Puertos (interfaces) definidos para casos de uso e integraciones.
- Reglas de dependencia entre capas.
- ADR que documenta la decision arquitectonica.

## Flujo de trabajo recomendado
1) Identificar modulos (bounded contexts) y responsabilidades.
2) Definir capas por modulo:
   - Dominio (entidades, value objects, reglas).
   - Aplicacion (casos de uso, servicios).
   - Puertos (interfaces de entrada/salida).
   - Adaptadores (infraestructura, controllers, repositorios).
3) Establecer dependencias:
   - Dominio no depende de infraestructura.
   - Adaptadores dependen de puertos.
4) Proponer estructura de monorepo. Ejemplo orientativo:
   - apps/ (entradas: API, workers, CLI)
   - packages/ (modulos de dominio)
     - <modulo>/src/domain
     - <modulo>/src/application
     - <modulo>/src/ports
     - <modulo>/src/adapters
5) Definir contratos publicos entre modulos (DTOs y eventos).
6) Documentar la decision en `.adr/`.

## Buenas practicas
- Dominio puro: sin dependencias de framework o IO.
- Casos de uso como unidad central de orquestacion.
- Puertos como fronteras estables.
- Evitar dependencias cruzadas; integrar via puertos.
- Consistencia en nombres de capas y carpetas.
- Documentar cambios estructurales con ADR.

## Lista de comprobacion
- [ ] Se identificaron modulos con limites claros.
- [ ] Cada modulo separa dominio, aplicacion, puertos y adaptadores.
- [ ] No hay dependencias desde dominio hacia infraestructura.
- [ ] Contratos publicos entre modulos estan definidos.
- [ ] La decision arquitectonica esta registrada en `.adr/`.
