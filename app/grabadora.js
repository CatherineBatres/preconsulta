"use client";

import { useEffect, useRef, useState } from "react";

// Límite por grabación: mantiene el archivo pequeño para enviarlo al servidor.
const MAX_SEGUNDOS = 120;

function duracionEnPalabras(segundos) {
  return segundos % 60 === 0 ? `${segundos / 60} minutos` : `${segundos} segundos`;
}

// Chrome y Android graban en webm; Safari (iPhone) en mp4. Se usa el primero disponible.
const FORMATOS = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

export function mmss(segundos) {
  const m = Math.floor(segundos / 60);
  const s = String(segundos % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Botón de grabar con reproductor. "audio" es { blob, url, tipo, duracion } o null.
export default function Grabadora({
  audio,
  onAudio,
  deshabilitada = false,
  maxSegundos = MAX_SEGUNDOS,
}) {
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const inicioRef = useRef(0);
  const relojRef = useRef(null);
  const limiteRef = useRef(null);

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
      onAudio({
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
    limiteRef.current = setTimeout(detener, maxSegundos * 1000);
  }

  function detener() {
    clearInterval(relojRef.current);
    clearTimeout(limiteRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setGrabando(false);
  }

  function borrar() {
    if (audio) URL.revokeObjectURL(audio.url);
    onAudio(null);
  }

  // Si la persona sale de la pantalla a media grabación, se libera el micrófono.
  useEffect(() => {
    return () => {
      clearInterval(relojRef.current);
      clearTimeout(limiteRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    };
  }, []);

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      {!audio && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={grabando ? detener : iniciar}
            disabled={deshabilitada}
            className={`flex h-14 shrink-0 items-center gap-2 rounded-full px-6 text-base font-semibold text-white transition focus:outline-none focus:ring-4 disabled:opacity-50 ${
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
                de {mmss(maxSegundos)}
              </>
            ) : (
              <>Hasta {duracionEnPalabras(maxSegundos)} por grabación.</>
            )}
          </p>
        </div>
      )}

      {audio && (
        <div className="flex flex-col gap-3">
          <audio controls src={audio.url} className="w-full" />
          <button
            type="button"
            onClick={borrar}
            disabled={deshabilitada}
            className="self-start text-sm font-medium text-teal-800 underline underline-offset-2 hover:text-teal-900 disabled:opacity-50"
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
  );
}
