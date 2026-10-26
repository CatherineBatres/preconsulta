# Resumen del feedback

Resumen de las sesiones con dos pacientes, un médico y un grupo de médicos de turno. Las notas completas y las transcripciones están en [sesiones.md](sesiones.md).

## Quiénes participaron

| Participante | Perfil | Fecha | Cómo |
| --- | --- | --- | --- |
| Paciente 1 | Persona sin formación médica | 19 de octubre de 2026 | Usó la app escribiendo y mandó un audio con su opinión |
| Paciente 2 | Persona con formación en medicina, probó la app como paciente | 19 de octubre de 2026 | Recorrió la app y mandó tres audios comentando pantalla por pantalla |
| Médicos de turno (por medio del Paciente 2) | Unos tres médicos | 26 de octubre de 2026 | El Paciente 2 les mostró la app y mandó un audio con sus comentarios |
| Médico 1 | Médico; compartió el formulario de una consulta de cirugía vascular | 21 de octubre de 2026 | Probó la app, mandó un audio y compartió el formulario en papel de su consultorio |

## Hallazgos principales

1. **La app se entiende y es fácil de usar.** Los dos pacientes la describieron como sencilla, bien enfocada y "bonita". Poder escribir o grabar según dónde esté uno fue bien recibido.
2. **Las preguntas de seguimiento ayudan a no olvidar cosas.** El Paciente 1 no había pensado en mencionar alergias ni cirugías hasta que la app se lo preguntó. El Paciente 2 dijo que las preguntas "están bastante bien formuladas".
3. **Al inicio no quedaba claro que no responde un médico.** El Paciente 1 dudó si la app le iba a contestar como un doctor.
4. **El motivo de consulta se perdía en el relato libre.** El Paciente 2 insistió en esto en sus tres audios: el paciente cuenta todo, pero no queda claro qué lo hizo consultar hoy.
5. **Las preguntas deben seguir el orden de un médico**, profundizar en el síntoma principal y pedir medidas concretas (escala del 1 al 10, grados, número de veces).
6. **Un "sí" sin detalle no le sirve al médico.** El Médico 1 respondió varias preguntas con "sí" o "no" y la app no le preguntó cuál.
7. **Los medicamentos necesitan detalle:** dosis, cada cuánto, desde cuándo y para qué. Y las preguntas de antecedentes deben ser más específicas, con ejemplos o una lista para marcar.
8. **Fotos.** Los médicos de turno pidieron poder ver la lesión y la caja del medicamento, porque la gente confunde nombres. También pidieron la lista de enfermedades comunes, que ya había pedido el Médico 1.

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
| Un "sí" queda sin detalle | La app repregunta ("¿A qué eres alérgico?") y la IA no hace preguntas de sí o no ([decisión 9](../decisiones.md#9-antecedentes-como-los-pide-el-médico-23-de-octubre-de-2026)) | Médico 1 | Alta | Hecho |
| Medicamentos incompletos | Se pide nombre, dosis, cada cuánto, desde cuándo y para qué, con un ejemplo | Médico 1 | Alta | Hecho |
| Preguntas de antecedentes muy abiertas | Enfermedades frecuentes para marcar con un toque | Médico 1 | Media | Hecho |
| El orden de la ficha | Antecedentes en el orden de su formulario: alergias, enfermedades, cirugías, medicamentos | Médico 1 | Media | Hecho |
| Falta la ocupación | Campo opcional en datos generales | Médico 1 (su formulario) | Baja | Hecho |
| No se pueden mandar fotos | Fotos de la lesión y de los medicamentos, solo dentro del PDF ([decisión 10](../decisiones.md#10-fotos-solo-dentro-del-pdf-26-de-octubre-de-2026)) | Médicos de turno | Alta | Hecho |
| "Tiroides" poco claro | El botón dice "Tiroides (hipo o hipertiroidismo)" | Médicos de turno | Baja | Hecho |
| La ficha no tenía todo lo de una historia clínica | Localización, a qué lo atribuye, escala del 1 al 10 con botones, mediciones en casa, gineco-obstétricos, hábitos, viajes y animales, municipio ([decisión 11](../decisiones.md#11-ficha-más-completa-como-una-historia-clínica-26-de-octubre-de-2026)) | Revisión contra fichas de referencia | Alta | Hecho |

## Qué no se corrige por ahora, y por qué

- **Enviar la ficha directo al número del consultorio** (Paciente 1). El médico recibe hoy su formulario por WhatsApp o en foto, igual que PreConsulta lo comparte ahora, así que no hace falta.
- **Seguro médico, póliza, DPI y datos de factura** (formulario del médico). Son trámites del consultorio y datos sensibles; la app no debe pedirlos ni mandarlos a la IA.
- **Que la IA lea la caja del medicamento** (idea a partir de los médicos de turno). Las etiquetas de farmacia a veces traen el nombre del paciente; por ahora el médico ve la foto en el PDF.
- **Preguntas de una especialidad** (por ejemplo, alergia al contraste yodado). PreConsulta es para consulta general.

## Lo que confirmó o cambió las decisiones del proyecto

- Confirmó que el relato libre sirve, pero no basta: se agregó el motivo con un toque ([decisión 7](../decisiones.md#7-el-motivo-de-consulta-se-elige-con-un-toque-antes-del-relato-19-de-octubre-de-2026)).
- Nadie pidió usar la app en varios teléfonos, así que guardar el historial solo en el teléfono ([decisión 5](../decisiones.md#5-historial-de-consultas-en-el-teléfono-no-en-una-base-de-datos-14-de-octubre-de-2026)) se mantiene.
