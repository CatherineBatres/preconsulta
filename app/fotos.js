"use client";

import { useRef, useState } from "react";

// Fotos que el paciente agrega para su médico: solo de la caja, el frasco o la receta de un
// medicamento. Las fotos de lesiones se quitaron por privacidad (ver decisión 13).
// Las fotos solo existen en la memoria del navegador y van dentro del PDF:
// no se envían a la IA ni se guardan en el teléfono.
export const MAX_FOTOS = 3;
const LADO_MAXIMO = 1280; // px: suficiente para que el médico vea el detalle
const CALIDAD = 0.72;

// Achica la foto a JPEG para que el PDF pese poco y se pueda mandar por WhatsApp.
export async function prepararFoto(archivo) {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const ancho = Math.round(imagen.width * escala);
  const alto = Math.round(imagen.height * escala);
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const contexto = lienzo.getContext("2d");
  contexto.fillStyle = "#ffffff"; // por si la imagen trae transparencia
  contexto.fillRect(0, 0, ancho, alto);
  contexto.drawImage(imagen, 0, 0, ancho, alto);
  imagen.close?.();
  return { url: lienzo.toDataURL("image/jpeg", CALIDAD), ancho, alto };
}

// "fotos" es la lista completa; este bloque solo muestra y agrega las de su "tipo".
export default function Fotos({ fotos, onCambiar, tipo, titulo, ayuda, deshabilitado = false }) {
  const entradaRef = useRef(null);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const propias = fotos.filter((f) => f.tipo === tipo);
  const quedan = MAX_FOTOS - propias.length;

  async function alElegir(e) {
    const archivos = [...(e.target.files ?? [])].filter((a) => a.type.startsWith("image/")).slice(0, quedan);
    e.target.value = ""; // permite elegir la misma foto otra vez
    if (archivos.length === 0) return;
    setError("");
    setProcesando(true);
    try {
      const nuevas = [];
      for (const archivo of archivos) {
        const foto = await prepararFoto(archivo);
        nuevas.push({ ...foto, tipo, id: `${tipo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` });
      }
      onCambiar([...fotos, ...nuevas]);
    } catch {
      setError("No pudimos abrir esa foto. Prueba con otra.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="mt-4" data-fotos={tipo}>
      <p className={`block text-sm font-medium text-slate-700`}>
        {titulo} <span className="font-normal text-slate-500">(opcional, hasta {MAX_FOTOS})</span>
      </p>
      <p className="mt-1 text-sm text-slate-500">{ayuda}</p>

      {propias.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {propias.map((foto, i) => (
            <li key={foto.id} className="relative overflow-hidden rounded-lg border border-borde bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- es una foto local, no un recurso del sitio */}
              <img src={foto.url} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => onCambiar(fotos.filter((f) => f.id !== foto.id))}
                disabled={deshabilitado}
                className="absolute top-1 right-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow focus:outline-none focus:ring-2 focus:ring-marca/40"
                aria-label={`Quitar foto ${i + 1}`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {quedan > 0 && (
        <>
          <input
            ref={entradaRef}
            type="file"
            accept="image/*"
            multiple
            onChange={alElegir}
            className="sr-only"
            aria-label={titulo}
            data-entrada-fotos={tipo}
          />
          <button
            type="button"
            onClick={() => entradaRef.current?.click()}
            disabled={deshabilitado || procesando}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-borde bg-white px-4 text-sm font-medium text-tinta transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-marca/25 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M4 8h3l1.5-2h7L17 8h3v11H4z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            {procesando ? "Preparando foto…" : propias.length ? "Agregar otra foto" : "Agregar foto"}
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
