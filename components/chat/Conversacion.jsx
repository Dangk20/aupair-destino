"use client";
// ════════════════════════════════════════════════════════════════════════
// components/chat/Conversacion.jsx — Un hilo de mensajes
//
// El mismo para la candidata, la agencia y el admin: lo que cambia sale de
// `conv.permisos`, que calcula el servidor (lib/conversaciones-aupair.js).
//
//   conv.id null      todavía no existe: quien puede iniciarla (la agencia,
//                     la suya; el admin, la del equipo) ve «Iniciar
//                     conversación». La candidata nunca inicia.
//   permisos.entrar   el admin lee en silencio; «Entrar a la conversación»
//                     deja el ingreso en el hilo y le habilita escribir.
//
// Sondea cada 5 s sólo lo nuevo (`?desde=`) y sólo con la pestaña visible.
// ════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, MessageSquarePlus, LogIn, Lock } from "lucide-react";
import { T } from "@/lib/tema";

const hora = (f) => new Date(f).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });
const dia = (f) => {
  const d = new Date(f).toLocaleDateString("es-CO", { timeZone: "America/Bogota" });
  const hoy = new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota" });
  const ayer = new Date(Date.now() - 86400000).toLocaleDateString("es-CO", { timeZone: "America/Bogota" });
  if (d === hoy) return "Hoy";
  if (d === ayer) return "Ayer";
  return new Date(f).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Bogota" });
};

/** Quién escribió, para los mensajes ajenos. */
const firma = (m) =>
  m.autor_rol === "admin" ? (m.autor === "Equipo Destino Au Pair" ? m.autor : `${m.autor || "Equipo"} · Destino Au Pair`)
  : m.autor_rol === "agencia" ? `${m.autor || "Agencia"} · Agencia`
  : m.autor || "Candidata";

