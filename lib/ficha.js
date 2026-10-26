// Estructura de la ficha médica. La usan el servidor (esquema para la IA),
// la pantalla (campos editables) y el PDF, para que siempre coincidan.

export const MODOS = {
  primera: {
    nombre: "Primera vez",
    tituloFicha: "Ficha previa a la consulta",
    tituloPdf: "Ficha clínica previa a la consulta",
  },
  control: {
    nombre: "Consulta de control o seguimiento",
    tituloFicha: "Ficha de control y seguimiento",
    tituloPdf: "Ficha clínica de control y seguimiento",
  },
};

export const PREGUNTA_DE_CONTROL =
  "¿Cómo evolucionaron tus síntomas desde la consulta anterior y cómo te fue con el tratamiento?";

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
    titulo: "Evolución desde la consulta anterior",
    soloControl: true,
    campos: [
      {
        id: "evolucion",
        etiqueta: "Evolución de los síntomas",
        descripcion: "Solo en consultas de control: cómo cambiaron los síntomas desde la consulta anterior.",
      },
      {
        id: "tratamiento",
        etiqueta: "Respuesta al tratamiento",
        descripcion: "Solo en consultas de control: si siguió el tratamiento indicado, si le ayudó y qué efectos notó.",
      },
    ],
  },
  {
    titulo: "Historia de la enfermedad actual",
    campos: [
      { id: "inicio", etiqueta: "Inicio", descripcion: "Cuándo y cómo empezó." },
      { id: "duracion", etiqueta: "Duración", descripcion: "Cuánto tiempo lleva y con qué frecuencia ocurre." },
      {
        id: "localizacion",
        etiqueta: "Dónde",
        clinica: "Localización",
        descripcion: "En qué parte del cuerpo está el síntoma principal, con las palabras del paciente (por ejemplo 'en la boca del estómago').",
      },
      {
        id: "caracteristicas",
        etiqueta: "Cómo es",
        descripcion:
          "Cómo es el síntoma principal según el paciente: tipo (por ejemplo tos seca o con flema, diarrea acuosa y su color), a qué hora aparece o empeora (mañana o noche) y si se extiende a otra parte del cuerpo.",
      },
      {
        id: "intensidad",
        etiqueta: "Intensidad",
        descripcion:
          "Qué tan fuerte es en una escala del 1 al 10 y su medida propia si la dice: grados de fiebre, cuántos vómitos o deposiciones, y si está tomando líquidos.",
      },
      { id: "factores", etiqueta: "Qué lo mejora o empeora", descripcion: "Lo que el paciente dice que lo alivia o lo agrava." },
      {
        id: "tomado",
        etiqueta: "Lo que ha tomado para esto",
        descripcion: "Medicamentos o remedios que tomó para el problema actual y si le ayudaron.",
      },
      { id: "sintomas", etiqueta: "Síntomas asociados", descripcion: "Otros síntomas que el paciente menciona, además del principal." },
      {
        id: "atribucion",
        etiqueta: "A qué lo atribuye",
        descripcion: "A qué cree el paciente que se debe (por ejemplo 'comí mariscos', 'me golpeé'). Es su opinión, no un diagnóstico.",
      },
    ],
  },
  {
    titulo: "Mediciones tomadas en casa",
    campos: [
      {
        id: "mediciones",
        etiqueta: "Mediciones",
        descripcion:
          "Temperatura, presión, glucosa o peso que el paciente se midió y dijo con números. Si no dio números, vacío. No se pregunta.",
      },
    ],
  },
  {
    titulo: "Antecedentes",
    campos: [
      // Orden pedido por el médico: alergias primero, luego enfermedades, cirugías y medicamentos.
      {
        id: "alergias",
        etiqueta: "Alergias",
        clinica: "Alérgicos",
        descripcion: "A qué medicamentos, alimentos u otros es alérgico y qué le pasa. Si dice que no tiene, 'Niega alergias'.",
      },
      {
        id: "enfermedades",
        etiqueta: "Enfermedades",
        clinica: "Médicos",
        descripcion: "Enfermedades que padece o padeció (presión alta, diabetes, asma…) y desde cuándo, si lo dice.",
      },
      {
        id: "cirugias",
        etiqueta: "Cirugías y hospitalizaciones",
        clinica: "Quirúrgicos",
        descripcion: "Qué cirugías le hicieron y en qué año; hospitalizaciones de más de 3 días, accidentes graves o transfusiones de sangre.",
      },
      {
        id: "medicamentos",
        etiqueta: "Medicamentos actuales",
        descripcion:
          "Medicamentos o suplementos que toma de forma regular. De cada uno: nombre, dosis, cada cuánto, desde cuándo y para qué, si lo dice. Uno por línea.",
      },
      { id: "familiares", etiqueta: "Antecedentes familiares", clinica: "Familiares", descripcion: "Enfermedades de familiares que el paciente menciona." },
      {
        id: "contactos",
        etiqueta: "Contactos, viajes y animales",
        clinica: "Epidemiológicos",
        descripcion:
          "Si alguien en su casa, trabajo o escuela tiene los mismos síntomas; viajes recientes; contacto con animales; picaduras de mosquito u otros insectos.",
      },
    ],
  },
  {
    titulo: "Antecedentes gineco-obstétricos",
    soloMujeres: true,
    campos: [
      {
        id: "menstruacion",
        etiqueta: "Última menstruación",
        clinica: "FUM",
        descripcion: "Fecha de la última menstruación, si podría estar embarazada, o si ya está en la menopausia.",
      },
      {
        id: "embarazos",
        etiqueta: "Embarazos y anticonceptivos",
        clinica: "Obstétricos",
        descripcion: "Cuántos embarazos, partos, cesáreas o pérdidas ha tenido, y qué método anticonceptivo usa, si lo dice.",
      },
    ],
  },
  {
    titulo: "Hábitos",
    campos: [
      {
        id: "habitos",
        etiqueta: "Hábitos relevantes",
        descripcion:
          "Tabaco (cuánto al día y desde cuándo, o si lo dejó), alcohol (cada cuánto), otras sustancias, ejercicio, alimentación y sueño.",
      },
    ],
  },
  {
    titulo: "Preguntas del paciente para el médico",
    campos: [
      { id: "dudas", etiqueta: "Preguntas del paciente", descripcion: "Dudas que el paciente quiere hacerle al médico." },
    ],
  },
];

