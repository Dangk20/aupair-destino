"use client";
// app/admin/perfiles/page.jsx — «Candidatas»: todas, cada una en su etapa.
//
// Una sola pantalla (change `candidatas-una-vista`): el tablero compartido
// (components/panel/TableroEtapas) con sus vistas Tablero y Lista, más buscar,
// filtrar por etapa y exportar. Reemplaza a la lista heredada, que calculaba
// estados propios («Completo», «Lista para agencia»…) que no eran las etapas.
// El admin mueve las etapas de la agencia; las demás se deciden en la ficha.
import { useEffect, useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { ETAPAS, SALIDAS, ETAPAS_AGENCIA, etapaPorId } from "@/lib/etapas-candidata";
import TableroEtapas from "@/components/panel/TableroEtapas";

/** CSV con BOM: Excel lo abre con las tildes bien. */
function exportar(filas) {
  const celda = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lineas = [
    ["Nombre", "Correo", "Teléfono", "Ciudad", "Etapa", "% diligenciado", "Agencia"],
    ...filas.map(c => [c.nombre, c.email, c.telefono, c.ciudad, etapaPorId(c.etapa)?.label || c.etapa, c.score, c.agencia]),
  ].map(f => f.map(celda).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + lineas], { type: "text/csv;charset=utf-8" }));
  Object.assign(document.createElement("a"), { href: url, download: `candidatas-${new Date().toISOString().slice(0, 10)}.csv` }).click();
  URL.revokeObjectURL(url);
}

export default function CandidatasPage() {
  const { isMobile } = useMobile();
  const [candidatas, setCandidatas] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [etapa, setEtapa] = useState("");
  const [aviso, setAviso] = useState(null);
  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3000); };

  useEffect(() => {
    fetch("/api/admin/tablero").then(r => r.json())
      .then(d => setCandidatas(d.candidatas || [])).catch(() => setCandidatas([]));
  }, []);

  const mover = async (id, nueva) => {
    // Optimista: la tarjeta se mueve ya; si el servidor dice que no, vuelve.
    const antes = candidatas;
    setCandidatas(cs => cs.map(c => c.id === id ? { ...c, etapa: nueva, desde: new Date().toISOString() } : c));
    const res = await fetch(`/api/admin/perfiles/${id}/etapa`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ etapa: nueva }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setCandidatas(antes); decir(d.error || "No se pudo mover", "error"); }
    else decir(`Movida a «${etapaPorId(nueva)?.label}»`);
  };

  const filtradas = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return (candidatas || []).filter(c =>
      (!etapa || c.etapa === etapa) &&
      (!q || `${c.nombre || ""} ${c.email || ""} ${c.ciudad || ""}`.toLowerCase().includes(q)));
  }, [candidatas, buscar, etapa]);

  const campo = { height: 38, border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: "#fff", outline: "none", fontFamily: T.font, boxSizing: "border-box" };

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", display: "flex", flexDirection: "column", gap: 18, width: "100%", minWidth: 0 }}>
      {aviso && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: aviso.tipo === "error" ? T.danger : T.ink, color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 600 }}>
          {aviso.msg}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>Candidatas</div>
          <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3 }}>
            Cada candidata en su etapa. Desde «Evaluación de la agencia» se mueven arrastrando o desde la columna Etapa; las anteriores se deciden en la ficha.
          </div>
        </div>
        <button type="button" onClick={() => exportar(filtradas)} disabled={!filtradas.length}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: "#fff", color: T.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
          <Download size={14} /> Exportar
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 420 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.softText }} />
          <input type="search" value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar por nombre, correo o ciudad…"
            aria-label="Buscar candidatas" style={{ ...campo, width: "100%", paddingLeft: 34, paddingRight: 12 }} />
        </div>
        <select value={etapa} onChange={e => setEtapa(e.target.value)} aria-label="Filtrar por etapa" style={{ ...campo, padding: "0 12px", cursor: "pointer" }}>
          <option value="">Todas las etapas</option>
          {[...ETAPAS, ...SALIDAS].map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        {candidatas && (buscar || etapa) && (
          <span style={{ fontSize: 12.5, color: T.textSoft }}>{filtradas.length} de {candidatas.length}</span>
        )}
      </div>

      {candidatas === null
        ? <div style={{ fontSize: 13, color: T.textSoft }}>Cargando…</div>
        : <TableroEtapas candidatas={filtradas} movibles={ETAPAS_AGENCIA} onMover={mover} hrefFicha={(id) => `/admin/perfiles/${id}`} />}
    </div>
  );
}
