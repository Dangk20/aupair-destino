// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbAupair from "@/lib/db-aupair";
import { createToken } from "@/lib/session-aupair";

export async function POST(req) {
  try {
    // ── FIX: frontend envía nombre/apellido, no fullName/lastName ──────────
    const { nombre, apellido, email, password, codigo_referido } = await req.json();

    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    // ── Email duplicado ─────────────────────────────────────────────────────
    const [existing] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE email = ?", [email]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo." },
        { status: 409 }
      );
    }

    // ── Hash contraseña ─────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Crear usuario ───────────────────────────────────────────────────────
    const [result] = await dbAupair.query(
      `INSERT INTO usuarios
        (nombre, apellido, email, password, tiene_acceso, codigo_referido)
       VALUES (?, ?, ?, ?, FALSE, ?)`,
      [nombre, apellido, email, hashedPassword, codigo_referido?.toUpperCase() || null]
    );

    const nuevoUsuarioId = result.insertId;

    // ── Vincular código referido ────────────────────────────────────────────
    if (codigo_referido) {
      try {
        const [[ref]] = await dbAupair.query(
          "SELECT id FROM referidos WHERE codigo = ?",
          [codigo_referido.toUpperCase()]
        );

        if (ref) {
          await dbAupair.query(
            `INSERT INTO referido_registros
              (usuario_id, referido_id, monto_pagado, pago_realizado)
             VALUES (?, ?, 0, 0)`,
            [nuevoUsuarioId, ref.id]
          );
        }
      } catch {
        // Si falla el referido no bloqueamos el registro
        console.warn("No se pudo vincular código referido:", codigo_referido);
      }
    }

    // ── Token y cookie ──────────────────────────────────────────────────────
    const newUser = {
      id:           nuevoUsuarioId,
      nombre,
      apellido,
      email,
      rol:          "usuaria",
      tiene_acceso: false,
    };

    const token    = createToken(newUser);
    const response = NextResponse.json({ ok: true, redirect: "/dashboard" });

    response.cookies.set("dap_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 7, // 7 días
      path:     "/",
    });

    return response;

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}