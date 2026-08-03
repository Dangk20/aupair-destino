"use client";
// app/admin/layout.jsx — El panel de administración declara sus módulos.
// La forma la pone components/panel/PanelLayout.jsx, la misma de todos los
// roles. Lo que distingue a un admin de una agencia es a qué entra y qué
// puede hacer, no cómo se ve.
//
// El menú sigue la arquitectura acordada en el ítem 8 del alcance:
//   Dashboard · Asociadas · Finanzas · Usuarios · Candidatas · Sesiones ·
//   Calendario · Reportes · Configuración
//
// Los módulos que todavía no existen van declarados con `disponible: false`:
// se ven apagados y no se pueden abrir. Es distinto de lo que se retiró del
// Resumen — allí había cifras inventadas que afirmaban algo falso; aquí una
// entrada apagada declara que algo aún no está.

import {
  LayoutDashboard, UsersRound, CreditCard, HandCoins, Tag,
  Users, IdCard, Video, Calendar, BarChart3, Settings,
} from "lucide-react";
import { MobileProvider } from "@/context/MobileContext";
import PanelLayout from "@/components/panel/PanelLayout";

const MODULOS = [
  { href: "/admin",               label: "Dashboard",     icon: LayoutDashboard },

  // Su listado funciona; lo que está roto es asignar una candidata a una
  // asesora, porque `usuarios.asesora_asignada_id` no existe en la base.
  // Se deja apagado hasta el Sprint 3 para no ofrecer una acción que revienta.
  { href: "/admin/asociadas",     label: "Asociadas",     icon: UsersRound,
    disponible: false, motivo: "Asignar una candidata a su asesora todavía no funciona — Sprint 3" },

  { grupo: "Finanzas" },
  { href: "/admin/ventas",        label: "Ventas",        icon: CreditCard },
  { href: "/admin/comisiones",    label: "Comisiones",    icon: HandCoins },
  { href: "/admin/codigos-promo", label: "Códigos promo", icon: Tag },

  { separador: true },
  { href: "/admin/usuarias",      label: "Usuarios",      icon: Users },
  { href: "/admin/perfiles",      label: "Candidatas",    icon: IdCard },
  { href: "/admin/sesiones",      label: "Sesiones",      icon: Video },

  // Funciona: se comprobó que la pantalla carga sin un solo fallo. Estaba
  // oculta desde el Sprint 0.0 por "ruido visual", no por estar rota.
  { href: "/admin/reuniones",     label: "Calendario",    icon: Calendar },
  { href: "/admin/reportes",      label: "Reportes",      icon: BarChart3,
    disponible: false, motivo: "Se define en los talleres de descubrimiento" },

  { separador: true },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminLayout({ children }) {
  return (
    <MobileProvider>
      <PanelLayout modulos={MODULOS} rol="Administración" inicio="/admin">
        {children}
      </PanelLayout>
    </MobileProvider>
  );
}
