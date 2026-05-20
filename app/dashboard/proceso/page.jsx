"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X, ChevronRight, CheckCircle2, Clock, Lock, Info,
  BookOpen, UserCheck, Building2, Heart, FileCheck, Plane,
  Bell, Calendar, MessageCircle, ArrowRight, Check,
} from "lucide-react";

/* ─── Config ──────────────────────────────────────────────────────────────── */
const PASO_META = {
  curso:             { icon:BookOpen,  color:"#10b981", bg:"#d1fae5" },
  evaluacion_perfil: { icon:UserCheck, color:"#f59e0b", bg:"#fef3c7" },
  perfil_agencia:    { icon:Building2, color:"#8b5cf6", bg:"#ede9fe" },
  match:             { icon:Heart,     color:"#ec4899", bg:"#fce7f3" },
  visa:              { icon:FileCheck, color:"#3b82f6", bg:"#dbeafe" },
  viaje:             { icon:Plane,     color:"#a0435f", bg:"#fce8ed" },
};
const STATUS_CFG = {
  completado:  { label:"Completado",  textColor:"#10b981", ring:"#10b981" },
  en_revision: { label:"En revisión", textColor:"#d97706", ring:"#f59e0b" },
  disponible:  { label:"Disponible",  textColor:"#a0435f", ring:"#a0435f" },
  bloqueado:   { label:"Bloqueado",   textColor:"#9ca3af", ring:"#d1d5db" },
};

/* ─── Step circle ─────────────────────────────────────────────────────────── */
function StepCircle({ paso, index, isLast }) {
  const meta   = PASO_META[paso.id] || PASO_META.curso;
  const cfg    = STATUS_CFG[paso.status] || STATUS_CFG.bloqueado;
  const Icon   = meta.icon;
  const locked = paso.status === "bloqueado";
  const done   = paso.status === "completado";
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center gap-2" style={{ minWidth:78 }}>
        <div className="relative">
          <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center border-[2.5px] transition-all"
            style={{ borderColor:cfg.ring, background:locked?"#f9fafb":meta.bg }}>
            {locked  ? <Lock size={16} className="text-gray-300" />
             : done  ? <CheckCircle2 size={22} style={{ color:cfg.ring }} />
             : <Icon size={19} style={{ color:meta.color }} />}
          </div>
          {paso.status === "en_revision" && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-amber-400 animate-pulse" />
          )}
          {paso.status === "disponible" && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background:meta.color }} />
          )}
        </div>
        <div className="text-center" style={{ maxWidth:78 }}>
          <p className="text-[10.5px] font-semibold text-[#1e1033] leading-tight">{index+1}. {paso.label}</p>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color:cfg.textColor }}>
            {done?"Completado": paso.status==="en_revision"?"En revisión": locked?"Bloqueado":""}
          </p>
          {locked && <Lock size={9} className="mx-auto mt-0.5 text-gray-300" />}
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center flex-1 mx-0.5" style={{ marginTop:25 }}>
          <div className="w-full border-t-2 border-dashed" style={{ borderColor:done?"#10b981":"#e5e7eb" }} />
        </div>
      )}
    </div>
  );
}

/* ─── Progress card ───────────────────────────────────────────────────────── */
function ProgressCard({ paso, porcentaje_curso }) {
  const meta   = PASO_META[paso.id] || PASO_META.curso;
  const cfg    = STATUS_CFG[paso.status] || STATUS_CFG.bloqueado;
  const Icon   = meta.icon;
  const locked = paso.status === "bloqueado";
  const linkHref = { curso:"/dashboard/curso", evaluacion_perfil:"/dashboard/perfil", perfil_agencia:"/dashboard/perfil", match:"/dashboard/comunidad", visa:"/dashboard/documentos", viaje:"/dashboard/documentos" }[paso.id] || "#";
  const actionText = { completado: paso.id==="curso"?"Ver curso":"Ver detalles", en_revision:"Ver estado", disponible: paso.id==="curso"?"Ir al curso":"¿Cómo funciona?", bloqueado:"Más información" }[paso.status] || "Más información";
  return (
    <div className="bg-white rounded-2xl border border-[#ece4f0] p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:locked?"#f3f4f6":meta.bg }}>
          {locked ? <Lock size={15} className="text-gray-300" /> : <Icon size={18} style={{ color:meta.color }} />}
        </div>
      </div>
      <div>
        {paso.id==="curso" && paso.status==="completado"
          ? <p className="text-[20px] font-bold" style={{ color:"#10b981" }}>100%</p>
          : paso.id==="curso" && paso.status==="disponible"
          ? <p className="text-[20px] font-bold text-[#a0435f]">{porcentaje_curso||0}%</p>
          : <p className="text-[14px] font-bold" style={{ color:cfg.textColor }}>{cfg.label}</p>
        }
        <p className="text-[11px] text-[#9a7080] leading-tight mt-0.5">{paso.id==="curso"?"Curso completado":paso.label}</p>
      </div>
      <Link href={locked?"#":linkHref}
        className={`text-[11px] font-semibold ${locked?"text-gray-300 cursor-default pointer-events-none":"hover:underline"}`}
        style={{ color:locked?undefined:meta.color }}>
        {actionText}
      </Link>
    </div>
  );
}

