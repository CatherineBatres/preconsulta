// Pruebas unitarias de lib/ficha.js con el ejecutor de pruebas que trae Node (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CAMPOS,
  fichaComoTexto,
  fichaVacia,
  lineaPaciente,
  motivoConEvolucion,
  esSoloSi,
  aplicaGineco,
  leerIntensidad,
  ponerIntensidad,
  respuestasRapidasPara,
  textoMediciones,
  porcentajeCompleto,
  normalizarFicha,
  PRIORIDAD,
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

// ---- Modos: primera vez y consulta de control ----
import { aplicarRespuestas, camposPreguntables, seccionesPara, SIN_RESPUESTA } from "../../lib/ficha.js";

test("la sección de evolución solo aparece en la consulta de control", () => {
  const primera = seccionesPara("primera").map((s) => s.titulo);
  const control = seccionesPara("control").map((s) => s.titulo);
  assert.ok(!primera.includes("Evolución desde la consulta anterior"));
  assert.equal(control[1], "Evolución desde la consulta anterior");
  assert.equal(control.length, primera.length + 1);
});

test("en control se pregunta primero por la evolución; el motivo nunca se pregunta", () => {
  assert.deepEqual(camposPreguntables("control").slice(0, 2), ["evolucion", "tratamiento"]);
  assert.ok(!camposPreguntables("primera").includes("evolucion"));
  assert.ok(!camposPreguntables("control").includes("motivo"));
});

test("'No sé' y 'No aplica' quedan escritos, y lo que se dejó en blanco queda como 'Sin respuesta'", () => {
  const ficha = { ...fichaVacia(), duracion: "Dos horas" };
  const respondidas = [
    { campo: "medicamentos", respuesta: "No sé", conAudio: false },
    { campo: "alergias", respuesta: "No aplica", conAudio: false },
    { campo: "sintomas", respuesta: "", conAudio: false },
    { campo: "habitos", respuesta: "", conAudio: true },
    { campo: "duracion", respuesta: "No sé", conAudio: false },
  ];
  const parcial = aplicarRespuestas(ficha, respondidas);
  assert.equal(parcial.medicamentos, "No sabe");
  assert.equal(parcial.alergias, "No aplica");
  assert.equal(parcial.sintomas, "");
  const final = aplicarRespuestas(ficha, respondidas, { final: true });
  assert.equal(final.sintomas, SIN_RESPUESTA);
  assert.equal(final.habitos, "", "si respondió con audio no se marca como 'Sin respuesta'");
  assert.equal(final.duracion, "Dos horas", "nunca pisa un dato que ya existe");
});

test("fichaComoTexto de control incluye la consulta anterior y la evolución", () => {
  const ficha = { ...fichaVacia(), motivo: "Control de dolor de cabeza", evolucion: "Mejoró" };
  const texto = fichaComoTexto({ nombre: "", edad: "", sexo: "", contacto: "" }, ficha, {
    modo: "control",
    anterior: { fecha: "2026-10-11T18:00:00.000Z", motivo: "Dolor de cabeza" },
  });
  assert.match(texto, /^\*Ficha de control y seguimiento\*/);
  assert.match(texto, /Consulta anterior: .*2026: Dolor de cabeza/);
  assert.match(texto, /\*Evolución desde la consulta anterior\*\n- Evolución de los síntomas: Mejoró/);
});

test("motivoConEvolucion arma el motivo como lo escribe un médico", () => {
  assert.equal(motivoConEvolucion("Fiebre", "5"), "Fiebre de 5 días de evolución");
  assert.equal(motivoConEvolucion("Tos", 1), "Tos de 1 día de evolución");
  assert.equal(motivoConEvolucion("Dolor de rodilla", 2, "semanas"), "Dolor de rodilla de 2 semanas de evolución");
  assert.equal(motivoConEvolucion("Mareo", ""), "Mareo");
  assert.equal(motivoConEvolucion("  ", 3), "");
});

test("la prioridad de preguntas usa campos que existen y empieza por el síntoma principal", () => {
  const ids = new Set(CAMPOS.map((c) => c.id));
  for (const id of PRIORIDAD) assert.ok(ids.has(id), id);
  assert.ok(PRIORIDAD.indexOf("tomado") < PRIORIDAD.indexOf("sintomas"));
  assert.ok(PRIORIDAD.indexOf("caracteristicas") < PRIORIDAD.indexOf("sintomas"));
  assert.ok(PRIORIDAD.includes("contactos"));
});

