// ════════════════════════════════════════════════════════════════════════
// app/api/admin/toggle-acceso/route.js
//
// El admin enciende o apaga UNA sección de una cuenta (documentos, recursos,
// reuniones, mensajes, comunidad, perfil). No toca ventas ni el acceso pagado.
//
// Hasta el change `usuarios-administracion` también recibía `tiene_acceso`:
// un interruptor «Sesiones» en Usuarios que creaba o anulaba una venta con
// comisión sin que el admin lo viera. El acceso pagado se da sólo en Ventas
// (lib/ventas-aupair.js). También se retiró la escritura en el libro heredado
// de referidos y el PUT que lo corregía.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

const SECCIONES = [
  "perfil_habilitado", "acceso_documentos", "acceso_recursos",
  "acceso_reuniones", "acceso_mensajes", "acceso_comunidad",
];

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { id, seccion, valor } = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
    if (seccion === "tiene_acceso")
      return NextResponse.json({ error: "El acceso pagado se da en Ventas: confirma o registra el pago." }, { status: 400 });
    if (!SECCIONES.includes(seccion) || valor === undefined)
      return NextResponse.json({ error: "Sección no permitida" }, { status: 400 });

    // `seccion` sale de la lista de arriba, nunca de la petición cruda.
    await dbAupair.query(`UPDATE usuarios SET ${seccion} = ? WHERE id = ?`, [valor ? 1 : 0, id]);
    return NextResponse.json({ ok: true, [seccion]: valor ? 1 : 0 });
  } catch (err) {
    console.error("[toggle-acceso POST]", err);
    return NextResponse.json({ error: "No se pudo actualizar la sección." }, { status: 500 });
  }
}
