"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, BookOpen, CheckCircle2, Clock, Lock,
  ChevronRight, PlayCircle, MessageCircle,
  Calendar, HelpCircle, ArrowRight, Edit3,
  BookMarked, UserCheck, Building2, Heart, FileCheck, Plane,
} from "lucide-react";

/* ─── Status config ────────────────────────────────────────────────────────── */
const PASO_ICON = { curso:BookOpen, evaluacion_perfil:UserCheck, perfil_agencia:Building2, match:Heart, visa:FileCheck, viaje:Plane };
const STATUS_STYLE = {
  completado:  { ring:"#10b981", bg:"#d1fae5", text:"text-emerald-600",  label:"Completado",  dot:"bg-emerald-500" },
  en_revision: { ring:"#f59e0b", bg:"#fef3c7", text:"text-amber-600",    label:"En revisión", dot:"bg-amber-400"   },
  disponible:  { ring:"#a0435f", bg:"#fce8ed", text:"text-[#a0435f]",    label:"Disponible",  dot:"bg-[#a0435f]"   },
  bloqueado:   { ring:"#d1d5db", bg:"#f3f4f6", text:"text-gray-400",     label:"Bloqueado",   dot:"bg-gray-300"    },
};

/* ─── Journey Step circle ──────────────────────────────────────────────────── */
function PasoCircle({ paso, isLast }) {
  const Icon  = PASO_ICON[paso.id] || BookOpen;
  const st    = STATUS_STYLE[paso.status] || STATUS_STYLE.bloqueado;
  const locked= paso.status === "bloqueado";
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center gap-2 min-w-[72px]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full flex items-center justify-center border-[2.5px] transition-all"
            style={{ borderColor: st.ring, background: st.bg }}>
            {locked
              ? <Lock size={18} className="text-gray-300" />
              : paso.status === "completado"
              ? <CheckCircle2 size={22} className="text-emerald-500" />
              : <Icon size={20} style={{ color: st.ring }} />
            }
          </div>
          {/* Status dot */}
          {!locked && paso.status !== "completado" && (
            <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${st.dot}`} />
          )}
        </div>
        <div className="text-center">
          <p className="text-[11px] font-semibold text-[#2d1a22] leading-tight text-center max-w-[72px]">{paso.label}</p>
          <p className={`text-[10px] font-medium mt-0.5 ${st.text}`}>{paso.sublabel}</p>
        </div>
      </div>
      {/* Connector line */}
      {!isLast && (
        <div className="flex-1 mx-1 flex items-center" style={{ marginBottom: 28 }}>
          <div className="w-full border-t-2 border-dashed" style={{ borderColor: st.ring === "#10b981" ? "#10b981" : "#e5e7eb" }} />
        </div>
      )}
    </div>
  );
}

/* ─── Progress summary card ───────────────────────────────────────────────── */
function PasoCard({ paso }) {
  const Icon = PASO_ICON[paso.id] || BookOpen;
  const st   = STATUS_STYLE[paso.status] || STATUS_STYLE.bloqueado;
  const locked = paso.status === "bloqueado";
  const actionLabel = {
    completado: "Ver curso", en_revision: "Ver estado",
    disponible: "¿Cómo funciona?", bloqueado: "Más información",
  };
  return (
    <div className="bg-white rounded-2xl border border-[#f0e8ea] p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: st.bg }}>
          {locked ? <Lock size={15} className="text-gray-300" /> : <Icon size={18} style={{ color: st.ring }} />}
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.text}`} style={{ background: st.bg }}>
          {paso.sublabel}
        </span>
      </div>
      <div>
        <p className="text-[12px] font-semibold text-[#2d1a22] leading-tight">{paso.label}</p>
      </div>
      <button className={`text-[11px] font-semibold ${locked ? "text-gray-300 cursor-not-allowed" : "text-[#a0435f] hover:underline"} text-left`}
        disabled={locked}>
        {actionLabel[paso.status]} {!locked && "→"}
      </button>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═════════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [user,       setUser]       = useState(null);
  const [sesData,    setSesData]    = useState(null);
  const [proceso,    setProceso]    = useState(null);
  const [mensajes,   setMensajes]   = useState([]);
  const [recursos,   setRecursos]   = useState([]);
  const [reunion,    setReunion]    = useState(null);
  const [recordat,   setRecordat]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r=>r.json()),
      fetch("/api/dashboard/sesiones").then(r=>{ if(r.status===401){router.push("/login");return null;} return r.json(); }),
      fetch("/api/dashboard/proceso").then(r=>r.json()).catch(()=>null),
      fetch("/api/dashboard/mensajes?limit=3").then(r=>r.json()).catch(()=>({mensajes:[]})),
      fetch("/api/dashboard/recursos?limit=4").then(r=>r.json()).catch(()=>({recursos:[]})),
      fetch("/api/dashboard/reunion").then(r=>r.json()).catch(()=>null),
      fetch("/api/dashboard/recordatorios").then(r=>r.json()).catch(()=>({recordatorios:[]})),
    ]).then(([me, ses, proc, msgs, recs, reu, recs2]) => {
      setUser(me?.user);
      if(ses) setSesData(ses);
      setProceso(proc);
      setMensajes(msgs?.mensajes||[]);
      setRecursos(recs?.recursos||[]);
      setReunion(reu?.reunion||null);
      setRecordat(recs2?.recordatorios||[]);
      if(me?.user && !me.user.vio_bienvenida) setMostrarBienvenida(true);
      setLoading(false);
    });
  }, []);

  const cerrarBienvenida = async () => {
    setMostrarBienvenida(false);
    await fetch("/api/dashboard/bienvenida",{method:"POST"});
  };

  if (loading) return (
    <div className="min-h-screen bg-[#faf5f6] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[13px] text-[#9a6672]">Cargando tu programa...</p>
      </div>
    </div>
  );

  const { completadas=0, total=0, porcentaje=0, sesiones=[] } = sesData||{};
  const pasos = proceso?.pasos || [];
  const notif = proceso?.notificacion;
  const proximoPaso = proceso?.proximoPaso;

  // Recordatorios por defecto si API no existe aún
  const recordatorios = recordat.length > 0 ? recordat : [
    { id:1, label:"Finaliza el curso",       sublabel:"¡Felicidades!",          estado:"completado" },
    { id:2, label:"Evaluación de perfil",    sublabel:"En revisión",             estado:"en_curso"   },
    { id:3, label:"Perfil con la agencia",   sublabel:"Pendiente aprobación",    estado:"pendiente"  },
  ];

  // Mensajes por defecto si API no existe aún
  const mensajesDisplay = mensajes.length > 0 ? mensajes : [
    { id:1, remitente:"Destino Au Pair",   texto:"Tu evaluación de perfil está en revisión. Te...", hora:"Hoy, 10:30 AM",  avatar:"D", avatarBg:"#fce8ed", avatarColor:"#a0435f" },
    { id:2, remitente:"Asesora Valentina", texto:"¡Hola! ¿Tienes dudas sobre...",                  hora:"Ayer, 4:20 PM",  avatar:"A", avatarBg:"#fef3c7", avatarColor:"#d97706" },
    { id:3, remitente:"Equipo Destino",    texto:"Recordatorio: Agendemos tu próxima reunión.",     hora:"19 may, 11:15", avatar:"E", avatarBg:"#e0f2fe", avatarColor:"#0369a1" },
  ];

  const cursoPaso = pasos.find(p=>p.id==="curso");
  const cursoCompleto = cursoPaso?.status === "completado" || completadas === total;
  const sesionActual  = sesiones.find(s=>s.estado==="available");

  return (
    <div className="min-h-screen bg-[#faf5f6]">
      {/* ── Top header ── */}
      <div className="bg-white border-b border-[#f0e8ea] px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[22px] md:text-[26px] font-bold text-[#2d1a22]">
            ¡Hola, {user?.nombre} {user?.apellido}! 👋
          </h1>
          <p className="text-[13px] text-[#9a7080] mt-0.5">Cada paso te acerca más a tu aventura. Estamos aquí para acompañarte. 💜</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="relative p-2 rounded-xl border border-[#f0e8ea] bg-white hover:bg-[#fff0f3] transition">
            <Bell size={18} className="text-[#9a7080]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#a0435f] rounded-full" />
          </button>
          <Link href="/dashboard/reuniones"
            className="hidden sm:flex items-center gap-2 border border-[#e0d0d4] text-[#6b4a54] text-[13px] font-medium px-4 py-2 rounded-xl hover:bg-[#fff0f3] transition">
            <Calendar size={14} /> Agendar reunión
          </Link>
          <Link href="/dashboard/proceso"
            className="hidden sm:flex items-center gap-2 bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition">
            Ver mi proceso completo <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex gap-5 p-5 md:p-6">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Journey roadmap */}
          <div className="bg-white rounded-2xl border border-[#f0e8ea] p-5 shadow-sm">
            <h2 className="text-[15px] font-semibold text-[#2d1a22] mb-5">Mi Destino Au Pair</h2>
            {pasos.length === 0 ? (
              /* Skeleton / fallback roadmap */
              <div className="flex items-center overflow-x-auto pb-2">
                {["Curso","Evaluación de perfil","Perfil con la agencia","Match","Visa","Viaje"].map((l,i,arr)=>(
                  <div key={l} className="flex items-center">
                    <div className="flex flex-col items-center gap-2 min-w-[72px]">
                      <div className="w-14 h-14 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                        <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                      <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
                    </div>
                    {i<arr.length-1&&<div className="flex-1 mx-1 border-t-2 border-dashed border-gray-200" style={{ marginBottom:28 }} />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start overflow-x-auto pb-2">
                {pasos.map((p,i)=><PasoCircle key={p.id} paso={p} isLast={i===pasos.length-1} />)}
              </div>
            )}
          </div>

          {/* Notification bar */}
          {notif && (
            <div className={`rounded-2xl border px-5 py-3.5 flex items-center justify-between gap-4 ${
              notif.tipo==="en_revision"
                ? "bg-[#fffbeb] border-[#fde68a]"
                : "bg-[#f0fdf4] border-[#bbf7d0]"
            }`}>
              <div className="flex items-start gap-3">
                <Clock size={16} className={notif.tipo==="en_revision"?"text-amber-500":"text-emerald-500"} style={{ marginTop:2 }} />
                <div>
                  <p className="text-[13px] font-semibold text-[#2d1a22]">{notif.texto}</p>
                  <p className="text-[12px] text-[#9a7080] mt-0.5">{notif.detalle}</p>
                </div>
              </div>
              <Link href={notif.link||"#"}
                className="text-[12px] font-semibold text-[#a0435f] hover:underline whitespace-nowrap shrink-0">
                Ver detalles
              </Link>
            </div>
          )}

          {/* Progress summary cards */}
          {pasos.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold text-[#2d1a22] mb-3">Resumen de tu progreso</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {pasos.map(p=><PasoCard key={p.id} paso={p} />)}
              </div>
            </div>
          )}

          {/* Course status + Messages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Course status */}
            <div className="bg-white rounded-2xl border border-[#f0e8ea] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f5eced]">
                <h3 className="text-[14px] font-semibold text-[#2d1a22]">Estado de tu curso</h3>
              </div>
              <div className="p-5">
                {/* Course thumbnail */}
                <div className="rounded-xl overflow-hidden mb-4 h-28 bg-gradient-to-br from-[#2d1a22] to-[#5a2a3a] flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#e8849a"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/></svg>
                  </div>
                  <div className="relative text-center">
                    <div className="text-3xl mb-1">{cursoCompleto ? "🎉" : "📚"}</div>
                    <p className="text-white text-[12px] font-semibold">Destino Au Pair</p>
                  </div>
                </div>

                {cursoCompleto ? (
                  <div>
                    <p className="text-[14px] font-semibold text-[#2d1a22] mb-1">¡Felicidades! 🎓</p>
                    <p className="text-[12px] text-[#9a7080] mb-3">Has completado todos los módulos del curso.</p>
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3 py-2 mb-3">
                      <p className="text-[11px] text-emerald-700 font-medium">✓ Enviado para revisión</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[13px] font-semibold text-[#2d1a22]">{completadas} de {total} sesiones</p>
                      <span className="text-[12px] font-bold text-[#a0435f]">{porcentaje}%</span>
                    </div>
                    <div className="h-2 bg-[#f0e8ea] rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:`${porcentaje}%`, background:"linear-gradient(90deg,#a0435f,#e8849a)" }} />
                    </div>
                  </div>
                )}

                <button onClick={()=>router.push("/dashboard/curso")}
                  className="w-full text-center text-[12px] font-semibold text-[#a0435f] hover:text-[#8a3550] border border-[#f0dde2] hover:border-[#e8b0bc] py-2 rounded-xl transition">
                  {cursoCompleto ? "Ver mis módulos →" : (sesionActual ? `▶ Continuar — ${sesionActual.titulo}` : "Ver mis módulos →")}
                </button>
              </div>
            </div>

            {/* Recent messages */}
            <div className="bg-white rounded-2xl border border-[#f0e8ea] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f5eced] flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-[#2d1a22]">Mensajes recientes</h3>
                <Link href="/dashboard/mensajes" className="text-[12px] font-semibold text-[#a0435f] hover:underline">Ver todos</Link>
              </div>
              <div className="divide-y divide-[#f5eced]">
                {mensajesDisplay.map(m=>(
                  <Link href="/dashboard/mensajes" key={m.id}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#fff8f9] transition">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold overflow-hidden"
                      style={{ background: m.avatar_url ? "transparent" : (m.avatarBg||"#fce8ed"), color: m.avatarColor||"#a0435f" }}>
                      {m.avatar_url
                        ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                        : (m.avatar||m.remitente?.[0]||"?")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[12px] font-semibold text-[#2d1a22] truncate">{m.remitente}</p>
                        <p className="text-[10px] text-[#b0909a] shrink-0">{m.hora||m.tiempo}</p>
                      </div>
                      <p className="text-[11px] text-[#9a7080] truncate mt-0.5">{m.texto||m.preview}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Resources */}
          {recursos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-semibold text-[#2d1a22]">Recursos recomendados para ti</h2>
                <Link href="/dashboard/recursos" className="text-[12px] font-semibold text-[#a0435f] hover:underline">Ver todos</Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recursos.slice(0,4).map(r=>(
                  <Link href={r.link||`/dashboard/recursos/${r.id}`} key={r.id}
                    className="bg-white rounded-2xl border border-[#f0e8ea] shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                    <div className="h-24 bg-gradient-to-br from-[#fce8ed] to-[#f0c0cc] relative overflow-hidden">
                      {r.imagen
                        ? <img src={r.imagen} alt={r.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl">{r.emoji||"📖"}</div>
                      }
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] font-semibold text-[#2d1a22] leading-tight mb-1">{r.titulo}</p>
                      <p className="text-[10px] text-[#9a7080] mb-2">{r.categoria||"Recurso"}</p>
                      <div className="h-1.5 bg-[#f0e8ea] rounded-full overflow-hidden">
                        <div className="h-full bg-[#a0435f] rounded-full" style={{ width:`${r.progreso||0}%` }} />
                      </div>
                      <p className="text-[10px] text-[#b0909a] mt-1">{r.progreso||0}%</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden xl:flex flex-col gap-4 w-64 shrink-0">

          {/* Próximo paso */}
          {proximoPaso && (
            <div className="bg-white rounded-2xl border border-[#f0e8ea] shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#fce8ed] flex items-center justify-center">
                  <ChevronRight size={14} className="text-[#a0435f]" />
                </div>
                <h3 className="text-[13px] font-semibold text-[#2d1a22]">Próximo paso</h3>
              </div>
              <p className="text-[14px] font-bold text-[#2d1a22] mb-1">{proximoPaso.titulo}</p>
              <p className="text-[12px] text-[#9a7080] mb-4">{proximoPaso.detalle}</p>
              <Link href={proximoPaso.link||"#"}
                className="w-full block text-center bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[12px] font-semibold py-2.5 rounded-xl transition">
                {proximoPaso.label_boton}
              </Link>
            </div>
          )}

          {/* Recordatorios */}
          <div className="bg-white rounded-2xl border border-[#f0e8ea] shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-[#2d1a22]">Recordatorios importantes</h3>
            </div>
            <div className="space-y-3">
              {recordatorios.map(r=>(
                <div key={r.id} className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    r.estado==="completado"
                      ? "bg-emerald-500 border-emerald-500"
                      : r.estado==="en_curso"
                      ? "border-amber-400 bg-transparent"
                      : "border-gray-300 bg-transparent"
                  }`}>
                    {r.estado==="completado" && <span className="text-white text-[8px]">✓</span>}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#2d1a22]">{r.label}</p>
                    <p className={`text-[11px] ${r.estado==="en_curso"?"text-amber-600":r.estado==="completado"?"text-emerald-600":"text-[#9a7080]"}`}>
                      {r.sublabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/proceso"
              className="flex items-center justify-between text-[11px] text-[#a0435f] font-semibold mt-4 hover:underline">
              Ver todos mis recordatorios <ChevronRight size={12} />
            </Link>
          </div>

          {/* Próxima reunión */}
          {reunion ? (
            <div className="bg-white rounded-2xl border border-[#f0e8ea] shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-[#a0435f]" />
                <h3 className="text-[13px] font-semibold text-[#2d1a22]">Tu próxima reunión</h3>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#fce8ed] flex items-center justify-center overflow-hidden shrink-0">
                  {reunion.asesora_foto
                    ? <img src={reunion.asesora_foto} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[#a0435f] font-bold text-[13px]">{reunion.asesora?.[0]||"A"}</span>
                  }
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#2d1a22]">1 a 1 con tu asesora</p>
                  <p className="text-[11px] text-[#9a7080]">{reunion.asesora}</p>
                </div>
              </div>
              <div className="bg-[#fff8f9] rounded-xl px-3 py-2 mb-3">
                <p className="text-[12px] font-semibold text-[#2d1a22]">{reunion.fecha}</p>
                <p className="text-[11px] text-[#9a7080]">{reunion.hora}</p>
              </div>
              <Link href="/dashboard/reuniones"
                className="w-full block text-center border border-[#f0dde2] hover:bg-[#fff0f3] text-[#a0435f] text-[12px] font-semibold py-2 rounded-xl transition">
                Ver en calendario
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#f0e8ea] shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-[#a0435f]" />
                <h3 className="text-[13px] font-semibold text-[#2d1a22]">Tu próxima reunión</h3>
              </div>
              <p className="text-[12px] text-[#9a7080] mb-3">No tienes reuniones agendadas.</p>
              <Link href="/dashboard/reuniones"
                className="w-full block text-center bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[12px] font-semibold py-2.5 rounded-xl transition">
                Agendar reunión
              </Link>
            </div>
          )}

          {/* Help */}
          <div className="bg-white rounded-2xl border border-[#f0e8ea] shadow-sm p-4 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 text-5xl opacity-25 pointer-events-none select-none">🎈</div>
            <h3 className="text-[13px] font-semibold text-[#2d1a22] mb-1">¿Necesitas ayuda?</h3>
            <p className="text-[12px] text-[#9a7080] mb-3">Estamos aquí para ti.</p>
            <button className="flex items-center gap-2 text-[#a0435f] border border-[#f0dde2] hover:bg-[#fff0f3] text-[12px] font-semibold w-full justify-center py-2 rounded-xl transition">
              <MessageCircle size={13} /> Escribir a soporte
            </button>
          </div>
        </aside>
      </div>

      {/* ── Welcome modal ── */}
      {mostrarBienvenida && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={cerrarBienvenida} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#2d1a22] via-[#e8849a] to-[#2d1a22]" />
            <div className="p-7 text-center">
              <div className="text-5xl mb-4">🌍✈️</div>
              <h2 className="font-serif text-[26px] italic text-[#a0435f] mb-2">
                ¡Bienvenida,<br /><span className="italic">{user.nombre}!</span>
              </h2>
              <p className="text-[13px] text-[#7a4a54] leading-relaxed mb-6">
                Tu destino au pair empieza hoy. Comienza con la sesión de bienvenida 👋🏻 Es gratis y te tomará solo unos minutos. 💕
              </p>
              <div className="bg-[#fff8f9] border border-[#f0dde2] rounded-2xl p-4 mb-6 text-left">
                <p className="text-[12px] text-[#7a4a54] italic leading-relaxed mb-3">
                  "Estamos muy emocionadas de tenerte aquí. Este programa lo creamos con todo el amor para que llegues preparada a tu familia anfitriona."
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="w-7 h-7 rounded-full bg-[#fce8ed] border-2 border-white flex items-center justify-center">
                      <span className="text-[#a0435f] text-[10px] font-serif font-bold">J</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#e8e0f8] border-2 border-white flex items-center justify-center">
                      <span className="text-[#6b4f9e] text-[10px] font-serif font-bold">T</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-[#a0435f]">Jennifer y Tati 💕</p>
                </div>
              </div>
              <button onClick={cerrarBienvenida}
                className="w-full bg-[#a0435f] hover:bg-[#8a3550] text-white font-medium text-[14px] py-3.5 rounded-2xl transition shadow-lg shadow-[#a0435f]/20">
                ¡Empezar mi Destino! 🚀
              </button>
              <p className="text-[11px] text-[#9a6672] mt-3">Tu primera sesión es completamente gratis 🎉</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}