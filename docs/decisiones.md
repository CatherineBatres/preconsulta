# Decisiones

Registro de las decisiones del proyecto: qué se decidió, por qué y qué se descartó. Las más recientes van primero.

## 13. Sin fotos de lesiones; solo de medicamentos (26 de octubre de 2026)

**Contexto.** Los médicos de turno pidieron fotos de lesiones (ronchas, heridas, inflamación) y se agregaron en la decisión 10. Al revisarlo se vio un riesgo: la app no puede controlar qué foto sube la persona. Podría ser una zona íntima, la foto de un niño o algo que no tiene que ver, y el PDF viaja por WhatsApp, donde se reenvía con facilidad.

**Decisión.** Se quitan las fotos de lesiones. Se quedan las **fotos de medicamentos** (caja, frasco o receta), con el aviso "No tomes fotos de personas". Siguen sin enviarse a la IA ni guardarse.

**Por qué.** El riesgo de una foto del cuerpo es alto y la app no tiene cómo revisarla. El médico ya tiene el mapa del cuerpo, la descripción ("Cómo es") y la escala; si necesita ver la lesión, se la puede pedir al paciente directamente, por el canal que él controla. La foto de un medicamento tiene poco riesgo y resuelve un problema real: la gente confunde los nombres.

**Qué se descartó.** Revisar las fotos con IA antes de agregarlas: implicaría mandar fotos del cuerpo a un servicio externo, que es justo lo que se quiere evitar.

## 12. Más interactiva: pantallas cortas, mapa del cuerpo y avance (26 de octubre de 2026)

**Contexto.** Con las preguntas nuevas, el paso 1 se volvió una página larga y la entrevista podía sentirse tediosa.

**Decisión.**
- **Paso 1 por pantallas**, una tarjeta a la vez con barra de avance y botones Atrás y Siguiente: tipo de consulta → tus datos → motivo → medidas → tu relato. En control no hay pantalla de motivo. Se puede saltar a cualquier pantalla tocando la barra.
- **Mapa del cuerpo** (de frente y de espalda) en la pantalla del motivo y en la pregunta "¿Dónde?": la persona toca dónde le molesta y eso llena "Dónde" en la ficha. Derecha e izquierda son las del paciente, con un aviso debajo.
- **Avance y ánimo** durante las preguntas: "Tu ficha va 56% completa", que sube al responder, y mensajes cortos ("¡Empecemos!", "Vas muy bien", "Última pregunta de esta parte").
- **Transiciones suaves** entre pantallas y preguntas (se apagan si el teléfono pide menos movimiento) y un cierre "¡Tu ficha está lista!" con una palomita animada y el porcentaje completo.

**Por qué.** Una pantalla a la vez se siente más corta en el teléfono, y ver el avance motiva a terminar. Tocar el cuerpo es más fácil y más preciso que describir con palabras dónde duele.

**Qué se descartó.** Puntos o insignias tipo juego: no van con una ficha médica. Caritas en la escala del dolor: por ahora basta la escala de colores.

## 11. Ficha más completa, como una historia clínica (26 de octubre de 2026)

**Contexto.** Se comparó la ficha de PreConsulta con fichas de historia clínica de referencia (plantilla de consulta general, guía de anamnesis de la Universidad de Salamanca y formato de la Universidad Tecnológica de Pereira). Solo se tomó lo que el paciente puede contestar en casa: el examen físico, el diagnóstico y el tratamiento son del médico.

**Decisión.**
- Historia de la enfermedad: "Dónde" (localización) y "A qué lo atribuye", la opinión del paciente.
- **Escala del 1 al 10 con botones** para la intensidad: en "¿Por qué consultas hoy?" y en la pregunta de intensidad. Se llena como las estrellas de una calificación, de verde (leve) a rojo (muy fuerte). En control, otra escala: "Comparado con tu consulta anterior, te sientes: Mucho peor… Mucho mejor".
- "¿Te mediste algo en casa?" (opcional): temperatura, presión, glucosa y peso. Se escriben tal cual en la ficha y nunca se preguntan.
- Antecedentes gineco-obstétricos (última menstruación, posible embarazo, embarazos y método anticonceptivo), **solo si el sexo es femenino y la edad es de 10 años o más**, con botón "Prefiero no decir".
- Hábitos con botones (fumo, fumaba antes, tomo alcohol, ejercicio, duermo poco) y la IA pide cantidades.
- "Contactos, viajes y animales": viajes recientes, contacto con animales o picaduras, solo si hay fiebre, diarrea, vómitos, tos o algo en la piel.
- Transfusiones, dentro de cirugías y hospitalizaciones.
- Municipio donde vive (opcional). Igual que el nombre y el contacto, no se envía a la IA.

