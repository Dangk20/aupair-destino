import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";

export async function POST(_, { params }) {
  const { id } = await params;
  try {
    await dbAupair.query(
      "UPDATE referidos SET estado='Pagado' WHERE id=?",
      [id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}