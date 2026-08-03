// components/dashboard/DashboardWidgets.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Componentes compartidos entre Dashboard, Mi Destino Au Pair y Curso.
// Importa lo que necesites:
//   import { StepCircle, HelpCard, PASO_META, PASOS_DEFAULT } from "@/components/dashboard/DashboardWidgets";
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { Lock, CheckCircle2, BookOpen, UserCheck, Building2, Heart, FileCheck, Plane, MessageCircle, Headphones } from "lucide-react";

/* ─── Paleta por paso ─────────────────────────────────────────────────────── */
export const PASO_META = {
  curso:             { icon: BookOpen,  color: "#059669", bg: "#d1fae5", ring: "#6ee7b7", ringLocked: "#e5f7f0" },
  evaluacion_perfil: { icon: UserCheck, color: "#d97706", bg: "#fef3c7", ring: "#fcd34d", ringLocked: "#fef9e7" },
  perfil_agencia:    { icon: Building2, color: "#7c3aed", bg: "#ede9fe", ring: "#c4b5fd", ringLocked: "#f3f0fe" },
  match:             { icon: Heart,     color: "#be185d", bg: "#fce7f3", ring: "#f9a8d4", ringLocked: "#fdf0f8" },
  visa:              { icon: FileCheck, color: "#1d4ed8", bg: "#dbeafe", ring: "#93c5fd", ringLocked: "#eff6ff" },
  viaje:             { icon: Plane,     color: "#9f1239", bg: "#fce8ed", ring: "#fda4af", ringLocked: "#fff1f3" },
};

export const STATUS_CFG = {
  completado:  { textColor: "#10b981" },
  en_revision: { textColor: "#d97706" },
  disponible:  { textColor: "#a0435f" },
  bloqueado:   { textColor: "#9ca3af" },
};

export const PASOS_DEFAULT = [
  { id:"curso",             label:"Curso",                 status:"disponible" },
  { id:"evaluacion_perfil", label:"Evaluación de perfil",  status:"bloqueado"  },
  { id:"perfil_agencia",    label:"Perfil con la agencia", status:"bloqueado"  },
  { id:"match",             label:"Match",                 status:"bloqueado"  },
  { id:"visa",              label:"Visa",                  status:"bloqueado"  },
  { id:"viaje",             label:"Viaje",                 status:"bloqueado"  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   StepCircle
   Props:
     paso    — { id, label, status }
     index   — número 0-5
     isLast  — boolean (no renderiza conector)
   
   Uso en JSX:
     <div style={{ display:"flex", alignItems:"flex-start", width:"100%", overflowX:"auto" }}>
       {pasos.map((p,i) => <StepCircle key={p.id} paso={p} index={i} isLast={i===pasos.length-1} />)}
     </div>
───────────────────────────────────────────────────────────────────────────── */
export function StepCircle({ paso, index, isLast }) {
  const meta   = PASO_META[paso.id] || PASO_META.curso;
  const cfg    = STATUS_CFG[paso.status] || STATUS_CFG.bloqueado;
  const Icon   = meta.icon;
  const locked = paso.status === "bloqueado";
  const done   = paso.status === "completado";

  const borderColor = locked ? meta.ringLocked : meta.ring;

  return (
    <div style={{ display:"flex", alignItems:"flex-start", flex: isLast ? "0 0 auto" : "1 1 0", minWidth:0 }}>
      {/* Círculo + etiqueta */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, width:80 }}>
        <div style={{ position:"relative" }}>
          <div style={{
            width:52, height:52, borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
            border:`2.5px solid ${borderColor}`,
            boxShadow: locked ? "none" : `0 0 0 4px ${meta.bg}`,
            background: locked ? "#f5f5f5" : meta.bg,
            transition:"all .2s",
          }}>
            {locked  ? <Lock size={16} style={{ color:"#d1d5db" }} />
             : done  ? <CheckCircle2 size={23} style={{ color:meta.color }} />
             : <Icon size={20} style={{ color:meta.color }} />}
          </div>
          {/* Punto naranja para en_revision */}
          {paso.status === "en_revision" && (
            <span style={{ position:"absolute", top:-2, right:-2, width:11, height:11, borderRadius:"50%", background:"#f59e0b", border:"2px solid #fff" }} />
          )}
          {/* Punto de color para disponible */}
          {paso.status === "disponible" && !done && (
            <span style={{ position:"absolute", top:-2, right:-2, width:11, height:11, borderRadius:"50%", background:meta.color, border:"2px solid #fff" }} />
          )}
        </div>

        <p style={{ fontSize:10.5, fontWeight:600, color:"#1e1033", textAlign:"center", lineHeight:1.2, margin:0, maxWidth:78 }}>
          {index+1}. {paso.label}
        </p>
        <p style={{ fontSize:9.5, fontWeight:600, color:cfg.textColor, margin:0, textAlign:"center" }}>
          {done          ? "Completado"
           : paso.status === "en_revision" ? "Pendiente"
           : locked      ? "Bloqueado"
           :               "En progreso"}
        </p>
        {locked && <Lock size={8} style={{ color:"#d1d5db" }} />}
      </div>

      {/* Conector punteado — ocupa el espacio entre pasos */}
      {!isLast && (
        <div style={{
          flex:1,
          borderTop:"2px dashed",
          borderColor: done ? meta.ring : "#e5e7eb",
          marginTop:26,
          alignSelf:"flex-start",
        }} />
      )}
    </div>
  );
}

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

/* ─────────────────────────────────────────────────────────────────────────────
   RoadmapCard  — envuelve el roadmap completo (title + steps)
   Props:
     pasos  — array de pasos
   
   Uso:
     <RoadmapCard pasos={pasos} />
───────────────────────────────────────────────────────────────────────────── */
export function RoadmapCard({ pasos }) {
  return (
    <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:"20px 24px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
      <h2 style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:"#1e1033", margin:"0 0 18px" }}>
        Mi Destino Au Pair
      </h2>
      <div style={{ display:"flex", alignItems:"flex-start", width:"100%", overflowX:"auto" }}>
        {pasos.map((p,i) => (
          <StepCircle key={p.id} paso={p} index={i} isLast={i===pasos.length-1} />
        ))}
      </div>
    </div>
  );
}