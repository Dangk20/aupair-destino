"use client";
// app/dashboard/mensajes/page.jsx — Las conversaciones de la candidata: con el
// equipo de Destino Au Pair y con su agencia. Ella no las inicia: responde en
// las que le abren el equipo o su agencia.
// La pantalla es la misma de todos los roles (components/chat/Bandeja).
//
// Antes mostraba un «Próximamente» y remitía a WhatsApp.
import Bandeja from "@/components/chat/Bandeja";

export default function MensajesPage() {
  return <Bandeja rol="usuaria" titulo="Mensajes" detalle="Tus conversaciones con el equipo de Destino Au Pair y con tu agencia." />;
}
