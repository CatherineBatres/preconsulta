"use client";

import { useEffect, useRef, useState } from "react";
import Grabadora from "./grabadora";
import {
  aplicarRespuestas,
  fechaLegible,
  fichaComoTexto,
  fichaVacia,
  lineaConsultaAnterior,
  MODOS,
  PREGUNTA_DE_CONTROL,
  RESPUESTAS_RAPIDAS,
  seccionesPara,
  tituloNumerado,
} from "@/lib/ficha";
import { borrarFichaGuardada, guardarFicha, leerFichaGuardada } from "@/lib/almacen";
import { crearArchivoPdf, precargarPdf } from "@/lib/pdf";

const PASOS = ["Cuéntanos", "Preguntas", "Tu ficha"];
const DATOS_VACIOS = { nombre: "", edad: "", sexo: "", contacto: "" };
const SEXOS = ["Femenino", "Masculino", "Prefiero no decir"];
const SEGUNDOS_POR_RESPUESTA = 45;
const MAX_BYTES_AUDIOS = 4 * 1024 * 1024;
const MAX_RONDAS = 3; // rondas de preguntas como máximo, para no cansar al paciente

const campo =
  "mt-1 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30";
const etiqueta = "block text-sm font-medium text-slate-700";
const tarjeta = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const boton =
  "flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-2.5 text-center text-base font-semibold transition focus:outline-none focus:ring-4 disabled:opacity-60";
const botonPrincipal = `${boton} bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-700/30`;
const botonSecundario = `${boton} border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus:ring-slate-400/30`;
const botonChico =
  "min-h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-400/30 disabled:opacity-60";
const enlace =
  "text-sm font-medium text-teal-800 underline underline-offset-2 hover:text-teal-900 disabled:opacity-60";

// Estilos de la hoja de la ficha: cada dato se lee como texto y se edita al tocarlo.
const datoHoja =
  "block w-full resize-none bg-transparent px-3 py-2.5 text-base text-slate-900 placeholder:italic placeholder:text-slate-400 focus:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-600/50";
const etiquetaHoja = "bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600";
const filaHoja = "grid grid-cols-[7.25rem_1fr] border-t border-slate-200";
const tituloHoja =
  "border-t border-slate-300 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900";

// Cuadro de texto que crece con su contenido, para que la hoja se lea completa sin barras.
function TextoQueCrece({ value, ...resto }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} rows={1} value={value} {...resto} />;
}

