// app/api/dashboard/disponibilidad/route.js
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import db from "@/lib/db-aupair";

// GET — cliente ve todos los slots disponibles (admin + todas las asociadas)
export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const mes   = searchParams.get("mes");
  const year  = mes ? mes.split("-")[0] : new Date().getFullYear();
  const month = mes ? mes.split("-")[1] : String(new Date().getMonth()+1).padStart(2,"0");

  // Slots disponibles + slots ya reservados por ESTE usuario
  const [slots] = await db.query(`
    SELECT d.*,
      a.nombre AS asesora_nombre, a.apellido AS asesora_apellido,
      a.foto_url AS asesora_foto, a.rol AS asesora_rol
    FROM disponibilidad d
    JOIN usuarios a ON a.id = d.asesora_id
    WHERE YEAR(d.fecha)=? AND MONTH(d.fecha)=?
      AND (d.estado='disponible' OR d.reservado_por=?)
      AND d.fecha >= CURDATE()
    ORDER BY d.fecha, d.hora_inicio
  `, [year, month, session.id]);

  // Reunión ya agendada del usuario
  const [miReunion] = await db.query(`
    SELECT r.*, d.fecha, d.hora_inicio, d.hora_fin,
      a.nombre AS asesora_nombre, a.apellido AS asesora_apellido, a.foto_url AS asesora_foto,
      r.url_meet
    FROM reuniones r
    JOIN disponibilidad d ON d.id = r.disponibilidad_id
    JOIN usuarios a ON a.id = d.asesora_id
    WHERE r.usuario_id=? AND r.estado='confirmada' AND d.fecha >= CURDATE()
    ORDER BY d.fecha, d.hora_inicio
    LIMIT 1
  `, [session.id]);

  return Response.json({ slots, reunion: miReunion[0] || null });
}