export default function Conversacion({ conv, onCambio, vacio = "Aún no hay mensajes." }) {
  const [mensajes, setMensajes] = useState([]);
  const [permisos, setPermisos] = useState(conv?.permisos || {});
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState(null);
  const ultimo = useRef(0);
  const fondo = useRef(null);
  const id = conv?.id || null;

  const traer = useCallback(async (reiniciar = false) => {
    if (!id) return;
    if (reiniciar) ultimo.current = 0;
    const r = await fetch(`/api/conversaciones/${id}/mensajes?desde=${ultimo.current}`).catch(() => null);
    if (!r?.ok) return;
    const d = await r.json();
    if (d.permisos) setPermisos(d.permisos);
    if (d.mensajes?.length) {
      ultimo.current = d.mensajes[d.mensajes.length - 1].id;
      setMensajes((prev) => (reiniciar ? d.mensajes : [...prev, ...d.mensajes]));
    } else if (reiniciar) setMensajes([]);
  }, [id]);

  useEffect(() => {
    setMensajes([]); setPermisos(conv?.permisos || {}); setError(null);
    if (!id) return;
    traer(true);
    const t = setInterval(() => { if (!document.hidden) traer(); }, 5000);
    return () => clearInterval(t);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fondo.current?.scrollTo({ top: fondo.current.scrollHeight, behavior: "smooth" }); }, [mensajes.length]);

  /** Crea la conversación («Iniciar conversación»). */
  const iniciar = async () => {
    const r = await fetch("/api/conversaciones", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidata_id: conv.candidata_id }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setError(d.error || "No se pudo iniciar la conversación."); return null; }
    return d.id;
  };

  const enviar = async () => {
    const t = texto.trim();
    if (!t || ocupado) return;
    setOcupado(true); setError(null);
    try {
      const r = await fetch(`/api/conversaciones/${id}/mensajes`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contenido: t }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(d.error || "No se pudo enviar."); return; }
      setTexto("");
      await traer();
    } finally { setOcupado(false); }
  };

  const entrar = async () => {
    setOcupado(true);
    const r = await fetch(`/api/conversaciones/${id}/entrar`, { method: "POST" });
    setOcupado(false);
    if (!r.ok) { setError("No se pudo entrar a la conversación."); return; }
    await traer();
    onCambio?.(id);
  };

  const pie = { borderRadius: 999, background: "#fff", border: `1px solid ${T.border}`, boxShadow: "0 2px 10px rgba(58,37,48,.05)" };

  // ── Sin conversación ──
  if (!id) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 30, textAlign: "center" }}>
        <MessageSquarePlus size={38} strokeWidth={1.5} style={{ color: T.softText }} />
        {conv.permisos?.iniciar ? (
          <>
            <div style={{ fontSize: 13.5, color: T.textSoft, maxWidth: 300, lineHeight: 1.5 }}>
              {conv?.tipo === "equipo" ? "El equipo todavía no ha hablado con esta candidata." : "Todavía no has hablado con esta candidata."}
            </div>
            <button type="button" disabled={ocupado} onClick={async () => { setOcupado(true); const n = await iniciar(); setOcupado(false); if (n) onCambio?.(n); }}
              style={{ border: "none", borderRadius: 999, padding: "11px 22px", background: T.primary, color: "#fff", fontFamily: T.font, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
              Iniciar conversación
            </button>
          </>
        ) : (
          <div style={{ fontSize: 13.5, color: T.textSoft, maxWidth: 300, lineHeight: 1.5 }}>La agencia todavía no ha iniciado la conversación con esta candidata.</div>
        )}
        {error && <div style={{ fontSize: 12.5, color: T.danger }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* El hilo */}
      <div ref={fondo} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {!mensajes.length && <div style={{ margin: "auto", fontSize: 13, color: T.textSoft, textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>{vacio}</div>}
        {mensajes.map((m, i) => {
          const antes = mensajes[i - 1];
          const nuevoDia = !antes || dia(antes.fecha) !== dia(m.fecha);
          // El equipo de Destino Au Pair, en ámbar (como su aviso de ingreso):
          // en un hilo de tres se distingue de un vistazo quién habla.
          const equipo = !m.mio && m.autor_rol === "admin";
          const mismaFirma = antes && !nuevoDia && antes.tipo === "mensaje" && antes.mio === m.mio && firma(antes) === firma(m);
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nuevoDia && <div style={{ alignSelf: "center", fontSize: 12, fontWeight: 600, color: T.textSoft, textTransform: "capitalize" }}>{dia(m.fecha)}</div>}
              {m.tipo === "ingreso" ? (
                <div style={{ alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.ink, background: T.amberBg, border: `1px solid ${T.border}`, padding: "5px 12px", borderRadius: 999, textAlign: "center" }}>
                  <LogIn size={12} /> {m.mio ? "Entraste" : `${m.autor || "El equipo"} del equipo de Destino Au Pair entró`} a la conversación · {hora(m.fecha)}
                </div>
              ) : (
                <div style={{ alignSelf: m.mio ? "flex-end" : "flex-start", maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: m.mio ? "flex-end" : "flex-start", gap: 3 }}>
                  {!m.mio && !mismaFirma && <div style={{ fontSize: 11, fontWeight: 600, color: equipo ? T.amber : T.textSoft, padding: "0 6px" }}>{firma(m)}</div>}
                  <div style={{ background: m.mio ? T.primary : equipo ? T.amberBg : "#fff", color: m.mio ? "#fff" : T.text,
                                border: m.mio ? "none" : `1px solid ${equipo ? T.amberLine : T.border}`,
                                borderRadius: 16, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word",
                                boxShadow: "0 1px 3px rgba(58,37,48,.05)", display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <span>{m.contenido}</span>
                    <span style={{ fontSize: 10.5, opacity: .7, whiteSpace: "nowrap", flexShrink: 0 }}>{hora(m.fecha)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Escribir, entrar o sólo leer */}
      <div style={{ padding: "10px 14px 14px" }}>
        {error && <div style={{ fontSize: 12.5, color: T.danger, padding: "0 8px 6px" }}>{error}</div>}
        {permisos.entrar ? (
          <div style={{ ...pie, display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 8px 18px" }}>
            <span style={{ flex: 1, fontSize: 12.5, color: T.textSoft }}>Estás leyendo esta conversación. Si entras, la agencia y la candidata lo verán.</span>
            <button type="button" onClick={entrar} disabled={ocupado}
              style={{ border: "none", borderRadius: 999, padding: "9px 16px", background: T.primary, color: "#fff", fontFamily: T.font, fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              Entrar a la conversación
            </button>
          </div>
        ) : permisos.escribir ? (
          <div style={{ ...pie, display: "flex", alignItems: "flex-end", gap: 8, padding: "6px 6px 6px 18px" }}>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={1} maxLength={4000}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
              placeholder="Escribe un mensaje…" aria-label="Escribe un mensaje"
              style={{ flex: 1, border: "none", outline: "none", resize: "none", fontFamily: T.font, fontSize: 13.5, color: T.text, background: "transparent", padding: "9px 0", maxHeight: 110, lineHeight: 1.45 }} />
            <button type="button" onClick={enviar} disabled={!texto.trim() || ocupado} aria-label="Enviar"
              style={{ width: 40, height: 40, borderRadius: "50%", border: "none", flexShrink: 0, cursor: texto.trim() ? "pointer" : "default",
                       background: texto.trim() ? T.primary : T.lilac, color: texto.trim() ? "#fff" : T.primary3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={17} />
            </button>
          </div>
        ) : (
          <div style={{ ...pie, display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", fontSize: 12.5, color: T.textSoft }}>
            <Lock size={14} /> Puedes leer esta conversación, pero no escribir en ella.
          </div>
        )}
      </div>
    </div>
  );
}