**Por qué.** Son preguntas que están en todas las fichas profesionales y que el paciente sabe contestar. Para que la entrevista no se alargue, las nuevas solo aparecen cuando aplican, se responden con un toque cuando se puede y lo que se elige con un toque ya no se vuelve a preguntar.

**Qué se descartó por ahora.** Vacunas, una revisión rápida por sistemas y la opción de llenar la ficha para otra persona (un niño o un adulto mayor, con sus propias preguntas). Quedan como trabajo futuro. Estado civil y fecha de nacimiento no aportan a una preconsulta.

## 10. Fotos solo dentro del PDF (26 de octubre de 2026)

> Actualizada por la [decisión 13](#13-sin-fotos-de-lesiones-solo-de-medicamentos-26-de-octubre-de-2026): las fotos de lesiones se quitaron; quedan las de medicamentos.

**Contexto.** Unos tres médicos de turno revisaron la app (por medio del Paciente 2) y pidieron poder agregar fotos: de una lesión (roncha, herida, inflamación) para ver qué tipo es, y de los medicamentos, porque la gente confunde sus nombres.

**Decisión.**
- En el paso 1, "Fotos de lo que te molesta"; en las preguntas de medicamentos o de lo que ha tomado, "Fotos de tus medicamentos". Hasta 3 de cada tipo.
- El teléfono achica cada foto (máximo 1280 px, JPEG) para que el PDF pese poco y se pueda mandar por WhatsApp.
- Las fotos aparecen en la ficha y en el PDF, en una sección "Fotos adjuntas por el paciente". El mensaje de texto avisa cuántas hay en el PDF.
- **No se envían a la IA ni se guardan** en el teléfono. Al empezar una ficha nueva se borran.
- Un aviso pide no incluir la cara.

**Por qué.** Una foto del cuerpo es información de salud muy sensible, y que la IA la interprete sería acercarse a un diagnóstico, que la app no hace. Al médico sí le sirve verla, y el PDF es lo que él recibe.

**Qué se descartó.** Que la IA lea la caja del medicamento para llenar nombre y dosis: puede servir, pero las etiquetas de farmacia a veces traen el nombre del paciente; queda para después. Guardar las fotos en el historial del teléfono: ocupan mucho espacio y no hacen falta en la siguiente consulta.

## 9. Antecedentes como los pide el médico (23 de octubre de 2026)

**Contexto.** El Médico 1 probó la app y compartió el formulario en papel que usa su consultorio antes de cada cita. Dijo que respondió varias preguntas con "sí" o "no" y que la app no le preguntó cuál; que en medicamentos hace falta saber cada cuánto y desde cuándo; y que las preguntas de antecedentes deben ser más específicas.

**Decisión.**
- Si el paciente responde solo "sí", la app le pide el detalle antes de seguir ("¿A qué eres alérgico y qué te pasa?"). Si vuelve a tocar Siguiente, lo deja pasar, y la ficha dice "Refiere que sí, sin especificar" para que el médico lo pregunte.
- La IA ya no hace preguntas que se contesten solo con sí o no, y da ejemplos en la pregunta.
- Medicamentos con nombre, dosis, cada cuánto, desde cuándo y para qué, uno por línea, con un ejemplo en el cuadro de respuesta.
- Enfermedades frecuentes para marcar con un toque, como en su formulario (presión alta, diabetes, colesterol, asma, tiroides…), además de "Ninguna".
- Antecedentes en su orden: alergias, enfermedades, cirugías y hospitalizaciones, medicamentos.
- Ocupación (opcional) en los datos generales.

**Qué se descartó.** Los datos administrativos de su formulario (seguro médico, póliza, DPI, NIT para factura, quién lo refiere): son trámites del consultorio y datos sensibles que la app no necesita pedir ni enviar a la IA. Las preguntas propias de su especialidad (alergia al contraste yodado, problemas vasculares): PreConsulta es general.

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
