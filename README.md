# PreConsulta — ficha médica previa a la consulta, por voz

> Nombre y alcance tentativos. Este documento describe la propuesta antes de implementarla y puede cambiar sobre la marcha.

## El problema

En una consulta (presencial o por telemedicina) buena parte del tiempo se va en recopilar lo básico: qué le pasa al paciente, desde cuándo, qué toma, a qué es alérgico. El paciente además suele olvidar detalles o no sabe cómo explicarlos por escrito.

## La propuesta

Una app web donde el paciente **cuenta con su voz** qué le sucede, la IA le hace **unas pocas preguntas de seguimiento** para completar lo que falta, y al final obtiene una **ficha médica estándar en PDF** lista para llevar a la cita o enviar a su médico.

La app **no diagnostica ni receta**: solo ordena lo que el paciente dice para que el médico lo reciba claro.

## Flujo del usuario

1. Ingresa datos generales (edad, sexo, contacto) en un formulario corto.
2. Graba un audio explicando su padecimiento o consulta (también puede escribirlo).
3. La IA transcribe, detecta qué información falta y hace de 3 a 5 preguntas de seguimiento (inicio, duración, intensidad, medicamentos, alergias, antecedentes). El paciente responde por voz o texto.
4. Se genera la ficha; el paciente la revisa y corrige lo que haga falta.
5. Descarga el PDF y lo comparte con su médico (correo, WhatsApp, impreso).

## Contenido de la ficha

- Datos generales
- Motivo de consulta (en palabras del paciente)
- Historia de la enfermedad actual: inicio, duración, intensidad, qué lo mejora o empeora, síntomas asociados
- Antecedentes: enfermedades, cirugías, alergias, medicamentos actuales, antecedentes familiares
- Hábitos relevantes
- Preguntas que el paciente quiere hacerle al médico

## Cómo se implementa

| Pieza | Herramienta | Por qué |
|---|---|---|
| Interfaz y lógica | Python + Streamlit | Una sola base de código, sin frontend aparte; trae grabación de audio desde el navegador |
| Voz → texto y razonamiento | API de Gemini (modelo Flash vigente) | Un solo proveedor entiende el audio, genera las preguntas y llena la ficha; tiene capa gratuita |
| Ficha estructurada | Salida JSON con esquema fijo | La ficha siempre sale con los mismos campos, sin texto libre impredecible |
| PDF | fpdf2 | Librería ligera, sin dependencias del sistema |
| Publicación | Streamlit Community Cloud | Despliega directo desde este repositorio y da un enlace público gratis |

El nombre del modelo se deja en un archivo de configuración para poder cambiarlo sin tocar el código.

## Alcance

**Incluye (MVP):** captura por voz y texto, preguntas de seguimiento, ficha editable, descarga en PDF, enlace público.

**No incluye por ahora:** cuentas de usuario, base de datos, envío automático al médico, videollamada, integración con expedientes clínicos.

No guardar nada en servidor es intencional: reduce el trabajo y evita almacenar datos de salud.

## Consideraciones

- **No es un dispositivo médico.** La app lo indica de forma visible y, si el paciente describe síntomas de alarma (dolor de pecho, dificultad para respirar, etc.), le recomienda buscar atención de emergencia en vez de continuar.
- **Privacidad.** El audio y el texto se envían a una API externa para procesarse. Para la demo se usarán datos ficticios; antes de un uso real hay que revisar los términos de tratamiento de datos del proveedor.
- **El paciente tiene la última palabra.** Nada llega a la ficha final sin que él lo haya podido revisar y editar.

## Plan de trabajo

1. **Base:** repositorio, app mínima desplegada con enlace público.
2. **Voz y ficha:** grabación, transcripción y llenado de la ficha estructurada.
3. **Seguimiento:** preguntas según lo que falte, edición de la ficha, PDF.
4. **Cierre:** pruebas con casos de ejemplo, avisos de seguridad, documentación.

## Estructura prevista del repositorio

```
preconsulta/
├── app.py              # interfaz Streamlit
├── ficha.py            # esquema de la ficha y generación del PDF
├── ia.py               # llamadas al modelo (transcripción, preguntas, llenado)
├── requirements.txt
├── .streamlit/
│   └── secrets.toml    # llave de la API (no se sube al repo)
└── README.md
```
