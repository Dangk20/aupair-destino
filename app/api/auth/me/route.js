import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session-aupair";
import dbAupair from "@/lib/db-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const [rows] = await dbAupair.query(
      "SELECT id, nombre, apellido, email, tiene_acceso, perfil_habilitado, vio_bienvenida, foto_url, ciudad, pais, created_at, cuenta_activa FROM usuarios WHERE id = ?",
      [session.id]
    );
    if (rows.length === 0) return NextResponse.json({ user: null }, { status: 404 });

    // Cuenta desactivada (usuarios-administracion): se borra la cookie y el
    // panel, que llama aquí al cargar, la manda al inicio de sesión.
    const { cuenta_activa, ...user } = rows[0];
    if (Number(cuenta_activa) === 0) {
      const res = NextResponse.json({ user: null, desactivada: true }, { status: 401 });
      res.cookies.set("dap_token", "", { maxAge: 0, path: "/" });
      return res;
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}