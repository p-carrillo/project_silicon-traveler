# Skill: database.md

## Objective
Define data access for MariaDB without an ORM, using direct SQL and safe, efficient connections.

## Scope
- Connection and pooling.
- Repositories as persistence adapters.
- Migrations and seeds.
- Transactions and security.

## Expected inputs
- Data schema or persistence requirements.
- Business rules that affect queries.
- Expected volume and critical queries.

## Expected outputs
- Connection and pool configuration.
- Repository structure per module.
- Versioned migration strategy.
- ADR for persistence decisions.

## Recommended workflow
1) Choose a MariaDB-compatible driver (for example `mariadb` or `mysql2`).
2) Configure the pool with per-environment limits (dev/test/prod).
3) Define repositories as adapters implementing persistence ports.
4) Write parameterized, reusable SQL.
5) Design versioned, idempotent migrations.
6) Define transactions for multi-step operations.
7) Document decisions in `.adr/`.

## Best practices
- Use parameterized queries to prevent SQL injection.
- Keep SQL close to the domain (consistent table/column naming).
- Index based on real critical queries.
- Separate migrations and seeds per environment.
- Avoid logging sensitive data.

## Checklist
- [ ] A connection pool is configured per environment.
- [ ] All queries are parameterized.
- [ ] Repositories implement persistence ports.
- [ ] Migrations are versioned and idempotent.
- [ ] Transactions are defined where needed.
- [ ] Persistence decisions are documented in `.adr/`.
