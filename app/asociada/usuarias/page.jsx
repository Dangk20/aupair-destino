// app/asociada/usuarias/page.jsx — «Mis candidatas» ahora es el inicio de la
// asociada (change `candidatas-por-cupon`). Se conserva para enlaces guardados.
import { redirect } from "next/navigation";

export default function AsociadaUsuariasPage() {
  redirect("/asociada");
}
