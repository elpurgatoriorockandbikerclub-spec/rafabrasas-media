# Medios públicos de Rafabrasas

Este repositorio contiene exclusivamente los archivos enumerados en `approved.json`. Los originales privados, borradores, respaldos y contenidos editoriales permanecen en la fuente principal de Rafabrasas. La publicación pública sigue en [media.rafabrasas.com](https://media.rafabrasas.com); GitHub es un paso de entrega para que las rondas Work no dependan del PC.

Una actualización debe añadir el medio aprobado y su ruta, tamaño y SHA-256 a `approved.json` **en el mismo commit**. El flujo comprueba todos los archivos, rechaza borrados o cambios de medios publicados, prepara el catálogo completo y lo despliega en el proyecto Cloudflare Pages Free existente. Se debe esperar el resultado correcto del flujo y verificar la descarga pública y el hash antes de publicar la noticia en Sites. Mantener sincronizado el manifiesto `media-pages/approved.json` de la fuente principal.

El secreto `CLOUDFLARE_API_TOKEN` solo está disponible para los flujos de este repositorio y no figura en archivos. El flujo usa el runner estándar gratuito de un repositorio público, solo activos estáticos, sin Pages Functions, R2 ni Workers nuevos.

El 4 de noviembre de 2026 se comprobó desde una ejecución Work independiente el acceso de lectura a Sites, al Excel original y al catálogo de medios. La escritura GitHub se verificó con este cambio de documentación; la subida de un medio nuevo y la publicación en Sites quedan pendientes de probar en una ronda real.
