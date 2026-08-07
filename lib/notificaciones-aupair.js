// ════════════════════════════════════════════════════════════════════════
// lib/notificaciones-aupair.js — Correo saliente de Destino Au Pair
//
// Dueño ÚNICO del correo. Ninguna ruta instancia Resend ni arma HTML de correo
// por su cuenta: antes había dos plantillas distintas para el mismo producto
// (una con la marca, otra morada) y un `notificarAdmins` escondido dentro de
// la ruta de reuniones, donde nadie lo encontraba.
//
// Tres garantías que este módulo sostiene:
//
//   1. Un fallo de correo NUNCA tumba la operación que lo originó. Todo va
//      dentro de try/catch y nada se re-lanza. Registrar una candidata,
//      confirmar un pago o completar una sesión no puede fallar porque Resend
//      esté caído.
//   2. El envío NO hace esperar a quien lo dispara: se agenda con `after()` de
//      Next, que corre después de que la respuesta salió.
//   3. Un aviso de una sola vez no se repite, aunque el flujo que lo origina
//      sea repetible. Lo garantiza `notificaciones.clave_unica`, no una
//      bandera: la fila se inserta ANTES de enviar y el índice único hace de
//      cerrojo. Mismo mecanismo que `codigos_promo_usos`.
//
// Sin RESEND_API_KEY no se llama a Resend: el aviso se registra con
// estado='omitido' y se escribe en consola. Así el flujo local es verificable
// —se ve qué se habría mandado y a quién— sin cuenta y sin mandarle correo a
// nadie. Ojo: en producción ese mismo estado significa que el correo NO salió.
// ════════════════════════════════════════════════════════════════════════
import { Resend } from "resend";
import { after } from "next/server";
import dbAupair from "@/lib/db-aupair";

const REMITENTE = "Destino Au Pair <noreply@destino-aupair.com>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.destino-aupair.com";

// Dominios reservados por la RFC 2606 / RFC 6761: nada que termine así existe
// en el DNS público. Aquí cae `revision@destino-aupair.local`, la cuenta de
// revisión que es admin en la base.
const DOMINIOS_NO_ENTREGABLES = [".local", ".test", ".invalid", ".localhost"];

// ── Plantilla ───────────────────────────────────────────────────────────────
// La maqueta del correo de recuperar contraseña, que es la única que tenía la
// identidad real de la marca. Tablas HTML y estilos en línea a propósito: es
// lo único que sobrevive a Gmail, Outlook y compañía.

