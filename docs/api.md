# API

## 1. La API de la app: `POST /api/ficha`

El navegador envía `multipart/form-data`, así el audio viaja como archivo binario y no como base64.

| Campo | Cuándo | Contenido |
| --- | --- | --- |
| `paso` | siempre | `analizar` (primera llamada) o `completar` (cada ronda de respuestas) |
| `modo` | siempre | `primera` (primera vez) o `control` (seguimiento) |
| `edad`, `sexo` | siempre | Edad y sexo, opcionales |
| `base` | `control` | La ficha base guardada, en JSON: `{ enfermedades, alergias, medicamentos, anterior: { fecha, motivo }, historial: [hasta 3 consultas] }` |
| `yaPreguntados` | siempre | Lista JSON de los campos que ya se preguntaron, para no repetirlos |
| `texto` | `analizar` | El relato escrito, hasta 4,000 caracteres |
| `audio` | `analizar` | El relato grabado (webm, mp4, ogg…) |
| `ficha` | `completar` | La ficha actual, en JSON |
| `respuestas` | `completar` | Lista JSON de `{ campo, pregunta, respuesta }` |
| `audio_0` … `audio_4` | `completar` | Una respuesta hablada opcional por pregunta |

Pruébala desde una terminal mientras corre `npm run dev`:

```bash
curl -X POST http://localhost:3000/api/ficha \
  -F paso=analizar -F modo=primera -F edad=34 -F sexo=Femenino \
  -F "texto=Desde hace tres días me duele la cabeza por las tardes"
# para agregar una grabación:  -F "audio=@relato.webm;type=audio/webm"
```

Respuesta:

```json
{
  "transcripcion": "",
  "alarma": "",
  "ficha": { "motivo": "Dolor de cabeza por las tardes", "inicio": "Hace tres días", "duracion": "", "...": "..." },
  "preguntas": [
    { "campo": "duracion", "pregunta": "¿Cuánto tiempo te dura el dolor cada vez?" },
    { "campo": "intensidad", "pregunta": "Del 1 al 10, ¿qué tan fuerte es el dolor?" }
  ]
}
```

Cuando `completar` devuelve la lista `preguntas` vacía, la ficha está completa.

Los errores llegan como `{ "error": "<mensaje>" }` con estado `400` (nada que analizar), `413` (más de 4 MB de audio en total), `429` (límite de uso de la IA), `500` (falta `GEMINI_API_KEY`) o `502` (falló la llamada a la IA).

## 2. La API de Gemini (solo en el servidor)

La ruta usa el SDK oficial de Google, [`@google/genai`](https://www.npmjs.com/package/@google/genai), y su Interactions API:

```js
import { GoogleGenAI } from "@google/genai";

const ia = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const interaccion = await ia.interactions.create({
  model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  system_instruction: INSTRUCCIONES,          // reglas: no diagnosticar, usar solo lo dicho...
  input: [
    { type: "text", text: "PASO: analizar\nDatos del paciente: ..." },
    { type: "audio", data: audioBase64, mime_type: "audio/webm" },
  ],
  response_format: { type: "text", mime_type: "application/json", schema: ESQUEMA },
  generation_config: { thinking_level: "low" }, // respuestas más rápidas
  store: false,                                 // que Google no conserve la conversación
});
const salida = JSON.parse(interaccion.output_text);
```

`ESQUEMA` es un esquema JSON armado a partir de `lib/ficha.js` con cuatro campos: `transcripcion`, `alarma`, `ficha` (15 campos de texto) y `preguntas` (hasta 5 `{ campo, pregunta }`, donde `campo` debe ser uno de los campos de la ficha). Pedir un esquema en vez de texto libre es lo que hace que cada ficha regrese con las mismas secciones, en el mismo orden, y ligar cada pregunta a un campo es lo que permite seguir preguntando hasta completar la ficha.

## 3. APIs del navegador

| API | Para qué |
| --- | --- |
| `navigator.mediaDevices.getUserMedia` + `MediaRecorder` | Grabar los audios |
| `SpeechRecognition` / `webkitSpeechRecognition` (Web Speech API) | Mostrar las palabras en vivo mientras el paciente habla |
| `navigator.share({ files: [pdf] })` (Web Share API) | Abrir el menú de compartir del teléfono con el PDF adjunto; si no está disponible, se descarga |
| `https://wa.me/?text=…` | Enviar la ficha como texto por WhatsApp (el paciente elige el contacto) |
| `mailto:?subject=…&body=…` | Enviar la ficha por correo |

Ver también: [Arquitectura](arquitectura.md) · [Volver al README](../README.es.md)
