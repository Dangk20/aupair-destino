// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { Resend } from "resend";
import crypto from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.destino-aupair.com";
const FROM    = "Destino Au Pair <noreply@destino-aupair.com>";

export async function POST(req) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const LOGO   = `${APP_URL}/assets/destino-aupair-logo.svg`;

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

    const [[usuario]] = await dbAupair.query(
      "SELECT id, nombre FROM usuarios WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (!usuario) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(32).toString("hex");

    // ← Expiración calculada dentro de MySQL para evitar desfase de timezone
    await dbAupair.query(
      `UPDATE usuarios
       SET reset_token = ?,
           reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR)
       WHERE id = ?`,
      [token, usuario.id]
    );

    const link = `${APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: FROM,
      to:   email,
      subject: "Restablecer tu contraseña — Destino Au Pair",
      html: `
        <!DOCTYPE html>
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
                            <img src="${LOGO}" alt="Destino Au Pair" width="56" height="56"
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

                  <!-- Card -->
                  <tr>
                    <td style="background-color:#ffffff;border-radius:20px;border:1px solid #f0dde2;padding:36px;">
                      <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#2d1a22;margin-bottom:10px;">
                        Hola, ${usuario.nombre} 👋
                      </div>
                      <div style="font-size:14px;color:#7a4a54;line-height:1.7;margin-bottom:28px;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña.
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="padding-bottom:24px;">
                            <a href="${link}"
                              style="display:inline-block;background:#a0435f;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:14px;text-decoration:none;font-family:system-ui,sans-serif;">
                              Restablecer mi contraseña →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="background-color:#fff8f9;border:1px solid #f0dde2;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
                        <div style="font-size:12px;color:#9a6672;line-height:1.8;">
                          ⏰ Este enlace expira en <strong>1 hora</strong>.<br/>
                          🔒 Si no solicitaste este cambio, ignora este email — tu contraseña no cambiará.
                        </div>
                      </div>
                      <div style="font-size:11px;color:#c0909a;text-align:center;word-break:break-all;line-height:1.6;">
                        Si el botón no funciona, copia este enlace:<br/>
                        <a href="${link}" style="color:#a0435f;">${link}</a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
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
        </html>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}