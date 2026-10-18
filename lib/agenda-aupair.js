// ════════════════════════════════════════════════════════════════════════
// lib/agenda-aupair.js — La agenda: franjas, cupos y reservas
// (change `agenda-rango-bloques`)
//
// Dueño ÚNICO de la disponibilidad y de las reservas. Ninguna ruta escribe en
// `agenda_franjas`, `disponibilidad` o `reuniones` por su cuenta.
//
//   Franja   lo que configura el equipo: un día, un rango (9:00–12:00) y la
//            duración de cada sesión (30 min). Al guardarla se generan sus
//            cupos.
//   Cupo     una fila de `disponibilidad` con `franja_id`: un bloque que una
//            candidata puede reservar.
//   Reunión  la reserva de un cupo. `cupo_activo` (único) vale el cupo
//            mientras no esté cancelada: dos reservas simultáneas del mismo
//            cupo dan exactamente una reunión.
//
// Hora: todo en hora de Bogotá. La base corre en UTC (`CURDATE()` cambiaba de
// día a las 7 p. m. de Colombia), así que «hoy» y «ahora» se calculan aquí y
// van como parámetros. Las fechas salen con DATE_FORMAT para no pasar por Date.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";

export const DURACIONES = [15, 20, 30, 45, 60, 90];

const ZONA = "America/Bogota";

/** { fecha: "YYYY-MM-DD", hora: "HH:MM:SS" } en Bogotá. */
export function ahoraBogota(d = new Date()) {
  const fecha = d.toLocaleDateString("en-CA", { timeZone: ZONA });
  const hora = d.toLocaleTimeString("en-GB", { timeZone: ZONA, hour12: false });
  return { fecha, hora };
}

const aMin = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + (m || 0); };
const aHora = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}:00`;
const normal = (t) => aHora(aMin(t));

/** Suma días a "YYYY-MM-DD" sin pasar por la zona del servidor. */
export function sumarDias(fecha, n) {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Los bloques [inicio, fin] de un rango. Lo que no alcanza un bloque entero se descarta. */
export function calcularCupos(horaInicio, horaFin, duracion) {
  const ini = aMin(horaInicio), fin = aMin(horaFin), dur = Number(duracion);
  const cupos = [];
  for (let t = ini; t + dur <= fin; t += dur) cupos.push([aHora(t), aHora(t + dur)]);
  return cupos;
}

/** Valida una franja. Devuelve el texto del error o null. */
export function problemaFranja({ fecha, horaInicio, horaFin, duracion }, ahora = ahoraBogota()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || ""))) return "Elige la fecha.";
  if (!/^\d{1,2}:\d{2}/.test(String(horaInicio || "")) || !/^\d{1,2}:\d{2}/.test(String(horaFin || ""))) return "Elige la hora de inicio y la de fin.";
  if (!DURACIONES.includes(Number(duracion))) return "Elige la duración de cada sesión.";
  if (aMin(horaFin) <= aMin(horaInicio)) return "La hora de fin debe ser después de la de inicio.";
  if (!calcularCupos(horaInicio, horaFin, duracion).length) return `El rango no alcanza para una sesión de ${duracion} minutos.`;
  if (`${fecha} ${normal(horaInicio)}` <= `${ahora.fecha} ${ahora.hora}`) return "No se puede abrir disponibilidad en el pasado.";
  return null;
}

async function enTransaccion(fn) {
  const cx = await dbAupair.getConnection();
  try {
    await cx.beginTransaction();
    const r = await fn(cx);
    if (r && r.ok === false) await cx.rollback(); else await cx.commit();
    return r;
  } catch (e) {
    await cx.rollback();
    throw e;
  } finally {
    cx.release();
  }
}

const fmtFechaLarga = (f) => new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

/** ¿Choca con otra franja del mismo dueño ese día? (dentro de la transacción, con bloqueo) */
async function cruce(cx, duenoId, fecha, horaInicio, horaFin, excepto = 0) {
  const [[otra]] = await cx.query(
    `SELECT id, TIME_FORMAT(hora_inicio,'%H:%i') AS hi, TIME_FORMAT(hora_fin,'%H:%i') AS hf
       FROM agenda_franjas
      WHERE dueno_id = ? AND fecha = ? AND id <> ? AND hora_inicio < ? AND hora_fin > ?
      LIMIT 1 FOR UPDATE`,
    [duenoId, fecha, excepto, normal(horaFin), normal(horaInicio)]
  );
  return otra || null;
}

async function insertarCupos(cx, franjaId, { duenoId, fecha, horaInicio, horaFin, duracion, urlMeet, notas }) {
  const cupos = calcularCupos(horaInicio, horaFin, duracion);
  await cx.query(
    `INSERT INTO disponibilidad (asesora_id, fecha, hora_inicio, hora_fin, estado, url_meet, notas, franja_id) VALUES ?`,
    [cupos.map(([hi, hf]) => [duenoId, fecha, hi, hf, "disponible", urlMeet || null, notas || null, franjaId])]
  );
  return cupos.length;
}

/** Cuántos días adelante se mantienen abiertos los cupos del horario semanal (como Google). */
/** Cuántas reuniones futuras puede tener agendadas una candidata a la vez. */
export const MAX_REUNIONES = 3;
export const HORIZONTE_DIAS = 60;

const NOMBRES_DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const diaSemana = (fecha) => { const [y, m, d] = fecha.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
const seCruzan = (a, b) => a[0] < b[1] && b[0] < a[1];

/** Rangos de un día: válidos, alcanzan una sesión y no se cruzan. Devuelve { rangos } o { error }. */
function validarRangos(rangos, duracion, donde) {
  const r = (rangos || []).map(([hi, hf]) => [normal(hi), normal(hf)]).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [hi, hf] of r) {
    if (aMin(hf) <= aMin(hi)) return { error: `${donde}: la hora de fin debe ser después de la de inicio.` };
    if (!calcularCupos(hi, hf, duracion).length) return { error: `${donde}: un horario no alcanza para una sesión de ${duracion} minutos.` };
  }
  for (let i = 1; i < r.length; i++) if (seCruzan(r[i], r[i - 1])) return { error: `${donde}: hay dos horarios que se cruzan.` };
  return { rangos: r };
}

async function insertarFranja(cx, { duenoId, fecha, hi, hf, duracion, urlMeet, origen, creadoPor }) {
  const [r] = await cx.query(
    `INSERT INTO agenda_franjas (dueno_id, fecha, hora_inicio, hora_fin, duracion_min, url_meet, origen, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [duenoId, fecha, hi, hf, Number(duracion), urlMeet || null, origen, creadoPor || null]
  );
  return insertarCupos(cx, r.insertId, { duenoId, fecha, horaInicio: hi, horaFin: hf, duracion, urlMeet });
}

