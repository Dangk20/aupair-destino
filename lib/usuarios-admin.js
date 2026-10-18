// ════════════════════════════════════════════════════════════════════════
// lib/usuarios-admin.js — Administración de cuentas (change usuarios-administracion)
//
// Las reglas que comparten las rutas de /api/admin/usuarias/** y cambiar-rol:
// qué roles existen, que nadie se quede sin admins y el link de contraseña.
// Pagos, códigos y comisiones NO viven aquí: son de lib/ventas-aupair.js.
// ════════════════════════════════════════════════════════════════════════
import crypto from "crypto";
import dbAupair from "@/lib/db-aupair";

/** Los roles de una cuenta. `usuario` (masculino) quedó en el enum por historia: no se asigna. */
export const ROLES = ["usuaria", "asociada", "agencia", "admin"];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.destino-aupair.com";

/** Admins con la cuenta activa, sin contar a `excepto` (quien se va a quitar). */
export async function adminsActivosSin(excepto) {
  const [[{ n }]] = await dbAupair.query(
    "SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'admin' AND cuenta_activa = 1 AND id <> ?",
    [Number(excepto) || 0]
  );
  return Number(n);
}

/**
 * Un link de un solo uso para crear o restablecer la contraseña (el mismo
 * `reset_token` que «¿Olvidaste tu contraseña?», que consume /reset-password).
 */
export async function linkDeContrasena(usuarioId, horas) {
  const token = crypto.randomBytes(32).toString("hex");
  await dbAupair.query(
    "UPDATE usuarios SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL ? HOUR) WHERE id = ?",
    [token, Number(horas), usuarioId]
  );
  return `${APP_URL}/reset-password?token=${token}`;
}

export const correoValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || "").trim());
