"use client";
// app/agencia/page.jsx — Las candidatas de la agencia, por etapa.
//
// El mismo tablero del admin (components/panel/TableroEtapas), con lo que le
// corresponde a la agencia: sus candidatas —las que el equipo aprobó y le
// envió— en las etapas de la agencia, que puede mover.
//
// Reemplaza al panel heredado del proveedor (inicio, perfiles, documentos y
// reportes), que tenía su propio flujo y veía a todas las candidatas.
import { useEffect, useState } from "react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { ETAPAS_AGENCIA, etapaPorId } from "@/lib/etapas-candidata";
import TableroEtapas from "@/components/panel/TableroEtapas";

export default function AgenciaInicioPage() {
  const { isMobile } = useMobile();
  const [candidatas, setCandidatas] = useState(null);
  const [aviso, setAviso] = useState(null);
  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3000); };

  useEffect(() => {
    fetch("/api/agencia/tablero").then(r => r.json())
      .then(d => setCandidatas(d.candidatas || [])).catch(() => setCandidatas([]));
  }, []);

  const mover = async (id, etapa) => {
    const antes = candidatas;
    setCandidatas(cs => cs.map(c => c.id === id ? { ...c, etapa, desde: new Date().toISOString() } : c));
    const res = await fetch(`/api/agencia/candidatas/${id}/etapa`, {
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
      <div>
        <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>Mis candidatas</div>
        <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3 }}>
          Las candidatas que Destino Au Pair aprobó y te envió. Arrástralas a su etapa o usa el menú de cada tarjeta.
        </div>
      </div>
      {candidatas === null
        ? <div style={{ fontSize: 13, color: T.textSoft }}>Cargando…</div>
        : candidatas.length === 0
        ? <div style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: T.shadow, fontSize: 13.5, color: T.textSoft, textAlign: "center" }}>
            Todavía no tienes candidatas. Aparecerán aquí cuando Destino Au Pair apruebe un perfil y te lo envíe.
          </div>
        : <TableroEtapas candidatas={candidatas} columnas={ETAPAS_AGENCIA} movibles={ETAPAS_AGENCIA}
            onMover={mover} hrefFicha={(id) => `/agencia/candidatas/${id}`} />}
    </div>
  );
}
