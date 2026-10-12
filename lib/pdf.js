// Genera el PDF de la ficha en el navegador (no pasa por el servidor).
// El formato imita una hoja de historia clínica: encabezado con fecha y número,
// secciones numeradas en romanos y tablas de etiqueta / dato.
import { SECCIONES, SIN_DATO, tituloNumerado } from "./ficha";

let modulo;

// jsPDF pesa bastante: se descarga solo cuando la persona llega a la ficha.
export function precargarPdf() {
  modulo ??= import("jspdf");
  return modulo;
}

// La fuente estándar del PDF solo tiene caracteres latinos (incluye tildes y ñ).
function limpiar(texto) {
  return String(texto ?? "")
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\n\x20-\x7E\xA1-\xFF]/g, "");
}

const VERDE = [15, 118, 110];
const VERDE_OSCURO = [19, 78, 74];
const TINTE = [229, 242, 240];
const FONDO_ETIQUETA = [245, 247, 247];
const BORDE = [186, 196, 198];
const TEXTO = [24, 30, 36];
const TENUE = [108, 117, 122];

const MARGEN = 16;
const RELLENO = 1.9; // espacio interior de cada celda
const LINEA = 4.4; // alto de cada renglón de texto
const ANCHO_ETIQUETA = 44;
const ALTO_PIE = 16;

