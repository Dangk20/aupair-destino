// ════════════════════════════════════════════════════════════════════════
// lib/campos-perfil.js — Qué campos del perfil son obligatorios
//
// Fuente ÚNICA para el formulario de la candidata, la validación del servidor y
// el cálculo de progreso. Antes cada uno usaba su propio criterio: el perfil de
// agencia daba una sección por completa con la mitad de sus campos, y por eso
// un perfil podía verse "100%" con campos vacíos.
//
// Estructura de un campo:
//   { name, label, requeridoSi? }
//     name        columna en `usuarios`
//     label       etiqueta corta que la candidata reconoce (para el resumen)
//     requeridoSi (form) => boolean — sólo obligatorio si la condición se cumple
//                 (ej. el detalle de una visa negada sólo aplica si dijo "Si")
// ════════════════════════════════════════════════════════════════════════

const siEs = (campo, ...valores) => (form) => valores.includes(form?.[campo]);

/* ── PARTE 1 — "Cuéntanos de ti" (/dashboard/perfil/evaluacion) ─────────── */
export const PARTE1 = [
  {
    id: "personal",
    titulo: "Información personal",
    campos: [
      { name: "cedula",           label: "Cédula" },
      { name: "telefono",         label: "Teléfono" },
      { name: "fecha_nacimiento", label: "Fecha de nacimiento" },
      { name: "ciudad",           label: "Ciudad" },
      { name: "pais",             label: "País" },
    ],
  },
  {
    id: "habilidades",
    titulo: "Requisitos y habilidades",
    campos: [
      { name: "conoce_requisitos_26",    label: "Requisitos si tienes 26 años" },
      { name: "conoce_requisitos_18_20", label: "Requisitos entre 18 y 20 años" },
      { name: "curso_primeros_auxilios", label: "Curso de primeros auxilios" },
      { name: "nivel_ingles",            label: "Nivel de inglés" },
      { name: "licencia_conduccion",     label: "Licencia de conducción" },
      { name: "habilidad_conduccion",    label: "Habilidad para conducir" },
    ],
  },
  {
    id: "situacion",
    titulo: "Situación actual",
    campos: [
      { name: "situacion_actual",        label: "Qué haces en este momento" },
      { name: "detalle_estudios",        label: "Detalle de tus estudios",
        requeridoSi: siEs("situacion_actual", "Estudio") },
      { name: "detalle_trabajo",         label: "Detalle de tu trabajo",
        requeridoSi: siEs("situacion_actual", "Trabajo") },
      { name: "detalle_sin_ocupacion",   label: "Desde cuándo no tienes ocupación",
        requeridoSi: siEs("situacion_actual", "No hago nada") },
      { name: "detalle_otra_actividad",  label: "Detalle de tu otra actividad",
        requeridoSi: siEs("situacion_actual", "Desempeño otra actividad") },
    ],
  },
  {
    id: "salud",
    titulo: "Salud",
    campos: [
      { name: "enfermedad_medicamentos", label: "Enfermedad con medicamentos constantes" },
      { name: "detalle_enfermedad_med",  label: "Explicación de la enfermedad",
        requeridoSi: siEs("enfermedad_medicamentos", "Si") },
      { name: "enfermedad_grave",        label: "Enfermedad grave" },
      { name: "detalle_enfermedad_grave", label: "Detalle de la enfermedad grave",
        requeridoSi: siEs("enfermedad_grave", "Si") },
      { name: "depresion_panico",        label: "Depresión o ataques de pánico" },
      { name: "trastorno_alimenticio",   label: "Trastorno alimenticio" },
      { name: "autolesiones",            label: "Autolesiones" },
      { name: "abuso_sustancias",        label: "Abuso de sustancias" },
      { name: "detalle_salud_mental",    label: "Detalle de salud mental" },
      { name: "isotretinoina",           label: "Tratamiento con isotretinoína" },
      { name: "condiciones_fisicas",     label: "Condiciones físicas" },
      { name: "alergia_medicamentos",    label: "Alergia a medicamentos" },
      { name: "detalle_alergias",        label: "A cuáles medicamentos eres alérgica",
        requeridoSi: siEs("alergia_medicamentos", "Si") },
      { name: "dosis_covid",             label: "Dosis de vacuna covid" },
      { name: "vacuna_covid",            label: "Vacuna covid aplicada" },
    ],
  },
  {
    id: "experiencia",
    titulo: "Experiencia con niños",
    campos: [
      { name: "exp_ninos_externos", label: "Experiencia con niños fuera de tu familia" },
      { name: "horas_exp_ninos",    label: "Horas de experiencia" },
    ],
  },
  {
    id: "visas",
    titulo: "Visas y compromisos",
    campos: [
      { name: "visa_negada",                   label: "Visa negada" },
      { name: "detalle_visa_negada",           label: "Detalle de la visa negada",
        requeridoSi: siEs("visa_negada", "Si") },
      { name: "visa_cancelada",                label: "Visa cancelada" },
      { name: "familiar_residencia_usa",       label: "Familiar con residencia en USA" },
      { name: "detalle_familiar_residencia",   label: "Detalle del familiar con residencia",
        requeridoSi: siEs("familiar_residencia_usa", "Si") },
      { name: "familiar_visa_estudio_usa",     label: "Familiar con visa de estudio en USA" },
      { name: "detalle_familiar_visa_estudio", label: "Detalle del familiar con visa de estudio",
        requeridoSi: siEs("familiar_visa_estudio_usa", "Si") },
      { name: "overstay_otro_pais",            label: "Permanencia excedida en otro país" },
      { name: "entiende_intercambio_cultural", label: "Entiendes que es intercambio cultural" },
      { name: "consciente_riesgo_familiar",    label: "Consciente del riesgo por asilo familiar" },
      { name: "participo_programa_ap",         label: "Participaste antes en el programa" },
      { name: "finalizo_programa_ap",          label: "Finalizaste el programa anterior",
        requeridoSi: siEs("participo_programa_ap", "Si") },
      { name: "puede_proveer_certificados",    label: "Puedes proveer certificados",
        requeridoSi: siEs("participo_programa_ap", "Si") },
    ],
  },
];

