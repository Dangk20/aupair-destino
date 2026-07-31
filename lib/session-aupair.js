import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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