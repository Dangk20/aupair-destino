// ════════════════════════════════════════════════════════════════════════
// lib/campos-perfil.js — Qué campos del perfil son obligatorios
//
// Fuente ÚNICA para el formulario de la candidata, la validación del servidor y
// el cálculo de progreso. Antes cada uno usaba su propio criterio: el perfil de
// agencia daba una sección por completa con la mitad de sus campos, y por eso
// un perfil podía verse "100%" con campos vacíos.
//
// Estructura de un campo:
//   { name, label, requeridoSi?, valida?, tipo?, opciones? }
//     name        columna en `usuarios`
//     label       etiqueta corta que la candidata reconoce (para el resumen)
//     requeridoSi (form) => boolean — sólo obligatorio si la condición se cumple
//                 (ej. el detalle de una visa negada sólo aplica si dijo "Si")
//     valida      (valor, form) => string|null — qué valores acepta el campo.
//                 Devuelve el mensaje de error, o null si el valor está bien.
//                 Estar lleno no basta: un campo con un valor imposible cuenta
//                 como no diligenciado. Ver `fecha_nacimiento`.
//     tipo        cómo se captura: "texto" (por defecto), "parrafo", "fecha",
//                 "numero". Con `opciones` se ignora: es una lista cerrada.
//     opciones    valores admitidos, en el orden en que se ofrecen.
//
// `tipo` y `opciones` se añadieron para que el formulario del admin se GENERE
// desde aquí. Sin ellos habría que escribirle a mano sus listas de valores, que
// es exactamente la cuarta lista que este archivo existe para evitar — y los
// valores importan: `requeridoSi: siEs("visa_negada", "Si")` deja de disparar si
// alguien escribe "Sí" a mano en un campo libre.
// ════════════════════════════════════════════════════════════════════════

const siEs = (campo, ...valores) => (form) => valores.includes(form?.[campo]);

/**
 * Campo declarado pero nunca exigido.
 *
 * Existe para los campos que los formularios ya recogen y que la ficha no
 * mostraba porque no estaban declarados aquí: número de pasaporte, religión,
 * las referencias secundarias, el video de presentación… Se declaran para que
 * se vean; NO se exigen, porque volverlos obligatorios dejaría incompletas de
 * un despliegue a otro a las candidatas que ya terminaron su perfil.
 */
const OPCIONAL = () => false;

/**
 * Edad mínima del programa au pair.
 *
 * Confirmada con la clienta el 2026-08-02. Es coherente con las dos preguntas
 * que el propio formulario hace —"Requisitos entre 18 y 20 años" y "Requisitos
 * si tienes 26 años"—, que sólo tienen sentido si el programa acepta desde los
 * 18. Cambiarla es cambiar esta línea.
 */
export const EDAD_MINIMA = 18;

/** Años cumplidos a día de hoy, o null si la fecha no se puede interpretar. */
export function edadDesde(valor) {
  if (!valor) return null;
  const d = valor instanceof Date ? valor : new Date(String(valor).slice(0, 10) + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const hoy = new Date();
  let años = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) años--;
  return años;
}

/**
 * Regla de la fecha de nacimiento.
 *
 * Existe porque la validación sólo comprobaba presencia: en producción entró
 * `2026-07-23`, que da 0 años, y el perfil quedó marcado como completo.
 */
function validaFechaNacimiento(valor) {
  const años = edadDesde(valor);
  if (años === null) return "Escribe una fecha válida.";
  if (años < 0)      return "La fecha de nacimiento no puede estar en el futuro.";
  if (años > 120)    return "Revisa la fecha: el año parece equivocado.";
  if (años < EDAD_MINIMA)
    return `Para el programa necesitas tener al menos ${EDAD_MINIMA} años. Con esa fecha tienes ${años}.`;
  return null;
}

/* ── Listas de valores ───────────────────────────────────────────────────
   Copiadas de los formularios de la candidata, que son los canónicos: son los
   valores que ella puede llegar a guardar y contra los que compara `siEs()`.
   ───────────────────────────────────────────────────────────────────────── */
const SI_NO        = ["Si", "No"];
const SI_NO_MAYUS  = ["SI", "No"];   // sí, dos preguntas lo guardan en mayúscula
const LICENCIA     = ["Si", "No", "Está en proceso", "No, pero tengo habilidades y la puedo obtener en menos de un mes"];
const RELACION_REF = ["Empleador", "Familiar", "Profesor", "Amigo", "Otro"];

