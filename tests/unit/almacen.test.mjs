// Pruebas de la ficha guardada en el teléfono, con un localStorage simulado.
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { fichaVacia } from "../../lib/ficha.js";
import { borrarFichaGuardada, guardarFicha, leerFichaGuardada } from "../../lib/almacen.js";

function localStorageFalso() {
  const datos = new Map();
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor)),
    removeItem: (clave) => datos.delete(clave),
  };
}

beforeEach(() => {
  globalThis.window = { localStorage: localStorageFalso() };
});

test("sin nada guardado devuelve null", () => {
  assert.equal(leerFichaGuardada(), null);
});

test("guarda solo la ficha base y el motivo, sin 'No sabe' ni 'Sin respuesta'", () => {
  const ficha = {
    ...fichaVacia(),
    motivo: "Dolor de cabeza",
    enfermedades: "Hipertensión",
    alergias: "Sin respuesta",
    medicamentos: "No sabe",
    sintomas: "Náusea",
  };
  guardarFicha({ nombre: "María López", edad: "34", sexo: "Femenino", contacto: "" }, ficha);
  const registro = leerFichaGuardada();
  assert.equal(registro.datos.nombre, "María López");
  assert.deepEqual(registro.base, { enfermedades: "Hipertensión", alergias: "", medicamentos: "" });
  assert.equal(registro.anterior.motivo, "Dolor de cabeza");
  assert.equal(registro.base.sintomas, undefined);
});

test("borrar la deja vacía", () => {
  guardarFicha({ nombre: "", edad: "", sexo: "", contacto: "" }, fichaVacia());
  assert.ok(leerFichaGuardada());
  borrarFichaGuardada();
  assert.equal(leerFichaGuardada(), null);
});

test("si el navegador no deja guardar, no se rompe", () => {
  globalThis.window = { localStorage: { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); }, removeItem() {} } };
  assert.equal(guardarFicha({ nombre: "", edad: "", sexo: "", contacto: "" }, fichaVacia()), null);
  assert.equal(leerFichaGuardada(), null);
});

// ---- Historial de consultas ----
test("cada guardado agrega una consulta al historial, con evolución solo en control", () => {
  const datos = { nombre: "María", edad: "34", sexo: "Femenino", contacto: "" };
  guardarFicha(datos, { ...fichaVacia(), motivo: "Dolor de cabeza", evolucion: "no aplica aquí" }, "primera");
  guardarFicha(datos, { ...fichaVacia(), motivo: "Control", evolucion: "Mejoró", tratamiento: "Le ayudó" }, "control");
  const registro = leerFichaGuardada();
  assert.equal(registro.version, 2);
  assert.equal(registro.historial.length, 2);
  assert.equal(registro.historial[0].evolucion, "");
  assert.deepEqual(
    { modo: registro.anterior.modo, motivo: registro.anterior.motivo, evolucion: registro.anterior.evolucion },
    { modo: "control", motivo: "Control", evolucion: "Mejoró" }
  );
});

test("el historial guarda como máximo las últimas 10 consultas", () => {
  for (let i = 1; i <= 12; i++) {
    guardarFicha({ nombre: "", edad: "", sexo: "", contacto: "" }, { ...fichaVacia(), motivo: `Visita ${i}` });
  }
  const registro = leerFichaGuardada();
  assert.equal(registro.historial.length, 10);
  assert.equal(registro.historial[0].motivo, "Visita 3");
  assert.equal(registro.anterior.motivo, "Visita 12");
});

test("convierte lo guardado con la versión anterior sin perderlo", () => {
  window.localStorage.setItem(
    "preconsulta.fichaBase.v1",
    JSON.stringify({
      version: 1,
      guardada: "2026-10-11T18:00:00.000Z",
      datos: { nombre: "María", edad: "", sexo: "", contacto: "" },
      base: { enfermedades: "Hipertensión", alergias: "", medicamentos: "" },
      anterior: { fecha: "2026-10-11T18:00:00.000Z", motivo: "Dolor de cabeza" },
    })
  );
  const registro = leerFichaGuardada();
  assert.equal(registro.historial.length, 1);
  assert.equal(registro.anterior.motivo, "Dolor de cabeza");
  guardarFicha(registro.datos, { ...fichaVacia(), motivo: "Control" }, "control");
  assert.equal(leerFichaGuardada().historial.length, 2);
});
