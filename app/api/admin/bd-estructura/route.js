import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    // Obtener estructura de todas las tablas
    const [tables] = await dbAupair.query(`
      SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

    const tablesInfo = [];

    for (const table of tables) {
      const [columns] = await dbAupair.query(`
        SELECT 
          COLUMN_NAME,
          COLUMN_TYPE,
          IS_NULLABLE,
          COLUMN_KEY,
          EXTRA,
          COLUMN_DEFAULT
        FROM information_schema.COLUMNS
        WHERE TABLE_NAME = ? AND TABLE_SCHEMA = DATABASE()
        ORDER BY ORDINAL_POSITION
      `, [table.TABLE_NAME]);

      tablesInfo.push({
        nombre: table.TABLE_NAME,
        filas: table.TABLE_ROWS,
        tamanio: table.DATA_LENGTH,
        columnas: columns,
      });
    }

    return NextResponse.json({
      ok: true,
      total_tablas: tables.length,
      tablas: tablesInfo,
    });
  } catch (err) {
    console.error("[GET /api/admin/bd-estructura]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
