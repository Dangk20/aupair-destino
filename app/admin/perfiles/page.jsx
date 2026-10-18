"use client";
// app/admin/perfiles/page.jsx — «Candidatas»: todas, cada una en su etapa.
//
// Una sola pantalla (change `candidatas-una-vista`): el tablero compartido
// (components/panel/TableroEtapas) con sus vistas Tablero y Lista, más buscar,
// filtrar por etapa y exportar. Reemplaza a la lista heredada, que calculaba
// estados propios («Completo», «Lista para agencia»…) que no eran las etapas.
// El admin arrastra cualquier tarjeta (change `tablero-arrastre-total`):
// entre etapas de la agencia se mueve; hacia una etapa calculada, soltar abre
// la MISMA decisión de la ficha (aprobar, No califica, revertir) o explica por
// qué no aplica. Nunca se cambia una etapa calculada sin su decisión.
import { useEffect, useMemo, useState } from "react";
import { Search, Download, X } from "lucide-react";
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

  const [soltada, setSoltada] = useState(null); // { c, destino, tipo }
  const [agencias, setAgencias] = useState([]);

  const cargar = () => fetch("/api/admin/tablero").then(r => r.json())
    .then(d => setCandidatas(d.candidatas || [])).catch(() => setCandidatas([]));
  useEffect(() => {
    cargar();
    fetch("/api/admin/agencias").then(r => r.json()).then(d => setAgencias(d.agencias || [])).catch(() => {});
  }, []);

  /** Qué significa soltar `c` en `destino`. */
  const soltar = (c, destino) => {
    const deAgencia = ETAPAS_AGENCIA.includes(c.etapa);
    if (deAgencia && ETAPAS_AGENCIA.includes(destino)) return mover(c.id, destino);
    if (destino === "evaluacion")   return setSoltada({ c, destino, tipo: "aprobar" });
    if (destino === "no_califica")  return setSoltada({ c, destino, tipo: "no_califica" });
    if (destino === "correcciones") return setSoltada({ c, destino, tipo: "correcciones" });
    if (destino === "revision" || destino === "diligenciando") {
      if (c.etapa === "evaluacion" || c.etapa === "no_califica") return setSoltada({ c, destino, tipo: "revertir" });
      if (deAgencia) return setSoltada({ c, destino, tipo: "info", texto: "Ya avanzó con la agencia. Para cerrar su proceso, muévela a «No continúa»." });
      return setSoltada({ c, destino, tipo: "info", texto: "«En revisión» la marca la candidata al enviar la Parte 1 de su perfil, y «Diligenciando» es mientras no la envía. No se cambian a mano." });
    }
    return setSoltada({ c, destino, tipo: "info", texto: "Primero apruébala: arrástrala a «Evaluación de la agencia» y elige su agencia." });
  };

  /** La decisión de la ficha, desde el tablero. */
  const decidir = async (cuerpo) => {
    const { c } = soltada;
    const res = await fetch(`/api/admin/perfiles/${c.id}/decision`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return d.error || "No se pudo registrar la decisión";
    setSoltada(null);
    decir(d.mensaje || "Listo");
    await cargar();
    return null;
  };

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
            Cada candidata en su etapa. Arrastra una tarjeta para moverla o para decidir: a «Evaluación de la agencia» la apruebas, a «No califica» la descartas.
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
        : <TableroEtapas candidatas={filtradas} movibles={ETAPAS_AGENCIA} onMover={mover} onSoltar={soltar} hrefFicha={(id) => `/admin/perfiles/${id}`} />}

      {soltada && <DecisionAlSoltar s={soltada} agencias={agencias} onDecidir={decidir} onCerrar={() => setSoltada(null)} />}
    </div>
  );
}

/**
 * La ventana que abre soltar una tarjeta en una etapa calculada. Usa la misma
 * API de decisión que la ficha, con sus mismas validaciones (Parte 1 completa
 * para aprobar, motivo para No califica).
 */
