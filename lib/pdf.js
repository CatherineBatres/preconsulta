// Genera el PDF de la ficha en el navegador (no pasa por el servidor).
import { SECCIONES, SIN_DATO, lineaPaciente } from "./ficha";

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

export async function crearArchivoPdf(datos, ficha) {
  const { jsPDF } = await precargarPdf();
  const doc = new jsPDF({ unit: "mm", format: "letter" });

  const margen = 18;
  const ancho = doc.internal.pageSize.getWidth() - margen * 2;
  const alto = doc.internal.pageSize.getHeight();
  let y = margen;

  function espacio(necesario) {
    if (y + necesario > alto - margen - 8) {
      doc.addPage();
      y = margen;
    }
  }

  function parrafo(texto, { tamano = 10.5, negrita = false, color = 30, salto = 5 } = {}) {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    doc.setTextColor(color);
    for (const linea of doc.splitTextToSize(limpiar(texto), ancho)) {
      espacio(salto);
      doc.text(linea, margen, y);
      y += salto;
    }
  }

  // Encabezado
  parrafo("Ficha médica previa a la consulta", { tamano: 16, negrita: true, salto: 7 });
  const fecha = new Date().toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" });
  parrafo(`Generada el ${fecha}`, { tamano: 9, color: 110 });
  y += 2;
  doc.setDrawColor(200);
  doc.line(margen, y, margen + ancho, y);
  y += 7;

  // Datos generales
  parrafo("Datos generales", { tamano: 12, negrita: true, salto: 6 });
  parrafo(`Nombre: ${datos.nombre || SIN_DATO}`);
  parrafo(`Edad y sexo: ${lineaPaciente(datos) || SIN_DATO}`);
  parrafo(`Contacto: ${datos.contacto || SIN_DATO}`);
  y += 4;

  // Secciones de la ficha
  for (const seccion of SECCIONES) {
    espacio(16);
    parrafo(seccion.titulo, { tamano: 12, negrita: true, salto: 6 });
    for (const campo of seccion.campos) {
      const valor = ficha[campo.id]?.trim() || SIN_DATO;
      if (seccion.campos.length > 1) {
        espacio(10);
        parrafo(campo.etiqueta, { tamano: 9, negrita: true, color: 90, salto: 4.5 });
      }
      parrafo(valor);
      y += 1.5;
    }
    y += 3;
  }

  // Pie en todas las páginas
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      "Información proporcionada por el paciente y ordenada con ayuda de IA. No es un diagnóstico.",
      margen,
      alto - 10
    );
    doc.text(`${i} / ${paginas}`, margen + ancho, alto - 10, { align: "right" });
  }

  const nombre = limpiar(datos.nombre).trim().replace(/[^A-Za-z0-9\xC0-\xFF]+/g, "-") || "paciente";
  return new File([doc.output("blob")], `ficha-${nombre}.pdf`, { type: "application/pdf" });
}