export const CAMPOS = SECCIONES.flatMap((seccion) => seccion.campos);

// Lo que se guarda en el teléfono para la siguiente consulta.
export const CAMPOS_BASE = ["enfermedades", "alergias", "medicamentos"];

// Orden en que la IA pregunta por los campos vacíos. El motivo sale del relato y no se pregunta.
// Sigue el orden de un interrogatorio médico: primero el síntoma principal (qué ha tomado,
// cómo es, qué tan fuerte, qué lo cambia), después los síntomas asociados y los antecedentes.
export const PRIORIDAD = [
  "evolucion",
  "tratamiento",
  "inicio",
  "localizacion",
  "tomado",
  "caracteristicas",
  "intensidad",
  "factores",
  "duracion",
  "sintomas",
  "atribucion",
  "alergias",
  "enfermedades",
  "medicamentos",
  "cirugias",
  "contactos",
  "familiares",
  "menstruacion",
  "embarazos",
  "habitos",
  "dudas",
];

// Motivos frecuentes para elegir con un toque. Un médico pidió esto: en el relato libre
// el paciente cuenta todo, pero no siempre queda claro qué lo hizo consultar hoy.
export const MOTIVOS_FRECUENTES = [
  "Fiebre",
  "Tos",
  "Dolor de garganta",
  "Dolor de cabeza",
  "Dolor de estómago",
  "Diarrea",
  "Vómitos",
  "Mareo",
];

// Enfermedades frecuentes para marcar con un toque, como en el formulario en papel del médico.
export const ENFERMEDADES_FRECUENTES = [
  "Presión alta",
  "Diabetes",
  "Colesterol o triglicéridos",
  "Enfermedad del corazón",
  "Asma o enfermedad del pulmón",
  "Gastritis o reflujo",
  "Enfermedad del riñón",
  "Tiroides (hipo o hipertiroidismo)",
  "Depresión o ansiedad",
];

