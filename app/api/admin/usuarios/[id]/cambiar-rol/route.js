import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id } = await params;

  try {
    const { nuevoRol, codigoReferido } = await req.json();

    // Validar que sea un rol válido
    const rolesValidos = ["admin", "usuaria", "asociada"];
    if (!rolesValidos.includes(nuevoRol)) {
      return NextResponse.json(
        { error: "Rol inválido. Debe ser: admin, usuaria o asociada" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const [usuario] = await dbAupair.query(
      "SELECT id, nombre, apellido, email, rol, codigo_referido FROM usuarios WHERE id = ?",
      [id]
    );

    if (usuario.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const usuarioActual = usuario[0];

    // No permitir cambiar el rol de admin a otro rol (seguridad)
    if (usuarioActual.rol === "admin" && nuevoRol !== "admin") {
      return NextResponse.json(
        { error: "No se puede cambiar el rol de un administrador" },
        { status: 403 }
      );
    }

    // Si cambia a asociada, generar/asignar código de referido
    let tieneAcceso = null;
    let nuevoCodigoReferido = null;
    
    if (nuevoRol === "asociada") {
      tieneAcceso = 1; // Las asesoras siempre tienen acceso
      
      // Si ya tiene código_referido, mantenerlo; si no, generar uno
      if (!usuarioActual.codigo_referido) {
        if (codigoReferido) {
          // Validar que el código personalizado no exista ya
          const [existente] = await dbAupair.query(
            "SELECT id FROM usuarios WHERE codigo_referido = ? AND id != ?",
            [codigoReferido.toUpperCase(), id]
          );
          
          if (existente.length > 0) {
            return NextResponse.json(
              { error: `El código "${codigoReferido}" ya existe. Elige otro.` },
              { status: 400 }
            );
          }
          nuevoCodigoReferido = codigoReferido.toUpperCase();
        } else {
          // Generar código aleatorio: primeras 3 letras del nombre + 4 números
          const nombrePrimeras = (usuarioActual.nombre || "USR").substring(0, 3).toUpperCase();
          nuevoCodigoReferido = nombrePrimeras + Math.random().toString().substring(2, 6);
        }
      }
    } else if (nuevoRol === "admin") {
      // Los admins no necesitan acceso a secciones de estudiante
      tieneAcceso = 0;
    } else if (nuevoRol === "usuaria") {
      // Las usuarias por defecto no tienen acceso
      tieneAcceso = 0;
    }

    // Actualizar rol y código de referido si aplica
    let query = "UPDATE usuarios SET rol = ?";
    let params = [nuevoRol];
    
    // Actualizar tiene_acceso basado en el rol
    query += ", tiene_acceso = ?";
    params.push(tieneAcceso);
    
    // Limpiar accesos específicos si cambias a asociada o admin
    if (nuevoRol === "asociada" || nuevoRol === "admin") {
      query += ", acceso_documentos = 0, acceso_recursos = 0, acceso_reuniones = 0, acceso_mensajes = 0, acceso_comunidad = 0, perfil_habilitado = 0";
    }
    
    if (nuevoCodigoReferido) {
      query += ", codigo_referido = ?";
      params.push(nuevoCodigoReferido);
    }
    
    query += " WHERE id = ?";
    params.push(id);

    await dbAupair.query(query, params);

    // Resetear pago si cambias a asociada o admin
    if (nuevoRol === "asociada" || nuevoRol === "admin") {
      try {
        await dbAupair.query(
          "UPDATE referido_registros SET pago_realizado = 0, monto_pagado = 0 WHERE usuario_id = ?",
          [id]
        );
      } catch (e) {
        console.log("[cambiar-rol] Info: sin registros de pago para limpiar");
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: `Rol cambiado de "${usuarioActual.rol}" a "${nuevoRol}"`,
      usuario: {
        id: usuarioActual.id,
        nombre: usuarioActual.nombre,
        apellido: usuarioActual.apellido,
        email: usuarioActual.email,
        nuevoRol: nuevoRol,
      },
      ...(nuevoCodigoReferido && { 
        codigoReferido: nuevoCodigoReferido,
        mensajeAdicional: `Nuevo código de referido generado: ${nuevoCodigoReferido}`
      }),
    });
  } catch (err) {
    console.error("[PUT /api/admin/usuarios/[id]/cambiar-rol]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
