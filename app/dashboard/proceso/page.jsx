"use client";
// app/dashboard/proceso/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X, ChevronRight, CheckCircle2, Clock, Lock, Info,
  Bell, Calendar, ArrowRight, Check,
} from "lucide-react";
import { StepCircle, HelpCard, PASO_META, PASOS_DEFAULT } from "@/components/dashboard/DashboardWidgets";
import { useMobile } from "@/context/MobileContext";

const STATUS_CFG = {
  completado:  { label:"Completado",  textColor:"#10b981" },
  en_revision: { label:"En revisión", textColor:"#d97706" },
  disponible:  { label:"Disponible",  textColor:"#a0435f" },
  bloqueado:   { label:"Bloqueado",   textColor:"#9ca3af" },
};

function ProgressCard({ paso, porcentaje_curso }) {
  const meta   = PASO_META[paso.id] || PASO_META.curso;
  const cfg    = STATUS_CFG[paso.status] || STATUS_CFG.bloqueado;
  const Icon   = meta.icon;
  const locked = paso.status === "bloqueado";
  const linkHref = { curso:"/dashboard/curso", evaluacion_perfil:"/dashboard/perfil", perfil_agencia:"/dashboard/perfil", match:"/dashboard/comunidad", visa:"/dashboard/documentos", viaje:"/dashboard/documentos" }[paso.id]||"#";
  const actionText = { completado:paso.id==="curso"?"Ver curso":"Ver detalles", en_revision:"Ver estado", disponible:paso.id==="curso"?"Ir al curso":"¿Cómo funciona?", bloqueado:"Más información" }[paso.status]||"Más información";
  return (
    <div className="bg-white rounded-2xl border border-[#ece4f0] p-3 flex flex-col gap-2 shadow-sm">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:locked?"#f3f4f6":meta.bg }}>
        {locked ? <Lock size={13} className="text-gray-300"/> : <Icon size={16} style={{ color:meta.color }}/>}
      </div>
      <div>
        {paso.id==="curso"
          ? <p className="text-[18px] font-bold" style={{ color:paso.status==="completado"?"#10b981":"#a0435f", fontFamily:"Georgia,serif" }}>{paso.status==="completado"?"100%":`${porcentaje_curso||0}%`}</p>
          : <p className="text-[12px] font-bold" style={{ color:cfg.textColor }}>{cfg.label}</p>}
        <p className="text-[10px] text-[#9a7080] leading-tight">{paso.id==="curso"?"Curso completado":paso.label}</p>
      </div>
      <Link href={locked?"#":linkHref} className="text-[11px] font-semibold" style={{ color:locked?"#d1d5db":meta.color, pointerEvents:locked?"none":"auto" }}>{actionText}</Link>
    </div>
  );
}

