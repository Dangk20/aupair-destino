// ════════════════════════════════════════════════════════════════════════
// lib/cv-candidata.js — La hoja de vida de una candidata, en PDF
//
// Es lo ÚNICO de este producto que sale de la plataforma: la clienta lo envía
// a una agencia aliada. Por eso se dibuja con la línea gráfica del producto
// (lib/tema.js) y con Poppins, y no con la Helvetica que trae pdfkit.
//
// Se GENERA desde lib/campos-perfil.js, igual que la ficha y el formulario del
// admin: recorre PARTE1 y PARTE2 y usa `valorParaMostrar()` para cada valor.
// Ni una etiqueta escrita a mano. Una plantilla con sus propios títulos sería
// la cuarta lista de campos, que es el defecto que este proyecto ya corrigió.
//
// Lo que NUNCA entra: la valoración interna del equipo (`score_dap`,
// `calificacion_dap`, `nota_dap`, `notas_agencia`). No está declarada en
// campos-perfil.js, así que no puede colarse por recorrer las secciones; el
// generador además nunca la lee.
// ════════════════════════════════════════════════════════════════════════

import path from "node:path";
import PDFDocument from "pdfkit";
import { PARTE1, PARTE2, valorParaMostrar, edadDesde } from "@/lib/campos-perfil";
import { T } from "@/lib/tema";

const FUENTES = path.join(process.cwd(), "assets", "fuentes");
const REGULAR = path.join(FUENTES, "Poppins-Regular.ttf");
const NEGRITA = path.join(FUENTES, "Poppins-SemiBold.ttf");

// Carta, en puntos. Las candidatas y las agencias son de América.
const ANCHO = 612;
const ALTO  = 792;

const MARGEN      = 40;
const COL_IZQ     = 190;                       // ancho de la banda lateral
const COL_DER_X   = COL_IZQ + 28;
const COL_DER_W   = ANCHO - COL_DER_X - MARGEN;

const PARTES = [
  { n: 1, secciones: PARTE1, nombre: "Cuéntanos de ti" },
  { n: 2, secciones: PARTE2, nombre: "Perfil con la agencia" },
];

/** El data-URI de la foto, como Buffer. null si no hay o no se puede leer. */
function fotoComoBuffer(perfil) {
  const v = String(perfil?.foto_url ?? "");
  const m = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(v);
  if (!m) return null;
  try {
    const buf = Buffer.from(m[2], "base64");
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  }
}

/**
 * La hoja de vida de una candidata.
 *
 * @param {object} perfil  la fila de `usuarios`, ya filtrada por lib/perfil.js
 * @returns {Promise<Buffer>} el PDF
 */
