// ════════════════════════════════════════════════════════════════════════
// lib/documentos.js — Qué documentación pide el programa
//
// Vive aquí y no en `app/api/dashboard/documentos/route.js`, que es donde
// estaba, porque ahora lo lee también un componente de cliente: la pestaña de
// Documentos de la ficha. Importar desde una ruta de API arrastraría al
// navegador todo lo que ese archivo importa, incluido el pool de MySQL.
//
// Este módulo es datos puros: no importa nada y no toca la base.
// ════════════════════════════════════════════════════════════════════════

/**
 * Documentos del programa, en el orden en que se le presentan a la candidata.
 * `requerido: false` marca los que suman pero no bloquean.
 */
export const DOCS_REQUERIDOS = [
  { tipo:"pasaporte",           label:"Pasaporte",                    emoji:"🛂", formatos:"PDF, JPG, PNG", requerido:true  },
  { tipo:"cedula",              label:"Cédula de identidad",          emoji:"🪪", formatos:"PDF, JPG, PNG", requerido:true  },
  { tipo:"foto_perfil",         label:"Foto de perfil reciente",      emoji:"📸", formatos:"JPG, PNG",      requerido:true  },
  { tipo:"primeros_auxilios",   label:"Certificado primeros auxilios",emoji:"🏥", formatos:"PDF",           requerido:true  },
  { tipo:"titulo_bachillerato", label:"Título / diploma bachillerato",emoji:"🎓", formatos:"PDF, JPG",      requerido:true  },
  { tipo:"antecedentes",        label:"Antecedentes judiciales",      emoji:"📋", formatos:"PDF",           requerido:true  },
  { tipo:"registro_civil",      label:"Registro civil de nacimiento", emoji:"📄", formatos:"PDF, JPG",      requerido:true  },
  { tipo:"certificado_medico",  label:"Certificado médico",           emoji:"⚕️", formatos:"PDF",           requerido:true  },
  { tipo:"carta_recomendacion", label:"Carta de recomendación",       emoji:"💌", formatos:"PDF",           requerido:false },
  { tipo:"titulo_universitario",label:"Título universitario",         emoji:"🎓", formatos:"PDF, JPG",      requerido:false },
  { tipo:"certificado_idioma",  label:"Certificado de idioma",        emoji:"🌎", formatos:"PDF",           requerido:false },
  { tipo:"foto_experiencia",    label:"Fotos con niños",              emoji:"👶", formatos:"JPG, PNG",      requerido:false },
];

/**
 * ¿Este documento cuenta como cargado?
 *
 * Un registro cuyo archivo se perdió del almacenamiento NO cuenta: la fila
 * existe pero no hay nada que revisar. El criterio es el mismo en el módulo de
 * documentos y en la pestaña de la ficha, y por eso vive aquí y no en cada
 * pantalla.
 */
export function documentoCargado(doc) {
  return !!doc && doc.disponible !== false;
}

/**
 * Cruza los documentos subidos con la lista de requeridos.
 *
 * @param {Array} docs  lo que devuelve la API, con su `disponible`
 * @returns {{ tipo:string, label:string, emoji:string, formatos:string,
 *             requerido:boolean, doc:object|null, cargado:boolean }[]}
 */
export function estadoDocumentacion(docs = []) {
  const porTipo = new Map(docs.map((d) => [d.tipo_doc, d]));
  return DOCS_REQUERIDOS.map((r) => {
    const doc = porTipo.get(r.tipo) || null;
    return { ...r, doc, cargado: documentoCargado(doc) };
  });
}

/** Cuántos obligatorios están efectivamente cargados, sobre cuántos hay. */
export function avanceDocumentacion(docs = []) {
  const obligatorios = estadoDocumentacion(docs).filter((d) => d.requerido);
  const cargados     = obligatorios.filter((d) => d.cargado).length;
  return { cargados, total: obligatorios.length };
}
