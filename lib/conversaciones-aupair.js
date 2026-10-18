// ════════════════════════════════════════════════════════════════════════
// lib/conversaciones-aupair.js — Quién habla con la candidata, y quién lee
//
// Dueño único de las conversaciones (migración 010). Ninguna ruta lee ni
// escribe `conversacion_*` por su cuenta: todas preguntan aquí.
//
// Cada candidata tiene hasta tres contactos en todo su recorrido (Daniel,
// 2026-10-17): el equipo, la asociada dueña del cupón con que entró y, cuando
// pasa a una, su agencia. La columna `agencia_id` guarda la contraparte (una
// agencia o una asociada; `NULL` = el equipo) y el rol de ese usuario dice
// cuál es. Los contactos aparecen solos (asegurarContactos): la del equipo
// llega con el mensaje de bienvenida de `configuracion.mensaje_bienvenida`.
// Quién puede qué:
//
//   candidata  las suyas; escribe con el permiso `mensajes`. No inicia: sus
//              contactos ya están ahí.
//   asociada   la suya con cada candidata de su cupón (lib/asociada-aupair).
//   agencia    la suya con cada candidata de su `candidata_agencia`; inicia.
//   admin      inicia la del equipo. LEE todas sin dejar rastro
//              (supervisión, R5). Escribe en las del equipo y, en las de una
//              agencia, sólo después de ENTRAR: entrar deja en el hilo un
//              evento que todos ven.
//
// Lo ajeno devuelve null y la ruta responde 404, para no confirmar siquiera
// que la conversación existe.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";
import { candidataDeAgencia } from "@/lib/agencia-aupair";
import { asociadaDe, candidatasDe } from "@/lib/asociada-aupair";

export const MAX_MENSAJE = 4000;
const ROLES = ["usuaria", "agencia", "asociada", "admin"];

const nombreDe = (n, a) => `${n || ""} ${a || ""}`.trim() || null;

async function porId(id) {
  const [[c]] = await dbAupair.query("SELECT * FROM conversaciones WHERE id = ?", [Number(id) || 0]);
  return c || null;
}

async function yaEntro(convId, adminId) {
  const [[f]] = await dbAupair.query(
    "SELECT 1 AS si FROM conversacion_mensajes WHERE conversacion_id = ? AND autor_id = ? AND tipo = 'ingreso' LIMIT 1",
    [convId, adminId]
  );
  return !!f;
}

async function tienePermisoMensajes(usuarioId) {
  const [[f]] = await dbAupair.query("SELECT acceso_mensajes FROM usuarios WHERE id = ?", [usuarioId]);
  return Number(f?.acceso_mensajes) === 1;
}

/**
 * Qué puede hacer `actor` en la conversación. null = nada (ni saber que existe).
 * @returns {Promise<null|{ leer:true, escribir:boolean, entrar:boolean, entro:boolean }>}
 */
export async function permisos(actor, conv) {
  if (!actor || !conv || !ROLES.includes(actor.rol)) return null;
  if (actor.rol === "usuaria") {
    if (conv.candidata_id !== actor.id) return null;
    return { leer: true, escribir: await tienePermisoMensajes(actor.id), entrar: false, entro: false };
  }
  if (actor.rol === "asociada") {
    if (conv.agencia_id !== actor.id) return null;
    // Si la candidata pagó con el cupón de otra, ésta pierde la conversación.
    if ((await asociadaDe(conv.candidata_id))?.asociadaId !== actor.id) return null;
    return { leer: true, escribir: true, entrar: false, entro: false };
  }
  if (actor.rol === "agencia") {
    if (conv.agencia_id !== actor.id) return null;
    // Si la candidata cambió de agencia, la anterior pierde la conversación.
    if (!(await candidataDeAgencia(actor.id, conv.candidata_id))) return null;
    return { leer: true, escribir: true, entrar: false, entro: false };
  }
  // admin
  if (conv.agencia_id == null) return { leer: true, escribir: true, entrar: false, entro: false };
  const entro = await yaEntro(conv.id, actor.id);
  return { leer: true, escribir: entro, entrar: !entro, entro };
}

