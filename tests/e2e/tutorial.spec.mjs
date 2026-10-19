// Pruebas del mini tutorial de bienvenida.
import { expect, test } from "@playwright/test";

test("la primera vez muestra el tutorial y deja elegir el tipo de consulta", async ({ page }) => {
  await page.goto("/");
  const tutorial = page.getByRole("dialog");
  await expect(tutorial).toBeVisible();
  await expect(tutorial).toContainText("No te responde un médico");

  for (let i = 0; i < 4; i++) await tutorial.getByRole("button", { name: "Siguiente" }).click();
  await expect(tutorial.getByRole("heading", { name: "¿Qué tipo de consulta es?" })).toBeVisible();
  await tutorial.getByRole("button", { name: /Es una consulta de control/ }).click();

  await expect(tutorial).toBeHidden();
  await expect(page.getByRole("button", { name: /Control o seguimiento/ })).toHaveAttribute("aria-pressed", "true");

  // Al volver a entrar ya no aparece solo, pero se puede abrir con "¿Cómo funciona?".
  await page.reload();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "¿Cómo funciona?" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Saltar" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("se puede saltar el tutorial y queda en primera vez", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Saltar" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: /Primera vez/ })).toHaveAttribute("aria-pressed", "true");
});
