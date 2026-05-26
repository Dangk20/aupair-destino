// app/api/dashboard/reuniones/route.js
import { NextResponse } from "next/server";
import { Resend } from "resend";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

function cleanFecha(f) {
  if (!f) return "";
  if (typeof f === "string") return f.split("T")[0];
  if (f instanceof Date) {
    const y = f.getFullYear();
    const m = String(f.getMonth()+1).padStart(2,"0");
    const d = String(f.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }
  return String(f).split("T")[0];
}

function fmtFecha(f) {
  const limpia = cleanFecha(f);
  if (!limpia) return "Fecha no disponible";
  return new Date(limpia+"T12:00:00")
    .toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
}

async function notificarAdmins({ subject, html }) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const [admins] = await dbAupair.query(
      "SELECT email, nombre FROM usuarios WHERE rol='admin'"
    );
    for (const admin of admins) {
      await resend.emails.send({
        from: "Destino Au Pair <noreply@destino-aupair.com>",
        to: admin.email,
        subject,
        html: html(admin),
      });
    }
  } catch (err) {
    console.error("Error enviando notificación:", err.message);
  }
}

// GET — historial de reuniones del cliente
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [rows] = await dbAupair.query(`
      SELECT r.*,
        d.fecha, d.hora_inicio, d.hora_fin,
        a.nombre AS asesora_nombre, a.apellido AS asesora_apellido,
        a.foto_url AS asesora_foto,
        r.url_meet
      FROM reuniones r
      JOIN disponibilidad d ON d.id = r.disponibilidad_id
      JOIN usuarios a ON a.id = d.asesora_id
      WHERE r.usuario_id = ?
      ORDER BY d.fecha DESC
    `, [session.id]);
    return NextResponse.json({ reuniones: rows });
  } catch (err) {
    return NextResponse.json({ reuniones: [], error: err.message });
  }
}

