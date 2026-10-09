"use client";

import { useEffect, useRef, useState } from "react";

// Límite por grabación: mantiene el archivo pequeño para enviarlo al servidor.
const MAX_SEGUNDOS = 120;

// Chrome y Android graban en webm; Safari (iPhone) en mp4. Se usa el primero disponible.
const FORMATOS = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

function mmss(segundos) {
  const m = Math.floor(segundos / 60);
  const s = String(segundos % 60).padStart(2, "0");
  return `${m}:${s}`;
}

const campo =
  "mt-1 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30";
const etiqueta = "block text-sm font-medium text-slate-700";
const tarjeta = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function Home() {
  const [datos, setDatos] = useState({ nombre: "", edad: "", sexo: "", contacto: "" });
  const [texto, setTexto] = useState("");
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [audio, setAudio] = useState(null); // { blob, url, tipo, duracion }
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const inicioRef = useRef(0);
  const relojRef = useRef(null);
  const limiteRef = useRef(null);

  function cambiar(e) {
    setDatos((d) => ({ ...d, [e.target.name]: e.target.value }));
  }

  async function iniciar() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Tu navegador no permite grabar audio. Puedes escribir tu mensaje.");
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(
        "No pudimos usar el micrófono. Revisa el permiso en tu navegador o escribe tu mensaje."
      );
      return;
    }

    const mimeType = FORMATOS.find((f) => MediaRecorder.isTypeSupported(f));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const partes = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) partes.push(e.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((pista) => pista.stop());
      const blob = new Blob(partes, { type: recorder.mimeType });
      setAudio({
        blob,
        url: URL.createObjectURL(blob),
        tipo: blob.type,
        duracion: Math.round((Date.now() - inicioRef.current) / 1000),
      });
    };

    recorder.start();
    recorderRef.current = recorder;
    inicioRef.current = Date.now();
    setSegundos(0);
    setGrabando(true);
    relojRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
    limiteRef.current = setTimeout(detener, MAX_SEGUNDOS * 1000);
  }

  function detener() {
    clearInterval(relojRef.current);
    clearTimeout(limiteRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setGrabando(false);
  }

  function borrarAudio() {
    if (audio) URL.revokeObjectURL(audio.url);
    setAudio(null);
  }

  // Si la persona sale de la página a media grabación, se libera el micrófono.
  useEffect(() => {
    return () => {
      clearInterval(relojRef.current);
      clearTimeout(limiteRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    };
  }, []);

  const hayAlgo = datos.nombre || datos.edad || datos.sexo || datos.contacto || audio || texto;

  return (
    <main className="min-h-screen flex-1 bg-slate-50 font-sans text-slate-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">PreConsulta</h1>
          <p className="mt-1 text-slate-600">Prepara tu ficha médica antes de la consulta.</p>
        </header>

        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Esta herramienta no da diagnósticos ni tratamientos. Si tienes una emergencia, busca
          atención médica de inmediato.
        </p>

        {/* 1. Datos generales */}
        <section className={tarjeta}>
          <h2 className="text-lg font-semibold">1. Datos generales</h2>
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
                onChange={cambiar}
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
                  onChange={cambiar}
                  className={campo}
                />
              </div>
              <div>
                <label htmlFor="sexo" className={etiqueta}>
                  Sexo
                </label>
                <select
                  id="sexo"
                  name="sexo"
                  value={datos.sexo}
                  onChange={cambiar}
                  className={campo}
                >
                  <option value="">Selecciona</option>
                  <option>Femenino</option>
                  <option>Masculino</option>
                  <option>Prefiero no decir</option>
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
                onChange={cambiar}
                className={campo}
              />
            </div>
          </div>
        </section>

        {/* 2. Motivo de consulta */}
        <section className={tarjeta}>
          <h2 className="text-lg font-semibold">2. Cuéntanos qué te sucede</h2>
          <p className="mt-1 text-sm text-slate-600">
            Puedes grabar un audio, escribirlo, o ambos.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            {!audio && (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={grabando ? detener : iniciar}
                  className={`flex h-14 shrink-0 items-center gap-2 rounded-full px-6 text-base font-semibold text-white transition focus:outline-none focus:ring-4 ${
                    grabando
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-600/30"
                      : "bg-teal-700 hover:bg-teal-800 focus:ring-teal-700/30"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-3 w-3 bg-white ${grabando ? "rounded-sm" : "rounded-full"}`}
                  />
                  {grabando ? "Detener" : "Grabar"}
                </button>
                <p className="text-sm text-slate-600" aria-live="polite">
                  {grabando ? (
                    <>
                      <span className="font-mono text-base font-semibold text-red-700">
                        {mmss(segundos)}
                      </span>{" "}
                      de {mmss(MAX_SEGUNDOS)}
                    </>
                  ) : (
                    <>Hasta {MAX_SEGUNDOS / 60} minutos por grabación.</>
                  )}
                </p>
              </div>
            )}

            {audio && (
              <div className="flex flex-col gap-3">
                <audio controls src={audio.url} className="w-full" />
                <button
                  type="button"
                  onClick={borrarAudio}
                  className="self-start text-sm font-medium text-teal-800 underline underline-offset-2 hover:text-teal-900"
                >
                  Borrar y volver a grabar
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          <label htmlFor="texto" className={`${etiqueta} mt-4`}>
            O escríbelo aquí
          </label>
          <textarea
            id="texto"
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ejemplo: desde hace tres días tengo dolor de cabeza por las tardes..."
            className={campo}
          />
        </section>

        {/* 3. Vista previa: aquí se conectará la IA en el siguiente paso */}
        <section className={tarjeta}>
          <h2 className="text-lg font-semibold">3. Lo que capturamos</h2>
          {!hayAlgo ? (
            <p className="mt-2 text-sm text-slate-600">
              Completa los pasos anteriores para ver el resumen.
            </p>
          ) : (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="font-medium text-slate-500">Nombre</dt>
              <dd>{datos.nombre || "—"}</dd>
              <dt className="font-medium text-slate-500">Edad</dt>
              <dd>{datos.edad || "—"}</dd>
              <dt className="font-medium text-slate-500">Sexo</dt>
              <dd>{datos.sexo || "—"}</dd>
              <dt className="font-medium text-slate-500">Contacto</dt>
              <dd>{datos.contacto || "—"}</dd>
              <dt className="font-medium text-slate-500">Audio</dt>
              <dd>
                {audio
                  ? `${mmss(audio.duracion)} · ${Math.max(1, Math.round(audio.blob.size / 1024))} KB · ${audio.tipo}`
                  : "—"}
              </dd>
              <dt className="font-medium text-slate-500">Texto</dt>
              <dd className="whitespace-pre-wrap">{texto || "—"}</dd>
            </dl>
          )}
        </section>

        <footer className="pb-4 text-center text-xs text-slate-500">
          Tus datos no se guardan: se pierden al cerrar esta página.
        </footer>
      </div>
    </main>
  );
}
