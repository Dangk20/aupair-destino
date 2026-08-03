"use client";
// app/asociada/layout.jsx — El panel de la asociada declara sus módulos.
// La forma la pone components/panel/PanelLayout.jsx, igual que en los demás
// roles: lo que distingue a una asociada de un admin es a qué entra, no cómo
// se ve.

import { LayoutDashboard, Users, Calendar, Settings } from "lucide-react";
import { MobileProvider } from "@/context/MobileContext";
import PanelLayout from "@/components/panel/PanelLayout";

const MODULOS = [
  { href: "/asociada",               label: "Inicio",        icon: LayoutDashboard },
  { href: "/asociada/usuarias",      label: "Mis Candidatas", icon: Users },
  { href: "/asociada/reuniones",     label: "Calendario",    icon: Calendar  },
  { href: "/asociada/configuracion", label: "Configuración", icon: Settings  },
];

export default function AsociadaLayout({ children }) {
  return (
    <MobileProvider>
      <PanelLayout modulos={MODULOS} rol="Asesora" inicio="/asociada">
        {children}
      </PanelLayout>
    </MobileProvider>
  );
}
