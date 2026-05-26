"use client";
// app/dashboard/reuniones/page.jsx

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, ArrowRight, Video, CalendarPlus, Lock,
  ChevronLeft, ChevronRight, X, Check, Clock,
  CheckCircle2, XCircle, Users, Megaphone, BookOpen,
  Phone, Star, AlertCircle,
} from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";
import { useMobile } from "@/context/MobileContext";

/* ── Helpers ── */
const DIAS   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES  = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function pad(n) { return String(n).padStart(2,"0"); }
function fechaStr(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function fmtHora(t) { return t ? t.slice(0,5) : ""; }
function fmtFecha(f) {
  if (!f) return "";
  const d = new Date(f+"T12:00:00");
  return d.toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"});
}

function buildCalendarUrl(titulo, fecha, horaInicio, horaFin, meetUrl) {
  const start = `${fecha?.replace(/-/g,"")}T${(horaInicio||"09:00").replace(":","").padEnd(6,"0")}`;
  const end   = `${fecha?.replace(/-/g,"")}T${(horaFin||"10:00").replace(":","").padEnd(6,"0")}`;
  const p = new URLSearchParams({ action:"TEMPLATE", text:titulo||"Reunión Destino Au Pair", dates:`${start}/${end}`, location:meetUrl||"Google Meet" });
  return `https://calendar.google.com/calendar/render?${p}`;
}
function cleanFecha(f) {
  if (!f) return "";
  if (typeof f === "string") return f.split("T")[0];
  if (f instanceof Date) return fechaStr(f);
  return String(f).split("T")[0];
}

/* ── Tipo de evento → config ── */
const TIPO_CFG = {
  foro:           { color:"#7c3aed", bg:"#ede9fe", emoji:"💬", label:"Foro"         },
  llamada_grupal: { color:"#0369a1", bg:"#dbeafe", emoji:"📞", label:"Llamada"       },
  taller:         { color:"#d97706", bg:"#fef3c7", emoji:"🛠️", label:"Taller"        },
  importante:     { color:"#dc2626", bg:"#fee2e2", emoji:"🔔", label:"Importante"    },
  otro:           { color:"#6b7280", bg:"#f3f4f6", emoji:"📌", label:"Evento"        },
  reunion:        { color:"#5b21b6", bg:"#ede9fe", emoji:"👩‍💼", label:"Mi reunión"   },
  disponible:     { color:"#10b981", bg:"#d1fae5", emoji:"✅", label:"Disponible"    },
};

/* ── Modal para reservar slot ── */
function ModalReservar({ slot, onClose, onConfirm, loading }) {
  const [notas, setNotas] = useState("");
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:420,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ height:4,background:"linear-gradient(90deg,#5b21b6,#a0435f)",borderRadius:99,marginBottom:20 }}/>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>👩‍💼</div>
          <div>
            <p style={{ fontSize:15,fontWeight:700,color:"#1e1033",margin:0 }}>Reservar reunión</p>
            <p style={{ fontSize:12,color:"#9a7080",margin:0 }}>con {slot.asesora_nombre} {slot.asesora_apellido}</p>
          </div>
        </div>
        <div style={{ background:"#f5f0ff",borderRadius:14,padding:"12px 16px",marginBottom:16 }}>
          <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:"0 0 4px" }}>📅 {fmtFecha(slot.fecha)}</p>
          <p style={{ fontSize:13,color:"#7c3aed",margin:0 }}>🕐 {fmtHora(slot.hora_inicio)} — {fmtHora(slot.hora_fin)}</p>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:".7px",display:"block",marginBottom:6 }}>
            Notas para la asesora (opcional)
          </label>
          <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={3}
            placeholder="¿Algún tema puntual que quieras tratar?"
            style={{ width:"100%",border:"1.5px solid #f0dde2",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#1e1033",outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"none" }}/>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onClose}
            style={{ flex:1,padding:"11px",borderRadius:12,border:"1.5px solid #e5e7eb",background:"#fff",color:"#6b7280",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            Cancelar
          </button>
          <button onClick={()=>onConfirm(slot.id, notas)} disabled={loading}
            style={{ flex:2,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#5b21b6,#7c3aed)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:loading?0.6:1 }}>
            {loading?"Reservando...":"✓ Confirmar reunión"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal detalle evento/slot ── */
function ModalDetalle({ item, tipo, onClose, onReservar, miReunion, onCancelar, loadingCancel }) {
  const cfg = TIPO_CFG[tipo]||TIPO_CFG.otro;
  const esSlot = tipo==="disponible";
  const esMiReunion = tipo==="reunion";

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:400,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ height:4,background:cfg.color,borderRadius:99,marginBottom:20 }}/>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:40,height:40,borderRadius:12,background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{cfg.emoji}</div>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:cfg.color,textTransform:"uppercase",letterSpacing:".7px",margin:0 }}>{cfg.label}</p>
              <p style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:0 }}>{item.titulo||`Reunión con ${item.asesora_nombre}`}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#f3f4f6",border:"none",borderRadius:99,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={14} style={{ color:"#6b7280" }}/>
          </button>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:16 }}>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <span style={{ fontSize:12 }}>📅</span>
            <span style={{ fontSize:13,color:"#1e1033",fontWeight:500 }}>{fmtFecha(item.fecha)}</span>
          </div>
          {(item.hora_inicio||item.hora_fin) && (
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <span style={{ fontSize:12 }}>🕐</span>
              <span style={{ fontSize:13,color:"#1e1033" }}>{fmtHora(item.hora_inicio)} — {fmtHora(item.hora_fin)}</span>
            </div>
          )}
          {(item.asesora_nombre||item.asesora) && (
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <span style={{ fontSize:12 }}>👩‍💼</span>
              <span style={{ fontSize:13,color:"#1e1033" }}>{item.asesora_nombre} {item.asesora_apellido||""}</span>
            </div>
          )}
          {item.descripcion && (
            <p style={{ fontSize:13,color:"#9a7080",margin:"4px 0 0",lineHeight:1.5 }}>{item.descripcion}</p>
          )}
        </div>

        {esSlot && !miReunion && (
          <button onClick={()=>onReservar(item)}
            style={{ width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#5b21b6,#7c3aed)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            ✓ Reservar este horario
          </button>
        )}

        {esSlot && miReunion && (
          <div style={{ background:"#fef3c7",borderRadius:12,padding:"10px 14px",fontSize:12,color:"#92400e" }}>
            ⚠️ Ya tienes una reunión agendada. Cancélala primero para reservar otro horario.
          </div>
        )}

        {esMiReunion && (
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {item.url_meet && (
              <a href={item.url_meet} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"11px",borderRadius:12,background:"#5b21b6",color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none" }}>
                <Video size={14}/> Unirse al Meet
              </a>
            )}
            <a href={buildCalendarUrl(`Reunión con ${item.asesora_nombre}`,item.fecha,item.hora_inicio,item.hora_fin,item.url_meet)} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"11px",borderRadius:12,border:"1.5px solid #ede9fe",color:"#7c3aed",fontSize:13,fontWeight:600,textDecoration:"none" }}>
              <CalendarPlus size={14}/> Agregar a Google Calendar
            </a>
            <button onClick={()=>onCancelar(item.reunion_id)} disabled={loadingCancel}
              style={{ padding:"10px",borderRadius:12,border:"1.5px solid #fecaca",background:"#fee2e2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:loadingCancel?0.6:1 }}>
              {loadingCancel?"Cancelando...":"Cancelar reunión"}
            </button>
          </div>
        )}

        {!esSlot && !esMiReunion && item.url_meet && (
          <a href={item.url_meet} target="_blank" rel="noopener noreferrer"
            style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"11px",borderRadius:12,background:cfg.color,color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none" }}>
            <Video size={14}/> Unirse al evento
          </a>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function ReunionesPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,      setUser]      = useState(null);
  const [slots,     setSlots]     = useState([]);
  const [eventos,   setEventos]   = useState([]);
  const [reuniones, setReuniones] = useState([]);
  const [proceso,   setProceso]   = useState(null);
  const [miReunion, setMiReunion] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [acceso,    setAcceso]    = useState(null);
  const [toast,     setToast]     = useState(null);

  const hoy = new Date();
  const [mesActual, setMesActual] = useState({ y: hoy.getFullYear(), m: hoy.getMonth() });
  const [diaSelec,  setDiaSelec]  = useState(null);
  const [modalSlot, setModalSlot] = useState(null);      // slot a reservar
  const [modalItem, setModalItem] = useState(null);      // {item, tipo}
  const [loadingRes,   setLoadingRes]   = useState(false);
  const [loadingCancel,setLoadingCancel]= useState(false);

  const mesStr = `${mesActual.y}-${pad(mesActual.m+1)}`;

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = async() => {
    const safe=(p,fb=null)=>p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    const [me, dispData, evData, reunData, proc] = await Promise.all([
      safe(fetch("/api/auth/me"),                                    {user:null}),
      safe(fetch(`/api/dashboard/disponibilidad?mes=${mesStr}`),    {slots:[],reunion:null}),
      safe(fetch(`/api/admin/eventos?mes=${mesStr}`),                {eventos:[]}),
      safe(fetch("/api/dashboard/reuniones"),                        {reuniones:[]}),
      safe(fetch("/api/dashboard/proceso"),                          null),
    ]);
    if (me?.user?.rol==="admin") { router.push("/admin"); return; }
    setUser(me?.user||null);
    setSlots(dispData?.slots||[]);
    setMiReunion(dispData?.reunion||null);
    setEventos(evData?.eventos||[]);
    setReuniones(reunData?.reuniones||[]);
    setProceso(proc);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/dashboard/acceso").then(r=>r.json()).then(d=>setAcceso(d.reuniones)).catch(()=>setAcceso(true));
  }, []);

  useEffect(() => { cargar(); }, [mesStr]);

  /* ── Construir mapa de días ── */
  const diasMapa = useMemo(() => {
  const mapa = {};
  slots.forEach(s => {
    const f = cleanFecha(s.fecha);
    if (!mapa[f]) mapa[f] = { slots:[], eventos:[], miReunion:null };
    mapa[f].slots.push(s);
    if (s.reservado_por === user?.id) mapa[f].miReunion = s;
  });
  eventos.forEach(e => {
    const f = cleanFecha(e.fecha);
    if (!mapa[f]) mapa[f] = { slots:[], eventos:[], miReunion:null };
    mapa[f].eventos.push(e);
  });
  if (miReunion) {
    const f = cleanFecha(miReunion.fecha);
    if (!mapa[f]) mapa[f] = { slots:[], eventos:[], miReunion:null };
    mapa[f].miReunion = miReunion;
  }
  return mapa;
}, [slots, eventos, miReunion, user]);

  /* ── Celdas del mes ── */
  const celdas = useMemo(() => {
    const primero = new Date(mesActual.y, mesActual.m, 1);
    const ultimo  = new Date(mesActual.y, mesActual.m+1, 0);
    const arr = [];
    for (let i=0; i<primero.getDay(); i++) arr.push(null);
    for (let d=1; d<=ultimo.getDate(); d++) arr.push(new Date(mesActual.y, mesActual.m, d));
    return arr;
  }, [mesActual]);

  const navMes = (dir) => {
    setMesActual(prev => {
      let m = prev.m+dir, y = prev.y;
      if (m>11) { m=0; y++; }
      if (m<0)  { m=11; y--; }
      return { y, m };
    });
    setDiaSelec(null);
  };

  const reservar = async(slotId, notas) => {
    setLoadingRes(true);
    const res = await fetch("/api/dashboard/reuniones",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ disponibilidad_id:slotId, notas_cliente:notas }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("✓ Reunión confirmada 🎉");
      setModalSlot(null); setModalItem(null);
      await cargar();
    } else showToast(data.error||"Error al reservar","error");
    setLoadingRes(false);
  };

  const cancelar = async(reunionId) => {
    if (!confirm("¿Cancelar esta reunión?")) return;
    setLoadingCancel(true);
    const res = await fetch(`/api/dashboard/reuniones?id=${reunionId}`,{method:"DELETE"});
    if (res.ok) {
      showToast("Reunión cancelada");
      setModalItem(null);
      await cargar();
    } else showToast("Error al cancelar","error");
    setLoadingCancel(false);
  };

  const diaInfo = diaSelec ? (diasMapa[fechaStr(diaSelec)]||{slots:[],eventos:[],miReunion:null}) : null;

  /* ── Loading / acceso ── */
  if (loading||acceso===null) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #e8849a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (acceso===false) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32,textAlign:"center" }}>
      <div style={{ width:64,height:64,borderRadius:"50%",background:"#fce8ed",display:"flex",alignItems:"center",justifyContent:"center" }}><Lock size={28} style={{ color:"#a0435f" }}/></div>
      <h2 style={{ fontFamily:"Georgia,serif",fontWeight:700,color:"#2d1a22",fontSize:20,margin:0 }}>Esta sección no está disponible aún</h2>
      <p style={{ color:"#9a6672",fontSize:14,maxWidth:300,margin:0,lineHeight:1.6 }}>Jenni está preparando tu acceso.</p>
      <Link href="/dashboard" style={{ background:"#a0435f",color:"#fff",fontSize:13,fontWeight:600,padding:"12px 28px",borderRadius:14,textDecoration:"none" }}>Volver al inicio</Link>
    </div>
  );

  const fasesComp = proceso?.pasos?.filter(p=>["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id)&&p.status==="completado")?.length||0;
  const hoyStr = fechaStr(hoy);

  return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Toast */}
      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:200,background:toast.tipo==="error"?"#dc2626":"#1e1033",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.15)" }}>{toast.msg}</div>}

      {/* Modales */}
      {modalSlot && <ModalReservar slot={modalSlot} onClose={()=>setModalSlot(null)} onConfirm={reservar} loading={loadingRes}/>}
      {modalItem && <ModalDetalle item={modalItem.item} tipo={modalItem.tipo} onClose={()=>setModalItem(null)} onReservar={(s)=>{setModalItem(null);setModalSlot(s);}} miReunion={miReunion} onCancelar={cancelar} loadingCancel={loadingCancel}/>}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #ece8f0",padding:isMobile?"12px 16px":"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,position:"sticky",top:0,zIndex:20 }}>
        <div style={{ minWidth:0 }}>
          <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?18:22,fontWeight:700,color:"#1e1033",margin:0 }}>Calendario 📅</h1>
          {!isMobile && <p style={{ fontSize:13,color:"#9a7080",margin:"2px 0 0" }}>Reserva tu reunión y mantente al día con los eventos. 💜</p>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          <button style={{ position:"relative",padding:8,borderRadius:12,border:"1px solid #ece4f0",background:"#fff",cursor:"pointer" }}>
            <Bell size={17} style={{ color:"#9a7080" }}/>
            <span style={{ position:"absolute",top:6,right:6,width:7,height:7,background:"#a0435f",borderRadius:"50%",border:"1.5px solid #fff" }}/>
          </button>
          {!isMobile && (
            <Link href="/dashboard/proceso" style={{ display:"flex",alignItems:"center",gap:6,background:"#5b21b6",color:"#fff",fontSize:13,fontWeight:600,padding:"9px 16px",borderRadius:12,textDecoration:"none" }}>
              Ver mi proceso <ArrowRight size={13}/>
            </Link>
          )}
        </div>
      </div>

      <div style={{ maxWidth:1400,margin:"0 auto",padding:isMobile?"14px 16px 40px":"20px 24px 40px",display:"flex",gap:20,flexDirection:isMobile?"column":"row" }}>
        <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:16 }}>

          {/* Mi reunión activa */}
          {miReunion && (
            <div style={{ background:"linear-gradient(135deg,#5b21b6,#7c3aed)",borderRadius:20,padding:isMobile?"16px":"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",boxShadow:"0 8px 24px rgba(91,33,182,.25)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:44,height:44,borderRadius:14,background:"rgba(255,255,255,.15)",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {miReunion.asesora_foto
                    ? <img src={miReunion.asesora_foto} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                    : <span style={{ fontSize:20 }}>👩‍💼</span>}
                </div>
                <div>
                  <p style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,margin:"0 0 2px" }}>Tu reunión confirmada</p>
                  <p style={{ fontSize:isMobile?14:16,fontWeight:700,color:"#fff",margin:"0 0 2px" }}>
                    con {miReunion.asesora_nombre} {miReunion.asesora_apellido}
                  </p>
                  <p style={{ fontSize:12,color:"rgba(255,255,255,.8)",margin:0 }}>
                    {fmtFecha(miReunion.fecha)} · {fmtHora(miReunion.hora_inicio)}
                  </p>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {miReunion.url_meet && (
                  <a href={miReunion.url_meet} target="_blank" rel="noopener noreferrer"
                    style={{ display:"flex",alignItems:"center",gap:6,background:"#fff",color:"#5b21b6",fontSize:12,fontWeight:700,padding:"8px 14px",borderRadius:12,textDecoration:"none" }}>
                    <Video size={13}/> Unirse
                  </a>
                )}
                <a href={buildCalendarUrl(`Reunión con ${miReunion.asesora_nombre}`,miReunion.fecha,miReunion.hora_inicio,miReunion.hora_fin,miReunion.url_meet)} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.15)",color:"#fff",fontSize:12,fontWeight:600,padding:"8px 14px",borderRadius:12,textDecoration:"none",border:"1px solid rgba(255,255,255,.3)" }}>
                  <CalendarPlus size={13}/> Calendar
                </a>
              </div>
            </div>
          )}

          {/* Leyenda */}
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {[
              { color:"#10b981", label:"Disponible para reservar" },
              { color:"#5b21b6", label:"Mi reunión" },
              { color:"#dc2626", label:"Importante" },
              { color:"#7c3aed", label:"Evento / Foro" },
            ].map((l,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:5,background:"#fff",border:"1px solid #ece4f0",borderRadius:99,padding:"4px 10px" }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:l.color,flexShrink:0 }}/>
                <span style={{ fontSize:11,color:"#6b7280" }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* CALENDARIO */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            {/* Header mes */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:isMobile?"14px 16px":"16px 24px",borderBottom:"1px solid #f5eef8" }}>
              <button onClick={()=>navMes(-1)} style={{ width:34,height:34,borderRadius:99,border:"1.5px solid #ece4f0",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <ChevronLeft size={16} style={{ color:"#6b7280" }}/>
              </button>
              <h2 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?16:18,fontWeight:700,color:"#1e1033",margin:0 }}>
                {MESES[mesActual.m]} {mesActual.y}
              </h2>
              <button onClick={()=>navMes(1)} style={{ width:34,height:34,borderRadius:99,border:"1.5px solid #ece4f0",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <ChevronRight size={16} style={{ color:"#6b7280" }}/>
              </button>
            </div>

            {/* Días de la semana */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid #f5eef8" }}>
              {DIAS.map(d=>(
                <div key={d} style={{ padding:isMobile?"6px 0":"8px 0",textAlign:"center",fontSize:11,fontWeight:700,color:"#9a7080",textTransform:"uppercase" }}>{d}</div>
              ))}
            </div>

            {/* Celdas */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)" }}>
              {celdas.map((dia,i) => {
                if (!dia) return <div key={`e${i}`}/>;
                const fStr = fechaStr(dia);
                const info = diasMapa[fStr]||{};
                const esHoy = fStr===hoyStr;
                const esSel = diaSelec && fechaStr(diaSelec)===fStr;
                const tieneMiReunion = info.miReunion;
                const tieneSlots = (info.slots||[]).filter(s=>s.estado==="disponible").length>0;
                const tieneEventos = (info.eventos||[]).length>0;
                const esAntes = dia < hoy && !esHoy;

                return (
                  <div key={fStr} onClick={()=>setDiaSelec(dia)}
                    style={{ padding:isMobile?"6px 4px":"8px 6px",minHeight:isMobile?52:68,borderRight:"1px solid #f5eef8",borderBottom:"1px solid #f5eef8",cursor:"pointer",transition:"background .1s",
                      background:esSel?"#f5f0ff":esHoy?"#fce8ed":"#fff",
                      opacity:esAntes?.5:1,
                    }}>
                    <div style={{ display:"flex",justifyContent:"center",marginBottom:4 }}>
                      <span style={{ width:isMobile?26:30,height:isMobile?26:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:isMobile?12:13,fontWeight:esHoy?700:500,
                        background:esHoy?"#a0435f":esSel?"#7c3aed":"transparent",
                        color:esHoy||esSel?"#fff":"#1e1033",
                      }}>{dia.getDate()}</span>
                    </div>
                    {/* Puntos indicadores */}
                    <div style={{ display:"flex",justifyContent:"center",gap:3,flexWrap:"wrap" }}>
                      {tieneMiReunion && <div style={{ width:6,height:6,borderRadius:"50%",background:"#5b21b6" }}/>}
                      {tieneSlots && <div style={{ width:6,height:6,borderRadius:"50%",background:"#10b981" }}/>}
                      {tieneEventos && <div style={{ width:6,height:6,borderRadius:"50%",background:"#7c3aed" }}/>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel del día seleccionado */}
          {diaSelec && diaInfo && (
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"14px 20px",borderBottom:"1px solid #f5eef8",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <h3 style={{ fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#1e1033",margin:0 }}>
                  {fmtFecha(fechaStr(diaSelec))}
                </h3>
                <button onClick={()=>setDiaSelec(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"#9a7080" }}><X size={16}/></button>
              </div>

              {/* Mi reunión en este día */}
              {diaInfo.miReunion && (
                <div style={{ padding:"12px 20px",borderBottom:"1px solid #f5eef8",background:"#f5f0ff" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:32,height:32,borderRadius:10,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>👩‍💼</div>
                      <div>
                        <p style={{ fontSize:12,fontWeight:700,color:"#5b21b6",margin:0 }}>Tu reunión confirmada</p>
                        <p style={{ fontSize:12,color:"#7c3aed",margin:0 }}>
                          {fmtHora(diaInfo.miReunion.hora_inicio)} — {fmtHora(diaInfo.miReunion.hora_fin)} · con {diaInfo.miReunion.asesora_nombre}
                        </p>
                      </div>
                    </div>
                    <button onClick={()=>setModalItem({item:{...diaInfo.miReunion,reunion_id:diaInfo.miReunion.reunion_id||diaInfo.miReunion.id},tipo:"reunion"})}
                      style={{ fontSize:11,fontWeight:600,color:"#7c3aed",border:"1.5px solid #ede9fe",background:"#fff",padding:"5px 12px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}>
                      Ver detalles
                    </button>
                  </div>
                </div>
              )}

              {/* Slots disponibles */}
              {(diaInfo.slots||[]).filter(s=>s.estado==="disponible").length>0 && (
                <div style={{ padding:"12px 20px",borderBottom:diaInfo.eventos?.length?"1px solid #f5eef8":"none" }}>
                  <p style={{ fontSize:11,fontWeight:700,color:"#10b981",textTransform:"uppercase",letterSpacing:".5px",margin:"0 0 10px" }}>Horarios disponibles</p>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {diaInfo.slots.filter(s=>s.estado==="disponible").map(s=>(
                      <div key={s.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,background:"#f0fdf4",borderRadius:12,padding:"10px 14px",border:"1px solid #bbf7d0" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          {s.asesora_foto
                            ? <img src={s.asesora_foto} alt="" style={{ width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>
                            : <div style={{ width:28,height:28,borderRadius:"50%",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>👩‍💼</div>}
                          <div>
                            <p style={{ fontSize:12,fontWeight:600,color:"#065f46",margin:0 }}>{fmtHora(s.hora_inicio)} — {fmtHora(s.hora_fin)}</p>
                            <p style={{ fontSize:11,color:"#059669",margin:0 }}>{s.asesora_nombre} {s.asesora_apellido}</p>
                          </div>
                        </div>
                        <button onClick={()=>miReunion?showToast("Ya tienes una reunión agendada","error"):setModalSlot(s)}
                          style={{ fontSize:11,fontWeight:700,color:miReunion?"#9ca3af":"#fff",background:miReunion?"#f3f4f6":"#10b981",border:"none",padding:"7px 14px",borderRadius:9,cursor:miReunion?"not-allowed":"pointer",fontFamily:"inherit",flexShrink:0 }}>
                          {miReunion?"Ocupado":"Reservar"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eventos del día */}
              {(diaInfo.eventos||[]).length>0 && (
                <div style={{ padding:"12px 20px" }}>
                  <p style={{ fontSize:11,fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:".5px",margin:"0 0 10px" }}>Eventos</p>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {diaInfo.eventos.map(e=>{
                      const cfg = TIPO_CFG[e.tipo]||TIPO_CFG.otro;
                      return (
                        <div key={e.id} onClick={()=>setModalItem({item:e,tipo:e.tipo})}
                          style={{ display:"flex",alignItems:"center",gap:10,background:cfg.bg,borderRadius:12,padding:"10px 14px",cursor:"pointer",border:`1px solid ${cfg.color}30` }}>
                          <span style={{ fontSize:16,flexShrink:0 }}>{cfg.emoji}</span>
                          <div style={{ flex:1,minWidth:0 }}>
                            <p style={{ fontSize:12,fontWeight:600,color:cfg.color,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.titulo}</p>
                            {e.hora_inicio && <p style={{ fontSize:11,color:cfg.color,opacity:.8,margin:0 }}>{fmtHora(e.hora_inicio)}{e.hora_fin?` — ${fmtHora(e.hora_fin)}`:""}</p>}
                          </div>
                          <ChevronRight size={14} style={{ color:cfg.color,flexShrink:0 }}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sin nada */}
              {!diaInfo.miReunion && !(diaInfo.slots||[]).filter(s=>s.estado==="disponible").length && !(diaInfo.eventos||[]).length && (
                <div style={{ padding:"24px 20px",textAlign:"center" }}>
                  <p style={{ fontSize:13,color:"#9a7080",margin:0 }}>Sin eventos ni horarios disponibles este día.</p>
                </div>
              )}
            </div>
          )}

          {/* Lista próximos eventos */}
          {eventos.filter(e=>{
            const f = new Date(e.fecha+"T12:00:00");
            return f >= hoy;
          }).length>0 && (
            <div>
              <h3 style={{ fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 10px" }}>Próximos eventos</h3>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {eventos.filter(e=>new Date(e.fecha+"T12:00:00")>=hoy).slice(0,5).map(e=>{
                  const cfg=TIPO_CFG[e.tipo]||TIPO_CFG.otro;
                  return (
                    <div key={e.id} onClick={()=>setModalItem({item:e,tipo:e.tipo})}
                      style={{ display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:16,border:"1px solid #ece4f0",padding:"14px 16px",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                      <div style={{ width:40,height:40,borderRadius:12,background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{cfg.emoji}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.titulo}</p>
                        <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{fmtFecha(e.fecha)}{e.hora_inicio?` · ${fmtHora(e.hora_inicio)}`:""}</p>
                      </div>
                      <span style={{ fontSize:10,fontWeight:700,background:cfg.bg,color:cfg.color,padding:"3px 9px",borderRadius:99,flexShrink:0 }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:isMobile?"100%":260,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>

          {/* Progreso */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":20 }}>
            <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:"0 0 12px" }}>Tu progreso</h3>
            {isMobile ? (
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:"#1e1033" }}>{fasesComp} de 5 fases</span>
                  <span style={{ fontSize:13,fontWeight:700,color:"#7c3aed" }}>{Math.round(fasesComp/5*100)}%</span>
                </div>
                <div style={{ height:8,background:"#f0e8f8",borderRadius:99,overflow:"hidden",marginBottom:12 }}>
                  <div style={{ height:"100%",width:`${Math.round(fasesComp/5*100)}%`,background:"linear-gradient(90deg,#7c3aed,#a0435f)",borderRadius:99 }}/>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display:"flex",justifyContent:"center",marginBottom:12 }}>
                  <svg width="120" height="120" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#f0e8f8" strokeWidth="12"/>
                    <circle cx="70" cy="70" r="54" fill="none" stroke="url(#gr3)" strokeWidth="12"
                      strokeDasharray={`${(fasesComp/5)*2*Math.PI*54} ${(1-fasesComp/5)*2*Math.PI*54}`}
                      strokeDashoffset={2*Math.PI*54*.25} strokeLinecap="round"/>
                    <defs><linearGradient id="gr3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
                    </linearGradient></defs>
                    <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22,fontWeight:700,fontFamily:"Georgia,serif" }}>{Math.round(fasesComp/5*100)}%</text>
                    <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11 }}>Completado</text>
                  </svg>
                </div>
                <p style={{ fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 2px",textAlign:"center" }}>{fasesComp} de 5 fases</p>
                <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px",textAlign:"center" }}>Sigue así 💜</p>
              </>
            )}
            <Link href="/dashboard/proceso" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:"1.5px solid #ede9fe",color:"#7c3aed",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>
              🗺️ Ver mi proceso
            </Link>
          </div>

          {/* Próximo paso */}
          {proceso?.proximoPaso && (
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":18 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                <div style={{ width:26,height:26,borderRadius:8,background:"#fce7f3",display:"flex",alignItems:"center",justifyContent:"center" }}>🎯</div>
                <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:0 }}>Próximo paso</h3>
              </div>
              <p style={{ fontSize:13,color:"#1e1033",margin:"0 0 10px",lineHeight:1.5 }}>{proceso.proximoPaso.titulo}</p>
              <Link href={proceso.proximoPaso.link||"#"} style={{ display:"block",textAlign:"center",background:"#5b21b6",color:"#fff",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>
                {proceso.proximoPaso.label_boton}
              </Link>
            </div>
          )}

          <HelpCard onContact={()=>router.push("/dashboard/mensajes")}/>
        </aside>
      </div>
    </div>
  );
}