/* ── PARTE 2 — Perfil para la agencia (/dashboard/perfil/agencia) ───────── */
export const PARTE2 = [
  {
    id: "personal",
    titulo: "Información personal",
    campos: [
      { name: "estatura",        label: "Estatura" },
      { name: "peso",            label: "Peso" },
      { name: "nacionalidad",    label: "Nacionalidad" },
      { name: "tiene_pasaporte", label: "¿Tienes pasaporte?" },
    ],
  },
  {
    id: "experiencia",
    titulo: "Experiencia con niños",
    campos: [
      { name: "experiencia_cuidado", label: "Descripción de tu experiencia con niños" },
      { name: "horas_childcare",     label: "Horas de childcare acumuladas" },
    ],
  },
  {
    id: "educacion",
    titulo: "Educación y cursos",
    campos: [
      { name: "situacion_actual", label: "Qué haces actualmente" },
    ],
  },
  {
    id: "conduccion",
    titulo: "Conducción",
    campos: [
      { name: "licencia_conduccion", label: "¿Tienes licencia?" },
      { name: "tipo_licencia",       label: "Tipo de licencia" },
    ],
  },
  {
    id: "personalidad",
    titulo: "Personalidad e intereses",
    campos: [
      { name: "bio",     label: "Descripción personal" },
      { name: "hobbies", label: "Hobbies e intereses" },
    ],
  },
  {
    id: "preguntas",
    titulo: "Preguntas para familias",
    campos: [
      { name: "por_que_au_pair", label: "Por qué quieres ser au pair" },
    ],
  },
  {
    id: "salud",
    titulo: "Salud y evaluación médica",
    campos: [
      { name: "enfermedad_medicamentos", label: "Enfermedad con medicamentos constantes" },
      { name: "dieta_especial",          label: "Dieta especial" },
    ],
  },
  {
    id: "referencias",
    titulo: "Referencias",
    campos: [
      { name: "referencia_1_nombre", label: "Nombre de tu primera referencia" },
      { name: "referencia_1_email",  label: "Email de tu primera referencia" },
    ],
  },
  {
    id: "fotos",
    titulo: "Fotos y videos del perfil",
    campos: [
      { name: "foto_url", label: "Foto de perfil" },
    ],
  },
];

export const PARTES = { 1: PARTE1, 2: PARTE2 };

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** ¿El valor cuenta como diligenciado? */
export function tieneValor(valor) {
  return valor !== undefined && valor !== null && String(valor).trim() !== "";
}

/** Campos obligatorios de una sección, dado el estado actual del formulario. */
export function camposRequeridos(seccion, form = {}) {
  return seccion.campos.filter((c) => !c.requeridoSi || c.requeridoSi(form));
}

/** ¿Este campo es obligatorio ahora mismo? (para pintar el asterisco) */
export function esRequerido(seccion, nombreCampo, form = {}) {
  return camposRequeridos(seccion, form).some((c) => c.name === nombreCampo);
}

/**
 * Campos obligatorios sin diligenciar de una sección.
 * @returns {Array<{name:string,label:string}>}
 */
export function camposFaltantes(seccion, form = {}) {
  return camposRequeridos(seccion, form)
    .filter((c) => !tieneValor(form[c.name]))
    .map(({ name, label }) => ({ name, label }));
}

/** ¿La sección está completa? Todos sus obligatorios, no la mitad. */
export function seccionCompleta(seccion, form = {}) {
  return camposFaltantes(seccion, form).length === 0;
}

/**
 * Valida una sección.
 * @returns {{ ok:boolean, faltantes:Array<{name:string,label:string}> }}
 */
export function validarSeccion(seccion, form = {}) {
  const faltantes = camposFaltantes(seccion, form);
  return { ok: faltantes.length === 0, faltantes };
}

/** Todos los campos obligatorios sin diligenciar de una parte completa. */
export function faltantesDeParte(parte, form = {}) {
  return PARTES[parte].flatMap((s) =>
    camposFaltantes(s, form).map((c) => ({ ...c, seccion: s.id, seccionTitulo: s.titulo }))
  );
}

/** ¿La parte está completa? */
export function parteCompleta(parte, form = {}) {
  return faltantesDeParte(parte, form).length === 0;
}

/** Progreso de una parte, en porcentaje de secciones completas. */
export function progresoParte(parte, form = {}) {
  const secciones = PARTES[parte];
  if (!secciones.length) return 0;
  const completas = secciones.filter((s) => seccionCompleta(s, form)).length;
  return Math.round((completas / secciones.length) * 100);
}

/** ¿El perfil está completo en ambas partes? Es lo que ve la agencia. */
export function perfilCompleto(form = {}) {
  return parteCompleta(1, form) && parteCompleta(2, form);
}

/** Progreso total del perfil (ambas partes). */
export function progresoTotal(form = {}) {
  return Math.round((progresoParte(1, form) + progresoParte(2, form)) / 2);
}
