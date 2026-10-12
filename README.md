# PreConsulta — ficha médica previa a la consulta, por voz

**Demo:** https://preconsulta-iota.vercel.app/

> Proyecto en desarrollo. El alcance puede cambiar sobre la marcha.

## El problema

En una consulta (presencial o por telemedicina) buena parte del tiempo se va en recopilar lo básico: qué le pasa al paciente, desde cuándo, qué toma, a qué es alérgico. El paciente además suele olvidar detalles o no sabe cómo explicarlos por escrito.

## La propuesta

Una app web donde el paciente **cuenta con su voz** qué le sucede, la IA le hace **unas pocas preguntas de seguimiento** para completar lo que falta, y al final obtiene una **ficha médica estándar en PDF** lista para llevar a la cita o enviar a su médico.

La app **no diagnostica ni receta**: solo ordena lo que el paciente dice para que el médico lo reciba claro.

## Flujo del usuario

1. Ingresa datos generales (nombre, edad, sexo, contacto) en un formulario corto.
2. Graba un audio explicando su padecimiento o consulta (también puede escribirlo).
3. La IA transcribe, detecta qué información falta y hace hasta 5 preguntas de seguimiento (inicio, duración, intensidad, medicamentos, alergias, antecedentes). Se muestran una a la vez, como en una entrevista, y el paciente responde cada una por voz o texto.
4. Se genera la ficha y se muestra como una hoja clínica; el paciente toca cualquier dato para corregirlo.
5. La envía a su médico: comparte el PDF por WhatsApp o correo desde su propio teléfono, lo descarga, o la manda como texto.

## Contenido de la ficha

- Datos generales
- Motivo de consulta (en palabras del paciente)
- Historia de la enfermedad actual: inicio, duración, intensidad, qué lo mejora o empeora, síntomas asociados
- Antecedentes: enfermedades, cirugías, alergias, medicamentos actuales, antecedentes familiares
- Hábitos relevantes
- Preguntas que el paciente quiere hacerle al médico
- Espacio en blanco para notas y firma del médico (solo en el PDF)

## Cómo se implementa

| Pieza | Herramienta | Por qué |
|---|---|---|
| Interfaz | Next.js + React (JavaScript) con Tailwind CSS | Control total del diseño en teléfono, que es donde más se usará |
| Grabación de voz | Grabadora nativa del navegador (`MediaRecorder`) | No requiere instalar nada ni servicios adicionales |
| Voz → texto y razonamiento | API de Gemini (`gemini-3.8-flash`), llamada desde una ruta de servidor de Next.js | Un solo modelo entiende el audio, genera las preguntas y llena la ficha; la llave nunca llega al navegador |
| Ficha estructurada | Salida JSON con esquema fijo | La ficha siempre sale con los mismos campos, sin texto libre impredecible |
| PDF | Generado en el navegador (jsPDF), con formato de hoja clínica: secciones numeradas, tablas y espacio para notas y firma del médico | La ficha no necesita pasar por el servidor para descargarse |
| Envío al médico | Menú de compartir del teléfono (Web Share), más enlaces de WhatsApp y correo | El paciente la envía desde su propia cuenta; no hace falta un servicio de mensajería |
| Publicación | Vercel | Despliega directo desde este repositorio, da un enlace público gratis y se actualiza con cada `git push` |

El relato inicial se limita a 2 minutos y cada respuesta a 45 segundos, para mantener el audio pequeño al enviarlo al servidor.

## Alcance

**Incluye (MVP):** captura por voz y texto, preguntas de seguimiento, ficha editable, PDF, envío por WhatsApp o correo desde el teléfono del paciente, enlace público.

**No incluye por ahora:** cuentas de usuario, base de datos, envío automático desde la app sin intervención del paciente, videollamada, integración con expedientes clínicos.

No guardar nada en servidor es intencional: reduce el trabajo y evita almacenar datos de salud.

## Consideraciones

- **No es un dispositivo médico.** La app lo indica de forma visible y, si el paciente describe señales de alarma (dolor de pecho, dificultad para respirar, etc.), le muestra un aviso para buscar atención de emergencia.
- **Privacidad.** El audio y las respuestas se envían a la API de Gemini para procesarse; el nombre y el contacto no se envían. La app pide a Google no conservar la conversación y no guarda nada por su cuenta. Para la demo se usan datos ficticios; antes de un uso real hay que revisar los términos de tratamiento de datos del proveedor.
- **El paciente tiene la última palabra.** Nada llega a la ficha final sin que él lo haya podido revisar y editar.

## Plan de trabajo

1. **Base:** repositorio, app mínima desplegada con enlace público. ✔
2. **Voz y ficha:** grabación, transcripción y llenado de la ficha estructurada. ✔
3. **Seguimiento:** preguntas según lo que falte, edición de la ficha, PDF y envío. ✔
4. **Cierre:** pruebas con casos de ejemplo, ajustes y documentación.

## Cómo ejecutarlo localmente

Requiere Node.js 20.9 o superior y una llave de la API de Gemini.

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env.local` en la raíz con la llave (este archivo no se sube al repo):

   ```
   GEMINI_API_KEY=tu_llave
   ```

   Opcional: `GEMINI_MODEL` para usar otro modelo sin tocar el código.

3. Inicia la app:

   ```bash
   npm run dev
   ```

La app queda en `http://localhost:3000`. En Vercel, la llave se configura en **Settings → Environment Variables**.

## Estructura del repositorio

```
preconsulta/
├── app/
│   ├── page.js             # los tres pasos: relato, preguntas y ficha
│   ├── grabadora.js        # botón de grabar y reproductor de audio
│   ├── layout.js           # título, idioma y estilos globales
│   └── api/
│       └── ficha/route.js  # ruta de servidor: llama a Gemini con la llave
├── lib/
│   ├── ficha.js            # campos de la ficha (los usan la IA, la pantalla y el PDF)
│   └── pdf.js              # generación del PDF
├── .env.local              # llave de la API (no se sube al repo)
├── package.json
└── README.md
```
