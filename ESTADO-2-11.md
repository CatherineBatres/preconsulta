# Estado final del proyecto al 2 de noviembre de 2026

**PreConsulta**: el paciente prepara su ficha médica antes de la cita, por voz o texto, y se la envía a su médico en PDF.
App: https://preconsulta-iota.vercel.app/ · Artículo: [De un audio a una ficha médica: el proceso de construir PreConsulta](https://catherinebatres.substack.com/p/de-un-audio-a-una-ficha-medica-lo) · Estado anterior: [ESTADO-27-10](ESTADO-27-10.md)

## Resumen

- El proyecto **se da por concluido** en esta etapa. La app está publicada, documentada y probada con usuarios.
- **14 pacientes** respondieron el formulario de feedback después de usar la app publicada, con la IA real (Gemini). 12 la usaron desde el teléfono (9 Android, 3 iPhone) y nadie reportó fallas.
- **El problema se confirmó:** a 10 de 14 se les olvida decirle algo al médico al menos a veces, y 12 de 14 no han sabido el nombre o la dosis de un medicamento.
- **La app se entiende:** 13 de 14 leen bien el texto y los botones, y 13 de 14 entendieron con nota máxima que la app no responde como médico.
- **11 de 14 enviarían la ficha** a su médico y ninguno dijo que no. La recomendación quedó en 7.4 de 10 (mediana 8).
- **Médicos:** el formulario no recibió respuestas a tiempo. Es lo primero de la siguiente etapa.
- **Siguiente etapa:** el proyecto continúa como un fork en la organización innovationlabug, con su [SPEC.md](#siguiente-etapa).

## Resultados del feedback

Detalle completo, cruces y respuestas abiertas en [docs/feedback/resultados.md](docs/feedback/resultados.md).

| Indicador | Resultado | Meta | ¿Se cumple? |
| --- | --- | --- | --- |
| Respuestas | 14 pacientes, 0 médicos | 10 personas (7 pacientes y 3 médicos) | Sí en número; faltan los médicos |
| Tiempo para llenar la ficha | 13 de 14 en 5 minutos o menos | — | — |
| Supe qué hacer sin ayuda (1 a 5) | 4.3 | — | — |
| Texto y botones se leen bien (1 a 5) | 4.8 | — | — |
| Las preguntas se entienden (1 a 5) | 4.5 | — | — |
| Entendí que no me responde un médico (1 a 5) | 4.9 | — | Sí: se corrigió la duda del Paciente 1 |
| Le mandaría la ficha a su médico | Sí: 11 · Tal vez: 3 · No: 0 | — | — |
| Recomendación (0 a 10) | Promedio 7.4, mediana 8 | 8 o más | A medias |
| Usaron la voz | 8 de 14 (solo voz o voz y texto) | — | — |

**Quiénes respondieron:** edades de 18 a 59 años, 13 de 14 con estudios universitarios o de posgrado, 12 de la Ciudad de Guatemala y los 14 se atienden en clínica privada. Es una muestra pequeña y parecida entre sí, así que los resultados son pistas, no conclusiones generales.

**Lo que más ayudó:** el mapa del cuerpo (8), grabar con la voz (8) y los botones "No sé" y "No aplica" (7).

**Lo que se sintió más largo:** contar el relato, por voz o por escrito (8 de 14).

**Lo que les haría desconfiar:** que pida muchos datos personales (10) y no saber quién ve sus datos (9), más que el uso de inteligencia artificial (6).

**Quién debería pagar:** 9 de 14 prefieren que pague la clínica o el seguro; 3 no la usarían si fuera de pago.

## Conclusiones

1. **El problema es real.** La mayoría olvida cosas en la consulta o no recuerda sus medicamentos. Eso respalda la idea central del proyecto.
2. **La app es fácil de usar para quien ya usa tecnología.** Las notas de facilidad, lectura y comprensión son altas, y solo una persona reportó algo confuso: la primera pantalla del tutorial.
3. **Las mejoras que vinieron del feedback anterior funcionaron.** El mapa del cuerpo, los botones y "No sé" / "No aplica" fueron lo más útil, y la duda de si "responde un médico" desapareció.
4. **El valor depende de que la ficha llegue sola.** La crítica más fuerte fue que llenar la ficha y luego enviarla es "doble trabajo". Para el paciente, el valor está en que la información le llegue al médico sin pasos extra.
5. **La hipótesis principal sigue sin comprobarse.** Sin médicos ni consultas reales no se puede saber si la ficha llega más completa sin alargar la consulta (H1 y H4), ni si la voz ayuda más a quien tiene menos estudios o más edad (H3), porque ese grupo no respondió.
6. **El modelo de negocio apunta a la clínica.** Los pacientes no quieren pagar; prefieren que lo haga la clínica o el seguro, lo que coincide con la [hipótesis H5](docs/hipotesis.md).

## Aprendizajes

**Sobre el producto**
- Pedir el documento que el médico ya usa (su formulario en papel) enseñó más sobre el orden de la ficha que cualquier ejemplo en internet.
- La longitud de un formulario se mide en esfuerzo, no en preguntas: con más preguntas pero respondidas con toques, 11 de 14 dijeron que eran "las justas".
- Decir que no también es diseño: quitar las fotos de lesiones, no pedir DPI ni seguro y no dar consejos médicos protege a las personas.
- La confianza depende más de los datos personales que de la IA. Pedir lo mínimo y explicar quién ve la información es parte del producto.

**Sobre el feedback**
- Los audios por WhatsApp funcionaron para las primeras sesiones; el formulario funcionó para llegar a más personas en tres días.
- Conseguir médicos es más difícil que conseguir pacientes. Hay que buscarlos con más tiempo y por varios canales (visitador médico, colegas, universidad).
- Si no se diseña la muestra, responden personas parecidas a uno: jóvenes, con estudios y de la capital. Para probar la hipótesis de la voz hay que buscar a propósito a adultos mayores y a personas con menos estudios.

**Sobre el desarrollo**
- Publicar un enlace el primer día volvió pequeños los problemas de configuración.
- Pedirle a la IA una forma (esquema JSON) y no un texto hizo que la ficha fuera predecible.
- Las pruebas automáticas encontraron errores de diseño (la IA cambiaba lo que el paciente eligió). Las pruebas con IA simulada no reemplazan a la IA real.
- Revisar `npm audit` antes de cada entrega evitó quedar bloqueada por una versión insegura de Next.js.
- Escribir cada decisión con su porqué (13 en [decisiones.md](docs/decisiones.md)) permitió responder rápido a cada pregunta del jefe y de los usuarios.

## Qué quedó listo en este repositorio

- App publicada en Vercel con la versión final (commit `71ee46b` y siguientes).
- Documentación al día: [README](README.es.md), [arquitectura](docs/arquitectura.md), [API](docs/api.md), [decisiones](docs/decisiones.md), [pruebas](docs/pruebas.md), [plan](docs/plan.md) e [hipótesis](docs/hipotesis.md).
- Feedback: [sesiones](docs/feedback/sesiones.md), [resumen](docs/feedback/resumen.md), [resultados del formulario](docs/feedback/resultados.md) y los formularios de [pacientes](docs/feedback/formulario-pacientes.md) y [médicos](docs/feedback/formulario-medicos.md).
- Pruebas: 34 unitarias y 18 de punta a punta, pasando.
- Se quitaron del repositorio los PDF de ejemplo con nombres de personas reales.
- Artículo publicado con todo el proceso, por fases.

## Lo que quedó pendiente

- Respuestas de médicos al formulario.
- Medir en la app cuántas fichas se empiezan y cuántas se terminan, sin guardar su contenido.
- Consentimiento explícito antes de enviar el relato a la IA, límite de gasto de la llave y usar la capa de pago de Gemini antes de recibir pacientes reales.
- Corregir el dibujo de la espalda en el mapa del cuerpo y la primera pantalla del tutorial.

## Siguiente etapa

PreConsulta continúa. Como es el mismo proyecto, se trabaja en un **fork** de este repositorio dentro de la organización [innovationlabug](https://github.com/innovationlabug). El `SPEC.md` del fork detalla las 4 semanas de trabajo (del 4 de noviembre al 1 de diciembre de 2026), cómo se distribuye la carga y las 2 rondas de feedback.

Prioridades, a partir de este feedback:
1. **Médicos primero:** conseguir al menos 5 respuestas de médicos en la primera ronda.
2. **Que la ficha llegue sola:** un enlace propio de cada consultorio que ya trae el nombre y el WhatsApp del médico.
3. **Menos esfuerzo en el relato:** más respuestas con toques y un relato más corto.
4. **Probar con quien más lo necesita:** personas de 60 años o más, con menos estudios y fuera de la capital, incluida la opción de llenar la ficha para otra persona.
5. **Lista para pacientes reales:** consentimiento, protección de la llave y conteo anónimo de fichas terminadas.
