// Pruebas de punta a punta: abren la app en un Chrome con tamaño de teléfono,
// usan un micrófono simulado y una IA simulada (tests/gemini-falso.mjs).
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const CLAVE_GUARDADO = "preconsulta.fichaBase.v1";

async function grabar(page, milisegundos = 1500) {
  await page.getByRole("button", { name: "Grabar" }).click();
  await page.waitForTimeout(milisegundos);
  await page.getByRole("button", { name: "Detener" }).click();
  await expect(page.locator("audio")).toBeVisible();
}

async function simularCompartir(page) {
  await page.evaluate(() => {
    window.compartido = null;
    navigator.canShare = (datos) => Boolean(datos?.files?.length);
    navigator.share = async (datos) => {
      window.compartido = { nombre: datos.files[0].name, tipo: datos.files[0].type };
    };
  });
}

// El tutorial de bienvenida se prueba aparte (tutorial.spec.mjs); aquí se da por visto.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("preconsulta.tutorialVisto", "1"));
});

test("primera vez: preguntas en rondas hasta llenar la ficha, PDF y guardado en el teléfono", async ({ page }) => {
  await page.goto("/");

  // Paso 1: no deja continuar sin relato
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Elige por qué consultas, graba un audio o escribe qué te sucede")).toBeVisible();

  await expect(page.getByRole("button", { name: /Primera vez/ })).toHaveAttribute("aria-pressed", "true");
  await page.locator("#nombre").fill("María López");
  await page.locator("#edad").fill("34");
  await page.locator("#sexo").selectOption("Femenino");
  await grabar(page, 2000);
  await page.getByRole("button", { name: "Continuar" }).click();

  // Ronda 1: texto, audio y "No sé"
  await expect(page.getByText("Pregunta 1 de 3")).toBeVisible();
  await page.locator("#respuesta").fill("Como dos horas");
  await page.getByRole("button", { name: "Siguiente pregunta" }).click();
  await expect(page.getByText("Pregunta 2 de 3")).toBeVisible();
  await expect(page.locator("#respuesta")).toHaveValue("");
  await grabar(page);
  await page.getByRole("button", { name: "Siguiente pregunta" }).click();
  await expect(page.getByText("Pregunta 3 de 3")).toBeVisible();
  await expect(page.locator("audio")).toHaveCount(0);
  await page.getByRole("button", { name: "No sé" }).click();

  // Ronda 2: solo campos vacíos que no se habían preguntado
  await expect(page.getByText("Faltan unos datos para completar tu ficha")).toBeVisible();
  await expect(page.getByText("Pregunta 1 de 2")).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿Has notado otros síntomas junto con el dolor?" })).toBeVisible();
  await page.getByRole("button", { name: "Siguiente pregunta" }).click(); // la deja en blanco
  await expect(page.getByRole("heading", { name: "¿Eres alérgica a algún medicamento?" })).toBeVisible();
  await page.getByRole("button", { name: "No aplica" }).click();

  // Paso 3: la ficha completa
  await expect(page.getByRole("heading", { name: "Envíala a tu médico" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ficha previa a la consulta" })).toBeVisible();
  await expect(page.locator("#ficha-intensidad")).toHaveValue("Moderada, 6 de 10");
  await expect(page.locator("#ficha-medicamentos")).toHaveValue("No sabe");
  await expect(page.locator("#ficha-alergias")).toHaveValue("No aplica");
  await expect(page.locator("#ficha-sintomas")).toHaveValue("Sin respuesta");
  await expect(page.locator("#consulta-anterior")).toHaveCount(0);
  await expect(page.locator("#nombre")).toHaveValue("María López");

  const descarga = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar PDF" }).click();
  const contenido = await readFile(await (await descarga).path());
  expect(contenido.subarray(0, 5).toString()).toBe("%PDF-");

  await simularCompartir(page);
  await page.getByRole("button", { name: "Compartir PDF" }).click();
  await expect
    .poll(() => page.evaluate(() => window.compartido))
    .toEqual({ nombre: "ficha-María-López.pdf", tipo: "application/pdf" });

  // Guardar la ficha base en el teléfono
  await page.getByRole("button", { name: "Guardar en este teléfono" }).click();
  await expect(page.getByText("quedó guardada en este teléfono")).toBeVisible();
  const guardado = await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)), CLAVE_GUARDADO);
  // "No sabe" y "No aplica" no se arrastran a la siguiente consulta: ahí se vuelve a preguntar.
  expect(guardado.base).toEqual({ enfermedades: "Hipertensión arterial", alergias: "", medicamentos: "" });
  expect(guardado.historial).toHaveLength(1);
  expect(guardado.historial[0]).toMatchObject({ modo: "primera", motivo: "Dolor de cabeza por las tardes desde hace tres días" });
});

