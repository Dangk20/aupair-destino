// app/admin/perfiles/tablero/page.jsx — El tablero ahora es la pantalla de
// Candidatas (change `candidatas-una-vista`). Se conserva para enlaces guardados.
import { redirect } from "next/navigation";

export default function TableroCandidatasPage() {
  redirect("/admin/perfiles");
}
