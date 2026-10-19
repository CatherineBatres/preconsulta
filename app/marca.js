// Logo de PreConsulta: una ficha con una onda de voz. Dibujado a mano, sin imágenes externas.
export function Logo({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#0F766E" />
      <rect x="11" y="8" width="18" height="24" rx="3" fill="#FFFFFF" />
      <path d="M15 14h10M15 18h6" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M14 25h2l1.5-3 2 6 2-8 1.5 5h3"
        fill="none"
        stroke="#0E2A33"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Íconos simples para el tutorial y el selector de tipo de consulta.
export function Icono({ nombre, className = "h-6 w-6" }) {
  const comun = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const trazos = {
    microfono: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" {...comun} />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" {...comun} />
      </>
    ),
    preguntas: (
      <>
        <path d="M4 5h16v11H9l-5 4z" {...comun} />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4" {...comun} />
        <path d="M12 14.6v.1" {...comun} />
      </>
    ),
    ficha: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" {...comun} />
        <path d="M9 8h6M9 12h6M9 16h3" {...comun} />
      </>
    ),
    enviar: <path d="M4 12 20 4l-4 16-4-7z M12 13l8-9" {...comun} />,
    nueva: (
      <>
        <circle cx="12" cy="12" r="8.5" {...comun} />
        <path d="M12 8v8M8 12h8" {...comun} />
      </>
    ),
    control: (
      <>
        <path d="M4 12a8 8 0 1 0 2.3-5.6" {...comun} />
        <path d="M4 4v4h4M12 8v4.5l3 1.8" {...comun} />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {trazos[nombre]}
    </svg>
  );
}