/* ── PARTE 1 — "Cuéntanos de ti" (/dashboard/perfil/evaluacion) ─────────── */
export const PARTE1 = [
  {
    id: "personal",
    titulo: "Información personal",
    campos: [
      { name: "cedula",           label: "Cédula" },
      { name: "telefono",         label: "Teléfono" },
      { name: "fecha_nacimiento", label: "Fecha de nacimiento", tipo: "fecha", valida: validaFechaNacimiento },
      { name: "ciudad",           label: "Ciudad" },
      { name: "pais",             label: "País" },
      { name: "pais_destino",     label: "País de destino", requeridoSi: OPCIONAL },
    ],
  },
  {
    id: "habilidades",
    titulo: "Requisitos y habilidades",
    campos: [
      { name: "conoce_requisitos_26",    label: "Requisitos si tienes 26 años",  opciones: SI_NO },
      { name: "conoce_requisitos_18_20", label: "Requisitos entre 18 y 20 años", opciones: SI_NO },
      { name: "curso_primeros_auxilios", label: "Curso de primeros auxilios",
        opciones: ["Si", "No", "Lo estoy haciendo"] },
      { name: "nivel_ingles",            label: "Nivel de inglés",
        opciones: ["Ninguno", "Básico", "Intermedio", "Avanzado"] },
      { name: "licencia_conduccion",     label: "Licencia de conducción", opciones: LICENCIA },
      { name: "habilidad_conduccion",    label: "Habilidad para conducir",
        opciones: ["Nulas", "Puedo conducir pero no lo hago bien.",
                   "Conduzco bien pero me falta práctica.", "Me siento muy cómoda y segura."] },
    ],
  },
  {
    id: "situacion",
    titulo: "Situación actual",
    campos: [
      { name: "situacion_actual",        label: "Qué haces en este momento",
        opciones: ["Estudio", "Trabajo", "No hago nada", "Desempeño otra actividad"] },
      { name: "detalle_estudios",        label: "Detalle de tus estudios", tipo: "parrafo",
        requeridoSi: siEs("situacion_actual", "Estudio") },
      { name: "detalle_trabajo",         label: "Detalle de tu trabajo", tipo: "parrafo",
        requeridoSi: siEs("situacion_actual", "Trabajo") },
      { name: "detalle_sin_ocupacion",   label: "Desde cuándo no tienes ocupación", tipo: "parrafo",
        requeridoSi: siEs("situacion_actual", "No hago nada") },
      { name: "detalle_otra_actividad",  label: "Detalle de tu otra actividad", tipo: "parrafo",
        requeridoSi: siEs("situacion_actual", "Desempeño otra actividad") },
      { name: "carrera_graduada",        label: "Carrera o profesión", requeridoSi: OPCIONAL },
    ],
  },
  {
    id: "salud",
    titulo: "Salud",
    campos: [
      { name: "enfermedad_medicamentos", label: "Enfermedad con medicamentos constantes", opciones: SI_NO },
      { name: "detalle_enfermedad_med",  label: "Explicación de la enfermedad", tipo: "parrafo",
        requeridoSi: siEs("enfermedad_medicamentos", "Si") },
      { name: "enfermedad_grave",        label: "Enfermedad grave", opciones: SI_NO },
      { name: "detalle_enfermedad_grave", label: "Detalle de la enfermedad grave", tipo: "parrafo",
        requeridoSi: siEs("enfermedad_grave", "Si") },
      { name: "depresion_panico",        label: "Depresión o ataques de pánico", opciones: SI_NO },
      { name: "trastorno_alimenticio",   label: "Trastorno alimenticio",         opciones: SI_NO },
      { name: "autolesiones",            label: "Autolesiones",                  opciones: SI_NO },
      { name: "abuso_sustancias",        label: "Abuso de sustancias",           opciones: SI_NO },
      { name: "detalle_salud_mental",    label: "Detalle de salud mental", tipo: "parrafo" },
      { name: "isotretinoina",           label: "Tratamiento con isotretinoína", opciones: SI_NO },
      { name: "condiciones_fisicas",     label: "Condiciones físicas",           opciones: SI_NO },
      { name: "alergia_medicamentos",    label: "Alergia a medicamentos",        opciones: SI_NO },
      { name: "detalle_alergias",        label: "A cuáles medicamentos eres alérgica", tipo: "parrafo",
        requeridoSi: siEs("alergia_medicamentos", "Si") },
      { name: "dosis_covid",             label: "Dosis de vacuna covid",
        opciones: ["Ninguna", "Una", "Dos", "Más de dos"] },
      { name: "vacuna_covid",            label: "Vacuna covid aplicada" },
    ],
  },
  {
    id: "experiencia",
    titulo: "Experiencia con niños",
    campos: [
      { name: "exp_ninos_externos", label: "Experiencia con niños fuera de tu familia",
        opciones: ["Si", "No", "La estoy haciendo"] },
      { name: "horas_exp_ninos",    label: "Horas de experiencia",
        opciones: ["Menos de 500 horas", "Entre 501 y 800 horas", "Entre 801 y 1500 horas", "Más de 1500"] },
    ],
  },
  {
    id: "visas",
    titulo: "Visas y compromisos",
    campos: [
      { name: "visa_negada",                   label: "Visa negada", opciones: SI_NO },
      { name: "detalle_visa_negada",           label: "Detalle de la visa negada", tipo: "parrafo",
        requeridoSi: siEs("visa_negada", "Si") },
      { name: "visa_cancelada",                label: "Visa cancelada", tipo: "parrafo" },
      { name: "familiar_residencia_usa",       label: "Familiar con residencia en USA", opciones: SI_NO },
      { name: "detalle_familiar_residencia",   label: "Detalle del familiar con residencia", tipo: "parrafo",
        requeridoSi: siEs("familiar_residencia_usa", "Si") },
      { name: "familiar_visa_estudio_usa",     label: "Familiar con visa de estudio en USA", opciones: SI_NO },
      { name: "detalle_familiar_visa_estudio", label: "Detalle del familiar con visa de estudio", tipo: "parrafo",
        requeridoSi: siEs("familiar_visa_estudio_usa", "Si") },
      { name: "overstay_otro_pais",            label: "Permanencia excedida en otro país", tipo: "parrafo" },
      { name: "entiende_intercambio_cultural", label: "Entiendes que es intercambio cultural", opciones: SI_NO_MAYUS },
      { name: "consciente_riesgo_familiar",    label: "Consciente del riesgo por asilo familiar", opciones: SI_NO_MAYUS },
      { name: "participo_programa_ap",         label: "Participaste antes en el programa", opciones: SI_NO },
      { name: "finalizo_programa_ap",          label: "Finalizaste el programa anterior",
        opciones: ["Si", "No", "No aplica"],
        requeridoSi: siEs("participo_programa_ap", "Si") },
      { name: "puede_proveer_certificados",    label: "Puedes proveer certificados", opciones: SI_NO,
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
      { name: "nacionalidad",    label: "Nacionalidad",
        opciones: ["Colombiana", "Venezolana", "Ecuatoriana", "Peruana", "Mexicana", "Otra"] },
      { name: "tiene_pasaporte", label: "¿Tienes pasaporte?",
        opciones: ["Sí", "No", "En trámite"] },
      { name: "religion",        label: "Religión",     requeridoSi: OPCIONAL,
        opciones: ["Cristiana", "Católica", "Evangélica", "Sin religión", "Otra"] },
      { name: "estado_civil",    label: "Estado civil", requeridoSi: OPCIONAL,
        opciones: ["Soltera", "Casada", "Unión libre", "Divorciada", "Viuda"] },
      { name: "numero_pasaporte", label: "Número de pasaporte",  requeridoSi: OPCIONAL },
      { name: "fecha_vencimiento_pasaporte", label: "Vencimiento del pasaporte",
        tipo: "fecha", requeridoSi: OPCIONAL },
      { name: "tiene_visa_j1",   label: "¿Tienes visa J-1?", requeridoSi: OPCIONAL,
        opciones: ["Sí", "No, aún no", "Sí, anterior", "En trámite"] },
      { name: "numero_ds2019",   label: "Número DS-2019",    requeridoSi: OPCIONAL },
      { name: "numero_sponsor",  label: "Número de sponsor", requeridoSi: OPCIONAL },
    ],
  },
  {
    id: "experiencia",
    titulo: "Experiencia con niños",
    campos: [
      { name: "experiencia_cuidado", label: "Descripción de tu experiencia con niños", tipo: "parrafo" },
      { name: "horas_childcare",     label: "Horas de childcare acumuladas", tipo: "numero" },
    ],
  },
  {
    id: "educacion",
    titulo: "Educación y cursos",
    campos: [
      { name: "situacion_actual", label: "Qué haces actualmente",
        opciones: ["Estudio", "Trabajo", "No hago nada", "Desempeño otra actividad"] },
    ],
  },
  {
    id: "conduccion",
    titulo: "Conducción",
    campos: [
      { name: "licencia_conduccion", label: "¿Tienes licencia?", opciones: LICENCIA },
      { name: "tipo_licencia",       label: "Tipo de licencia",
        opciones: ["Categoría A", "Categoría B", "Categoría B1", "Categoría C", "No aplica"] },
    ],
  },
  {
    id: "personalidad",
    titulo: "Personalidad e intereses",
    campos: [
      { name: "bio",     label: "Descripción personal", tipo: "parrafo" },
      { name: "hobbies", label: "Hobbies e intereses",  tipo: "parrafo" },
    ],
  },
  {
    id: "preguntas",
    titulo: "Preguntas para familias",
    campos: [
      { name: "por_que_au_pair", label: "Por qué quieres ser au pair", tipo: "parrafo" },
    ],
  },
  {
    id: "salud",
    titulo: "Salud y evaluación médica",
    campos: [
      { name: "enfermedad_medicamentos", label: "Enfermedad con medicamentos constantes", opciones: SI_NO },
      { name: "dieta_especial",          label: "Dieta especial",
        opciones: ["Ninguna", "Vegetariana", "Vegana", "Sin gluten", "Sin lactosa", "Otra"] },
      { name: "fumadora",                label: "¿Fumadora?", requeridoSi: OPCIONAL,
        opciones: ["No", "Sí", "Exfumadora"] },
      { name: "acepta_mascotas",         label: "¿Aceptas mascotas?", requeridoSi: OPCIONAL,
        opciones: ["Sí, todos", "Sí, solo perros", "Sí, solo gatos", "No tengo preferencia", "No"] },
    ],
  },
  {
    id: "referencias",
    titulo: "Referencias",
    campos: [
      { name: "referencia_1_nombre",   label: "Nombre de tu primera referencia" },
      { name: "referencia_1_email",    label: "Email de tu primera referencia" },
      { name: "referencia_1_relacion", label: "Relación con tu primera referencia", requeridoSi: OPCIONAL, opciones: RELACION_REF },
      { name: "referencia_1_telefono", label: "Teléfono de tu primera referencia",  requeridoSi: OPCIONAL },
      { name: "referencia_2_nombre",   label: "Nombre de tu segunda referencia",    requeridoSi: OPCIONAL },
      { name: "referencia_2_relacion", label: "Relación con tu segunda referencia", requeridoSi: OPCIONAL, opciones: RELACION_REF },
      { name: "referencia_2_email",    label: "Email de tu segunda referencia",     requeridoSi: OPCIONAL },
      { name: "referencia_2_telefono", label: "Teléfono de tu segunda referencia",  requeridoSi: OPCIONAL },
    ],
  },
  {
    id: "fotos",
    titulo: "Fotos y videos del perfil",
    campos: [
      { name: "foto_url",               label: "Foto de perfil" },
      { name: "video_presentacion_url", label: "Video de presentación", requeridoSi: OPCIONAL },
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

/**
 * Campos diligenciados cuyo valor NO cumple su regla.
 * Un campo vacío no sale aquí: eso lo cubre camposFaltantes().
 * @returns {Array<{name:string,label:string,error:string}>}
 */
export function camposInvalidos(seccion, form = {}) {
  return seccion.campos
    .filter((c) => typeof c.valida === "function" && tieneValor(form[c.name]))
    .map((c) => ({ name: c.name, label: c.label, error: c.valida(form[c.name], form) }))
    .filter((r) => !!r.error);
}

/**
 * ¿La sección está completa? Todos sus obligatorios, no la mitad — y ninguno
 * con un valor imposible: un campo lleno con un disparate no cuenta como
 * diligenciado.
 */
export function seccionCompleta(seccion, form = {}) {
  return camposFaltantes(seccion, form).length === 0
      && camposInvalidos(seccion, form).length === 0;
}

/**
 * Valida una sección: obligatorios sin diligenciar y valores que no cumplen
 * su regla.
 *
 * `invalidos` se añadió después; quien sólo lee `ok` y `faltantes` sigue
 * funcionando igual.
 *
 * @returns {{ ok:boolean, faltantes:Array, invalidos:Array }}
 */
export function validarSeccion(seccion, form = {}) {
  const faltantes = camposFaltantes(seccion, form);
  const invalidos = camposInvalidos(seccion, form);
  return { ok: faltantes.length === 0 && invalidos.length === 0, faltantes, invalidos };
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

/**
 * En qué sección debe abrir un formulario cuando se le pide una por la URL.
 *
 * La regla, en una línea: se honra la sección pedida **sólo si todas las
 * anteriores están completas**; si no, se abre en la primera que falte.
 *
 * Existe porque la pantalla de perfil enlaza directo a una sección —"Editar"
 * cuando el perfil está completo, "Continuar" cuando falta algo—, y un salto
 * libre dejaría entrar al final del formulario con secciones a medias, que es
 * justo lo que la validación por pasos del Sprint 0.0 impide.
 *
 * @param {Array} secciones  PARTE1 o PARTE2
 * @param {object} form      el perfil
 * @param {string|null} idPedido  el `id` de la sección pedida, o null
 * @returns {number} índice donde abrir
 */
export function seccionInicial(secciones, form = {}, idPedido = null) {
  const primeraIncompleta = secciones.findIndex((s) => !seccionCompleta(s, form));
  const tope = primeraIncompleta === -1 ? secciones.length - 1 : primeraIncompleta;

  if (!idPedido) return 0;
  const pedida = secciones.findIndex((s) => s.id === idPedido);
  if (pedida === -1) return 0;          // id desconocido: como si no viniera

  return Math.min(pedida, tope);
}

/* ── Presentación ────────────────────────────────────────────────────────
   Para la vista consolidada del perfil. La CLASE del valor se deduce del
   valor mismo, no se declara campo por campo: así un campo nuevo no obliga a
   tocar nada aquí, que es la misma razón por la que la validación vive en
   este archivo y no repartida por los formularios.
   ───────────────────────────────────────────────────────────────────────── */

/** Un texto por encima de esto se pinta en bloque, no en una línea. */
const LARGO_BLOQUE = 90;

/**
 * Prepara un campo para mostrarlo.
 *
 * Devuelve `{ tipo, texto }`, donde `tipo` es:
 *   "vacio"   — sin diligenciar; la vista lo señala, NO lo esconde
 *   "imagen"  — data-URI; `texto` es la URI, la vista pinta la imagen
 *   "fecha"   — ya formateada en es-CO
 *   "bloque"  — texto largo (bio, detalles); ocupa su propia línea
 *   "dato"    — valor corto
 *
 * `foto_url` guarda la foto como data-URI base64 de hasta 42 KB: sin este
 * tratamiento, la vista volcaría cuarenta mil caracteres en pantalla.
 *
 * @returns {{ tipo:string, texto:string }}
 */
export function valorParaMostrar(campo, form = {}) {
  const bruto = form?.[campo.name];

  if (!tieneValor(bruto)) return { tipo: "vacio", texto: "Sin diligenciar" };

  if (bruto instanceof Date) {
    return { tipo: "fecha", texto: bruto.toLocaleDateString("es-CO", {
      day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
    }) };
  }

  const texto = String(bruto).trim();

  if (texto.startsWith("data:image/")) return { tipo: "imagen", texto };

  // Fecha que llegó como cadena ISO (el API las serializa a JSON).
  if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(texto)) {
    const d = new Date(texto.slice(0, 10) + "T00:00:00Z");
    if (!Number.isNaN(d.getTime())) {
      return { tipo: "fecha", texto: d.toLocaleDateString("es-CO", {
        day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
      }) };
    }
  }

  return { tipo: texto.length > LARGO_BLOQUE ? "bloque" : "dato", texto };
}