/** El horario semanal de cada persona del equipo (para precargar «Administrar agenda»). */
export async function horarios() {
  const [filas] = await dbAupair.query("SELECT dueno_id, duracion_min, plan, url_meet FROM agenda_horario");
  return filas.map((h) => ({ ...h, plan: typeof h.plan === "string" ? JSON.parse(h.plan) : h.plan }));
}

/**
 * Mantiene abiertos los cupos del horario semanal en los próximos
 * HORIZONTE_DIAS días: crea las franjas que falten. No toca los días con
 * excepción (configurados a mano) ni nada que se cruce con lo que ya existe.
 * Se llama al leer la agenda; un candado de MySQL evita que dos lecturas
 * simultáneas creen la misma franja dos veces.
 */
export async function sincronizar() {
  const cx = await dbAupair.getConnection();
  try {
    const [[{ ok }]] = await cx.query("SELECT GET_LOCK('dap_agenda_sync', 10) AS ok");
    if (Number(ok) !== 1) return;
    try {
      const ahora = ahoraBogota();
      const hasta = sumarDias(ahora.fecha, HORIZONTE_DIAS);
      const [hs] = await cx.query(
        `SELECT h.dueno_id, h.duracion_min, h.plan, h.url_meet
           FROM agenda_horario h JOIN usuarios u ON u.id = h.dueno_id AND u.cuenta_activa = 1`
      );
      for (const h of hs) {
        const plan = typeof h.plan === "string" ? JSON.parse(h.plan) : h.plan || {};
        if (!Object.values(plan).some((r) => r?.length)) continue;
        const [exc] = await cx.query(
          "SELECT DATE_FORMAT(fecha,'%Y-%m-%d') AS f FROM agenda_excepciones WHERE dueno_id = ? AND fecha >= ? AND fecha < ?",
          [h.dueno_id, ahora.fecha, hasta]
        );
        const excepciones = new Set(exc.map((e) => e.f));
        const [ya] = await cx.query(
          `SELECT DATE_FORMAT(fecha,'%Y-%m-%d') AS f, TIME_FORMAT(hora_inicio,'%H:%i:%s') AS hi, TIME_FORMAT(hora_fin,'%H:%i:%s') AS hf
             FROM agenda_franjas WHERE dueno_id = ? AND fecha >= ? AND fecha < ?`,
          [h.dueno_id, ahora.fecha, hasta]
        );
        const existentes = {};
        ya.forEach((x) => (existentes[x.f] ||= []).push([x.hi, x.hf]));

        for (let i = 0; i < HORIZONTE_DIAS; i++) {
          const fecha = sumarDias(ahora.fecha, i);
          if (excepciones.has(fecha)) continue;
          for (const [a, b] of plan[diaSemana(fecha)] || []) {
            const rango = [normal(a), normal(b)];
            if (`${fecha} ${rango[0]}` <= `${ahora.fecha} ${ahora.hora}`) continue;
            if ((existentes[fecha] || []).some((x) => seCruzan(x, rango))) continue;
            await cx.beginTransaction();
            try {
              await insertarFranja(cx, { duenoId: h.dueno_id, fecha, hi: rango[0], hf: rango[1], duracion: h.duracion_min, urlMeet: h.url_meet, origen: "semanal" });
              await cx.commit();
              (existentes[fecha] ||= []).push(rango);
            } catch (e) { await cx.rollback(); throw e; }
          }
        }
      }
    } finally {
      await cx.query("SELECT RELEASE_LOCK('dap_agenda_sync')");
    }
  } finally {
    cx.release();
  }
}

