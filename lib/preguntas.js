// Reglas para decidir qué preguntas de la IA llegan al paciente.
import { CAMPOS_BASE, camposPreguntables, PRIORIDAD } from "./ficha.js";

export const MAX_PREGUNTAS = 5;

// Se queda solo con preguntas útiles: de un campo válido para el modo, que siga vacío,
// que no se haya preguntado antes y sin repetir. En control se permite además una
// pregunta para confirmar la ficha base. Quedan en el orden de prioridad.
export function filtrarPreguntas(preguntas, { modo, ficha, yaPreguntados }) {
  const permitidos = new Set(camposPreguntables(modo));
  const preguntados = new Set(yaPreguntados);
  const vistas = new Set();
  let confirmacionBase = false;
  const utiles = [];
  for (const item of Array.isArray(preguntas) ? preguntas : []) {
    const campo = String(item?.campo || "");
    const pregunta = String(item?.pregunta || "").trim();
    if (!pregunta || !permitidos.has(campo) || preguntados.has(campo) || vistas.has(campo)) continue;
    const vacio = !ficha[campo];
    const confirmaBase = modo === "control" && CAMPOS_BASE.includes(campo) && !vacio;
    if (!vacio && !(confirmaBase && !confirmacionBase)) continue;
    if (confirmaBase) confirmacionBase = true;
    vistas.add(campo);
    utiles.push({ campo, pregunta: pregunta.slice(0, 300) });
  }
  utiles.sort((a, b) => PRIORIDAD.indexOf(a.campo) - PRIORIDAD.indexOf(b.campo));
  return utiles.slice(0, MAX_PREGUNTAS);
}
