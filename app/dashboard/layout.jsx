"use client";
// app/dashboard/layout.jsx — El panel de la candidata declara sus módulos.
// La forma la pone components/panel/PanelLayout.jsx, la misma de los cuatro
// roles. Este panel fue el origen de la línea gráfica: lo que cambió es que
// dejó de tener su propia copia de la cáscara y ahora la comparte.
//
// Dos particularidades que la cáscara soporta y los demás paneles no usan:
// los cinco módulos `principal` salen además en la barra inferior de móvil, y
// el contenido va envuelto en `.inner-page` (lo piden los estilos de las
// páginas de la candidata).
//
// Los candados NO salen del JWT: /api/dashboard/acceso los lee de la base, así
// que revocar un permiso surte efecto sin esperar al siguiente ingreso.

import { useState, useEffect } from "react";
import {
  Home, Map, BookOpen, FileText, MessageCircle,
  User, Calendar, Users, FolderOpen, Settings,
} from "lucide-react";
import { MobileProvider } from "@/context/MobileContext";
import PanelLayout from "@/components/panel/PanelLayout";

const SIN_ACCESO = {
  perfil: false, documentos: false, recursos: false,
  reuniones: false, mensajes: false, comunidad: false,
};

export default function DashboardLayout({ children }) {
  const [accesos, setAccesos] = useState(SIN_ACCESO);
  const [mensajes, setMensajes] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard/acceso").then(r => r.json())
      .then(d => setAccesos({
        perfil: !!d.perfil, documentos: !!d.documentos, recursos: !!d.recursos,
        reuniones: !!d.reuniones, mensajes: !!d.mensajes, comunidad: !!d.comunidad,
      })).catch(() => {});
    fetch("/api/dashboard/mensajes?limit=1&solo_conteo=true").then(r => r.json())
      .then(d => setMensajes(d.no_leidos || 0)).catch(() => {});
  }, []);

  const bloqueado = (llave) => ({
    disponible: accesos[llave],
    motivo: "Se abre cuando completes el pago de tu programa",
  });

  const MODULOS = [
    { href: "/dashboard",            label: "Inicio",     icon: Home,          principal: true },
    { href: "/dashboard/proceso",    label: "Mi Destino", icon: Map,           principal: true },
    { href: "/dashboard/curso",      label: "Curso",      icon: BookOpen,      principal: true },
    { href: "/dashboard/documentos", label: "Documentos", icon: FileText,      principal: true, ...bloqueado("documentos") },
    { href: "/dashboard/mensajes",   label: "Mensajes",   icon: MessageCircle, principal: true, badge: mensajes, ...bloqueado("mensajes") },

    { separador: true },
    { href: "/dashboard/perfil",        label: "Mi Perfil",     icon: User,       ...bloqueado("perfil") },
    { href: "/dashboard/reuniones",     label: "Calendario",    icon: Calendar,   ...bloqueado("reuniones") },
    { href: "/dashboard/comunidad",     label: "Comunidad",     icon: Users,      ...bloqueado("comunidad") },
    { href: "/dashboard/recursos",      label: "Recursos",      icon: FolderOpen, ...bloqueado("recursos") },
    { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
  ];

  return (
    <MobileProvider>
      <PanelLayout
        modulos={MODULOS}
        rol="Futura Au Pair"
        inicio="/dashboard"
        claseMain="dap-main"
        claseContenido="inner-page"
      >
        {children}
      </PanelLayout>
    </MobileProvider>
  );
}
