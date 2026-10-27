# Estado del proyecto al 27 de octubre de 2026

**PreConsulta**: el paciente prepara su ficha médica antes de la cita, por voz o texto, y se la envía a su médico en PDF.
App: https://preconsulta-iota.vercel.app/ · Detalle técnico: [README](README.es.md) · Plan: [docs/plan.md](docs/plan.md)

## Resumen

- Las **3 sesiones de feedback** están hechas y documentadas: 2 pacientes, 1 médico y, además, comentarios de unos 3 médicos de turno.
- Se aplicaron **los ajustes** que salieron de ese feedback y de una revisión contra fichas de historia clínica profesionales.
- Quedaron resueltos los **Issues #2, #3 y #4** de la revisión del 14 de octubre.
- Se actualizó **Next.js a 16.4.3** por una falla de seguridad crítica.
- **Pruebas:** 34 unitarias y 18 de punta a punta, todas pasando.
- **Pendiente principal:** la prueba en teléfonos reales con Gemini y abrir los formularios de feedback.

## Ajustes finales aplicados esta semana (20 al 26 de octubre)

| Commit | Fecha | Qué trae |
| --- | --- | --- |
| `9d879a1` | 20/10 | Audio en teléfonos (Issue #2), editar antecedentes (Issue #3), cambios del Paciente 2 |
| `ba2cc45` | 26/10 | Cambios del Médico 1, fotos de medicamentos, seguridad de Next.js |
| `a699160`, `e8688aa` | 26/10 | Ficha completa como historia clínica y app interactiva |
| `71ee46b` | 26/10 | Sin fotos de lesiones, formularios de feedback e hipótesis |

### Lo que pidió la revisión del 14 de octubre

| Issue | Ajuste | Dónde está |
| --- | --- | --- |
| #2 El micrófono podía cortarse en celulares | En teléfonos la app solo graba ("Te estamos escuchando"); el texto en vivo queda solo en computadora | `app/grabadora.js`, [decisión 8](docs/decisiones.md#8-sin-transcripción-en-vivo-en-teléfonos-20-de-octubre-de-2026) |
| #3 Editar antecedentes sin borrar el historial | Botón **Editar** en "Tu ficha guardada" (modo Control) | `app/page.js`, `lib/almacen.js` |
| #4 Sesiones con usuarios reales | 2 pacientes, 1 médico y médicos de turno, documentados | [sesiones.md](docs/feedback/sesiones.md), [resumen.md](docs/feedback/resumen.md) |

### Lo que pidieron los usuarios

| Ajuste | Quién lo pidió | Dónde está |
| --- | --- | --- |
| "¿Por qué consultas hoy?" con botones y tiempo de evolución ("Fiebre de 5 días de evolución") | Paciente 2 | `app/page.js`, `lib/ficha.js`, [decisión 7](docs/decisiones.md#7-el-motivo-de-consulta-se-elige-con-un-toque-antes-del-relato-19-de-octubre-de-2026) |
| Preguntas en el orden de un interrogatorio médico, centradas en el síntoma principal | Paciente 2 | `app/api/ficha/route.js` |
| Datos nuevos: "Cómo es", "Lo que ha tomado para esto", contactos con síntomas, hidratación | Paciente 2 | `lib/ficha.js` |
| Repregunta cuando responden solo "sí" ("¿A qué eres alérgico?") | Médico 1 | `app/page.js`, [decisión 9](docs/decisiones.md#9-antecedentes-como-los-pide-el-médico-23-de-octubre-de-2026) |
| Medicamentos con dosis, frecuencia, desde cuándo y para qué | Médico 1 | `lib/ficha.js` |
| Enfermedades frecuentes para marcar con un toque | Médico 1 y médicos de turno | `app/page.js`, `lib/ficha.js` |
| Antecedentes en el orden del formulario del médico; ocupación | Médico 1 | `lib/ficha.js`, `lib/pdf.js` |
| Fotos de medicamentos (caja, frasco o receta), solo dentro del PDF | Médicos de turno | `app/fotos.js`, [decisión 10](docs/decisiones.md#10-fotos-solo-dentro-del-pdf-26-de-octubre-de-2026) |
| Fotos de lesiones: se probaron y **se quitaron por privacidad** | Médicos de turno | [decisión 13](docs/decisiones.md#13-sin-fotos-de-lesiones-solo-de-medicamentos-26-de-octubre-de-2026) |

### Ficha más completa (revisión contra historias clínicas de referencia)

- **Escala del 1 al 10 con botones** para la intensidad, y en control "¿Cómo te sientes?" (de Mucho peor a Mucho mejor).
- **Localización** ("¿Dónde?") y **a qué lo atribuye** el paciente.
- **Mediciones en casa**, opcionales: temperatura, presión, glucosa y peso.
- **Gineco-obstétricos**, solo en mujeres de 10 años o más, con "Prefiero no decir".
- **Hábitos** con botones; **viajes, animales y picaduras**; transfusiones.
- **Municipio**, que no se envía a la IA.
- Detalle en la [decisión 11](docs/decisiones.md#11-ficha-más-completa-como-una-historia-clínica-26-de-octubre-de-2026).

### App más interactiva

- **Paso 1 por pantallas**, una tarjeta a la vez con barra de avance.
- **Mapa del cuerpo** de frente y de espalda para tocar dónde molesta.
- **"Tu ficha va X% completa"**, mensajes de ánimo y el cierre "¡Tu ficha está lista!".
- Tutorial de bienvenida y rediseño visual (semana anterior).
- Detalle en la [decisión 12](docs/decisiones.md#12-más-interactiva-pantallas-cortas-mapa-del-cuerpo-y-avance-26-de-octubre-de-2026).

### Documentación nueva

- [Formulario para pacientes](docs/feedback/formulario-pacientes.md) y [formulario para médicos](docs/feedback/formulario-medicos.md), listos para copiar a Google Forms.
- [Hipótesis del proyecto](docs/hipotesis.md) para Guatemala y otros países: cómo medirlas, diseño de un piloto para un paper y camino como producto.
- Decisiones 7 a 13 en [decisiones.md](docs/decisiones.md); [plan](docs/plan.md), [pruebas](docs/pruebas.md), [arquitectura](docs/arquitectura.md) y [API](docs/api.md) al día.

## Plan para la última semana

| # | Tarea | Para cuándo | Cómo se verifica |
| --- | --- | --- | --- |
| 1 | **Prueba en teléfonos reales con Gemini** (Android y, si se consigue, iPhone): una ficha de primera vez y un control grabando 30 segundos | 28/10 | La ficha sale completa; capturas en `docs/img/` y casilla marcada en `plan.md` |
| 2 | **Corregir lo que salga de esa prueba** | 29/10 | Commit con las correcciones y pruebas pasando |
| 3 | **Quitar del repo los PDFs con nombres de personas** (`ejemplos_preconsulta/`, `ficha-ejemplo*.pdf`) y dejar solo ejemplos inventados | 28/10 | Los archivos ya no aparecen en `main` |
| 4 | **Publicar los formularios en Google Forms** y enviarlos por WhatsApp con el enlace de la app | 28/10 | Enlaces de los formularios en `docs/feedback/README.md` |
| 5 | **Recolectar respuestas:** meta de 10 pacientes y 3 médicos | 31/10 | Resumen de respuestas en `docs/feedback/resumen.md` |
| 6 | **Mostrar la versión nueva al Médico 1 y al Paciente 2** ("antes y después") | 30/10 | Su opinión anotada en `sesiones.md` |
| 7 | **Comparar los resultados con las hipótesis** (uso, tiempo, satisfacción) | Fin de la semana | Sección de resultados en `docs/hipotesis.md` |
| 8 | **Cierre:** actualizar README, artículo y capturas; preparar la presentación final | Fin de la semana | README y artículo con la versión final |

### Riesgos

- **Gemini real:** las pruebas automáticas usan una IA simulada, así que la prueba en teléfono (tareas 1 y 2) es lo más importante de la semana.
- **Pocas respuestas en los formularios:** se mandarán por medio del visitador médico y de los médicos que ya participaron.
- **Privacidad:** quitar los PDFs con nombres (tarea 3) antes de compartir más el repo.
