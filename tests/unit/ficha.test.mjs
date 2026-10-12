// Pruebas unitarias de lib/ficha.js con el ejecutor de pruebas que trae Node (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CAMPOS,
  fichaComoTexto,
  fichaVacia,
  lineaPaciente,
  normalizarFicha,
  tituloNumerado,
} from "../../lib/ficha.js";

test("la ficha vacía tiene todos los campos y todos están vacíos", () => {
  const ficha = fichaVacia();
  assert.deepEqual(Object.keys(ficha), CAMPOS.map((c) => c.id));
  assert.ok(Object.values(ficha).every((valor) => valor === ""));
});

test("normalizarFicha completa los campos que faltan, recorta espacios e ignora lo que no es texto", () => {
  const ficha = normalizarFicha({ motivo: "  Dolor de cabeza  ", alergias: 42, extra: "no va" });
  assert.equal(ficha.motivo, "Dolor de cabeza");
  assert.equal(ficha.alergias, "");
  assert.equal(ficha.extra, undefined);
  assert.equal(Object.keys(ficha).length, CAMPOS.length);
});

test("normalizarFicha aguanta una respuesta vacía o rota de la IA", () => {
  assert.deepEqual(normalizarFicha(undefined), fichaVacia());
  assert.deepEqual(normalizarFicha(null), fichaVacia());
});

test("lineaPaciente omite 'Prefiero no decir' y los datos vacíos", () => {
  assert.equal(lineaPaciente({ edad: "34", sexo: "Femenino" }), "34 años, Femenino");
  assert.equal(lineaPaciente({ edad: "34", sexo: "Prefiero no decir" }), "34 años");
  assert.equal(lineaPaciente({ edad: "", sexo: "" }), "");
});

test("tituloNumerado usa números romanos como una historia clínica", () => {
  assert.equal(tituloNumerado(0, "Datos generales"), "I. Datos generales");
  assert.equal(tituloNumerado(3, "Antecedentes"), "IV. Antecedentes");
});

test("fichaComoTexto solo incluye las secciones con datos", () => {
  const ficha = { ...fichaVacia(), motivo: "Dolor de cabeza", alergias: "Niega alergias" };
  const texto = fichaComoTexto({ nombre: "María López", edad: "34", sexo: "Femenino", contacto: "" }, ficha);
  assert.match(texto, /^\*Ficha previa a la consulta\*/);
  assert.match(texto, /Paciente: María López/);
  assert.match(texto, /\*Motivo de consulta\*\nDolor de cabeza/);
  assert.match(texto, /- Alergias: Niega alergias/);
  assert.doesNotMatch(texto, /Hábitos/);
  assert.doesNotMatch(texto, /Contacto/);
});

test("fichaComoTexto sin negritas sirve para correo", () => {
  const texto = fichaComoTexto({ nombre: "", edad: "", sexo: "", contacto: "" }, fichaVacia(), { negritas: false });
  assert.ok(texto.startsWith("FICHA PREVIA A LA CONSULTA"));
  assert.doesNotMatch(texto, /\*/);
});
