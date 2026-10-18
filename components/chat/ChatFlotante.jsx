"use client";
// ════════════════════════════════════════════════════════════════════════
// components/chat/ChatFlotante.jsx — El chat siempre a mano (Daniel, 17 oct)
//
// Una burbuja fija abajo a la derecha, en todas las pestañas del panel, con
// el conteo de no leídos. Al tocarla, un panel entra desde la derecha (subida
// suave) con las conversaciones; al elegir una, el chat ocupa el panel con
// «‹ Volver». Reemplaza a la pestaña «Mensajes»: los enlaces que llevaban a
// /dashboard/mensajes ahora abren este panel sin salir de donde se está.
//
// Usa las mismas piezas que la bandeja (components/chat/Bandeja,
// Conversacion) y la misma API (/api/conversaciones).
// ════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, X, ChevronLeft, Plane, Building2, Lock, UserRound } from "lucide-react";
import { T } from "@/lib/tema";
import { useMobile } from "@/context/MobileContext";
import Conversacion from "@/components/chat/Conversacion";
import { cuando, titulo, subtitulo } from "@/components/chat/Bandeja";

const RUTA_VIEJA = "/dashboard/mensajes";

export default function ChatFlotante({ rol = "usuaria", disponible = true, motivo }) {
  const { isMobile } = useMobile();
  const router = useRouter();
  const params = useSearchParams();
  const [abierto, setAbierto] = useState(false);
  // Sólo en el navegador: su posición depende del tamaño de pantalla y el
  // servidor no lo conoce (evita la diferencia de hidratación en el celular).
  const [montado, setMontado] = useState(false);
  useEffect(() => { setMontado(true); }, []);
  const [lista, setLista] = useState(null);
  const [activa, setActiva] = useState(null);
  const clave = (c) => `${c.tipo}-${c.id ?? "nueva"}-${c.candidata_id}`;

  const cargar = useCallback(async (enfocarId = null) => {
    const d = await fetch("/api/conversaciones").then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
    const l = d.conversaciones || [];
    setLista(l);
    if (enfocarId) { const c = l.find((x) => x.id === enfocarId); if (c) setActiva(clave(c)); }
  }, []);

  useEffect(() => { cargar(); const t = setInterval(() => cargar(), 60000); return () => clearInterval(t); }, [cargar]);

  // `?chat=1` (los correos y la ruta vieja) abre el panel.
  useEffect(() => { if (params?.get("chat")) setAbierto(true); }, [params]);

  // Un botón de cualquier pantalla puede pedirlo: window.dispatchEvent(new Event("dap:abrir-chat")).
  useEffect(() => {
    const abrir = () => setAbierto(true);
    window.addEventListener("dap:abrir-chat", abrir);
    return () => window.removeEventListener("dap:abrir-chat", abrir);
  }, []);

  // Cualquier enlace a la pestaña vieja abre el panel en vez de navegar.
  useEffect(() => {
    const interceptar = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href === RUTA_VIEJA || href?.startsWith(`${RUTA_VIEJA}?`)) { e.preventDefault(); setAbierto(true); }
    };
    document.addEventListener("click", interceptar, true);
    return () => document.removeEventListener("click", interceptar, true);
  }, []);

  // Escape cierra.
  useEffect(() => {
    if (!abierto) return;
    const k = (e) => { if (e.key === "Escape") setAbierto(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    if (params?.get("chat")) router.replace(window.location.pathname);
  };

  if (!montado) return null;

  const noLeidos = (lista || []).reduce((s, c) => s + (c.no_leidos || 0), 0);
  const abiertaConv = lista?.find((c) => clave(c) === activa) || null;
  const abrirConv = (c) => {
    setActiva(clave(c));
    setLista((l) => l.map((x) => (clave(x) === clave(c) ? { ...x, no_leidos: 0 } : x)));
  };

  // La candidata ve a sus contactos; la asociada y los demás, a la candidata.
  const icono = (c) => rol !== "usuaria"
    ? (c.candidata_foto
        ? <img src={c.candidata_foto} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        : <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{(c.candidata || "?").charAt(0)}</div>)
    : (
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.tipo === "equipo" ? T.gradIcon : c.tipo === "asociada" ? T.lilac : T.neutralBg, color: c.tipo === "equipo" ? "#fff" : c.tipo === "asociada" ? T.primary : T.neutral, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {c.tipo === "equipo" ? <Plane size={17} /> : c.tipo === "asociada" ? <UserRound size={17} /> : <Building2 size={17} />}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes chat-entra { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes chat-velo { from { opacity: 0; } to { opacity: 1; } }
        @keyframes chat-sube { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* La burbuja */}
      {!abierto && (
        <button type="button" onClick={() => setAbierto(true)} aria-label={noLeidos ? `Mensajes, ${noLeidos} sin leer` : "Mensajes"}
          style={{ position: "fixed", right: isMobile ? 16 : 28, bottom: isMobile ? 86 : 28, zIndex: 900, width: 58, height: 58, borderRadius: "50%", border: "none",
                   background: T.gradIcon, color: "#fff", cursor: "pointer", boxShadow: "0 10px 28px rgba(125,47,71,.35)", display: "flex", alignItems: "center", justifyContent: "center",
                   animation: "chat-sube .35s cubic-bezier(.22,1,.36,1) both" }}>
          <MessageCircle size={25} />
          {noLeidos > 0 && (
            <span style={{ position: "absolute", top: -2, right: -2, minWidth: 22, height: 22, borderRadius: 99, background: "#fff", color: T.primary, fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", boxShadow: "0 2px 6px rgba(0,0,0,.15)", fontFamily: T.font }}>
              {noLeidos}
            </span>
          )}
        </button>
      )}

      {/* El panel desde la derecha */}
      {abierto && (
        <>
          <div onClick={cerrar} style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(58,37,48,.28)", animation: "chat-velo .25s ease both" }} />
          <aside role="dialog" aria-label="Mensajes"
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 960, width: isMobile ? "100%" : 420, background: "#fff", boxShadow: "-12px 0 40px rgba(58,37,48,.18)",
                     display: "flex", flexDirection: "column", fontFamily: T.font, color: T.text, borderTopLeftRadius: isMobile ? 0 : 22, borderBottomLeftRadius: isMobile ? 0 : 22,
                     animation: "chat-entra .38s cubic-bezier(.22,1,.36,1) both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 18px 14px", borderBottom: `1px solid ${T.softLine}` }}>
              {abiertaConv && (
                <button type="button" onClick={() => setActiva(null)} aria-label="Volver a las conversaciones"
                  style={{ border: "none", background: T.lilac, color: T.primary, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ChevronLeft size={17} />
                </button>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{abiertaConv ? titulo(abiertaConv, rol) : "Mensajes"}</div>
                <div style={{ fontSize: 12, color: T.textSoft }}>{abiertaConv ? subtitulo(abiertaConv, rol) : (rol === "usuaria" ? "Tu equipo, tu asesora y tu agencia" : "Tus conversaciones con tus candidatas")}</div>
              </div>
              <button type="button" onClick={cerrar} aria-label="Cerrar mensajes"
                style={{ border: "none", background: "transparent", color: T.ink, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <X size={20} />
              </button>
            </div>

            {!disponible && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "12px 18px 0", padding: "10px 12px", borderRadius: 12, background: T.lilac, color: T.primary, fontSize: 12.5, lineHeight: 1.45 }}>
                <Lock size={15} style={{ flexShrink: 0 }} />
                {motivo || "Puedes leer tus mensajes; para responder, completa el pago de tu programa."}
              </div>
            )}
            {abiertaConv ? (
              <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <Conversacion key={clave(abiertaConv)} conv={abiertaConv} onCambio={(id) => cargar(id)} vacio="Aún no hay mensajes." />
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {lista === null && <div style={{ padding: 20, fontSize: 13, color: T.textSoft }}>Cargando…</div>}
                {lista && !lista.length && (
                  <div style={{ padding: 22, fontSize: 13, color: T.textSoft, lineHeight: 1.6 }}>
                    {rol === "usuaria" ? "Todavía no tienes conversaciones." : "Todavía no tienes conversaciones con tus candidatas."}
                  </div>
                )}
                {(lista || []).map((c) => (
                  <button key={clave(c)} type="button" onClick={() => abrirConv(c)}
                    style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", textAlign: "left", border: "none", borderBottom: `1px solid ${T.softLine}`, background: "#fff", padding: "14px 18px", cursor: "pointer", fontFamily: T.font }}>
                    {icono(c)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titulo(c, rol)}</span>
                        <span style={{ fontSize: 11, color: T.textSoft, flexShrink: 0 }}>{cuando(c.ultimo_at)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginTop: 2 }}>
                        <span style={{ fontSize: 12.5, color: T.textSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.ultimo || subtitulo(c, rol)}</span>
                        {c.no_leidos > 0 && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: T.primary, borderRadius: 999, padding: "1px 7px", flexShrink: 0 }}>{c.no_leidos}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
