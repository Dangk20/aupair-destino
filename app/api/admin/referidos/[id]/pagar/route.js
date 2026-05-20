/// ══════════════════════════════════════════════
// 1. app/api/auth/register/route.js
//    Cuando alguien se registra, guarda el código
// ══════════════════════════════════════════════
// Agrega esto DENTRO de tu función de registro,
// después de crear el usuario:

// Ejemplo — busca esta línea en tu register y agrega debajo:
// const [result] = await db.query("INSERT INTO usuarios...", [...]);
// const nuevoId = result.insertId;

// ↓ AGREGA ESTO:
if (codigoReferido) {
  const cod = codigoReferido.trim().toUpperCase();
  const [ref] = await db.query(
    "SELECT id FROM referidos WHERE codigo = ?", [cod]
  );
  if (ref.length > 0) {
    // Guarda relación referido → usuario (sin pago aún)
    await db.query(
      `INSERT INTO referido_registros
         (referido_id, usuario_id, pago_realizado, monto_pagado)
       VALUES (?, ?, 0, 0)`,
      [ref[0].id, nuevoId]
    );
    // Guarda el código en el usuario también
    await db.query(
      "UPDATE usuarios SET codigo_referido = ? WHERE id = ?",
      [cod, nuevoId]
    );
  }
}   