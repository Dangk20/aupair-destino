import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import {
  parteCompleta, faltantesDeParte, progresoParte,
} from "@/lib/campos-perfil";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [rows] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE id = ?", [session.id]
    );
    if (rows.length === 0) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    return NextResponse.json({ perfil: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al obtener el perfil." }, { status: 500 });
  }
}

// Columnas que NUNCA se pueden actualizar desde el perfil (identidad, auth,
// permisos, tokens, scoring del admin, flags computados). Todo lo demás de la
// tabla `usuarios` se considera campo de perfil y sí se guarda.
const BLOQUEADAS = new Set([
  "id","nombre","apellido","email","password","rol","created_at",
  "tiene_acceso","perfil_habilitado","perfil_completo","progreso_agencia",
  "acceso_documentos","acceso_recursos","acceso_reuniones","acceso_mensajes","acceso_comunidad",
  "vio_bienvenida","codigo_referido","codigo_promo_usado",
  "reset_token","reset_token_expiry",
  "score_dap","calificacion_dap","nota_dap","notas_agencia","evaluacion_aprobada",
  "zona_horaria","formato_fecha","tema_plataforma","idioma_plataforma",
  "privacidad_perfil","compartir_progreso",
  "notif_email","notif_plataforma","notif_mensajes","notif_reuniones",
]);

export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const b = await req.json();

    // Columnas reales de la tabla → permitir cualquiera que NO esté bloqueada.
    const [cols] = await dbAupair.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='usuarios'"
    );
    const permitidas = new Set(cols.map((c) => c.COLUMN_NAME).filter((c) => !BLOQUEADAS.has(c)));

    // UPDATE dinámico: solo las columnas presentes en el body (y permitidas).
    // Así guardar una sección no borra las demás.
    const campos = Object.keys(b).filter((k) => permitidas.has(k));
    if (campos.length) {
      const setSql = campos.map((c) => `${c}=?`).join(", ");
      const vals   = campos.map((c) => {
        let v = b[c];
        if (v === "" || v === undefined) return null;
        // Fecha ISO con hora ("2030-06-15T00:00:00.000Z") → "2030-06-15"
        // para que MySQL no rechace las columnas DATE (el form reenvía las
        // fechas tal como vienen del GET, con hora).
        if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) v = v.slice(0, 10);
        return v;
      });
      await dbAupair.query(`UPDATE usuarios SET ${setSql} WHERE id=?`, [...vals, session.id]);
    }

    // El estado de completitud lo decide SIEMPRE el servidor, leyendo la fila
    // guardada y aplicando lib/campos-perfil.js — la misma fuente que usa el
    // formulario. Nunca se toma del body: es lo que ve la agencia y no puede
    // depender de la validación del navegador.
    const [[u]] = await dbAupair.query("SELECT * FROM usuarios WHERE id=?", [session.id]);

    const completo  = parteCompleta(1, u) ? 1 : 0;
    const pctAgencia = progresoParte(2, u);
    await dbAupair.query(
      "UPDATE usuarios SET perfil_completo=?, progreso_agencia=? WHERE id=?",
      [completo, pctAgencia, session.id]
    );

    // Guardado parcial permitido: se guarda igual, pero se responde qué falta.
    const faltantes_parte1 = faltantesDeParte(1, u);
    const faltantes_parte2 = faltantesDeParte(2, u);

    return NextResponse.json({
      ok: true,
      perfil_completo: completo,
      progreso_agencia: pctAgencia,
      faltantes_parte1,
      faltantes_parte2,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al guardar." }, { status: 500 });
  }
}