/** La conversación con sus permisos para `actor`, o null. */
export async function acceso(actor, convId) {
  const conv = await porId(convId);
  const p = await permisos(actor, conv);
  return p ? { conv, permisos: p } : null;
}

// ── No leídos ────────────────────────────────────────────────────────────

/**
 * Qué conversaciones cuentan para los no leídos de `actor`, y qué mensajes no
 * son "para él" (los propios; para el admin, los de cualquier admin). El admin
 * sólo cuenta las del equipo y las de agencia a las que entró: leer en
 * silencio no lo vuelve participante.
 */
function filtroParticipa(actor) {
  if (actor.rol === "usuaria") return { donde: "c.candidata_id = ?", params: [actor.id] };
  if (actor.rol === "asociada") return { donde: "c.agencia_id = ?", params: [actor.id] };
  if (actor.rol === "agencia") return {
    donde: "c.agencia_id = ? AND EXISTS (SELECT 1 FROM candidata_agencia ca WHERE ca.candidata_id = c.candidata_id AND ca.agencia_id = c.agencia_id)",
    params: [actor.id],
  };
  return {
    donde: `(c.agencia_id IS NULL OR EXISTS (SELECT 1 FROM conversacion_mensajes i
             WHERE i.conversacion_id = c.id AND i.tipo = 'ingreso' AND i.autor_id = ?))`,
    params: [actor.id],
  };
}
const ajeno = (actor) => actor.rol === "admin"
  ? { sql: "cm.autor_rol <> 'admin'", params: [] }
  : { sql: "NOT (cm.autor_id <=> ?)", params: [actor.id] };

/** Map candidata_id → mensajes sin leer de `actor`, en las conversaciones donde participa. */
export async function noLeidosPorCandidata(actor) {
  if (!ROLES.includes(actor?.rol)) return new Map();
  const f = filtroParticipa(actor), a = ajeno(actor);
  const [filas] = await dbAupair.query(
    `SELECT c.candidata_id, COUNT(cm.id) AS n
     FROM conversaciones c
     JOIN conversacion_mensajes cm ON cm.conversacion_id = c.id AND cm.tipo = 'mensaje' AND ${a.sql}
     LEFT JOIN conversacion_lecturas l ON l.conversacion_id = c.id AND l.usuario_id = ?
     WHERE ${f.donde} AND cm.id > COALESCE(l.ultimo_leido_id, 0)
     GROUP BY c.candidata_id`,
    [...a.params, actor.id, ...f.params]
  );
  return new Map(filas.map((r) => [r.candidata_id, Number(r.n)]));
}

// ── Listados ─────────────────────────────────────────────────────────────

/** Las conversaciones de `ids`, con contraparte, último mensaje y no leídos de `actor`. */
async function resumen(actor, ids) {
  if (!ids.length) return [];
  const a = ajeno(actor);
  const [filas] = await dbAupair.query(
    `SELECT c.id, c.candidata_id, c.agencia_id, c.created_at,
            cand.nombre AS c_nombre, cand.apellido AS c_apellido, cand.foto_url AS c_foto,
            ag.nombre AS a_nombre, ag.apellido AS a_apellido, ag.rol AS a_rol,
            (SELECT contenido  FROM conversacion_mensajes u WHERE u.conversacion_id = c.id AND u.tipo = 'mensaje' ORDER BY u.id DESC LIMIT 1) AS ultimo,
            (SELECT created_at FROM conversacion_mensajes u WHERE u.conversacion_id = c.id ORDER BY u.id DESC LIMIT 1) AS ultimo_at,
            (SELECT COUNT(*) FROM conversacion_mensajes cm
               LEFT JOIN conversacion_lecturas l ON l.conversacion_id = c.id AND l.usuario_id = ?
              WHERE cm.conversacion_id = c.id AND cm.tipo = 'mensaje' AND ${a.sql}
                AND cm.id > COALESCE(l.ultimo_leido_id, 0)) AS no_leidos
     FROM conversaciones c
     JOIN usuarios cand ON cand.id = c.candidata_id
     LEFT JOIN usuarios ag ON ag.id = c.agencia_id
     WHERE c.id IN (?)
     ORDER BY COALESCE(ultimo_at, c.created_at) DESC`,
    [actor.id, ...a.params, ids]
  );
  const salida = [];
  for (const f of filas) {
    const p = await permisos(actor, f);
    if (!p) continue;
    salida.push({
      id: f.id,
      tipo: f.agencia_id == null ? "equipo" : f.a_rol === "asociada" ? "asociada" : "agencia",
      candidata_id: f.candidata_id,
      candidata: nombreDe(f.c_nombre, f.c_apellido),
      candidata_foto: f.c_foto || null,
      agencia_id: f.agencia_id,
      agencia: f.agencia_id ? nombreDe(f.a_nombre, f.a_apellido) : null,   // la contraparte, agencia o asociada
      ultimo: f.ultimo, ultimo_at: f.ultimo_at || f.created_at,
      // Leer en silencio no hace al admin participante: no le cuentan.
      no_leidos: actor.rol === "admin" && f.agencia_id != null && !p.entro ? 0 : Number(f.no_leidos),
      permisos: p,
    });
  }
  return salida;
}

