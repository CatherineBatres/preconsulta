# Publicar y recrear la app

## Cómo publicarla

1. Sube el repositorio a GitHub.
2. En [Vercel](https://vercel.com), elige **Add New → Project**, importa el repositorio y deja la configuración de **Next.js** que detecta.
3. En **Settings → Environment Variables**, agrega `GEMINI_API_KEY`.
4. Presiona Deploy. Desde ahí, cada `git push` a `main` publica una versión nueva.

Las variables de entorno solo aplican a despliegues nuevos: después de agregar o cambiar la llave, vuelve a desplegar.

## Cómo recrearla desde cero

Estos son los pasos con los que se construyó este repositorio, en orden.

1. **Crea el proyecto de Next.js** (JavaScript, Tailwind, App Router):

   ```bash
   npx create-next-app@latest preconsulta --js --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
   cd preconsulta
   ```

2. **Agrega las dos librerías** que usa la app, y Playwright para las pruebas:

   ```bash
   npm install @google/genai jspdf
   npm install -D @playwright/test
   ```

3. **Agrega el código**, archivo por archivo:

   | Archivo | Qué hace |
   | --- | --- |
   | `lib/ficha.js` | Las secciones y campos de la ficha, los dos modos de consulta y las respuestas rápidas, compartidos por el esquema de la IA, la pantalla y el PDF |
   | `lib/preguntas.js` | Qué preguntas de la IA llegan al paciente (solo campos vacíos, sin repetir, por prioridad) |
   | `lib/almacen.js` | Guarda, lee y borra la ficha base y el historial en el navegador del paciente |
   | `app/api/ficha/route.js` | Recibe el relato, llama a Gemini con las instrucciones y el esquema, y devuelve JSON limpio |
   | `app/grabadora.js` | El botón de grabar y el reproductor |
   | `app/page.js` | Los tres pasos: relato, preguntas una a la vez, ficha editable y envío |
   | `lib/pdf.js` | Arma el PDF con formato de hoja clínica en el navegador, con jsPDF |
   | `app/layout.js` | Título de la página, idioma (`es`) y fuentes |

4. **Agrega las pruebas** (ver [pruebas.md](pruebas.md)): los tres archivos de `tests/unit/`, `tests/gemini-falso.mjs`, `tests/e2e/preconsulta.spec.mjs` y `playwright.config.mjs`, y luego los scripts:

   ```bash
   npm pkg set scripts.test="node --test tests/unit/ficha.test.mjs tests/unit/preguntas.test.mjs tests/unit/almacen.test.mjs" scripts.test:e2e="playwright test"
   ```

5. **Configura la llave** en `.env.local`, corre `npm run dev` y publica como se explica arriba.

## Estructura del proyecto

```
preconsulta/
├── app/
│   ├── page.js               # los tres pasos
│   ├── grabadora.js          # grabadora (MediaRecorder)
│   ├── layout.js             # título, idioma, fuentes
│   └── api/ficha/route.js    # ruta de servidor que llama a Gemini
├── lib/
│   ├── ficha.js              # secciones, campos y modos de consulta
│   ├── preguntas.js          # qué preguntas de la IA llegan al paciente
│   ├── almacen.js            # ficha base e historial en el teléfono
│   └── pdf.js                # generación del PDF (jsPDF)
├── tests/
│   ├── unit/                 # pruebas unitarias (node --test)
│   ├── e2e/preconsulta.spec.mjs  # pruebas de punta a punta (Playwright)
│   └── gemini-falso.mjs      # API de Gemini simulada para las pruebas
├── docs/                     # documentación, decisiones, feedback, capturas y diagramas
├── playwright.config.mjs
├── .env.local                # tu llave de la API (no se sube)
└── package.json
```

Ver también: [Volver al README](../README.es.md)
