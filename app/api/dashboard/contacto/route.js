// app/api/dashboard/contacto/route.js
//
// Los canales del programa que ve la candidata (change candidata-datos-reales):
//   · whatsapp   — el número del programa (`configuracion.whatsapp`). Con él se
//                  agenda la reunión mientras el calendario siga apagado.
//   · comunidad  — el enlace del grupo de WhatsApp (`configuracion.comunidad_whatsapp`).
//                  Es parte de la sección pagada «Comunidad»: sólo sale con
//                  `acceso_comunidad`, leído de la base, nunca del token.
// Una clave vacía sale como null y la pantalla esconde el botón: mejor sin
// botón que un enlace a «TU-LINK-AQUI».
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereSesion } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const [filas] = await dbAupair.query(
      "SELECT clave, valor FROM configuracion WHERE clave IN ('whatsapp', 'comunidad_whatsapp')"
    );
    const valor = (clave) => (filas.find((f) => f.clave === clave)?.valor || "").trim() || null;

    const [[u]] = await dbAupair.query("SELECT acceso_comunidad FROM usuarios WHERE id = ?", [session.id]);
    const conComunidad = session.rol !== "usuaria" || Number(u?.acceso_comunidad) === 1;

    const numero = (valor("whatsapp") || "").replace(/\D/g, "") || null;
    return NextResponse.json({
      whatsapp: numero,
      comunidad: conComunidad ? valor("comunidad_whatsapp") : null,
    });
  } catch (err) {
    console.error("[GET /api/dashboard/contacto]", err);
    return NextResponse.json({ error: "No se pudo cargar el contacto." }, { status: 500 });
  }
}
