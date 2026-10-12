// Pruebas de punta a punta: abren la app en un Chrome con tamaño de teléfono,
// usan un micrófono simulado y una IA simulada (tests/gemini-falso.mjs).
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

async function grabar(page, milisegundos = 1500) {
  await page.getByRole("button", { name: "Grabar" }).click();
  await page.waitForTimeout(milisegundos);
  await page.getByRole("button", { name: "Detener" }).click();
  await expect(page.locator("audio")).toBeVisible();
}

test("relato por voz, preguntas una a la vez, ficha editable y PDF", async ({ page }) => {
  await page.goto("/");

  // Paso 1: no deja continuar sin relato
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Graba un audio o escribe qué te sucede")).toBeVisible();

  await page.locator("#nombre").fill("María López");
  await page.locator("#edad").fill("34");
  await page.locator("#sexo").selectOption("Femenino");
  await grabar(page, 2000);
  await page.getByRole("button", { name: "Continuar" }).click();

  // Paso 2: entrevista
  await expect(page.getByText("Pregunta 1 de 3")).toBeVisible();
  await page.locator("#respuesta").fill("Como dos horas");
  await page.getByRole("button", { name: "Siguiente pregunta" }).click();
  await expect(page.getByText("Pregunta 2 de 3")).toBeVisible();
  await expect(page.locator("#respuesta")).toHaveValue("");
  await grabar(page);
  await page.getByRole("button", { name: "Siguiente pregunta" }).click();
  await expect(page.getByText("Pregunta 3 de 3")).toBeVisible();
  await expect(page.locator("audio")).toHaveCount(0);
  await page.getByRole("button", { name: "Ver mi ficha" }).click();

  // Paso 3: la ficha como hoja clínica, con lo que devolvió la IA
  await expect(page.getByRole("heading", { name: "Envíala a tu médico" })).toBeVisible();
  await expect(page.locator("#ficha-intensidad")).toHaveValue("Moderada, 6 de 10");
  await expect(page.locator("#nombre")).toHaveValue("María López");
  await expect(page.getByText("IV. Antecedentes")).toBeVisible();
  await page.locator("#ficha-cirugias").fill("Apendicectomía en 2015");

  const descarga = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar PDF" }).click();
  const archivo = await descarga;
  const contenido = await readFile(await archivo.path());
  expect(contenido.subarray(0, 5).toString()).toBe("%PDF-");

  // "Compartir PDF" usa el menú de compartir del teléfono; aquí se simula para revisar el archivo que recibe.
  await page.evaluate(() => {
    window.compartido = null;
    navigator.canShare = (datos) => Boolean(datos?.files?.length);
    navigator.share = async (datos) => {
      window.compartido = { nombre: datos.files[0].name, tipo: datos.files[0].type };
    };
  });
  await page.getByRole("button", { name: "Compartir PDF" }).click();
  await expect
    .poll(() => page.evaluate(() => window.compartido))
    .toEqual({ nombre: "ficha-María-López.pdf", tipo: "application/pdf" });

  const whatsapp = await page.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href");
  expect(decodeURIComponent(whatsapp)).toContain("Cirugías: Apendicectomía en 2015");
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