test("el motivo elegido con un toque queda como motivo de consulta con su tiempo de evolución", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Fiebre", exact: true }).click();
  await page.locator("#motivo-cantidad").fill("5");
  await expect(page.getByText("En tu ficha dirá:")).toContainText("Fiebre de 5 días de evolución");
  await expect(page.getByRole("heading", { name: "Ahora cuéntanos qué pasó" })).toBeVisible();
  await page.locator("#texto").fill("Empecé el lunes con diarrea y luego me dio fiebre en las noches.");

  const peticion = page.waitForRequest("**/api/ficha");
  await page.getByRole("button", { name: "Continuar" }).click();
  expect((await peticion).postData()).toContain("Fiebre de 5 días de evolución");

  // Se responde todo con "No sé" para llegar rápido a la ficha.
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "No sé" }).click();
  await expect(page.getByRole("heading", { name: "Envíala a tu médico" })).toBeVisible();
  await expect(page.locator("#ficha-motivo")).toHaveValue("Fiebre de 5 días de evolución");
  await expect(page.locator("#ficha-contactos")).toBeVisible();
});

test("si responde solo 'sí' le pide el detalle, y las enfermedades se marcan con un toque", async ({ page }) => {
  await page.goto("/");
  await page.locator("#ocupacion").fill("Maestra");
  await page.locator("#texto").fill("Tengo tos. SIMULAR_ANTECEDENTES");
  await page.getByRole("button", { name: "Continuar" }).click();

  // Alergias: "Sí" no basta
  await expect(page.locator("#respuesta")).toHaveAttribute("placeholder", /penicilina/);
  await page.locator("#respuesta").fill("Sí");
  await page.getByRole("button", { name: "Siguiente pregunta" }).click();
  await expect(page.locator("[data-repregunta]")).toContainText("¿A qué eres alérgico y qué te pasa?");
  await expect(page.getByText("Pregunta 1 de 2")).toBeVisible();
  await page.locator("#respuesta").fill("Sí, a la penicilina");
  await expect(page.locator("[data-repregunta]")).toHaveCount(0);
  await page.getByRole("button", { name: "Siguiente pregunta" }).click();

  // Enfermedades: botones que llenan la respuesta
  await expect(page.getByText("Pregunta 2 de 2")).toBeVisible();
  await page.getByRole("button", { name: "Presión alta" }).click();
  await page.getByRole("button", { name: "Diabetes" }).click();
  await expect(page.locator("#respuesta")).toHaveValue("Presión alta, Diabetes");
  await page.getByRole("button", { name: "Diabetes" }).click();
  await expect(page.locator("#respuesta")).toHaveValue("Presión alta");
  await page.getByRole("button", { name: "Ninguna" }).click();
  await expect(page.locator("#respuesta")).toHaveValue("Ninguna");
  await expect(page.getByRole("button", { name: "Presión alta" })).toHaveAttribute("aria-pressed", "false");

  // Si insiste con "sí" la segunda vez, la app lo deja seguir
  await page.locator("#respuesta").fill("si");
  const peticion = page.waitForRequest("**/api/ficha");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.locator("[data-repregunta]")).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  const cuerpo = (await peticion).postData();
  expect(cuerpo).toContain("Sí, a la penicilina");
  expect(cuerpo).toContain("Maestra");
});

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);
const foto = (nombre) => ({ name: nombre, mimeType: "image/png", buffer: PNG_1X1 });

