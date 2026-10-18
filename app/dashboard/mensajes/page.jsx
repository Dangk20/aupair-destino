"use client";
// app/dashboard/mensajes/page.jsx — «Mensajes» ya no es una pestaña: el chat
// vive en la burbuja flotante del panel (components/chat/ChatFlotante). Esta
// ruta se conserva para los enlaces viejos y los correos: lleva al inicio con
// el panel del chat abierto.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MensajesPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard?chat=1"); }, [router]);
  return null;
}
