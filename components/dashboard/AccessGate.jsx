"use client";
// components/dashboard/AccessGate.jsx
// Candado unificado de los módulos pagos. 3 estados:
//   c) con acceso              → renderiza el contenido (children)
//   a) sin acceso, sin venta   → invita a pagar el acompañamiento
//   b) sin acceso, venta pend. → "Estamos preparando tu acceso"
//
// Uso en una página:
//   const gate = useAccessGate("mensajes");
//   if (gate.loading) return <GateLoading/>;
//   if (!gate.access) return <GateScreen estado={gate.estado} titulo="Mensajes"/>;
//   ...contenido normal...

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Clock, ArrowRight, Sparkles } from "lucide-react";
import { T } from "@/lib/tema-candidata";

// Pantalla "próximamente" — para módulos aún no habilitados (calendario,
// mensajería in-app, recursos). Bloquea la interacción con el contenido.
export function ComingSoon({ titulo = "Esta sección", detalle }) {
  const router = useRouter();
  return (
    <div style={{ minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 18px", fontFamily:T.font }}>
      <div style={{ maxWidth:440, textAlign:"center" }}>
        <div style={{ width:76, height:76, borderRadius:22, background:T.gradIcon, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <Sparkles size={32}/>
        </div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:T.lilac, color:T.primary, fontWeight:700, fontSize:11.5, letterSpacing:".06em", padding:"6px 12px", borderRadius:20, marginBottom:12 }}>PRÓXIMAMENTE</div>
        <h2 style={{ fontSize:22, fontWeight:700, color:T.ink, margin:"0 0 8px" }}>{titulo} llega muy pronto</h2>
        <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.6, margin:"0 0 22px" }}>
          {detalle || "Estamos preparando esta sección para ti. Te avisaremos aquí en cuanto esté disponible."}
        </p>
        <button onClick={()=>router.push("/dashboard")} style={{ background:T.primary, color:"#fff", border:"none", borderRadius:14, padding:"13px 24px", fontFamily:T.font, fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 10px 22px rgba(160,67,95,.28)", display:"inline-flex", alignItems:"center", gap:8 }}>
          <ArrowRight size={16} style={{ transform:"scaleX(-1)" }}/> Volver al inicio
        </button>
      </div>
    </div>
  );
}

export function useAccessGate(modulo) {
  const [state, setState] = useState({ loading:true, access:false, estado:"invitar" });
  useEffect(() => {
    fetch("/api/dashboard/acceso")
      .then(r => r.json())
      .then(d => {
        const access = !!d[modulo];
        const estado = d.venta === "pendiente" ? "pendiente" : "invitar";
        setState({ loading:false, access, estado });
      })
      .catch(() => setState({ loading:false, access:false, estado:"invitar" }));
  }, [modulo]);
  return state;
}

export function GateLoading() {
  return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.font }}>
      <div style={{ width:40, height:40, border:`3px solid ${T.lilac}`, borderTopColor:T.primary, borderRadius:"50%", animation:"dapspin 1s linear infinite" }}/>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function GateScreen({ estado="invitar", titulo="Esta sección" }) {
  const router = useRouter();
  const pendiente = estado === "pendiente";

  return (
    <div style={{ minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 18px", fontFamily:T.font }}>
      <div style={{ maxWidth:420, textAlign:"center" }}>
        <div style={{ width:76, height:76, borderRadius:22, background: pendiente ? T.lilac : T.gradIcon, color: pendiente ? T.primary : "#fff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          {pendiente ? <Clock size={32}/> : <Lock size={32}/>}
        </div>

        {pendiente ? (
          <>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.ink, margin:"0 0 8px" }}>Estamos preparando tu acceso</h2>
            <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.6, margin:"0 0 22px" }}>
              Recibimos tu solicitud de pago. En cuanto confirmemos, se activará tu acompañamiento completo. Te avisaremos aquí y por correo.
            </p>
            <button onClick={()=>router.push("/dashboard")} style={{ background:"#fff", color:T.primary, border:`1.5px solid ${T.border}`, borderRadius:14, padding:"13px 24px", fontFamily:T.font, fontWeight:700, fontSize:14, cursor:"pointer" }}>
              Volver al inicio
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.ink, margin:"0 0 8px" }}>Activa tu acompañamiento</h2>
            <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.6, margin:"0 0 22px" }}>
              {titulo} es parte de tu acompañamiento. Actívalo para que te presentemos ante una agencia aliada y te guiemos hasta viajar.
            </p>
            <button onClick={()=>router.push("/pago")} style={{ background:T.primary, color:"#fff", border:"none", borderRadius:14, padding:"14px 26px", fontFamily:T.font, fontWeight:700, fontSize:14.5, cursor:"pointer", boxShadow:"0 10px 22px rgba(160,67,95,.28)", display:"inline-flex", alignItems:"center", gap:8 }}>
              Activar mi acompañamiento <ArrowRight size={17}/>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
