# Decisiones

Registro de las decisiones del proyecto: qué se decidió, por qué y qué se descartó. Las más recientes van primero.

## 8. Sin transcripción en vivo en teléfonos (20 de octubre de 2026)

**Contexto.** En la revisión del 14 de octubre se señaló un riesgo (Issue #2): en Android Chrome y en iPhone Safari, usar el reconocimiento de voz del navegador al mismo tiempo que la grabación puede cortar o silenciar el audio, porque los dos usan el micrófono. Ese audio es lo que la IA usa para armar la ficha.

**Decisión.** En teléfonos la app solo graba: no muestra el texto mientras se habla, y en su lugar dice "Te estamos escuchando". En computadora la transcripción en vivo sigue igual. El paciente puede escuchar su grabación y repetirla en los dos casos.

**Por qué.** Lo importante es que el audio llegue completo a Gemini; el texto en vivo era solo una guía. Casi todos los pacientes van a usar la app desde el teléfono, así que ahí no vale la pena el riesgo.

**Qué se descartó.** Detectar si el audio salió cortado y avisar después (complica la app y el paciente tendría que repetir), y apagar la transcripción en todos lados (en computadora funciona bien).

**Cómo se verifica.** Grabar una consulta de control de 30 segundos desde un teléfono real con Gemini y revisar que la ficha salga completa.

## 7. El motivo de consulta se elige con un toque, antes del relato (19 de octubre de 2026)

**Contexto.** En el feedback, el Paciente 2 (con formación en medicina) explicó que en el relato libre el paciente "divaga": cuenta todo desde el lunes, pero no queda claro qué lo hizo consultar hoy. Si la ficha dice "tos" y el paciente viene por la fiebre, el médico arranca con información equivocada.

**Decisión.**
- En primera vez, antes del relato, la pantalla pregunta "¿Por qué consultas hoy?" con botones (Fiebre, Tos, Dolor de garganta, Dolor de cabeza, Dolor de estómago, Diarrea, Vómitos, Mareo, Otro) y "¿Desde hace cuánto?". La ficha dice, por ejemplo, "Fiebre de 5 días de evolución".
- Ese motivo lo arma la app, no la IA, y ninguna ronda de preguntas lo puede cambiar.
- Las preguntas siguen el orden de un interrogatorio médico: primero el síntoma principal (qué ha tomado para eso, cómo es, qué tan fuerte del 1 al 10 y con su medida propia, qué lo mejora o empeora), después los síntomas asociados y al final los antecedentes.
- Se agregaron tres datos a la ficha: "Cómo es", "Lo que ha tomado para esto" y "Personas cercanas con síntomas parecidos". Si hay diarrea o vómitos, se pregunta cuántas veces y si está tomando líquidos.

**Por qué.** Elegir de una lista evita que el motivo se pierda en el relato, y el relato libre se conserva porque da el contexto general. Es opcional: quien no encuentra su motivo en la lista puede escribirlo en "Otro" o solo contar su historia.

**Qué se descartó.** Quitar el relato libre (el mismo médico dijo que sirve) y una lista larga de síntomas (cansa y no cabe en el teléfono).

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
