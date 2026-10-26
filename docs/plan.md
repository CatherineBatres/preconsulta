# Plan: segunda etapa (14 al 28 de octubre de 2026)

Dos entregas: un feature nuevo, feedback con usuarios reales y correcciones a partir de ese feedback.

## Semana 1: entrega el 21 de octubre

- [x] Conseguir a 2 pacientes y 1 médico
- [x] Decidir si se guarda la grabación ([decisión 6](decisiones.md#6-la-grabación-no-se-guarda-14-de-octubre-de-2026))
- [x] Reorganizar el README en documentos separados
- [x] Historial de consultas: evolución y respuesta al tratamiento ([decisión 5](decisiones.md#5-historial-de-consultas-en-el-teléfono-no-en-una-base-de-datos-14-de-octubre-de-2026))
- [x] Evitar que la transcripción en vivo corte la grabación en teléfonos (Issue #2, [decisión 8](decisiones.md#8-sin-transcripción-en-vivo-en-teléfonos-20-de-octubre-de-2026))
- [ ] Probar en un teléfono real con Gemini: grabar un control de 30 segundos y revisar que la ficha salga completa
- [x] Mini tutorial de bienvenida y rediseño visual (encabezado con logo, pasos numerados, aviso "No te responde un médico") a partir del feedback del Paciente 1
- [x] Motivo de consulta con un toque, preguntas en orden de interrogatorio y tres datos nuevos, a partir del feedback del Paciente 2 ([decisión 7](decisiones.md#7-el-motivo-de-consulta-se-elige-con-un-toque-antes-del-relato-19-de-octubre-de-2026))
- [x] Kit de feedback: [guía de una página, guías de preguntas y formato de notas](feedback/README.md)

## Semana 2: entrega el 28 de octubre

- [x] Editar antecedentes (medicamentos, alergias, enfermedades) en modo control sin borrar el historial (Issue #3)
- [x] Sesiones de feedback con 2 pacientes y 1 médico
- [x] Documentar lo que dijeron en [sesiones.md](feedback/sesiones.md)
- [x] Cambios pedidos por el médico: repregunta del "sí", medicamentos completos, enfermedades con un toque, orden de antecedentes y ocupación ([decisión 9](decisiones.md#9-antecedentes-como-los-pide-el-médico-23-de-octubre-de-2026))
- [x] Fotos de la lesión y de los medicamentos, solo dentro del PDF, a partir de los médicos de turno ([decisión 10](decisiones.md#10-fotos-solo-dentro-del-pdf-26-de-octubre-de-2026))
- [x] Ficha más completa, comparada con historias clínicas de referencia: localización, a qué lo atribuye, escala del 1 al 10 con botones, mediciones en casa, gineco-obstétricos, hábitos con botones, viajes y animales, transfusiones y municipio ([decisión 11](decisiones.md#11-ficha-más-completa-como-una-historia-clínica-26-de-octubre-de-2026))
- [x] Actualizar Next.js a 16.4.3 por una falla de seguridad crítica
- [x] Elegir las correcciones más importantes en [resumen.md](feedback/resumen.md)
- [x] Hacer las correcciones y volver a correr las pruebas
- [ ] Publicar la versión final con el resumen del feedback

## Trabajo futuro

- Vacunas, revisión rápida por sistemas y llenar la ficha para otra persona (niño o adulto mayor) ([decisión 11](decisiones.md#11-ficha-más-completa-como-una-historia-clínica-26-de-octubre-de-2026))
- Que la IA lea la caja del medicamento ([decisión 10](decisiones.md#10-fotos-solo-dentro-del-pdf-26-de-octubre-de-2026))
