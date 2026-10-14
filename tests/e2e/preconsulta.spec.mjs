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

test("primera vez: preguntas en rondas hasta llenar la ficha, PDF y guardado en el teléfono", async ({ page }) => {
  await page.goto("/");

  // Paso 1: no deja continuar sin relato
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Graba un audio o escribe qué te sucede")).toBeVisible();

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
  await expect(page.locator("#ficha-evolucion")).toHaveValue(/El dolor bajó/);
  await expect(page.locator("#ficha-enfermedades")).toHaveValue("Hipertensión arterial");
  await expect(page.locator("#ficha-medicamentos")).toHaveValue("Losartán 50 mg");

  const whatsapp = await page.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href");
  expect(decodeURIComponent(whatsapp)).toContain("Consulta anterior:");

  // Al guardar, la consulta de control se suma al historial
  await page.getByRole("button", { name: "Guardar en este teléfono" }).click();
  const guardado = await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)), CLAVE_GUARDADO);
  expect(guardado.version).toBe(2);
  expect(guardado.historial).toHaveLength(2);
  expect(guardado.historial[1]).toMatchObject({ modo: "control", evolucion: "El dolor bajó; ahora aparece solo algunas noches" });

  page.on("dialog", (dialogo) => dialogo.accept());
  await page.getByRole("button", { name: "Empezar una ficha nueva" }).click();
  await page.getByRole("button", { name: /Control o seguimiento/ }).click();
  await expect(page.getByRole("heading", { name: "Historial de consultas (2)" })).toBeVisible();
  await expect(page.locator("[data-historial] li").first()).toContainText("Control");
  await expect(page.locator("[data-historial] li").first()).toContainText("Evolución: El dolor bajó");
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
