// app/api/auth/invitacion/route.js
// Pública (R11, change `transferir-cupo`): ¿sirve este link de transferencia
// de cupo? Se autoriza con el token, como el de recuperar contraseña. Sólo
// devuelve el correo invitado y el vencimiento: no revela quién transfiere.
import { NextResponse } from "next/server";
import { validar } from "@/lib/transferencias-aupair";

export async function GET(req) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    const v = await validar(token);
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 410 });
    return NextResponse.json({ email: v.email, vence: v.vence });
  } catch (err) {
    console.error("[GET invitacion]", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
