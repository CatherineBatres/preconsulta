// Configuración de las pruebas de punta a punta (npm run test:e2e).
// Levanta dos servidores: la IA simulada y la app ya compilada apuntando a ella.
import { defineConfig, devices } from "@playwright/test";

const PUERTO_APP = 3100;
const PUERTO_GEMINI = 3222;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Pixel 7"],
    baseURL: `http://localhost:${PUERTO_APP}`,
    permissions: ["microphone"],
    launchOptions: {
      // Micrófono simulado: Chrome genera un tono en lugar de pedir el micrófono real.
      args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
      // Opcional: usar un Chrome ya instalado en otra ruta.
      executablePath: process.env.CHROMIUM_PATH || undefined,
    },
  },
  webServer: [
    {
      command: "node tests/gemini-falso.mjs",
      port: PUERTO_GEMINI,
      env: { PUERTO_GEMINI_FALSO: String(PUERTO_GEMINI) },
      reuseExistingServer: false,
    },
    {
      command: `npm run build && npm run start -- -p ${PUERTO_APP}`,
      port: PUERTO_APP,
      timeout: 240_000,
      reuseExistingServer: false,
      // La llave es de mentira y la URL apunta a la IA simulada: nunca se llama a Google.
      env: { GEMINI_API_KEY: "llave-de-prueba", GOOGLE_GEMINI_BASE_URL: `http://localhost:${PUERTO_GEMINI}` },
    },
  ],
});
