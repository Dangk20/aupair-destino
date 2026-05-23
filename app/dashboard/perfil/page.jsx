"use client";
// app/dashboard/perfil/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Calendar, ArrowRight, Lock, PlayCircle,
  ChevronRight, CheckCircle2, Clock, MessageCircle,
} from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";

/* ─── Secciones de la evaluación (para calcular progreso) ────────────────── */
const SECCIONES = [
  { id:"personal",    titulo:"Información personal",    campos:["cedula","telefono","fecha_nacimiento","ciudad","pais"] },
  { id:"habilidades", titulo:"Requisitos y habilidades", campos:["conoce_requisitos_26","conoce_requisitos_18_20","curso_primeros_auxilios","nivel_ingles","licencia_conduccion","habilidad_conduccion"] },
  { id:"situacion",   titulo:"Situación actual",         campos:["situacion_actual"] },
  { id:"salud",       titulo:"Salud",                    campos:["enfermedad_medicamentos","enfermedad_grave","depresion_panico","trastorno_alimenticio","autolesiones","abuso_sustancias","detalle_salud_mental","isotretinoina","condiciones_fisicas","alergia_medicamentos","dosis_covid","vacuna_covid"] },
  { id:"experiencia", titulo:"Experiencia con niños",    campos:["exp_ninos_externos","horas_exp_ninos"] },
  { id:"visas",       titulo:"Visas y compromisos",      campos:["visa_negada","visa_cancelada","familiar_residencia_usa","familiar_visa_estudio_usa","overstay_otro_pais","entiende_intercambio_cultural","consciente_riesgo_familiar","participo_programa_ap"] },
];

function seccionesCompletas(perfil) {
  if (!perfil) return 0;
  return SECCIONES.filter(s =>
    s.campos.every(c => perfil[c] && String(perfil[c]).trim() !== "")
  ).length;
}

/* ─── Mini roadmap (5 pasos del proceso de perfil) ──────────────────────── */
const PASOS_PERFIL = [
  { num:1, label:"Evaluación\nde perfil",     status:"en_progreso", color:"#ec4899", bg:"#fce7f3" },
  { num:2, label:"Perfil con\nla agencia",    status:"pendiente",   color:"#7c3aed", bg:"#ede9fe" },
  { num:3, label:"Match",                     status:"bloqueado",   color:"#9ca3af", bg:"#f3f4f6" },
  { num:4, label:"Visa",                      status:"bloqueado",   color:"#9ca3af", bg:"#f3f4f6" },
  { num:5, label:"Viaje",                     status:"bloqueado",   color:"#9ca3af", bg:"#f3f4f6" },
];