// Para cada dato: un ejemplo de respuesta (se ve en el cuadro vacío) y la repregunta que
// aparece si el paciente contesta solo "sí". El médico lo pidió: "respondí sí y no me
// preguntó cuál".
export const AYUDAS = {
  alergias: {
    ejemplo: "Ejemplo: a la penicilina, me salen ronchas",
    repregunta: "¿A qué eres alérgico y qué te pasa?",
  },
  enfermedades: {
    ejemplo: "Ejemplo: presión alta desde 2019",
    repregunta: "¿Cuál enfermedad y desde cuándo?",
  },
  cirugias: {
    ejemplo: "Ejemplo: me operaron de la vesícula en 2018",
    repregunta: "¿Qué cirugía te hicieron y en qué año?",
  },
  medicamentos: {
    ejemplo: "Ejemplo: Losartán 50 mg, 1 al día en la mañana, desde hace 2 años, para la presión",
    repregunta: "¿Cuál medicamento, qué dosis, cada cuánto y para qué lo tomas?",
  },
  tomado: {
    ejemplo: "Ejemplo: acetaminofén 500 mg cada 8 horas, me ayudó un poco",
    repregunta: "¿Qué tomaste, cada cuánto y te ayudó?",
  },
  familiares: {
    ejemplo: "Ejemplo: mi mamá tiene diabetes",
    repregunta: "¿Quién de tu familia y qué enfermedad tiene?",
  },
  contactos: {
    ejemplo: "Ejemplo: mi hijo tiene tos desde el lunes; fui a Izabal la semana pasada",
    repregunta: "¿Quién tiene síntomas, a dónde viajaste o con qué animal tuviste contacto?",
  },
  localizacion: {
    ejemplo: "Ejemplo: en la boca del estómago, del lado derecho",
    repregunta: "¿En qué parte del cuerpo exactamente?",
  },
  atribucion: {
    ejemplo: "Ejemplo: creo que fue algo que comí en la calle",
    repregunta: "¿A qué crees que se debe?",
  },
  habitos: {
    ejemplo: "Ejemplo: fumo 5 cigarros al día desde hace 10 años; cerveza los fines de semana",
    repregunta: "¿Cuánto y desde cuándo?",
  },
  menstruacion: {
    ejemplo: "Ejemplo: el 10 de octubre; no creo estar embarazada",
    repregunta: "¿Cuándo fue tu última menstruación?",
  },
  embarazos: {
    ejemplo: "Ejemplo: 2 embarazos, 1 parto y 1 cesárea; uso inyección cada 3 meses",
    repregunta: "¿Cuántos embarazos has tenido y qué método usas?",
  },
  sintomas: {
    ejemplo: "Ejemplo: también tengo náuseas y cansancio",
    repregunta: "¿Qué otros síntomas tienes?",
  },
};
export const REPREGUNTA_GENERAL = "Cuéntanos un poco más: ¿cuál?, ¿desde cuándo?";

// ¿La respuesta es solo un "sí" sin detalle? Entonces la app repregunta antes de seguir.
export function esSoloSi(respuesta) {
  const texto = String(respuesta || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!¡¿?\s]+$/g, "")
    .replace(/^[¡¿\s]+/g, "");
  return /^(si+|sip|claro|correcto|asi es|afirmativo|si tengo|si tomo|si soy)$/.test(texto);
}

export const UNIDADES_TIEMPO = { dias: ["día", "días"], semanas: ["semana", "semanas"], meses: ["mes", "meses"] };

// "Fiebre" + 5 días → "Fiebre de 5 días de evolución". Sin tiempo, solo el motivo.
export function motivoConEvolucion(motivo, cantidad, unidad = "dias") {
  const texto = String(motivo || "").trim();
  if (!texto) return "";
  const n = Number(cantidad);
  const nombres = UNIDADES_TIEMPO[unidad] ?? UNIDADES_TIEMPO.dias;
  if (!Number.isFinite(n) || n <= 0) return texto;
  if (n < 1 && unidad === "dias") return `${texto} de menos de un día de evolución`;
  const redondo = Math.round(n);
  return `${texto} de ${redondo} ${redondo === 1 ? nombres[0] : nombres[1]} de evolución`;
}

