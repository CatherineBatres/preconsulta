"use client";

import { useEffect, useRef, useState } from "react";
import { Icono, Logo } from "./marca";

// Mini tutorial: aparece la primera vez que alguien abre la app y se puede volver a abrir
// con "¿Cómo funciona?". En la última pantalla la persona elige su tipo de consulta.
export const CLAVE_TUTORIAL = "preconsulta.tutorialVisto";

export function tutorialVisto() {
  try {
    return window.localStorage.getItem(CLAVE_TUTORIAL) === "1";
  } catch {
    return true; // si el navegador no deja guardar, no se insiste en cada visita
  }
}

function marcarVisto() {
  try {
    window.localStorage.setItem(CLAVE_TUTORIAL, "1");
  } catch {}
}

const PANTALLAS = [
  {
    icono: "ficha",
    titulo: "Prepara tu consulta en unos 5 minutos",
    texto:
      "Cuentas qué te pasa, la app te hace algunas preguntas y arma una ficha ordenada para tu médico.",
    nota: "No te responde un médico ni da diagnósticos: tú preparas la ficha y tú se la envías.",
  },
  {
    icono: "microfono",
    titulo: "Habla o escribe, como prefieras",
    texto:
      "Presiona Grabar y cuéntalo como en la consulta. Verás el texto mientras hablas, y al terminar puedes escucharte o grabar de nuevo. Si no puedes hablar, escríbelo.",
  },
  {
    icono: "preguntas",
    titulo: "Responde unas preguntas",
    texto:
      "La app te pregunta, una por una, lo que falta: desde cuándo, qué tan fuerte, qué medicamentos tomas. Si no sabes o no aplica, tócalo y sigue.",
  },
  {
    icono: "enviar",
    titulo: "Revisa y envía tu ficha",
    texto:
      "Corrige cualquier dato tocándolo y compártela en PDF por WhatsApp o correo. Si quieres, guárdala en tu teléfono para tu próxima cita.",
  },
];

export default function Tutorial({ abierto, onCerrar, onElegirModo }) {
  const [pantalla, setPantalla] = useState(0);
  const dialogoRef = useRef(null);
  const ultima = pantalla === PANTALLAS.length; // la de elegir el tipo de consulta

  useEffect(() => {
    if (abierto) dialogoRef.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  if (!abierto) return null;

  function cerrar() {
    marcarVisto();
    setPantalla(0); // la próxima vez empieza desde el inicio
    onCerrar();
  }

  function elegir(modo) {
    marcarVisto();
    setPantalla(0);
    onElegirModo(modo);
    onCerrar();
  }

  const actual = PANTALLAS[pantalla];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0E2A33]/50 p-0 sm:items-center sm:p-4">
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-titulo"
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl focus:outline-none sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="text-sm font-semibold text-[#0E2A33]">Cómo funciona</span>
          </div>
          <button
            type="button"
            onClick={cerrar}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-300/50"
          >
            Saltar
          </button>
        </div>

        {!ultima ? (
          <div className="mt-6" aria-live="polite">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F2F0] text-[#0F766E]">
              <Icono nombre={actual.icono} className="h-7 w-7" />
            </div>
            <p className="mt-5 text-sm font-medium text-[#0F766E]">
              Paso {pantalla + 1} de {PANTALLAS.length}
            </p>
            <h2 id="tutorial-titulo" className="mt-1 text-2xl leading-tight font-semibold text-[#0E2A33]">
              {actual.titulo}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{actual.texto}</p>
            {actual.nota && (
              <p className="mt-4 rounded-xl border border-[#BFE3DD] bg-[#F2FAF8] px-4 py-3 text-sm leading-relaxed text-[#134E4A]">
                {actual.nota}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6" aria-live="polite">
            <h2 id="tutorial-titulo" className="text-2xl leading-tight font-semibold text-[#0E2A33]">
              ¿Qué tipo de consulta es?
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-600">
              Así sabremos qué preguntarte. Puedes cambiarlo después.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => elegir("primera")}
                className="flex items-start gap-4 rounded-2xl border border-[#D7E0E3] p-4 text-left transition hover:border-[#0F766E] hover:bg-[#F2FAF8] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/25"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F2F0] text-[#0F766E]">
                  <Icono nombre="nueva" />
                </span>
                <span>
                  <span className="block text-base font-semibold text-[#0E2A33]">Es mi primera vez</span>
                  <span className="mt-1 block text-sm leading-snug text-slate-600">
                    Vas a ver a un médico por algo nuevo. Te preguntaremos todo desde el inicio.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => elegir("control")}
                className="flex items-start gap-4 rounded-2xl border border-[#D7E0E3] p-4 text-left transition hover:border-[#0F766E] hover:bg-[#F2FAF8] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/25"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F2F0] text-[#0F766E]">
                  <Icono nombre="control" />
                </span>
                <span>
                  <span className="block text-base font-semibold text-[#0E2A33]">Es una consulta de control</span>
                  <span className="mt-1 block text-sm leading-snug text-slate-600">
                    Vuelves por el mismo problema. Si guardaste tu ficha en este teléfono, la retomamos y te
                    preguntamos cómo evolucionaste.
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {[...PANTALLAS, null].map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === pantalla ? "w-6 bg-[#0F766E]" : "w-1.5 bg-[#D7E0E3]"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {pantalla > 0 && (
              <button
                type="button"
                onClick={() => setPantalla(pantalla - 1)}
                className="min-h-11 rounded-xl px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-300/50"
              >
                Atrás
              </button>
            )}
            {!ultima && (
              <button
                type="button"
                onClick={() => setPantalla(pantalla + 1)}
                className="min-h-11 rounded-xl bg-[#0F766E] px-5 text-sm font-semibold text-white hover:bg-[#115E59] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/30"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
