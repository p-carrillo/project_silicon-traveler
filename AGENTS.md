# AGENTS

Este repo es un monorepo Node.js + TypeScript con arquitectura hexagonal por modulos y MariaDB sin ORM (SQL directo y conexiones). El codigo sigue el estandar mas asentado para TypeScript y aplica SOLID.

## Skills disponibles y ubicacion
Las skills viven en `.ai/skills/`:
- `.ai/skills/architecture.md`
- `.ai/skills/database.md`
- `.ai/skills/coding.md`
- `.ai/skills/readme.md`

## Orquestacion
Cuando un trabajo toque mas de un area, usa las skills en este orden:
1) `.ai/skills/architecture.md`
2) `.ai/skills/database.md`
3) `.ai/skills/coding.md`
4) `.ai/skills/readme.md`

## Reglas globales
- README: actualizar `README.md` siempre que el cambio afecte setup, arquitectura, uso, dependencias, configuracion o comandos.
- ADR: cada decision tecnica o de arquitectura debe registrarse como ADR en la carpeta `.adr/` usando el template correspondiente.
- Mantener consistencia con arquitectura hexagonal por modulos y sin ORM en MariaDB.
