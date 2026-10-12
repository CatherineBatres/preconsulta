// Servidor de prueba que imita la API de Gemini (Interactions API).
// Las pruebas de punta a punta apuntan la app aquí con GOOGLE_GEMINI_BASE_URL,
// así no gastan la llave real ni dependen de internet.
import http from "node:http";

const PUERTO = Number(process.env.PUERTO_GEMINI_FALSO || 3222);

const fichaInicial = {
  motivo: "Dolor de cabeza por las tardes desde hace tres días",
  inicio: "Hace tres días",
  duracion: "", intensidad: "", factores: "", sintomas: "", enfermedades: "",
  cirugias: "", alergias: "", medicamentos: "", familiares: "", habitos: "", dudas: "",
};
const fichaCompleta = {
  ...fichaInicial,
  duracion: "Unas dos horas cada tarde",
  intensidad: "Moderada, 6 de 10",
  medicamentos: "Acetaminofén 500 mg ocasional",
  alergias: "Niega alergias",
};
const preguntas = [
  "¿Cuánto tiempo te dura el dolor cada vez?",
  "Del 1 al 10, ¿qué tan fuerte es el dolor?",
  "¿Qué medicamentos tomas actualmente?",
];

function responder(res, estado, cuerpo) {
  res.writeHead(estado, { "content-type": "application/json" });
  res.end(JSON.stringify(cuerpo));
}

http
  .createServer((req, res) => {
    let datos = "";
    req.on("data", (parte) => (datos += parte));
    req.on("end", () => {
      let peticion = {};
      try {
        peticion = JSON.parse(datos);
      } catch {}
      const partes = Array.isArray(peticion.input) ? peticion.input : [];
      const texto = partes.find((p) => p.type === "text")?.text ?? "";
      const hayAudio = partes.some((p) => p.type === "audio");

      // Palabra clave para probar el manejo de errores de la app.
      if (texto.includes("SIMULAR_LIMITE")) {
        return responder(res, 429, { error: { code: 429, message: "quota", status: "RESOURCE_EXHAUSTED" } });
      }

      const completar = texto.startsWith("PASO: completar");
      const salida = completar
        ? { transcripcion: "", alarma: "", ficha: fichaCompleta, preguntas: [] }
        : {
            transcripcion: hayAudio ? "Desde hace tres días tengo dolor de cabeza por las tardes." : "",
            alarma: texto.includes("pecho")
              ? "El dolor de pecho puede necesitar atención urgente. Acude a emergencias de inmediato."
              : "",
            ficha: fichaInicial,
            preguntas,
          };

      // Misma forma que la respuesta real: el texto del modelo va dentro de "steps".
      responder(res, 200, {
        id: "prueba",
        status: "completed",
        model: peticion.model,
        steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(salida) }] }],
      });
    });
  })
  .listen(PUERTO, () => console.log(`Gemini simulado en http://localhost:${PUERTO}`));
