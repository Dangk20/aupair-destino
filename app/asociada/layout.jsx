"use client";
// app/asociada/layout.jsx — El panel de la asociada declara sus módulos.
// La forma la pone components/panel/PanelLayout.jsx, igual que en los demás
// roles: lo que distingue a una asociada de un admin es a qué entra, no cómo
// se ve.

import { Users, Calendar, Settings, HandCoins } from "lucide-react";
import { MobileProvider } from "@/context/MobileContext";
import PanelLayout from "@/components/panel/PanelLayout";

const MODULOS = [
  // Su inicio es el tablero de sus candidatas (change `candidatas-por-cupon`).
  { href: "/asociada",               label: "Mis candidatas", icon: Users },
  { href: "/asociada/comisiones",    label: "Mis comisiones", icon: HandCoins },  // R18
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
