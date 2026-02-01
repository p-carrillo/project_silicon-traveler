# Skill: database.md

## Objetivo
Definir el acceso a datos en MariaDB sin ORM, usando SQL directo y conexiones seguras y eficientes.

## Alcance
- Conexion y pooling.
- Repositorios como adaptadores de persistencia.
- Migraciones y seeds.
- Transacciones y seguridad.

## Entradas esperadas
- Esquema de datos o requisitos de persistencia.
- Reglas de negocio que impactan en consultas.
- Volumen esperado y consultas criticas.

## Salidas esperadas
- Configuracion de conexion y pool.
- Estructura de repositorios por modulo.
- Estrategia de migraciones versionadas.
- ADR para decisiones de persistencia.

## Flujo de trabajo recomendado
1) Elegir driver compatible con MariaDB (por ejemplo `mariadb` o `mysql2`).
2) Configurar pool con limites por entorno (dev/test/prod).
3) Definir repositorios como adaptadores que implementan puertos de persistencia.
4) Escribir SQL parametrizado y reusable.
5) Diseñar migraciones versionadas e idempotentes.
6) Definir transacciones para operaciones multi-paso.
7) Documentar decisiones en `.adr/`.

## Buenas practicas
- Usar queries parametrizadas para prevenir SQL injection.
- Mantener el SQL cercano al dominio (nombres de tablas y columnas coherentes).
- Indexar segun consultas criticas reales.
- Separar migraciones y seeds por entorno.
- Evitar loggear datos sensibles.

## Lista de comprobacion
- [ ] Hay pool de conexiones configurado por entorno.
- [ ] Todas las queries son parametrizadas.
- [ ] Los repositorios implementan puertos de persistencia.
- [ ] Migraciones versionadas e idempotentes.
- [ ] Transacciones definidas cuando aplica.
- [ ] Decision de persistencia documentada en `.adr/`.
