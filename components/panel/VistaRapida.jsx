"use client";
// ════════════════════════════════════════════════════════════════════════
// components/panel/VistaRapida.jsx — La candidata, sin salir del tablero
//
// Se abre al tocar una tarjeta del tablero o la burbuja de chat en la lista. A la
// izquierda, el chat; a la derecha, sus datos generales; arriba, «Ver perfil»
// lleva a la ficha completa del rol. El mismo componente para la agencia y el
// admin: qué conversaciones aparecen lo decide el servidor
// (GET /api/conversaciones?candidata_id=…).
//
// Los datos salen de la fila del tablero: no hay otra consulta para ellos.
// ════════════════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Phone, Mail, MapPin, Cake, Building2, Clock, ClipboardCheck } from "lucide-react";
import { T } from "@/lib/tema";
import { etapaPorId } from "@/lib/etapas-candidata";
import { useMobile } from "@/context/MobileContext";
import Conversacion from "@/components/chat/Conversacion";

function edad(fecha) {
  if (!fecha) return null;
  const n = new Date(fecha), h = new Date();
  let e = h.getUTCFullYear() - n.getUTCFullYear();
  if (h.getUTCMonth() < n.getUTCMonth() || (h.getUTCMonth() === n.getUTCMonth() && h.getUTCDate() < n.getUTCDate())) e--;
  return Number.isFinite(e) ? e : null;
}
const dias = (desde) => {
  if (!desde) return null;
  const d = Math.floor((Date.now() - new Date(desde).getTime()) / 86400000);
  return d <= 0 ? "Desde hoy" : d === 1 ? "Hace 1 día" : `Hace ${d} días`;
};

const nombrePestana = (c) => c.tipo === "equipo" ? "Con el equipo" : `Con ${c.agencia || "la agencia"}`;

