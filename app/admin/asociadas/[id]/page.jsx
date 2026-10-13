"use client";
// app/admin/asociadas/[id]/page.jsx — Una asociada y sus candidatas.
//
// Sus candidatas son las que llegaron por su cupón (lib/asociada-aupair.js,
// change `candidatas-por-cupon`), en el mismo tablero de Candidatas. Ya no se
// asignan a mano: la columna que usaba el proveedor nunca existió.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import TableroEtapas from "@/components/panel/TableroEtapas";

export default function AsociadaDetallePage() {
  const { id } = useParams();
  const { isMobile } = useMobile();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/asociadas/${id}`).then(r => r.ok ? r.json() : null)
      .then(d => { setDatos(d); setCargando(false); }).catch(() => setCargando(false));
  }, [id]);

  const volver = (
    <Link href="/admin/asociadas" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: T.textSoft, textDecoration: "none", fontSize: 13, border: `1px solid ${T.border}`, padding: "7px 12px", borderRadius: 10, alignSelf: "flex-start" }}>
      <ChevronLeft size={14} /> Asociadas
    </Link>
  );
  if (cargando) return <div style={{ padding: 40, fontFamily: T.font, color: T.textSoft }}>Cargando…</div>;
  if (!datos) return <div style={{ padding: 40, fontFamily: T.font, display: "flex", flexDirection: "column", gap: 12 }}>{volver}<p style={{ color: T.textSoft, fontSize: 14, margin: 0 }}>Asociada no encontrada.</p></div>;

  const { asociada: a, candidatas = [], codigos = [] } = datos;
  const pagaron = candidatas.filter(c => c.pago).length;
  const dato = (titulo, valor) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: T.textSoft }}>{titulo}</div>
      <div style={{ fontSize: 13.5, color: T.ink, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>{valor || "—"}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", display: "flex", flexDirection: "column", gap: 18, width: "100%", minWidth: 0 }}>
      {volver}
      <div>
        <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>{`${a.nombre || ""} ${a.apellido || ""}`.trim()}</div>
        <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3 }}>Sus candidatas son las que se registraron o pagaron con un cupón suyo.</div>
      </div>
      <div style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: T.shadow, display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, minmax(0,1fr))", gap: 14 }}>
        {dato("CORREO", a.email)}
        {dato("TELÉFONO", a.telefono)}
        {dato("CIUDAD", [a.ciudad, a.pais].filter(Boolean).join(", "))}
        {dato("CUPONES", codigos.map(c => c.codigo).join(", ") || "Sin cupón")}
        {dato("CANDIDATAS", candidatas.length)}
        {dato("PAGARON", pagaron)}
      </div>
      {candidatas.length === 0
        ? <div style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: T.shadow, fontSize: 13.5, color: T.textSoft, textAlign: "center" }}>
            {codigos.length ? "Nadie se ha registrado ni ha pagado con su cupón todavía." : "No tiene cupón. Créale uno en Códigos promo para que sus candidatas aparezcan aquí."}
          </div>
        : <TableroEtapas candidatas={candidatas} hrefFicha={(cid) => `/admin/perfiles/${cid}`} />}
    </div>
  );
}