/* ─── Left drawer ─────────────────────────────────────────────────────────── */
function ProcesoDrawer({ pasos, onClose }) {
  return (
    <div className="w-[230px] bg-white border-r border-[#ece4f0] flex flex-col h-full shadow-lg overflow-y-auto shrink-0">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f0e8f0]">
        <h2 className="text-[13px] font-bold text-[#1e1033]">Mi Destino Au Pair</h2>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#f5eef8] transition text-[#9a7080]">
          <X size={14} />
        </button>
      </div>
      <div className="px-4 py-3 border-b border-[#f5eef8]">
        <p className="text-[10px] font-bold text-[#9a7080] uppercase tracking-wide mb-2">Resumen general</p>
        <div className="flex items-center gap-2 bg-[#f5f0ff] rounded-xl px-3 py-2">
          <div className="w-5 h-5 rounded-full bg-[#7c3aed] flex items-center justify-center shrink-0">
            <span className="text-white text-[8px] font-bold">✦</span>
          </div>
          <span className="text-[11px] font-semibold text-[#5b21b6]">Mi progreso completo</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-[#7c3aed]" />
        </div>
      </div>
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] font-bold text-[#9a7080] uppercase tracking-wide mb-3">Cada etapa de tu proceso</p>
        <div className="space-y-0">
          {pasos.map((p, i) => {
            const done   = p.status === "completado";
            const rev    = p.status === "en_revision";
            const locked = p.status === "bloqueado";
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
                  {done   && <CheckCircle2 size={14} className="text-emerald-500" />}
                  {rev    && <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /></div>}
                  {locked && <Lock size={11} className="text-gray-300" />}
                  {p.status==="disponible" && <div className="w-3 h-3 rounded-full" style={{ background:PASO_META[p.id]?.color||"#a0435f" }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mx-4 mb-4 bg-[#fef3f8] border border-[#f9d0e4] rounded-xl p-3 flex items-start gap-2">
        <Info size={13} className="text-[#c05080] mt-0.5 shrink-0" />
        <p className="text-[10.5px] text-[#c05080] leading-relaxed">Las etapas se desbloquean con la aprobación del equipo de Destino Au Pair.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function ProcesoPage() {
  const router = useRouter();
  const [user,       setUser]       = useState(null);
  const [proceso,    setProceso]    = useState(null);
  const [sesData,    setSesData]    = useState(null);
  const [mensajes,   setMensajes]   = useState([]);
  const [reunion,    setReunion]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [error,      setError]      = useState(false);

  useEffect(() => {
    // ── Fetch individual con manejo de error independiente ──────────────────
    const safe = (promise, fallback = null) => promise.then(r => {
      if (r.status === 401) { router.push("/login"); return fallback; }
      return r.json().catch(() => fallback);
    }).catch(() => fallback);

    Promise.all([
      safe(fetch("/api/auth/me"),                      { user: null }),
      safe(fetch("/api/dashboard/proceso"),            null),
      safe(fetch("/api/dashboard/sesiones"),           null),
      safe(fetch("/api/dashboard/mensajes?limit=3"),   { mensajes: [] }),
      safe(fetch("/api/dashboard/reunion"),            null),
    ]).then(([me, proc, ses, msgs, reu]) => {
      setUser(me?.user || null);
      setProceso(proc);
      setSesData(ses);
      setMensajes(msgs?.mensajes || []);
      setReunion(reu?.reunion || null);
      setLoading(false);
    }).catch(() => {
      // Si todo falla, mostrar la página vacía de todas formas
      setLoading(false);
      setError(true);
    });
  }, []);

  // ── Fallback data ──────────────────────────────────────────────────────────
  const pasos            = proceso?.pasos         || [];
  const notif            = proceso?.notificacion;
  const proximoPaso      = proceso?.proximoPaso;
  const recordatorios    = proceso?.recordatorios || [];
  const porcentaje_curso = proceso?.porcentaje_curso || sesData?.porcentaje || 0;
  const cursoCompleto    = proceso?.curso_completo   || false;
  const { completadas=0, total=0, sesiones=[] } = sesData || {};
  const sesionActual     = sesiones.find(s => s.estado === "available");

  const mensajesDisplay = mensajes.length > 0 ? mensajes : [
    { id:1, remitente:"Destino Au Pair",   texto:"Tu evaluación de perfil está en revisión. Te...", hora:"Hoy, 10:30 AM",  avatarBg:"#fce8ed", avatarColor:"#a0435f", avatar:"D" },
    { id:2, remitente:"Asesora Valentina", texto:"¡Hola! ¿Tienes dudas sobre...",                   hora:"Ayer, 4:20 PM",  avatarBg:"#fef3c7", avatarColor:"#d97706", avatar:"A" },
    { id:3, remitente:"Equipo Destino",    texto:"Recordatorio: Agendemos tu próxima reunión.",      hora:"19 may, 11:15",  avatarBg:"#e0f2fe", avatarColor:"#0369a1", avatar:"E" },
  ];

  const recordDisplay = recordatorios.length > 0 ? recordatorios : [
    { id:"curso",             label:"Finaliza el curso",     sublabel:"¡Felicidades!",        estado:"completado" },
    { id:"evaluacion_perfil", label:"Evaluación de perfil",  sublabel:"En revisión",          estado:"en_curso"   },
    { id:"perfil_agencia",    label:"Perfil con la agencia", sublabel:"Pendiente aprobación", estado:"pendiente"  },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#faf5f6] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex bg-[#faf5f6]" style={{ minHeight:"100vh" }}>

      {/* Drawer izquierdo */}
      {drawerOpen && pasos.length > 0 && (
        <ProcesoDrawer pasos={pasos} onClose={() => setDrawerOpen(false)} />
      )}

      <div className="flex-1 overflow-y-auto">

        {/* Top bar */}
        <div className="bg-white border-b border-[#f0e8f0] px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {(!drawerOpen || pasos.length === 0) && (
              <button onClick={() => setDrawerOpen(true)}
                className="text-[12px] font-semibold text-[#7c3aed] border border-[#ede9fe] px-3 py-1.5 rounded-lg hover:bg-[#f5f0ff] transition flex items-center gap-1.5">
                <ChevronRight size={13} /> Mi proceso
              </button>
            )}
            <div>
              <h1 className="font-serif text-[22px] font-bold text-[#1e1033]">
                ¡Hola, {user?.nombre} {user?.apellido}! 👋
              </h1>
              <p className="text-[13px] text-[#9a7080]">Cada paso te acerca más a tu aventura. Estamos aquí para acompañarte. 💜</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="relative p-2 rounded-xl border border-[#ece4f0] bg-white hover:bg-[#fdf8ff] transition">
              <Bell size={17} className="text-[#9a7080]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#a0435f] rounded-full" />
            </button>
            <Link href="/dashboard/reuniones"
              className="hidden sm:flex items-center gap-2 border border-[#e0d0e8] text-[#6b4a70] text-[13px] font-medium px-4 py-2 rounded-xl hover:bg-[#fdf8ff] transition">
              <Calendar size={14} /> Agendar reunión
            </Link>
            <Link href="/dashboard/proceso"
              className="hidden sm:flex items-center gap-2 bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition">
              Ver mi proceso completo <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Body */}
        <div className="flex gap-5 p-5 md:p-6">
          <div className="flex-1 min-w-0 space-y-5">

            {/* Error banner */}
            {error && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[13px] text-amber-700 flex items-center gap-2">
                <Info size={15} /> Algunos datos no cargaron. Refresca la página para intentarlo de nuevo.
              </div>
            )}

            {/* Roadmap */}
            <div className="bg-white rounded-2xl border border-[#ece4f0] p-5 shadow-sm">
              <h2 className="text-[14px] font-bold text-[#1e1033] mb-5">Mi Destino Au Pair</h2>
              {pasos.length === 0 ? (
                /* Estado vacío — sin tabla aún */
                <div className="text-center py-6">
                  <p className="text-[13px] text-[#9a7080] mb-2">Tu proceso se está configurando.</p>
                  <p className="text-[12px] text-[#c0909a]">El equipo de Destino Au Pair activará tus etapas pronto. 💕</p>
                </div>
              ) : (
                <div className="flex items-start overflow-x-auto pb-2">
                  {pasos.map((p,i) => <StepCircle key={p.id} paso={p} index={i} isLast={i===pasos.length-1} />)}
                </div>
              )}
            </div>

            {/* Notificación */}
            {notif && (
              <div className="rounded-2xl border px-5 py-3.5 flex items-center justify-between gap-4 bg-[#fffbeb] border-[#fde68a]">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#1e1033]">{notif.texto}</p>
                    <p className="text-[12px] text-[#9a7080] mt-0.5">{notif.detalle}</p>
                  </div>
                </div>
                <Link href={notif.link||"#"}
                  className="text-[12px] font-semibold text-[#a0435f] hover:underline whitespace-nowrap border border-[#f0dde2] px-4 py-1.5 rounded-xl hover:bg-[#fff0f3] transition">
                  Ver detalles
                </Link>
              </div>
            )}

            {/* Progress cards */}
            {pasos.length > 0 && (
              <div>
                <h2 className="text-[14px] font-bold text-[#1e1033] mb-3">Resumen de tu progreso</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {pasos.map(p => <ProgressCard key={p.id} paso={p} porcentaje_curso={porcentaje_curso} />)}
                </div>
              </div>
            )}

            {/* Course + Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Course */}
              <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#f5eef8]">
                  <h3 className="text-[14px] font-bold text-[#1e1033]">Estado de tu curso</h3>
                </div>
                <div className="p-5">
                  <div className="rounded-xl overflow-hidden mb-4 h-28 relative" style={{ background:"linear-gradient(135deg,#2d1a22,#5a2a3a)" }}>
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%"><defs><pattern id="dp2" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#e8849a"/></pattern></defs><rect width="100%" height="100%" fill="url(#dp2)"/></svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl">{cursoCompleto?"🎉":"📚"}</div>
                        <p className="text-white text-[11px] font-semibold mt-1">Destino Au Pair</p>
                      </div>
                    </div>
                  </div>
                  {cursoCompleto ? (
                    <>
                      <p className="text-[14px] font-bold text-[#1e1033] mb-1">¡Felicidades! 🎓</p>
                      <p className="text-[12px] text-[#9a7080] mb-3">Has completado todos los módulos del curso.</p>
                      <div className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-4">
                        <Check size={9} /> Enviado para revisión
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[13px] font-semibold text-[#1e1033]">{completadas} de {total} sesiones</p>
                        <span className="text-[12px] font-bold text-[#a0435f]">{porcentaje_curso}%</span>
                      </div>
                      <div className="h-2 bg-[#f0e8f0] rounded-full overflow-hidden mb-4">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width:`${porcentaje_curso}%`, background:"linear-gradient(90deg,#7c3aed,#a0435f)" }} />
                      </div>
                    </>
                  )}
                  <button onClick={() => router.push("/dashboard/curso")}
                    className="w-full text-center text-[12px] font-semibold text-[#7c3aed] border border-[#ede9fe] hover:bg-[#f5f0ff] py-2 rounded-xl transition">
                    {cursoCompleto ? "Ver mis módulos" : sesionActual ? `▶ Continuar — ${sesionActual.titulo}` : "Ver mis módulos"} →
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#f5eef8] flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-[#1e1033]">Mensajes recientes</h3>
                  <Link href="/dashboard/mensajes" className="text-[12px] font-semibold text-[#7c3aed] hover:underline">Ver todos</Link>
                </div>
                <div className="divide-y divide-[#f8f4fc]">
                  {mensajesDisplay.map(m => (
                    <Link href="/dashboard/mensajes" key={m.id}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#fdf8ff] transition">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden"
                        style={{ background:m.avatar_url?"transparent":(m.avatarBg||"#fce8ed"), color:m.avatarColor||"#a0435f" }}>
                        {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : (m.avatar||m.remitente?.[0]||"?")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
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

          </div>

          {/* Right sidebar */}
          <aside className="hidden xl:flex flex-col gap-4 w-[240px] shrink-0">

            {proximoPaso && (
              <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#f5f0ff] flex items-center justify-center text-base">🎯</div>
                  <h3 className="text-[12px] font-bold text-[#9a7080] uppercase tracking-wide">Próximo paso</h3>
                </div>
                <p className="text-[14px] font-bold text-[#1e1033] leading-snug mb-1">{proximoPaso.titulo}</p>
                <p className="text-[12px] text-[#9a7080] mb-4">{proximoPaso.detalle}</p>
                <Link href={proximoPaso.link||"#"}
                  className="w-full block text-center bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[12px] font-semibold py-2.5 rounded-xl transition">
                  {proximoPaso.label_boton}
                </Link>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
              <h3 className="text-[13px] font-bold text-[#1e1033] mb-3">Recordatorios importantes</h3>
              <div className="space-y-3">
                {recordDisplay.map(r => (
                  <div key={r.id} className="flex items-start gap-2.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      r.estado==="completado"?"bg-emerald-500 border-emerald-500":r.estado==="en_curso"?"border-amber-400":"border-gray-300"
                    }`}>
                      {r.estado==="completado" && <Check size={9} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-[#1e1033]">{r.label}</p>
                        {r.estado==="en_curso" && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">En curso</span>}
                      </div>
                      <p className={`text-[11px] ${r.estado==="en_curso"?"text-amber-600":r.estado==="completado"?"text-emerald-600":"text-[#9a7080]"}`}>{r.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/proceso"
                className="flex items-center justify-between text-[11px] text-[#7c3aed] font-semibold mt-4 pt-3 border-t border-[#f5eef8] hover:underline">
                Ver todos mis recordatorios <ChevronRight size={12} />
              </Link>
            </div>

            {reunion ? (
              <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={13} className="text-[#7c3aed]" />
                  <h3 className="text-[13px] font-bold text-[#1e1033]">Tu próxima reunión</h3>
                </div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#fce8ed] flex items-center justify-center overflow-hidden shrink-0">
                    {reunion.asesora_foto ? <img src={reunion.asesora_foto} alt="" className="w-full h-full object-cover" /> : <span className="text-[#a0435f] font-bold text-[12px]">{reunion.asesora?.[0]||"A"}</span>}
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
                <Link href="/dashboard/reuniones" className="w-full block text-center border border-[#ece4f0] hover:bg-[#fdf8ff] text-[#7c3aed] text-[12px] font-semibold py-2 rounded-xl transition">
                  Ver en calendario
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={13} className="text-[#7c3aed]" />
                  <h3 className="text-[13px] font-bold text-[#1e1033]">Tu próxima reunión</h3>
                </div>
                <p className="text-[12px] text-[#9a7080] mb-3">No tienes reuniones agendadas.</p>
                <Link href="/dashboard/reuniones" className="w-full block text-center bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[12px] font-semibold py-2.5 rounded-xl transition">
                  Agendar reunión
                </Link>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#ece4f0] shadow-sm p-4 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 pointer-events-none select-none text-[56px] opacity-20">🎈</div>
              <h3 className="text-[13px] font-bold text-[#1e1033] mb-1">¿Necesitas ayuda?</h3>
              <p className="text-[12px] text-[#9a7080] mb-3">Estamos aquí para ti.</p>
              <button className="flex items-center justify-center gap-2 text-[#7c3aed] border border-[#ede9fe] hover:bg-[#f5f0ff] text-[12px] font-semibold w-full py-2 rounded-xl transition">
                <MessageCircle size={13} /> Escribir a soporte
              </button>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}