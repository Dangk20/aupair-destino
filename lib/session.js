import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "proyecto_center_secreto_2024";

/**
 * Reads session from the JWT cookie.
 * Use in Server Components and Server Actions.
 *
 * Returns: { id, email, nombre, apellido, rol, id_empresa, id_cliente } | null
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Reads session from the cookie on a NextRequest object.
 * Use in API route handlers (route.js files).
 *
 * @param {import("next/server").NextRequest} req
 * Returns: { id, email, nombre, apellido, rol, id_empresa, id_cliente } | null
 */
export function getSessionFromRequest(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Returns a 401 response. Use when session is missing in API routes.
 */
export function unauthorized() {
  const { NextResponse } = require("next/server");
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}