export async function crearArchivoPdf(datos, ficha) {
  const { jsPDF } = await precargarPdf();
  const doc = new jsPDF({ unit: "mm", format: "letter" });

  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const ancho = anchoPagina - MARGEN * 2;
  let y = MARGEN;

  function asegurar(alto) {
    if (y + alto > altoPagina - ALTO_PIE) {
      doc.addPage();
      y = MARGEN;
    }
  }

  function fuente(estilo, tamano, color) {
    doc.setFont("helvetica", estilo);
    doc.setFontSize(tamano);
    doc.setTextColor(...color);
  }

  function celda(x, w, alto, relleno) {
    doc.setDrawColor(...BORDE);
    doc.setLineWidth(0.2);
    if (relleno) {
      doc.setFillColor(...relleno);
      doc.rect(x, y, w, alto, "FD");
    } else {
      doc.rect(x, y, w, alto, "S");
    }
  }

  function renglones(texto, w, estilo, tamano) {
    doc.setFont("helvetica", estilo);
    doc.setFontSize(tamano);
    return doc.splitTextToSize(limpiar(texto), w - RELLENO * 2);
  }

  function escribir(lineas, x, estilo, tamano, color) {
    fuente(estilo, tamano, color);
    lineas.forEach((linea, i) => doc.text(linea, x + RELLENO, y + RELLENO + 3.3 + i * LINEA));
  }

  // Un dato vacío se imprime como "No referido", en cursiva y más tenue.
  function valorImpreso(valor) {
    const texto = String(valor ?? "").trim();
    return texto
      ? { texto, estilo: "normal", color: TEXTO }
      : { texto: SIN_DATO, estilo: "italic", color: TENUE };
  }

  // Dibuja una fila de la tabla. "pares" son una o dos parejas [etiqueta, valor] en la misma fila.
  function fila(pares) {
    const anchoPar = ancho / pares.length;
    // La primera etiqueta mantiene el ancho de la columna; la segunda es más angosta.
    const anchoEtiqueta = (i) => (i === 0 ? ANCHO_ETIQUETA : 24);
    const medidas = pares.map(([etiqueta, valor], i) => {
      const v = valorImpreso(valor);
      const etiquetaW = anchoEtiqueta(i);
      return {
        etiqueta: renglones(etiqueta, etiquetaW, "bold", 8.5),
        valor: renglones(v.texto, anchoPar - etiquetaW, v.estilo, 10),
        v,
      };
    });
    const lineas = Math.max(...medidas.map((m) => Math.max(m.etiqueta.length, m.valor.length)));
    const alto = lineas * LINEA + RELLENO * 2;
    asegurar(alto);
    medidas.forEach((m, i) => {
      const x = MARGEN + i * anchoPar;
      const etiquetaW = anchoEtiqueta(i);
      celda(x, etiquetaW, alto, FONDO_ETIQUETA);
      celda(x + etiquetaW, anchoPar - etiquetaW, alto);
      escribir(m.etiqueta, x, "bold", 8.5, TENUE);
      escribir(m.valor, x + etiquetaW, m.v.estilo, 10, m.v.color);
    });
    y += alto;
  }

  // Dato único que ocupa todo el ancho (motivo de consulta, hábitos...).
  function bloque(valor) {
    const v = valorImpreso(valor);
    const lineas = renglones(v.texto, ancho, v.estilo, 10);
    const alto = Math.max(lineas.length * LINEA + RELLENO * 2, 9);
    asegurar(alto);
    celda(MARGEN, ancho, alto);
    escribir(lineas, MARGEN, v.estilo, 10, v.color);
    y += alto;
  }

  function tituloSeccion(texto) {
    asegurar(7 + 10);
    doc.setFillColor(...TINTE);
    doc.rect(MARGEN, y, ancho, 7, "F");
    doc.setFillColor(...VERDE);
    doc.rect(MARGEN, y, 1.2, 7, "F");
    fuente("bold", 10, VERDE_OSCURO);
    doc.text(limpiar(texto), MARGEN + 3.5, y + 4.8);
    y += 7;
  }

  // --- Encabezado ---
  const ahora = new Date();
  const dd = (n) => String(n).padStart(2, "0");
  const fecha = `${dd(ahora.getDate())}/${dd(ahora.getMonth() + 1)}/${ahora.getFullYear()}`;
  const hora = `${dd(ahora.getHours())}:${dd(ahora.getMinutes())}`;
  const numero = `PC-${String(ahora.getFullYear()).slice(2)}${dd(ahora.getMonth() + 1)}${dd(
    ahora.getDate()
  )}-${dd(ahora.getHours())}${dd(ahora.getMinutes())}`;

  doc.setFillColor(...VERDE);
  doc.rect(0, 0, anchoPagina, 3, "F");

  y = 11;
  fuente("bold", 15, TEXTO);
  doc.text("Ficha clínica previa a la consulta", MARGEN, y + 4);
  fuente("normal", 9, TENUE);
  doc.text("Información referida por el paciente antes de la cita", MARGEN, y + 9.5);

  const derecha = anchoPagina - MARGEN;
  [
    ["Fecha", fecha],
    ["Hora", hora],
    ["Ficha n.º", numero],
  ].forEach(([etiqueta, valor], i) => {
    fuente("normal", 9, TEXTO);
    doc.text(valor, derecha, y + 1 + i * 4.4, { align: "right" });
    fuente("bold", 8.5, TENUE);
    doc.text(etiqueta, derecha - 30, y + 1 + i * 4.4, { align: "right" });
  });

  y += 13;
  doc.setDrawColor(...VERDE);
  doc.setLineWidth(0.6);
  doc.line(MARGEN, y, derecha, y);
  y += 4;

  // --- I. Datos generales ---
  tituloSeccion(tituloNumerado(0, "Datos generales"));
  fila([["Nombre", datos.nombre]]);
  fila([
    ["Edad", datos.edad ? `${datos.edad} años` : ""],
    ["Sexo", datos.sexo],
  ]);
  fila([["Contacto", datos.contacto]]);
  y += 3;

  // --- II en adelante: lo que contó el paciente ---
  SECCIONES.forEach((seccion, i) => {
    tituloSeccion(tituloNumerado(i + 1, seccion.titulo));
    if (seccion.campos.length === 1) {
      bloque(ficha[seccion.campos[0].id]);
    } else {
      for (const campo of seccion.campos) {
        fila([[campo.clinica || campo.etiqueta, ficha[campo.id]]]);
      }
    }
    y += 3;
  });

  // --- Espacio para el médico ---
  // Solo se dibuja si cabe en la hoja: no vale la pena una página extra casi vacía.
  const libre = altoPagina - ALTO_PIE - y;
  const ALTO_FIRMA = 18;
  if (libre >= 7 + 16 + ALTO_FIRMA) {
    const altoNotas = Math.min(32, libre - 7 - ALTO_FIRMA);
    doc.setFillColor(...FONDO_ETIQUETA);
    doc.rect(MARGEN, y, ancho, 7, "F");
    fuente("bold", 10, TEXTO);
    doc.text("Para uso del médico: notas y observaciones", MARGEN + 3.5, y + 4.8);
    y += 7;
    celda(MARGEN, ancho, altoNotas);
    doc.setDrawColor(225, 230, 231);
    doc.setLineWidth(0.15);
    for (let renglon = 8; renglon < altoNotas - 2; renglon += 8) {
      doc.line(MARGEN + 3, y + renglon, derecha - 3, y + renglon);
    }
    y += altoNotas + 12;
    doc.setDrawColor(...TENUE);
    doc.setLineWidth(0.25);
    doc.line(derecha - 62, y, derecha, y);
    fuente("normal", 8.5, TENUE);
    doc.text("Firma y sello del médico", derecha - 31, y + 4, { align: "center" });
  }

  // --- Pie en todas las páginas ---
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    fuente("normal", 7.5, TENUE);
    doc.text(
      "Datos referidos por el paciente y ordenados con ayuda de IA. No constituye diagnóstico ni sustituye la evaluación médica.",
      MARGEN,
      altoPagina - 9
    );
    doc.text(`${numero}  |  Página ${i} de ${paginas}`, derecha, altoPagina - 5, { align: "right" });
  }

  const nombre = limpiar(datos.nombre).trim().replace(/[^A-Za-z0-9\xC0-\xFF]+/g, "-") || "paciente";
  return new File([doc.output("blob")], `ficha-${nombre}.pdf`, { type: "application/pdf" });
}