/**
 * Guarda el horario semanal (se repite sin fecha de fin). Las franjas futuras
 * que generó el horario anterior y no tienen reservas se rehacen con el nuevo;
 * las que tienen reservas se respetan. Un plan sin días = horario en pausa.
 */
export async function guardarHorario({ duenoId, duracion, plan, urlMeet }) {
  if (!DURACIONES.includes(Number(duracion))) return { ok: false, error: "Elige la duración de cada cita." };
  const limpio = {};
  for (let d = 0; d < 7; d++) {
    const v = validarRangos(plan?.[d], Number(duracion), `El ${NOMBRES_DIA[d]}`);
    if (v.error) return { ok: false, error: v.error };
    if (v.rangos.length) limpio[d] = v.rangos.map(([a, b]) => [a.slice(0, 5), b.slice(0, 5)]);
  }
  const ahora = ahoraBogota();
  await enTransaccion(async (cx) => {
    await cx.query(
      `INSERT INTO agenda_horario (dueno_id, duracion_min, plan, url_meet) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE duracion_min = VALUES(duracion_min), plan = VALUES(plan), url_meet = VALUES(url_meet)`,
      [duenoId, Number(duracion), JSON.stringify(limpio), urlMeet || null]
    );
    await cx.query(
      `DELETE f FROM agenda_franjas f
        WHERE f.dueno_id = ? AND f.origen = 'semanal'
          AND (f.fecha > ? OR (f.fecha = ? AND f.hora_inicio > ?))
          AND NOT EXISTS (SELECT 1 FROM disponibilidad d WHERE d.franja_id = f.id AND d.estado = 'reservada')`,
      [duenoId, ahora.fecha, ahora.fecha, ahora.hora]
    );
    return { ok: true };
  });
  await sincronizar();
  return { ok: true, dias: Object.keys(limpio).length };
}

/**
 * Ajusta UN día (como «Disponibilidad ajustada» de Google): ese día deja de
 * seguir el horario semanal y queda con estos horarios (o ninguno = no
 * disponible). Lo reservado de ese día se respeta: un horario nuevo que se
 * cruce con una reserva se rechaza.
 */