function DatosGenerales({ datos, onChange }) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div>
        <label htmlFor="nombre" className={etiqueta}>
          Nombre completo
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          value={datos.nombre}
          onChange={onChange}
          className={campo}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="edad" className={etiqueta}>
            Edad
          </label>
          <input
            id="edad"
            name="edad"
            type="number"
            inputMode="numeric"
            min="0"
            max="120"
            value={datos.edad}
            onChange={onChange}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="sexo" className={etiqueta}>
            Sexo
          </label>
          <select id="sexo" name="sexo" value={datos.sexo} onChange={onChange} className={campo}>
            <option value="">Selecciona</option>
            {SEXOS.map((sexo) => (
              <option key={sexo}>{sexo}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="contacto" className={etiqueta}>
          Teléfono o correo <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <input
          id="contacto"
          name="contacto"
          type="text"
          value={datos.contacto}
          onChange={onChange}
          className={campo}
        />
      </div>
    </div>
  );
}

// Selector de "Primera vez" o "Consulta de control". Cada opción explica qué cambia.
function SelectorDeModo({ modo, onElegir, deshabilitado }) {
  const opciones = [
    { id: "primera", nombre: "Primera vez", detalle: "Cuéntanos desde el inicio qué te sucede." },
    { id: "control", nombre: "Control o seguimiento", detalle: "Retomamos la ficha que guardaste en este teléfono." },
  ];
  return (
    <section className={tarjeta}>
      <h2 className="text-lg font-semibold">¿Qué tipo de consulta es?</h2>
      <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="Tipo de consulta">
        {opciones.map((opcion) => {
          const elegida = modo === opcion.id;
          return (
            <button
              key={opcion.id}
              type="button"
              aria-pressed={elegida}
              disabled={deshabilitado}
              onClick={() => onElegir(opcion.id)}
              className={`flex flex-col items-start justify-start rounded-xl border px-3 py-3 text-left transition focus:outline-none focus:ring-4 focus:ring-teal-700/30 ${
                elegida ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700" : "border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              <span className="block text-base font-semibold text-slate-900">{opcion.nombre}</span>
              <span className="mt-1 block text-sm leading-snug text-slate-600">{opcion.detalle}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// Lo que se recuerda de la consulta anterior, para que el paciente sepa qué se va a usar.
function FichaGuardada({ registro, onBorrar }) {
  const filas = [
    ["Enfermedades", registro.base.enfermedades],
    ["Alergias", registro.base.alergias],
    ["Medicamentos", registro.base.medicamentos],
  ];
  const visitas = [...registro.historial].reverse(); // la más reciente primero
  return (
    <section className={tarjeta}>
      <h2 className="text-lg font-semibold">Tu ficha guardada</h2>
      <p className="mt-1 text-sm text-slate-600">
        Guardada en este teléfono. La usaremos para no empezar de cero.
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {filas.map(([nombre, valor]) => (
          <div key={nombre} className="contents">
            <dt className="font-medium text-slate-500">{nombre}</dt>
            <dd className={valor ? "text-slate-900" : "italic text-slate-400"}>{valor || "No registrado"}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-5 text-sm font-semibold text-slate-700">
        Historial de consultas ({visitas.length})
      </h3>
      {visitas.length === 0 ? (
        <p className="mt-1 text-sm italic text-slate-400">Sin consultas guardadas.</p>
      ) : (
        <ol className="mt-2 flex flex-col gap-3 border-l-2 border-teal-200 pl-4" data-historial>
          {visitas.map((visita) => (
            <li key={visita.fecha} className="text-sm">
              <p className="font-medium text-slate-900">
                {fechaLegible(visita.fecha)}
                <span className="font-normal text-slate-500">
                  {" "}· {visita.modo === "control" ? "Control" : "Primera vez"}
                </span>
              </p>
              {visita.motivo && <p className="text-slate-700">{visita.motivo}</p>}
              {visita.evolucion && <p className="text-slate-600">Evolución: {visita.evolucion}</p>}
              {visita.tratamiento && <p className="text-slate-600">Tratamiento: {visita.tratamiento}</p>}
            </li>
          ))}
        </ol>
      )}

      <button type="button" onClick={onBorrar} className={`${enlace} mt-4`}>
        Borrar mi ficha guardada
      </button>
    </section>
  );
}

// La ficha como hoja clínica: mismas secciones y numeración que el PDF.
function HojaDeFicha({ modo, anterior, datos, onDato, ficha, onFicha, fecha }) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
      <div className="border-t-4 border-teal-700 px-3 pt-3 pb-3">
        <h2 className="text-lg font-semibold">{MODOS[modo].tituloFicha}</h2>
        <p className="text-sm text-slate-500">{fecha}</p>
      </div>

      <h3 className={tituloHoja}>{tituloNumerado(0, "Datos generales")}</h3>
      <div className={filaHoja}>
        <label htmlFor="nombre" className={etiquetaHoja}>
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={datos.nombre}
          onChange={onDato}
          placeholder="No referido"
          className={datoHoja}
        />
      </div>
      <div className={filaHoja}>
        <label htmlFor="edad" className={etiquetaHoja}>
          Edad
        </label>
        <input
          id="edad"
          name="edad"
          type="number"
          inputMode="numeric"
          min="0"
          max="120"
          value={datos.edad}
          onChange={onDato}
          placeholder="No referida"
          className={datoHoja}
        />
      </div>
      <div className={filaHoja}>
        <label htmlFor="sexo" className={etiquetaHoja}>
          Sexo
        </label>
        <select id="sexo" name="sexo" value={datos.sexo} onChange={onDato} className={datoHoja}>
          <option value="">No referido</option>
          {SEXOS.map((sexo) => (
            <option key={sexo}>{sexo}</option>
          ))}
        </select>
      </div>
      <div className={filaHoja}>
        <label htmlFor="contacto" className={etiquetaHoja}>
          Contacto
        </label>
        <input
          id="contacto"
          name="contacto"
          type="text"
          value={datos.contacto}
          onChange={onDato}
          placeholder="No referido"
          className={datoHoja}
        />
      </div>

      {seccionesPara(modo).map((seccion, i) => (
        <div key={seccion.titulo}>
          <h3 className={tituloHoja}>{tituloNumerado(i + 1, seccion.titulo)}</h3>
          {seccion.soloControl && (
            <div className={filaHoja}>
              <span className={etiquetaHoja}>Consulta anterior</span>
              <p
                id="consulta-anterior"
                className={`px-3 py-2.5 text-base ${anterior ? "text-slate-900" : "italic text-slate-400"}`}
              >
                {lineaConsultaAnterior(anterior) || "No registrada"}
              </p>
            </div>
          )}
          {seccion.campos.map((c) =>
            seccion.campos.length === 1 ? (
              <div key={c.id} className="border-t border-slate-200">
                <label htmlFor={`ficha-${c.id}`} className="sr-only">
                  {c.etiqueta}
                </label>
                <TextoQueCrece
                  id={`ficha-${c.id}`}
                  value={ficha[c.id]}
                  onChange={(e) => onFicha(c.id, e.target.value)}
                  placeholder="No referido"
                  className={datoHoja}
                />
              </div>
            ) : (
              <div key={c.id} className={filaHoja}>
                <label htmlFor={`ficha-${c.id}`} className={etiquetaHoja}>
                  {c.etiqueta}
                </label>
                <TextoQueCrece
                  id={`ficha-${c.id}`}
                  value={ficha[c.id]}
                  onChange={(e) => onFicha(c.id, e.target.value)}
                  placeholder="No referido"
                  className={datoHoja}
                />
              </div>
            )
          )}
        </div>
      ))}
    </section>
  );
}

export default function Home() {
  const [paso, setPaso] = useState(0);
  const [modo, setModo] = useState("primera");
  const [guardada, setGuardada] = useState(null); // ficha base leída del teléfono (modo control)
  const [estadoGuardado, setEstadoGuardado] = useState(""); // "", "guardada", "borrada", "error"
  const [datos, setDatos] = useState(DATOS_VACIOS);
  const [texto, setTexto] = useState("");
  const [audio, setAudio] = useState(null);
  const [transcripcion, setTranscripcion] = useState("");
  const [preguntas, setPreguntas] = useState([]); // ronda actual: [{ campo, pregunta }]
  const [respuestas, setRespuestas] = useState([]); // una por pregunta: { texto, audio }
  const [actual, setActual] = useState(0);
  const [ronda, setRonda] = useState(1);
  const [yaPreguntados, setYaPreguntados] = useState([]); // campos que ya se preguntaron
  const [respondidas, setRespondidas] = useState([]); // historial de todas las rondas
  const [ficha, setFicha] = useState(fichaVacia);
  const [fecha, setFecha] = useState("");
  const [alarma, setAlarma] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const anterior = modo === "control" ? guardada?.anterior ?? null : null;

  // El generador de PDF se descarga al llegar a la ficha, para que el botón responda al instante.
  useEffect(() => {
    if (paso === 2) precargarPdf();
  }, [paso]);

  function cambiarDato(e) {
    setDatos((d) => ({ ...d, [e.target.name]: e.target.value }));
  }

  function irA(nuevoPaso) {
    setPaso(nuevoPaso);
    setError("");
    setAviso("");
    window.scrollTo({ top: 0 });
  }

  // Al elegir "control" se lee la ficha guardada en el teléfono y se prellenan los datos generales.
  function elegirModo(nuevo) {
    setModo(nuevo);
    setError("");
    if (nuevo !== "control") return;
    const registro = leerFichaGuardada();
    setGuardada(registro);
    if (registro) {
      setDatos((d) => ({
        nombre: d.nombre || registro.datos.nombre || "",
        edad: d.edad || registro.datos.edad || "",
        sexo: d.sexo || registro.datos.sexo || "",
        contacto: d.contacto || registro.datos.contacto || "",
      }));
    }
  }

  function borrarGuardada() {
    if (!window.confirm("¿Borrar la ficha guardada en este teléfono?")) return;
    borrarFichaGuardada();
    setGuardada(null);
    setEstadoGuardado("borrada");
  }

  function guardarEnTelefono() {
    setEstadoGuardado(guardarFicha(datos, ficha, modo) ? "guardada" : "error");
  }

  // Envía la información a la ruta de servidor, que es la que habla con la IA.
  // El nombre y el contacto no se envían: la IA no los necesita.
  async function pedirFicha(campos) {
    const cuerpo = new FormData();
    cuerpo.set("modo", modo);
    cuerpo.set("edad", datos.edad);
    cuerpo.set("sexo", datos.sexo);
    if (modo === "control" && guardada) {
      cuerpo.set(
        "base",
        JSON.stringify({ ...guardada.base, anterior: guardada.anterior, historial: guardada.historial.slice(-3) })
      );
    }
    for (const [clave, valor] of Object.entries(campos)) {
      if (valor instanceof Blob) cuerpo.set(clave, valor, "audio");
      else if (valor != null) cuerpo.set(clave, valor);
    }

    let respuesta;
    try {
      respuesta = await fetch("/api/ficha", { method: "POST", body: cuerpo });
    } catch {
      throw new Error("No se pudo conectar. Revisa tu internet e intenta de nuevo.");
    }
    const json = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !json) {
      throw new Error(json?.error || "No pudimos generar la ficha en este momento. Intenta de nuevo.");
    }
    return json;
  }

  function empezarRonda(nuevas, numero, preguntadosAntes) {
    respuestas.forEach((r) => r.audio && URL.revokeObjectURL(r.audio.url));
    setPreguntas(nuevas);
    setRespuestas(nuevas.map(() => ({ texto: "", audio: null })));
    setActual(0);
    setRonda(numero);
    setYaPreguntados([...preguntadosAntes, ...nuevas.map((p) => p.campo)]);
    setError("");
    window.scrollTo({ top: 0 });
  }

  async function analizar() {
    if (!audio && !texto.trim()) {
      setError("Graba un audio o escribe qué te sucede para continuar.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const r = await pedirFicha({ paso: "analizar", texto, audio: audio?.blob, yaPreguntados: "[]" });
      // En control, lo guardado en el teléfono completa lo que la IA no haya copiado.
      const nueva = { ...r.ficha };
      if (modo === "control" && guardada) {
        for (const [id, valor] of Object.entries(guardada.base)) nueva[id] ||= valor;
      }
      setTranscripcion(r.transcripcion);
      setAlarma(r.alarma);
      setFicha(nueva);
      setRespondidas([]);
      setFecha(fechaLegible(new Date().toISOString()));
      if (r.preguntas.length > 0) {
        empezarRonda(r.preguntas, 1, []);
        irA(1);
      } else {
        irA(2);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // Al terminar una ronda se envían sus respuestas. Si quedan campos vacíos sin preguntar,
  // la IA devuelve otra ronda (hasta MAX_RONDAS); si no, se pasa a la ficha.
  async function terminarRonda(lista = respuestas) {
    const deEstaRonda = preguntas.map((p, i) => ({
      campo: p.campo,
      pregunta: p.pregunta,
      respuesta: lista[i].texto,
      conAudio: Boolean(lista[i].audio),
    }));
    const todas = [...respondidas, ...deEstaRonda];
    const sustanciosas = deEstaRonda.some(
      (r) => r.conAudio || (r.respuesta.trim() && !RESPUESTAS_RAPIDAS[r.respuesta.trim()])
    );

    // Sin nada nuevo que procesar y sin más rondas posibles: no hace falta llamar a la IA.
    if (!sustanciosas && ronda >= MAX_RONDAS) {
      setRespondidas(todas);
      setFicha((f) => aplicarRespuestas(f, todas, { final: true }));
      irA(2);
      return;
    }

    const peso = lista.reduce((suma, r) => suma + (r.audio?.blob.size ?? 0), 0);
    if (peso > MAX_BYTES_AUDIOS) {
      setError("Los audios suman demasiado tiempo. Vuelve a grabar alguna respuesta más corta.");
      return;
    }

    setCargando(true);
    setError("");
    try {
      const campos = {
        paso: "completar",
        ficha: JSON.stringify(ficha),
        respuestas: JSON.stringify(deEstaRonda.map(({ campo, pregunta, respuesta }) => ({ campo, pregunta, respuesta }))),
        yaPreguntados: JSON.stringify(yaPreguntados),
      };
      lista.forEach((r, i) => {
        if (r.audio) campos[`audio_${i}`] = r.audio.blob;
      });
      const r = await pedirFicha(campos);
      const nueva = aplicarRespuestas(r.ficha, todas);
      if (r.alarma) setAlarma(r.alarma);
      setRespondidas(todas);
      if (r.preguntas.length > 0 && ronda < MAX_RONDAS) {
        setFicha(nueva);
        empezarRonda(r.preguntas, ronda + 1, yaPreguntados);
      } else {
        setFicha(aplicarRespuestas(nueva, todas, { final: true }));
        irA(2);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  function cambiarRespuesta(indice, cambios) {
    setRespuestas((lista) => lista.map((r, i) => (i === indice ? { ...r, ...cambios } : r)));
  }

  function siguiente(lista = respuestas) {
    if (actual < preguntas.length - 1) {
      setActual(actual + 1);
      setError("");
      window.scrollTo({ top: 0 });
    } else {
      terminarRonda(lista);
    }
  }

  // "No sé" y "No aplica" responden en un toque y pasan a la siguiente pregunta.
  function responderRapido(textoRapido) {
    const previa = respuestas[actual];
    if (previa.audio) URL.revokeObjectURL(previa.audio.url);
    const lista = respuestas.map((r, i) => (i === actual ? { texto: textoRapido, audio: null } : r));
    setRespuestas(lista);
    siguiente(lista);
  }

  function anteriorPregunta() {
    if (actual > 0) {
      setActual(actual - 1);
      setError("");
    } else if (ronda === 1) {
      irA(0);
    }
  }

  function descargar(archivo) {
    const url = URL.createObjectURL(archivo);
    const a = document.createElement("a");
    a.href = url;
    a.download = archivo.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  async function descargarPdf() {
    setAviso("");
    try {
      descargar(await crearArchivoPdf(datos, ficha, { modo, anterior }));
    } catch {
      setAviso("No se pudo crear el PDF. Intenta de nuevo.");
    }
  }

  // Abre el menú de compartir del teléfono (WhatsApp, correo, etc.) con el PDF adjunto.
  async function compartirPdf() {
    setAviso("");
    try {
      const archivo = await crearArchivoPdf(datos, ficha, { modo, anterior });
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({
          files: [archivo],
          title: MODOS[modo].tituloFicha,
          text: "Le comparto mi ficha previa a la consulta.",
        });
      } else {
        descargar(archivo);
        setAviso(
          "Este dispositivo no permite compartir archivos desde aquí. Descargamos el PDF para que lo adjuntes en WhatsApp o en tu correo."
        );
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        setAviso("No se pudo compartir. Descarga el PDF y adjúntalo en WhatsApp o en tu correo.");
      }
    }
  }

  function reiniciar() {
    if (!window.confirm("¿Borrar todo y empezar una ficha nueva?")) return;
    if (audio) URL.revokeObjectURL(audio.url);
    respuestas.forEach((r) => r.audio && URL.revokeObjectURL(r.audio.url));
    setModo("primera");
    setGuardada(null);
    setEstadoGuardado("");
    setDatos(DATOS_VACIOS);
    setTexto("");
    setAudio(null);
    setTranscripcion("");
    setPreguntas([]);
    setRespuestas([]);
    setActual(0);
    setRonda(1);
    setYaPreguntados([]);
    setRespondidas([]);
    setFicha(fichaVacia());
    setAlarma("");
    irA(0);
  }

  const asunto = `${MODOS[modo].tituloFicha}${datos.nombre ? ` - ${datos.nombre}` : ""}`;
  const enlaceWhatsApp =
    paso === 2
      ? `https://wa.me/?text=${encodeURIComponent(fichaComoTexto(datos, ficha, { modo, anterior }))}`
      : "#";
  const enlaceCorreo =
    paso === 2
      ? `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
          fichaComoTexto(datos, ficha, { negritas: false, modo, anterior })
        )}`
      : "#";

  const respuesta = respuestas[actual];
  const esUltima = actual === preguntas.length - 1;
  const esControl = modo === "control";

  return (
    <main className="min-h-screen flex-1 bg-slate-50 font-sans text-slate-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">PreConsulta</h1>
          <p className="mt-1 text-slate-600">Prepara tu ficha médica antes de la consulta.</p>
        </header>

        <ol className="grid grid-cols-3 gap-2" aria-label="Pasos">
          {PASOS.map((nombre, i) => (
            <li key={nombre} aria-current={i === paso ? "step" : undefined}>
              <div className={`h-1.5 rounded-full ${i <= paso ? "bg-teal-700" : "bg-slate-200"}`} />
              <p
                className={`mt-1.5 text-xs font-medium ${
                  i === paso ? "text-teal-800" : "text-slate-500"
                }`}
              >
                {i + 1}. {nombre}
              </p>
            </li>
          ))}
        </ol>

        {paso === 0 && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Esta herramienta no da diagnósticos ni tratamientos. Si tienes una emergencia, busca
            atención médica de inmediato.
          </p>
        )}

        {alarma && paso > 0 && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-900">
            <p className="text-sm font-semibold">Busca atención médica ahora</p>
            <p className="mt-1 text-sm">{alarma}</p>
          </div>
        )}

        {/* Paso 1: tipo de consulta, datos generales y relato */}
        {paso === 0 && (
          <>
            <SelectorDeModo modo={modo} onElegir={elegirModo} deshabilitado={cargando} />

            {esControl && guardada && <FichaGuardada registro={guardada} onBorrar={borrarGuardada} />}
            {esControl && !guardada && (
              <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {estadoGuardado === "borrada"
                  ? "Borramos la ficha guardada. "
                  : "No hay una ficha guardada en este teléfono. "}
                Puedes continuar igual: te preguntaremos lo necesario.
              </p>
            )}

            <section className={tarjeta}>
              <h2 className="text-lg font-semibold">Datos generales</h2>
              <DatosGenerales datos={datos} onChange={cambiarDato} />
            </section>

            <section className={tarjeta}>
              <h2 className="text-lg font-semibold">
                {esControl ? PREGUNTA_DE_CONTROL : "Cuéntanos qué te sucede"}
              </h2>
              <p className="mt-1 mb-4 text-sm text-slate-600">
                {esControl
                  ? "Cuéntanos si mejoraste, si algo cambió y si pudiste seguir las indicaciones. Puedes grabar un audio, escribirlo, o ambos."
                  : "Habla como se lo contarías a tu médico: qué sientes, desde cuándo y qué has hecho. Puedes grabar un audio, escribirlo, o ambos."}
              </p>
              <Grabadora audio={audio} onAudio={setAudio} deshabilitada={cargando} />
              <label htmlFor="texto" className={`${etiqueta} mt-4`}>
                O escríbelo aquí
              </label>
              <textarea
                id="texto"
                rows={4}
                maxLength={4000}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={
                  esControl
                    ? "Ejemplo: el dolor bajó mucho, pero a veces me da en la noche. Tomé la medicina como me dijeron..."
                    : "Ejemplo: desde hace tres días tengo dolor de cabeza por las tardes..."
                }
                className={campo}
              />
            </section>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            <button type="button" onClick={analizar} disabled={cargando} className={botonPrincipal}>
              {cargando ? "Analizando lo que nos contaste…" : "Continuar"}
            </button>
            {cargando && (
              <p className="-mt-2 text-center text-sm text-slate-500">Puede tardar unos segundos.</p>
            )}
          </>
        )}

        {/* Paso 2: entrevista, una pregunta a la vez, en rondas hasta completar la ficha */}
        {paso === 1 && respuesta && (
          <>
            {ronda === 1 && transcripcion && (
              <details className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <summary className="cursor-pointer font-medium text-slate-700">
                  Ver lo que escuchamos de tu relato
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{transcripcion}</p>
              </details>
            )}
            {ronda > 1 && (
              <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
                Gracias. Faltan unos datos para completar tu ficha.
              </p>
            )}

            <section className={tarjeta}>
              <div className="flex items-center gap-3">
                <p className="shrink-0 text-sm font-medium text-teal-800">
                  Pregunta {actual + 1} de {preguntas.length}
                  {ronda > 1 && <span className="text-slate-500"> · ronda {ronda}</span>}
                </p>
                <div className="flex flex-1 gap-1" aria-hidden="true">
                  {preguntas.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i <= actual ? "bg-teal-700" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
              </div>

              <h2 className="mt-4 text-2xl leading-snug font-semibold" aria-live="polite">
                {preguntas[actual].pregunta}
              </h2>

              <div className="mt-5">
                <Grabadora
                  key={`${ronda}-${actual}`}
                  audio={respuesta.audio}
                  onAudio={(nuevo) => cambiarRespuesta(actual, { audio: nuevo })}
                  deshabilitada={cargando}
                  maxSegundos={SEGUNDOS_POR_RESPUESTA}
                />
              </div>
              <label htmlFor="respuesta" className={`${etiqueta} mt-4`}>
                O escribe tu respuesta
              </label>
              <textarea
                id="respuesta"
                rows={2}
                maxLength={1000}
                value={respuesta.texto}
                onChange={(e) => cambiarRespuesta(actual, { texto: e.target.value })}
                className={campo}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(RESPUESTAS_RAPIDAS).map((rapida) => (
                  <button
                    key={rapida}
                    type="button"
                    onClick={() => responderRapido(rapida)}
                    disabled={cargando}
                    className={botonChico}
                  >
                    {rapida}
                  </button>
                ))}
              </div>
            </section>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            <button type="button" onClick={() => siguiente()} disabled={cargando} className={botonPrincipal}>
              {cargando ? "Preparando tu ficha…" : esUltima ? "Continuar" : "Siguiente pregunta"}
            </button>
            {(actual > 0 || ronda === 1) && (
              <button type="button" onClick={anteriorPregunta} disabled={cargando} className={botonSecundario}>
                {actual > 0 ? "Pregunta anterior" : "Volver a mi relato"}
              </button>
            )}
          </>
        )}

        {/* Paso 3: la ficha como hoja, editable al tocar, guardado y envío */}
        {paso === 2 && (
          <>
            <p className="text-sm text-slate-600">
              Así la verá tu médico. Toca cualquier dato para corregirlo o completarlo.
            </p>

            <HojaDeFicha
              modo={modo}
              anterior={anterior}
              datos={datos}
              onDato={cambiarDato}
              ficha={ficha}
              onFicha={(id, valor) => setFicha((f) => ({ ...f, [id]: valor }))}
              fecha={fecha}
            />

            <section className={tarjeta}>
              <h2 className="text-lg font-semibold">Envíala a tu médico</h2>
              <p className="mt-1 text-sm text-slate-600">
                Al compartir se abre WhatsApp, tu correo u otra app con el PDF adjunto.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <button type="button" onClick={compartirPdf} className={botonPrincipal}>
                  Compartir PDF
                </button>
                <button type="button" onClick={descargarPdf} className={botonSecundario}>
                  Descargar PDF
                </button>
                <p className="mt-2 text-sm text-slate-600">O envíala como mensaje de texto:</p>
                <div className="grid grid-cols-2 gap-3">
                  <a href={enlaceWhatsApp} target="_blank" rel="noopener noreferrer" className={botonSecundario}>
                    WhatsApp
                  </a>
                  <a href={enlaceCorreo} className={botonSecundario}>
                    Correo
                  </a>
                </div>
              </div>
              {aviso && (
                <p role="status" className="mt-3 text-sm text-slate-700">
                  {aviso}
                </p>
              )}
            </section>

            <section className={tarjeta}>
              <h2 className="text-lg font-semibold">Para tu próxima consulta</h2>
              {estadoGuardado === "guardada" ? (
                <>
                  <p className="mt-1 text-sm text-slate-700" role="status">
                    Listo, quedó guardada en este teléfono. La próxima vez elige “Control o seguimiento” y
                    retomaremos desde aquí.
                  </p>
                  <button type="button" onClick={borrarGuardada} className={`${enlace} mt-3`}>
                    Borrar mi ficha guardada
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-slate-600">
                    Guarda tus datos generales, enfermedades, alergias, medicamentos y un resumen de esta
                    consulta en tu historial, solo en este teléfono. No se envían a ningún servidor y puedes borrarlos cuando
                    quieras.
                  </p>
                  <button type="button" onClick={guardarEnTelefono} className={`${botonSecundario} mt-4`}>
                    Guardar en este teléfono
                  </button>
                  {estadoGuardado === "error" && (
                    <p role="alert" className="mt-2 text-sm text-red-700">
                      Este navegador no permitió guardar. Revisa que no estés en modo privado.
                    </p>
                  )}
                </>
              )}
            </section>

            <button type="button" onClick={reiniciar} className={botonSecundario}>
              Empezar una ficha nueva
            </button>
          </>
        )}

        <footer className="pb-4 text-center text-xs text-slate-500">
          Tu audio y tus respuestas se procesan con el reconocimiento de voz de tu navegador y con
          un servicio de IA (Google Gemini) para ordenar la ficha. Esta app no guarda tus datos en
          ningún servidor: solo quedan en tu teléfono si tú lo pides.
        </footer>
      </div>
    </main>
  );
}