export default function VistaRapida({ candidata: c, hrefFicha, onCerrar, onLeido }) {
  const { isMobile } = useMobile();
  const [convs, setConvs] = useState(null);
  const [activa, setActiva] = useState(0);
  const [error, setError] = useState(null);

  const cargar = async (enfocarId = null) => {
    const r = await fetch(`/api/conversaciones?candidata_id=${c.id}`).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok) { setError(d.error || "No se pudo cargar la conversación."); setConvs([]); return; }
    const lista = d.conversaciones || [];
    setConvs(lista);
    if (enfocarId) {
      const i = lista.findIndex((x) => x.id === enfocarId);
      if (i >= 0) setActiva(i);
    } else {
      // Primero la que tiene mensajes sin leer; si no, la de la agencia.
      const i = lista.findIndex((x) => x.no_leidos > 0);
      const j = lista.findIndex((x) => x.tipo === "agencia" && x.id);
      setActiva(i >= 0 ? i : j >= 0 ? j : 0);
    }
  };
  useEffect(() => { cargar(); onLeido?.(c.id); }, [c.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape cierra.
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onCerrar]);

  const etapa = etapaPorId(c.etapa);
  const conv = convs?.[activa] || null;
  const años = edad(c.fecha_nacimiento);

  const panel = { background: "#fff", borderRadius: 24, boxShadow: "0 24px 60px rgba(58,37,48,.25)", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" };
  const dato = (Icono, etiqueta, valor, href) => (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 30, height: 30, borderRadius: 10, background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icono size={15} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: T.textSoft }}>{etiqueta}</div>
        {valor
          ? href ? <a href={href} style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, textDecoration: "none", wordBreak: "break-word" }}>{valor}</a>
                 : <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, wordBreak: "break-word" }}>{valor}</div>
          : <div style={{ fontSize: 13, color: T.softText }}>Sin dato</div>}
      </div>
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={`Vista rápida de ${c.nombre}`} onClick={onCerrar}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(58,37,48,.35)", backdropFilter: "blur(2px)",
               display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 10 : 24, fontFamily: T.font }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 1080, height: isMobile ? "calc(100vh - 20px)" : "min(720px, calc(100vh - 48px))",
                 display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16, overflowY: isMobile ? "auto" : "visible" }}>

        {/* ── El chat ── */}
        <div style={{ ...panel, flex: isMobile ? "0 0 auto" : 1.6, height: isMobile ? "82vh" : "auto", border: `2px solid ${T.primary3}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: `1px solid ${T.softLine}` }}>
            {c.foto_url
              ? <img src={c.foto_url} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              : <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                  {(c.nombre || "?").charAt(0).toUpperCase()}
                </div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nombre || "Sin nombre"}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
                {etapa && <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: T.ink, padding: "3px 10px", borderRadius: 999 }}>{etapa.label}</span>}
                {c.agencia && <span style={{ fontSize: 11, fontWeight: 600, color: T.neutral, background: T.neutralBg, padding: "3px 10px", borderRadius: 999 }}>{c.agencia}</span>}
              </div>
            </div>
            <Link href={hrefFicha(c.id)}
              style={{ fontSize: 13, fontWeight: 600, color: T.ink, textDecoration: "none", border: `1px solid ${T.border}`, borderRadius: 999, padding: "9px 16px", whiteSpace: "nowrap", background: "#fff", boxShadow: "0 1px 3px rgba(58,37,48,.06)" }}>
              Ver perfil
            </Link>
            <button type="button" onClick={onCerrar} aria-label="Cerrar"
              style={{ border: "none", background: "transparent", color: T.ink, cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={22} />
            </button>
          </div>

          {/* Equipo / Agencia: sólo si hay más de una */}
          {convs && convs.length > 1 && (
            <div style={{ display: "flex", gap: 6, padding: "10px 18px 0" }}>
              {convs.map((x, i) => (
                <button key={`${x.tipo}-${x.id ?? "nueva"}-${x.agencia_id ?? ""}`} type="button" onClick={() => setActiva(i)}
                  style={{ border: "none", borderRadius: 999, padding: "6px 14px", cursor: "pointer", fontFamily: T.font, fontSize: 12.5, fontWeight: 600,
                           background: i === activa ? T.lilac : "transparent", color: i === activa ? T.primary : T.textSoft, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {nombrePestana(x)}
                  {x.no_leidos > 0 && <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.primary }} />}
                </button>
              ))}
            </div>
          )}

          {convs === null
            ? <div style={{ margin: "auto", fontSize: 13, color: T.textSoft }}>Cargando…</div>
            : error ? <div style={{ margin: "auto", fontSize: 13, color: T.danger }}>{error}</div>
            : conv ? <Conversacion key={`${conv.tipo}-${conv.id ?? "nueva"}`} conv={conv} onCambio={(id) => cargar(id)}
                       vacio={conv.tipo === "equipo" ? "Escribe el primer mensaje a la candidata." : "Escribe el primer mensaje."} />
            : <div style={{ margin: "auto", fontSize: 13, color: T.textSoft }}>Sin conversaciones.</div>}
        </div>

        {/* ── Datos generales ── */}
        <div style={{ ...panel, flex: isMobile ? "0 0 auto" : 1 }}>
          <div style={{ padding: "22px 22px 18px", background: `linear-gradient(160deg, ${T.lilac} 0%, #fff 85%)` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, lineHeight: 1.15 }}>Datos generales</div>
            <div style={{ fontSize: 12.5, color: T.textSoft, marginTop: 4 }}>Lo básico, para hablar con ella. El perfil completo está en «Ver perfil».</div>
          </div>
          <div style={{ padding: "6px 22px 22px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
            {dato(ClipboardCheck, "Etapa", etapa ? `${etapa.label}` : null)}
            {dato(Clock, "En la etapa", dias(c.desde))}
            {dato(Cake, "Edad", años != null ? `${años} años` : null)}
            {dato(MapPin, "Ciudad", c.ciudad)}
            {dato(Phone, "Teléfono", c.telefono, c.telefono ? `tel:${c.telefono}` : null)}
            {dato(Mail, "Correo", c.email, c.email ? `mailto:${c.email}` : null)}
            {c.agencia && dato(Building2, "Agencia", c.agencia)}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: T.textSoft, marginBottom: 6 }}>
                <span>Información diligenciada</span><strong style={{ color: T.primary }}>{c.score}%</strong>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: T.softFill, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, Math.max(0, c.score || 0))}%`, height: "100%", background: T.primary, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