// ── Los contactos de la candidata ────────────────────────────────────────

async function bienvenida(candidataId) {
  const [[u]] = await dbAupair.query("SELECT nombre FROM usuarios WHERE id = ?", [candidataId]);
  const [[cfg]] = await dbAupair.query("SELECT valor FROM configuracion WHERE clave = 'mensaje_bienvenida'");
  const base = (cfg?.valor || "").trim() || "¡Bienvenida a Destino Au Pair! Estás a un paso más cerca de cumplir tu sueño.";
  return `¡Hola${u?.nombre ? `, ${u.nombre.trim()}` : ""}! ${base}\n\nEste es tu canal directo con el equipo: escríbenos aquí cualquier duda sobre tu proceso.`;
}

/**
 * Deja creadas las conversaciones que a la candidata le tocan hoy: con el
 * equipo (la primera vez, con la bienvenida del admin), con la asociada de su
 * cupón y con su agencia. Idempotente: INSERT IGNORE sobre la llave única.
 */
export async function asegurarContactos(candidataId) {
  candidataId = Number(candidataId) || 0;
  const [r] = await dbAupair.query(
    "INSERT IGNORE INTO conversaciones (candidata_id, agencia_id, iniciada_por) VALUES (?, NULL, NULL)", [candidataId]);
  if (r.affectedRows === 1) {
    // Sin autor: se muestra como «Equipo Destino Au Pair».
    await dbAupair.query(
      "INSERT INTO conversacion_mensajes (conversacion_id, autor_id, autor_rol, tipo, contenido) VALUES (?, NULL, 'admin', 'mensaje', ?)",
      [r.insertId, await bienvenida(candidataId)]);
  }
  const asociada = await asociadaDe(candidataId);
  if (asociada) {
    await dbAupair.query(
      "INSERT IGNORE INTO conversaciones (candidata_id, agencia_id, iniciada_por) VALUES (?, ?, NULL)", [candidataId, asociada.asociadaId]);
  }
  const [[ag]] = await dbAupair.query("SELECT agencia_id FROM candidata_agencia WHERE candidata_id = ?", [candidataId]);
  if (ag) {
    await dbAupair.query(
      "INSERT IGNORE INTO conversaciones (candidata_id, agencia_id, iniciada_por) VALUES (?, ?, NULL)", [candidataId, ag.agencia_id]);
  }
}

