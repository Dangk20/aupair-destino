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

import { LayoutDashboard, IdCard, FileText, BarChart3, Settings } from "lucide-react";
import { MobileProvider } from "@/context/MobileContext";
import PanelLayout from "@/components/panel/PanelLayout";

const MODULOS = [
  { href: "/agencia",               label: "Inicio",        icon: LayoutDashboard },
  { href: "/agencia/perfiles",      label: "Candidatas",    icon: IdCard },
  { href: "/agencia/documentos",    label: "Documentos",    icon: FileText },
  { href: "/agencia/reportes",      label: "Reportes",      icon: BarChart3 },

  { separador: true },
  { href: "/agencia/configuracion", label: "Configuración", icon: Settings },
];

export default function AgenciaLayout({ children }) {
  return (
    <MobileProvider>
      <PanelLayout modulos={MODULOS} rol="Agencia" inicio="/agencia">
        {children}
      </PanelLayout>
    </MobileProvider>
  );
}
