# Pruebas

**Pruebas unitarias** (22): revisan los ayudantes de la ficha, las reglas de las preguntas, la ficha guardada y el historial, con el ejecutor de pruebas que trae Node. No necesitan navegador ni llave:

```bash
npm test
```

**Pruebas de punta a punta** (7): abren la app real en un Chrome del tamaño de un teléfono, con un micrófono simulado, y recorren: una primera vez con dos rondas de preguntas, las respuestas rápidas y la marca "Sin respuesta", el PDF y el guardado en el teléfono; un control que carga la ficha guardada, pregunta por la evolución y suma la visita al historial; el borrado de la ficha guardada; la transcripción en vivo, volver a escuchar y grabar de nuevo (con un reconocimiento de voz simulado); la grabación en un navegador sin reconocimiento de voz; el aviso de alarma; y el mensaje de error cuando la IA llega a su límite.

Nunca llaman a Google: `tests/gemini-falso.mjs` es un servidor pequeño que imita la API de Gemini, y Playwright apunta la app hacia él con `GOOGLE_GEMINI_BASE_URL`. La primera vez, instala el navegador de pruebas:

```bash
npx playwright install chromium
npm run test:e2e
```

El comando compila la app, levanta la IA simulada en el puerto 3222 y la app en el 3100, y corre `tests/e2e/preconsulta.spec.mjs`.

Ver también: [Volver al README](../README.es.md)