test("las fotos van solo en el PDF: no se envían a la IA", async ({ page }) => {
  await page.goto("/");
  await page.locator("#texto").fill("Me salió una roncha en el brazo desde hace tres días.");
  const entrada = page.locator('[data-entrada-fotos="lesion"]');
  await entrada.setInputFiles([foto("roncha.png"), foto("roncha2.png")]);
  const lesion = page.locator('[data-fotos="lesion"] img');
  await expect(lesion).toHaveCount(2);
  await page.getByRole("button", { name: "Quitar foto 2" }).click();
  await expect(lesion).toHaveCount(1);

  const peticiones = [];
  page.on("request", (r) => r.url().includes("/api/ficha") && peticiones.push(r.postData() ?? ""));
  await page.getByRole("button", { name: "Continuar" }).click();

  // En la pregunta de medicamentos se puede agregar la foto de la caja
  await expect(page.getByText("Pregunta 1 de 3")).toBeVisible();
  for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "No sé" }).click();
  await expect(page.locator('[data-fotos="medicamento"]')).toBeVisible();
  await page.locator('[data-entrada-fotos="medicamento"]').setInputFiles(foto("caja.png"));
  await expect(page.locator('[data-fotos="medicamento"] img')).toHaveCount(1);
  await page.locator("#respuesta").fill("Losartán, la caja está en la foto");
  await page.getByRole("button", { name: "Continuar" }).click();
  for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "No sé" }).click();

  await expect(page.getByRole("heading", { name: "Envíala a tu médico" })).toBeVisible();
  await expect(page.locator("[data-fotos-ficha] img")).toHaveCount(2);
  const whatsapp = await page.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href");
  expect(decodeURIComponent(whatsapp)).toContain("Hay 2 fotos adjuntas en el PDF");

  expect(peticiones.length).toBeGreaterThan(0);
  for (const cuerpo of peticiones) {
    expect(cuerpo).not.toContain("data:image");
    expect(cuerpo).not.toContain("image/jpeg");
  }

  const descarga = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar PDF" }).click();
  const pdf = await readFile(await (await descarga).path());
  expect(pdf.toString("latin1")).toContain("/Subtype /Image");
});

test("escalas del 1 al 10, mediciones en casa y municipio quedan en la ficha", async ({ page }) => {
  await page.goto("/");
  await page.locator("#municipio").fill("Mixco");
  await page.getByRole("button", { name: "Fiebre", exact: true }).click();
  await page.locator("#motivo-cantidad").fill("2");
  const escala = page.locator('[data-escala="intensidad-motivo"]');
  await escala.getByRole("radio", { name: "7 de 10" }).click();
  await expect(escala.getByRole("radio", { name: "7 de 10" })).toHaveAttribute("aria-checked", "true");
  await expect(escala).toContainText("7 de 10 · Fuerte");

  await page.locator("[data-mediciones] summary").click();
  await page.locator("#medicion-temperatura").fill("38.5");
  await page.locator("#medicion-presion").fill("120/80");
  await page.locator("#texto").fill("Tengo fiebre desde ayer.");
  const peticion = page.waitForRequest("**/api/ficha");
  await page.getByRole("button", { name: "Continuar" }).click();
  const cuerpo = (await peticion).postData();
  expect(cuerpo).toContain("Temperatura: 38.5 °C; Presión: 120/80 mmHg");
  expect(cuerpo).not.toContain("Mixco"); // el municipio no se le manda a la IA

  // La intensidad ya se eligió en la escala: no se vuelve a preguntar
  await expect(page.getByText("Pregunta 1 de 2")).toBeVisible();
  await expect(page.locator('[data-escala="intensidad-pregunta"]')).toHaveCount(0);
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "No sé" }).click();
  await expect(page.getByRole("heading", { name: "Envíala a tu médico" })).toBeVisible();
  await expect(page.locator("#ficha-intensidad")).toHaveValue(/^7 de 10/);
  await expect(page.locator("#ficha-mediciones")).toHaveValue("Temperatura: 38.5 °C; Presión: 120/80 mmHg");
  await expect(page.locator("#municipio")).toHaveValue("Mixco");
  // Hombre o sin sexo indicado: no aparece la sección gineco-obstétrica
  await expect(page.getByText("Antecedentes gineco-obstétricos")).toHaveCount(0);
});

