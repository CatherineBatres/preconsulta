# Decisiones

Registro de las decisiones del proyecto: qué se decidió, por qué y qué se descartó. Las más recientes van primero.

## 6. La grabación no se guarda (14 de octubre de 2026)

**Contexto.** El paciente graba su relato y sus respuestas. Mientras habla ve la transcripción en vivo y al detener puede volver a escuchar. Había que decidir si vale la pena guardar la grabación después de enviarla.

**Decisión.** La grabación solo existe en la memoria del navegador mientras el paciente la revisa. Se envía a la IA para armar la ficha y luego se descarta: no se guarda en el teléfono, ni en un servidor, ni en el historial. Lo que queda es el texto de la ficha.

**Por qué.**
- Es lo mismo que hacen ChatGPT y Claude al dictarles: transcriben, muestran el texto y no conservan el audio.
- Un audio con la voz del paciente describiendo su salud es más sensible que el texto, y no aporta nada que la ficha no tenga.
- El médico lee la ficha; nadie necesita volver a escuchar el audio después de la consulta.
- Guardar audios ocuparía mucho espacio en el teléfono (cerca de 1 MB por minuto).

**Descartado.** Guardar el audio junto al historial, o adjuntarlo al PDF. Si en el feedback algún médico pide escuchar al paciente, se reconsidera.

## 5. Historial de consultas en el teléfono, no en una base de datos (14 de octubre de 2026)

**Contexto.** El seguimiento necesita la ficha base (enfermedades, alergias, medicamentos) y las consultas anteriores. Las opciones eran `localStorage`, Firebase o Supabase.

**Decisión.** Se guarda en `localStorage` del navegador: los datos generales, la ficha base y las últimas 10 consultas (fecha, tipo, motivo, evolución y tratamiento). Solo si el paciente presiona **Guardar en este teléfono**, y puede borrarlo cuando quiera.

**Por qué.**
- No requiere cuentas ni contraseñas: la entrada sigue siendo lo más simple posible.
- No hay una base de datos con información de salud que proteger, respaldar o borrar.
- Se construye y prueba en días, no semanas.

**Costo aceptado.** Si el paciente cambia de teléfono o de navegador, o borra los datos del sitio, empieza de cero.

**Se reconsidera si** el feedback muestra que los pacientes necesitan usarla en varios dispositivos o que el médico quiere ver el historial. Entonces Supabase o Firebase, con cuentas y consentimiento explícito.

## 4. Preguntas ligadas a campos de la ficha (13 de octubre de 2026)

La IA debe indicar qué campo completa cada pregunta. Así la app puede seguir preguntando por rondas hasta llenar la ficha, nunca repite una pregunta y distingue "No referido" (nadie lo preguntó) de "Sin respuesta" (se preguntó y quedó en blanco).

## 3. Un esquema JSON fijo para la respuesta de la IA (11 de octubre de 2026)

En lugar de pedir un resumen en texto libre, la IA responde con un esquema JSON con los mismos campos siempre. La pantalla, el PDF y el texto para WhatsApp saben dónde va cada dato, y la ficha no cambia de forma de un paciente a otro.

## 2. Un solo proveedor para audio y razonamiento (11 de octubre de 2026)

Gemini entiende el audio directamente, así que no hace falta un servicio aparte de voz a texto. Menos piezas, menos llaves y menos lugares por donde pasan los datos.

## 1. Next.js en Vercel en lugar de Streamlit (8 de octubre de 2026)

El primer prototipo fue en Streamlit (Python). Se cambió al segundo día porque la meta era un enlace público que funcionara bien en teléfonos: las apps gratuitas de Streamlit se duermen cuando nadie las usa y el diseño en móvil se controla poco. Next.js permite tener las pantallas y la ruta de servidor (la única que conoce la llave) en un mismo proyecto, y Vercel publica una versión nueva con cada `git push`.

---

Ver también: [Arquitectura](arquitectura.md) · [Volver al README](../README.es.md)
