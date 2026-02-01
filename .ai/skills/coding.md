# Skill: coding.md

## Objetivo
Establecer estandares de codigo TypeScript consistentes, con SOLID y calidad mantenible.

## Alcance
- Estilo y convenciones de TypeScript.
- Principios SOLID.
- Tipado y manejo de errores.
- Testing unitario y de casos de uso.

## Entradas esperadas
- Reglas de negocio o historias de usuario.
- Contratos de entrada/salida (DTOs, puertos).
- Criterios de calidad (lint, format, test).

## Salidas esperadas
- Implementaciones de dominio y casos de uso.
- Tipos publicos claros.
- Tests relevantes.
- ADR si hay decisiones de diseno o trade-offs.

## Flujo de trabajo recomendado
1) Definir tipos y contratos publicos.
2) Implementar logica en dominio con pocas dependencias.
3) Aplicar SOLID (SRP, OCP, LSP, ISP, DIP).
4) Manejar errores con tipos explicitos y mensajes consistentes.
5) Escribir tests para reglas criticas y casos de uso.
6) Refactorizar para claridad y coherencia.

## Buenas practicas
- Evitar `any`; usar `unknown` y type narrowing.
- Preferir funciones puras en dominio.
- Inyeccion de dependencias en adaptadores/aplicacion.
- Nombres alineados con el lenguaje del negocio.
- Documentar decisiones relevantes en `.adr/`.

## Lista de comprobacion
- [ ] El codigo cumple SOLID en clases y modulos.
- [ ] Tipos publicos definidos y estables.
- [ ] No se usa `any` sin justificacion.
- [ ] Errores y resultados se manejan de forma uniforme.
- [ ] Tests cubren reglas de negocio y casos de uso.