test("esSoloSi reconoce un 'sí' sin detalle, con o sin acento", () => {
  for (const r of ["Sí", "si", "SI.", " sí! ", "Claro", "sip", "Así es"]) assert.equal(esSoloSi(r), true, r);
  for (const r of ["", "No", "Sí, a la penicilina", "Sí tomo losartán", "No sé"]) assert.equal(esSoloSi(r), false, r);
});

test("los antecedentes van en el orden del médico: alergias primero", () => {
  const antecedentes = CAMPOS.filter((c) => ["alergias", "enfermedades", "cirugias", "medicamentos"].includes(c.id));
  assert.deepEqual(antecedentes.map((c) => c.id), ["alergias", "enfermedades", "cirugias", "medicamentos"]);
  assert.ok(PRIORIDAD.indexOf("alergias") < PRIORIDAD.indexOf("medicamentos"));
});

test("lineaPaciente incluye la ocupación", () => {
  assert.equal(lineaPaciente({ edad: "40", sexo: "Femenino", ocupacion: "Maestra" }), "40 años, Femenino, Maestra");
});

test("fichaComoTexto avisa cuántas fotos van en el PDF", () => {
  const ficha = { ...fichaVacia(), motivo: "Roncha" };
  assert.match(fichaComoTexto({}, ficha, { fotos: 2 }), /Hay 2 fotos adjuntas en el PDF/);
  assert.match(fichaComoTexto({}, ficha, { fotos: 1 }), /Hay 1 foto adjunta en el PDF/);
  assert.doesNotMatch(fichaComoTexto({}, ficha), /foto/);
});

test("la sección gineco-obstétrica solo aplica a mujeres de 10 años o más", () => {
  assert.equal(aplicaGineco({ sexo: "Femenino", edad: "29" }), true);
  assert.equal(aplicaGineco({ sexo: "Femenino", edad: "" }), true);
  assert.equal(aplicaGineco({ sexo: "Femenino", edad: "7" }), false);
  assert.equal(aplicaGineco({ sexo: "Masculino", edad: "29" }), false);
  assert.equal(aplicaGineco({}), false);
  assert.ok(camposPreguntables("primera", { sexo: "Femenino" }).includes("menstruacion"));
  assert.ok(!camposPreguntables("primera", { sexo: "Masculino" }).includes("menstruacion"));
  assert.ok(!camposPreguntables("primera").includes("mediciones")); // las mediciones nunca se preguntan
});

test("la escala de intensidad pone 'N de 10' sin borrar lo que se escribió", () => {
  assert.equal(ponerIntensidad("", 7), "7 de 10");
  assert.equal(ponerIntensidad("me late", 4), "4 de 10. me late");
  assert.equal(ponerIntensidad("4 de 10. me late", 9), "9 de 10. me late");
  assert.equal(leerIntensidad("9 de 10. me late"), 9);
  assert.equal(ponerIntensidad("Moderada, 6 de 10", 7), "7 de 10. Moderada");
  assert.equal(leerIntensidad("fuerte"), 0);
});

test("mediciones y respuestas rápidas", () => {
  assert.equal(textoMediciones({ temperatura: "38.5", presion: " ", peso: "150" }), "Temperatura: 38.5 °C; Peso: 150 lb");
  assert.equal(textoMediciones({}), "");
  assert.ok(respuestasRapidasPara("menstruacion").includes("Prefiero no decir"));
  assert.ok(!respuestasRapidasPara("alergias").includes("Prefiero no decir"));
});

test("porcentajeCompleto cuenta lo que ya tiene dato y lo respondido en la ronda", () => {
  const vacia = fichaVacia();
  assert.equal(porcentajeCompleto(vacia), 0);
  const conMotivo = { ...vacia, motivo: "Tos" };
  const uno = porcentajeCompleto(conMotivo);
  assert.ok(uno > 0 && uno < 20);
  assert.ok(porcentajeCompleto(conMotivo, "primera", {}, ["alergias"]) > uno);
  const llena = Object.fromEntries(Object.keys(vacia).map((k) => [k, "x"]));
  assert.equal(porcentajeCompleto(llena), 100);
});
