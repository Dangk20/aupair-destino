"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Calendar, MessageCircle, ArrowRight, ChevronRight,
  Check, Clock, Lock, Info,
  BookOpen, UserCheck, Building2, Heart, FileCheck, Plane,
  CheckCircle2,
} from "lucide-react";
import { StepCircle, HelpCard, RoadmapCard, PASO_META, PASOS_DEFAULT } from "@/components/dashboard/DashboardWidgets";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════════════════════ */

const STATUS_CFG = {
  completado:  { textColor: "#10b981", ring: "#10b981", badgeBg: "#d1fae5", badgeText: "Completado"  },
  en_revision: { textColor: "#d97706", ring: "#f59e0b", badgeBg: "#fef3c7", badgeText: "En revisión" },
  disponible:  { textColor: "#a0435f", ring: "#a0435f", badgeBg: "#fce8ed", badgeText: "Disponible"  },
  bloqueado:   { textColor: "#9ca3af", ring: "#d1d5db", badgeBg: "#f3f4f6", badgeText: "Bloqueado"   },
};


/* ─── Progress summary card ────────────────────────────────────────────────── */
function ProgressCard({ paso, porcentaje }) {
  const meta   = PASO_META[paso.id] || PASO_META.curso;
  const cfg    = STATUS_CFG[paso.status] || STATUS_CFG.bloqueado;
  const Icon   = meta.icon;
  const locked = paso.status === "bloqueado";

  const action = {
    completado:  paso.id === "curso" ? "Ver curso"       : "Ver detalles",
    en_revision: paso.id === "curso" ? "Ver módulos"     : "Ver estado",
    disponible:  paso.id === "curso" ? "Ir al curso"     : "¿Cómo funciona?",
    bloqueado:   "Más información",
  }[paso.status];

  const href = {
    curso: "/dashboard/curso", evaluacion_perfil: "/dashboard/perfil",
    perfil_agencia: "/dashboard/perfil", match: "/dashboard/comunidad",
    visa: "/dashboard/documentos", viaje: "/dashboard/documentos",
  }[paso.id] || "#";

  return (
    <div className="bg-white rounded-2xl border border-[#ece4f0] p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all min-h-[160px]">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
        style={{ background: locked ? "#f3f4f6" : meta.bg }}>
        {locked ? <Lock size={15} className="text-gray-300" /> : <Icon size={18} style={{ color: meta.color }} />}
      </div>

      {/* Value */}
      {paso.id === "curso" && paso.status === "completado" ? (
        <p className="text-[22px] font-bold leading-none" style={{ color: "#10b981", fontFamily: "Georgia, serif" }}>100%</p>
      ) : paso.id === "curso" ? (
        <p className="text-[22px] font-bold leading-none text-[#a0435f]" style={{ fontFamily: "Georgia, serif" }}>{porcentaje || 0}%</p>
      ) : (
        <p className="text-[13px] font-bold" style={{ color: cfg.textColor }}>
          {cfg.badgeText}
        </p>
      )}

      <p className="text-[10.5px] text-[#9a7080] leading-tight">
        {paso.id === "curso" ? "Curso completado" : paso.label}
      </p>

      <Link href={locked ? "#" : href}
        className={`text-[11px] font-semibold mt-auto ${locked ? "text-gray-300 pointer-events-none" : "hover:underline"}`}
        style={{ color: locked ? undefined : meta.color }}>
        {action}
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [user,       setUser]       = useState(null);
  const [sesData,    setSesData]    = useState(null);
  const [proceso,    setProceso]    = useState(null);
  const [mensajes,   setMensajes]   = useState([]);
  const [recursos,   setRecursos]   = useState([]);
  const [reunion,    setReunion]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [bienvenida, setBienvenida] = useState(false);

  useEffect(() => {
    const safe = (p, fb = null) =>
      p.then(r => { if (r.status === 401) { router.push("/login"); return fb; } return r.json().catch(() => fb); })
       .catch(() => fb);

    Promise.all([
      safe(fetch("/api/auth/me"),                      { user: null }),
      safe(fetch("/api/dashboard/sesiones"),           null),
      safe(fetch("/api/dashboard/proceso"),            null),
      safe(fetch("/api/dashboard/mensajes?limit=3"),   { mensajes: [] }),
      safe(fetch("/api/dashboard/recursos?limit=4"),   { recursos: [] }),
      safe(fetch("/api/dashboard/reunion"),            null),
    ]).then(([me, ses, proc, msgs, recs, reu]) => {
      setUser(me?.user || null);
      setSesData(ses);
      setProceso(proc);
      setMensajes(msgs?.mensajes || []);
      setRecursos(recs?.recursos || []);
      setReunion(reu?.reunion || null);
      if (me?.user && !me.user.vio_bienvenida) setBienvenida(true);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cerrarBienvenida = async () => {
    setBienvenida(false);
    await fetch("/api/dashboard/bienvenida", { method: "POST" }).catch(() => {});
  };

  /* ── Derived data ── */
  const { completadas = 0, total = 0, porcentaje = 0, sesiones = [] } = sesData || {};
  const pasos         = proceso?.pasos?.length > 0 ? proceso.pasos : PASOS_DEFAULT;
  const notif         = proceso?.notificacion;
  const proximoPaso   = proceso?.proximoPaso;
  const porcentajeCurso = proceso?.porcentaje_curso || porcentaje || 0;
  const cursoCompleto   = proceso?.curso_completo   || (completadas > 0 && completadas >= total);
  const sesionActual    = sesiones.find(s => s.estado === "available");

  const recordDisplay = (proceso?.recordatorios || []).length > 0
    ? proceso.recordatorios
    : [
        { id:"curso",             label:"Finaliza el curso",     sublabel: cursoCompleto ? "¡Felicidades!" : "En progreso",       estado: cursoCompleto ? "completado" : "en_curso"  },
        { id:"evaluacion_perfil", label:"Evaluación de perfil",  sublabel:"En revisión",          estado:"en_curso"   },
        { id:"perfil_agencia",    label:"Perfil con la agencia", sublabel:"Pendiente aprobación", estado:"pendiente"  },
      ];

  const mensajesDisplay = mensajes.length > 0 ? mensajes : [
    { id:1, remitente:"Destino Au Pair",   texto:"Tu evaluación de perfil está en revisión. Te...", hora:"Hoy, 10:30 AM",  avatarBg:"#fce8ed", avatarColor:"#a0435f", avatar:"D" },
    { id:2, remitente:"Asesora Valentina", texto:"¡Hola! ¿Tienes dudas sobre...",                   hora:"Ayer, 4:20 PM",  avatarBg:"#fef3c7", avatarColor:"#d97706", avatar:"A" },
    { id:3, remitente:"Equipo Destino",    texto:"Recordatorio: Agendemos tu próxima reunión.",      hora:"19 may, 11:15",  avatarBg:"#e0f2fe", avatarColor:"#0369a1", avatar:"E" },
  ];

  const recursosDisplay = recursos.length > 0 ? recursos : [
  {
    id:1, titulo:"Cultura Americana", categoria:"Lección 3 de 5", progreso:60,
    imagen:"https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=180&fit=crop&q=80",
  },
  {
    id:2, titulo:"Cuidado de niños", categoria:"Lección 2 de 4", progreso:50,
    imagen:"https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=180&fit=crop&q=80",
  },
  {
    id:3, titulo:"Preparación entrevistas", categoria:"Lección 4 de 6", progreso:66,
    imagen:"https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=180&fit=crop&q=80",
  },
  {
    id:4, titulo:"Checklist de viaje", categoria:"Lección 1 de 3", progreso:33,
    imagen:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=180&fit=crop&q=80",
  },
];

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#faf5f6] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[13px] text-[#9a7080]">Cargando tu programa...</p>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#faf5f6]" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── TOP HEADER ── */}
      <div className="bg-white border-b border-[#ece8f0] px-6 md:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <h1 style={{ fontFamily:"Georgia, serif", fontSize:"clamp(20px,2.5vw,26px)", fontWeight:700, color:"#1e1033", margin:0, display:"flex", alignItems:"center", gap:8 }}>
            ¡Hola, {user?.nombre} {user?.apellido}! <span>👋</span>
          </h1>
          <p style={{ fontSize:13, color:"#9a7080", margin:"3px 0 0" }}>
            Cada paso te acerca más a tu aventura. Estamos aquí para acompañarte. <span>💜</span>
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, flexWrap:"wrap" }}>
          <button style={{ position:"relative", padding:8, borderRadius:12, border:"1px solid #ece4f0", background:"#fff", cursor:"pointer" }}>
            <Bell size={17} style={{ color:"#9a7080" }} />
            <span style={{ position:"absolute", top:6, right:6, width:7, height:7, background:"#a0435f", borderRadius:"50%", border:"1.5px solid #fff" }} />
          </button>
          <Link href="/dashboard/reuniones" style={{
            display:"flex", alignItems:"center", gap:6,
            border:"1.5px solid #e0d0e8", color:"#6b4a70", fontSize:13, fontWeight:500,
            padding:"8px 14px", borderRadius:12, textDecoration:"none",
            background:"#fff",
          }}>
            <Calendar size={14} /> Agendar reunión
          </Link>
          <Link href="/dashboard/proceso" style={{
            display:"flex", alignItems:"center", gap:6,
            background:"#5b21b6", color:"#fff", fontSize:13, fontWeight:600,
            padding:"9px 16px", borderRadius:12, textDecoration:"none",
          }}>
            Ver mi proceso completo <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ display:"flex", gap:20, padding:"20px 24px 40px", maxWidth:1400, margin:"0 auto" }}>

        {/* ── MAIN COLUMN ── */}
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:18 }}>

          {/* ROADMAP */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:"#1e1033", margin:"0 0 18px" }}>Mi Destino Au Pair</h2>
            <div style={{ display:"flex", alignItems:"flex-start", overflowX:"auto", paddingBottom:4 }}>
              {pasos.map((p, i) => <StepCircle key={p.id} paso={p} index={i} isLast={i === pasos.length - 1} />)}
            </div>
          </div>

          {/* NOTIFICATION */}
          {notif && (
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:16, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <Clock size={16} style={{ color:"#d97706", flexShrink:0, marginTop:2 }} />
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:"0 0 2px" }}>{notif.texto}</p>
                  <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>{notif.detalle}</p>
                </div>
              </div>
              <Link href={notif.link || "#"} style={{
                fontSize:12, fontWeight:600, color:"#a0435f", textDecoration:"none",
                border:"1px solid #f0dde2", padding:"6px 14px", borderRadius:10,
                background:"#fff", whiteSpace:"nowrap", flexShrink:0,
              }}>Ver detalles</Link>
            </div>
          )}

          {/* PROGRESS CARDS */}
          <div>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:"#1e1033", margin:"0 0 12px" }}>
              Resumen de tu progreso
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
              {pasos.map(p => (
                <ProgressCard key={p.id} paso={p} porcentaje={porcentajeCurso} />
              ))}
            </div>
          </div>

          {/* COURSE + MESSAGES */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
            {/* Course */}
            <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", boxShadow:"0 1px 4px rgba(0,0,0,.04)", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px 12px", borderBottom:"1px solid #f5eef8" }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#1e1033", margin:0 }}>Estado de tu curso</h3>
              </div>
              <div style={{ padding:20 }}>
                {/* Thumbnail */}
                <div style={{ borderRadius:14, overflow:"hidden", marginBottom:14, height:110, position:"relative", background:"linear-gradient(135deg,#2d1a22,#5a2a3a)" }}>
                  <div style={{ position:"absolute", inset:0, opacity:.18 }}>
                    <svg width="100%" height="100%"><defs><pattern id="d1" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#e8849a"/></pattern></defs><rect width="100%" height="100%" fill="url(#d1)"/></svg>
                  </div>
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:4 }}>
                    <span style={{ fontSize:28 }}>{cursoCompleto ? "🎉" : "📚"}</span>
                    <span style={{ color:"#fff", fontSize:11, fontWeight:600 }}>Destino Au Pair</span>
                  </div>
                </div>

                {cursoCompleto ? (
                  <>
                    <p style={{ fontSize:14, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>¡Felicidades! 🎓</p>
                    <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 8px" }}>Has completado todos los módulos del curso.</p>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#dcfce7", color:"#15803d", fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:99, marginBottom:12 }}>
                      <Check size={9} /> Enviado para revisión
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#1e1033" }}>{completadas} de {total} sesiones</span>
                      <span style={{ fontSize:12, fontWeight:700, color:"#a0435f" }}>{porcentajeCurso}%</span>
                    </div>
                    <div style={{ height:7, background:"#f0e8f0", borderRadius:99, overflow:"hidden", marginBottom:12 }}>
                      <div style={{ height:"100%", width:`${porcentajeCurso}%`, background:"linear-gradient(90deg,#7c3aed,#a0435f)", borderRadius:99, transition:"width .7s" }} />
                    </div>
                  </>
                )}

                <button onClick={() => router.push("/dashboard/curso")} style={{
                  width:"100%", textAlign:"center", fontSize:12, fontWeight:600, color:"#7c3aed",
                  border:"1.5px solid #ede9fe", background:"#fff", borderRadius:12, padding:"9px",
                  cursor:"pointer",
                }}>
                  {cursoCompleto ? "Ver mis módulos →" : sesionActual ? `▶ Continuar — ${sesionActual.titulo}` : "Ver mis módulos →"}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", boxShadow:"0 1px 4px rgba(0,0,0,.04)", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px 12px", borderBottom:"1px solid #f5eef8", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#1e1033", margin:0 }}>Mensajes recientes</h3>
                <Link href="/dashboard/mensajes" style={{ fontSize:12, fontWeight:600, color:"#7c3aed", textDecoration:"none" }}>Ver todos</Link>
              </div>
              <div>
                {mensajesDisplay.map((m, i) => (
                  <Link key={m.id || i} href="/dashboard/mensajes" style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 20px", borderBottom:i < mensajesDisplay.length-1 ? "1px solid #f8f4fc" : "none", textDecoration:"none" }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:m.avatar_url?"transparent":(m.avatarBg||"#fce8ed"), color:m.avatarColor||"#a0435f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, overflow:"hidden" }}>
                      {m.avatar_url ? <img src={m.avatar_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : (m.avatar || m.remitente?.[0] || "?")}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8 }}>
                        <p style={{ fontSize:12, fontWeight:600, color:"#1e1033", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.remitente}</p>
                        <p style={{ fontSize:10, color:"#b0909a", margin:0, flexShrink:0 }}>{m.hora || m.tiempo}</p>
                      </div>
                      <p style={{ fontSize:11, color:"#9a7080", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.texto || m.preview}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RESOURCES */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:"#1e1033", margin:0 }}>
                Recursos recomendados para ti
              </h2>
              <Link href="/dashboard/recursos" style={{ fontSize:12, fontWeight:600, color:"#7c3aed", textDecoration:"none" }}>Ver todos</Link>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              {recursosDisplay.map(r => (
                <Link key={r.id} href={r.link || `/dashboard/recursos/${r.id}`} style={{ background:"#fff", borderRadius:16, border:"1px solid #ece4f0", overflow:"hidden", textDecoration:"none", boxShadow:"0 1px 4px rgba(0,0,0,.04)", display:"flex", flexDirection:"column" }}>
                  <div style={{ height:100, overflow:"hidden", position:"relative" }}>
  {r.imagen ? (
    <>
      <img
        src={r.imagen}
        alt={r.titulo}
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
      />
      {/* Overlay degradado sutil abajo */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:40,
        background:"linear-gradient(to top, rgba(45,26,34,.35), transparent)",
      }} />
    </>
  ) : (
    <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#f5f0ff,#fce8ed)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:36 }}>{r.emoji || "📖"}</span>
    </div>
  )}
</div>
                  <div style={{ padding:12, flex:1, display:"flex", flexDirection:"column" }}>
                    <p style={{ fontSize:12, fontWeight:600, color:"#1e1033", margin:"0 0 3px", lineHeight:1.3 }}>{r.titulo}</p>
                    <p style={{ fontSize:10, color:"#9a7080", margin:"0 0 8px" }}>{r.categoria}</p>
                    <div style={{ height:5, background:"#f0e8f0", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${r.progreso||0}%`, background:"linear-gradient(90deg,#7c3aed,#a0435f)", borderRadius:99 }} />
                    </div>
                    <p style={{ fontSize:10, color:"#b0909a", margin:"4px 0 0" }}>{r.progreso || 0}%</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>

          {/* Próximo paso */}
          {proximoPaso && (
            <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:28, height:28, borderRadius:9, background:"#f5f0ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎯</div>
                <span style={{ fontSize:11, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".5px" }}>Próximo paso</span>
              </div>
              <p style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:"#1e1033", margin:"0 0 6px", lineHeight:1.3 }}>{proximoPaso.titulo}</p>
              <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 14px", lineHeight:1.5 }}>{proximoPaso.detalle}</p>
              <Link href={proximoPaso.link || "#"} style={{ display:"block", textAlign:"center", background:"#5b21b6", color:"#fff", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
                {proximoPaso.label_boton}
              </Link>
            </div>
          )}

          {/* Recordatorios */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:"0 0 14px" }}>Recordatorios importantes</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {recordDisplay.map(r => (
                <div key={r.id} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{
                    width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                    border: r.estado==="completado" ? "none" : r.estado==="en_curso" ? "2px solid #f59e0b" : "2px solid #d1d5db",
                    background: r.estado==="completado" ? "#10b981" : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    {r.estado === "completado" && <Check size={10} style={{ color:"#fff" }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
                      <p style={{ fontSize:12, fontWeight:600, color:"#1e1033", margin:0 }}>{r.label}</p>
                      {r.estado === "en_curso" && (
                        <span style={{ fontSize:9, fontWeight:700, color:"#d97706", background:"#fef3c7", padding:"2px 7px", borderRadius:99, flexShrink:0 }}>En curso</span>
                      )}
                    </div>
                    <p style={{ fontSize:11, color: r.estado==="en_curso"?"#d97706":r.estado==="completado"?"#10b981":"#9a7080", margin:0 }}>{r.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/proceso" style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              fontSize:11, fontWeight:600, color:"#7c3aed", textDecoration:"none",
              marginTop:14, paddingTop:12, borderTop:"1px solid #f5eef8",
            }}>
              Ver todos mis recordatorios <ChevronRight size={12} />
            </Link>
          </div>

          {/* Próxima reunión */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
              <Calendar size={13} style={{ color:"#7c3aed" }} />
              <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>Tu próxima reunión</h3>
            </div>
            {reunion ? (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#fce8ed", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {reunion.asesora_foto
                      ? <img src={reunion.asesora_foto} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <span style={{ color:"#a0435f", fontWeight:700, fontSize:12 }}>{reunion.asesora?.[0]||"A"}</span>
                    }
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:"#1e1033", margin:0 }}>1 a 1 con tu asesora</p>
                    <p style={{ fontSize:11, color:"#9a7080", margin:0 }}>{reunion.asesora}</p>
                  </div>
                </div>
                <div style={{ background:"#faf5f6", borderRadius:12, padding:"8px 12px", marginBottom:10 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#1e1033", margin:0 }}>{reunion.fecha}</p>
                  <p style={{ fontSize:11, color:"#9a7080", margin:0 }}>{reunion.hora}</p>
                </div>
                <Link href="/dashboard/reuniones" style={{ display:"block", textAlign:"center", border:"1.5px solid #ece4f0", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"8px", borderRadius:12, textDecoration:"none" }}>
                  Ver en calendario
                </Link>
              </>
            ) : (
              <>
                <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 12px" }}>No tienes reuniones agendadas.</p>
                <Link href="/dashboard/reuniones" style={{ display:"block", textAlign:"center", background:"#5b21b6", color:"#fff", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
                  Agendar reunión
                </Link>
              </>
            )}
          </div>

          {/* Help */}
          <HelpCard onContact={() => router.push("/dashboard/mensajes")} />

        </aside>
      </div>

      {/* ── WELCOME MODAL ── */}
      {bienvenida && user && (
        <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(45,26,34,.5)", backdropFilter:"blur(4px)" }} onClick={cerrarBienvenida} />
          <div style={{ position:"relative", background:"#fff", borderRadius:24, boxShadow:"0 20px 60px rgba(45,26,34,.2)", width:"100%", maxWidth:380, overflow:"hidden" }}>
            <div style={{ height:6, background:"linear-gradient(90deg,#2d1a22,#e8849a,#2d1a22)" }} />
            <div style={{ padding:28, textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🌍✈️</div>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:24, color:"#a0435f", margin:"0 0 8px", fontStyle:"italic" }}>
                ¡Bienvenida,<br />{user.nombre}!
              </h2>
              <p style={{ fontSize:13, color:"#7a4a54", lineHeight:1.6, margin:"0 0 20px" }}>
                Tu destino au pair empieza hoy. Comienza con la sesión de bienvenida 👋🏻 Es gratis y te tomará solo unos minutos. 💕
              </p>
              <div style={{ background:"#fff8f9", border:"1px solid #f0dde2", borderRadius:16, padding:14, marginBottom:20, textAlign:"left" }}>
                <p style={{ fontSize:12, color:"#7a4a54", fontStyle:"italic", lineHeight:1.6, margin:"0 0 10px" }}>
                  "Estamos muy emocionadas de tenerte aquí. Este programa lo creamos con todo el amor para que llegues preparada a tu familia anfitriona."
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ display:"flex", marginLeft:0 }}>
                    {["J","T"].map((l,i) => (
                      <div key={i} style={{ width:26, height:26, borderRadius:"50%", background:i===0?"#fce8ed":"#e8e0f8", border:"2px solid #fff", marginLeft:i>0?-6:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:i===0?"#a0435f":"#6b4f9e" }}>{l}</div>
                    ))}
                  </div>
                  <p style={{ fontSize:11, fontWeight:600, color:"#a0435f", margin:0 }}>Jennifer y Tati 💕</p>
                </div>
              </div>
              <button onClick={cerrarBienvenida} style={{
                width:"100%", background:"#a0435f", color:"#fff", fontSize:14, fontWeight:600,
                padding:"14px", borderRadius:16, border:"none", cursor:"pointer",
                boxShadow:"0 8px 20px rgba(160,67,95,.25)",
              }}>
                ¡Empezar mi Destino! 🚀
              </button>
              <p style={{ fontSize:11, color:"#9a6672", margin:"10px 0 0" }}>Tu primera sesión es completamente gratis 🎉</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}