function plantilla({ titulo, saludo, parrafos = [], destacado, boton }) {
  const logo = `${APP_URL}/assets/destino-aupair-logo.svg`;

  const cuerpo = parrafos
    .map(
      (p) =>
        `<div style="font-size:14px;color:#7a4a54;line-height:1.7;margin-bottom:16px;">${p}</div>`
    )
    .join("");

  const bloqueDestacado = destacado
    ? `<div style="background-color:#fff8f9;border:1px solid #f0dde2;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
         <div style="font-size:13px;color:#7a4a54;line-height:1.8;">${destacado}</div>
       </div>`
    : "";

  const bloqueBoton = boton
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0">
         <tr>
           <td align="center" style="padding:8px 0 24px;">
             <a href="${boton.url}"
               style="display:inline-block;background:#a0435f;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:14px;text-decoration:none;font-family:system-ui,sans-serif;">
               ${boton.texto}
             </a>
           </td>
         </tr>
       </table>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background-color:#fff8f9;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8f9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="width:80px;height:80px;border-radius:50%;background-color:#fce8ed;border:2px solid #f0b8c4;">
                    <img src="${logo}" alt="Destino Au Pair" width="56" height="56"
                      style="display:block;border-radius:50%;object-fit:contain;"/>
                  </td>
                </tr>
              </table>
              <div style="height:10px;"></div>
              <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#2d1a22;text-align:center;">
                Destino Au Pair
              </div>
            </td>
          </tr>

          <!-- Tarjeta -->
          <tr>
            <td style="background-color:#ffffff;border-radius:20px;border:1px solid #f0dde2;padding:36px;">
              <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#2d1a22;margin-bottom:14px;">
                ${saludo || titulo}
              </div>
              ${cuerpo}
              ${bloqueBoton}
              ${bloqueDestacado}
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <div style="font-size:11px;color:#c0909a;line-height:1.7;text-align:center;">
                © ${new Date().getFullYear()} Destino Au Pair · Con 💕 desde Colombia<br/>
                <a href="${APP_URL}" style="color:#c0909a;text-decoration:none;">www.destino-aupair.com</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Ficha en dos columnas para los avisos operativos del admin.
function ficha(filas) {
  return filas
    .filter(([, valor]) => valor !== null && valor !== undefined && valor !== "")
    .map(
      ([etiqueta, valor]) =>
        `<div style="margin-bottom:6px;"><strong style="color:#2d1a22;">${etiqueta}:</strong> ${valor}</div>`
    )
    .join("");
}

// ── Destinatarios ───────────────────────────────────────────────────────────

function esEnviable(email) {
  if (!email || typeof email !== "string") return false;
  const limpio = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return false;
  return !DOMINIOS_NO_ENTREGABLES.some((d) => limpio.endsWith(d));
}

function excluidos() {
  return (process.env.NOTIF_EXCLUIR_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Admins que pueden recibir correo.
 *
 * Filtra dos cosas distintas: lo que no se puede entregar (direcciones mal
 * formadas o de dominio reservado) y lo que no se DEBE entregar
 * (NOTIF_EXCLUIR_EMAILS). Lo segundo existe porque en la base hay un admin del
 * proveedor anterior con una dirección de Gmail perfectamente válida: no hay
 * forma técnica de distinguirla, y sin esta lista cada registro de una
 * candidata le llegaría a él.
 */
async function destinatariosAdmin() {
  const [filas] = await dbAupair.query(
    "SELECT nombre, email FROM usuarios WHERE rol = 'admin'"
  );
  const fuera = excluidos();
  return filas.filter(
    (a) => esEnviable(a.email) && !fuera.includes(a.email.trim().toLowerCase())
  );
}

/**
 * Devuelve los datos de la candidata sólo si acepta correo.
 * `notif_email` se lee de la base, no del JWT: si la apagó hace un minuto,
 * surte efecto ya, sin que tenga que volver a iniciar sesión.
 * Vale sólo para lo que va dirigido a ella; los avisos del admin no la miran.
 */
async function candidataQueAceptaCorreo(usuarioId) {
  const [[u]] = await dbAupair.query(
    "SELECT id, nombre, apellido, email, notif_email FROM usuarios WHERE id = ?",
    [usuarioId]
  );
  if (!u || !esEnviable(u.email)) return null;
  if (Number(u.notif_email) === 0) return null;
  return u;
}

// ── Envío ───────────────────────────────────────────────────────────────────

/**
 * Registra y envía un correo. No lanza nunca.
 *
 * La fila se inserta ANTES de enviar: si `claveUnica` choca con el índice
 * único, este aviso ya salió y no se hace nada. Los avisos repetibles por
 * diseño pasan `claveUnica: null` (MySQL admite varios NULL en un índice
 * único).
 */
async function enviar({
  evento,
  destinatario,
  usuarioId = null,
  asunto,
  html,
  claveUnica = null,
}) {
  try {
    if (!esEnviable(destinatario)) return;

    const sinClave = process.env.RESEND_API_KEY ? null : "sin RESEND_API_KEY";

    const [res] = await dbAupair.query(
      `INSERT IGNORE INTO notificaciones
         (evento, destinatario, usuario_id, asunto, estado, detalle, clave_unica)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        evento,
        destinatario,
        usuarioId,
        asunto,
        sinClave ? "omitido" : "enviado",
        sinClave,
        claveUnica,
      ]
    );

    // affectedRows = 0 ⇒ la clave única ya existía: el aviso ya se mandó.
    if (res.affectedRows === 0) return;

    if (sinClave) {
      console.log(
        `[notificaciones] ${evento} → ${destinatario} · "${asunto}" (omitido: sin RESEND_API_KEY)`
      );
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const envio = await resend.emails.send({
      from: REMITENTE,
      to: destinatario,
      subject: asunto,
      html,
    });

    if (envio.error) {
      await marcarFallido(res.insertId, envio.error.message || "error de Resend");
      console.error(
        `[notificaciones] ${evento} → ${destinatario} falló:`,
        envio.error.message
      );
      return;
    }

    await dbAupair.query(
      "UPDATE notificaciones SET detalle = ? WHERE id = ?",
      [envio.data?.id ? `resend:${envio.data.id}` : null, res.insertId]
    );
  } catch (err) {
    // Nada de lo que pase aquí puede salir del módulo.
    console.error(`[notificaciones] ${evento} → ${destinatario} falló:`, err.message);
  }
}

async function marcarFallido(id, motivo) {
  try {
    await dbAupair.query(
      "UPDATE notificaciones SET estado = 'fallido', detalle = ? WHERE id = ?",
      [String(motivo).slice(0, 500), id]
    );
  } catch {
    // Si ni siquiera se puede registrar el fallo, no hay nada más que hacer.
  }
}

/**
 * Agenda el trabajo para después de que la respuesta salga.
 *
 * `after()` es lo que Next 16 da justo para esto: corre dentro del ciclo de
 * vida de la petición pero sin que nadie lo espere. Fuera de una petición (un
 * script de mantenimiento) lanza, y ahí se cae a una promesa suelta.
 */
function agendar(trabajo) {
  const seguro = () => trabajo().catch((err) =>
    console.error("[notificaciones] fallo no controlado:", err.message)
  );
  try {
    after(seguro);
  } catch {
    seguro();
  }
}

// ════════════════════════════════════════════════════════════════════════
// Avisos
// ════════════════════════════════════════════════════════════════════════
//
// Convención de `clave_unica` para los avisos de una sola vez:
//
//     <evento>:<referencia>:<destinatario>
//
// El destinatario va SIEMPRE en la clave, incluso en los avisos dirigidos a
// una sola persona. Si no fuera así, un aviso a varios admins se registraría
// una vez y sólo el primero de la lista lo recibiría.

/** Al admin: se registró una candidata. */
export function avisarRegistroCandidata(candidata) {
  agendar(async () => {
    const admins = await destinatariosAdmin();
    if (admins.length === 0) {
      console.warn("[notificaciones] registro_candidata sin destinatarios válidos");
      return;
    }
    const nombre = `${candidata.nombre} ${candidata.apellido || ""}`.trim();
    for (const admin of admins) {
      await enviar({
        evento: "registro_candidata",
        destinatario: admin.email,
        usuarioId: candidata.id,
        asunto: `Nueva candidata registrada — ${nombre}`,
        html: plantilla({
          titulo: "Nueva candidata registrada",
          saludo: `Hola, ${admin.nombre || "equipo"}`,
          parrafos: ["Acaba de registrarse una candidata nueva en la plataforma."],
          destacado: ficha([
            ["Nombre", nombre],
            ["Correo", candidata.email],
            ["Código usado", candidata.codigo_referido],
          ]),
          boton: { texto: "Ver candidatas", url: `${APP_URL}/admin/usuarias` },
        }),
      });
    }
  });
}

/** A la candidata: bienvenida. */
export function avisarBienvenida(usuarioId) {
  agendar(async () => {
    const u = await candidataQueAceptaCorreo(usuarioId);
    if (!u) return;
    await enviar({
      evento: "bienvenida",
      destinatario: u.email,
      usuarioId,
      asunto: "Te damos la bienvenida a Destino Au Pair",
      claveUnica: `bienvenida:${usuarioId}:${u.email}`,
      html: plantilla({
        titulo: "Bienvenida",
        saludo: `Hola, ${u.nombre} 👋`,
        parrafos: [
          "Tu cuenta ya está creada. Desde tu panel puedes ver el curso, completar tu perfil y seguir tu proceso paso a paso.",
          "Empieza por el curso: los videos están abiertos desde el primer día.",
        ],
        boton: { texto: "Entrar a mi panel →", url: `${APP_URL}/dashboard` },
      }),
    });
  });
}

/** Al admin: se confirmó un pago. */
export function avisarPagoConfirmado({ ventaId, usuarioId, monto, codigo, comision }) {
  agendar(async () => {
    const [[u]] = await dbAupair.query(
      "SELECT nombre, apellido, email FROM usuarios WHERE id = ?",
      [usuarioId]
    );
    if (!u) return;
    const admins = await destinatariosAdmin();
    const nombre = `${u.nombre} ${u.apellido || ""}`.trim();
    for (const admin of admins) {
      await enviar({
        evento: "pago_confirmado",
        destinatario: admin.email,
        usuarioId,
        asunto: `Pago confirmado — ${nombre}`,
        // La referencia es la venta, no la candidata: si mañana compra otra
        // vez, es otra venta y sí hay que avisar. Confirmar dos veces la misma
        // no repite el correo.
        claveUnica: `pago_confirmado:${ventaId}:${admin.email}`,
        html: plantilla({
          titulo: "Pago confirmado",
          saludo: `Hola, ${admin.nombre || "equipo"}`,
          parrafos: ["Se confirmó el pago de una candidata y su acceso ya está activo."],
          destacado: ficha([
            ["Candidata", nombre],
            ["Correo", u.email],
            ["Monto", monto != null ? `$${monto}` : null],
            ["Código", codigo],
            [
              "Comisión",
              comision
                ? `$${comision.monto_comision} (${comision.porcentaje}%)`
                : null,
            ],
          ]),
          boton: { texto: "Ver ventas", url: `${APP_URL}/admin/ventas` },
        }),
      });
    }
  });
}

/** A la candidata: su acceso quedó activo. */
export function avisarAccesoActivado(usuarioId) {
  agendar(async () => {
    const u = await candidataQueAceptaCorreo(usuarioId);
    if (!u) return;
    await enviar({
      evento: "acceso_activado",
      destinatario: u.email,
      usuarioId,
      asunto: "Tu acceso a Destino Au Pair ya está activo",
      claveUnica: `acceso_activado:${usuarioId}:${u.email}`,
      html: plantilla({
        titulo: "Acceso activado",
        saludo: `¡Listo, ${u.nombre}! 🎉`,
        parrafos: [
          "Confirmamos tu pago y ya tienes acceso completo al acompañamiento.",
        ],
        destacado: ficha([
          ["Documentos", "cargar y seguir su revisión"],
          ["Reuniones", "agendar con tu asesora"],
          ["Recursos", "material de apoyo"],
          ["Mensajes", "hablar con el equipo"],
          ["Comunidad", "acceso al grupo"],
        ]),
        boton: { texto: "Entrar a mi panel →", url: `${APP_URL}/dashboard` },
      }),
    });
  });
}

/** Al admin: una candidata terminó el curso. */
export function avisarCursoCompletado(usuarioId) {
  agendar(async () => {
    const [[u]] = await dbAupair.query(
      "SELECT nombre, apellido, email FROM usuarios WHERE id = ?",
      [usuarioId]
    );
    if (!u) return;
    const admins = await destinatariosAdmin();
    const nombre = `${u.nombre} ${u.apellido || ""}`.trim();
    for (const admin of admins) {
      await enviar({
        evento: "curso_completado",
        destinatario: admin.email,
        usuarioId,
        asunto: `Curso completado — ${nombre}`,
        claveUnica: `curso_completado:${usuarioId}:${admin.email}`,
        html: plantilla({
          titulo: "Curso completado",
          saludo: `Hola, ${admin.nombre || "equipo"}`,
          parrafos: [
            `${nombre} completó todas las sesiones del curso.`,
          ],
          destacado: ficha([
            ["Candidata", nombre],
            ["Correo", u.email],
          ]),
          boton: { texto: "Ver su ficha", url: `${APP_URL}/admin/usuarias` },
        }),
      });
    }
  });
}

/** A la candidata: su evaluación quedó aprobada. */
export function avisarEvaluacionAprobada(usuarioId) {
  agendar(async () => {
    const u = await candidataQueAceptaCorreo(usuarioId);
    if (!u) return;
    await enviar({
      evento: "evaluacion_aprobada",
      destinatario: u.email,
      usuarioId,
      asunto: "Tu evaluación fue aprobada",
      claveUnica: `evaluacion_aprobada:${usuarioId}:${u.email}`,
      html: plantilla({
        titulo: "Evaluación aprobada",
        saludo: `¡Felicitaciones, ${u.nombre}! 🎉`,
        parrafos: [
          "Revisamos tu perfil y tu evaluación quedó aprobada. Es un paso grande dentro del proceso.",
          "Entra a tu panel para ver cuál es el siguiente paso.",
        ],
        boton: { texto: "Ver mi proceso →", url: `${APP_URL}/dashboard` },
      }),
    });
  });
}

/** Al admin: una candidata agendó una reunión. Repetible: sin clave única. */
export function avisarReunionAgendada({ candidata, fecha, horaInicio, horaFin, asesora, notas }) {
  agendar(async () => {
    const admins = await destinatariosAdmin();
    const nombre = `${candidata.nombre} ${candidata.apellido || ""}`.trim();
    for (const admin of admins) {
      await enviar({
        evento: "reunion_agendada",
        destinatario: admin.email,
        usuarioId: candidata.id ?? null,
        asunto: `Nueva reunión agendada — ${nombre}`,
        html: plantilla({
          titulo: "Nueva reunión agendada",
          saludo: `Hola, ${admin.nombre || "equipo"}`,
          parrafos: ["Una candidata acaba de agendar una reunión."],
          destacado: ficha([
            ["Candidata", nombre],
            ["Correo", candidata.email],
            ["Fecha", fecha],
            ["Hora", `${horaInicio} — ${horaFin}`],
            ["Asesora", asesora],
            ["Notas", notas],
          ]),
          boton: { texto: "Ver reuniones", url: `${APP_URL}/admin/reuniones` },
        }),
      });
    }
  });
}

/** Al admin: una candidata canceló su reunión. Repetible: sin clave única. */
export function avisarReunionCancelada({ candidata, fecha, horaInicio, horaFin, asesora }) {
  agendar(async () => {
    const admins = await destinatariosAdmin();
    const nombre = `${candidata.nombre} ${candidata.apellido || ""}`.trim();
    for (const admin of admins) {
      await enviar({
        evento: "reunion_cancelada",
        destinatario: admin.email,
        usuarioId: candidata.id ?? null,
        asunto: `Reunión cancelada — ${nombre}`,
        html: plantilla({
          titulo: "Reunión cancelada",
          saludo: `Hola, ${admin.nombre || "equipo"}`,
          parrafos: ["Una candidata canceló su reunión. El cupo vuelve a quedar libre."],
          destacado: ficha([
            ["Candidata", nombre],
            ["Correo", candidata.email],
            ["Fecha", fecha],
            ["Hora", `${horaInicio} — ${horaFin}`],
            ["Asesora", asesora],
          ]),
          boton: { texto: "Ver reuniones", url: `${APP_URL}/admin/reuniones` },
        }),
      });
    }
  });
}

/**
 * Recuperación de contraseña.
 *
 * No consulta `notif_email` a propósito: es un correo de cuenta, no una
 * notificación. Apagar las notificaciones no puede dejar a nadie sin poder
 * volver a entrar. Tampoco lleva clave única: se puede pedir varias veces.
 *
 * Se espera (no se agenda) porque quien lo llama ya responde igual pase lo que
 * pase, y así el log queda ordenado con la petición que lo originó.
 */
export async function enviarRecuperacionPassword({ email, nombre, link }) {
  await enviar({
    evento: "recuperar_password",
    destinatario: email,
    asunto: "Restablecer tu contraseña — Destino Au Pair",
    html: plantilla({
      titulo: "Restablecer tu contraseña",
      saludo: `Hola, ${nombre} 👋`,
      parrafos: [
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta. Pulsa el botón para crear una nueva.",
      ],
      boton: { texto: "Restablecer mi contraseña →", url: link },
      destacado: `⏰ Este enlace expira en <strong>1 hora</strong>.<br/>
                  🔒 Si no solicitaste este cambio, ignora este correo — tu contraseña no cambiará.<br/><br/>
                  Si el botón no funciona, copia este enlace:<br/>
                  <a href="${link}" style="color:#a0435f;word-break:break-all;">${link}</a>`,
    }),
  });
}