export function esModoValido(modo) {
  return modo === "primera" || modo === "control";
}

// Las preguntas gineco-obstétricas solo aplican a mujeres de 10 años o más (o sin edad indicada).
export function aplicaGineco({ sexo, edad } = {}) {
  const anios = Number(edad);
  return sexo === "Femenino" && !(edad && Number.isFinite(anios) && anios < 10);
}

// "perfil" es { sexo, edad } del paciente.
export function seccionesPara(modo, perfil = {}) {
  return SECCIONES.filter(
    (seccion) => (!seccion.soloControl || modo === "control") && (!seccion.soloMujeres || aplicaGineco(perfil))
  );
}

export function camposPara(modo, perfil = {}) {
  return seccionesPara(modo, perfil).flatMap((seccion) => seccion.campos);
}

// Campos por los que se puede preguntar en ese modo, en orden de prioridad.
export function camposPreguntables(modo, perfil = {}) {
  const visibles = new Set(camposPara(modo, perfil).map((campo) => campo.id));
  return PRIORIDAD.filter((id) => visibles.has(id));
}

export function etiquetaDe(id) {
  return CAMPOS.find((campo) => campo.id === id)?.etiqueta ?? id;
}

// Las secciones se numeran como en una historia clínica: "I. Datos generales" es la primera
// y la ponen la pantalla y el PDF; las de cada modo empiezan en II.
const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
export function tituloNumerado(posicion, titulo) {
  return `${ROMANOS[posicion]}. ${titulo}`;
}

export const SIN_DATO = "No referido";
export const SIN_RESPUESTA = "Sin respuesta";

// Respuestas rápidas de la entrevista y lo que queda escrito en la ficha.
export const RESPUESTAS_RAPIDAS = {
  "No sé": "No sabe",
  "No aplica": "No aplica",
  "Prefiero no decir": "Prefiere no decir",
};

// "Prefiero no decir" solo aparece en las preguntas más personales.
export const CAMPOS_PRIVADOS = ["menstruacion", "embarazos", "habitos"];
export function respuestasRapidasPara(campo) {
  return Object.keys(RESPUESTAS_RAPIDAS).filter((r) => r !== "Prefiero no decir" || CAMPOS_PRIVADOS.includes(campo));
}

// Escala del 1 al 10 para la intensidad. Se toca un número en lugar de escribirlo.
export const ESCALA_INTENSIDAD = { min: 1, max: 10, bajo: "Leve", medio: "Moderado", alto: "El peor que he sentido" };
export function textoIntensidad(n) {
  return n ? `${n} de 10` : "";
}
// Cambia el "N de 10" del inicio de la respuesta sin borrar lo que la persona escribió después.
export function ponerIntensidad(texto, n) {
  // Quita cualquier otro "N de 10" para que no queden dos calificaciones distintas.
  const resto = String(texto || "")
    .replace(/(^|[\s,.;])\d{1,2} de 10[.,;]?/g, "$1")
    .replace(/^[\s,.;]+|[\s,;]+$/g, "")
    .replace(/\s{2,}/g, " ");
  return resto ? `${n} de 10. ${resto}` : `${n} de 10`;
}
export function leerIntensidad(texto) {
  const m = String(texto || "").match(/^\s*(\d{1,2}) de 10/);
  return m ? Number(m[1]) : 0;
}

// En control: cómo se siente comparado con la consulta anterior, con un toque.
export const ESCALA_EVOLUCION = ["Mucho peor", "Peor", "Igual", "Mejor", "Mucho mejor"];

// Opciones para marcar con un toque en algunas preguntas (se agregan al texto de la respuesta).
export const OPCIONES_RAPIDAS = {
  habitos: ["Fumo", "Fumaba antes", "Tomo alcohol", "Hago ejercicio", "Duermo poco", "Ninguno"],
  contactos: [
    "Alguien en casa tiene lo mismo",
    "Viajé hace poco",
    "Contacto con animales",
    "Picaduras de mosquito",
    "Ninguno",
  ],
};