function DecisionAlSoltar({ s, agencias, onDecidir, onCerrar }) {
  const [agenciaId, setAgenciaId] = useState(agencias.length === 1 ? String(agencias[0].id) : "");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const { c, destino, tipo } = s;
  const nombre = c.nombre || "la candidata";

  const enviar = async (cuerpo) => {
    setOcupado(true); setError(null);
    const e = await onDecidir(cuerpo);
    setOcupado(false);
    if (e) setError(e);
  };

  const titulo = {
    aprobar: `Aprobar a ${nombre}`,
    no_califica: `${nombre} no califica`,
    correcciones: `Pedir correcciones a ${nombre}`,
    revertir: `Revertir la decisión sobre ${nombre}`,
    info: `No se puede mover a «${etapaPorId(destino)?.label}»`,
  }[tipo];

  const boton = (texto, onClick, deshabilitado = false, peligro = false) => (
    <button type="button" onClick={onClick} disabled={ocupado || deshabilitado}
      style={{ border: "none", borderRadius: 10, padding: "10px 16px", fontFamily: T.font, fontWeight: 700, fontSize: 13, cursor: "pointer",
               background: peligro ? T.danger : T.primary, color: "#fff", opacity: ocupado || deshabilitado ? .55 : 1 }}>
      {ocupado ? "Guardando…" : texto}
    </button>
  );
  const campo = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: "#fff", fontFamily: T.font, boxSizing: "border-box", padding: "9px 12px", outline: "none" };

  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} onClick={onCerrar}
      style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(38,35,92,.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 18, padding: 22, fontFamily: T.font, color: T.text, boxShadow: "0 20px 50px rgba(58,37,48,.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{titulo}</div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" style={{ border: "none", background: "transparent", cursor: "pointer", color: T.textSoft }}><X size={18} /></button>
        </div>

        {tipo === "aprobar" && (
          <>
            <p style={{ fontSize: 13, color: T.textSoft, margin: "8px 0 14px", lineHeight: 1.5 }}>Queda aprobada y la enviamos a la agencia que elijas. Le llega el correo de aprobación.</p>
            <select value={agenciaId} onChange={(e) => setAgenciaId(e.target.value)} aria-label="Agencia" style={{ ...campo, cursor: "pointer" }}>
              <option value="">Elige la agencia…</option>
              {agencias.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </>
        )}
        {tipo === "no_califica" && (
          <>
            <p style={{ fontSize: 13, color: T.textSoft, margin: "8px 0 14px", lineHeight: 1.5 }}>El motivo queda en el historial interno: la candidata no lo ve.</p>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} placeholder="Motivo" aria-label="Motivo" style={{ ...campo, resize: "vertical" }} />
          </>
        )}
        {tipo === "correcciones" && (
          <p style={{ fontSize: 13, color: T.textSoft, margin: "8px 0 0", lineHeight: 1.5 }}>Las correcciones se piden como observaciones, junto al dato o documento que hay que corregir. Escríbelas en su ficha y pasará sola a «Con correcciones».</p>
        )}
        {tipo === "revertir" && (
          <p style={{ fontSize: 13, color: T.textSoft, margin: "8px 0 0", lineHeight: 1.5 }}>
            {c.etapa === "no_califica" ? "Vuelve a quedar sin decisión, en la etapa que le corresponda por sus datos." : "Se deshace la aprobación y sale de la agencia. Vuelve a la etapa que le corresponda por sus datos."} Queda en su historial.
          </p>
        )}
        {tipo === "info" && <p style={{ fontSize: 13, color: T.textSoft, margin: "8px 0 0", lineHeight: 1.5 }}>{s.texto}</p>}

        {error && <p role="alert" style={{ marginTop: 12, fontSize: 12.5, color: T.danger, fontWeight: 600 }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          {tipo !== "info" && <button type="button" onClick={onCerrar} style={{ border: `1.5px solid ${T.border}`, background: "#fff", borderRadius: 10, padding: "10px 16px", fontFamily: T.font, fontWeight: 600, fontSize: 13, cursor: "pointer", color: T.ink }}>Cancelar</button>}
          {tipo === "aprobar" && boton("Aprobar y enviar", () => enviar({ accion: "aprobar", agencia_id: Number(agenciaId) }), !agenciaId)}
          {tipo === "no_califica" && boton("Marcar No califica", () => enviar({ accion: "no_califica", motivo }), !motivo.trim(), true)}
          {tipo === "revertir" && boton("Revertir decisión", () => enviar({ accion: "revertir" }))}
          {tipo === "correcciones" && <a href={`/admin/perfiles/${c.id}`} style={{ borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, background: T.primary, color: "#fff", textDecoration: "none" }}>Ir a su ficha</a>}
          {tipo === "info" && boton("Entendido", onCerrar)}
        </div>
      </div>
    </div>
  );
}
