"use client";

// Escala del 1 al 10 que se llena como las estrellas de una calificación: al tocar el 7,
// se pintan del 1 al 7. El color va de verde (leve) a rojo (muy fuerte).
function nivel(n) {
  if (n <= 3) return { nombre: "Leve", relleno: "bg-emerald-500 border-emerald-500", texto: "text-emerald-700" };
  if (n <= 6) return { nombre: "Moderado", relleno: "bg-amber-500 border-amber-500", texto: "text-amber-700" };
  if (n <= 8) return { nombre: "Fuerte", relleno: "bg-orange-600 border-orange-600", texto: "text-orange-700" };
  return { nombre: "Muy fuerte", relleno: "bg-red-600 border-red-600", texto: "text-red-700" };
}

export function EscalaNumerica({ valor = 0, onCambiar, titulo, id, deshabilitado = false }) {
  const elegido = valor ? nivel(valor) : null;
  return (
    <div className="mt-4" data-escala={id}>
      <p id={`${id}-titulo`} className="block text-sm font-medium text-slate-700">
        {titulo}
      </p>
      <div role="radiogroup" aria-labelledby={`${id}-titulo`} className="mt-2 flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const pintado = valor && n <= valor;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={valor === n}
              aria-label={`${n} de 10`}
              disabled={deshabilitado}
              onClick={() => onCambiar(valor === n ? 0 : n)}
              className={`flex min-h-11 flex-1 items-center justify-center rounded-lg border text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-marca/25 ${
                pintado ? `${nivel(n).relleno} text-white` : "border-borde bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500" aria-hidden="true">
        <span>Leve</span>
        <span>Moderado</span>
        <span>Muy fuerte</span>
      </div>
      {elegido && (
        <p className={`mt-2 text-sm font-semibold ${elegido.texto}`} aria-live="polite">
          {valor} de 10 · {elegido.nombre}
        </p>
      )}
    </div>
  );
}

// Escala corta de opciones con nombre (por ejemplo, de "Mucho peor" a "Mucho mejor").
export function EscalaOpciones({ opciones, valor, onCambiar, titulo, id, deshabilitado = false }) {
  const indice = opciones.indexOf(valor);
  const color = (i) => {
    const centro = (opciones.length - 1) / 2;
    if (i < centro) return "bg-red-600 border-red-600";
    if (i > centro) return "bg-emerald-600 border-emerald-600";
    return "bg-slate-500 border-slate-500";
  };
  return (
    <div className="mt-4" data-escala={id}>
      <p id={`${id}-titulo`} className="block text-sm font-medium text-slate-700">
        {titulo}
      </p>
      <div role="radiogroup" aria-labelledby={`${id}-titulo`} className="mt-2 grid grid-cols-5 gap-1">
        {opciones.map((opcion, i) => (
          <button
            key={opcion}
            type="button"
            role="radio"
            aria-checked={i === indice}
            disabled={deshabilitado}
            onClick={() => onCambiar(i === indice ? "" : opcion)}
            className={`min-h-12 rounded-lg border px-1 text-xs leading-tight font-semibold transition focus:outline-none focus:ring-4 focus:ring-marca/25 ${
              i === indice ? `${color(i)} text-white` : "border-borde bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}
