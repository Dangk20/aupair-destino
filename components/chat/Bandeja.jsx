"use client";
// ════════════════════════════════════════════════════════════════════════
// components/chat/Bandeja.jsx — «Mensajes»: la lista de conversaciones y la
// abierta
//
// La misma pantalla para la candidata, la agencia y el admin. Qué
// conversaciones aparecen lo decide el servidor (GET /api/conversaciones):
//
//   candidata  con el equipo y con su agencia
//   agencia    con cada una de sus candidatas
//   admin      todas; en las de agencia lee en silencio hasta que entra
// ════════════════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Search, Plane, Building2 } from "lucide-react";
import { T } from "@/lib/tema";
import { useMobile } from "@/context/MobileContext";
import Conversacion from "@/components/chat/Conversacion";

export const cuando = (f) => {
  if (!f) return "";
  const d = new Date(f);
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" })
    : d.toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" });
};

/** Cómo se llama la conversación para quien la ve. */
export function titulo(c, rol) {
  if (rol === "usuaria") return c.tipo === "equipo" ? "Equipo Destino Au Pair" : c.agencia || (c.tipo === "asociada" ? "Tu asesora" : "Tu agencia");
  return c.candidata || "Candidata";
}
export function subtitulo(c, rol) {
  if (rol === "usuaria") return c.tipo === "equipo" ? "Dudas sobre tu proceso" : c.tipo === "asociada" ? "Tu asesora" : "Tu agencia";
  if (rol === "agencia" || rol === "asociada") return null;
  if (c.tipo === "asociada") return `Con ${c.agencia || "la asesora"} (asesora) · supervisión`;
  return c.tipo === "equipo" ? "Con el equipo" : `Con ${c.agencia || "la agencia"}${c.permisos?.entro ? "" : " · supervisión"}`;
}

export default function Bandeja({ rol, titulo: encabezado, detalle }) {
  const { isMobile } = useMobile();
  const [lista, setLista] = useState(null);
  const [activa, setActiva] = useState(null);   // clave de la conversación abierta
  const [busca, setBusca] = useState("");
  const clave = (c) => `${c.tipo}-${c.id ?? "nueva"}-${c.candidata_id}`;

  const cargar = async (enfocarId = null) => {
    const d = await fetch("/api/conversaciones").then((r) => r.json()).catch(() => ({}));
    const l = d.conversaciones || [];
    setLista(l);
    if (enfocarId) { const c = l.find((x) => x.id === enfocarId); if (c) setActiva(clave(c)); }
    else if (!isMobile && !activa && l.length) setActiva(clave(l[0]));
  };
  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const abierta = lista?.find((c) => clave(c) === activa) || null;
  const visibles = (lista || []).filter((c) =>
    !busca.trim() || `${titulo(c, rol)} ${c.agencia || ""}`.toLowerCase().includes(busca.trim().toLowerCase()));

  const abrir = (c) => {
    setActiva(clave(c));
    // Abrirla la marca leída en el servidor; aquí se apaga el conteo.
    setLista((l) => l.map((x) => (clave(x) === clave(c) ? { ...x, no_leidos: 0 } : x)));
  };

  const columnaLista = (
    <div style={{ width: isMobile ? "100%" : 320, flexShrink: 0, background: "#fff", borderRadius: 20, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
      <div style={{ padding: 12, borderBottom: `1px solid ${T.softLine}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.softFill, borderRadius: 12, padding: "8px 12px" }}>
          <Search size={15} style={{ color: T.textSoft }} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar" aria-label="Buscar conversación"
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: 13, flex: 1, color: T.text }} />
        </div>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {lista === null && <div style={{ padding: 20, fontSize: 13, color: T.textSoft }}>Cargando…</div>}
        {lista && !visibles.length && (
          <div style={{ padding: 20, fontSize: 13, color: T.textSoft, lineHeight: 1.5 }}>
            {busca.trim() ? "Ninguna conversación coincide."
              : rol === "usuaria" ? "Todavía no tienes conversaciones. Cuando el equipo de Destino Au Pair o tu agencia te escriban, las verás aquí."
              : rol === "agencia" ? "Todavía no tienes conversaciones. Para iniciar una, abre a la candidata desde «Mis candidatas»."
              : "No hay conversaciones. Para iniciar una, abre a la candidata desde el tablero."}
          </div>
        )}
        {visibles.map((c) => {
          const sel = clave(c) === activa;
          const sub = subtitulo(c, rol);
          return (
            <button key={clave(c)} type="button" onClick={() => abrir(c)}
              style={{ display: "flex", gap: 10, alignItems: "center", width: "100%", textAlign: "left", border: "none", borderBottom: `1px solid ${T.softLine}`,
                       background: sel ? T.lilac : "#fff", padding: "12px 14px", cursor: "pointer", fontFamily: T.font }}>
              {rol === "usuaria"
                ? <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.tipo === "equipo" ? T.gradIcon : T.neutralBg, color: c.tipo === "equipo" ? "#fff" : T.neutral, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {c.tipo === "equipo" ? <Plane size={16} /> : <Building2 size={16} />}
                  </div>
                : c.candidata_foto
                  ? <img src={c.candidata_foto} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 38, height: 38, borderRadius: "50%", background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{(c.candidata || "?").charAt(0)}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titulo(c, rol)}</span>
                  <span style={{ fontSize: 11, color: T.textSoft, flexShrink: 0 }}>{cuando(c.ultimo_at)}</span>
                </div>
                {sub && <div style={{ fontSize: 11, color: T.primary3, fontWeight: 600 }}>{sub}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: T.textSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.ultimo || ""}</span>
                  {c.no_leidos > 0 && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: T.primary, borderRadius: 999, padding: "1px 7px", flexShrink: 0 }}>{c.no_leidos}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const columnaChat = abierta && (
    <div style={{ flex: 1, minWidth: 0, background: "#fff", borderRadius: 20, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.softLine}`, display: "flex", alignItems: "center", gap: 10 }}>
        {isMobile && <button type="button" onClick={() => setActiva(null)} style={{ border: "none", background: "transparent", color: T.primary, fontFamily: T.font, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>‹ Volver</button>}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{titulo(abierta, rol)}</div>
          {subtitulo(abierta, rol) && <div style={{ fontSize: 12, color: T.textSoft }}>{subtitulo(abierta, rol)}</div>}
        </div>
      </div>
      <Conversacion key={clave(abierta)} conv={abierta} onCambio={(id) => cargar(id)}
        vacio="Aún no hay mensajes." />
    </div>
  );

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", display: "flex", flexDirection: "column", gap: 16, width: "100%", minWidth: 0, height: isMobile ? "auto" : "100vh", boxSizing: "border-box" }}>
      <div>
        <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>{encabezado}</div>
        {detalle && <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3 }}>{detalle}</div>}
      </div>
      <div style={{ flex: 1, minHeight: isMobile ? "70vh" : 0, display: "flex", gap: 16 }}>
        {isMobile ? (abierta ? columnaChat : columnaLista) : <>{columnaLista}{columnaChat || <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: T.textSoft }}>Elige una conversación.</div>}</>}
      </div>
    </div>
  );
}
