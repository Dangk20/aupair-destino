"use client";
// Canales del programa para la candidata (GET /api/dashboard/contacto).
// El WhatsApp del programa y el enlace del grupo de la comunidad
// (change candidata-datos-reales).
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

/**
 * Enlace de «Agendar reunión». Desde `agenda-rango-bloques` el calendario está
 * encendido: siempre lleva ahí (y desde ahí, si no hay horarios, a WhatsApp).
 * Se conserva la firma para no tocar a quien lo usa.
 */
export function enlaceAgendar() {
  return { href: "/dashboard/reuniones", externo: false };
}
