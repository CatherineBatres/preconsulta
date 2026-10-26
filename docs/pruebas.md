# Pruebas

**Pruebas unitarias** (34): revisan los ayudantes de la ficha (incluido el motivo con su tiempo de evolución, la detección de un "sí" sin detalle y el orden de los antecedentes el aviso de fotos en el mensaje de texto, la escala de intensidad, las mediciones cuándo aplica la sección gineco-obstétrica y el porcentaje de avance), las reglas de las preguntas, la ficha guardada, la edición de antecedentes y el historial, con el ejecutor de pruebas que trae Node. No necesitan navegador ni llave:

```bash
npm test
```

**Pruebas de punta a punta** (18): abren la app real en un Chrome del tamaño de un teléfono, con un micrófono simulado, y recorren:
- una primera vez que recorre el paso 1 por pantallas (con Atrás), dos rondas de preguntas con avance y ánimo, las respuestas rápidas y la marca "Sin respuesta", el PDF y el guardado en el teléfono;
- el motivo elegido con un toque ("Fiebre de 5 días de evolución"), que ninguna ronda de la IA puede cambiar;
- la repregunta cuando el paciente responde solo "sí", los botones de enfermedades y la ocupación;
- las fotos de la lesión y del medicamento: aparecen en la ficha y en el PDF, y nunca van en lo que se envía a la IA;
- las escalas del 1 al 10, las mediciones en casa y el municipio, que no se manda a la IA;
- la sección gineco-obstétrica solo en mujeres, con "Prefiero no decir", y los botones de hábitos;
- la escala de intensidad dentro de una pregunta, sin borrar lo que se escribió;
- el mapa del cuerpo, de frente y de espalda, que llena "Dónde";
- un control que carga la ficha guardada, usa la escala "¿cómo te sientes?", pregunta por la evolución y suma la visita al historial;
- la edición de antecedentes en control sin perder el historial;
- el borrado de la ficha guardada;
- en el teléfono, que la grabación no use el reconocimiento de voz;
- en computadora, la transcripción en vivo, volver a escuchar y grabar de nuevo (con un reconocimiento de voz simulado), y la grabación en un navegador sin reconocimiento de voz;
- el aviso de alarma y el mensaje de error cuando la IA llega a su límite;
- el tutorial de bienvenida (dos pruebas).

Nunca llaman a Google: `tests/gemini-falso.mjs` es un servidor pequeño que imita la API de Gemini, y Playwright apunta la app hacia él con `GOOGLE_GEMINI_BASE_URL`. La primera vez, instala el navegador de pruebas:

```bash
npx playwright install chromium
npm run test:e2e
```

El comando compila la app, levanta la IA simulada en el puerto 3222 y la app en el 3100, y corre `tests/e2e/preconsulta.spec.mjs` (flujo completo) y `tests/e2e/tutorial.spec.mjs` (tutorial de bienvenida). En `preconsulta.spec.mjs` el tutorial se marca como visto antes de cada prueba para que no tape la pantalla.

Ver también: [Volver al README](../README.es.md)