export async function configurarDia({ duenoId, fecha, rangos, duracion, urlMeet, creadoPor }) {
  const ahora = ahoraBogota();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || "")) || fecha < ahora.fecha) return { ok: false, error: "Elige un día de hoy en adelante." };
  if (!DURACIONES.includes(Number(duracion))) return { ok: false, error: "Elige la duración de cada cita." };
  const v = validarRangos(rangos, Number(duracion), fmtFechaLarga(fecha).replace(/^./, (c) => c.toUpperCase()));
  if (v.error) return { ok: false, error: v.error };
  const nuevos = v.rangos.filter(([hi]) => `${fecha} ${hi}` > `${ahora.fecha} ${ahora.hora}`);

  return enTransaccion(async (cx) => {
    await cx.query("INSERT IGNORE INTO agenda_excepciones (dueno_id, fecha) VALUES (?, ?)", [duenoId, fecha]);
    const [franjas] = await cx.query(
      `SELECT f.id, TIME_FORMAT(f.hora_inicio,'%H:%i:%s') AS hi, TIME_FORMAT(f.hora_fin,'%H:%i:%s') AS hf,
              (SELECT COUNT(*) FROM disponibilidad d WHERE d.franja_id = f.id AND d.estado = 'reservada') AS reservas
         FROM agenda_franjas f WHERE f.dueno_id = ? AND f.fecha = ? FOR UPDATE`,
      [duenoId, fecha]
    );
    const conReserva = franjas.filter((f) => Number(f.reservas) > 0);
    for (const r of nuevos) {
      // Dejar igual un horario con reservas es válido: se conserva tal cual.
      const choca = conReserva.find((f) => seCruzan([f.hi, f.hf], r) && !(f.hi === r[0] && f.hf === r[1]));
      if (choca) return { ok: false, error: `De ${choca.hi.slice(0, 5)} a ${choca.hf.slice(0, 5)} hay sesiones reservadas: ese horario no se puede cambiar. Cancela esas reservas primero o deja ese rango igual.` };
    }
    const libres = franjas.filter((f) => !Number(f.reservas)).map((f) => f.id);
    if (libres.length) await cx.query("DELETE FROM agenda_franjas WHERE id IN (?)", [libres]);
    if (conReserva.length) await cx.query("UPDATE agenda_franjas SET origen = 'dia' WHERE id IN (?)", [conReserva.map((f) => f.id)]);
    let cupos = 0;
    for (const [hi, hf] of nuevos) {
      // Lo que ya estaba reservado y coincide exacto se conserva tal cual.
      if (conReserva.some((f) => f.hi === hi && f.hf === hf)) continue;
      cupos += await insertarFranja(cx, { duenoId, fecha, hi, hf, duracion, urlMeet, origen: "dia", creadoPor });
    }
    return { ok: true, cupos };
  });
}

/** El día vuelve a seguir el horario semanal (se quitan sus horarios libres puestos a mano). */
export async function restablecerDia({ duenoId, fecha }) {
  await enTransaccion(async (cx) => {
    await cx.query("DELETE FROM agenda_excepciones WHERE dueno_id = ? AND fecha = ?", [duenoId, fecha]);
    await cx.query(
      `DELETE f FROM agenda_franjas f
        WHERE f.dueno_id = ? AND f.fecha = ?
          AND NOT EXISTS (SELECT 1 FROM disponibilidad d WHERE d.franja_id = f.id AND d.estado = 'reservada')`,
      [duenoId, fecha]
    );
    return { ok: true };
  });
  await sincronizar();
  return { ok: true };
}

/** Si se toca a mano una franja del horario semanal, ese día pasa a ser una excepción. */
async function volverExcepcion(cx, franjaId) {
  const [[f]] = await cx.query("SELECT dueno_id, DATE_FORMAT(fecha,'%Y-%m-%d') AS fecha, origen FROM agenda_franjas WHERE id = ?", [franjaId]);
  if (!f || f.origen !== "semanal") return;
  await cx.query("INSERT IGNORE INTO agenda_excepciones (dueno_id, fecha) VALUES (?, ?)", [f.dueno_id, f.fecha]);
  await cx.query("UPDATE agenda_franjas SET origen = 'dia' WHERE dueno_id = ? AND fecha = ?", [f.dueno_id, f.fecha]);
}

async function reservasDe(cx, franjaId) {
  const [[{ n }]] = await cx.query(
    "SELECT COUNT(*) AS n FROM disponibilidad WHERE franja_id = ? AND estado = 'reservada'",
    [franjaId]
  );
  return Number(n);
}

