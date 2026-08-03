"use client";
// app/admin/reuniones/page.jsx

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Phone, Wrench, Bell, Pin, CheckCircle2, CalendarDays, Target,
  ChevronLeft, ChevronRight, X, Plus, Trash2,
  Video, Users, Calendar, Clock, Check, AlertCircle,
  Repeat, Edit2,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

/* ── Helpers ── */
const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
function pad(n) { return String(n).padStart(2,"0"); }
function fechaStr(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function fmtHora(t) { return t ? t.slice(0,5) : ""; }
function fmtFecha(f) {
  if (!f) return "";
  const d = new Date(f+"T12:00:00");
  return d.toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
}
function cleanFecha(f) {
  if (!f) return "";
  if (typeof f === "string") return f.split("T")[0];
  if (f instanceof Date) return fechaStr(f);
  return String(f).split("T")[0];
}


const TIPO_CFG = {
  foro:           { color:"#A0435F", bg:"#FCE8EE", Icono:MessageSquare, label:"Foro"          },
  llamada_grupal: { color:"#A0435F", bg:"#FCE8EE", Icono:Phone,         label:"Llamada grupal" },
  taller:         { color:"#E8853B", bg:"#FFF4EC", Icono:Wrench,        label:"Taller"        },
  importante:     { color:"#C0392B", bg:"#FDECEC", Icono:Bell,          label:"Importante"    },
  otro:           { color:"#6B7280", bg:"#F3F4F6", Icono:Pin,           label:"Otro"          },
};

const IC = { width:"100%", border:"1.5px solid #F5E1E7", borderRadius:10, padding:"9px 12px", fontSize:13, color:"#4A2A38", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const LC = { fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 };

/* ── Modal crear slot ── */
function ModalSlot({ onClose, onGuardar, loading, asesoras }) {
  const hoy = fechaStr(new Date());
  const [form, setForm] = useState({
    fecha: hoy, hora_inicio:"09:00", hora_fin:"10:00",
    url_meet:"", notas:"", repetir_semanas:0, asesora_id:"",
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:460,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,.15)",maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ height:4,background:"linear-gradient(90deg,#7D2F47,#A0435F)",borderRadius:99,marginBottom:20 }}/>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#4A2A38",margin:0 }}>Crear horario disponible</h2>
          <button onClick={onClose} style={{ background:"#F3F4F6",border:"none",borderRadius:99,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={14} style={{ color:"#6B7280" }}/>
          </button>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={LC}>Fecha *</label>
            <input type="date" value={form.fecha} onChange={e=>set("fecha",e.target.value)} style={IC} min={hoy}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={LC}>Hora inicio *</label>
              <input type="time" value={form.hora_inicio} onChange={e=>set("hora_inicio",e.target.value)} style={IC}/>
            </div>
            <div>
              <label style={LC}>Hora fin *</label>
              <input type="time" value={form.hora_fin} onChange={e=>set("hora_fin",e.target.value)} style={IC}/>
            </div>
          </div>
          {asesoras.length>0 && (
            <div>
              <label style={LC}>Asesora (si aplica)</label>
              <select value={form.asesora_id} onChange={e=>set("asesora_id",e.target.value)} style={IC}>
                <option value="">Yo misma (Jenni)</option>
                {asesoras.map(a=><option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={LC}>Link de Meet (opcional)</label>
            <input type="url" value={form.url_meet} onChange={e=>set("url_meet",e.target.value)} style={IC} placeholder="https://meet.google.com/..."/>
          </div>
          <div>
            <label style={LC}>Notas internas (opcional)</label>
            <textarea value={form.notas} onChange={e=>set("notas",e.target.value)} rows={2} style={{ ...IC,resize:"none" }} placeholder="Ej: Solo para usuarias en fase de evaluación"/>
          </div>
          <div>
            <label style={LC}>Repetir semanalmente</label>
            <select value={form.repetir_semanas} onChange={e=>set("repetir_semanas",Number(e.target.value))} style={IC}>
              <option value={0}>No repetir</option>
              <option value={1}>1 semana más</option>
              <option value={2}>2 semanas más</option>
              <option value={3}>3 semanas más</option>
              <option value={4}>4 semanas más</option>
            </select>
            {form.repetir_semanas>0 && (
              <p style={{ fontSize:11,color:"#A0435F",margin:"5px 0 0" }}>
                ✓ Se crearán {form.repetir_semanas+1} slots (hoy + {form.repetir_semanas} semanas)
              </p>
            )}
          </div>
        </div>

        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",borderRadius:12,border:"1.5px solid #E5E7EB",background:"#fff",color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            Cancelar
          </button>
          <button onClick={()=>onGuardar(form)} disabled={loading||!form.fecha||!form.hora_inicio||!form.hora_fin}
            style={{ flex:2,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#7D2F47,#A0435F)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:(loading||!form.fecha)?0.6:1 }}>
            {loading?"Creando...":"✓ Crear horario"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal crear evento ── */
function ModalEvento({ onClose, onGuardar, loading, editando }) {
  const hoy = fechaStr(new Date());
  const [form, setForm] = useState(editando || {
    titulo:"", descripcion:"", tipo:"foro", fecha: hoy,
    hora_inicio:"", hora_fin:"", url_meet:"", color:"#A0435F", visible:1,
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:460,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,.15)",maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ height:4,background:"linear-gradient(90deg,#A0435F,#A0435F)",borderRadius:99,marginBottom:20 }}/>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#4A2A38",margin:0 }}>
            {editando?"Editar evento":"Crear evento"}
          </h2>
          <button onClick={onClose} style={{ background:"#F3F4F6",border:"none",borderRadius:99,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={14} style={{ color:"#6B7280" }}/>
          </button>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={LC}>Tipo de evento *</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {Object.entries(TIPO_CFG).map(([k,v])=>(
                <button key={k} onClick={()=>{ set("tipo",k); set("color",v.color); }}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:12,border:`1.5px solid ${form.tipo===k?v.color:"#E5E7EB"}`,background:form.tipo===k?v.bg:"#fff",cursor:"pointer",fontFamily:"inherit",transition:"all .1s" }}>
                  <span style={{ fontSize:16 }}><v.Icono size={15}/></span>
                  <span style={{ fontSize:12,fontWeight:form.tipo===k?700:500,color:form.tipo===k?v.color:"#6B7280" }}>{v.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={LC}>Título *</label>
            <input type="text" value={form.titulo} onChange={e=>set("titulo",e.target.value)} style={IC} placeholder="Ej: Foro de preguntas frecuentes"/>
          </div>
          <div>
            <label style={LC}>Descripción</label>
            <textarea value={form.descripcion} onChange={e=>set("descripcion",e.target.value)} rows={3} style={{ ...IC,resize:"none" }} placeholder="Detalles del evento..."/>
          </div>
          <div>
            <label style={LC}>Fecha *</label>
            <input type="date" value={form.fecha} onChange={e=>set("fecha",e.target.value)} style={IC}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={LC}>Hora inicio</label>
              <input type="time" value={form.hora_inicio} onChange={e=>set("hora_inicio",e.target.value)} style={IC}/>
            </div>
            <div>
              <label style={LC}>Hora fin</label>
              <input type="time" value={form.hora_fin} onChange={e=>set("hora_fin",e.target.value)} style={IC}/>
            </div>
          </div>
          <div>
            <label style={LC}>Link de Meet (opcional)</label>
            <input type="url" value={form.url_meet} onChange={e=>set("url_meet",e.target.value)} style={IC} placeholder="https://meet.google.com/..."/>
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #FCE8EE" }}>
            <div>
              <p style={{ fontSize:13,fontWeight:600,color:"#4A2A38",margin:0 }}>Visible para todas las usuarias</p>
              <p style={{ fontSize:11,color:"#9C8790",margin:0 }}>Aparece en el calendario de todas</p>
            </div>
            <div onClick={()=>set("visible",form.visible?0:1)}
              style={{ width:44,height:24,borderRadius:99,background:form.visible?"#A0435F":"#E5E7EB",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0 }}>
              <div style={{ width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:form.visible?23:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.15)" }}/>
            </div>
          </div>
        </div>

        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",borderRadius:12,border:"1.5px solid #E5E7EB",background:"#fff",color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            Cancelar
          </button>
          <button onClick={()=>onGuardar(form)} disabled={loading||!form.titulo||!form.fecha}
            style={{ flex:2,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#A0435F,#A0435F)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:(loading||!form.titulo)?0.6:1 }}>
            {loading?"Guardando...":`✓ ${editando?"Guardar cambios":"Crear evento"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function AdminReunionesPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const [slots,      setSlots]      = useState([]);
  const [eventos,    setEventos]    = useState([]);
  const [asesoras,   setAsesoras]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [vista,      setVista]      = useState("calendario"); // calendario | lista
  const [tab,        setTab]        = useState("slots");      // slots | eventos

  const hoy = new Date();
  const [mesActual, setMesActual] = useState({ y:hoy.getFullYear(), m:hoy.getMonth() });
  const [diaSelec,  setDiaSelec]  = useState(null);

  const [showModalSlot,   setShowModalSlot]   = useState(false);
  const [showModalEvento, setShowModalEvento] = useState(false);
  const [editandoEvento,  setEditandoEvento]  = useState(null);
  const [loadingSlot,     setLoadingSlot]     = useState(false);
  const [loadingEvento,   setLoadingEvento]   = useState(false);
  const [deletingId,      setDeletingId]      = useState(null);

  const mesStr = `${mesActual.y}-${pad(mesActual.m+1)}`;

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = async() => {
    const safe=(p,fb=null)=>p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    const [sData, eData, aData] = await Promise.all([
      safe(fetch(`/api/admin/disponibilidad?mes=${mesStr}`), {slots:[]}),
      safe(fetch(`/api/admin/eventos?mes=${mesStr}`),        {eventos:[]}),
      safe(fetch("/api/admin/asesoras"), {usuarias:[]}),
    ]);
    setSlots(sData?.slots||[]);
    setEventos(eData?.eventos||[]);
    setAsesoras(aData?.usuarias||[]);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [mesStr]);

  const navMes = (dir) => {
    setMesActual(prev => {
      let m=prev.m+dir, y=prev.y;
      if (m>11){m=0;y++;} if(m<0){m=11;y--;}
      return {y,m};
    });
    setDiaSelec(null);
  };

  /* ── Mapa días ── */
const diasMapa = useMemo(() => {
  const mapa = {};
  slots.forEach(s => {
    const f = cleanFecha(s.fecha);
    if (!mapa[f]) mapa[f]={slots:[],eventos:[]};
    mapa[f].slots.push(s);
  });
  eventos.forEach(e => {
    const f = cleanFecha(e.fecha);
    if (!mapa[f]) mapa[f]={slots:[],eventos:[]};
    mapa[f].eventos.push(e);
  });
  return mapa;
}, [slots, eventos]);

  const celdas = useMemo(() => {
    const primero = new Date(mesActual.y,mesActual.m,1);
    const ultimo  = new Date(mesActual.y,mesActual.m+1,0);
    const arr = [];
    for (let i=0;i<primero.getDay();i++) arr.push(null);
    for (let d=1;d<=ultimo.getDate();d++) arr.push(new Date(mesActual.y,mesActual.m,d));
    return arr;
  }, [mesActual]);

  /* ── CRUD Slots ── */
  const crearSlot = async(form) => {
    setLoadingSlot(true);
    const res = await fetch("/api/admin/disponibilidad",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const data = await res.json();
    if (res.ok) { showToast(`✓ ${data.creados} horario(s) creado(s)`); setShowModalSlot(false); await cargar(); }
    else showToast(data.error||"Error al crear","error");
    setLoadingSlot(false);
  };

  const eliminarSlot = async(id) => {
    if (!confirm("¿Eliminar este horario?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/disponibilidad?id=${id}`,{method:"DELETE"});
    if (res.ok) { showToast("Horario eliminado"); await cargar(); }
    else { const d=await res.json(); showToast(d.error||"Error","error"); }
    setDeletingId(null);
  };

  /* ── CRUD Eventos ── */
  const guardarEvento = async(form) => {
    setLoadingEvento(true);
    const method = editandoEvento?"PUT":"POST";
    const body   = editandoEvento?{...form,id:editandoEvento.id}:form;
    const res = await fetch("/api/admin/eventos",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const data = await res.json();
    if (res.ok) {
      showToast(editandoEvento?"✓ Evento actualizado":"✓ Evento creado");
      setShowModalEvento(false); setEditandoEvento(null);
      await cargar();
    } else showToast(data.error||"Error","error");
    setLoadingEvento(false);
  };

  const eliminarEvento = async(id) => {
    if (!confirm("¿Eliminar este evento?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/eventos?id=${id}`,{method:"DELETE"});
    if (res.ok) { showToast("Evento eliminado"); await cargar(); }
    else { const d=await res.json(); showToast(d.error||"Error","error"); }
    setDeletingId(null);
  };

  const hoyStr = fechaStr(hoy);
  const diaInfo = diaSelec?(diasMapa[fechaStr(diaSelec)]||{slots:[],eventos:[]}):null;

  /* ── Estadísticas rápidas ── */
  const totalDisp    = slots.filter(s=>s.estado==="disponible").length;
  const totalReserv  = slots.filter(s=>s.estado==="reservada").length;
  const totalEventos = eventos.length;

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#FBF4F6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #C77D93",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#FBF4F6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:200,background:toast.tipo==="error"?"#C0392B":"#4A2A38",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.15)" }}>{toast.msg}</div>}
      {showModalSlot && <ModalSlot onClose={()=>setShowModalSlot(false)} onGuardar={crearSlot} loading={loadingSlot} asesoras={asesoras}/>}
      {showModalEvento && <ModalEvento onClose={()=>{setShowModalEvento(false);setEditandoEvento(null);}} onGuardar={guardarEvento} loading={loadingEvento} editando={editandoEvento}/>}

      {/* HEADER */}
      <div style={{ background:"#4A2A38",padding:isMobile?"14px 16px":"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?17:20,fontWeight:700,color:"#fff",margin:0 }}>Reuniones y Eventos</h1>
          {!isMobile&&<p style={{ fontSize:12,color:"rgba(255,255,255,.6)",margin:"2px 0 0" }}>Gestiona horarios disponibles y eventos generales</p>}
        </div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <button onClick={()=>setShowModalSlot(true)}
            style={{ display:"flex",alignItems:"center",gap:5,background:"#12A46B",color:"#fff",fontSize:isMobile?11:12,fontWeight:700,padding:isMobile?"8px 12px":"9px 16px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit" }}>
            <Plus size={13}/> {isMobile?"Horario":"Horario disponible"}
          </button>
          <button onClick={()=>{setEditandoEvento(null);setShowModalEvento(true);}}
            style={{ display:"flex",alignItems:"center",gap:5,background:"#A0435F",color:"#fff",fontSize:isMobile?11:12,fontWeight:700,padding:isMobile?"8px 12px":"9px 16px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit" }}>
            <Plus size={13}/> Evento
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1400,margin:"0 auto",padding:isMobile?"14px 16px 40px":"20px 24px 40px" }}>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:12,marginBottom:16 }}>
          {[
            { n:totalDisp,   label:"Horarios disponibles", color:"#12A46B", bg:"#E6F9F0", Icono:CheckCircle2 },
            { n:totalReserv, label:"Reuniones agendadas",  color:"#7D2F47", bg:"#FCE8EE", Icono:CalendarDays },
            { n:totalEventos,label:"Eventos este mes",     color:"#A0435F", bg:"#FBF4F6", Icono:Target },
          ].map((s,i)=>(
            <div key={i} style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",padding:isMobile?"12px 14px":"16px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ width:isMobile?36:44,height:isMobile?36:44,borderRadius:12,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isMobile?16:20,flexShrink:0 }}><s.Icono size={15}/></div>
              <div>
                <p style={{ fontFamily:"Georgia,serif",fontSize:isMobile?22:28,fontWeight:700,color:s.color,margin:0,lineHeight:1 }}>{s.n}</p>
                <p style={{ fontSize:isMobile?10:12,color:"#9C8790",margin:0 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex",gap:20,flexDirection:isMobile?"column":"row" }}>
          {/* CALENDARIO */}
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #F5E1E7",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)",marginBottom:16 }}>
              {/* Header mes */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:"1px solid #FCE8EE",background:"#FBF4F6" }}>
                <button onClick={()=>navMes(-1)} style={{ width:34,height:34,borderRadius:99,border:"1.5px solid #F5E1E7",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <ChevronLeft size={16} style={{ color:"#6B7280" }}/>
                </button>
                <h2 style={{ fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:"#4A2A38",margin:0 }}>
                  {MESES[mesActual.m]} {mesActual.y}
                </h2>
                <button onClick={()=>navMes(1)} style={{ width:34,height:34,borderRadius:99,border:"1.5px solid #F5E1E7",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <ChevronRight size={16} style={{ color:"#6B7280" }}/>
                </button>
              </div>
              {/* Días semana */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid #FCE8EE",background:"#FBF4F6" }}>
                {DIAS.map(d=><div key={d} style={{ padding:"8px 0",textAlign:"center",fontSize:11,fontWeight:700,color:"#9C8790",textTransform:"uppercase" }}>{d}</div>)}
              </div>
              {/* Celdas */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)" }}>
                {celdas.map((dia,i) => {
                  if (!dia) return <div key={`e${i}`} style={{ minHeight:80,borderRight:"1px solid #FCE8EE",borderBottom:"1px solid #FCE8EE" }}/>;
                  const fStr = fechaStr(dia);
                  const info = diasMapa[fStr]||{};
                  const esHoy = fStr===hoyStr;
                  const esSel = diaSelec&&fechaStr(diaSelec)===fStr;
                  const slotsDisp = (info.slots||[]).filter(s=>s.estado==="disponible").length;
                  const slotsRes  = (info.slots||[]).filter(s=>s.estado==="reservada").length;
                  const numEventos = (info.eventos||[]).length;

                  return (
                    <div key={fStr} onClick={()=>setDiaSelec(dia)}
                      style={{ minHeight:80,borderRight:"1px solid #FCE8EE",borderBottom:"1px solid #FCE8EE",padding:"6px",cursor:"pointer",transition:"background .1s",
                        background:esSel?"#FBF4F6":esHoy?"#FCE8EE":"#fff",
                      }}>
                      <div style={{ display:"flex",justifyContent:"center",marginBottom:4 }}>
                        <span style={{ width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:esHoy?700:500,
                          background:esHoy?"#A0435F":esSel?"#A0435F":"transparent",
                          color:esHoy||esSel?"#fff":"#4A2A38",
                        }}>{dia.getDate()}</span>
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
                        {slotsDisp>0 && <div style={{ fontSize:9,fontWeight:700,background:"#E6F9F0",color:"#12A46B",borderRadius:6,padding:"1px 5px",textAlign:"center" }}>✅ {slotsDisp} disp.</div>}
                        {slotsRes>0  && <div style={{ fontSize:9,fontWeight:700,background:"#FCE8EE",color:"#7D2F47",borderRadius:6,padding:"1px 5px",textAlign:"center" }}>📅 {slotsRes} reserv.</div>}
                        {numEventos>0 && <div style={{ fontSize:9,fontWeight:700,background:"#FFF4EC",color:"#E8853B",borderRadius:6,padding:"1px 5px",textAlign:"center" }}>🎯 {numEventos} evento{numEventos>1?"s":""}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel día seleccionado */}
            {diaSelec && diaInfo && (
              <div style={{ background:"#fff",borderRadius:20,border:"1px solid #F5E1E7",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ padding:"14px 20px",borderBottom:"1px solid #FCE8EE",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FBF4F6" }}>
                  <h3 style={{ fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#4A2A38",margin:0 }}>{fmtFecha(fechaStr(diaSelec))}</h3>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>setShowModalSlot(true)}
                      style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:"#fff",background:"#12A46B",border:"none",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontFamily:"inherit" }}>
                      <Plus size={11}/> Horario
                    </button>
                    <button onClick={()=>setShowModalEvento(true)}
                      style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:"#fff",background:"#A0435F",border:"none",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontFamily:"inherit" }}>
                      <Plus size={11}/> Evento
                    </button>
                    <button onClick={()=>setDiaSelec(null)} style={{ background:"#F3F4F6",border:"none",borderRadius:99,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <X size={13} style={{ color:"#6B7280" }}/>
                    </button>
                  </div>
                </div>

                {/* Slots del día */}
                {(diaInfo.slots||[]).length>0 && (
                  <div style={{ padding:"14px 20px",borderBottom:(diaInfo.eventos||[]).length?"1px solid #FCE8EE":"none" }}>
                    <p style={{ fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:".5px",margin:"0 0 10px" }}>Horarios disponibles</p>
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {diaInfo.slots.map(s=>(
                        <div key={s.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:14,border:"1px solid #F5E1E7",background:s.estado==="reservada"?"#FBF4F6":"#F3F4F6" }}>
                          <div style={{ width:8,height:8,borderRadius:"50%",background:s.estado==="disponible"?"#12A46B":s.estado==="reservada"?"#7D2F47":"#C9A9B4",flexShrink:0 }}/>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                              <p style={{ fontSize:13,fontWeight:600,color:"#4A2A38",margin:0 }}>
                                {fmtHora(s.hora_inicio)} — {fmtHora(s.hora_fin)}
                              </p>
                              <span style={{ fontSize:10,fontWeight:700,background:s.estado==="disponible"?"#E6F9F0":s.estado==="reservada"?"#FCE8EE":"#F3F4F6",color:s.estado==="disponible"?"#12A46B":s.estado==="reservada"?"#7D2F47":"#6B7280",padding:"2px 8px",borderRadius:99 }}>
                                {s.estado==="disponible"?"Disponible":s.estado==="reservada"?"Reservada":"Cancelada"}
                              </span>
                            </div>
                            <p style={{ fontSize:11,color:"#9C8790",margin:"2px 0 0" }}>
                              {s.asesora_nombre} {s.asesora_apellido}
                              {s.estado==="reservada"&&s.cliente_nombre && ` · ${s.cliente_nombre} ${s.cliente_apellido}`}
                            </p>
                          </div>
                          {s.estado!=="reservada" && (
                            <button onClick={()=>eliminarSlot(s.id)} disabled={deletingId===s.id}
                              style={{ width:30,height:30,borderRadius:9,border:"1px solid #FDECEC",background:"#FDECEC",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                              {deletingId===s.id?<div style={{ width:12,height:12,border:"2px solid #C0392B40",borderTopColor:"#C0392B",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>:<Trash2 size={12} style={{ color:"#C0392B" }}/>}
                            </button>
                          )}
                          {s.estado==="reservada"&&s.cliente_email && (
                            <a href={`mailto:${s.cliente_email}`} style={{ fontSize:11,fontWeight:600,color:"#A0435F",textDecoration:"none",border:"1px solid #FCE8EE",padding:"5px 10px",borderRadius:8,flexShrink:0 }}>
                              Contactar
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eventos del día */}
                {(diaInfo.eventos||[]).length>0 && (
                  <div style={{ padding:"14px 20px" }}>
                    <p style={{ fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:".5px",margin:"0 0 10px" }}>Eventos</p>
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {diaInfo.eventos.map(e=>{
                        const cfg=TIPO_CFG[e.tipo]||TIPO_CFG.otro;
                        return (
                          <div key={e.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:14,border:`1px solid ${cfg.color}30`,background:cfg.bg }}>
                            <span style={{ fontSize:18,flexShrink:0 }}><cfg.Icono size={15}/></span>
                            <div style={{ flex:1,minWidth:0 }}>
                              <p style={{ fontSize:13,fontWeight:600,color:cfg.color,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.titulo}</p>
                              <p style={{ fontSize:11,color:cfg.color,opacity:.8,margin:0 }}>
                                {fmtHora(e.hora_inicio)}{e.hora_fin?` — ${fmtHora(e.hora_fin)}`:""} · {cfg.label} · {e.visible?"Visible para todas":"Solo admin"}
                              </p>
                            </div>
                            <div style={{ display:"flex",gap:6 }}>
                              <button onClick={()=>{setEditandoEvento(e);setShowModalEvento(true);}}
                                style={{ width:30,height:30,borderRadius:9,border:`1px solid ${cfg.color}40`,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                <Edit2 size={12} style={{ color:cfg.color }}/>
                              </button>
                              <button onClick={()=>eliminarEvento(e.id)} disabled={deletingId===e.id}
                                style={{ width:30,height:30,borderRadius:9,border:"1px solid #FDECEC",background:"#FDECEC",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                {deletingId===e.id?<div style={{ width:12,height:12,border:"2px solid #C0392B40",borderTopColor:"#C0392B",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>:<Trash2 size={12} style={{ color:"#C0392B" }}/>}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!diaInfo.slots?.length && !diaInfo.eventos?.length && (
                  <div style={{ padding:"24px 20px",textAlign:"center" }}>
                    <p style={{ fontSize:13,color:"#9C8790",margin:0 }}>Sin horarios ni eventos este día.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PANEL LATERAL */}
          <div style={{ width:isMobile?"100%":320,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>

            {/* Tabs */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",overflow:"hidden" }}>
              <div style={{ display:"flex",borderBottom:"1px solid #FCE8EE" }}>
                {[{id:"slots",label:"Horarios",n:slots.length},{id:"eventos",label:"Eventos",n:eventos.length}].map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)}
                    style={{ flex:1,padding:"12px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",
                      color:tab===t.id?"#A0435F":"#6B7280",
                      borderBottom:tab===t.id?"2px solid #A0435F":"2px solid transparent",
                    }}>
                    {t.label} ({t.n})
                  </button>
                ))}
              </div>

              <div style={{ padding:16,maxHeight:500,overflowY:"auto" }}>
                {/* Lista slots */}
                {tab==="slots" && (
                  slots.length===0 ? (
                    <div style={{ textAlign:"center",padding:"24px 0" }}>
                      <p style={{ fontSize:13,color:"#9C8790",margin:0 }}>Sin horarios este mes.</p>
                      <button onClick={()=>setShowModalSlot(true)}
                        style={{ marginTop:10,fontSize:12,fontWeight:600,color:"#12A46B",background:"#E6F9F0",border:"none",padding:"8px 16px",borderRadius:10,cursor:"pointer",fontFamily:"inherit" }}>
                        + Crear horario
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {slots.map(s=>(
                        <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,border:"1px solid #F5E1E7",background:s.estado==="reservada"?"#FBF4F6":"#F3F4F6" }}>
                          <div style={{ width:7,height:7,borderRadius:"50%",background:s.estado==="disponible"?"#12A46B":s.estado==="reservada"?"#7D2F47":"#C9A9B4",flexShrink:0 }}/>
                          <div style={{ flex:1,minWidth:0 }}>
                            <p style={{ fontSize:12,fontWeight:600,color:"#4A2A38",margin:0 }}>
                              {new Date(cleanFecha(s.fecha)+"T12:00:00").toLocaleDateString("es-CO",{day:"numeric",month:"short"})}
                            </p>
                            <p style={{ fontSize:11,color:"#9C8790",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                              {s.asesora_nombre} {s.asesora_apellido}
                              {s.estado==="reservada"&&s.cliente_nombre ? ` · ${s.cliente_nombre}` : ""}
                            </p>
                          </div>
                          {s.estado!=="reservada" && (
                            <button onClick={()=>eliminarSlot(s.id)} disabled={deletingId===s.id}
                              style={{ background:"none",border:"none",cursor:"pointer",color:"#C0392B",padding:4,flexShrink:0 }}>
                              <Trash2 size={13}/>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Lista eventos */}
                {tab==="eventos" && (
                  eventos.length===0 ? (
                    <div style={{ textAlign:"center",padding:"24px 0" }}>
                      <p style={{ fontSize:13,color:"#9C8790",margin:0 }}>Sin eventos este mes.</p>
                      <button onClick={()=>setShowModalEvento(true)}
                        style={{ marginTop:10,fontSize:12,fontWeight:600,color:"#A0435F",background:"#FCE8EE",border:"none",padding:"8px 16px",borderRadius:10,cursor:"pointer",fontFamily:"inherit" }}>
                        + Crear evento
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {eventos.map(e=>{
                        const cfg=TIPO_CFG[e.tipo]||TIPO_CFG.otro;
                        return (
                          <div key={e.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,border:`1px solid ${cfg.color}25`,background:cfg.bg }}>
                            <span style={{ fontSize:16,flexShrink:0 }}><cfg.Icono size={15}/></span>
                            <div style={{ flex:1,minWidth:0 }}>
                              <p style={{ fontSize:12,fontWeight:600,color:cfg.color,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.titulo}</p>
                              <p style={{ fontSize:11,color:cfg.color,opacity:.8,margin:0 }}>
                                {new Date(cleanFecha(e.fecha)+"T12:00:00").toLocaleDateString("es-CO",{day:"numeric",month:"short"})}
                                {e.hora_inicio?` · ${fmtHora(e.hora_inicio)}`:""}
                              </p>
                            </div>
                            <div style={{ display:"flex",gap:4 }}>
                              <button onClick={()=>{setEditandoEvento(e);setShowModalEvento(true);}}
                                style={{ background:"rgba(255,255,255,.7)",border:"none",cursor:"pointer",borderRadius:7,padding:5,color:cfg.color }}>
                                <Edit2 size={11}/>
                              </button>
                              <button onClick={()=>eliminarEvento(e.id)} disabled={deletingId===e.id}
                                style={{ background:"rgba(255,255,255,.7)",border:"none",cursor:"pointer",borderRadius:7,padding:5,color:"#C0392B" }}>
                                <Trash2 size={11}/>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Leyenda */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",padding:16 }}>
              <p style={{ fontSize:12,fontWeight:700,color:"#4A2A38",margin:"0 0 10px" }}>Leyenda del calendario</p>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {[
                  { color:"#12A46B", label:"Horario disponible" },
                  { color:"#7D2F47", label:"Horario reservado" },
                  { color:"#E8853B", label:"Taller / Evento" },
                ].map((l,i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ width:10,height:10,borderRadius:3,background:l.color,flexShrink:0 }}/>
                    <span style={{ fontSize:12,color:"#6B7280" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceso rápido */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",padding:16 }}>
              <p style={{ fontSize:12,fontWeight:700,color:"#4A2A38",margin:"0 0 10px" }}>Acciones rápidas</p>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                <button onClick={()=>setShowModalSlot(true)}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,border:"1.5px solid #E6F9F0",background:"#E6F9F0",cursor:"pointer",fontFamily:"inherit",textAlign:"left" }}>
                  <CheckCircle2 size={15} style={{ color:"#12A46B" }}/>
                  <div>
                    <p style={{ fontSize:12,fontWeight:600,color:"#12A46B",margin:0 }}>Agregar horario disponible</p>
                    <p style={{ fontSize:10,color:"#12A46B",margin:0 }}>Las usuarias podrán reservarlo</p>
                  </div>
                </button>
                <button onClick={()=>{setEditandoEvento(null);setShowModalEvento(true);}}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,border:"1.5px solid #c4b5fd",background:"#FBF4F6",cursor:"pointer",fontFamily:"inherit",textAlign:"left" }}>
                  <Target size={15} style={{ color:"#A0435F" }}/>
                  <div>
                    <p style={{ fontSize:12,fontWeight:600,color:"#7D2F47",margin:0 }}>Crear evento general</p>
                    <p style={{ fontSize:10,color:"#A0435F",margin:0 }}>Foro, taller, llamada grupal...</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}