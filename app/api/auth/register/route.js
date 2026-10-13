// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbAupair from "@/lib/db-aupair";
import { createToken, getSessionFromRequest } from "@/lib/session-aupair";
import {
  avisarRegistroCandidata,
  avisarBienvenida,
} from "@/lib/notificaciones-aupair";
import { validaFechaNacimiento } from "@/lib/campos-perfil";
import { registrarHecho } from "@/lib/historial-aupair";
import { validar as validarInvitacion, usar as usarInvitacion } from "@/lib/transferencias-aupair";

export async function POST(req) {
  try {
    // ── FIX: frontend envía nombre/apellido, no fullName/lastName ──────────
    const body = await req.json();
    const { nombre, apellido, password, codigo_referido, fecha_nacimiento, invitacion } = body;
    let { email } = body;

    // ── Registro por invitación (R11) ───────────────────────────────────────
    // Quien recibe un cupo transferido se registra con el correo invitado: el
    // del link manda, no el que venga en el cuerpo.
    if (invitacion) {
      const v = await validarInvitacion(invitacion);
      if (!v.ok) return NextResponse.json({ error: v.error }, { status: 410 });
      email = v.email;
    }

    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    // ── Fecha de nacimiento ─────────────────────────────────────────────────
    // El programa es de 18 a 27 años (lib/campos-perfil.js). En el
    // autorregistro la fecha es obligatoria; cuando el admin crea la cuenta
    // desde /admin/usuarias puede no tenerla a mano, pero si la escribe, vale
    // la misma regla.
    const creadaPorAdmin = getSessionFromRequest(req)?.rol === "admin";
    const fecha = fecha_nacimiento ? String(fecha_nacimiento).slice(0, 10) : null;
    if (!fecha && !creadaPorAdmin) {
      return NextResponse.json(
        { error: "Indica tu fecha de nacimiento." },
        { status: 400 }
      );
    }
    if (fecha) {
      const motivo = validaFechaNacimiento(fecha);
      if (motivo) return NextResponse.json({ error: motivo }, { status: 400 });
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
    const crear = async (correo) => {
      const [result] = await dbAupair.query(
        `INSERT INTO usuarios
          (nombre, apellido, email, password, rol, tiene_acceso, codigo_referido, fecha_nacimiento)
         VALUES (?, ?, ?, ?, 'usuaria', FALSE, ?, ?)`,
        [nombre, apellido, correo, hashedPassword, codigo_referido?.toUpperCase() || null, fecha]
      );
      // Primer hecho de su línea de tiempo.
      await registrarHecho({
        candidataId: result.insertId, evento: "registro",
        actor: creadaPorAdmin ? { id: getSessionFromRequest(req).id, rol: "admin" } : { id: result.insertId, rol: "usuaria" },
      });
      return result.insertId;
    };

    // Con invitación, el token se reclama una sola vez y el cupo pasa a la
    // cuenta nueva (lib/transferencias-aupair.js).
    let nuevoUsuarioId;
    if (invitacion) {
      const r = await usarInvitacion(invitacion, crear);
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status || 410 });
      nuevoUsuarioId = r.destinoId;
    } else {
      nuevoUsuarioId = await crear(email);
    }

    // ── Código de referido ──────────────────────────────────────────────────
    // Quedó guardado en `usuarios.codigo_referido`: si es el cupón de una
    // asociada, de ahí sale que la candidata es suya (lib/asociada-aupair.js,
    // change `candidatas-por-cupon`). Ya no se asigna asesora: la columna que
    // usaba el proveedor nunca existió y el intento fallaba en cada registro.
    // Sistema viejo de referidos: se conserva hasta que se retire entero.
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
      } catch (err) {
        console.warn("No se pudo vincular código referido:", codigo_referido, err.message);
      }
    }

    // ── Avisos ──────────────────────────────────────────────────────────────
    // Van aquí, ANTES de la bifurcación de más abajo: la candidata queda
    // registrada igual la haya creado ella o el admin, y el hecho que se avisa
    // es el mismo. No se esperan (ver lib/notificaciones-aupair.js): si el
    // correo falla, el registro sigue en pie.
    avisarRegistroCandidata({
      id: nuevoUsuarioId,
      nombre,
      apellido,
      email,
      codigo_referido: codigo_referido?.toUpperCase() || null,
    });
    avisarBienvenida(nuevoUsuarioId);

    // ── Token y cookie ──────────────────────────────────────────────────────
    // Esta ruta sirve a dos flujos distintos:
    //
    //   1. Autorregistro público: la candidata se crea a sí misma y queda con
    //      la sesión iniciada. Es lo que siempre hizo.
    //   2. Creación administrativa: el admin crea a otra persona desde
    //      /admin/usuarias. Aquí NO se toca la cookie.
    //
    // Antes escribía la cookie en los dos casos, así que al crear un usuario
    // el admin quedaba con la sesión de esa persona: no lo redirigía, pero su
    // siguiente petición salía con rol usuaria y /api/admin/** le respondía
    // 403. Es el "me saca de la sesión" que reporta la clienta.
    if (creadaPorAdmin) {
      return NextResponse.json({ ok: true, id: nuevoUsuarioId });
    }

    const newUser = {
      id:           nuevoUsuarioId,
      nombre,
      apellido,
      email,
      rol:          "usuaria",
      tiene_acceso: !!invitacion,   // el cupo heredado ya está pago
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