/** Cambia una franja sin reservas: se regeneran sus cupos. */
export async function editarFranja(id, { duenoId, fecha, horaInicio, horaFin, duracion, urlMeet, notas }) {
  const problema = problemaFranja({ fecha, horaInicio, horaFin, duracion });
  if (problema) return { ok: false, error: problema };

  return enTransaccion(async (cx) => {
    const [[franja]] = await cx.query("SELECT id FROM agenda_franjas WHERE id = ? FOR UPDATE", [id]);
    if (!franja) return { ok: false, error: "La disponibilidad ya no existe." };
    const n = await reservasDe(cx, id);
    if (n) return { ok: false, error: `Tiene ${n} ${n === 1 ? "sesión reservada" : "sesiones reservadas"}: cancélalas antes de cambiarla.` };
    await volverExcepcion(cx, id);
    const otra = await cruce(cx, duenoId, fecha, horaInicio, horaFin, id);
    if (otra) return { ok: false, error: `Se cruza con la disponibilidad de ${otra.hi} a ${otra.hf} de ese día.` };

    await cx.query(
      `UPDATE agenda_franjas SET dueno_id = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, duracion_min = ?, url_meet = ?, notas = ? WHERE id = ?`,
      [duenoId, fecha, normal(horaInicio), normal(horaFin), Number(duracion), urlMeet || null, notas || null, id]
    );
    // Los cupos libres se reemplazan; reuniones canceladas viejas que los
    // apunten se van con ellos (llave en cascada), y no tienen efecto ya.
    await cx.query("DELETE FROM disponibilidad WHERE franja_id = ?", [id]);
    const cupos = await insertarCupos(cx, id, { duenoId, fecha, horaInicio, horaFin, duracion, urlMeet, notas });
    return { ok: true, cupos };
  });
}

/** Borra una franja sin reservas, con sus cupos. */
export async function borrarFranja(id) {
  return enTransaccion(async (cx) => {
    const [[franja]] = await cx.query("SELECT id FROM agenda_franjas WHERE id = ? FOR UPDATE", [id]);
    if (!franja) return { ok: false, error: "La disponibilidad ya no existe." };
    const n = await reservasDe(cx, id);
    if (n) return { ok: false, error: `Tiene ${n} ${n === 1 ? "sesión reservada" : "sesiones reservadas"}: cancélalas antes de borrarla.` };
    await volverExcepcion(cx, id);
    await cx.query("DELETE FROM agenda_franjas WHERE id = ?", [id]);
    return { ok: true };
  });
}

/** Franjas del mes con sus cupos y quién reservó cada uno (vista del admin). */
export async function agendaDelMes(mes) {
  await sincronizar();
  if (!/^\d{4}-\d{2}$/.test(String(mes || ""))) mes = ahoraBogota().fecha.slice(0, 7);
  const [y, m] = mes.split("-").map(Number);
  const desde = `${mes}-01`;
  const hasta = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  const [franjas] = await dbAupair.query(
    `SELECT f.id, DATE_FORMAT(f.fecha,'%Y-%m-%d') AS fecha,
            TIME_FORMAT(f.hora_inicio,'%H:%i') AS hora_inicio, TIME_FORMAT(f.hora_fin,'%H:%i') AS hora_fin,
            f.duracion_min, f.url_meet, f.notas, f.dueno_id,
            CONCAT_WS(' ', u.nombre, u.apellido) AS dueno_nombre
       FROM agenda_franjas f JOIN usuarios u ON u.id = f.dueno_id
      WHERE f.fecha >= ? AND f.fecha < ?
      ORDER BY f.fecha, f.hora_inicio`,
    [desde, hasta]
  );
  if (!franjas.length) return [];
  const [cupos] = await dbAupair.query(
    `SELECT d.id, d.franja_id, d.estado,
            TIME_FORMAT(d.hora_inicio,'%H:%i') AS hora_inicio, TIME_FORMAT(d.hora_fin,'%H:%i') AS hora_fin,
            r.id AS reunion_id, r.notas_cliente,
            c.id AS candidata_id, CONCAT_WS(' ', c.nombre, c.apellido) AS candidata, c.email AS candidata_email
       FROM disponibilidad d
       LEFT JOIN reuniones r ON r.cupo_activo = d.id
       LEFT JOIN usuarios c ON c.id = r.usuario_id
      WHERE d.franja_id IN (?)
      ORDER BY d.hora_inicio`,
    [franjas.map((f) => f.id)]
  );
  return franjas.map((f) => ({ ...f, cupos: cupos.filter((c) => c.franja_id === f.id) }));
}

