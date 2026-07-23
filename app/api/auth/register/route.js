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
        (nombre, apellido, email, password, rol, tiene_acceso, codigo_referido)
       VALUES (?, ?, ?, ?, 'usuaria', FALSE, ?)`,
      [nombre, apellido, email, hashedPassword, codigo_referido?.toUpperCase() || null]
    );

    const nuevoUsuarioId = result.insertId;

    // ── Asignar asesora por código de referido ──────────────────────────────
    // Si viene con código_referido, se busca si es una asesora
    if (codigo_referido) {
      try {
        const [[asesoraRow]] = await dbAupair.query(
          `SELECT id FROM usuarios 
           WHERE codigo_referido = ? AND rol = 'asociada' AND tiene_acceso = 1 LIMIT 1`,
          [codigo_referido.toUpperCase()]
        );

        if (asesoraRow) {
          // La usuaria se registró con código de una asesora → asignarla
          await dbAupair.query(
            "UPDATE usuarios SET asesora_asignada_id = ? WHERE id = ?",
            [asesoraRow.id, nuevoUsuarioId]
          );
        } else {
          // El código no pertenece a una asesora, intentar vincularlo con referidos
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
            console.warn("No se pudo vincular código referido:", codigo_referido);
          }
        }
      } catch (err) {
        console.warn("Error procesando código de referido:", err);
        // No bloqueamos el registro si falla
      }
    } else {
      // Sin código de referido → asignar asesora automáticamente (round-robin)
      try {
        const [[asesoraRow]] = await dbAupair.query(`
          SELECT u.id
          FROM usuarios u
          LEFT JOIN usuarios uu ON uu.asesora_asignada_id = u.id AND uu.rol = 'usuaria'
          WHERE u.rol = 'asociada' AND u.tiene_acceso = 1
          GROUP BY u.id
          ORDER BY COUNT(uu.id) ASC
          LIMIT 1
        `);

        if (asesoraRow) {
          await dbAupair.query(
            "UPDATE usuarios SET asesora_asignada_id = ? WHERE id = ?",
            [asesoraRow.id, nuevoUsuarioId]
          );
        }
      } catch (err) {
        console.warn("No se pudo asignar asesora automáticamente:", err);
      }
    }

    // ── Vincular código referido ────────────────────────────────────────────

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