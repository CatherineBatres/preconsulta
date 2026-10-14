// Servidor de prueba que imita la API de Gemini (Interactions API).
// Las pruebas de punta a punta apuntan la app aquí con GOOGLE_GEMINI_BASE_URL,
// así no gastan la llave real ni dependen de internet.
import http from "node:http";

const PUERTO = Number(process.env.PUERTO_GEMINI_FALSO || 3222);

const vacia = {
  motivo: "", evolucion: "", tratamiento: "", inicio: "", duracion: "", intensidad: "", factores: "",
  sintomas: "", enfermedades: "", cirugias: "", alergias: "", medicamentos: "", familiares: "", habitos: "", dudas: "",
};

// Primera vez: el relato trae el motivo, el inicio y una enfermedad crónica.
const primeraInicial = {
  ...vacia,
  motivo: "Dolor de cabeza por las tardes desde hace tres días",
  inicio: "Hace tres días",
  factores: "Empeora frente a la computadora",
  enfermedades: "Hipertensión arterial",
  cirugias: "Niega cirugías",
  familiares: "Madre con migraña",
  habitos: "Duerme unas cinco horas",
  dudas: "¿Necesito exámenes?",
};
const primeraCompleta = {
  ...primeraInicial,
  duracion: "Unas dos horas cada tarde",
  intensidad: "Moderada, 6 de 10",
};
// Preguntas que la IA propone. La app descarta las de campos ya llenos o ya preguntados.
const preguntasRonda1 = [
  { campo: "duracion", pregunta: "¿Cuánto tiempo te dura el dolor cada vez?" },
  { campo: "intensidad", pregunta: "Del 1 al 10, ¿qué tan fuerte es el dolor?" },
  { campo: "medicamentos", pregunta: "¿Qué medicamentos tomas actualmente?" },
];
const preguntasSiguientes = [
  { campo: "duracion", pregunta: "¿Cuánto tiempo te dura el dolor?" },
  { campo: "alergias", pregunta: "¿Eres alérgica a algún medicamento?" },
  { campo: "sintomas", pregunta: "¿Has notado otros síntomas junto con el dolor?" },
];

function responder(res, estado, cuerpo) {
  res.writeHead(estado, { "content-type": "application/json" });
  res.end(JSON.stringify(cuerpo));
}

function fichaBase(texto) {
  const linea = texto.split("\n").find((l) => l.startsWith("Ficha base guardada (JSON): "));
  if (!linea) return {};
  try {
    return JSON.parse(linea.slice("Ficha base guardada (JSON): ".length));
  } catch {
    return {};
  }
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
      const control = texto.includes("MODO: control");
      let salida;

      if (control) {
        const base = fichaBase(texto);
        const ficha = {
          ...vacia,
          motivo: "Control de dolor de cabeza",
          evolucion: "El dolor bajó; ahora aparece solo algunas noches",
          tratamiento: "Tomó el medicamento indicado y le ayudó",
          enfermedades: base.enfermedades || "",
          alergias: base.alergias || "",
          medicamentos: base.medicamentos || "",
          intensidad: completar ? "Leve, 3 de 10" : "",
        };
        salida = {
          transcripcion: !completar && hayAudio ? "El dolor bajó mucho, ahora solo me da algunas noches." : "",
          alarma: "",
          ficha,
          preguntas: completar
            ? []
            : [
                { campo: "intensidad", pregunta: "Del 1 al 10, ¿qué tan fuerte es ahora el dolor?" },
                { campo: "medicamentos", pregunta: "¿Sigues tomando tus medicamentos o empezaste alguno nuevo?" },
              ],
        };
      } else {
        salida = {
          transcripcion: !completar && hayAudio ? "Desde hace tres días tengo dolor de cabeza por las tardes." : "",
          alarma: texto.includes("pecho")
            ? "El dolor de pecho puede necesitar atención urgente. Acude a emergencias de inmediato."
            : "",
          ficha: completar ? primeraCompleta : primeraInicial,
          preguntas: completar ? preguntasSiguientes : preguntasRonda1,
        };
      }

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
