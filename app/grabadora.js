"use client";

import { useEffect, useRef, useState } from "react";

// Límite por grabación: mantiene el archivo pequeño para enviarlo al servidor.
const MAX_SEGUNDOS = 120;

// Transcripción en vivo con el reconocimiento de voz del navegador (Chrome, Edge, Safari).
// Es solo una guía para el paciente: la IA siempre trabaja con el audio grabado.
// En teléfonos se apaga: el reconocimiento de voz y la grabación usan el mismo micrófono,
// y en Android y iPhone eso puede cortar o silenciar el audio que se envía a la IA.
// Ver decisión 8 en docs/decisiones.md.
const TRANSCRIPCION_EN_VIVO = true;

export function esTelefono() {
  if (typeof navigator === "undefined") return false;
  if (navigator.userAgentData?.mobile) return true;
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1; // iPad que se presenta como Mac
}
const IDIOMA = "es-GT";

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

function crearReconocedor() {
  if (!TRANSCRIPCION_EN_VIVO || typeof window === "undefined" || esTelefono()) return null;
  const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Reconocimiento) return null;
  const reconocedor = new Reconocimiento();
  reconocedor.lang = IDIOMA;
  reconocedor.continuous = true;
  reconocedor.interimResults = true;
  return reconocedor;
}

