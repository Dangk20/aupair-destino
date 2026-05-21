"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlayCircle, Lock, CheckCircle2, BookOpen, UserCheck,
  Building2, Heart, FileCheck, Plane, Clock, MessageCircle,
  Award, ArrowRight, Bell, Calendar, Headphones,
} from "lucide-react";

/* ─── Config ──────────────────────────────────────────────────────────────── */
const PASO_META = {
  curso:             { icon: BookOpen,  color: "#059669", bg: "#d1fae5", ring: "#6ee7b7", ringLocked: "#d1fae5" },
  evaluacion_perfil: { icon: UserCheck, color: "#d97706", bg: "#fef3c7", ring: "#fcd34d", ringLocked: "#fef3c7" },
  perfil_agencia:    { icon: Building2, color: "#7c3aed", bg: "#ede9fe", ring: "#c4b5fd", ringLocked: "#ede9fe" },
  match:             { icon: Heart,     color: "#be185d", bg: "#fce7f3", ring: "#f9a8d4", ringLocked: "#fce7f3" },
  visa:              { icon: FileCheck, color: "#1d4ed8", bg: "#dbeafe", ring: "#93c5fd", ringLocked: "#dbeafe" },
  viaje:             { icon: Plane,     color: "#9f1239", bg: "#fce8ed", ring: "#fda4af", ringLocked: "#fce8ed" },
};

const STATUS_CFG = {
  completado:  { textColor: "#10b981" },
  en_revision: { textColor: "#d97706" },
  disponible:  { textColor: "#a0435f" },
  bloqueado:   { textColor: "#9ca3af" },
};

const PASOS_DEFAULT = [
  { id:"curso",             label:"Curso",                 status:"disponible" },
  { id:"evaluacion_perfil", label:"Evaluación de perfil",  status:"bloqueado"  },
  { id:"perfil_agencia",    label:"Perfil con la agencia", status:"bloqueado"  },
  { id:"match",             label:"Match",                 status:"bloqueado"  },
  { id:"visa",              label:"Visa",                  status:"bloqueado"  },
  { id:"viaje",             label:"Viaje",                 status:"bloqueado"  },
];

/* ─── Donut progress ─────────────────────────────────────────────────────── */
function DonutProgress({ porcentaje = 0 }) {
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (porcentaje / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e8f8" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none"
        stroke="url(#grad2)" strokeWidth="12"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition:"stroke-dasharray .8s ease" }}
      />
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a0435f" />
        </linearGradient>
      </defs>
      <text x="70" y="63" textAnchor="middle" fill="#1e1033"
        style={{ fontSize:22, fontWeight:700, fontFamily:"Georgia,serif" }}>{porcentaje}%</text>
      <text x="70" y="82" textAnchor="middle" fill="#9a7080"
        style={{ fontSize:11, fontFamily:"system-ui" }}>Completado</text>
    </svg>
  );
}