test("en una mujer pregunta lo gineco-obstétrico con 'Prefiero no decir', y la intensidad se toca en la escala", async ({ page }) => {
  await page.goto("/");
  await page.locator("#sexo").selectOption("Femenino");
  await page.locator("#edad").fill("29");
  await page.locator("#texto").fill("Me duele el estómago. SIMULAR_GINECO");
  await page.getByRole("button", { name: "Continuar" }).click();

  // La intensidad ya venía llena (5 de 10), así que no se pregunta; quedan menstruación y hábitos
  await expect(page.getByText("Pregunta 1 de 2")).toBeVisible();
  await expect(page.getByRole("heading", { name: /última menstruación/ })).toBeVisible();
  await page.getByRole("button", { name: "Prefiero no decir" }).click();

  await expect(page.getByRole("heading", { name: /Fumas o tomas alcohol/ })).toBeVisible();
  await page.getByRole("button", { name: "Fumo" }).click();
  await page.getByRole("button", { name: "Tomo alcohol" }).click();
  await expect(page.locator("#respuesta")).toHaveValue("Fumo, Tomo alcohol");
  await page.getByRole("button", { name: "Ninguno" }).click();
  await expect(page.locator("#respuesta")).toHaveValue("Ninguno");
  await page.getByRole("button", { name: "Continuar" }).click();
  // Segunda ronda (alergias y síntomas asociados)
  for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "No sé" }).click();

  await expect(page.getByRole("heading", { name: "Envíala a tu médico" })).toBeVisible();
  await expect(page.getByText("Antecedentes gineco-obstétricos")).toBeVisible();
  await expect(page.locator("#ficha-menstruacion")).toHaveValue("Prefiere no decir");
});

test("en una pregunta de intensidad, la escala escribe 'N de 10' sin borrar lo demás", async ({ page }) => {
  await page.goto("/");
  await page.locator("#texto").fill("Dolor de cabeza por las tardes.");
  await page.getByRole("button", { name: "Continuar" }).click();
  // La primera ronda simulada pregunta por la intensidad
  const escala = page.locator('[data-escala="intensidad-pregunta"]');
  await expect(escala).toBeVisible();
  await page.locator("#respuesta").fill("me late la cabeza");
  await escala.getByRole("radio", { name: "4 de 10" }).click();
  await expect(page.locator("#respuesta")).toHaveValue("4 de 10. me late la cabeza");
  await escala.getByRole("radio", { name: "9 de 10" }).click();
  await expect(page.locator("#respuesta")).toHaveValue("9 de 10. me late la cabeza");
  await expect(escala).toContainText("9 de 10 · Muy fuerte");
  await expect(page.getByRole("button", { name: "Prefiero no decir" })).toHaveCount(0);
});

test("consulta de control: retoma la ficha guardada y pregunta por la evolución", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((clave) => {
    localStorage.setItem(
      clave,
      JSON.stringify({
        version: 1,
        guardada: "2026-10-11T18:00:00.000Z",
        datos: { nombre: "María López", edad: "34", sexo: "Femenino", contacto: "5555-1234" },
        base: { enfermedades: "Hipertensión arterial", alergias: "Niega alergias", medicamentos: "Losartán 50 mg" },
        anterior: { fecha: "2026-10-11T18:00:00.000Z", motivo: "Dolor de cabeza por las tardes" },
      })
    );
  }, CLAVE_GUARDADO);

  await page.getByRole("button", { name: /Control o seguimiento/ }).click();
  await expect(page.getByRole("heading", { name: "Tu ficha guardada" })).toBeVisible();
  await expect(page.getByText("Losartán 50 mg")).toBeVisible();
  await expect(page.locator("#nombre")).toHaveValue("María López");
  await expect(
    page.getByRole("heading", {
      name: "¿Cómo evolucionaron tus síntomas desde la consulta anterior y cómo te fue con el tratamiento?",
    })
  ).toBeVisible();

  await page.getByRole("radio", { name: "Mejor", exact: true }).click();
  await page.locator("#texto").fill("El dolor bajó mucho, ahora solo me da algunas noches. Tomé la medicina.");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByText("Pregunta 1 de 2")).toBeVisible();
  await page.locator("#respuesta").fill("Como 3 de 10");
  await page.getByRole("button", { name: "Siguiente pregunta" }).click();
  await expect(page.getByRole("heading", { name: /Sigues tomando tus medicamentos/ })).toBeVisible();
  await page.locator("#respuesta").fill("Sí, sigo igual");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByRole("heading", { name: "Ficha de control y seguimiento" })).toBeVisible();
  await expect(page.getByText("II. Evolución desde la consulta anterior")).toBeVisible();
  await expect(page.locator("#consulta-anterior")).toContainText("Dolor de cabeza por las tardes");
  await expect(page.locator("#ficha-evolucion")).toHaveValue(/^Se siente mejor que en la consulta anterior\. El dolor bajó/);
  await expect(page.locator("#ficha-enfermedades")).toHaveValue("Hipertensión arterial");
  await expect(page.locator("#ficha-medicamentos")).toHaveValue("Losartán 50 mg");

  const whatsapp = await page.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href");
  expect(decodeURIComponent(whatsapp)).toContain("Consulta anterior:");

  // Al guardar, la consulta de control se suma al historial
  await page.getByRole("button", { name: "Guardar en este teléfono" }).click();
  const guardado = await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)), CLAVE_GUARDADO);
  expect(guardado.version).toBe(2);
  expect(guardado.historial).toHaveLength(2);
  expect(guardado.historial[1]).toMatchObject({
    modo: "control",
    evolucion: "Se siente mejor que en la consulta anterior. El dolor bajó; ahora aparece solo algunas noches",
  });

  page.on("dialog", (dialogo) => dialogo.accept());
  await page.getByRole("button", { name: "Empezar una ficha nueva" }).click();
  await page.getByRole("button", { name: /Control o seguimiento/ }).click();
  await expect(page.getByRole("heading", { name: "Historial de consultas (2)" })).toBeVisible();
  await expect(page.locator("[data-historial] li").first()).toContainText("Control");
  await expect(page.locator("[data-historial] li").first()).toContainText("Evolución: Se siente mejor que en la consulta anterior. El dolor bajó");
});