/**
 * Cupos libres y futuros que puede reservar una candidata: los del equipo
 * (franjas con dueño admin). La agenda propia de cada agencia (R15) se
 * cotiza aparte; cuando exista, aquí se suma la de su agencia.
 */
export async function cuposLibres({ desde, hasta } = {}) {
  await sincronizar();
  const ahora = ahoraBogota();
  const [filas] = await dbAupair.query(
    `SELECT d.id, DATE_FORMAT(d.fecha,'%Y-%m-%d') AS fecha,
            TIME_FORMAT(d.hora_inicio,'%H:%i') AS hora_inicio, TIME_FORMAT(d.hora_fin,'%H:%i') AS hora_fin,
            f.duracion_min, CONCAT_WS(' ', u.nombre, u.apellido) AS con, f.dueno_id, u.foto_url AS con_foto, u.rol AS con_rol
       FROM disponibilidad d
       JOIN agenda_franjas f ON f.id = d.franja_id
       JOIN usuarios u ON u.id = f.dueno_id AND u.rol = 'admin'
      WHERE d.estado = 'disponible'
        AND (d.fecha > ? OR (d.fecha = ? AND d.hora_inicio > ?))
        AND (? IS NULL OR d.fecha >= ?) AND (? IS NULL OR d.fecha < ?)
      ORDER BY d.fecha, d.hora_inicio`,
    [ahora.fecha, ahora.fecha, ahora.hora, desde || null, desde || null, hasta || null, hasta || null]
  );
  return filas;
}

/** Las reuniones de una candidata (activas primero por fecha). */
export async function reunionesDe(usuarioId) {
  const [filas] = await dbAupair.query(
    `SELECT r.id, r.estado, r.notas_cliente, r.disponibilidad_id,
            DATE_FORMAT(d.fecha,'%Y-%m-%d') AS fecha,
            TIME_FORMAT(d.hora_inicio,'%H:%i') AS hora_inicio, TIME_FORMAT(d.hora_fin,'%H:%i') AS hora_fin,
            COALESCE(r.url_meet, d.url_meet) AS url_meet,
            a.nombre AS asesora_nombre, a.apellido AS asesora_apellido, a.foto_url AS asesora_foto
       FROM reuniones r
       JOIN disponibilidad d ON d.id = r.disponibilidad_id
       JOIN usuarios a ON a.id = d.asesora_id
      WHERE r.usuario_id = ?
      ORDER BY d.fecha DESC, d.hora_inicio DESC`,
    [usuarioId]
  );
  return filas;
}

/**
 * Reserva atómica. La candidata se bloquea (FOR UPDATE) para que dos
 * pestañas suyas no reserven dos cupos; el cupo se toma con un UPDATE
 * condicionado, y el índice único `cupo_activo` es la red final.
 */
