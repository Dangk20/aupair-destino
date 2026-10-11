import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import {
  parteCompleta, faltantesDeParte, invalidosDeParte, progresoParte, validarCambios,
} from "@/lib/campos-perfil";
// Qué columnas pueden salir hacia el navegador se decide en un solo sitio,
// compartido con la ruta del admin. Ver lib/perfil.js.
import { perfilPublicable } from "@/lib/perfil";
import { cambiosBloqueados, camposCambiados, observacionesAtendidas } from "@/lib/observaciones-perfil";
import { estadoBloqueo, atenderObservaciones, respuestaBloqueo } from "@/lib/bloqueo-perfil";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [rows] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE id = ?", [session.id]
    );
    if (rows.length === 0) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

    return NextResponse.json({ perfil: perfilPublicable(rows[0], "propio") });
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
  // Las fija sólo POST /api/dashboard/perfil/enviar: si llegaran por aquí, la
  // candidata podría reabrir una parte enviada mandándolas en null.
  "parte1_enviada_at","parte2_enviada_at",
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

    // Un valor que incumple su regla no entra a la base: lo leen la agencia
    // (la edad sale de la fecha) y la hoja de vida. Se valida ANTES del UPDATE
    // y se rechaza la petición entera, para no dejar un guardado a medias.
    const [[actual]] = await dbAupair.query("SELECT * FROM usuarios WHERE id=?", [session.id]);
    const cambios   = Object.fromEntries(campos.map((c) => [c, b[c]]));
    const invalidos = validarCambios(cambios, actual);
    if (invalidos.length) {
      return NextResponse.json(
        { error: `${invalidos[0].label}: ${invalidos[0].error}`, invalidos },
        { status: 400 }
      );
    }

    // Una parte enviada está cerrada: sólo se cambia lo que una observación
    // abierta reabre (lib/observaciones-perfil.js). Se compara con lo guardado,
    // porque los formularios reenvían el perfil entero.
    const bloqueo  = await estadoBloqueo(session.id);
    const cerrados = cambiosBloqueados(cambios, actual, bloqueo.enviadas, bloqueo.abiertas);
    if (cerrados.length) return respuestaBloqueo(cerrados);
    const cambiados = camposCambiados(cambios, actual);

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

    // Lo corregido se vuelve a cerrar: la observación que lo reabrió pasa a
    // "atendida" y deja de cubrirlo.
    await atenderObservaciones(observacionesAtendidas(cambiados, bloqueo.abiertas));

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
    const invalidos_parte1 = invalidosDeParte(1, u);

    return NextResponse.json({
      ok: true,
      perfil_completo: completo,
      progreso_agencia: pctAgencia,
      faltantes_parte1,
      faltantes_parte2,
      invalidos_parte1,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al guardar." }, { status: 500 });
  }
}