# PreConsulta

**Convierte un audio en una ficha médica ordenada antes de la consulta.** El paciente cuenta con su voz qué le pasa, una IA le hace unas cuantas preguntas de seguimiento y el resultado es una ficha estándar en PDF, lista para enviar al médico.

**Demo:** https://preconsulta-iota.vercel.app/ · **Artículo:** [De un audio a una ficha médica](https://catherinebatres.substack.com/p/de-un-audio-a-una-ficha-medica-lo) · **English:** [README.md](README.md)

> PreConsulta no diagnostica ni recomienda tratamientos: solo ordena lo que dice el paciente. Todas las capturas usan datos inventados.

<p>
  <img src="docs/img/step-1-story.png" width="240" alt="Paso 1: datos generales y grabación del relato">
  <img src="docs/img/step-2-questions.png" width="240" alt="Paso 2: una pregunta de seguimiento a la vez">
  <img src="docs/img/step-3-record.png" width="240" alt="Paso 3: la ficha como hoja clínica editable">
</p>

## Qué hace

1. **Cuéntanos.** El paciente elige **Primera vez** o **Control o seguimiento** y graba hasta 2 minutos contando qué le pasa, o lo escribe. Mientras habla ve el texto en pantalla, y al detener puede escuchar la grabación y grabar de nuevo.
2. **Preguntas.** La IA pregunta, una a la vez, por cada dato que falta hasta completar la ficha. Cada pregunta se responde por voz, por escrito o con **No sé** / **No aplica**.
3. **Tu ficha.** El resultado es una hoja clínica que el paciente corrige tocando cualquier dato y comparte como PDF por WhatsApp o correo.
4. **Seguimiento.** Si el paciente acepta, su ficha base (enfermedades, alergias, medicamentos) y el historial de consultas se guardan en su propio teléfono. En la consulta de control, la app pregunta directamente cómo evolucionaron sus síntomas y cómo le fue con el tratamiento.

Si el paciente describe una señal de alarma, como dolor de pecho, la app le pide buscar atención de emergencia.

![Qué corre dónde: el teléfono del paciente, el servidor en Vercel y Gemini en Google](docs/img/arquitectura-es.png)

## Cómo correrla

Necesitas [Node.js](https://nodejs.org) 20.9 o superior y una llave de la API de Gemini de [Google AI Studio](https://aistudio.google.com).

```bash
git clone https://github.com/CatherineBatres/preconsulta.git
cd preconsulta
npm install
echo GEMINI_API_KEY=tu_llave> .env.local
npm run dev
```

Abre http://localhost:3000. Pruebas: `npm test` (unitarias) y `npm run test:e2e` (de punta a punta).

## Documentación

| Documento | Qué contiene |
| --- | --- |
| [Arquitectura](docs/arquitectura.md) | Qué corre dónde y por qué, el viaje de un audio y cómo se usan los componentes locales |
| [API](docs/api.md) | La ruta `/api/ficha`, la llamada a Gemini y las APIs del navegador |
| [Pruebas](docs/pruebas.md) | Qué cubren las pruebas y cómo correrlas |
| [Publicar y recrear](docs/recrear.md) | Cómo publicarla en Vercel, recrearla desde cero y la estructura del proyecto |
| [Decisiones](docs/decisiones.md) | Qué se decidió y por qué: grabación, historial, esquema JSON, Next.js |
| [Feedback](docs/feedback/README.md) | Kit para las pruebas con pacientes y médicos, y lo que dijeron |
| [Plan](docs/plan.md) | Entregas de las próximas semanas |
| [Hipótesis](docs/hipotesis.md) | Hipótesis para Guatemala y otros países, cómo medirlas y cómo venderlo como producto |