/** Todas las conversaciones que `actor` puede leer (bandeja de «Mensajes»). */
export async function bandeja(actor) {
  if (!ROLES.includes(actor?.rol)) return [];
  // Los contactos aparecen solos: antes de listar, se aseguran los de las
  // candidatas que le tocan a quien pide.
  if (actor.rol === "usuaria") await asegurarContactos(actor.id);
  if (actor.rol === "asociada") for (const id of (await candidatasDe(actor.id)).keys()) await asegurarContactos(id);
  if (actor.rol === "agencia") {
    const [cs] = await dbAupair.query("SELECT candidata_id FROM candidata_agencia WHERE agencia_id = ?", [actor.id]);
    for (const c of cs) await asegurarContactos(c.candidata_id);
  }
  const donde = actor.rol === "usuaria" ? "candidata_id = ?" : actor.rol === "admin" ? "1 = 1" : "agencia_id = ?";
  const [ids] = await dbAupair.query(`SELECT id FROM conversaciones WHERE ${donde}`, actor.rol === "admin" ? [] : [actor.id]);
  // Sólo las que existen: la candidata no inicia conversaciones.
  return resumen(actor, ids.map((r) => r.id));
}

/**
 * Las conversaciones de una candidata que `actor` puede ver, con las que aún
 * no existen pero podría iniciar (`id: null`). Para la vista rápida.
 * null = la candidata no es de su incumbencia.
 */
export async function deCandidata(actor, candidataId) {
  candidataId = Number(candidataId) || 0;
  const [[cand]] = await dbAupair.query("SELECT id FROM usuarios WHERE id = ? AND rol = 'usuaria'", [candidataId]);
  if (!cand) return null;
  let rel = null;
  if (actor.rol === "agencia") {
    rel = await candidataDeAgencia(actor.id, candidataId);
    if (!rel) return null;
  } else if (actor.rol === "admin") {
    const [[r]] = await dbAupair.query(
      `SELECT ca.agencia_id, CONCAT_WS(' ', u.nombre, u.apellido) AS agencia
       FROM candidata_agencia ca JOIN usuarios u ON u.id = ca.agencia_id WHERE ca.candidata_id = ?`, [candidataId]);
    rel = r || null;
  } else if (actor.id !== candidataId) return null;

  const [ids] = await dbAupair.query("SELECT id FROM conversaciones WHERE candidata_id = ?", [candidataId]);
  const existentes = await resumen(actor, ids.map((r) => r.id));

  // La candidata no inicia: ve sólo las que existen.
  if (actor.rol === "usuaria") return existentes;
  const deAsociada = existentes.filter((c) => c.tipo === "asociada");

  const lista = [];
  if (actor.rol === "admin") {
    lista.push(existentes.find((c) => c.tipo === "equipo")
      || { id: null, tipo: "equipo", candidata_id: candidataId, agencia: null, no_leidos: 0, permisos: { iniciar: true } });
  }
  // La agencia: la suya. El admin: la de la agencia actual (y las de agencias
  // anteriores, si las hubo, quedan para leer).
  const deAgencia = existentes.filter((c) => c.tipo === "agencia");
  const agenciaActual = actor.rol === "agencia" ? actor.id : rel?.agencia_id;
  if (agenciaActual && !deAgencia.some((c) => c.agencia_id === agenciaActual)) {
    lista.push({ id: null, tipo: "agencia", candidata_id: candidataId, agencia_id: agenciaActual,
                 agencia: rel?.agencia || null, no_leidos: 0,
                 // Sólo la agencia inicia la suya; el admin espera a que exista.
                 permisos: { iniciar: actor.rol === "agencia" } });
  }
  // La asociada no ve a la agencia ni al equipo desde aquí: sólo la suya.
  if (actor.rol === "asociada") return deAsociada.filter((c) => c.agencia_id === actor.id);
  return [...lista, ...(actor.rol === "admin" ? deAsociada : []), ...deAgencia];
}

// ── Escribir ─────────────────────────────────────────────────────────────

/**
 * Crea (o devuelve) la conversación de `actor` con la candidata: la agencia,
 * la suya; el admin, la del equipo. La candidata no inicia. Idempotente.
 * @returns {Promise<{ id:number }|{ error:string, status:number }|null>}  null = ajena
 */
