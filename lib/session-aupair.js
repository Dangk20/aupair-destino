import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbAupair from "@/lib/db-aupair";

const JWT_SECRET = process.env.JWT_AUPAIR_SECRET || "destino_aupair_secreto_2025";

/**
 * Lee la sesión desde la cookie JWT.
 * Úsala en Server Components y Server Actions.
 *
 * Retorna: { id, email, nombre, apellido, rol, tiene_acceso } | null
 * rol: "usuaria" | "admin"
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("dap_token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Lee la sesión desde la cookie en un NextRequest.
 * Úsala en API route handlers (route.js).
 *
 * @param {import("next/server").NextRequest} req
 * Retorna: { id, email, nombre, apellido, rol, tiene_acceso } | null
 */
export function getSessionFromRequest(req) {
  try {
    const token = req.cookies.get("dap_token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Genera un token JWT para la usuaria.
 * Úsalo en /api/auth/login y /api/auth/register.
 */
export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol || "usuaria",
      tiene_acceso: user.tiene_acceso || false,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Retorna 401. Úsalo cuando falte sesión en las API routes.
 */
export function unauthorized() {
  const { NextResponse } = require("next/server");
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

/**
 * Retorna 403. Úsalo cuando la usuaria no ha pagado aún.
 */
export function forbidden() {
  const { NextResponse } = require("next/server");
  return NextResponse.json({ error: "Acceso restringido. Completa tu pago para continuar." }, { status: 403 });
}

/**
 * Retorna 403 por rol insuficiente (distinto de forbidden(), que es por pago).
 */
export function sinPermiso() {
  const { NextResponse } = require("next/server");
  return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
}

/**
 * Guard para rutas que sólo puede usar el admin.
 *
 * Úsalo como PRIMERA línea de todo handler bajo /api/admin/**:
 *
 *   const guard = requiereAdmin(req);
 *   if (guard.error) return guard.error;
 *   // ... guard.session tiene la sesión verificada
 *
 * @returns {{ session:object }|{ error:Response }}
 */
export function requiereAdmin(req) {
  const session = getSessionFromRequest(req);
  if (!session) return { error: unauthorized() };
  if (session.rol !== "admin") return { error: sinPermiso() };
  return { session };
}

/**
 * Guard para rutas que exigen sesión de cualquier rol.
 * @returns {{ session:object }|{ error:Response }}
 */
export function requiereSesion(req) {
  const session = getSessionFromRequest(req);
  if (!session) return { error: unauthorized() };
  return { session };
}

/**
 * Guard para rutas que exigen uno o varios roles.
 *
 *   const guard = requiereRol(req, "asociada");
 *   const guard = requiereRol(req, ["admin", "asociada"]);   // excepción declarada
 *   if (guard.error) return guard.error;
 *
 * Aceptar más de un rol sólo es válido si la ruta figura como excepción en
 * docs/rutas-y-acceso.md, con su motivo escrito.
 *
 * @returns {{ session:object }|{ error:Response }}
 */
export function requiereRol(req, rol) {
  const session = getSessionFromRequest(req);
  if (!session) return { error: unauthorized() };
  const permitidos = Array.isArray(rol) ? rol : [rol];
  if (!permitidos.includes(session.rol)) return { error: sinPermiso() };
  return { session };
}

/** Secciones que desbloquea el pago → su columna en `usuarios`. */
const COLUMNA_PERMISO = {
  documentos: "acceso_documentos",
  mensajes:   "acceso_mensajes",
  recursos:   "acceso_recursos",
  reuniones:  "acceso_reuniones",
  comunidad:  "acceso_comunidad",
};

/** Roles que no pasan por la puerta de pago: ven la sección siempre. */
const ROLES_SIN_PUERTA = ["admin", "asociada", "agencia"];

/**
 * Guard para las secciones que la candidata paga.
 *
 *   const guard = await requierePermiso(req, "documentos");
 *   if (guard.error) return guard.error;
 *
 * El permiso se lee de la BASE DE DATOS, nunca del JWT: el token lo congela
 * hasta el siguiente ingreso, y confirmar o anular un pago debe surtir efecto
 * de inmediato sobre una sesión ya abierta.
 *
 * Es asíncrono, a diferencia del resto de guards. Consulta por clave primaria.
 *
 * @returns {Promise<{ session:object }|{ error:Response }>}
 */
export async function requierePermiso(req, seccion) {
  const session = getSessionFromRequest(req);
  if (!session) return { error: unauthorized() };
  if (ROLES_SIN_PUERTA.includes(session.rol)) return { session };

  // `columna` sale del mapa de arriba, nunca de la petición: si la sección no
  // está declarada, se rompe aquí en vez de armar una consulta con basura.
  const columna = COLUMNA_PERMISO[seccion];
  if (!columna) throw new Error(`requierePermiso: sección desconocida "${seccion}"`);

  const [[fila]] = await dbAupair.query(
    `SELECT ${columna} AS permiso FROM usuarios WHERE id = ?`,
    [session.id]
  );
  if (!fila || Number(fila.permiso) !== 1) return { error: forbidden() };
  return { session };
}

/**
 * Verifica que un recurso pertenece a quien lo pide.
 *
 *   const guard = requiereDueño(req, doc.usuario_id);
 *   if (guard.error) return guard.error;
 *
 * Los roles administrativos pasan siempre: revisar el recurso de una candidata
 * es su trabajo. Pásale `{ revisores: [] }` si la ruta no debe permitirlo.
 *
 * @param {object} req
 * @param {number|string} usuarioId  dueño del recurso
 * @param {{ revisores?: string[] }} [opts]
 * @returns {{ session:object }|{ error:Response }}
 */
export function requiereDueño(req, usuarioId, opts = {}) {
  const revisores = opts.revisores ?? ["admin", "asociada", "agencia"];
  const session = getSessionFromRequest(req);
  if (!session) return { error: unauthorized() };
  if (revisores.includes(session.rol)) return { session };
  if (Number(session.id) !== Number(usuarioId)) return { error: sinPermiso() };
  return { session };
}