export function generarCV(perfil = {}) {
  return new Promise((resolve, reject) => {
    // `font: null` evita que pdfkit cargue Helvetica al crear el documento:
    // sus métricas viven en archivos .afm que el rastreo de Next no ve. Todo
    // el texto usa Poppins, así que esos archivos no hacen falta.
    const doc = new PDFDocument({ size: [ANCHO, ALTO], margin: 0, font: null });
    const trozos = [];
    doc.on("data", (d) => trozos.push(d));
    doc.on("end", () => resolve(Buffer.concat(trozos)));
    doc.on("error", reject);

    doc.registerFont("cuerpo", REGULAR);
    doc.registerFont("titulo", NEGRITA);

    const nombre = `${perfil.nombre || ""} ${perfil.apellido || ""}`.trim() || "Candidata";
    const anios  = edadDesde(perfil.fecha_nacimiento);
    const lugar  = [perfil.ciudad, perfil.pais].filter(Boolean).join(", ");

    /* ── Banda lateral ──────────────────────────────────────────────────── */
    const bandaLateral = () => {
      doc.rect(0, 0, COL_IZQ, ALTO).fill(T.lilac);
    };

    /* ── Encabezado: foto, nombre, contacto ─────────────────────────────── */
    bandaLateral();

    const foto = fotoComoBuffer(perfil);
    const cx = COL_IZQ / 2;
    const cy = 96;
    const r  = 54;

    doc.save().circle(cx, cy, r).clip();
    if (foto) {
      try {
        // `cover` recorta al círculo sin deformar la foto.
        doc.image(foto, cx - r, cy - r, { cover: [r * 2, r * 2], align: "center", valign: "center" });
      } catch {
        // En producción llegó a quedar `data:img` en esta columna. Que el CV
        // no se genere por una foto rota sería peor que un CV sin foto.
        doc.rect(cx - r, cy - r, r * 2, r * 2).fill(T.primary);
      }
    } else {
      doc.rect(cx - r, cy - r, r * 2, r * 2).fill(T.primary);
    }
    doc.restore();

    if (!foto) {
      doc.font("titulo").fontSize(40).fillColor("#fff")
         .text((perfil.nombre || "?").charAt(0).toUpperCase(), cx - r, cy - 22, { width: r * 2, align: "center" });
    }
    doc.circle(cx, cy, r).lineWidth(2).stroke(T.primary3);

    // Contacto, en la banda
    let y = cy + r + 24;
    const enBanda = (etiqueta, valor) => {
      if (!valor) return;
      doc.font("titulo").fontSize(7).fillColor(T.primary)
         .text(etiqueta.toUpperCase(), MARGEN / 2, y, { width: COL_IZQ - MARGEN, characterSpacing: 0.8 });
      y += 11;
      doc.font("cuerpo").fontSize(9).fillColor(T.ink)
         .text(String(valor), MARGEN / 2, y, { width: COL_IZQ - MARGEN });
      y = doc.y + 10;
    };

    doc.font("titulo").fontSize(9).fillColor(T.primary)
       .text("CONTACTO", MARGEN / 2, y, { width: COL_IZQ - MARGEN, characterSpacing: 1 });
    y += 16;
    enBanda("Correo",   perfil.email);
    enBanda("Teléfono", perfil.telefono);
    enBanda("Ciudad",   lugar);
    enBanda("Cédula",   perfil.cedula);
    if (anios) enBanda("Edad", `${anios} años`);

    /* ── Columna derecha: nombre y las quince secciones ─────────────────── */
    doc.font("titulo").fontSize(26).fillColor(T.ink)
       .text(nombre, COL_DER_X, 52, { width: COL_DER_W });
    doc.font("cuerpo").fontSize(11).fillColor(T.primary)
       .text("Futura Au Pair", COL_DER_X, doc.y + 2, { width: COL_DER_W });
    doc.moveTo(COL_DER_X, doc.y + 10).lineTo(ANCHO - MARGEN, doc.y + 10).lineWidth(1.5).stroke(T.primary3);

    let dy = doc.y + 22;

    /** Salta de página cuando ya no cabe, y repinta la banda. */
    const asegurarEspacio = (alto) => {
      if (dy + alto <= ALTO - MARGEN) return;
      doc.addPage();
      bandaLateral();
      dy = MARGEN;
    };

    for (const parte of PARTES) {
      asegurarEspacio(40);
      doc.font("titulo").fontSize(8).fillColor(T.primary3)
         .text(`PARTE ${parte.n} · ${parte.nombre.toUpperCase()}`, COL_DER_X, dy, { width: COL_DER_W, characterSpacing: 0.8 });
      dy = doc.y + 10;

      for (const seccion of parte.secciones) {
        asegurarEspacio(46);
        doc.font("titulo").fontSize(12).fillColor(T.primary)
           .text(seccion.titulo, COL_DER_X, dy, { width: COL_DER_W });
        dy = doc.y + 3;
        doc.moveTo(COL_DER_X, dy).lineTo(ANCHO - MARGEN, dy).lineWidth(0.7).stroke(T.border);
        dy += 8;

        for (const campo of seccion.campos) {
          const { tipo, texto } = valorParaMostrar(campo, perfil);

          // La foto ya está en el encabezado. Volcar aquí su data-URI serían
          // cuarenta mil caracteres de basura en mitad del documento.
          if (tipo === "imagen") continue;

          const anchoEtiqueta = 150;
          const anchoValor    = COL_DER_W - anchoEtiqueta - 8;
          const alto = Math.max(
            doc.font("cuerpo").fontSize(8.5).heightOfString(campo.label, { width: anchoEtiqueta }),
            doc.font("cuerpo").fontSize(9).heightOfString(texto, { width: anchoValor })
          );
          asegurarEspacio(alto + 8);

          doc.font("cuerpo").fontSize(8.5).fillColor(T.textSoft)
             .text(campo.label, COL_DER_X, dy, { width: anchoEtiqueta });
          doc.font(tipo === "vacio" ? "cuerpo" : "titulo").fontSize(9)
             .fillColor(tipo === "vacio" ? T.softText : T.text)
             .text(texto, COL_DER_X + anchoEtiqueta + 8, dy, { width: anchoValor });

          dy += alto + 6;
        }
        dy += 8;
      }
    }

    doc.end();
  });
}