export async function reservar(usuarioId, cupoId, notas = "") {
  const ahora = ahoraBogota();
  try {
    return await enTransaccion(async (cx) => {
      await cx.query("SELECT id FROM usuarios WHERE id = ? FOR UPDATE", [usuarioId]);
      // Puede tener varias (Daniel, 17 oct), con un tope para que nadie
      // acapare la agenda, y nunca dos a la misma hora.
      const [activas] = await cx.query(
        `SELECT DATE_FORMAT(d.fecha,'%Y-%m-%d') AS fecha, TIME_FORMAT(d.hora_inicio,'%H:%i') AS ini, TIME_FORMAT(d.hora_fin,'%H:%i') AS fin
           FROM reuniones r JOIN disponibilidad d ON d.id = r.disponibilidad_id
          WHERE r.usuario_id = ? AND r.estado = 'confirmada' AND (d.fecha > ? OR (d.fecha = ? AND d.hora_fin > ?))`,
        [usuarioId, ahora.fecha, ahora.fecha, ahora.hora]
      );
      if (activas.length >= MAX_REUNIONES) {
        return { ok: false, error: `Puedes tener hasta ${MAX_REUNIONES} reuniones agendadas a la vez. Cancela una si necesitas otro horario.` };
      }
      const [[cupo]] = await cx.query(
        "SELECT DATE_FORMAT(fecha,'%Y-%m-%d') AS fecha, TIME_FORMAT(hora_inicio,'%H:%i') AS ini, TIME_FORMAT(hora_fin,'%H:%i') AS fin FROM disponibilidad WHERE id = ?",
        [cupoId]
      );
      if (cupo && activas.some((a) => a.fecha === cupo.fecha && a.ini < cupo.fin && cupo.ini < a.fin)) {
        return { ok: false, error: "Ya tienes otra reunión a esa hora. Elige otro horario." };
      }

      const [tomado] = await cx.query(
        `UPDATE disponibilidad d JOIN agenda_franjas f ON f.id = d.franja_id
            SET d.estado = 'reservada', d.reservado_por = ?
          WHERE d.id = ? AND d.estado = 'disponible' AND (d.fecha > ? OR (d.fecha = ? AND d.hora_inicio > ?))`,
        [usuarioId, cupoId, ahora.fecha, ahora.fecha, ahora.hora]
      );
      if (tomado.affectedRows !== 1) return { ok: false, error: "Ese horario ya lo tomó otra persona. Elige otro." };

      const [r] = await cx.query(
        `INSERT INTO reuniones (usuario_id, disponibilidad_id, cupo_activo, estado, notas_cliente)
         VALUES (?, ?, ?, 'confirmada', ?)`,
        [usuarioId, cupoId, cupoId, String(notas || "").slice(0, 1000) || null]
      );
      const [[d]] = await cx.query(
        `SELECT DATE_FORMAT(fecha,'%Y-%m-%d') AS fecha, TIME_FORMAT(hora_inicio,'%H:%i') AS hora_inicio,
                TIME_FORMAT(hora_fin,'%H:%i') AS hora_fin, url_meet FROM disponibilidad WHERE id = ?`,
        [cupoId]
      );
      return { ok: true, reunionId: r.insertId, ...d };
    });
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") return { ok: false, error: "Ese horario ya lo tomó otra persona. Elige otro." };
    throw e;
  }
}

/**
 * Cancela una reunión confirmada. La candidata sólo cancela las suyas y
 * futuras (`usuarioId`); el equipo (`porEquipo`) cualquiera. El cupo sólo se
 * libera si sigue siendo de esa candidata: cancelar dos veces no le quita el
 * cupo a quien lo reservó después.
 */
export async function cancelar(reunionId, { usuarioId = null, porEquipo = false } = {}) {
  const ahora = ahoraBogota();
  return enTransaccion(async (cx) => {
    const [[r]] = await cx.query(
      `SELECT r.id, r.usuario_id, r.estado, r.disponibilidad_id,
              DATE_FORMAT(d.fecha,'%Y-%m-%d') AS fecha, TIME_FORMAT(d.hora_inicio,'%H:%i') AS hora_inicio,
              TIME_FORMAT(d.hora_fin,'%H:%i') AS hora_fin
         FROM reuniones r JOIN disponibilidad d ON d.id = r.disponibilidad_id
        WHERE r.id = ? FOR UPDATE`,
      [reunionId]
    );
    if (!r || (!porEquipo && Number(r.usuario_id) !== Number(usuarioId))) return { ok: false, error: "Reunión no encontrada." };
    if (r.estado !== "confirmada") return { ok: false, error: "Esa reunión ya estaba cancelada." };
    if (!porEquipo && `${r.fecha} ${r.hora_inicio}:00` <= `${ahora.fecha} ${ahora.hora}`)
      return { ok: false, error: "Esa reunión ya empezó o pasó: no se puede cancelar." };

    await cx.query("UPDATE reuniones SET estado = 'cancelada', cupo_activo = NULL WHERE id = ?", [r.id]);
    await cx.query(
      "UPDATE disponibilidad SET estado = 'disponible', reservado_por = NULL WHERE id = ? AND reservado_por = ?",
      [r.disponibilidad_id, r.usuario_id]
    );
    return { ok: true, usuarioId: r.usuario_id, fecha: r.fecha, hora_inicio: r.hora_inicio, hora_fin: r.hora_fin };
  });
}
