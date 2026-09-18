# El Worker de IA · Filosofía del Derecho

**Universidad Católica de Cuenca · Carrera de Derecho**

Puerta al modelo para el foro socrático del bloque 1. Hermano del de Derecho
Mercantil: mismo contrato, mismos topes, mismo modelo. Lo único que cambia es el
nombre y los orígenes autorizados.

> ## ⬜ PENDIENTE DE PUBLICAR
>
> **URL prevista:** `https://aula-filosofia-ia.TU-SUBDOMINIO.workers.dev`
>
> Mientras no se publique, la línea `WORKER_URL` de
> `TAREAS/Bloque_1/Foro_Socratico_B1.html` lleva un marcador `TU-SUBDOMINIO` y
> el foro no puede contactar al contradictor.

---

## Lo que ya aprendimos en Mercantil, y aquí no hay que volver a aprender

**El modelo.** El código de Mercantil traía por defecto `gemini-2.5-flash` y la
llamada devolvía **502**. Hubo que declarar la variable `MODELO` para que
funcionara, y quien responde de verdad es **`gemini-3.8-flash`**. Este Worker
nace ya con ese valor por defecto. Si algún día vuelve a fallar con 502, el
primer sospechoso es el nombre del modelo, no la clave.

**El presupuesto de salida.** `maxOutputTokens` no es el tamaño de la respuesta:
es el presupuesto que el modelo reparte entre **lo que piensa y lo que escribe**.
En Mercantil, con 1400 la ronda final se rompía —el razonamiento se llevaba el
presupuesto y el dictamen salía cortado—. Se corrigió a **4000** el 14-IX-2026.
Aquí nace con 4000. **No bajarlo.**

**Probar con doble clic no funciona.** Un archivo abierto desde el disco manda
origen `null` y el Worker lo rechaza, como debe. Hay que servir la carpeta por
HTTP. **Y el servidor debe arrancar DENTRO de la carpeta del aula**, no en la
carpeta del usuario: `python -m http.server` sirve el directorio donde se
ejecuta, de modo que si arranca en la carpeta personal la ruta al foro queda
larguísima.

```bash
cd "C:\Users\carlo\OneDrive\Desktop\UCACUE\FILOSOFIA DEL DERECHO\TAREAS"
python -m http.server 8000
```

Con el servidor así, el foro queda en una URL corta:

```
http://localhost:8000/Bloque_1/Foro_Socratico_B1.html
```

Ese origen, `http://localhost:8000`, es el que está en la lista por defecto del
Worker. Para detener el servidor: Ctrl+C en esa ventana.

> Nota: en una versión anterior de este README la última línea decía «abra
> `http://localhost:8000/...`». Los tres puntos eran un etcétera, no parte de la
> dirección. Pegados literalmente devuelven un 404: el servidor busca un archivo
> llamado `...` y no lo encuentra.

---

## Montarlo desde el panel de Cloudflare · vía recomendada

No hace falta instalar nada. Es un solo archivo y el panel lo admite pegado.

> **Por qué esta vía y no `npm install -g wrangler`.** En Windows, `npm` es un
> script `.ps1` y PowerShell trae bloqueada la ejecución de scripts, así que
> devuelve *«No se puede cargar el archivo npm.ps1 porque la ejecución de
> scripts está deshabilitada en este sistema»*. Se puede rodear llamando a
> `npm.cmd install -g wrangler`, o levantando la política con
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. Pero para un Worker de
> un archivo, el panel es más rápido y no deja nada instalado en el equipo.

**1. Crear el Worker**

Entrar en `dash.cloudflare.com` → **Workers & Pages** → **Create** →
**Create Worker**. Ponerle de nombre `aula-filosofia-ia` y pulsar **Deploy**.
Cloudflare crea un Worker de ejemplo que dice «Hello World». No importa: se
sustituye en el paso siguiente.

**2. Pegar el código**

En el Worker recién creado, **Edit code** (o *Quick edit*). Se abre un editor con
el ejemplo. Borrar todo su contenido y pegar **el archivo completo**
`src/worker.js` de esta misma carpeta. Después, **Deploy**.

**3. Cargar la clave como secreto**

En el Worker → **Settings** → **Variables and Secrets** → **Add**.

| Tipo | Nombre | Valor |
|---|---|---|
| **Secret** | `GEMINI_API_KEY` | la clave de la API de Gemini |
| **Text** (variable normal) | `MODELO` | `gemini-3.8-flash` |

