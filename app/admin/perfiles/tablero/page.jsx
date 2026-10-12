"use client";
// app/admin/perfiles/tablero/page.jsx — Todas las candidatas por etapa.
//
// El componente es compartido (components/panel/TableroEtapas): la agencia
// verá el mismo tablero con sus candidatas. El admin mueve las etapas de la
// agencia; las demás se deciden en la ficha.
import { useEffect, useState } from "react";
import Link from "next/link";
import { List } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { ETAPAS_AGENCIA, etapaPorId } from "@/lib/etapas-candidata";
import TableroEtapas from "@/components/panel/TableroEtapas";

export default function TableroCandidatasPage() {
  const { isMobile } = useMobile();
  const [candidatas, setCandidatas] = useState(null);
  const [aviso, setAviso] = useState(null);
  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3000); };

  const cargar = () => fetch("/api/admin/tablero").then(r => r.json())
    .then(d => setCandidatas(d.candidatas || [])).catch(() => setCandidatas([]));
  useEffect(() => { cargar(); }, []);

  const mover = async (id, etapa) => {
    // Optimista: la tarjeta se mueve ya; si el servidor dice que no, vuelve.
    const antes = candidatas;
    setCandidatas(cs => cs.map(c => c.id === id ? { ...c, etapa, desde: new Date().toISOString() } : c));
    const res = await fetch(`/api/admin/perfiles/${id}/etapa`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ etapa }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setCandidatas(antes); decir(d.error || "No se pudo mover", "error"); }
    else decir(`Movida a «${etapaPorId(etapa)?.label}»`);
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", display: "flex", flexDirection: "column", gap: 18, width: "100%", minWidth: 0 }}>
      {aviso && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: aviso.tipo === "error" ? T.danger : T.ink, color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 600 }}>
          {aviso.msg}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>Tablero de candidatas</div>
          <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3 }}>
            Cada candidata en su etapa. Desde «Evaluación de la agencia» se mueven arrastrando; las anteriores se deciden en la ficha.
          </div>
        </div>
        <Link href="/admin/perfiles" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: T.primary, textDecoration: "none", background: T.lilac, padding: "9px 14px", borderRadius: 10 }}>
          <List size={15} /> Listado de perfiles
        </Link>
      </div>
      {candidatas === null
        ? <div style={{ fontSize: 13, color: T.textSoft }}>Cargando…</div>
        : <TableroEtapas candidatas={candidatas} movibles={ETAPAS_AGENCIA} onMover={mover} hrefFicha={(id) => `/admin/perfiles/${id}`} />}
    </div>
  );
}
