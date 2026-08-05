// ════════════════════════════════════════════════════════════════════════
// lib/perfil.js — Qué columnas de `usuarios` pueden salir hacia el navegador
//
// Vive aquí, y no dentro de una ruta, porque las dos rutas que devuelven un
// perfil —la de la candidata y la del admin— tienen que ocultar lo mismo. Cada
// una llevaba su propio criterio: la de la candidata filtraba siete columnas y
// la del admin sólo hacía `delete u.password`, así que seguía enviando al
// navegador el `reset_token` de una candidata con recuperación en curso.
//
// Se excluye por lista NEGRA y no por lista blanca a propósito: el perfil tiene
// más de ochenta columnas y crecen; una lista blanca obligaría a acordarse de
// añadir cada campo nuevo también aquí, que es justo la desincronización que
// este proyecto arrastra. Añadir una columna *sensible* a `usuarios` sí exige
// acordarse de meterla aquí, y ésas son muchas menos.
// ════════════════════════════════════════════════════════════════════════

/**
 * Se ocultan SIEMPRE, a todo el mundo.
 *
 * Nadie necesita un hash de contraseña en el navegador, y un testigo de
 * recuperación que viaje al cliente permite cambiarle la contraseña a quien
 * pueda leer la respuesta.
 */
export const SECRETOS = new Set([
  "password", "reset_token", "reset_token_expiry",
]);

/**
 * Se ocultan a la CANDIDATA, no al personal.
 *
 * Es valoración interna: la lee el equipo para decidir, no le corresponde a
 * ella. `evaluacion_aprobada` no está aquí — es precisamente lo que su ficha
 * le muestra.
 */
export const VALORACION_INTERNA = new Set([
  "score_dap", "calificacion_dap", "nota_dap", "notas_agencia",
]);

/**
 * Filtra una fila de `usuarios` para enviarla al navegador.
 *
 * @param {object} fila  la fila tal como vino de MySQL
 * @param {"propio"|"revision"} modo
 *        "propio"   — la candidata mira su perfil: se oculta también la
 *                     valoración interna.
 *        "revision" — el personal revisa: ve la valoración, nunca los secretos.
 * @returns {object} la fila sin las columnas que no deben salir
 */
export function perfilPublicable(fila, modo = "propio") {
  const ocultas = modo === "revision"
    ? SECRETOS
    : new Set([...SECRETOS, ...VALORACION_INTERNA]);
  return Object.fromEntries(
    Object.entries(fila).filter(([col]) => !ocultas.has(col))
  );
}