/* ─── Roadmap step ──────────────────────────────────────────────────────── */
function StepCircle({ paso, index, isLast }) {
  const meta   = PASO_META[paso.id] || PASO_META.curso;
  const cfg    = STATUS_CFG[paso.status] || STATUS_CFG.bloqueado;
  const Icon   = meta.icon;
  const locked = paso.status === "bloqueado";
  const done   = paso.status === "completado";

  // ── FIX: borde del mismo color que el bg pero más oscuro/saturado ──────────
  const borderColor = locked
    ? meta.ringLocked          // muysuave cuando está bloqueado
    : meta.ring;               // tono más vivo del mismo color cuando activo

  return (
    <div style={{ display:"flex", alignItems:"flex-start", flex: isLast ? "0 0 auto" : "1 1 0", minWidth:0 }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, width:80 }}>
        <div style={{ position:"relative" }}>
          <div style={{
            width:52, height:52, borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
            /* ── borde 2.5px con el color derivado del bg ── */
            border: `2.5px solid ${borderColor}`,
            /* ── sombra sutil del mismo tono ── */
            boxShadow: locked ? "none" : `0 0 0 4px ${meta.bg}`,
            background: locked ? "#f5f5f5" : meta.bg,
            transition: "all .2s",
          }}>
            {locked  ? <Lock size={16} style={{ color:"#d1d5db" }} />
             : done  ? <CheckCircle2 size={23} style={{ color:meta.color }} />
             : <Icon size={20} style={{ color:meta.color }} />}
          </div>
          {paso.status === "en_revision" && (
            <span style={{ position:"absolute", top:-2, right:-2, width:11, height:11, borderRadius:"50%", background:"#f59e0b", border:"2px solid #fff" }} />
          )}
          {paso.status === "disponible" && !done && (
            <span style={{ position:"absolute", top:-2, right:-2, width:11, height:11, borderRadius:"50%", background:meta.color, border:"2px solid #fff" }} />
          )}
        </div>
        <p style={{ fontSize:10.5, fontWeight:600, color:"#1e1033", textAlign:"center", lineHeight:1.2, margin:0, maxWidth:78 }}>
          {index+1}. {paso.label}
        </p>
        <p style={{ fontSize:9.5, fontWeight:600, color:cfg.textColor, margin:0, textAlign:"center" }}>
          {done?"Completado": paso.status==="en_revision"?"Pendiente": locked?"Bloqueado":"En progreso"}
        </p>
        {locked && <Lock size={8} style={{ color:"#d1d5db" }} />}
      </div>
      {!isLast && (
        <div style={{ flex:1, borderTop:"2px dashed", borderColor: done ? meta.ring : "#e5e7eb", marginTop:26, alignSelf:"flex-start" }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function CursoPage() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [sesData, setSesData] = useState(null);
  const [proceso, setProceso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p, fb=null) =>
      p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),            { user:null }),
      safe(fetch("/api/dashboard/sesiones"), null),
      safe(fetch("/api/dashboard/proceso"),  null),
    ]).then(([me, ses, proc]) => {
      setUser(me?.user||null); setSesData(ses); setProceso(proc); setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  const { completadas=0, total=0, sesiones=[] } = sesData||{};
  const pasos          = proceso?.pasos?.length>0 ? proceso.pasos : PASOS_DEFAULT;
  const porcentajeProg = proceso?.porcentaje_curso || sesData?.porcentaje || 0;
  // Por esto:
const sesionActual      = sesiones.find(s => s.estado === "available");
const primeraSesion     = sesiones[0];
// ── La SIGUIENTE sesión siempre existe (disponible o bloqueada) ──
const ultimaCompletada  = [...sesiones].reverse().find(s => s.estado === "completed");
const idxSiguiente      = ultimaCompletada
  ? sesiones.findIndex(s => s.id === ultimaCompletada.id) + 1
  : 0;
const siguienteSesion   = sesiones[idxSiguiente] || null;
  const cursoCompleto  = total>0 && completadas>=total;
  const mostrarNotif   = completadas===0 && sesiones.length>0;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .ses-row:hover{ background:#faf5ff!important; }
      `}</style>

      {/* TOP HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ece8f0", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, position:"sticky", top:0, zIndex:20 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#1e1033", margin:0 }}>
            ¡Hola, {user?.nombre}! 👋
          </h1>
          <p style={{ fontSize:13, color:"#9a7080", margin:"2px 0 0" }}>
            {sesionActual ? `Continúa con ${sesionActual.titulo}` : cursoCompleto ? "¡Completaste el programa! 🎉" : "Comienza tu primera sesión"} 💜
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <button style={{ position:"relative", padding:8, borderRadius:12, border:"1px solid #ece4f0", background:"#fff", cursor:"pointer" }}>
            <Bell size={17} style={{ color:"#9a7080" }} />
            <span style={{ position:"absolute", top:6, right:6, width:7, height:7, background:"#a0435f", borderRadius:"50%", border:"1.5px solid #fff" }} />
          </button>
          <Link href="/dashboard/reuniones" style={{ display:"flex", alignItems:"center", gap:6, border:"1.5px solid #e0d0e8", color:"#6b4a70", fontSize:13, fontWeight:500, padding:"8px 14px", borderRadius:12, textDecoration:"none", background:"#fff" }}>
            <Calendar size={14} /> Agendar reunión
          </Link>
          <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", gap:6, background:"#5b21b6", color:"#fff", fontSize:13, fontWeight:600, padding:"9px 16px", borderRadius:12, textDecoration:"none" }}>
            Ver mi proceso completo <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"20px 24px 40px", display:"flex", gap:20 }}>
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>

          {/* ROADMAP */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:"20px 24px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:"#1e1033", margin:"0 0 18px" }}>Mi Destino Au Pair</h2>
            <div style={{ display:"flex", alignItems:"flex-start", width:"100%", overflowX:"auto" }}>
              {pasos.map((p,i) => (
                <StepCircle key={p.id} paso={p} index={i} isLast={i===pasos.length-1} />
              ))}
            </div>
          </div>

          {/* NOTIFICATION */}
          {mostrarNotif && primeraSesion && (
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:16, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <Clock size={16} style={{ color:"#d97706", flexShrink:0, marginTop:2 }} />
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:"0 0 2px" }}>
                    Completa la sesión de bienvenida para desbloquear el resto del curso.
                  </p>
                  <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>
                    Es 100% gratuita. Después podrás ver el contenido completo y continuar tu proceso.
                  </p>
                </div>
              </div>
              <Link href={`/dashboard/sesion/${primeraSesion.id}`}
                style={{ fontSize:12, fontWeight:600, color:"#a0435f", textDecoration:"none", border:"1px solid #f0dde2", padding:"7px 16px", borderRadius:10, background:"#fff", whiteSpace:"nowrap", flexShrink:0 }}>
                Ver detalles
              </Link>
            </div>
          )}

          {/* ── PAYWALL: aparece cuando completó la gratis pero no tiene acceso ── */}
{!user?.tiene_acceso && completadas >= 1 && (
  <div style={{
    background:"linear-gradient(135deg,#a0435f,#c9607a)",
    borderRadius:20, padding:"20px 24px",
    display:"flex", alignItems:"center", justifyContent:"space-between", gap:16,
    boxShadow:"0 8px 24px rgba(160,67,95,.25)",
    flexWrap:"wrap",
  }}>
    <div style={{ position:"relative" }}>
      {/* círculo decorativo */}
      <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.08)" }} />
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
        <span style={{ fontSize:13 }}>✨</span>
        <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.8)", textTransform:"uppercase", letterSpacing:".8px", margin:0 }}>
          Desbloquea el programa completo
        </p>
      </div>
      <p style={{ fontSize:15, fontWeight:600, color:"#fff", margin:0 }}>
        Accede a las <strong>{total - 1} sesiones restantes</strong> por solo{" "}
        <span style={{ color:"#fce8ed", fontWeight:700 }}>$35 USD</span>
      </p>
      <p style={{ fontSize:12, color:"rgba(255,255,255,.65)", margin:"4px 0 0" }}>
        Pago único · Acceso durante tu proceso · Certificado incluido
      </p>
    </div>
    <Link href="/pago" style={{
      flexShrink:0,
      background:"#fff", color:"#a0435f",
      fontSize:13, fontWeight:700,
      padding:"12px 24px", borderRadius:14,
      textDecoration:"none",
      boxShadow:"0 4px 12px rgba(0,0,0,.15)",
      whiteSpace:"nowrap",
    }}>
      Pagar ahora →
    </Link>
  </div>
)}

          {/* SESSION LIST */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", boxShadow:"0 1px 4px rgba(0,0,0,.04)", overflow:"hidden" }}>
            <div style={{ padding:"16px 24px 14px", borderBottom:"1px solid #f5eef8" }}>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#1e1033", margin:0 }}>Sesiones del curso</h2>
            </div>
            <div>
              {sesiones.length===0 ? (
                <div style={{ padding:"40px 24px", textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>📚</div>
                  <p style={{ fontSize:14, color:"#9a7080", margin:0 }}>Las sesiones aparecerán aquí pronto.</p>
                </div>
              ) : sesiones.map((s,i) => {
                const available = s.estado==="available";
                const completed = s.estado==="completed";
                const locked    = s.estado==="locked";
                const isGratis  = s.es_gratis===1||s.es_gratis===true;
                return (
                  <div key={s.id} className="ses-row"
                    style={{ display:"flex", alignItems:"center", gap:16, padding:"15px 24px", borderBottom:i<sesiones.length-1?"1px solid #f8f4fc":"none", cursor:locked?"default":"pointer", background:available?"#faf5ff":"#fff", transition:"background .12s" }}
                    onClick={()=>!locked&&router.push(`/dashboard/sesion/${s.id}`)}>
                    <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700,
                      background:completed?"#d1fae5":available?"#a0435f":"#f3f4f6",
                      color:completed?"#10b981":available?"#fff":"#9ca3af",
                    }}>
                      {completed ? <CheckCircle2 size={18} style={{ color:"#10b981" }}/> : i+1}
                    </div>
                    <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                      background:completed?"#d1fae5":available?"#fce8ed":"#f3f4f6",
                    }}>
                      {completed ? <CheckCircle2 size={16} style={{ color:"#10b981" }}/> : available ? <PlayCircle size={16} style={{ color:"#a0435f" }}/> : <Lock size={14} style={{ color:"#d1d5db" }}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                        {isGratis && (
                          <span style={{ fontSize:9, fontWeight:700, background:"#fce8ed", color:"#a0435f", padding:"2px 8px", borderRadius:99, textTransform:"uppercase", letterSpacing:".5px", flexShrink:0 }}>GRATIS</span>
                        )}
                        <p style={{ fontSize:14, fontWeight:600, color:locked?"#9ca3af":"#1e1033", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {s.titulo}
                        </p>
                      </div>
                      {s.descripcion && (
                        <p style={{ fontSize:12, color:locked?"#c0c0c0":"#9a7080", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {s.descripcion}
                        </p>
                      )}
                    </div>
                    {s.duracion && <span style={{ fontSize:11, color:"#b0909a", whiteSpace:"nowrap", flexShrink:0 }}>{s.duracion}</span>}
                    {locked ? (
                      <div style={{ fontSize:12, fontWeight:500, color:"#9ca3af", background:"#f3f4f6", border:"1px solid #e5e7eb", padding:"8px 16px", borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", gap:5 }}>
                        <Lock size={11}/> Bloqueado
                      </div>
                    ) : completed ? (
                      <div style={{ fontSize:12, fontWeight:600, color:"#10b981", background:"#d1fae5", padding:"8px 16px", borderRadius:10, flexShrink:0 }}>
                        ✓ Completada
                      </div>
                    ) : (
                      <button onClick={e=>{e.stopPropagation();router.push(`/dashboard/sesion/${s.id}`);}}
                        style={{ fontSize:13, fontWeight:600, color:"#fff", background:"#a0435f", border:"none", padding:"9px 20px", borderRadius:10, cursor:"pointer", flexShrink:0, boxShadow:"0 2px 8px rgba(160,67,95,.25)" }}>
                        {i===0&&completadas===0?"Comenzar":"Continuar"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>

          {/* Progreso */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.04)", textAlign:"center" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:"0 0 16px", textAlign:"left" }}>Tu progreso en el curso</h3>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
              <DonutProgress porcentaje={porcentajeProg} />
            </div>
            <p style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#1e1033", margin:"0 0 2px" }}>
              {completadas} de {total}
            </p>
            <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 16px" }}>Sesiones completadas</p>
            {cursoCompleto ? (
              <Link href="/dashboard/certificado" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"1.5px solid #ede9fe", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none", background:"#fff" }}>
                <Award size={14}/> Ver mi certificado
              </Link>
            ) : (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"1.5px solid #e5e7eb", color:"#b0b0b0", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, background:"#f9f9f9", cursor:"not-allowed" }}
                title={`Completa las ${total} sesiones para desbloquear`}>
                <Lock size={13} style={{ color:"#c0c0c0" }}/> Ver mi certificado
                <span style={{ fontSize:10, color:"#c0c0c0" }}>({completadas}/{total})</span>
              </div>
            )}
          </div>

{/* Próximo paso */}
<div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
    <div style={{ width:28, height:28, borderRadius:9, background:"#f5f0ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎯</div>
    <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>Próximo paso</h3>
  </div>

  {cursoCompleto ? (
    <>
      <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:"0 0 10px" }}>¡Completaste todas las sesiones! 🎉</p>
      <Link href="/dashboard/certificado" style={{ display:"block", textAlign:"center", background:"#10b981", color:"#fff", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
        Ver mi certificado
      </Link>
    </>
  ) : siguienteSesion ? (
    <>
      {/* Número + título */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700,
          background: siguienteSesion.estado === "locked" ? "#f3f4f6" : "#fce8ed",
          color: siguienteSesion.estado === "locked" ? "#9ca3af" : "#a0435f",
        }}>
          {sesiones.findIndex(s => s.id === siguienteSesion.id) + 1}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#1e1033", margin:0, lineHeight:1.3 }}>{siguienteSesion.titulo}</p>
          {siguienteSesion.descripcion && (
            <p style={{ fontSize:11, color:"#9a7080", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {siguienteSesion.descripcion}
            </p>
          )}
        </div>
      </div>

      {siguienteSesion.estado === "locked" ? (
        <div style={{ background:"#fef3c7", borderRadius:10, padding:"8px 12px", marginBottom:10, fontSize:11, color:"#d97706" }}>
          🔒 Esta sesión requiere desbloquear el programa
        </div>
      ) : null}

      <Link
        href={siguienteSesion.estado === "locked" ? "/pago" : `/dashboard/sesion/${siguienteSesion.id}`}
        style={{ display:"block", textAlign:"center", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none",
          background: siguienteSesion.estado === "locked" ? "#a0435f" : "#5b21b6",
          color: "#fff",
        }}>
        {siguienteSesion.estado === "locked" ? "🔓 Desbloquear sesión" : "▶ Comenzar sesión"}
      </Link>
    </>
  ) : (
    <p style={{ fontSize:13, color:"#9a7080", margin:0 }}>Las sesiones aparecerán pronto.</p>
  )}
</div>

          {/* ── FIX: Help card con fondo degradado y diseño de soporte ── */}
          <div style={{
            borderRadius:20, overflow:"hidden",
            boxShadow:"0 4px 16px rgba(160,67,95,.18)",
            position:"relative",
          }}>
            {/* Fondo degradado rosa oscuro */}
            <div style={{
              background:"linear-gradient(135deg, #a0435f 0%, #c9607a 60%, #e8849a 100%)",
              padding:"20px 18px 0",
              position:"relative",
            }}>
              {/* Círculos decorativos */}
              <div style={{ position:"absolute", top:-14, right:-14, width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,.10)" }} />
              <div style={{ position:"absolute", top:10, right:20, width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.08)" }} />

              {/* Icono soporte */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, position:"relative", zIndex:1 }}>
                <div style={{ width:36, height:36, borderRadius:12, background:"rgba(255,255,255,.2)", border:"1.5px solid rgba(255,255,255,.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Headphones size={18} style={{ color:"#fff" }} />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#fff", margin:0 }}>¿Necesitas ayuda?</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,.75)", margin:0 }}>Estamos aquí para ti 💕</p>
                </div>
              </div>

              {/* Emoji ilustración */}
              <div style={{ textAlign:"right", fontSize:42, lineHeight:1, marginBottom:-8, position:"relative", zIndex:1, opacity:.9 }}>
                🎈
              </div>
            </div>

            {/* Parte blanca con el botón */}
            <div style={{ background:"#fff", padding:"14px 18px 16px", borderTop:"none" }}>
              <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 12px", lineHeight:1.5 }}>
                Escríbenos y te respondemos lo antes posible.
              </p>
              <button style={{
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

        </aside>
      </div>
    </div>
  );
}