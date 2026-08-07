// app/api/dashboard/reuniones/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requierePermiso } from "@/lib/session-aupair";
import {
  avisarReunionAgendada,
  avisarReunionCancelada,
} from "@/lib/notificaciones-aupair";

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

// GET — historial de reuniones del cliente
export async function GET(req) {
  const guard = await requierePermiso(req, "reuniones");
  if (guard.error) return guard.error;
  const session = guard.session;

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
  const guard = await requierePermiso(req, "reuniones");
  if (guard.error) return guard.error;
  const session = guard.session;

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

    avisarReunionAgendada({
      candidata: { id: session.id, ...cliente },
      fecha: fmtFecha(s.fecha),
      horaInicio: s.hora_inicio?.slice(0, 5),
      horaFin: s.hora_fin?.slice(0, 5),
      asesora: `${s.asesora_nombre} ${s.asesora_apellido}`,
      notas: notas_cliente || null,
    });

    return NextResponse.json({ ok: true, reunion_id: resultado.insertId });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — cliente cancela su reunión
export async function DELETE(req) {
  const guard = await requierePermiso(req, "reuniones");
  if (guard.error) return guard.error;
  const session = guard.session;

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

    avisarReunionCancelada({
      candidata: { id: session.id, ...cliente },
      fecha: fmtFecha(s.fecha),
      horaInicio: s.hora_inicio?.slice(0, 5),
      horaFin: s.hora_fin?.slice(0, 5),
      asesora: `${s.asesora_nombre} ${s.asesora_apellido}`,
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}