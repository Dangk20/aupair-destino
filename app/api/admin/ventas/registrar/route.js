// POST /api/admin/ventas/registrar — Registrar el pago de una candidata que
// pagó por fuera de /pago (transferencia, efectivo) y no tiene solicitud.
// Change usuarios-administracion: reemplaza al interruptor «Sesiones» de
// Usuarios. Todo el efecto (venta, permisos, cupo del código, comisión) lo
// hace lib/ventas-aupair.js, el dueño único.
//   { usuario_id, monto? }  sin monto: el del código o el precio del cupo (R9)
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { confirmarAccesoUsuario } from "@/lib/ventas-aupair";

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { usuario_id, monto } = await req.json().catch(() => ({}));
    const [[u]] = await dbAupair.query("SELECT id, rol FROM usuarios WHERE id = ?", [Number(usuario_id) || 0]);
    if (!u) return NextResponse.json({ error: "Elige la candidata." }, { status: 400 });
    if (u.rol !== "usuaria") return NextResponse.json({ error: "Sólo las candidatas compran el cupo." }, { status: 400 });
    const valor = monto === undefined || monto === null || monto === "" ? undefined : Number(monto);
    if (valor !== undefined && !(valor >= 0)) return NextResponse.json({ error: "Monto no válido." }, { status: 400 });

    const r = await confirmarAccesoUsuario(u.id, { monto: valor });
    if (!r.ok) return NextResponse.json({ error: r.error || "No se pudo registrar el pago." }, { status: r.sinPrecio ? 409 : 400 });
    return NextResponse.json({ ok: true, venta_id: r.ventaId ?? null, comision: r.comision ?? null });
  } catch (err) {
    console.error("[POST /api/admin/ventas/registrar]", err);
    return NextResponse.json({ error: "No se pudo registrar el pago." }, { status: 500 });
  }
}
