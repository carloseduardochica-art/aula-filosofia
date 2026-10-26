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
| `/docente/` | Mesa del docente: verifica códigos de constancia y regenera la constancia en PDF desde el pase de avance (no enlazada en la portada) | uso del docente |
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

## Segundo ciclo · 2 créditos (`/2c/`)

Aula del plan 2020, segundo ciclo, módulo del 02/11/2026 al 14/12/2026, con la plantilla oficial de 2 créditos: ocho actividades, el mismo caso que el primer ciclo y dos bloques. Las páginas tienen sus propias claves de `localStorage`, para no mezclarse con las del primer ciclo, y leen los PDF de `/docs/`.

| Ruta | Actividad | Componente |
|---|---|---|
| `/2c/foro-b1/` | Foro sobre la clase magistral del bloque 1 (Escena 1), debate socrático con IA · cierra el 15/11 | Docencia asistida · 10 puntos |
| `/2c/hoja-1/` | Guía práctica n.º 1 · Hoja 1 del expediente, con la parte de los votos | Práctico · 10 puntos |
| `/2c/autocontrol-b1/` | Aprendizaje autónomo del bloque 1 · autocontrol de lectura (14 pestañas) | Autónomo · 15 puntos |
| `/2c/docente/` | Mesa del docente del aula de segundo ciclo | uso del docente |