// Botón de grabar con transcripción en vivo y reproductor para volver a escuchar.
// "audio" es { blob, url, tipo, duracion, transcripcion } o null.
export default function Grabadora({
  audio,
  onAudio,
  deshabilitada = false,
  maxSegundos = MAX_SEGUNDOS,
}) {
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [error, setError] = useState("");
  const [textoFinal, setTextoFinal] = useState("");
  const [textoProvisional, setTextoProvisional] = useState("");
  const [estadoVivo, setEstadoVivo] = useState(""); // "", "escuchando", "no-disponible", "error"

  const recorderRef = useRef(null);
  const inicioRef = useRef(0);
  const relojRef = useRef(null);
  const limiteRef = useRef(null);
  const reconocedorRef = useRef(null);
  const grabandoRef = useRef(false);
  const finalRef = useRef("");
  const audioRef = useRef(null); // el audio ya entregado, para sumarle lo último que se transcriba
  const sesionRef = useRef(0); // cada grabación es una sesión; lo que llegue tarde de otra se ignora

  function actualizarTranscripcion() {
    setTextoFinal(finalRef.current);
    // Si el texto final llega después de detener, se agrega al audio ya entregado.
    if (audioRef.current && audioRef.current.transcripcion !== finalRef.current) {
      audioRef.current = { ...audioRef.current, transcripcion: finalRef.current };
      onAudio(audioRef.current);
    }
  }

  function iniciarTranscripcion() {
    const sesion = sesionRef.current;
    const reconocedor = crearReconocedor();
    if (!reconocedor) {
      setEstadoVivo(!TRANSCRIPCION_EN_VIVO ? "" : esTelefono() ? "telefono" : "no-disponible");
      return;
    }
    reconocedor.onresult = (e) => {
      if (sesion !== sesionRef.current) return;
      let provisional = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const resultado = e.results[i];
        const frase = resultado[0]?.transcript?.trim() ?? "";
        if (!frase) continue;
        if (resultado.isFinal) {
          finalRef.current = finalRef.current ? `${finalRef.current} ${frase}` : frase;
        } else {
          provisional = provisional ? `${provisional} ${frase}` : frase;
        }
      }
      setTextoProvisional(provisional);
      actualizarTranscripcion();
    };
    reconocedor.onerror = (e) => {
      // "no-speech" (silencio) y "aborted" (se detuvo) son normales; lo demás apaga la guía en vivo.
      if (sesion !== sesionRef.current || e.error === "no-speech" || e.error === "aborted") return;
      reconocedorRef.current = null;
      setEstadoVivo("error");
    };
    reconocedor.onend = () => {
      if (sesion !== sesionRef.current) return;
      // Algunos navegadores cortan el reconocimiento tras un silencio: se reanuda mientras se graba.
      if (grabandoRef.current && reconocedorRef.current === reconocedor) {
        try {
          reconocedor.start();
        } catch {
          setEstadoVivo("error");
        }
      } else {
        setTextoProvisional("");
      }
    };
    try {
      reconocedor.start();
      reconocedorRef.current = reconocedor;
      setEstadoVivo("escuchando");
    } catch {
      setEstadoVivo("error");
    }
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
      audioRef.current = {
        blob,
        url: URL.createObjectURL(blob),
        tipo: blob.type,
        duracion: Math.round((Date.now() - inicioRef.current) / 1000),
        transcripcion: finalRef.current,
      };
      onAudio(audioRef.current);
    };

    sesionRef.current += 1;
    finalRef.current = "";
    audioRef.current = null;
    setTextoFinal("");
    setTextoProvisional("");
    recorder.start();
    recorderRef.current = recorder;
    grabandoRef.current = true;
    inicioRef.current = Date.now();
    setSegundos(0);
    setGrabando(true);
    relojRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
    limiteRef.current = setTimeout(detener, maxSegundos * 1000);
    iniciarTranscripcion();
  }

  function detener() {
    grabandoRef.current = false;
    clearInterval(relojRef.current);
    clearTimeout(limiteRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    try {
      reconocedorRef.current?.stop(); // entrega lo último que estaba reconociendo
    } catch {}
    setGrabando(false);
  }

  function borrar() {
    if (audio) URL.revokeObjectURL(audio.url);
    sesionRef.current += 1;
    reconocedorRef.current = null;
    audioRef.current = null;
    finalRef.current = "";
    setTextoFinal("");
    setTextoProvisional("");
    setEstadoVivo("");
    onAudio(null);
  }

  function grabarDeNuevo() {
    borrar();
    iniciar();
  }

  // Si la persona sale de la pantalla a media grabación, se liberan el micrófono y el reconocimiento.
  useEffect(() => {
    return () => {
      grabandoRef.current = false;
      clearInterval(relojRef.current);
      clearTimeout(limiteRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      try {
        reconocedorRef.current?.abort();
      } catch {}
    };
  }, []);

  const transcripcionGuardada = audio?.transcripcion ?? textoFinal;

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      {!audio && (
        <>
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

          {grabando && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <p className="text-xs font-medium text-slate-500">
                {estadoVivo === "telefono" ? "Grabando" : "Transcripción en vivo"}
              </p>
              <p className="mt-1 min-h-12 text-base text-slate-900" aria-live="polite" data-transcripcion-en-vivo>
                {estadoVivo === "telefono" ? (
                  <span className="text-sm text-slate-500">
                    Te estamos escuchando. Al terminar podrás oír tu grabación y repetirla si quieres.
                  </span>
                ) : estadoVivo === "no-disponible" ? (
                  <span className="text-sm text-slate-500">
                    Este navegador no muestra el texto mientras hablas, pero tu audio se graba igual.
                  </span>
                ) : estadoVivo === "error" && !textoFinal ? (
                  <span className="text-sm text-slate-500">
                    No pudimos mostrar el texto en vivo, pero tu audio se graba igual.
                  </span>
                ) : textoFinal || textoProvisional ? (
                  <>
                    {textoFinal}
                    {textoProvisional && (
                      <span className="text-slate-400">
                        {textoFinal ? " " : ""}
                        {textoProvisional}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-slate-400">Habla y aquí verás lo que vamos entendiendo…</span>
                )}
              </p>
            </div>
          )}
        </>
      )}

      {audio && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-slate-700">Escucha tu grabación</p>
          <audio controls src={audio.url} className="w-full" />
          {transcripcionGuardada && (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <p className="text-xs font-medium text-slate-500">Lo que entendimos (aproximado)</p>
              <p className="mt-1 text-base text-slate-900" data-transcripcion>
                {transcripcionGuardada}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={grabarDeNuevo}
              disabled={deshabilitada}
              className="min-h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-400/30 disabled:opacity-50"
            >
              Grabar de nuevo
            </button>
            <button
              type="button"
              onClick={borrar}
              disabled={deshabilitada}
              className="text-sm font-medium text-teal-800 underline underline-offset-2 hover:text-teal-900 disabled:opacity-50"
            >
              Borrar
            </button>
          </div>
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