test("en control se pueden editar los antecedentes sin borrar el historial", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((clave) => {
    localStorage.setItem(
      clave,
      JSON.stringify({
        version: 2,
        guardada: "2026-10-11T18:00:00.000Z",
        datos: { nombre: "", edad: "50", sexo: "Masculino", contacto: "" },
        base: { enfermedades: "Hipertensión arterial", alergias: "", medicamentos: "Losartán 50 mg" },
        historial: [
          { fecha: "2026-10-01T18:00:00.000Z", modo: "primera", motivo: "Dolor de cabeza", evolucion: "", tratamiento: "" },
          { fecha: "2026-10-11T18:00:00.000Z", modo: "control", motivo: "Control", evolucion: "Mejoró", tratamiento: "" },
        ],
      })
    );
  }, CLAVE_GUARDADO);

  await page.getByRole("button", { name: /Control o seguimiento/ }).click();
  await page.getByRole("button", { name: "Editar" }).click();
  await page.locator("#base-medicamentos").fill("Losartán 50 mg y metformina 850 mg");
  await page.locator("#base-alergias").fill("Penicilina");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByText("Cambios guardados. Tu historial sigue igual.")).toBeVisible();
  await expect(page.locator('[data-base="medicamentos"]')).toHaveText("Losartán 50 mg y metformina 850 mg");
  await expect(page.getByRole("heading", { name: "Historial de consultas (2)" })).toBeVisible();
  const guardado = await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)), CLAVE_GUARDADO);
  expect(guardado.base).toEqual({
    enfermedades: "Hipertensión arterial",
    alergias: "Penicilina",
    medicamentos: "Losartán 50 mg y metformina 850 mg",
  });
  expect(guardado.historial).toHaveLength(2);

  // La consulta usa los antecedentes nuevos
  await page.locator("#texto").fill("Sigo mejor, ya casi no me duele.");
  const peticion = page.waitForRequest("**/api/ficha");
  await page.getByRole("button", { name: "Continuar" }).click();
  expect((await peticion).postData()).toContain("metformina 850 mg");
});

test("se puede borrar la ficha guardada", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((clave) => {
    localStorage.setItem(
      clave,
      JSON.stringify({
        version: 1,
        guardada: "2026-10-11T18:00:00.000Z",
        datos: { nombre: "", edad: "", sexo: "", contacto: "" },
        base: { enfermedades: "", alergias: "", medicamentos: "Losartán 50 mg" },
        anterior: { fecha: "2026-10-11T18:00:00.000Z", motivo: "Dolor de cabeza" },
      })
    );
  }, CLAVE_GUARDADO);
  page.on("dialog", (dialogo) => dialogo.accept());
  await page.getByRole("button", { name: /Control o seguimiento/ }).click();
  await page.getByRole("button", { name: "Borrar mi ficha guardada" }).click();
  await expect(page.getByText("Borramos la ficha guardada")).toBeVisible();
  expect(await page.evaluate((clave) => localStorage.getItem(clave), CLAVE_GUARDADO)).toBeNull();
});

