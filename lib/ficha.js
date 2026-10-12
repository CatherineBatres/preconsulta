// Estructura de la ficha médica. La usan el servidor (esquema para la IA),
// la pantalla (campos editables) y el PDF, para que siempre coincidan.

export const SECCIONES = [
  {
    titulo: "Motivo de consulta",
    campos: [
      {
        id: "motivo",
        etiqueta: "Motivo de consulta",
        descripcion: "Razón principal de la consulta, en las palabras del paciente.",
      },
    ],
  },
  {
    titulo: "Historia de la enfermedad actual",
    campos: [
      { id: "inicio", etiqueta: "Inicio", descripcion: "Cuándo y cómo empezó." },
      { id: "duracion", etiqueta: "Duración", descripcion: "Cuánto tiempo lleva y con qué frecuencia ocurre." },
      { id: "intensidad", etiqueta: "Intensidad", descripcion: "Qué tan fuerte es, según lo describe el paciente." },
      { id: "factores", etiqueta: "Qué lo mejora o empeora", descripcion: "Lo que el paciente dice que lo alivia o lo agrava." },
      { id: "sintomas", etiqueta: "Síntomas asociados", descripcion: "Otros síntomas que el paciente menciona." },
    ],
  },
  {
    titulo: "Antecedentes",
    campos: [
      { id: "enfermedades", etiqueta: "Enfermedades", descripcion: "Enfermedades previas o crónicas que el paciente refiere." },
      { id: "cirugias", etiqueta: "Cirugías", descripcion: "Cirugías u hospitalizaciones previas." },
      { id: "alergias", etiqueta: "Alergias", descripcion: "Alergias a medicamentos, alimentos u otros." },
      { id: "medicamentos", etiqueta: "Medicamentos actuales", descripcion: "Medicamentos o suplementos que toma, con dosis si la menciona." },
      { id: "familiares", etiqueta: "Antecedentes familiares", descripcion: "Enfermedades de familiares que el paciente menciona." },
    ],
  },
  {
    titulo: "Hábitos",
    campos: [
      { id: "habitos", etiqueta: "Hábitos relevantes", descripcion: "Tabaco, alcohol, sueño, alimentación, ejercicio u otros que mencione." },
    ],
  },
  {
    titulo: "Preguntas para el médico",
    campos: [
      { id: "dudas", etiqueta: "Preguntas del paciente", descripcion: "Dudas que el paciente quiere hacerle al médico." },
    ],
  },
];

export const CAMPOS = SECCIONES.flatMap((seccion) => seccion.campos);

export const SIN_DATO = "No referido";

export function fichaVacia() {
  return Object.fromEntries(CAMPOS.map((campo) => [campo.id, ""]));
}

// Devuelve una ficha con todos los campos como texto, venga lo que venga.
export function normalizarFicha(ficha) {
  const limpia = fichaVacia();
  for (const campo of CAMPOS) {
    const valor = ficha?.[campo.id];
    if (typeof valor === "string") limpia[campo.id] = valor.trim();
  }
  return limpia;
}

export function lineaPaciente(datos) {
  const partes = [];
  if (datos.edad) partes.push(`${datos.edad} años`);
  if (datos.sexo && datos.sexo !== "Prefiero no decir") partes.push(datos.sexo);
  return partes.join(", ");
}

// Versión en texto para enviar por WhatsApp o correo. Solo incluye lo que tiene dato.
export function fichaComoTexto(datos, ficha, { negritas = true } = {}) {
  const b = (texto) => (negritas ? `*${texto}*` : texto.toUpperCase());
  const lineas = [b("Ficha previa a la consulta")];

  if (datos.nombre) lineas.push(`Paciente: ${datos.nombre}`);
  const paciente = lineaPaciente(datos);
  if (paciente) lineas.push(paciente);
  if (datos.contacto) lineas.push(`Contacto: ${datos.contacto}`);

  for (const seccion of SECCIONES) {
    const conDato = seccion.campos.filter((campo) => ficha[campo.id]?.trim());
    if (conDato.length === 0) continue;
    lineas.push("", b(seccion.titulo));
    for (const campo of conDato) {
      const valor = ficha[campo.id].trim();
      lineas.push(seccion.campos.length === 1 ? valor : `- ${campo.etiqueta}: ${valor}`);
    }
  }

  lineas.push("", "Información proporcionada por el paciente antes de la consulta. No es un diagnóstico.");
  return lineas.join("\n");
}
