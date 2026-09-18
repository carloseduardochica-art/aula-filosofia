/**
 * Puerta al modelo · Filosofía del Derecho
 * Universidad Católica de Cuenca · Carrera de Derecho
 *
 * Hermano del Worker de Derecho Mercantil y Societario. Mismo contrato, mismos
 * topes, mismo modelo. Lo único que cambia es el nombre y los orígenes.
 *
 * Existe por una razón: la clave de la API no puede viajar al navegador del
 * estudiante. Aquí se guarda como secreto de Cloudflare y nunca sale.
 *
 * Lo que decide el servidor y el estudiante NO puede cambiar:
 *   - de dónde puede venir la petición (ORIGENES);
 *   - qué modelo se usa;
 *   - los filtros de seguridad;
 *   - el tamaño de lo que se envía y de lo que se devuelve.
 * Lo que un estudiante mande en `safetySettings` o en `model` se ignora.
 *
 * Variables que hay que configurar en Cloudflare
 * ----------------------------------------------
 *   GEMINI_API_KEY   (Secret)    la clave. Nunca como variable normal.
 *   MODELO           (Variable)  opcional. Por defecto gemini-3.8-flash.
 *   ORIGENES         (Variable)  opcional. Lista separada por comas.
 *
 * Contrato con el foro (idéntico al de Mercantil, para que el chasis funcione
 * sin tocar una línea):
 *   POST { systemInstruction, contents, generationConfig } -> respuesta NATIVA
 *   de Gemini, sin transformar.
 */

// El código de Mercantil traía por defecto gemini-2.5-flash y devolvía 502.
// Hubo que declarar la variable MODELO para que funcionara. Aquí se pone
// directamente el que quedó sirviendo, para no repetir el diagnóstico.
const MODELO_POR_DEFECTO = 'gemini-3.8-flash';

// Si no se define la variable ORIGENES, valen estos. El primero es el aula
// publicada; el segundo permite probar en local con `python -m http.server`.
// OJO: abrir el foro con doble clic NO funciona. Un archivo local manda
// origen `null` y el Worker lo rechaza, como debe.
const ORIGENES_POR_DEFECTO = [
  'https://carloseduardochica-art.github.io',
  'http://localhost:8000',
];

// Topes. El foro de Filosofía pide entre 300 y 1400 caracteres por turno y son
// 4 rondas: una conversación honesta no se acerca a estos números.
const MAX_CUERPO_BYTES = 120 * 1024;
const MAX_TURNOS = 40;

// CUIDADO CON ESTE NÚMERO.
//
// `maxOutputTokens` NO es el tamaño de la respuesta: es el presupuesto que el
// modelo reparte entre lo que piensa y lo que escribe. gemini-3.8-flash razona
// antes de responder, y ese razonamiento come del mismo saco.
//
// En el aula de Mercantil, con 1400 la ronda final se rompía: el razonamiento
// se llevaba el presupuesto y el dictamen salía cortado o vacío. Se corrigió a
// 4000 el 14-IX-2026. Aquí nace ya con 4000. No bajarlo.
//
// Y no encarece las rondas normales: el modelo para cuando termina de escribir,
// no cuando llega al tope.
const MAX_TOKENS_SALIDA = 4000;

// Se imponen aquí, no en la página. BLOCK_NONE dejaría el modelo abierto a que
// un estudiante lo desvíe del debate. BLOCK_ONLY_HIGH no estorba a una
// discusión de filosofía del Derecho —que toca la ley injusta, la desobediencia
// y el régimen nazi— y sigue cortando lo que no tiene defensa.
const FILTROS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

function origenes(env) {
  if (!env.ORIGENES) return ORIGENES_POR_DEFECTO;
  return env.ORIGENES.split(',').map((s) => s.trim()).filter(Boolean);
}

function cabeceras(origen) {
  return {
    'Access-Control-Allow-Origin': origen,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function error(mensaje, codigo, origen) {
  return new Response(JSON.stringify({ error: mensaje }), {
    status: codigo,
    headers: origen
      ? { 'Content-Type': 'application/json', ...cabeceras(origen) }
      : { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    const origen = request.headers.get('Origin') || '';
    const autorizado = origenes(env).includes(origen);

    if (request.method === 'OPTIONS') {
      if (!autorizado) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cabeceras(origen) });
    }
    if (request.method !== 'POST') {
      return error('Solo se admite POST.', 405, autorizado ? origen : '');
    }
    if (!autorizado) {
      return error('Origen no autorizado para esta aula.', 403, '');
    }
    if (!env.GEMINI_API_KEY) {
      return error('El Worker no tiene configurada la clave del modelo.', 500, origen);
    }

    const crudo = await request.text();
    if (crudo.length > MAX_CUERPO_BYTES) {
      return error('La petición excede el tamaño admitido.', 413, origen);
    }

    let cuerpo;
    try {
      cuerpo = JSON.parse(crudo);
    } catch {
      return error('El cuerpo no es JSON válido.', 400, origen);
    }
    if (!Array.isArray(cuerpo.contents) || cuerpo.contents.length === 0) {
      return error('Falta el hilo de la conversación.', 400, origen);
    }
    if (cuerpo.contents.length > MAX_TURNOS) {
      return error('El hilo tiene demasiados turnos.', 413, origen);
    }

    // Se arma la carga desde cero. Nada que no esté aquí pasa al modelo.
    const carga = {
      contents: cuerpo.contents,
      generationConfig: {
        temperature: Number(cuerpo?.generationConfig?.temperature) || 0.35,
        maxOutputTokens: MAX_TOKENS_SALIDA,
      },
      safetySettings: FILTROS,
    };
    if (cuerpo.systemInstruction) carga.systemInstruction = cuerpo.systemInstruction;

    const modelo = env.MODELO || MODELO_POR_DEFECTO;
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

    let respuesta;
    try {
      respuesta = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify(carga),
      });
    } catch (e) {
      return error('No se pudo contactar con el modelo: ' + e.message, 502, origen);
    }

    // Se reenvía tal cual, con su mismo código. Si el modelo falla, el aula
    // muestra el error real y no un «algo salió mal» que no ayuda a nadie a las
    // once de la noche de un domingo.
    const texto = await respuesta.text();
    return new Response(texto, {
      status: respuesta.status,
      headers: { 'Content-Type': 'application/json', ...cabeceras(origen) },
    });
  },
};
