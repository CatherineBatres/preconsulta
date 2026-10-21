// Ficha base e historial de consultas guardados en el teléfono del paciente
// (localStorage del navegador). Nunca salen del dispositivo: no hay servidor ni base
// de datos. Solo se guarda si el paciente lo pide, y puede borrarlo cuando quiera.
import { CAMPOS_BASE, RESPUESTAS_RAPIDAS, SIN_RESPUESTA } from "./ficha.js";

const CLAVE = "preconsulta.fichaBase.v1"; // se mantiene la clave para no perder lo ya guardado
export const MAX_HISTORIAL = 10;

// "No sabe" o "Sin respuesta" no son datos que valga la pena arrastrar a la siguiente consulta.
const NO_GUARDAR = new Set([SIN_RESPUESTA, ...Object.values(RESPUESTAS_RAPIDAS)]);

function limpio(valor) {
  const texto = String(valor ?? "").trim();
  return NO_GUARDAR.has(texto) ? "" : texto;
}

// Convierte lo guardado por versiones anteriores al formato actual (versión 2).
function actualizar(registro) {
  if (registro?.version === 2 && registro.base && Array.isArray(registro.historial)) return registro;
  if (registro?.version === 1 && registro.base) {
    const historial = registro.anterior?.fecha
      ? [{ fecha: registro.anterior.fecha, modo: "primera", motivo: registro.anterior.motivo || "", evolucion: "", tratamiento: "" }]
      : [];
    return { version: 2, guardada: registro.guardada, datos: registro.datos, base: registro.base, historial };
  }
  return null;
}

// Devuelve el registro guardado con "anterior" = la consulta más reciente, o null.
export function leerFichaGuardada() {
  try {
    const texto = window.localStorage.getItem(CLAVE);
    if (!texto) return null;
    const registro = actualizar(JSON.parse(texto));
    if (!registro) return null;
    return { ...registro, anterior: registro.historial.at(-1) ?? null };
  } catch {
    return null;
  }
}

// Guarda los datos generales y la ficha base, y agrega esta consulta al historial.
// Devuelve el registro guardado, o null si el navegador no lo permitió.
export function guardarFicha(datos, ficha, modo = "primera") {
  const previo = leerFichaGuardada();
  const consulta = {
    fecha: new Date().toISOString(),
    modo,
    motivo: limpio(ficha.motivo),
    evolucion: modo === "control" ? limpio(ficha.evolucion) : "",
    tratamiento: modo === "control" ? limpio(ficha.tratamiento) : "",
  };
  const registro = {
    version: 2,
    guardada: consulta.fecha,
    datos: {
      nombre: limpio(datos.nombre),
      edad: limpio(datos.edad),
      sexo: limpio(datos.sexo),
      contacto: limpio(datos.contacto),
    },
    base: Object.fromEntries(CAMPOS_BASE.map((id) => [id, limpio(ficha[id])])),
    historial: [...(previo?.historial ?? []), consulta].slice(-MAX_HISTORIAL),
  };
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(registro));
    return { ...registro, anterior: consulta };
  } catch {
    return null;
  }
}

// Cambia los antecedentes guardados (enfermedades, alergias, medicamentos) sin tocar
// el historial de consultas. Devuelve el registro actualizado, o null si no se pudo.
export function actualizarBase(cambios) {
  const previo = leerFichaGuardada();
  if (!previo) return null;
  const { anterior, ...registro } = previo;
  const base = { ...registro.base };
  for (const id of CAMPOS_BASE) {
    if (id in cambios) base[id] = limpio(cambios[id]);
  }
  const nuevo = { ...registro, base };
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(nuevo));
    return { ...nuevo, anterior };
  } catch {
    return null;
  }
}

export function borrarFichaGuardada() {
  try {
    window.localStorage.removeItem(CLAVE);
    return true;
  } catch {
    return false;
  }
}