function MiniRoadmap({ pasos }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", width:"100%", overflowX:"auto" }}>
      {pasos.map((p, i) => {
        const isLast   = i === pasos.length - 1;
        const locked   = p.status === "bloqueado";
        const done     = p.status === "completado";
        const active   = p.status === "en_progreso";
        const pending  = p.status === "pendiente";
        return (
          <div key={p.num} style={{ display:"flex", alignItems:"flex-start", flex: isLast ? "0 0 auto" : "1 1 0", minWidth:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, width:80 }}>
              {/* Círculo */}
              <div style={{
                width:52, height:52, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: locked ? "#f3f4f6" : p.bg,
                border: locked ? "2px solid #e5e7eb" : `2.5px solid ${p.color}`,
                boxShadow: active ? `0 0 0 4px ${p.bg}` : "none",
              }}>
                {locked
                  ? <Lock size={16} style={{ color:"#d1d5db" }} />
                  : done
                  ? <CheckCircle2 size={22} style={{ color:p.color }} />
                  : <span style={{ fontSize:18, fontWeight:800, color:p.color, fontFamily:"Georgia,serif" }}>{p.num}</span>
                }
              </div>
              {/* Label */}
              <p style={{ fontSize:10.5, fontWeight:600, color:"#1e1033", textAlign:"center", lineHeight:1.3, margin:0, whiteSpace:"pre-line", maxWidth:76 }}>
                {p.label}
              </p>
              {/* Status text */}
              <p style={{ fontSize:9.5, fontWeight:600, margin:0, color:
                active  ? "#ec4899" :
                pending ? "#7c3aed" : "#9ca3af"
              }}>
                {active?"En progreso": pending?"Pendiente": locked?"Bloqueado": "Completado"}
              </p>
              {locked && <Lock size={8} style={{ color:"#d1d5db" }} />}
            </div>
            {!isLast && (
              <div style={{ flex:1, borderTop:"2px dashed", borderColor: done ? p.color : "#e5e7eb", marginTop:26, alignSelf:"flex-start" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Donut sidebar ─────────────────────────────────────────────────────── */
function DonutProgress({ pct=0 }) {
  const r=54, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e8f8" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#gp)" strokeWidth="12"
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*.25}
        strokeLinecap="round" style={{ transition:"stroke-dasharray .8s" }} />
      <defs><linearGradient id="gp" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
      </linearGradient></defs>
      <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22, fontWeight:700, fontFamily:"Georgia,serif" }}>{pct}%</text>
      <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11, fontFamily:"system-ui" }}>Completado</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function PerfilOverviewPage() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [perfil,  setPerfil]  = useState(null);
  const [proceso, setProceso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p, fb=null) =>
      p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);

    Promise.all([
      safe(fetch("/api/auth/me"),           { user:null }),
      safe(fetch("/api/dashboard/perfil"),  null),
      safe(fetch("/api/dashboard/proceso"), null),
    ]).then(([me, perf, proc]) => {
      if (me?.user && !me.user.perfil_habilitado) { router.push("/dashboard"); return; }
      setUser(me?.user || null);
      setPerfil(perf?.perfil || null);
      setProceso(proc);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Calcular progreso ── */
  const secCompletas   = seccionesCompletas(perfil);
  const totalSecciones = SECCIONES.length; // 6
  const pctEval        = Math.round((secCompletas / totalSecciones) * 100);
  const evalCompleta   = secCompletas === totalSecciones;

  /* ── Fases del proceso de perfil (desde proceso_usuario) ── */
  const fasesCompletadas = proceso?.pasos
    ?.filter(p => ["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id) && p.status === "completado")
    ?.length || 0;
  const pctProceso = Math.round((fasesCompletadas / 5) * 100);

  /* ── Estado de los 5 pasos según proceso real ── */
  const pasosConEstado = PASOS_PERFIL.map((p, i) => {
    const ids = ["evaluacion_perfil","perfil_agencia","match","visa","viaje"];
    const procPaso = proceso?.pasos?.find(pp => pp.id === ids[i]);
    let status = procPaso?.status || p.status;
    if (i === 0) {
      // Evaluación de perfil: depende del formulario
      status = evalCompleta ? "completado" : "en_progreso";
    }
    return { ...p, status };
  });

  /* Fases del listado */
  const FASES = [
    {
      num:1, id:"evaluacion_perfil",
      titulo:"Evaluación de perfil",
      desc:"Responde todas las secciones para ayudarte a conocerte mejor y crear un perfil auténtico que te represente.",
      status: evalCompleta ? "completado" : "en_progreso",
      secCompletas, totalSecciones,
      boton: evalCompleta ? "Ver evaluación" : (secCompletas > 0 ? "Continuar evaluación" : "Comenzar evaluación"),
      link:"/dashboard/perfil/evaluacion",
    },
    {
      num:2, id:"perfil_agencia",
      titulo:"Perfil con la agencia",
      desc:"Cuando completes tu evaluación, crearás tu perfil profesional para presentarte a las familias.",
      status: proceso?.pasos?.find(p=>p.id==="perfil_agencia")?.status || "bloqueado",
      bloqueadoMsg:"Se desbloquea cuando completes la fase anterior",
    },
    {
      num:3, id:"match",
      titulo:"Match con la familia",
      desc:"Se desbloquea en la fase anterior.",
      status: proceso?.pasos?.find(p=>p.id==="match")?.status || "bloqueado",
    },
    {
      num:4, id:"visa",
      titulo:"Visa",
      desc:"Se desbloquea en la fase anterior.",
      status: proceso?.pasos?.find(p=>p.id==="visa")?.status || "bloqueado",
    },
    {
      num:5, id:"viaje",
      titulo:"Viaje",
      desc:"Se desbloquea en la fase anterior.",
      status: proceso?.pasos?.find(p=>p.id==="viaje")?.status || "bloqueado",
    },
  ];

  const siguienteFase = FASES.find(f => f.status !== "completado");

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .fase-row:hover{background:#faf5ff!important;}`}</style>

      {/* TOP HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ece8f0", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, position:"sticky", top:0, zIndex:20 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#1e1033", margin:0 }}>
            ¡Hola, {user?.nombre}! 👋
          </h1>
          <p style={{ fontSize:13, color:"#9a7080", margin:"2px 0 0" }}>Continúa con tu proceso 💜</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <button style={{ position:"relative", padding:8, borderRadius:12, border:"1px solid #ece4f0", background:"#fff", cursor:"pointer" }}>
            <Bell size={17} style={{ color:"#9a7080" }} />
            <span style={{ position:"absolute", top:6, right:6, width:7, height:7, background:"#a0435f", borderRadius:"50%", border:"1.5px solid #fff" }} />
          </button>
          <Link href="/dashboard/reuniones" style={{ display:"flex", alignItems:"center", gap:6, border:"1.5px solid #e0d0e8", color:"#6b4a70", fontSize:13, fontWeight:500, padding:"8px 14px", borderRadius:12, textDecoration:"none", background:"#fff" }}>
            <Calendar size={14} /> Agendar reunión
          </Link>
          {/* Ver mi proceso completo → /dashboard/proceso (muestra los 6 pasos completos) */}
          <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", gap:6, background:"#5b21b6", color:"#fff", fontSize:13, fontWeight:600, padding:"9px 16px", borderRadius:12, textDecoration:"none" }}>
            Ver mi proceso completo <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"20px 24px 40px", display:"flex", gap:20 }}>
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>

          {/* MINI ROADMAP */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:"20px 28px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:"#1e1033", margin:"0 0 18px" }}>Mi perfil</h2>
            <MiniRoadmap pasos={pasosConEstado} />
          </div>

          {/* NOTIFICATION */}
          {!evalCompleta && (
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:16, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <Clock size={16} style={{ color:"#d97706", flexShrink:0, marginTop:2 }} />
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:"0 0 2px" }}>
                    Completa tu evaluación de perfil para desbloquear tu perfil con la agencia.
                  </p>
                  <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>Tu perfil es clave para encontrar a la familia ideal para ti.</p>
                </div>
              </div>
              <Link href="/dashboard/perfil/evaluacion" style={{ fontSize:12, fontWeight:600, color:"#a0435f", textDecoration:"none", border:"1px solid #f0dde2", padding:"7px 16px", borderRadius:10, background:"#fff", whiteSpace:"nowrap", flexShrink:0 }}>
                Ver detalles
              </Link>
            </div>
          )}

          {/* FASES DEL PERFIL */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", boxShadow:"0 1px 4px rgba(0,0,0,.04)", overflow:"hidden" }}>
            <div style={{ padding:"16px 24px 14px", borderBottom:"1px solid #f5eef8" }}>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#1e1033", margin:0 }}>Etapas del proceso</h2>
            </div>

            {FASES.map((f, i) => {
              const locked    = f.status === "bloqueado";
              const done      = f.status === "completado";
              const active    = f.status === "en_progreso";
              const pending   = f.status === "pendiente";
              const isFirst   = i === 0;
              const isLast    = i === FASES.length - 1;

              return (
                <div key={f.id} className="fase-row"
                  style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 24px", borderBottom: isLast ? "none" : "1px solid #f8f4fc", background:"#fff", transition:"background .12s", cursor: locked ? "default" : "pointer" }}
                  onClick={() => !locked && f.link && router.push(f.link)}>

                  {/* Número */}
                  <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, fontFamily:"Georgia,serif",
                    background: done ? "#d1fae5" : active ? "#fce7f3" : pending ? "#ede9fe" : "#f3f4f6",
                    color: done ? "#10b981" : active ? "#ec4899" : pending ? "#7c3aed" : "#9ca3af",
                    border: active ? "2.5px solid #ec4899" : pending ? "2.5px solid #7c3aed" : "2px solid transparent",
                  }}>
                    {done ? <CheckCircle2 size={20} style={{ color:"#10b981" }} /> : f.num}
                  </div>

                  {/* Icono estado */}
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                    background: done ? "#d1fae5" : active ? "#fce7f3" : "#f3f4f6",
                  }}>
                    {done    ? <CheckCircle2 size={16} style={{ color:"#10b981" }} />
                     : active ? <PlayCircle size={16} style={{ color:"#ec4899" }} />
                     : <Lock size={14} style={{ color:"#d1d5db" }} />}
                  </div>

                  {/* Badge status */}
                  <div style={{ width:90, flexShrink:0 }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, whiteSpace:"nowrap",
                      background: done ? "#d1fae5" : active ? "#fce7f3" : pending ? "#ede9fe" : "#f3f4f6",
                      color: done ? "#10b981" : active ? "#ec4899" : pending ? "#7c3aed" : "#9ca3af",
                    }}>
                      {done?"Completado": active?"En progreso": pending?"Pendiente": "Bloqueado"}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:600, color: locked ? "#9ca3af" : "#1e1033", margin:"0 0 3px" }}>
                      {f.num}. {f.titulo}
                    </p>
                    <p style={{ fontSize:12, color: locked ? "#c0c0c0" : "#9a7080", margin:0, lineHeight:1.45 }}>
                      {f.desc}
                    </p>
                  </div>

                  {/* Progreso / CTA */}
                  {isFirst && !done ? (
                    <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, minWidth:200 }}>
                      <span style={{ fontSize:11, color:"#9a7080" }}>{secCompletas} de {totalSecciones} secciones completadas</span>
                      <div style={{ width:180, height:6, background:"#f0e8f0", borderRadius:99, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pctEval}%`, background:"linear-gradient(90deg,#ec4899,#f472b6)", borderRadius:99, transition:"width .6s" }} />
                      </div>
                      <button onClick={e=>{e.stopPropagation();router.push("/dashboard/perfil/evaluacion");}}
                        style={{ fontSize:12, fontWeight:600, color:"#fff", background:"linear-gradient(135deg,#ec4899,#be185d)", border:"none", padding:"9px 18px", borderRadius:10, cursor:"pointer", boxShadow:"0 3px 10px rgba(236,72,153,.3)" }}>
                        {f.boton}
                      </button>
                    </div>
                  ) : isFirst && done ? (
                    <div style={{ flexShrink:0 }}>
                      <div style={{ fontSize:11, color:"#10b981", fontWeight:600, textAlign:"right", marginBottom:4 }}>✓ {totalSecciones} de {totalSecciones} secciones</div>
                      <button onClick={e=>{e.stopPropagation();router.push("/dashboard/perfil/evaluacion");}}
                        style={{ fontSize:12, fontWeight:600, color:"#10b981", background:"#d1fae5", border:"none", padding:"8px 16px", borderRadius:10, cursor:"pointer" }}>
                        Ver evaluación
                      </button>
                    </div>
                  ) : pending ? (
                    <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:8, background:"#fce7f3", border:"1px solid #f9a8d4", borderRadius:12, padding:"8px 14px", maxWidth:200 }}>
                      <Lock size={13} style={{ color:"#ec4899", flexShrink:0 }} />
                      <span style={{ fontSize:11, color:"#9d174d", fontWeight:500, lineHeight:1.3 }}>{f.bloqueadoMsg}</span>
                    </div>
                  ) : locked ? (
                    <ChevronRight size={18} style={{ color:"#d1d5db", flexShrink:0 }} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>

          {/* Progreso donut */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.04)", textAlign:"center" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:"0 0 16px", textAlign:"left" }}>Tu progreso en el proceso</h3>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
              <DonutProgress pct={pctProceso} />
            </div>
            <p style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#1e1033", margin:"0 0 2px" }}>
              {fasesCompletadas} de 5 fases completadas
            </p>
            <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 16px", lineHeight:1.4 }}>
              Sigue así, vas por buen camino 💜
            </p>
            <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"1.5px solid #ede9fe", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none", background:"#fff" }}>
              <span style={{ fontSize:14 }}>🗺️</span> Ver mi proceso completo
            </Link>
          </div>

          {/* Próximo paso */}
          {siguienteFase && (
            <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <div style={{ width:28, height:28, borderRadius:9, background:"#fce7f3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎯</div>
                <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>Próximo paso</h3>
              </div>
              <p style={{ fontSize:13, color:"#1e1033", margin:"0 0 12px", lineHeight:1.5 }}>
                Completa tu{" "}
                <span style={{ color:"#ec4899", fontWeight:700 }}>evaluación de perfil</span>{" "}
                para desbloquear tu perfil con la agencia.
              </p>
              <Link href="/dashboard/perfil/evaluacion" style={{ display:"block", textAlign:"center", background:"#5b21b6", color:"#fff", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
                {secCompletas > 0 ? "Continuar evaluación" : "Comenzar evaluación"}
              </Link>
            </div>
          )}

          {/* HelpCard compartida */}
          <HelpCard onContact={() => router.push("/dashboard/mensajes")} />

        </aside>
      </div>
    </div>
  );
}