/* ── Drawer — overlay en mobile, panel fijo en desktop ── */
function ProcesoDrawer({ pasos, onClose, isMobile }) {
  const content = (
    <div className="w-[230px] bg-white flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f0e8f0]">
        <h2 className="text-[13px] font-bold text-[#1e1033]">Mi Destino Au Pair</h2>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#f5eef8] text-[#9a7080]">
          <X size={14}/>
        </button>
      </div>
      <div className="px-4 py-3 border-b border-[#f5eef8]">
        <p className="text-[10px] font-bold text-[#9a7080] uppercase tracking-wide mb-2">Resumen general</p>
        <div className="flex items-center gap-2 bg-[#f5f0ff] rounded-xl px-3 py-2">
          <div className="w-5 h-5 rounded-full bg-[#7c3aed] flex items-center justify-center shrink-0">
            <span className="text-white text-[8px] font-bold">✦</span>
          </div>
          <span className="text-[11px] font-semibold text-[#5b21b6]">Mi progreso completo</span>
        </div>
      </div>
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] font-bold text-[#9a7080] uppercase tracking-wide mb-3">Cada etapa</p>
        <div className="space-y-0">
          {pasos.map((p,i) => {
            const done=p.status==="completado", rev=p.status==="en_revision", locked=p.status==="bloqueado";
            return (
              <div key={p.id} className="flex items-start gap-3 py-2.5 border-b border-[#f8f4fc] last:border-0">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold"
                  style={{ background:done?"#10b981":rev?"#fef3c7":"#f3f4f6", color:done?"#fff":rev?"#d97706":"#9ca3af" }}>
                  {i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-semibold text-[#1e1033] leading-tight">{i+1}. {p.label}</p>
                  <p className="text-[10px] text-[#9a7080]">{p.sublabel_base}</p>
                </div>
                <div className="shrink-0 mt-0.5">
                  {done   && <CheckCircle2 size={14} className="text-emerald-500"/>}
                  {rev    && <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/></div>}
                  {locked && <Lock size={11} className="text-gray-300"/>}
                  {p.status==="disponible" && <div className="w-3 h-3 rounded-full" style={{ background:PASO_META[p.id]?.color||"#a0435f" }}/>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mx-4 mb-4 bg-[#fef3f8] border border-[#f9d0e4] rounded-xl p-3 flex items-start gap-2">
        <Info size={13} className="text-[#c05080] mt-0.5 shrink-0"/>
        <p className="text-[10.5px] text-[#c05080] leading-relaxed">Las etapas se desbloquean con la aprobación del equipo.</p>
      </div>
    </div>
  );

  // Mobile → overlay fijo
  if (isMobile) return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose}/>
      <div className="fixed inset-y-0 left-0 z-50 shadow-xl">{content}</div>
    </>
  );

  // Desktop → panel lateral fijo
  return <div className="border-r border-[#ece4f0] shadow-sm shrink-0">{content}</div>;
}

export default function ProcesoPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,       setUser]       = useState(null);
  const [proceso,    setProceso]    = useState(null);
  const [sesData,    setSesData]    = useState(null);
  const [mensajes,   setMensajes]   = useState([]);
  const [reunion,    setReunion]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);
  // En mobile el drawer empieza cerrado
  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    if (isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const safe = (p,fb=null) => p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),                    {user:null}),
      safe(fetch("/api/dashboard/proceso"),          null),
      safe(fetch("/api/dashboard/sesiones"),         null),
      safe(fetch("/api/dashboard/mensajes?limit=3"), {mensajes:[]}),
      safe(fetch("/api/dashboard/reunion"),          null),
    ]).then(([me,proc,ses,msgs,reu]) => {
      setUser(me?.user||null);
      setProceso(proc);
      setSesData(ses);
      setMensajes(msgs?.mensajes||[]);
      setReunion(reu?.reunion||null);
      setLoading(false);
    }).catch(()=>{ setLoading(false); setError(true); });
  }, []);

  const pasos            = proceso?.pasos||[];
  const notif            = proceso?.notificacion;
  const proximoPaso      = proceso?.proximoPaso;
  const recordatorios    = proceso?.recordatorios||[];
  const porcentaje_curso = proceso?.porcentaje_curso||sesData?.porcentaje||0;
  const cursoCompleto    = proceso?.curso_completo||false;
  const { completadas=0, total=0, sesiones=[] } = sesData||{};
  const sesionActual     = sesiones.find(s=>s.estado==="available");

  const mensajesDisplay = mensajes.length>0 ? mensajes : [
    {id:1,remitente:"Destino Au Pair",   texto:"Tu evaluación de perfil está en revisión...", hora:"Hoy, 10:30",  avatarBg:"#fce8ed",avatarColor:"#a0435f",avatar:"D"},
    {id:2,remitente:"Asesora Valentina", texto:"¡Hola! ¿Tienes dudas sobre el proceso?",      hora:"Ayer, 4:20",  avatarBg:"#fef3c7",avatarColor:"#d97706",avatar:"A"},
    {id:3,remitente:"Equipo Destino",    texto:"Recordatorio: Agendemos tu próxima reunión.",  hora:"19 may",     avatarBg:"#e0f2fe",avatarColor:"#0369a1",avatar:"E"},
  ];

  const recordDisplay = recordatorios.length>0 ? recordatorios : [
    {id:"curso",            label:"Finaliza el curso",     sublabel:"¡Felicidades!",        estado:"completado"},
    {id:"evaluacion_perfil",label:"Evaluación de perfil",  sublabel:"En revisión",          estado:"en_curso"},
    {id:"perfil_agencia",   label:"Perfil con la agencia", sublabel:"Pendiente aprobación", estado:"pendiente"},
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#faf5f6] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex bg-[#faf5f6]" style={{ minHeight:"100vh" }}>

      {/* Drawer */}
      {drawerOpen && pasos.length>0 && (
        <ProcesoDrawer pasos={pasos} onClose={()=>setDrawerOpen(false)} isMobile={isMobile}/>
      )}

      <div className="flex-1 overflow-y-auto min-w-0">

        {/* Top bar */}
        <div className="bg-white border-b border-[#f0e8f0] sticky top-0 z-10"
             style={{ padding:isMobile?"12px 16px":"14px 24px" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {(!drawerOpen||pasos.length===0) && (
                <button onClick={()=>setDrawerOpen(true)}
                  className="text-[12px] font-semibold text-[#7c3aed] border border-[#ede9fe] px-3 py-1.5 rounded-lg hover:bg-[#f5f0ff] transition flex items-center gap-1.5 shrink-0">
                  <ChevronRight size={13}/> Mi proceso
                </button>
              )}
              <div className="min-w-0">
                <h1 className="font-serif font-bold text-[#1e1033] truncate" style={{ fontSize:isMobile?17:22 }}>
                  ¡Hola, {user?.nombre}! 👋
                </h1>
                {!isMobile && <p className="text-[13px] text-[#9a7080]">Cada paso te acerca más a tu aventura 💜</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="relative p-2 rounded-xl border border-[#ece4f0] bg-white">
                <Bell size={16} className="text-[#9a7080]"/>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#a0435f] rounded-full"/>
              </button>
              {!isMobile && (
                <>
                  <Link href="/dashboard/reuniones" className="flex items-center gap-2 border border-[#e0d0e8] text-[#6b4a70] text-[13px] font-medium px-4 py-2 rounded-xl hover:bg-[#fdf8ff] transition">
                    <Calendar size={14}/> Agendar reunión
                  </Link>
                  <Link href="/dashboard/proceso" className="flex items-center gap-2 bg-[#5b21b6] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition">
                    Ver mi proceso <ArrowRight size={13}/>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:isMobile?"14px 16px 40px":"20px 24px 40px" }}>
          <div className="flex gap-5">
            <div className="flex-1 min-w-0 space-y-4">

              {error && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[13px] text-amber-700 flex items-center gap-2">
                  <Info size={15}/> Algunos datos no cargaron. Refresca para intentar de nuevo.
                </div>
              )}

              {/* Roadmap */}
              <div className="bg-white rounded-2xl border border-[#ece4f0] p-4 shadow-sm">
                <h2 className="text-[14px] font-bold text-[#1e1033] mb-4">Mi Destino Au Pair</h2>
                {pasos.length===0 ? (
                  <div className="text-center py-5">
                    <p className="text-[13px] text-[#9a7080] mb-1">Tu proceso se está configurando.</p>
                    <p className="text-[12px] text-[#c0909a]">El equipo activará tus etapas pronto 💕</p>
                  </div>
                ) : (
                  <div className="flex items-start overflow-x-auto pb-2">
                    {pasos.map((p,i)=><StepCircle key={p.id} paso={p} index={i} isLast={i===pasos.length-1}/>)}
                  </div>
                )}
              </div>

              {/* Notificación */}
              {notif && (
                <div className="rounded-2xl border px-4 py-3 flex items-start justify-between gap-3 bg-[#fffbeb] border-[#fde68a] flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Clock size={15} className="text-amber-500 shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1e1033]">{notif.texto}</p>
                      <p className="text-[12px] text-[#9a7080]">{notif.detalle}</p>
                    </div>
                  </div>
                  <Link href={notif.link||"#"} className="text-[12px] font-semibold text-[#a0435f] border border-[#f0dde2] px-3 py-1.5 rounded-xl whitespace-nowrap hover:bg-[#fff0f3] transition">
                    Ver detalles
                  </Link>
                </div>
              )}

              {/* Progress cards */}
              {pasos.length>0 && (
                <div>
                  <h2 className="text-[14px] font-bold text-[#1e1033] mb-3">Resumen de tu progreso</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {pasos.map(p=><ProgressCard key={p.id} paso={p} porcentaje_curso={porcentaje_curso}/>)}
                  </div>
                </div>
              )}

              {/* Curso + Mensajes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Curso */}
                <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#f5eef8]">
                    <h3 className="text-[13px] font-bold text-[#1e1033]">Estado de tu curso</h3>
                  </div>
                  <div className="p-4">
                    <div className="rounded-xl overflow-hidden mb-3 relative" style={{ height:90,background:"linear-gradient(135deg,#2d1a22,#5a2a3a)" }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl">{cursoCompleto?"🎉":"📚"}</div>
                          <p className="text-white text-[10px] font-semibold mt-1">Destino Au Pair</p>
                        </div>
                      </div>
                    </div>
                    {cursoCompleto ? (
                      <p className="text-[13px] font-bold text-[#1e1033] mb-2">¡Felicidades! 🎓</p>
                    ) : (
                      <>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[12px] font-semibold text-[#1e1033]">{completadas} de {total} sesiones</span>
                          <span className="text-[11px] font-bold text-[#a0435f]">{porcentaje_curso}%</span>
                        </div>
                        <div className="h-1.5 bg-[#f0e8f0] rounded-full overflow-hidden mb-3">
                          <div className="h-full rounded-full" style={{ width:`${porcentaje_curso}%`,background:"linear-gradient(90deg,#7c3aed,#a0435f)",transition:"width .7s" }}/>
                        </div>
                      </>
                    )}
                    <button onClick={()=>router.push("/dashboard/curso")} className="w-full text-[12px] font-semibold text-[#7c3aed] border border-[#ede9fe] hover:bg-[#f5f0ff] py-2 rounded-xl transition">
                      {cursoCompleto?"Ver mis módulos":sesionActual?`▶ Continuar — ${sesionActual.titulo}`:"Ver mis módulos"} →
                    </button>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#f5eef8] flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-[#1e1033]">Mensajes recientes</h3>
                    <Link href="/dashboard/mensajes" className="text-[11px] font-semibold text-[#7c3aed]">Ver todos</Link>
                  </div>
                  <div>
                    {mensajesDisplay.map((m,i)=>(
                      <Link key={m.id||i} href="/dashboard/mensajes"
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#fdf8ff] transition"
                        style={{ borderBottom:i<mensajesDisplay.length-1?"1px solid #f8f4fc":"none" }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden"
                          style={{ background:m.avatarBg||"#fce8ed",color:m.avatarColor||"#a0435f" }}>
                          {m.avatar_url?<img src={m.avatar_url} alt="" className="w-full h-full object-cover"/>:(m.avatar||m.remitente?.[0]||"?")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <p className="text-[12px] font-semibold text-[#1e1033] truncate">{m.remitente}</p>
                            <p className="text-[10px] text-[#b0909a] shrink-0">{m.hora||m.tiempo}</p>
                          </div>
                          <p className="text-[11px] text-[#9a7080] truncate mt-0.5">{m.texto||m.preview}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar widgets en mobile — al final */}
              {isMobile && (
                <div className="space-y-4 mt-2">
                  {proximoPaso && (
                    <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-[#f5f0ff] flex items-center justify-center text-base">🎯</div>
                        <span className="text-[11px] font-bold text-[#9a7080] uppercase tracking-wide">Próximo paso</span>
                      </div>
                      <p className="text-[14px] font-bold text-[#1e1033] mb-1 leading-snug">{proximoPaso.titulo}</p>
                      <p className="text-[12px] text-[#9a7080] mb-3">{proximoPaso.detalle}</p>
                      <Link href={proximoPaso.link||"#"} className="w-full block text-center bg-[#5b21b6] text-white text-[12px] font-semibold py-2.5 rounded-xl">
                        {proximoPaso.label_boton}
                      </Link>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                    <h3 className="text-[13px] font-bold text-[#1e1033] mb-3">Recordatorios importantes</h3>
                    <div className="space-y-3">
                      {recordDisplay.map(r=>(
                        <div key={r.id} className="flex items-start gap-2.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${r.estado==="completado"?"bg-emerald-500 border-emerald-500":r.estado==="en_curso"?"border-amber-400":"border-gray-300"}`}>
                            {r.estado==="completado"&&<Check size={9} className="text-white"/>}
                          </div>
                          <div className="flex-1">
                            <p className="text-[12px] font-semibold text-[#1e1033]">{r.label}</p>
                            <p className={`text-[11px] ${r.estado==="en_curso"?"text-amber-600":r.estado==="completado"?"text-emerald-600":"text-[#9a7080]"}`}>{r.sublabel}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={13} className="text-[#7c3aed]"/>
                      <h3 className="text-[13px] font-bold text-[#1e1033]">Tu próxima reunión</h3>
                    </div>
                    {reunion ? (
                      <>
                        <p className="text-[12px] font-semibold text-[#1e1033]">{reunion.fecha}</p>
                        <p className="text-[11px] text-[#9a7080] mb-2">{reunion.hora}</p>
                        <Link href="/dashboard/reuniones" className="block text-center border border-[#ece4f0] text-[#7c3aed] text-[12px] font-semibold py-2 rounded-xl">Ver en calendario</Link>
                      </>
                    ) : (
                      <>
                        <p className="text-[12px] text-[#9a7080] mb-2">No tienes reuniones agendadas.</p>
                        <Link href="/dashboard/reuniones" className="block text-center bg-[#5b21b6] text-white text-[12px] font-semibold py-2.5 rounded-xl">Agendar reunión</Link>
                      </>
                    )}
                  </div>
                  <HelpCard onContact={()=>router.push("/dashboard/mensajes")}/>
                </div>
              )}
            </div>

            {/* Right sidebar — solo desktop */}
            {!isMobile && (
              <aside className="hidden xl:flex flex-col gap-4 w-[240px] shrink-0">
                {proximoPaso && (
                  <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-[#f5f0ff] flex items-center justify-center text-base">🎯</div>
                      <h3 className="text-[12px] font-bold text-[#9a7080] uppercase tracking-wide">Próximo paso</h3>
                    </div>
                    <p className="text-[14px] font-bold text-[#1e1033] leading-snug mb-1">{proximoPaso.titulo}</p>
                    <p className="text-[12px] text-[#9a7080] mb-4">{proximoPaso.detalle}</p>
                    <Link href={proximoPaso.link||"#"} className="w-full block text-center bg-[#5b21b6] text-white text-[12px] font-semibold py-2.5 rounded-xl">
                      {proximoPaso.label_boton}
                    </Link>
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                  <h3 className="text-[13px] font-bold text-[#1e1033] mb-3">Recordatorios importantes</h3>
                  <div className="space-y-3">
                    {recordDisplay.map(r=>(
                      <div key={r.id} className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${r.estado==="completado"?"bg-emerald-500 border-emerald-500":r.estado==="en_curso"?"border-amber-400":"border-gray-300"}`}>
                          {r.estado==="completado"&&<Check size={9} className="text-white"/>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[12px] font-semibold text-[#1e1033]">{r.label}</p>
                            {r.estado==="en_curso"&&<span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">En curso</span>}
                          </div>
                          <p className={`text-[11px] ${r.estado==="en_curso"?"text-amber-600":r.estado==="completado"?"text-emerald-600":"text-[#9a7080]"}`}>{r.sublabel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard/proceso" className="flex items-center justify-between text-[11px] text-[#7c3aed] font-semibold mt-4 pt-3 border-t border-[#f5eef8]">
                    Ver todos los recordatorios <ChevronRight size={12}/>
                  </Link>
                </div>
                <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={13} className="text-[#7c3aed]"/>
                    <h3 className="text-[13px] font-bold text-[#1e1033]">Tu próxima reunión</h3>
                  </div>
                  {reunion ? (
                    <>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-full bg-[#fce8ed] flex items-center justify-center overflow-hidden shrink-0">
                          {reunion.asesora_foto?<img src={reunion.asesora_foto} alt="" className="w-full h-full object-cover"/>:<span className="text-[#a0435f] font-bold text-[12px]">{reunion.asesora?.[0]||"A"}</span>}
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-[#1e1033]">1 a 1 con tu asesora</p>
                          <p className="text-[11px] text-[#9a7080]">{reunion.asesora}</p>
                        </div>
                      </div>
                      <div className="bg-[#faf5f6] rounded-xl px-3 py-2 mb-3">
                        <p className="text-[12px] font-semibold text-[#1e1033]">{reunion.fecha}</p>
                        <p className="text-[11px] text-[#9a7080]">{reunion.hora}</p>
                      </div>
                      <Link href="/dashboard/reuniones" className="w-full block text-center border border-[#ece4f0] text-[#7c3aed] text-[12px] font-semibold py-2 rounded-xl">Ver en calendario</Link>
                    </>
                  ) : (
                    <>
                      <p className="text-[12px] text-[#9a7080] mb-3">No tienes reuniones agendadas.</p>
                      <Link href="/dashboard/reuniones" className="w-full block text-center bg-[#5b21b6] text-white text-[12px] font-semibold py-2.5 rounded-xl">Agendar reunión</Link>
                    </>
                  )}
                </div>
                <HelpCard onContact={()=>router.push("/dashboard/mensajes")}/>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}