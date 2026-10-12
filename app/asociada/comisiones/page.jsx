"use client";
// app/asociada/comisiones/page.jsx — Las ventas hechas con el código de la
// asociada y el balance de sus comisiones (R18). Es la misma pantalla del
// admin (components/panel/PanelComisiones), con los permisos de la asociada.
import PanelComisiones from "@/components/panel/PanelComisiones";

export default function MisComisionesPage() {
  return <PanelComisiones modo="asociada" />;
}
