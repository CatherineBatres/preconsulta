# PreConsulta

**Turn a voice note into a clean pre-visit medical record.** The patient tells their story out loud, an AI asks a few follow-up questions, and the result is a standard record (PDF) ready to send to the doctor.

**Live demo:** https://preconsulta-iota.vercel.app/ · **Article (Spanish):** [De un audio a una ficha médica](https://catherinebatres.substack.com/p/de-un-audio-a-una-ficha-medica-lo) · **Español:** [README.es.md](README.es.md)

> PreConsulta does not diagnose or recommend treatment. It only organizes what the patient says. All screenshots use made-up data.

<p>
  <img src="docs/img/step-1-story.png" width="240" alt="Step 1: general data and voice recording">
  <img src="docs/img/step-2-questions.png" width="240" alt="Step 2: one follow-up question at a time">
  <img src="docs/img/step-3-record.png" width="240" alt="Step 3: the record as an editable clinical sheet">
</p>

## What it does

1. **Tell us.** The patient picks **First visit** or **Follow-up** and records up to 2 minutes describing what is wrong, or types it. The words appear live on screen, and after stopping they can listen back and record again.
2. **Questions.** The AI asks, one at a time, about every field still missing until the record is complete. Each question is answered by voice, text, or **Don't know** / **Not applicable**.
3. **Your record.** The result is a clinical-style sheet the patient can correct by tapping any field and share as a PDF via WhatsApp or email.
4. **Follow-up.** If the patient agrees, their base record (conditions, allergies, medications) and visit history are saved on their own phone. In a follow-up visit the app asks right away how their symptoms evolved and how the treatment went.

If the patient describes a warning sign such as chest pain, the app tells them to seek emergency care.

![What runs where: the patient's phone, the server on Vercel and Gemini at Google](docs/img/architecture-en.png)

## Run it locally

You need [Node.js](https://nodejs.org) 20.9+ and a Gemini API key from [Google AI Studio](https://aistudio.google.com).

```bash
git clone https://github.com/CatherineBatres/preconsulta.git
cd preconsulta
npm install
echo GEMINI_API_KEY=your_key> .env.local
npm run dev
```

Open http://localhost:3000. Tests: `npm test` (unit) and `npm run test:e2e` (end-to-end).

## Documentation

The detailed documents are in Spanish.

| Document | Contents |
| --- | --- |
| [Architecture](docs/arquitectura.md) | What runs where and why, the journey of a voice note, how the local components are called |
| [API](docs/api.md) | The `/api/ficha` route, the Gemini call and the browser APIs |
| [Tests](docs/pruebas.md) | What the tests cover and how to run them |
| [Deploy and recreate](docs/recrear.md) | Deploying to Vercel, rebuilding from scratch, project structure |
| [Decisions](docs/decisiones.md) | What was decided and why: recordings, history, JSON schema, Next.js |
| [Feedback](docs/feedback/README.md) | Kit for testing with patients and doctors, and what they said |
| [Plan](docs/plan.md) | Deliveries for the coming weeks |
| [Hypotheses](docs/hipotesis.md) | Hypotheses for Guatemala and other countries, how to measure them, product path (Spanish) |
