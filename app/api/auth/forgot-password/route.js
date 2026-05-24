// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.destino-aupair.com";
const FROM    = "Destino Au Pair <noreply@destino-aupair.com>";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

    // Buscar usuario
    const [[usuario]] = await dbAupair.query(
      "SELECT id, nombre FROM usuarios WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    // Siempre responder OK para no revelar si el email existe
    if (!usuario) {
      return NextResponse.json({ ok: true });
    }

    // Generar token único
    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en BD
    await dbAupair.query(
      "UPDATE usuarios SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [token, expiry, usuario.id]
    );

    const link = `${APP_URL}/reset-password?token=${token}`;

    // Enviar email con Resend
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
        <body style="margin:0;padding:0;background:#fff8f9;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:520px;margin:40px auto;padding:20px;">

            <!-- Logo / Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="width:64px;height:64px;border-radius:50%;background:#fce8ed;border:2px solid #f0b8c4;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:28px;">🔐</span>
              </div>
              <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#2d1a22;margin:0;">
                Destino Au Pair
              </h1>
            </div>

            <!-- Card -->
            <div style="background:#fff;border-radius:20px;border:1px solid #f0dde2;padding:36px;box-shadow:0 4px 20px rgba(160,67,95,.08);">
              <h2 style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#2d1a22;margin:0 0 8px;">
                Hola, ${usuario.nombre} 👋
              </h2>
              <p style="font-size:14px;color:#7a4a54;margin:0 0 24px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>

              <!-- Botón -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${link}"
                  style="display:inline-block;background:linear-gradient(135deg,#a0435f,#c85070);color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:14px;text-decoration:none;box-shadow:0 4px 14px rgba(160,67,95,.3);">
                  Restablecer mi contraseña →
                </a>
              </div>

              <!-- Info -->
              <div style="background:#fff8f9;border:1px solid #f0dde2;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
                <p style="font-size:12px;color:#9a6672;margin:0;line-height:1.6;">
                  ⏰ Este enlace expira en <strong>1 hora</strong>.<br/>
                  🔒 Si no solicitaste este cambio, ignora este email — tu contraseña no cambiará.
                </p>
              </div>

              <!-- Link alternativo -->
              <p style="font-size:11px;color:#c0909a;margin:0;text-align:center;word-break:break-all;">
                Si el botón no funciona, copia este enlace en tu navegador:<br/>
                <a href="${link}" style="color:#a0435f;">${link}</a>
              </p>
            </div>

            <!-- Footer -->
            <p style="text-align:center;font-size:11px;color:#c0909a;margin:24px 0 0;">
              © ${new Date().getFullYear()} Destino Au Pair · Con 💕 desde Colombia
            </p>
          </div>
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