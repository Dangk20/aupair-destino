// app/api/admin/usuarios/[id]/cambiar-rol/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

const ROLES_VALIDOS = ["usuario", "usuaria", "asociada", "agencia", "admin"];

async function generarCodigoUnico(nombre) {
  const base = (nombre || "REF")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "REF";

  let intento = 0;
  while (intento < 10) {
    const sufijo = Math.floor(1000 + Math.random() * 9000);
    const codigo = `${base}${sufijo}`;
    const [existing] = await dbAupair.query("SELECT id FROM referidos WHERE codigo = ?", [codigo]);
    if (existing.length === 0) return codigo;
    intento++;
  }
  return `${base}${Date.now().toString().slice(-5)}`;
}

async function asegurarReferido({ nombre, apellido, email }) {
  const [existing] = await dbAupair.query("SELECT id, codigo FROM referidos WHERE email = ?", [email]);
  if (existing.length > 0) return existing[0].codigo;

  const codigo = await generarCodigoUnico(nombre);
  await dbAupair.query(
    `INSERT INTO referidos (nombre, email, codigo, porcentaje, estado, created_at)
     VALUES (?, ?, ?, 20, 'Pendiente', NOW())`,
    [`${nombre} ${apellido}`.trim(), email, codigo]
  );
  return codigo;
}

export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id } = await params;

  try {
    const { nuevoRol } = await req.json();

    if (!ROLES_VALIDOS.includes(nuevoRol)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }

    const [[usuario]] = await dbAupair.query(
      "SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = ?", [id]
    );
    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await dbAupair.query("UPDATE usuarios SET rol = ? WHERE id = ?", [nuevoRol, id]);

    let codigo_referido = null;
    if (nuevoRol === "asociada") {
      codigo_referido = await asegurarReferido(usuario);
    }

    return NextResponse.json({
      ok: true,
      mensaje: codigo_referido
        ? `Rol actualizado a Asociada. Código de referida: ${codigo_referido}`
        : "Rol actualizado correctamente",
      codigo_referido,
    });
  } catch (err) {
    console.error("[PUT /api/admin/usuarios/[id]/cambiar-rol]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}