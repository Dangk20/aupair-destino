"use client";
// app/admin/comisiones/page.jsx — Comisiones de las asociadas. La pantalla es
// components/panel/PanelComisiones, la misma que ve cada asociada con sus
// permisos (R18).
import PanelComisiones from "@/components/panel/PanelComisiones";

export default function ComisionesAdminPage() {
  return <PanelComisiones modo="admin" />;
}
