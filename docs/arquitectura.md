# Arquitectura

## Qué corre dónde y por qué

![Qué corre dónde: el teléfono del paciente, el servidor en Vercel y Gemini en Google](img/arquitectura-es.png)

| Parte | Dónde corre | Por qué ahí |
| --- | --- | --- |
| Pantallas (`app/page.js`) | Navegador del paciente | La app se abre con un enlace en cualquier teléfono, sin instalar nada |
| Tutorial (`app/tutorial.js`) | Navegador del paciente | Aparece solo la primera vez (se recuerda en `localStorage`, clave `preconsulta.tutorialVisto`) y se vuelve a abrir con "¿Cómo funciona?" |
| Grabadora (`app/grabadora.js`) | Navegador del paciente | El navegador ya trae una API de micrófono (`MediaRecorder`) |
| Transcripción en vivo (solo computadora) | Reconocimiento de voz del navegador (Chrome lo envía a Google, Safari a Apple) | Gratis e inmediata; solo guía al paciente, la IA siempre trabaja con el audio grabado. En teléfonos se apaga ([decisión 8](decisiones.md#8-sin-transcripción-en-vivo-en-teléfonos-20-de-octubre-de-2026)) |
| Escalas (`app/escala.js`) | Navegador del paciente | Botones del 1 al 10 para la intensidad y de "Mucho peor" a "Mucho mejor" para la evolución; lo elegido se escribe en la ficha y la IA no lo cambia |
| Fotos (`app/fotos.js`) | Navegador del paciente | Se achican a JPEG en el teléfono y solo van dentro del PDF: no se envían a la IA ni se guardan ([decisión 10](decisiones.md#10-fotos-solo-dentro-del-pdf-26-de-octubre-de-2026)) |
| PDF (`lib/pdf.js`) | Navegador del paciente | La ficha no necesita volver a un servidor para convertirse en archivo |
| Compartir | Navegador y apps del paciente | Se envía desde la cuenta de WhatsApp o correo del propio paciente |
| Ficha base e historial (`lib/almacen.js`) | Navegador del paciente (`localStorage`) | El control necesita las consultas anteriores, y guardarlas en el teléfono evita una base de datos con información de salud |
| Ruta `/api/ficha` (`app/api/ficha/route.js`) | Vercel, como función serverless | Es el único lugar que conoce la llave de la API |
| `GEMINI_API_KEY` | Variables de entorno de Vercel (`.env.local` en tu computadora) | Todo lo que está en el navegador lo puede leer cualquiera; la llave debe quedarse en el servidor |
| Modelo de IA `gemini-3.8-flash` | Servidores de Google, por medio de la API de Gemini | Entiende audio y texto en una sola llamada y devuelve JSON estructurado |

Enviar lo mínimo es parte del diseño: **el nombre, el contacto, el municipio y las fotos nunca salen del teléfono**, salvo dentro del PDF que el paciente comparte. A la IA solo llegan la edad, el sexo, la ocupación, lo que se eligió con un toque (motivo, intensidad, cómo se siente), las mediciones de casa, el relato, las respuestas y, en un control, las enfermedades, alergias y medicamentos guardados y un resumen de hasta 3 consultas anteriores; cada llamada le pide a Google no conservar la conversación (`store: false`). No hay base de datos: la ficha base y el historial viven solo en el navegador del paciente, solo si presiona **Guardar en este teléfono**, y puede borrarla cuando quiera.

### El viaje de un audio

Cada ficha usa una llamada a la IA para entender el relato y hacer la primera ronda de preguntas, y una más por cada ronda de respuestas (máximo tres rondas).

![Secuencia de llamadas desde el botón Grabar hasta el PDF del médico](img/flujo-es.png)

## Cómo se llama al componente local

"Local" aquí es el código que corre en el dispositivo del paciente. La página lo usa como cualquier función o componente de React, sin pasar por la red.

**Grabadora**: un componente de React que envuelve `getUserMedia` + `MediaRecorder` y devuelve el audio:

```jsx
import Grabadora from "./grabadora";

<Grabadora
  audio={audio}                 // { blob, url, tipo, duracion, transcripcion } o null
  onAudio={setAudio}            // se llama al detener una grabación, o con null al borrarla
  maxSegundos={45}              // se detiene sola al llegar al límite (por defecto 120)
/>
```

Graba en el primer formato que acepte el navegador (`audio/webm` en Chrome y Android, `audio/mp4` en Safari/iPhone). En computadora, al mismo tiempo usa el reconocimiento de voz del navegador (`SpeechRecognition`, idioma `es-GT`) y muestra las palabras mientras se dicen; el texto final se agrega al audio como `transcripcion`. En teléfonos (`esTelefono()`) no lo usa, porque compartir el micrófono puede cortar la grabación, y muestra "Te estamos escuchando". Al detener, el paciente puede escuchar la grabación, **Grabar de nuevo** o **Borrar**. Si el navegador no tiene reconocimiento de voz, o falla, la grabación funciona igual y una nota lo avisa. Para apagar la transcripción en vivo en todos lados, cambia `TRANSCRIPCION_EN_VIVO = false` al inicio del archivo.

**PDF**: una función asíncrona que devuelve un `File`:

```js
import { crearArchivoPdf, precargarPdf } from "@/lib/pdf";

precargarPdf();                                     // opcional: descarga jsPDF por adelantado
const archivo = await crearArchivoPdf(datos, ficha, { modo, anterior }); // File application/pdf
```

`datos` es `{ nombre, edad, sexo, contacto }` y `ficha` es el objeto de la ficha descrito abajo. Opcional: `{ modo, anterior }` para el PDF de control.

**Ficha guardada e historial**: cuatro funciones sobre `localStorage`, protegidas para que un navegador en modo privado o bloqueado nunca rompa la app:

```js
import { guardarFicha, leerFichaGuardada, actualizarBase, borrarFichaGuardada } from "@/lib/almacen";

guardarFicha(datos, ficha, modo); // guarda datos y ficha base, y agrega esta consulta al historial
leerFichaGuardada();              // { datos, base, historial: [...], anterior } o null
actualizarBase({ medicamentos }); // cambia enfermedades, alergias o medicamentos sin tocar el historial
borrarFichaGuardada();            // borra todo
```

Cada consulta del historial es `{ fecha, modo, motivo, evolucion, tratamiento }`; se guardan las últimas 10 y `anterior` es la más reciente. Lo guardado con la versión anterior de la app (solo la última consulta) se convierte solo al formato nuevo, sin perder nada. En la pantalla, el botón **Editar** de "Tu ficha guardada" usa `actualizarBase`.

"No sabe", "No aplica" y "Sin respuesta" no se guardan, así que esos campos se vuelven a preguntar la próxima vez.

**Ayudantes de la ficha**: `lib/ficha.js` define una sola vez las secciones y campos, para que el esquema de la IA, la pantalla y el PDF siempre coincidan. La sección *Evolución desde la consulta anterior* solo existe en el modo control:

```js
import { SECCIONES, CAMPOS, fichaVacia, normalizarFicha, fichaComoTexto } from "@/lib/ficha";

seccionesPara("control");                           // secciones de un modo ("primera" o "control")
fichaComoTexto(datos, ficha, { modo, anterior });   // texto para WhatsApp (*negritas* en títulos)
fichaComoTexto(datos, ficha, { negritas: false });  // texto simple para correo
aplicarRespuestas(ficha, respondidas, { final: true }); // escribe "No sabe", "No aplica" y "Sin respuesta"
```

**Reglas de las preguntas**: `lib/preguntas.js` decide qué preguntas de la IA llegan al paciente: solo de campos que siguen vacíos, nunca repetidas, válidas para el modo, ordenadas por prioridad y máximo cinco. En un control permite además una pregunta para confirmar los medicamentos guardados.

Con `npm run dev`, la parte del servidor también corre en tu computadora, en `http://localhost:3000/api/ficha`.

Ver también: [API](api.md) · [Decisiones](decisiones.md) · [Volver al README](../README.es.md)