export async function iniciar(actor, candidataId) {
  candidataId = Number(candidataId) || 0;
  let agenciaId = null;
  if (actor.rol === "agencia") {
    if (!(await candidataDeAgencia(actor.id, candidataId))) return null;
    agenciaId = actor.id;
  } else if (actor.rol === "usuaria") {
    return { status: 403, error: "Las conversaciones las inicia el equipo de Destino Au Pair o tu agencia." };
  } else if (actor.rol === "admin") {
    const [[c]] = await dbAupair.query("SELECT id FROM usuarios WHERE id = ? AND rol = 'usuaria'", [candidataId]);
    if (!c) return null;
  } else return null;

  await dbAupair.query(
    "INSERT IGNORE INTO conversaciones (candidata_id, agencia_id, iniciada_por) VALUES (?, ?, ?)",
    [candidataId, agenciaId, actor.id]
  );
  const [[c]] = await dbAupair.query(
    "SELECT id FROM conversaciones WHERE candidata_id = ? AND agencia_clave = ?", [candidataId, agenciaId || 0]
  );
  return c ? { id: c.id } : null;
}

/**
 * Los mensajes posteriores a `desde`, y los marca como leídos para `actor`.
 * Requiere haber pasado por acceso().
 */
export async function mensajes(actor, conv, desde = 0) {
  const [filas] = await dbAupair.query(
    `SELECT cm.id, cm.tipo, cm.contenido, cm.created_at, cm.autor_id, cm.autor_rol,
            u.nombre, u.apellido
     FROM conversacion_mensajes cm LEFT JOIN usuarios u ON u.id = cm.autor_id
     WHERE cm.conversacion_id = ? AND cm.id > ?
     ORDER BY cm.id ASC LIMIT 500`,
    [conv.id, Number(desde) || 0]
  );
  if (filas.length) {
    const ultimo = filas[filas.length - 1].id;
    await dbAupair.query(
      `INSERT INTO conversacion_lecturas (conversacion_id, usuario_id, ultimo_leido_id) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE ultimo_leido_id = GREATEST(ultimo_leido_id, VALUES(ultimo_leido_id))`,
      [conv.id, actor.id, ultimo]
    );
  }
  return filas.map((f) => ({
    id: f.id, tipo: f.tipo, contenido: f.contenido, fecha: f.created_at, autor_rol: f.autor_rol,
    // Sin autor_id: un mensaje del equipo copiado de la tabla vieja.
    autor: nombreDe(f.nombre, f.apellido) || (f.autor_rol === "admin" ? "Equipo Destino Au Pair" : null),
    mio: f.autor_id != null && f.autor_id === actor.id,
  }));
}

/** Escribe un mensaje. Requiere `permisos.escribir`. */
export async function escribir(actor, conv, contenido) {
  const texto = String(contenido || "").trim();
  if (!texto) return { ok: false, status: 400, error: "El mensaje está vacío." };
  if (texto.length > MAX_MENSAJE) return { ok: false, status: 400, error: `Máximo ${MAX_MENSAJE} caracteres.` };
  const [r] = await dbAupair.query(
    "INSERT INTO conversacion_mensajes (conversacion_id, autor_id, autor_rol, tipo, contenido) VALUES (?, ?, ?, 'mensaje', ?)",
    [conv.id, actor.id, actor.rol, texto]
  );
  // Lo propio no queda como no leído para quien lo escribe.
  await dbAupair.query(
    `INSERT INTO conversacion_lecturas (conversacion_id, usuario_id, ultimo_leido_id) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE ultimo_leido_id = GREATEST(ultimo_leido_id, VALUES(ultimo_leido_id))`,
    [conv.id, actor.id, r.insertId]
  );
  return { ok: true, id: r.insertId };
}

/** El admin entra a una conversación de agencia: queda en el hilo. Idempotente. */
export async function entrar(actor, conv) {
  if (actor.rol !== "admin" || conv.agencia_id == null) {
    return { ok: false, status: 400, error: "Sólo el equipo entra, y sólo a conversaciones de una agencia." };
  }
  if (await yaEntro(conv.id, actor.id)) return { ok: true };
  await dbAupair.query(
    "INSERT INTO conversacion_mensajes (conversacion_id, autor_id, autor_rol, tipo) VALUES (?, ?, 'admin', 'ingreso')",
    [conv.id, actor.id]
  );
  return { ok: true };
}
