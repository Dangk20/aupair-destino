"use client";
// app/agencia/mensajes/page.jsx — Las conversaciones de la agencia con sus
// candidatas (R16). La pantalla es la misma de todos los roles
// (components/chat/Bandeja); también se abren desde el tablero.
import Bandeja from "@/components/chat/Bandeja";

export default function AgenciaMensajesPage() {
  return <Bandeja rol="agencia" titulo="Mensajes" detalle="Tus conversaciones con tus candidatas. Para iniciar una, abre a la candidata desde «Mis candidatas»." />;
}
