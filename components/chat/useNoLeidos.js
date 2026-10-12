"use client";
// components/chat/useNoLeidos.js — Cuántos mensajes sin leer tiene quien
// está en sesión, para el contador del menú. Suma los de su bandeja
// (GET /api/conversaciones): al volumen actual no amerita una ruta aparte.
import { useEffect, useState } from "react";

export function useNoLeidos() {
  const [n, setN] = useState(0);
  useEffect(() => {
    fetch("/api/conversaciones").then((r) => (r.ok ? r.json() : {}))
      .then((d) => setN((d.conversaciones || []).reduce((s, c) => s + (c.no_leidos || 0), 0)))
      .catch(() => {});
  }, []);
  return n;
}
