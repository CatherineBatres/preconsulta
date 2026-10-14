// Pruebas de las reglas que deciden qué preguntas de la IA llegan al paciente.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fichaVacia } from "../../lib/ficha.js";
import { filtrarPreguntas } from "../../lib/preguntas.js";

const p = (campo) => ({ campo, pregunta: `¿Pregunta sobre ${campo}?` });

test("descarta campos ya llenos, ya preguntados, repetidos o inexistentes", () => {
  const ficha = { ...fichaVacia(), inicio: "Hace tres días" };
  const utiles = filtrarPreguntas([p("inicio"), p("duracion"), p("duracion"), p("alergias"), p("inventado")], {
    modo: "primera",
    ficha,
    yaPreguntados: ["alergias"],
  });
  assert.deepEqual(utiles.map((u) => u.campo), ["duracion"]);
});

test("ordena por prioridad y deja como máximo cinco", () => {
  const campos = ["dudas", "habitos", "familiares", "cirugias", "enfermedades", "alergias", "duracion"];
  const utiles = filtrarPreguntas(campos.map(p), { modo: "primera", ficha: fichaVacia(), yaPreguntados: [] });
  assert.deepEqual(utiles.map((u) => u.campo), ["duracion", "alergias", "enfermedades", "cirugias", "familiares"]);
});

test("en primera vez nunca pregunta por la evolución", () => {
  const utiles = filtrarPreguntas([p("evolucion"), p("tratamiento")], { modo: "primera", ficha: fichaVacia(), yaPreguntados: [] });
  assert.equal(utiles.length, 0);
});

test("en control permite una sola pregunta para confirmar la ficha base", () => {
  const ficha = { ...fichaVacia(), medicamentos: "Losartán 50 mg", alergias: "Niega alergias" };
  const utiles = filtrarPreguntas([p("medicamentos"), p("alergias"), p("intensidad")], {
    modo: "control",
    ficha,
    yaPreguntados: [],
  });
  assert.deepEqual(utiles.map((u) => u.campo), ["intensidad", "medicamentos"]);
});