// Mediciones que el paciente se tomó en casa (opcionales). Se escriben en la ficha tal cual.
export const MEDICIONES = [
  { id: "temperatura", etiqueta: "Temperatura", unidad: "°C", ejemplo: "38.5", modo: "decimal" },
  { id: "presion", etiqueta: "Presión", unidad: "mmHg", ejemplo: "120/80", modo: "text" },
  { id: "glucosa", etiqueta: "Glucosa", unidad: "mg/dL", ejemplo: "110", modo: "numeric" },
  { id: "peso", etiqueta: "Peso", unidad: "lb", ejemplo: "150", modo: "decimal" },
];
export function textoMediciones(valores = {}) {
  return MEDICIONES.filter((m) => String(valores[m.id] ?? "").trim())
    .map((m) => `${m.etiqueta}: ${String(valores[m.id]).trim()} ${m.unidad}`)
    .join("; ");
}

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

// Después de la entrevista: lo que se respondió con "No sé" o "No aplica" queda escrito así,
// y lo que se preguntó y el paciente dejó en blanco se marca "Sin respuesta"
// (distinto de "No referido", que significa que nadie lo preguntó).
export function aplicarRespuestas(ficha, respondidas, { final = false } = {}) {
  const nueva = { ...ficha };
  for (const { campo, respuesta, conAudio } of respondidas) {
    if (!(campo in nueva) || nueva[campo].trim()) continue;
    const texto = String(respuesta || "").trim();
    const rapida = RESPUESTAS_RAPIDAS[texto];
    if (rapida) nueva[campo] = rapida;
    else if (final && !texto && !conAudio) nueva[campo] = SIN_RESPUESTA;
  }
  return nueva;
}

export function lineaPaciente(datos) {
  const partes = [];
  if (datos.edad) partes.push(`${datos.edad} años`);
  if (datos.sexo && datos.sexo !== "Prefiero no decir") partes.push(datos.sexo);
  if (datos.ocupacion) partes.push(datos.ocupacion);
  return partes.join(", ");
}

export function fechaLegible(iso) {
  if (!iso) return "";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" });
}

// "11 de octubre de 2026: Dolor de cabeza..." para mostrar la consulta anterior.
export function lineaConsultaAnterior(anterior) {
  if (!anterior) return "";
  const fecha = fechaLegible(anterior.fecha);
  const motivo = String(anterior.motivo || "").trim();
  if (fecha && motivo) return `${fecha}: ${motivo}`;
  return fecha || motivo;
}

// Versión en texto para enviar por WhatsApp o correo. Solo incluye lo que tiene dato.
export function fichaComoTexto(datos, ficha, { negritas = true, modo = "primera", anterior = null, fotos = 0 } = {}) {
  const b = (texto) => (negritas ? `*${texto}*` : texto.toUpperCase());
  const lineas = [b(MODOS[modo]?.tituloFicha ?? MODOS.primera.tituloFicha)];

  if (datos.nombre) lineas.push(`Paciente: ${datos.nombre}`);
  const paciente = lineaPaciente(datos);
  if (paciente) lineas.push(paciente);
  if (datos.municipio) lineas.push(`Vive en: ${datos.municipio}`);
  if (datos.contacto) lineas.push(`Contacto: ${datos.contacto}`);
  if (modo === "control" && anterior) {
    const linea = lineaConsultaAnterior(anterior);
    if (linea) lineas.push(`Consulta anterior: ${linea}`);
  }

  for (const seccion of seccionesPara(modo, datos)) {
    const conDato = seccion.campos.filter((campo) => ficha[campo.id]?.trim());
    if (conDato.length === 0) continue;
    lineas.push("", b(seccion.titulo));
    for (const campo of conDato) {
      const valor = ficha[campo.id].trim();
      lineas.push(seccion.campos.length === 1 ? valor : `- ${campo.etiqueta}: ${valor}`);
    }
  }

  if (fotos > 0) {
    lineas.push("", `${fotos === 1 ? "Hay 1 foto adjunta" : `Hay ${fotos} fotos adjuntas`} en el PDF de la ficha.`);
  }
  lineas.push("", "Información proporcionada por el paciente antes de la consulta. No es un diagnóstico.");
  return lineas.join("\n");
}
