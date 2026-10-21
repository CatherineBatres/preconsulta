# Resumen del feedback

Borrador con las sesiones de los dos pacientes. Se completa cuando llegue la del médico. Las notas completas y las transcripciones están en [sesiones.md](sesiones.md).

## Quiénes participaron

| Participante | Perfil | Fecha | Cómo |
| --- | --- | --- | --- |
| Paciente 1 | Persona sin formación médica | 19 de octubre de 2026 | Usó la app escribiendo y mandó un audio con su opinión |
| Paciente 2 | Persona con formación en medicina, probó la app como paciente | 19 de octubre de 2026 | Recorrió la app y mandó tres audios comentando pantalla por pantalla |
| Médico 1 | (pendiente) | | |

## Hallazgos principales

1. **La app se entiende y es fácil de usar.** Los dos la describieron como sencilla, bien enfocada y "bonita". Poder escribir o grabar según dónde esté uno fue bien recibido.
2. **Las preguntas de seguimiento ayudan a no olvidar cosas.** El Paciente 1 no había pensado en mencionar alergias ni cirugías hasta que la app se lo preguntó. El Paciente 2 dijo que las preguntas "están bastante bien formuladas".
3. **Al inicio no quedaba claro que no responde un médico.** El Paciente 1 dudó si la app le iba a contestar como un doctor.
4. **El motivo de consulta se perdía en el relato libre.** El Paciente 2 insistió en esto en sus tres audios: el paciente cuenta todo, pero no queda claro qué lo hizo consultar hoy.
5. **Las preguntas deben seguir el orden de un médico**, profundizar en el síntoma principal y pedir medidas concretas (escala del 1 al 10, grados, número de veces).

## Qué se corrige

| Hallazgo | Corrección | Quién lo pidió | Prioridad | Estado |
| --- | --- | --- | --- | --- |
| No queda claro que no responde un médico | Tutorial de bienvenida y aviso "No te responde un médico" al inicio | Paciente 1 | Alta | Hecho |
| El tipo de consulta no se notó a la primera | El tutorial termina eligiendo "Primera vez" o "Control", con íconos | Paciente 1 | Baja | Hecho |
| El motivo se pierde en el relato | "¿Por qué consultas hoy?" con botones y "¿Desde hace cuánto?" ([decisión 7](../decisiones.md#7-el-motivo-de-consulta-se-elige-con-un-toque-antes-del-relato-19-de-octubre-de-2026)) | Paciente 2 | Alta | Hecho |
| Preguntas poco centradas en el síntoma principal | Instrucciones de la IA en orden de interrogatorio médico; nuevos datos "Cómo es" y "Lo que ha tomado para esto" | Paciente 2 | Media | Hecho |
| Intensidad sin medida | Escala del 1 al 10 y la medida propia del síntoma | Paciente 2 | Media | Hecho |
| No se pregunta por contactos con síntomas | Nuevo dato "Personas cercanas con síntomas parecidos" | Paciente 2 | Media | Hecho |
| No se pregunta por hidratación | En diarrea o vómitos se pregunta cuántas veces y si toma líquidos | Paciente 2 | Baja | Hecho |

## Qué no se corrige por ahora, y por qué

- **Enviar la ficha directo al número del consultorio** (Paciente 1). Hoy el paciente la comparte por WhatsApp o correo y elige a quién mandarla. Antes de cambiarlo hay que preguntarle al médico cómo prefiere recibirla.

## Lo que confirmó o cambió las decisiones del proyecto

- Confirmó que el relato libre sirve, pero no basta: se agregó el motivo con un toque ([decisión 7](../decisiones.md#7-el-motivo-de-consulta-se-elige-con-un-toque-antes-del-relato-19-de-octubre-de-2026)).
- Nadie pidió usar la app en varios teléfonos, así que guardar el historial solo en el teléfono ([decisión 5](../decisiones.md#5-historial-de-consultas-en-el-teléfono-no-en-una-base-de-datos-14-de-octubre-de-2026)) se mantiene.