test("muestra el aviso de alarma ante un dolor de pecho", async ({ page }) => {
  await page.goto("/");
  await page.locator("#texto").fill("Tengo dolor de pecho desde hace una hora");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Busca atención médica ahora")).toBeVisible();
});

test("explica el error cuando la IA llega a su límite de uso", async ({ page }) => {
  await page.goto("/");
  await page.locator("#texto").fill("SIMULAR_LIMITE");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Se alcanzó el límite de uso de la IA")).toBeVisible({ timeout: 45_000 });
});

// Reconocimiento de voz simulado: devuelve frases conocidas para revisar la transcripción en vivo.
function reconocimientoFalso() {
  class ReconocimientoFalso {
    start() {
      window.reconocimientoIniciado = true;
      this.temporizadores = [
        setTimeout(() => this.emitir(false, "me duele"), 150),
        setTimeout(() => this.emitir(true, "Me duele la cabeza"), 300),
        setTimeout(() => this.emitir(false, "desde hace"), 450),
      ];
    }
    stop() {
      this.temporizadores.forEach(clearTimeout);
      setTimeout(() => {
        this.emitir(true, "desde hace tres días"); // el navegador entrega lo último al detener
        this.onend?.();
      }, 50);
    }
    abort() {
      this.temporizadores?.forEach(clearTimeout);
    }
    emitir(final, texto) {
      const resultado = [{ transcript: texto }];
      resultado.isFinal = final;
      this.onresult?.({ resultIndex: 0, results: [resultado] });
    }
  }
  window.SpeechRecognition = ReconocimientoFalso;
}

// La transcripción en vivo solo se activa en computadora (decisión 8): aquí se simula una.
test.describe("en computadora", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    isMobile: false,
    hasTouch: false,
    viewport: { width: 1280, height: 800 },
  });

  test("transcribe en vivo, deja volver a escuchar y grabar de nuevo", async ({ page }) => {
    await page.addInitScript(reconocimientoFalso);
    await page.goto("/");

    await page.getByRole("button", { name: "Grabar" }).click();
    const enVivo = page.locator("[data-transcripcion-en-vivo]");
    await expect(enVivo).toContainText("Me duele la cabeza");
    await expect(enVivo).toContainText("desde hace");
    await page.getByRole("button", { name: "Detener" }).click();

    await expect(page.getByText("Escucha tu grabación")).toBeVisible();
    await expect(page.locator("audio")).toBeVisible();
    await expect(page.locator("[data-transcripcion]")).toHaveText("Me duele la cabeza desde hace tres días");

    await page.getByRole("button", { name: "Grabar de nuevo" }).click();
    await expect(page.getByRole("button", { name: "Detener" })).toBeVisible();
    await expect(page.locator("audio")).toHaveCount(0);
    await expect(enVivo).toContainText("Me duele la cabeza");
    await page.getByRole("button", { name: "Detener" }).click();
    await expect(page.locator("[data-transcripcion]")).toHaveText("Me duele la cabeza desde hace tres días");

    await page.getByRole("button", { name: "Borrar", exact: true }).click();
    await expect(page.locator("audio")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Grabar" })).toBeVisible();
  });

  test("sin reconocimiento de voz en el navegador, igual graba y avisa", async ({ page }) => {
    await page.addInitScript(() => {
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Grabar" }).click();
    await expect(page.getByText("Este navegador no muestra el texto mientras hablas")).toBeVisible();
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Detener" }).click();
    await expect(page.locator("audio")).toBeVisible();
    await expect(page.locator("[data-transcripcion]")).toHaveCount(0);
  });
});

test("en el teléfono no usa el reconocimiento de voz, para no cortar la grabación", async ({ page }) => {
  await page.addInitScript(reconocimientoFalso); // aunque el navegador lo tenga
  await page.goto("/");
  await page.getByRole("button", { name: "Grabar" }).click();
  await expect(page.getByText("Te estamos escuchando")).toBeVisible();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Detener" }).click();
  await expect(page.locator("audio")).toBeVisible();
  expect(await page.evaluate(() => window.reconocimientoIniciado ?? false)).toBe(false);
  await expect(page.locator("[data-transcripcion]")).toHaveCount(0);
});
