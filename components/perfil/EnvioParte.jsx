"use client";
// ════════════════════════════════════════════════════════════════════════
// components/perfil/EnvioParte.jsx — Enviar una parte del perfil, y lo que se
// ve después
//
// Enviar cierra la parte: desde ahí la candidata sólo cambia lo que el equipo
// le reabra con una observación (R3). Por eso se confirma antes, diciéndolo, y
// por eso el formulario de una parte enviada no se vuelve a mostrar: lo que
// haya que corregir se corrige desde su perfil, junto a la observación.
// ════════════════════════════════════════════════════════════════════════
import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";
import { T } from "@/lib/tema";

/** POST /api/dashboard/perfil/enviar. Devuelve { ok, error }. */
export async function enviarParte(parte) {
  const res  = await fetch("/api/dashboard/perfil/enviar", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parte }),
  }).catch(() => null);
  const data = await res?.json().catch(() => ({})) || {};
  return { ok: !!res?.ok, error: data.error || "No se pudo enviar." };
}

/** Diálogo de confirmación antes de enviar. */
export function ConfirmarEnvio({ parte, enviando, onConfirmar, onCancelar }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirmar-envio-titulo"
      style={{ position:"fixed", inset:0, background:"rgba(58,37,48,.45)", zIndex:1000,
               display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:T.card, borderRadius:22, maxWidth:420, width:"100%", padding:"28px 24px",
                    textAlign:"center", fontFamily:T.font, boxShadow:"0 24px 48px rgba(58,37,48,.25)" }}>
        <div style={{ width:64, height:64, borderRadius:18, background:T.lilac, color:T.primary,
                      display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          <Send size={28} />
        </div>
        <h2 id="confirmar-envio-titulo" style={{ fontSize:20, fontWeight:700, color:T.ink, margin:"0 0 8px" }}>
          ¿Enviar la Parte {parte}?
        </h2>
        <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.6, margin:"0 0 22px" }}>
          Nuestro equipo la va a revisar. Después de enviarla <strong style={{ color:T.ink }}>ya no podrás
          editarla</strong>: si algo hay que corregir, te lo pediremos y podrás cambiar justo eso.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button type="button" onClick={onConfirmar} disabled={enviando}
            style={{ width:"100%", padding:"13px 18px", borderRadius:14, border:"none", background:T.primary,
                     color:"#fff", fontFamily:T.font, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            {enviando ? "Enviando…" : `Sí, enviar la Parte ${parte}`}
          </button>
          <button type="button" onClick={onCancelar} disabled={enviando}
            style={{ width:"100%", padding:"12px 18px", borderRadius:14, border:"none", background:"#fff",
                     color:T.textSoft, fontFamily:T.font, fontWeight:600, fontSize:14, cursor:"pointer" }}>
            Seguir revisando
          </button>
        </div>
      </div>
    </div>
  );
}

/** Pantalla del formulario de una parte ya enviada. */
export function ParteEnviada({ parte, fecha }) {
  const cuando = fecha
    ? new Date(fecha).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" })
    : null;
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", gap:16, padding:32, textAlign:"center", fontFamily:T.font }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:T.greenBg, color:T.green,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
        <CheckCircle2 size={32} />
      </div>
      <h2 style={{ fontSize:22, fontWeight:700, color:T.text, margin:0 }}>Enviaste tu Parte {parte}</h2>
      <p style={{ color:T.textSoft, fontSize:14, maxWidth:380, margin:0, lineHeight:1.7 }}>
        {cuando ? <>La enviaste el {cuando}. </> : null}
        Nuestro equipo la está revisando. Si necesitamos que corrijas algo, lo verás en tu perfil
        junto a lo que hay que cambiar.
      </p>
      <Link href="/dashboard/perfil"
        style={{ background:T.primary, color:"#fff", fontSize:13, fontWeight:600, padding:"12px 28px",
                 borderRadius:14, textDecoration:"none" }}>
        Ir a mi perfil →
      </Link>
    </div>
  );
}
