"use client";

import { useState } from "react";

// Mapa del cuerpo: la persona toca dónde le molesta (de frente o de espalda) y eso se
// escribe en "Dónde" de la ficha. Derecha e izquierda son las del paciente: de frente,
// su lado derecho queda a la izquierda de la pantalla.
const FORMAS = {
  cabeza: { t: "e", cx: 100, cy: 40, rx: 26, ry: 31 },
  cuello: { t: "r", x: 88, y: 70, w: 24, h: 14, r: 5 },
  hombroA: { t: "e", cx: 50, cy: 96, rx: 15, ry: 13 },
  hombroB: { t: "e", cx: 150, cy: 96, rx: 15, ry: 13 },
  torso: { t: "r", x: 64, y: 86, w: 72, h: 56, r: 14 },
  abdArribaA: { t: "r", x: 66, y: 144, w: 33, h: 36, r: 6 },
  abdArribaB: { t: "r", x: 101, y: 144, w: 33, h: 36, r: 6 },
  abdAbajoA: { t: "r", x: 66, y: 182, w: 33, h: 34, r: 6 },
  abdAbajoB: { t: "r", x: 101, y: 182, w: 33, h: 34, r: 6 },
  pelvis: { t: "r", x: 66, y: 218, w: 68, h: 24, r: 10 },
  brazoA: { t: "r", x: 30, y: 110, w: 22, h: 110, r: 11 },
  brazoB: { t: "r", x: 148, y: 110, w: 22, h: 110, r: 11 },
  manoA: { t: "e", cx: 40, cy: 234, rx: 12, ry: 13 },
  manoB: { t: "e", cx: 160, cy: 234, rx: 12, ry: 13 },
  musloA: { t: "r", x: 68, y: 244, w: 30, h: 70, r: 12 },
  musloB: { t: "r", x: 102, y: 244, w: 30, h: 70, r: 12 },
  rodillaA: { t: "e", cx: 83, cy: 326, rx: 15, ry: 12 },
  rodillaB: { t: "e", cx: 117, cy: 326, rx: 15, ry: 12 },
  piernaA: { t: "r", x: 71, y: 339, w: 24, h: 58, r: 10 },
  piernaB: { t: "r", x: 105, y: 339, w: 24, h: 58, r: 10 },
  pieA: { t: "e", cx: 82, cy: 409, rx: 17, ry: 9 },
  pieB: { t: "e", cx: 118, cy: 409, rx: 17, ry: 9 },
};

// "A" es el lado izquierdo de la pantalla y "B" el derecho.
// De frente, A = lado derecho del paciente; de espalda, A = lado izquierdo.
function nombres(vista) {
  const [ladoA, ladoB] = vista === "frente" ? ["derecho", "izquierdo"] : ["izquierdo", "derecho"];
  const [ladaA, ladaB] = vista === "frente" ? ["derecha", "izquierda"] : ["izquierda", "derecha"];
  const comunes = {
    hombroA: `Hombro ${ladoA}`,
    hombroB: `Hombro ${ladoB}`,
    brazoA: `Brazo ${ladoA}`,
    brazoB: `Brazo ${ladoB}`,
    manoA: `Mano ${ladaA}`,
    manoB: `Mano ${ladaB}`,
    pieA: `Pie ${ladoA}`,
    pieB: `Pie ${ladoB}`,
  };
  if (vista === "frente") {
    return {
      ...comunes,
      cabeza: "Cabeza o cara",
      cuello: "Cuello o garganta",
      torso: "Pecho",
      abdArribaA: "Abdomen arriba, lado derecho",
      abdArribaB: "Abdomen arriba, lado izquierdo",
      abdAbajoA: "Abdomen abajo, lado derecho",
      abdAbajoB: "Abdomen abajo, lado izquierdo",
      pelvis: "Ingle o pelvis",
      musloA: `Muslo ${ladoA}`,
      musloB: `Muslo ${ladoB}`,
      rodillaA: `Rodilla ${ladaA}`,
      rodillaB: `Rodilla ${ladaB}`,
      piernaA: `Espinilla ${ladaA}`,
      piernaB: `Espinilla ${ladaB}`,
    };
  }
  return {
    ...comunes,
    cabeza: "Nuca o parte de atrás de la cabeza",
    cuello: "Cuello por detrás",
    torso: "Espalda alta",
    abdArribaA: `Espalda media, lado ${ladoA}`,
    abdArribaB: `Espalda media, lado ${ladoB}`,
    abdAbajoA: `Espalda baja, lado ${ladoA}`,
    abdAbajoB: `Espalda baja, lado ${ladoB}`,
    pelvis: "Glúteos o coxis",
    musloA: `Muslo ${ladoA} por detrás`,
    musloB: `Muslo ${ladoB} por detrás`,
    rodillaA: `Detrás de la rodilla ${ladaA}`,
    rodillaB: `Detrás de la rodilla ${ladaB}`,
    piernaA: `Pantorrilla ${ladaA}`,
    piernaB: `Pantorrilla ${ladaB}`,
  };
}

