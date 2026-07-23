import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const { id_sesion } = await req.json();
    if (!id_sesion) {
      return NextResponse.json({ error: "id_sesion es requerido." }, { status: 400 });
    }

    // Verificar que la sesión existe
    const [sesion] = await dbAupair.query(
      "SELECT * FROM sesiones WHERE id = ?", [id_sesion]
    );
    if (sesion.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    // Sprint 0.0: curso libre — cualquier candidata puede ver y completar las
    // sesiones. El pago ya no bloquea los videos (bloquea documentación).

    // Insertar o actualizar progreso
    await dbAupair.query(
      `INSERT INTO progreso_usuario (id_usuario, id_sesion, completada, fecha_completado)
       VALUES (?, ?, TRUE, NOW())
       ON DUPLICATE KEY UPDATE completada = TRUE, fecha_completado = NOW()`,
      [session.id, id_sesion]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Completar sesión error:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}