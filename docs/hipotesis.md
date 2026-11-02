# Hipótesis del proyecto

PreConsulta puede crecer de dos formas: como **producto** (algo que consultorios o pacientes usan y alguien paga) y como **investigación** (un estudio publicable). Las dos parten de la misma pregunta. Aquí están las hipótesis para Guatemala y para otros países, cómo se medirían y qué ya se sabe.

## El problema

En una consulta, buena parte del tiempo se va en preguntar lo básico: por qué viene, desde cuándo, qué toma, a qué es alérgico. El paciente llega sin orden, olvida cosas o no sabe el nombre de sus medicamentos. El médico tiene poco tiempo y, en muchos lugares, muchos pacientes.

En Guatemala esto pesa más:
- Hay pocos médicos para la población: cerca de 1.3 por cada 1,000 habitantes, según el [Banco Mundial](https://data.worldbank.org/indicator/SH.MED.PHYS.ZS?locations=GT) (dato de 2020).
- El [informe de la OPS de 2025 sobre el personal de salud en las Américas](https://www.paho.org/es/documentos/fuerza-trabajo-salud-americas-datos-e-indicadores-regionales) señala que en Guatemala casi la mitad de los médicos tiene 55 años o más.
- El 91% de las líneas telefónicas son celulares, según el boletín de la Superintendencia de Telecomunicaciones de junio de 2022 [citado por Prensa Libre](https://dplnews.com/?p=170570).

## Lo que ya se sabe (y por qué hay que medir bien)

- Los cuestionarios antes de la consulta no son nuevos. Un ensayo clásico en atención primaria encontró que ayudaban a que salieran a la luz más preocupaciones del paciente, pero **las consultas duraron en promedio 34% más** (Hornberger y colegas, 1997).
- Ya hay estudios registrados sobre entrevistas previas a la consulta hechas con IA, por ejemplo en consulta externa de cardiología y en urgencias.
- **Lección para PreConsulta:** no basta con medir si "ahorra tiempo". Hay que medir también si la información llega **más completa**, si es **correcta** y si el médico la **usa**. Y la ficha debe estar hecha para leerse en segundos, que es justo lo que pidieron los médicos en el feedback (motivo claro, orden de historia clínica, escalas).

## Hipótesis para Guatemala

**Hipótesis principal (H1).** En consultas de medicina general en Guatemala, cuando el paciente llena PreConsulta antes de la cita, el médico obtiene una historia clínica inicial **más completa** que con el interrogatorio habitual, **sin alargar la consulta**.

**Hipótesis secundarias**
- **H2. Uso real.** Al menos 6 de cada 10 pacientes que reciben el enlace por WhatsApp terminan la ficha, incluidos los que usan teléfonos Android de gama baja y los que prefieren hablar a escribir.
- **H3. Voz.** Las personas con menos años de escolaridad o mayores de 60 años terminan la ficha más por voz que por texto, y su ficha queda igual de completa.
- **H4. Tiempo del médico.** Con la ficha, el tiempo dedicado a la anamnesis baja al menos 2 minutos por consulta.
- **H5. Valor.** La mayoría de los médicos que la prueban pediría a sus pacientes que la llenen, y un grupo de clínicas privadas pagaría una cuota mensual por tenerla con su propio enlace.

## Hipótesis general (otros países)

**Hipótesis principal (H1-G).** En países de ingresos bajos y medios con pocos médicos por habitante y alto uso de mensajería móvil, una ficha previa a la consulta hecha por el paciente con su teléfono, por voz o texto y con ayuda de IA, mejora la completitud de la historia clínica inicial y la satisfacción del médico, **sin dar diagnósticos** y sin guardar datos en servidores.

**Hipótesis secundarias**
- **H2-G.** El efecto es mayor en telemedicina y en consultas de control de enfermedades crónicas que en primeras consultas presenciales.
- **H3-G.** El formato de la ficha (orden de historia clínica, escalas, motivo con tiempo de evolución) importa más para el médico que la cantidad de datos.
- **H4-G.** Con ajustes de idioma y de preguntas, el mismo diseño funciona en otros países de habla hispana sin cambiar la arquitectura.

## Cómo se mediría

| Qué | Cómo se mide | Ejemplo de meta |
| --- | --- | --- |
| Completitud de la historia | Lista de 12 a 15 puntos de una historia clínica (motivo, tiempo de evolución, localización, intensidad, características, qué lo mejora o empeora, síntomas asociados, alergias, enfermedades, cirugías, medicamentos con dosis…) revisada por un médico que no sabe a qué grupo pertenece el paciente | +20% de puntos completos |
| Concordancia | Lo que dice la ficha comparado con lo que el médico anota en la consulta | 85% de acuerdo o más |
| Tiempo | Minutos de anamnesis y minutos totales de la consulta, medidos con cronómetro | −2 minutos de anamnesis; la consulta no se alarga |
| Uso | Fichas empezadas y terminadas; tiempo para llenarla; voz o texto | 60% o más termina |
| Voz o texto | Formulario de pacientes: estudios, facilidad con el teléfono y edad, cruzados con "¿Preferiste hablar o escribir?"; en el piloto, si la ficha se llenó por voz o texto | Quienes tienen menos estudios o menos práctica con el teléfono usan más la voz, y su ficha queda igual de completa |
| Satisfacción | Formularios de [pacientes](feedback/formulario-pacientes.md) y [médicos](feedback/formulario-medicos.md) | Recomendación de 8 o más (escala 0 a 10) |
| Seguridad | Casos donde la ficha tenía un error que pudo confundir al médico; avisos de alarma | Cero errores graves |

## Primeros resultados

La primera ronda del formulario de pacientes (14 respuestas, 31 de octubre al 2 de noviembre de 2026) confirmó el problema, pero no alcanza para comprobar estas hipótesis: no hubo respuestas de médicos ni de personas de 60 años o más o con menos estudios. Detalle en [resultados.md](feedback/resultados.md#comparación-con-las-hipótesis).

## Diseño de estudio sugerido (para un paper)

1. **Piloto (2 a 4 semanas).** 1 o 2 consultorios de medicina general, uno en la capital y otro fuera. Días alternos con y sin PreConsulta. Unos 30 pacientes por grupo es suficiente para un estudio de factibilidad.
2. **Medición.** Completitud y concordancia con la lista anterior; tiempo con cronómetro; formularios al final.
3. **Ética.**
   - Aprobación de un comité de ética (por ejemplo, el de la universidad).
   - Consentimiento informado.
   - Datos anonimizados.
   - La ficha nunca reemplaza la evaluación del médico.
4. **Después.** Si el piloto sale bien, un estudio más grande con asignación al azar por consultorio o por día.

## Para venderlo como producto

- **Quién paga.** Lo más probable es la clínica o el médico, no el paciente: suscripción mensual con un enlace propio del consultorio, que le manda la ficha directo. Otras opciones: aseguradoras (menos tiempo y mejores datos) o instituciones públicas en programas de telemedicina.
- **Qué hay que probar primero.** Que el médico la pida a sus pacientes y que los pacientes la terminen (H2 y H5). Los formularios de feedback ya preguntan por esto.
- **Lo que la hace distinta.**
  - En español y pensada para Guatemala.
  - Funciona por WhatsApp, sin instalar nada.
  - Acepta voz para quien no escribe bien.
  - El formato está validado con médicos.
  - No guarda datos en servidores.
- **Riesgos.**
  - Responsabilidad legal si alguien la toma como diagnóstico.
  - La regulación de datos de salud de cada país.
  - El costo de la IA por ficha.
  - Que los médicos no cambien su forma de trabajar.

## Fuentes

- [Hornberger J, Thom D, MaCurdy T. Effects of a self-administered previsit questionnaire to enhance awareness of patients' concerns in primary care. J Gen Intern Med. 1997](https://pmc.ncbi.nlm.nih.gov/articles/PMC1497170)
- Banco Mundial. [Médicos (por cada 1,000 personas), Guatemala](https://data.worldbank.org/indicator/SH.MED.PHYS.ZS?locations=GT). Dato de 2020.
- Organización Panamericana de la Salud. [La fuerza de trabajo en salud en las Américas: datos e indicadores regionales](https://www.paho.org/es/documentos/fuerza-trabajo-salud-americas-datos-e-indicadores-regionales). 2025.
- Superintendencia de Telecomunicaciones, boletín del primer semestre de 2022, citado en: Gamarro, U. ["Menos llamadas, pero mejor conectados"](https://dplnews.com/?p=170570). Prensa Libre, republicado por DPL News, 21 de octubre de 2022.
- [ClinicalTrials.gov: estudio AI-CLINIC sobre entrevista previa con IA en cardiología (NCT07883304)](https://clinicaltrials.gov/study/NCT07883304)

Ver también: [decisiones](decisiones.md) · [plan](plan.md) · [resumen del feedback](feedback/resumen.md)
