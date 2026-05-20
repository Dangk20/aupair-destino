// ══════════════════════════════════════════
// app/api/admin/usuarios/stats/route.js
// ══════════════════════════════════════════
export async function GET() {
  try {
    const [[s]] = await db.query(`
      SELECT
        COUNT(*)                                  AS total,
        SUM(tiene_acceso)                         AS conAcceso,
        COUNT(*) - SUM(tiene_acceso)              AS soloGratis,
        ROUND(SUM(tiene_acceso)/COUNT(*)*100)     AS conversion
      FROM usuarios WHERE rol != 'admin'
    `);
    return NextResponse.json(s);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}