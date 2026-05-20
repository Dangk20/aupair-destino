// ══════════════════════════════════════════
// app/api/admin/usuarias/[id]/route.js
// ══════════════════════════════════════════
export async function PUT(req, { params }) {
  try {
    const { nombre, apellido, email, tiene_acceso, perfil_habilitado } = await req.json();
    await db.query(
      `UPDATE usuarios SET nombre=?, apellido=?, email=?,
       tiene_acceso=?, perfil_habilitado=? WHERE id=?`,
      [nombre, apellido, email, tiene_acceso ? 1 : 0, perfil_habilitado ? 1 : 0, params.id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}