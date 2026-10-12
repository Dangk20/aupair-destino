"use client";
// app/agencia/layout.jsx — El panel de la agencia declara sus módulos.
// La forma la pone components/panel/PanelLayout.jsx, la misma de todos los
// roles: lo que distingue a una agencia de un admin es a qué entra y qué
// puede hacer, no cómo se ve.
//
// Antes este layout traía su propia barra oscura de 200px sobre #4A2A38, con
// su propio bloque de ayuda y su propio pie de usuario. No era una variante
// de la plataforma: parecía otra. Al compartir la cáscara, la agencia navega
// igual que la clienta, sólo que con menos módulos.

import { LayoutGrid, MessageCircle } from "lucide-react";
import { MobileProvider } from "@/context/MobileContext";
import PanelLayout from "@/components/panel/PanelLayout";
import { useNoLeidos } from "@/components/chat/useNoLeidos";

// El tablero de sus candidatas, desde el que se abre cada una (change
// `panel-agencia`), y sus conversaciones con ellas (change `chat-candidata`). Las pantallas heredadas —perfiles, documentos,
// reportes y una configuración que llamaba a una ruta inexistente— se
// retiraron con el flujo que modelaban.
export default function AgenciaLayout({ children }) {
  const noLeidos = useNoLeidos();
  const MODULOS = [
    { href: "/agencia",          label: "Mis candidatas", icon: LayoutGrid },
    { href: "/agencia/mensajes", label: "Mensajes",       icon: MessageCircle, badge: noLeidos },
  ];
  return (
    <MobileProvider>
      <PanelLayout modulos={MODULOS} rol="Agencia" inicio="/agencia">
        {children}
      </PanelLayout>
    </MobileProvider>
  );
}
