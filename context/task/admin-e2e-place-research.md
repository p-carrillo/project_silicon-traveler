# Investigación de ubicaciones en Admin E2E

- **Status:** Done — local implementation complete; Monotask synchronization pending approval
- **Category:** General
- **Depends on:** `admin-e2e-execution-foundation.md`, `admin-e2e-photo-batch.md`

## Source description

Añadir una entrada lateral y página de Investigación, separada del lote de fotos existente, para introducir una ciudad, resolverla con el geocodificador existente y ejecutar después la investigación real de la aplicación. Incluir un botón que rellene el campo con una ubicación aleatoria del catálogo existente.

## Outcome

Un usuario Admin en desarrollo puede resolver una ciudad con el mismo geocodificador del creador de puntos de ruta, ver sus coordenadas y consultar el resumen LLM generado desde el contenido de hasta tres páginas y sus fuentes, usando los mismos casos de uso y adaptadores de producción, sin generar fotografías ni persistir datos.

## Scope and acceptance criteria

- Mantener el lote de fotos en `/admin/e2e` como estaba y añadir una entrada lateral `Investigación` que abra `/admin/e2e/research`.
- Al lanzar una ubicación de texto libre, geocodificarla mediante el endpoint compartido de Admin antes de investigar.
- Mostrar las coordenadas resueltas y conservar el nombre, región y país canónicos en el resultado.
- Enviar a Wikipedia únicamente el nombre de la ciudad como consulta, sin región, país ni palabras clave añadidas.
- Resolver los nombres en el idioma actual de la interfaz (español o inglés), con el otro idioma como alternativa.
- Omitir valores de geocodificación ausentes como `Unknown` al formar la ubicación y la consulta de investigación.
- Añadir un botón para insertar en el campo una ubicación aleatoria del catálogo local existente.
- Mostrar la consulta exacta enviada a Wikipedia, el estado, el resumen LLM en el idioma de la interfaz, las fuentes y cualquier error del resumen.
- Usar el mismo adaptador OpenAI y el mismo caso de uso de investigación en Admin, el pipeline de fotos y el modo prompts-only.
- En producción, enviar a resumen LLM el contenido recuperado de hasta tres páginas y persistir el resumen generado mediante el flujo existente.
- Si falla el resumen LLM, continuar el pipeline con los extractos disponibles y mostrar el error del proveedor en Admin.
- Recuperar y mostrar hasta 1.200 caracteres de texto plano por cada página fuente, junto al enlace y sin añadir una petición por artículo.
- Para investigación Admin y producción, recuperar el wikitexto de hasta tres resultados en la misma petición; mostrarlo plegado bajo cada fuente en Admin y usarlo para el resumen LLM.
- Explicar si Wikipedia respondió sin páginas coincidentes o encontró páginas sin fragmentos descriptivos; mostrar los diagnósticos del proveedor cuando la solicitud falle.
- Si algo falla, mostrar una tarjeta con la fase y el motivo, con diagnóstico HTTP/proveedor útil y sin incluir credenciales.
- Reutilizar el caso de uso compartido y el adaptador real de investigación; no duplicar consultas ni persistir resultados.
- Proteger la página, la selección aleatoria y la ejecución con las mismas restricciones de desarrollo, sesión y coordinación E2E.

## Implementation plan

1. Centralizar la consulta, recuperación de páginas y resumen en el caso de uso de investigación con puertos inyectados.
2. Conectar el adaptador OpenAI existente en producción, incluido el pipeline completo de fotos y el modo prompts-only.
3. Añadir el comando E2E de investigación y selección aleatoria mediante el coordinador existente.
4. Añadir la interfaz y página de investigación separada, con traducciones en inglés y español.
5. Añadir la entrada de investigación al menú lateral de Admin, visible solo en desarrollo, y actualizar la documentación de módulo.

## Risks and decisions

- La investigación usa el conector Wikipedia configurado por la API y puede no devolver resultados; el resultado vacío se mostrará como tal.
- Si la ubicación no se puede geocodificar, se muestra el error y no se lanza una búsqueda con datos ambiguos.
- La ejecución es efímera y usa las rutas Admin E2E que solo están disponibles en desarrollo.
