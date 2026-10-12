"use client";
// app/admin/mensajes/page.jsx — Todas las conversaciones: las del equipo con
// cada candidata y, en supervisión, las de cada agencia con sus candidatas.
// En las de agencia el admin lee en silencio hasta que entra; entrar queda en
// el hilo (R5). La pantalla es la misma de todos los roles
// (components/chat/Bandeja).
import Bandeja from "@/components/chat/Bandeja";

export default function AdminMensajesPage() {
  return <Bandeja rol="admin" titulo="Mensajes" detalle="Las conversaciones del equipo con las candidatas y, en supervisión, las de las agencias." />;
}