// POST — cliente reserva un slot
export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const { disponibilidad_id, notas_cliente } = await req.json();
    if (!disponibilidad_id)
      return NextResponse.json({ error: "Falta disponibilidad_id" }, { status: 400 });

    // Verificar que el slot existe y está disponible
    const [slot] = await dbAupair.query(
      "SELECT * FROM disponibilidad WHERE id=? AND estado='disponible'",
      [disponibilidad_id]
    );
    if (!slot.length)
      return NextResponse.json({ error: "Este horario ya no está disponible" }, { status: 400 });

    // Verificar que el cliente no tenga ya una reunión activa
    const [yaReunion] = await dbAupair.query(`
      SELECT r.id FROM reuniones r
      JOIN disponibilidad d ON d.id = r.disponibilidad_id
      WHERE r.usuario_id=? AND r.estado='confirmada' AND d.fecha >= CURDATE()
    `, [session.id]);
    if (yaReunion.length)
      return NextResponse.json({ error: "Ya tienes una reunión agendada" }, { status: 400 });

    // Reservar el slot
    await dbAupair.query(
      "UPDATE disponibilidad SET estado='reservada', reservado_por=? WHERE id=?",
      [session.id, disponibilidad_id]
    );

    // Crear la reunión
    const [resultado] = await dbAupair.query(`
      INSERT INTO reuniones (usuario_id, disponibilidad_id, notas_cliente, url_meet)
      VALUES (?, ?, ?, ?)
    `, [session.id, disponibilidad_id, notas_cliente||null, slot[0].url_meet||null]);

    // Datos para el correo
    const [clienteData] = await dbAupair.query(
      "SELECT nombre, apellido, email FROM usuarios WHERE id=?",
      [session.id]
    );
    const cliente = clienteData[0];

    const [slotData] = await dbAupair.query(`
      SELECT d.fecha, d.hora_inicio, d.hora_fin,
        a.nombre AS asesora_nombre, a.apellido AS asesora_apellido
      FROM disponibilidad d
      JOIN usuarios a ON a.id = d.asesora_id
      WHERE d.id = ?
    `, [disponibilidad_id]);
    const s = slotData[0];
    const fechaFmt = fmtFecha(s.fecha);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    await notificarAdmins({
      subject: `📅 Nueva reunión agendada — ${cliente.nombre} ${cliente.apellido}`,
      html: (admin) => `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f0dde2">
          <div style="background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:24px;text-align:center">
            <h1 style="color:#fff;font-size:20px;margin:0;font-family:Georgia,serif">📅 Nueva reunión agendada</h1>
          </div>
          <div style="padding:24px">
            <p style="font-size:14px;color:#1e1033;margin:0 0 16px">Hola ${admin.nombre}, una usuaria acaba de agendar una reunión:</p>
            <div style="background:#f5f0ff;border-radius:12px;padding:16px;margin-bottom:16px">
              <p style="font-size:13px;color:#5b21b6;font-weight:700;margin:0 0 8px">👤 Usuaria</p>
              <p style="font-size:14px;color:#1e1033;margin:0">${cliente.nombre} ${cliente.apellido}</p>
              <p style="font-size:13px;color:#9a7080;margin:2px 0 0">${cliente.email}</p>
            </div>
            <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin-bottom:16px">
              <p style="font-size:13px;color:#065f46;font-weight:700;margin:0 0 8px">📅 Detalles</p>
              <p style="font-size:14px;color:#1e1033;margin:0">${fechaFmt}</p>
              <p style="font-size:13px;color:#059669;margin:2px 0 0">🕐 ${s.hora_inicio?.slice(0,5)} — ${s.hora_fin?.slice(0,5)}</p>
              <p style="font-size:13px;color:#059669;margin:2px 0 0">👩‍💼 Con: ${s.asesora_nombre} ${s.asesora_apellido}</p>
            </div>
            <a href="${appUrl}/admin/reuniones" style="display:block;text-align:center;background:#5b21b6;color:#fff;font-size:14px;font-weight:600;padding:14px;border-radius:12px;text-decoration:none">
              Ver en el calendario →
            </a>
          </div>
          <div style="padding:16px;text-align:center;border-top:1px solid #f0dde2">
            <p style="font-size:11px;color:#9a7080;margin:0">Destino Au Pair · ${appUrl}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, reunion_id: resultado.insertId });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — cliente cancela su reunión
export async function DELETE(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const [reunion] = await dbAupair.query(
      "SELECT * FROM reuniones WHERE id=? AND usuario_id=?",
      [id, session.id]
    );
    if (!reunion.length)
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    await dbAupair.query("UPDATE reuniones SET estado='cancelada' WHERE id=?", [id]);
    await dbAupair.query(
      "UPDATE disponibilidad SET estado='disponible', reservado_por=NULL WHERE id=?",
      [reunion[0].disponibilidad_id]
    );

    // Datos para el correo
    const [clienteData] = await dbAupair.query(
      "SELECT nombre, apellido, email FROM usuarios WHERE id=?",
      [session.id]
    );
    const cliente = clienteData[0];

    const [slotData] = await dbAupair.query(`
      SELECT d.fecha, d.hora_inicio, d.hora_fin,
        a.nombre AS asesora_nombre, a.apellido AS asesora_apellido
      FROM disponibilidad d
      JOIN usuarios a ON a.id = d.asesora_id
      WHERE d.id = ?
    `, [reunion[0].disponibilidad_id]);
    const s = slotData[0];
    const fechaFmt = fmtFecha(s.fecha);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    await notificarAdmins({
      subject: `❌ Reunión cancelada — ${cliente.nombre} ${cliente.apellido}`,
      html: (admin) => `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f0dde2">
          <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:24px;text-align:center">
            <h1 style="color:#fff;font-size:20px;margin:0;font-family:Georgia,serif">❌ Reunión cancelada</h1>
          </div>
          <div style="padding:24px">
            <p style="font-size:14px;color:#1e1033;margin:0 0 16px">Hola ${admin.nombre}, una usuaria canceló su reunión:</p>
            <div style="background:#fee2e2;border-radius:12px;padding:16px;margin-bottom:16px">
              <p style="font-size:13px;color:#dc2626;font-weight:700;margin:0 0 8px">👤 Usuaria</p>
              <p style="font-size:14px;color:#1e1033;margin:0">${cliente.nombre} ${cliente.apellido}</p>
              <p style="font-size:13px;color:#9a7080;margin:2px 0 0">${cliente.email}</p>
            </div>
            <div style="background:#fef3c7;border-radius:12px;padding:16px;margin-bottom:16px">
              <p style="font-size:13px;color:#92400e;font-weight:700;margin:0 0 8px">📅 Reunión cancelada</p>
              <p style="font-size:14px;color:#1e1033;margin:0">${fechaFmt}</p>
              <p style="font-size:13px;color:#d97706;margin:2px 0 0">🕐 ${s.hora_inicio?.slice(0,5)} — ${s.hora_fin?.slice(0,5)}</p>
              <p style="font-size:13px;color:#d97706;margin:2px 0 0">👩‍💼 Con: ${s.asesora_nombre} ${s.asesora_apellido}</p>
            </div>
            <p style="font-size:13px;color:#6b7280;background:#f9fafb;border-radius:12px;padding:12px;margin-bottom:16px">
              ✅ El horario quedó disponible nuevamente para otras usuarias.
            </p>
            <a href="${appUrl}/admin/reuniones" style="display:block;text-align:center;background:#5b21b6;color:#fff;font-size:14px;font-weight:600;padding:14px;border-radius:12px;text-decoration:none">
              Ver calendario →
            </a>
          </div>
          <div style="padding:16px;text-align:center;border-top:1px solid #f0dde2">
            <p style="font-size:11px;color:#9a7080;margin:0">Destino Au Pair · ${appUrl}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}