// components/dashboard/DashboardWidgets.jsx
// ─────────────────────────────────────────────────────────────────────────────
// La tarjeta de ayuda que comparten reuniones, recursos y mensajes.
//
// Aquí vivían también los pasos del proceso (PASO_META, PASOS_DEFAULT,
// StepCircle, RoadmapCard) con los ids viejos (evaluacion_perfil, match…).
// Nadie los importaba; se retiraron con el change `etapas-candidata`, que
// unifica el recorrido en lib/etapas-candidata.js.
// ─────────────────────────────────────────────────────────────────────────────

import { MessageCircle, Headphones } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   HelpCard  — card de soporte con fondo degradado rosado
   Props:
     onContact — función opcional al hacer clic en el botón (default: noop)
   
   Uso:
     <HelpCard />
     <HelpCard onContact={() => router.push("/dashboard/mensajes")} />
───────────────────────────────────────────────────────────────────────────── */
export function HelpCard({ onContact }) {
  return (
    <div style={{ borderRadius:20, overflow:"hidden", boxShadow:"0 4px 16px rgba(160,67,95,.18)", position:"relative" }}>
      {/* Cabecera degradado */}
      <div style={{ background:"linear-gradient(135deg,#a0435f 0%,#c9607a 60%,#e8849a 100%)", padding:"20px 18px 0", position:"relative" }}>
        {/* Círculos decorativos */}
        <div style={{ position:"absolute", top:-14, right:-14, width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,.10)" }} />
        <div style={{ position:"absolute", top:10,  right:20,  width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.08)" }} />

        {/* Icono + texto */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, position:"relative", zIndex:1 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:"rgba(255,255,255,.2)", border:"1.5px solid rgba(255,255,255,.35)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Headphones size={18} style={{ color:"#fff" }} />
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"#fff", margin:0 }}>¿Necesitas ayuda?</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.75)", margin:0 }}>Estamos aquí para ti 💕</p>
          </div>
        </div>

      </div>

      {/* Parte blanca con botón */}
      <div style={{ background:"#fff", padding:"14px 18px 16px" }}>
        <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 12px", lineHeight:1.5 }}>
          Escríbenos y te respondemos lo antes posible.
        </p>
        <button
          onClick={onContact}
          style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            width:"100%", border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,#a0435f,#c9607a)",
            color:"#fff", fontSize:12, fontWeight:600,
            padding:"10px", borderRadius:12,
            boxShadow:"0 3px 10px rgba(160,67,95,.3)",
          }}>
          <MessageCircle size={13}/> Escribir a soporte
        </button>
      </div>
    </div>
  );
}