La clave va como **Secret**, no como variable de texto: así queda oculta y no se
puede volver a leer desde el panel. **Nunca se escribe en `wrangler.toml` ni en
ningún archivo de esta carpeta.**

`MODELO` sí es una variable normal. Aunque el código ya trae ese valor por
defecto, en Mercantil solo funcionó al declararlo explícitamente; conviene
declararlo aquí también.

Guardar y volver a desplegar si el panel lo pide.

**4. Copiar la URL**

Está en la portada del Worker, con forma
`https://aula-filosofia-ia.ALGO.workers.dev`.

**5. Pegarla en el foro**

En `TAREAS/Bloque_1/Foro_Socratico_B1.html`, sustituir:

```js
const WORKER_URL = "https://aula-filosofia-ia.TU-SUBDOMINIO.workers.dev";
```

por la URL real.

**6. Comprobar que responde**

Desde PowerShell, sin necesidad de curl:

```powershell
Invoke-WebRequest -Uri "https://aula-filosofia-ia.ALGO.workers.dev" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "Origin" = "http://localhost:8000" } `
  -Body '{"contents":[{"role":"user","parts":[{"text":"Responde solo: listo"}]}]}'
```

Debe devolver `200` y un JSON con `candidates[0].content.parts[0].text`.

Las otras cuatro comprobaciones, las mismas que se hicieron en Mercantil:

| Prueba | Debe dar |
|---|---|
| `GET` a la URL | 405 |
| `POST` sin cabecera `Origin` | 403 |
| `OPTIONS` con origen autorizado | 204 |
| `POST` con un origen ajeno | 403 |

---

## Si algún día se prefiere la línea de comandos

Con `wrangler` instalado y desde esta carpeta:

```powershell
npm.cmd install -g wrangler
wrangler login
wrangler secret put GEMINI_API_KEY
wrangler deploy
```

El archivo `wrangler.toml` de esta carpeta ya trae el nombre, el punto de
entrada y la variable `MODELO`, así que no hay que configurar nada más.

---

## Antes de abrir el período

Poner el dominio real del aula en la variable `ORIGENES`:

```
ORIGENES = https://carloseduardochica-art.github.io,http://localhost:8000
```

Si el aula se publica en otro dominio, hay que añadirlo aquí o el foro dará 403.
Mientras no se declare la variable, rigen esos dos valores, que son los del
código.

---

## Sobre el gasto

**Si usa la misma clave en las dos materias, el consumo se suma en la misma
cuenta.** El Worker separado no separa la factura: separa el servicio. Eso es
bueno —si una materia satura o falla, la otra sigue— pero para ver el gasto por
asignatura harían falta dos claves de dos proyectos distintos.

**Cuánto consume un foro.** Cada estudiante hace cuatro llamadas. En cada una
viaja el mandato completo (unos 1 500 tokens) más todo el hilo acumulado hasta
ese momento. Un debate entero, de punta a punta, ronda los **20 000 a 25 000
tokens de entrada** y unos **4 000 a 5 000 de salida**, contando que la ronda
final razona antes de emitir el dictamen.

Para un curso de cuarenta estudiantes, un foro completo son del orden de **un
millón de tokens de entrada y doscientos mil de salida**. Multiplique por la
tarifa vigente de la familia Flash, que es la barata, para tener la cifra en
dólares. Con ocho dólares de saldo hay margen holgado para un foro por materia;
conviene igualmente mirar el consumo real después de los primeros diez
estudiantes y extrapolar.

**Tres cosas que ya reducen el gasto y conviene no tocar:**

- el modelo es de la familia **Flash**, no Pro;
- el tope de entrada (120 KB) corta cualquier intento de usar la puerta para
  otra cosa;
- el foro es de **una sola sesión**: si el estudiante cierra la página, empieza
  de cero, y eso impide hilos infinitos.

**Si el saldo se agota** el aula mostrará `HTTP 429`. El Worker no oculta el
error: lo reenvía tal cual, con su código y su cuerpo, para que se sepa de
inmediato qué pasó.

---

## Qué hace el Worker, en una frase

Recibe del aula `{ systemInstruction, contents, generationConfig }`, le añade la
clave, el modelo, los filtros y el tope de salida, y devuelve **la respuesta
nativa de Gemini sin transformar**. El chasis del foro ya sabe leer esa forma —
juntar todas las partes, detectar `MAX_TOKENS`— de modo que no hay que tocar el
HTML.
