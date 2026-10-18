"use client";
// Canales del programa para la candidata (GET /api/dashboard/contacto).
// Mientras el calendario siga apagado, «Agendar reunión» se resuelve por el
// WhatsApp del programa con un mensaje listo; si no hay número configurado,
// cae al chat de la plataforma, que sí existe (change candidata-datos-reales).
import { useEffect, useState } from "react";

export function useContacto() {
  const [contacto, setContacto] = useState({ whatsapp: null, comunidad: null, listo: false });
  useEffect(() => {
    fetch("/api/dashboard/contacto")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setContacto({ whatsapp: d.whatsapp || null, comunidad: d.comunidad || null, listo: true }))
      .catch(() => setContacto((c) => ({ ...c, listo: true })));
  }, []);
  return contacto;
}

/** Enlace de «Agendar reunión»: WhatsApp con el mensaje listo, o el chat. */
export function enlaceAgendar(whatsapp, nombre) {
  if (!whatsapp) return { href: "/dashboard/mensajes", externo: false };
  const texto = `Hola, soy ${nombre || "candidata de Destino Au Pair"}. Quiero agendar una reunión con mi asesora.`;
  return { href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`, externo: true };
}