function Forma({ forma, ...props }) {
  if (forma.t === "e") return <ellipse cx={forma.cx} cy={forma.cy} rx={forma.rx} ry={forma.ry} {...props} />;
  return <rect x={forma.x} y={forma.y} width={forma.w} height={forma.h} rx={forma.r} {...props} />;
}

// "elegidos" es una lista de nombres ("Rodilla derecha"); onCambiar recibe la lista nueva.
export default function MapaDelCuerpo({ elegidos = [], onCambiar, titulo, deshabilitado = false }) {
  const [vista, setVista] = useState("frente");
  const etiquetas = nombres(vista);

  function alternar(nombre) {
    if (deshabilitado) return;
    onCambiar(elegidos.includes(nombre) ? elegidos.filter((n) => n !== nombre) : [...elegidos, nombre]);
  }

  // Orden de dibujo: lo de atrás primero para que lo pequeño (manos, rodillas) quede encima.
  const orden = [
    "brazoA",
    "brazoB",
    "hombroA",
    "hombroB",
    "torso",
    "cuello",
    "cabeza",
    "abdArribaA",
    "abdArribaB",
    "abdAbajoA",
    "abdAbajoB",
    "pelvis",
    "musloA",
    "musloB",
    "piernaA",
    "piernaB",
    "rodillaA",
    "rodillaB",
    "manoA",
    "manoB",
    "pieA",
    "pieB",
  ];

  return (
    <div className="mt-4" data-mapa-cuerpo>
      <p className="block text-sm font-medium text-slate-700">{titulo}</p>
      <div className="mt-2 inline-flex rounded-full border border-borde bg-slate-50 p-1" role="group" aria-label="Vista">
        {[
          ["frente", "De frente"],
          ["espalda", "De espalda"],
        ].map(([id, texto]) => (
          <button
            key={id}
            type="button"
            aria-pressed={vista === id}
            onClick={() => setVista(id)}
            className={`min-h-9 rounded-full px-4 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-marca/25 ${
              vista === id ? "bg-white text-tinta shadow-sm" : "text-slate-500"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-center">
        <svg viewBox="0 0 200 425" className="h-auto w-56" role="group" aria-label={`Cuerpo visto ${vista === "frente" ? "de frente" : "de espalda"}`}>
          {orden.map((id) => {
            const nombre = etiquetas[id];
            const activo = elegidos.includes(nombre);
            return (
              <Forma
                key={`${vista}-${id}`}
                forma={FORMAS[id]}
                role="button"
                tabIndex={0}
                aria-label={nombre}
                aria-pressed={activo}
                onClick={() => alternar(nombre)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    alternar(nombre);
                  }
                }}
                className={`cursor-pointer outline-none transition-colors focus-visible:stroke-[3] ${
                  activo ? "fill-red-500 stroke-red-700" : "fill-[#E3ECEE] stroke-[#AFC2C7] hover:fill-[#CFE3E0]"
                }`}
                strokeWidth={1.5}
              >
                <title>{nombre}</title>
              </Forma>
            );
          })}
        </svg>
      </div>
      <p className="mt-1 text-center text-xs text-slate-500">
        {vista === "frente" ? "Tu lado derecho está a la izquierda de la pantalla." : "Vista de espalda: tu lado derecho está a la derecha."}
      </p>

      {elegidos.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Lugares elegidos">
          {elegidos.map((nombre) => (
            <li key={nombre}>
              <button
                type="button"
                onClick={() => alternar(nombre)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-red-50 px-3 text-sm font-medium text-red-800 ring-1 ring-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label={`Quitar ${nombre}`}
              >
                {nombre} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
