# Aula · Filosofía del Derecho

Actividades interactivas de la asignatura **Filosofía del Derecho** (UCACUE, Carrera de Derecho,
modalidad en línea, período septiembre 2026 – febrero 2027).

**Dirección publicada:** `https://carloseduardochica-art.github.io/aula-filosofia/`

| Ruta | Actividad | Componente |
|---|---|---|
| `/foro-b1/` | Foro socrático con IA · bloque 1 | CD · 5 puntos |
| `/autocontrol-b1/` | Autocontrol de lectura · bloque 1 | AA · 15 puntos |
| `/autocontrol-b2/` | Autocontrol de lectura · bloque 2 | AA · 15 puntos |
| `/lectura-b3/` | Lectura guiada · bloque 3 | formativa, sin nota |
| `/worker/` | Código del proxy de IA en Cloudflare (no se publica como página) | — |

## El worker

El foro socrático habla con Gemini a través de un Worker de Cloudflare propio de esta asignatura:

`https://aula-filosofia-ia.carloseduardochica.workers.dev`

La clave de la API **no está en este repositorio**: vive como *Secret* en el panel de Cloudflare.
El worker solo acepta peticiones desde los orígenes declarados en la variable `ORIGENES`, que
incluye `https://carloseduardochica-art.github.io`. Si el aula se mueve a otro dominio, hay que
añadirlo ahí o el navegador bloqueará las llamadas por CORS.

## Publicación

GitHub Pages, rama `main`, carpeta raíz. El archivo `.nojekyll` evita que Jekyll ignore
directorios; sin él, Pages no sirve correctamente el sitio.
