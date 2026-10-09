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
| Interfaz | Next.js + React (JavaScript) con Tailwind CSS | Control total del diseño en teléfono, que es donde más se usará |
| Grabación de voz | Grabadora nativa del navegador (`MediaRecorder`) | No requiere instalar nada ni servicios adicionales |
| Voz → texto y razonamiento | API de Gemini (modelo Flash vigente), llamada desde una ruta de servidor de Next.js | Un solo proveedor entiende el audio, genera las preguntas y llena la ficha; la llave nunca llega al navegador |
| Ficha estructurada | Salida JSON con esquema fijo | La ficha siempre sale con los mismos campos, sin texto libre impredecible |
| PDF | Generado en el navegador (jsPDF) | La ficha no necesita pasar por el servidor para descargarse |
| Publicación | Vercel | Despliega directo desde este repositorio, da un enlace público gratis y se actualiza con cada `git push` |

El nombre del modelo y la llave de la API se dejan en variables de entorno para poder cambiarlos sin tocar el código.

Cada grabación se limita a 2 minutos para mantener el audio pequeño al enviarlo al servidor.

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

## Cómo ejecutarlo localmente

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

La app queda en `http://localhost:3000`.

## Estructura prevista del repositorio

```
preconsulta/
├── app/
│   ├── page.js             # pantalla principal: formulario, grabación y ficha
│   ├── layout.js           # título, idioma y estilos globales
│   └── api/
│       └── ficha/route.js  # ruta de servidor: llama al modelo con la llave
├── lib/
│   ├── ficha.js            # esquema de la ficha
│   └── pdf.js              # generación del PDF
├── .env.local              # llave de la API (no se sube al repo)
├── package.json
└── README.md
```

`app/api/` y `lib/` se agregan en las siguientes etapas.
