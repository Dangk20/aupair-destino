"use client";
// app/agencia/perfiles/page.jsx

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon, DownloadIcon, SlidersIcon,
  CheckCircleIcon, XCircleIcon, MinusCircleIcon,
  FileTextIcon, ChevronRightIcon, ChevronLeftIcon,
  ChevronDownIcon, XIcon, CheckIcon,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

/* ── helpers ── */
const PAISES_EMOJI = { "Colombia":"🇨🇴","Mexico":"🇲🇽","México":"🇲🇽","Brasil":"🇧🇷","Brazil":"🇧🇷","Argentina":"🇦🇷","Peru":"🇵🇪","Perú":"🇵🇪","Chile":"🇨🇱","Ecuador":"🇪🇨","Venezuela":"🇻🇪" };

const CALIFICACION_MAP = {
  califica:          { label:"Califica",          bg:"#e8f0e0", color:"#5a8a3a" },
  requiere_revision: { label:"Requiere revisión", bg:"#fdf3e3", color:"#c9973a" },
  no_califica:       { label:"No califica",       bg:"#fee2e2", color:"#dc2626" },
};

const ESTADO_MAP = {
  "En evaluación":        { bg:"#ede9f8", color:"#7c5cc4" },
  "Pago pendiente":       { bg:"#fdf3e3", color:"#c9973a" },
  "En ajustes":           { bg:"#e8f0ff", color:"#2a4a7f" },
  "Perfil en activación": { bg:"#e8f0e0", color:"#5a8a3a" },
  "No califica":          { bg:"#fee2e2", color:"#dc2626" },
};

const SI_NO = v => v ? "Sí" : "No";

function Badge({ label, bg, color }) {
  return <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:bg,color,whiteSpace:"nowrap" }}>{label}</span>;
}

function BarraProgreso({ pct, color="#7c5cc4" }) {
  return (
    <div style={{ width:"100%",height:6,background:"#e9e3f8",borderRadius:99,overflow:"hidden" }}>
      <div style={{ height:"100%",width:`${pct||0}%`,background:color,borderRadius:99,transition:"width .3s" }}/>
    </div>
  );
}

/* ── Dona resumen ── */
function DonaResumen({ stats, tabActivo }) {
  const total = stats.total || 1;
  const data = tabActivo === "eval" ? [
    { label:"Califican",          val:stats.califican||0,        color:"#5a8a3a" },
    { label:"Requieren revisión", val:stats.requierenRevision||0, color:"#c9973a" },
    { label:"No califican",       val:stats.noCalifican||0,       color:"#dc2626" },
  ] : [
    { label:"Perfil completo",    val:stats.perfilCompleto||0,                            color:"#5a8a3a" },
    { label:"En progreso",        val:(stats.total||0)-(stats.perfilCompleto||0),          color:"#7c5cc4" },
  ];
  const r=55,cx=75,cy=75,stroke=16,circ=2*Math.PI*r; let acc=0;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:16 }}>
      <svg width={150} height={150} viewBox="0 0 150 150" style={{ flexShrink:0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e9e3f8" strokeWidth={stroke}/>
        {data.map((d,i)=>{ const dash=(d.val/total)*circ; const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-(acc/total)*circ} transform={`rotate(-90 ${cx} ${cy})`}/>; acc+=d.val; return el; })}
        <text x={cx} y={cy-6} textAnchor="middle" fontSize={20} fontWeight={700} fill="#1e1033" fontFamily="Georgia,serif">{stats.total}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize={10} fill="#9a7080">Total</text>
      </svg>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {data.map((d,i)=>(
          <div key={i} style={{ display:"flex",alignItems:"center",gap:7 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:d.color,flexShrink:0 }}/>
            <div>
              <p style={{ fontSize:11,color:"#6b7280",margin:0 }}>{d.label}</p>
              <p style={{ fontSize:11,fontWeight:700,color:"#1e1033",margin:0 }}>{d.val} ({Math.round(d.val/total*100)}%)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Modal evaluación de perfil ── */
function ModalEvalPerfil({ c, onClose }) {
  if (!c) return null;
  const cal = CALIFICACION_MAP[c.calificacion_dap];
  const campos = [
    { label:"Cédula",                    val:c.cedula||"—" },
    { label:"Teléfono",                  val:c.telefono||"—" },
    { label:"Fecha de nacimiento",       val:c.fecha_nacimiento?new Date(c.fecha_nacimiento).toLocaleDateString("es-CO"):"—" },
    { label:"Ciudad",                    val:c.ciudad||"—" },
    { label:"País",                      val:c.pais||"—" },
    { label:"Nivel de inglés",           val:c.nivel_ingles||"—" },
    { label:"Licencia de conducción",    val:SI_NO(c.licencia_conduccion) },
    { label:"Curso primeros auxilios",   val:SI_NO(c.curso_primeros_auxilios) },
    { label:"Situación actual",          val:c.situacion_actual||"—" },
    { label:"Experiencia con niños",     val:SI_NO(c.exp_ninos_externos) },
    { label:"Horas de experiencia",      val:c.horas_exp_ninos?`${c.horas_exp_ninos} hrs`:"—" },
    { label:"Visa negada",               val:SI_NO(c.visa_negada) },
    { label:"Entiende intercambio",      val:SI_NO(c.entiende_intercambio_cultural) },
    { label:"Consciente del riesgo",     val:SI_NO(c.consciente_riesgo_familiar) },
    { label:"Enfermedades/medicamentos", val:SI_NO(c.enfermedad_medicamentos) },
    { label:"Depresión/pánico",          val:SI_NO(c.depresion_panico) },
  ];
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:640,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.2)" }}>
        <div style={{ padding:"16px 20px",background:"linear-gradient(135deg,#1e1033,#7c5cc4)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,.15)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:16,fontWeight:700,color:"#fff" }}>{c.nombre?.[0]}</span>}
            </div>
            <div>
              <p style={{ fontSize:15,fontWeight:700,color:"#fff",margin:0 }}>{c.nombre} {c.apellido}</p>
              <p style={{ fontSize:11,color:"rgba(255,255,255,.7)",margin:0 }}>Evaluación de perfil · ID: DA-{String(c.id).padStart(4,"0")}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.15)",border:"none",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:20 }}>
          {cal && (
            <div style={{ background:cal.bg,borderRadius:12,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10,border:`1px solid ${cal.color}30` }}>
              <span style={{ fontSize:18 }}>{c.calificacion_dap==="califica"?"✅":c.calificacion_dap==="requiere_revision"?"⚠️":"❌"}</span>
              <div>
                <p style={{ fontSize:13,fontWeight:700,color:cal.color,margin:0 }}>{cal.label}{c.score_dap?` — Score: ${c.score_dap}/10`:""}</p>
                {c.nota_dap && <p style={{ fontSize:12,color:"#6b7280",margin:"2px 0 0" }}>{c.nota_dap}</p>}
              </div>
            </div>
          )}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {campos.map((f,i)=>(
              <div key={i} style={{ background:"#f9f7ff",borderRadius:10,padding:"10px 12px",border:"1px solid #e9e3f8" }}>
                <p style={{ fontSize:9,color:"#9a7080",margin:"0 0 2px",textTransform:"uppercase",fontWeight:700,letterSpacing:".4px" }}>{f.label}</p>
                <p style={{ fontSize:12,fontWeight:600,color:"#1e1033",margin:0 }}>{f.val}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12 }}>
            <p style={{ fontSize:11,color:"#9a7080",margin:"0 0 4px",fontWeight:700 }}>Progreso evaluación</p>
            <BarraProgreso pct={c.progreso_eval} color="#7c5cc4"/>
            <p style={{ fontSize:11,color:"#7c5cc4",margin:"4px 0 0",fontWeight:600 }}>{c.progreso_eval||0}% completado</p>
          </div>
        </div>
        <div style={{ padding:"12px 20px",borderTop:"1px solid #e9e3f8" }}>
          <button onClick={onClose} style={{ width:"100%",padding:"10px",borderRadius:12,border:"none",background:"#7c5cc4",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal perfil con la agencia ── */
function ModalPerfilAgencia({ c, onClose }) {
  if (!c) return null;
  const secciones = [
    { titulo:"Información personal", campos:[
      { label:"Estatura",      val:c.estatura?`${c.estatura} cm`:"—" },
      { label:"Peso",          val:c.peso?`${c.peso} kg`:"—" },
      { label:"Nacionalidad",  val:c.nacionalidad||"—" },
      { label:"Tiene pasaporte", val:SI_NO(c.tiene_pasaporte) },
    ]},
    { titulo:"Experiencia con niños", campos:[
      { label:"Experiencia externa",   val:SI_NO(c.exp_ninos_externos) },
      { label:"Horas de experiencia",  val:c.horas_exp_ninos?`${c.horas_exp_ninos} hrs`:"—" },
      { label:"Horas de childcare",    val:c.horas_childcare?`${c.horas_childcare} hrs`:"—" },
    ]},
    { titulo:"Educación", campos:[
      { label:"Situación actual",  val:c.situacion_actual||"—" },
      { label:"Carrera graduada",  val:c.carrera_graduada||"—" },
    ]},
    { titulo:"Conducción", campos:[
      { label:"Licencia",      val:SI_NO(c.licencia_conduccion) },
      { label:"Tipo licencia", val:c.tipo_licencia||"—" },
    ]},
    { titulo:"Referencias", campos:[
      { label:"Referencia 1",        val:c.referencia_1_nombre||"—" },
      { label:"Email referencia 1",  val:c.referencia_1_email||"—" },
      { label:"Teléfono ref. 1",     val:c.referencia_1_telefono||"—" },
      { label:"Referencia 2",        val:c.referencia_2_nombre||"—" },
      { label:"Email referencia 2",  val:c.referencia_2_email||"—" },
    ]},
  ];
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:680,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.2)" }}>
        <div style={{ padding:"16px 20px",background:"linear-gradient(135deg,#1e1033,#a0435f)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,.15)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:16,fontWeight:700,color:"#fff" }}>{c.nombre?.[0]}</span>}
            </div>
            <div>
              <p style={{ fontSize:15,fontWeight:700,color:"#fff",margin:0 }}>{c.nombre} {c.apellido}</p>
              <p style={{ fontSize:11,color:"rgba(255,255,255,.7)",margin:0 }}>Perfil con la agencia · {c.progreso_agencia||0}% completo</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.15)",border:"none",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:20 }}>
          {/* Progreso */}
          <div style={{ background:"#f9f7ff",borderRadius:12,padding:"12px 16px",marginBottom:16,border:"1px solid #e9e3f8" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontSize:12,fontWeight:700,color:"#1e1033" }}>Perfil con la agencia</span>
              <span style={{ fontSize:12,fontWeight:700,color:"#7c5cc4" }}>{c.progreso_agencia||0}%</span>
            </div>
            <BarraProgreso pct={c.progreso_agencia} color="#a0435f"/>
          </div>

          {/* Bio y hobbies */}
          {(c.bio || c.hobbies) && (
            <div style={{ background:"#f9f7ff",borderRadius:12,padding:"14px 16px",marginBottom:12,border:"1px solid #e9e3f8" }}>
              {c.bio && <>
                <p style={{ fontSize:10,color:"#9a7080",margin:"0 0 4px",textTransform:"uppercase",fontWeight:700 }}>Sobre mí</p>
                <p style={{ fontSize:12,color:"#374151",margin:"0 0 10px",lineHeight:1.5 }}>{c.bio}</p>
              </>}
              {c.hobbies && <>
                <p style={{ fontSize:10,color:"#9a7080",margin:"0 0 4px",textTransform:"uppercase",fontWeight:700 }}>Hobbies e intereses</p>
                <p style={{ fontSize:12,color:"#374151",margin:0,lineHeight:1.5 }}>{c.hobbies}</p>
              </>}
            </div>
          )}

          {/* Por qué au pair */}
          {c.por_que_au_pair && (
            <div style={{ background:"#fce8ed",borderRadius:12,padding:"14px 16px",marginBottom:12,border:"1px solid #f0b8c4" }}>
              <p style={{ fontSize:10,color:"#a0435f",margin:"0 0 4px",textTransform:"uppercase",fontWeight:700 }}>¿Por qué quiere ser Au Pair?</p>
              <p style={{ fontSize:12,color:"#2d1a22",margin:0,lineHeight:1.5 }}>{c.por_que_au_pair}</p>
            </div>
          )}

          {/* Secciones */}
          {secciones.map((s,si)=>(
            <div key={si} style={{ marginBottom:12 }}>
              <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 8px",padding:"6px 0",borderBottom:"1px solid #e9e3f8" }}>{s.titulo}</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {s.campos.map((f,fi)=>(
                  <div key={fi} style={{ background:"#f9f7ff",borderRadius:8,padding:"8px 12px",border:"1px solid #e9e3f8" }}>
                    <p style={{ fontSize:9,color:"#9a7080",margin:"0 0 2px",textTransform:"uppercase",fontWeight:700 }}>{f.label}</p>
                    <p style={{ fontSize:12,fontWeight:600,color:"#1e1033",margin:0 }}>{f.val}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:"12px 20px",borderTop:"1px solid #e9e3f8" }}>
          <button onClick={onClose} style={{ width:"100%",padding:"10px",borderRadius:12,border:"none",background:"#a0435f",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal nota ── */
function ModalNota({ candidata, notaInicial, onClose, onGuardar }) {
  const [nota, setNota] = useState(notaInicial||"");
  const [guardando, setGuardando] = useState(false);
  const submit = async() => { setGuardando(true); await onGuardar(nota); setGuardando(false); onClose(); };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:440,overflow:"hidden",boxShadow:"0 24px 64px rgba(0,0,0,.2)" }}>
        <div style={{ padding:"16px 20px",borderBottom:"1px solid #e9e3f8",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <p style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:0 }}>Nota — {candidata?.nombre} {candidata?.apellido}</p>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#9a7080" }}><XIcon size={16}/></button>
        </div>
        <div style={{ padding:20 }}>
          <textarea value={nota} onChange={e=>setNota(e.target.value)} rows={4} placeholder="Escribe tu nota sobre esta candidata..."
            style={{ width:"100%",border:"1.5px solid #e9e3f8",borderRadius:10,padding:"10px 12px",fontSize:13,color:"#1e1033",outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box" }}/>
          <div style={{ display:"flex",gap:10,marginTop:12 }}>
            <button onClick={onClose} style={{ flex:1,padding:"10px",borderRadius:10,border:"1.5px solid #e9e3f8",background:"#fff",color:"#9a7080",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancelar</button>
            <button onClick={submit} disabled={guardando} style={{ flex:2,padding:"10px",borderRadius:10,border:"none",background:"#7c5cc4",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
              {guardando?"Guardando...":"💾 Guardar nota"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function AgenciaPerfilesPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,       setUser]       = useState(null);
  const [candidatas, setCandidatas] = useState([]);
  const [stats,      setStats]      = useState({ total:0,califican:0,requierenRevision:0,noCalifican:0,perfilCompleto:0 });
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [tabActivo,  setTabActivo]  = useState("eval"); // "eval" | "agencia"

  const [busqueda,   setBusqueda]   = useState("");
  const [filtroPais, setFiltroPais] = useState("");
  const [filtroEval, setFiltroEval] = useState("");
  const [orden,      setOrden]      = useState("recientes");
  const [pagina,     setPagina]     = useState(1);
  const [porPagina,  setPorPagina]  = useState(5);

  const [modalEval,    setModalEval]    = useState(null);
  const [modalAgencia, setModalAgencia] = useState(null);
  const [modalNota,    setModalNota]    = useState(null);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = useCallback(async()=>{
    const [me, data] = await Promise.all([
      fetch("/api/auth/me").then(r=>r.ok?r.json():null).catch(()=>null),
      fetch("/api/agencia/perfiles").then(r=>r.ok?r.json():null).catch(()=>null),
    ]);
    if (!me?.user) { router.push("/login"); return; }
    setUser(me.user);
    if (data?.ok) { setCandidatas(data.candidatas||[]); setStats(data.stats||{}); }
    setLoading(false);
  },[router]);

  useEffect(()=>{ cargar(); },[cargar]);

  const accion = async(id, body) => {
    const res = await fetch(`/api/agencia/perfiles/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    const data = await res.json();
    if (data.ok) { showToast(data.msg||"Guardado ✓"); await cargar(); }
    else showToast(data.error||"Error","error");
  };

  const exportar = () => {
    const csv = ["Nombre,Edad,País,Score DAP,Calificación DAP,Evaluación Agencia,Plan,Cuotas,Estado,Progreso Agencia",
      ...candidatas.map(c=>`${c.nombre} ${c.apellido},${c.edad||""},${c.pais||""},${c.score_dap||""},${c.calificacion_dap||""},${c.eval_agencia||""},${c.plan||""},${c.cuotas_pagadas||0},${c.estado_agencia||""},${c.progreso_agencia||0}%`)
    ].join("\n");
    const a = Object.assign(document.createElement("a"),{href:`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,download:"perfiles.csv"});
    a.click(); showToast("Lista exportada ✓");
  };

  const paises = [...new Set(candidatas.map(c=>c.pais).filter(Boolean))];
  let filtradas = candidatas.filter(c=>{
    const q = busqueda.toLowerCase();
    return (!q||`${c.nombre} ${c.apellido} ${c.id}`.toLowerCase().includes(q))
      && (!filtroPais||c.pais===filtroPais)
      && (!filtroEval||c.eval_agencia===filtroEval);
  });
  if (orden==="recientes") filtradas=[...filtradas].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  else if (orden==="score") filtradas=[...filtradas].sort((a,b)=>(b.score_dap||0)-(a.score_dap||0));
  else if (orden==="nombre") filtradas=[...filtradas].sort((a,b)=>a.nombre.localeCompare(b.nombre));
  else if (orden==="progreso") filtradas=[...filtradas].sort((a,b)=>(b.progreso_agencia||0)-(a.progreso_agencia||0));

  const totalPags = Math.ceil(filtradas.length/porPagina);
  const paginadas = filtradas.slice((pagina-1)*porPagina, pagina*porPagina);
  const SEL = { height:34,border:"1.5px solid #e9e3f8",borderRadius:8,padding:"0 10px",fontSize:12,color:"#374151",background:"#fff",outline:"none",fontFamily:"inherit",cursor:"pointer" };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f3ff" }}>
      <div style={{ width:36,height:36,border:"3px solid #7c5cc4",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#f5f3ff",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:300,background:toast.tipo==="error"?"#dc2626":"#1e1033",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.15)",display:"flex",alignItems:"center",gap:8 }}>
        {toast.tipo==="error"?"❌":"✓"} {toast.msg}
      </div>}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e9e3f8",padding:isMobile?"14px 16px":"20px 28px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?20:24,fontWeight:700,color:"#1e1033",margin:0 }}>¡Hola, {user?.nombre}! 👋</h1>
            <p style={{ fontSize:13,color:"#9a7080",margin:"4px 0 0" }}>Gestiona y revisa los perfiles de las candidatas aprobadas por Destino Au Pair.</p>
          </div>
          {!isMobile && (
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={exportar} style={{ display:"flex",alignItems:"center",gap:7,background:"#fff",border:"1.5px solid #e9e3f8",color:"#7c5cc4",fontSize:13,fontWeight:600,padding:"9px 18px",borderRadius:12,cursor:"pointer",fontFamily:"inherit" }}>
                <DownloadIcon size={14}/> Exportar lista
              </button>
              <button style={{ display:"flex",alignItems:"center",gap:7,background:"#7c5cc4",color:"#fff",fontSize:13,fontWeight:600,padding:"9px 18px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit" }}>
                <SlidersIcon size={14}/> Filtros <ChevronDownIcon size={13}/>
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:isMobile?"14px 16px 40px":"20px 28px 40px",maxWidth:1400,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,flexDirection:isMobile?"column":"row" }}>

          {/* COLUMNA PRINCIPAL */}
          <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:16 }}>

            {/* Card con tabs */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"14px 20px",borderBottom:"1px solid #e9e3f8" }}>
                <h2 style={{ fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:"#1e1033",margin:0 }}>Perfiles de candidatas</h2>
              </div>

              {/* TABS */}
              <div style={{ display:"flex",borderBottom:"1px solid #e9e3f8" }}>
                {[
                  { id:"eval",    n:1, label:"Evaluación de perfil",  desc:"Revisa y evalúa a las candidatas" },
                  { id:"agencia", n:2, label:"Perfil con la agencia", desc:"Perfil completo junto a Destino Au Pair" },
                ].map(t=>(
                  <button key={t.id} onClick={()=>{ setTabActivo(t.id); setPagina(1); }}
                    style={{ flex:1,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,background:tabActivo===t.id?"#f5f0ff":"#fff",borderBottom:`2px solid ${tabActivo===t.id?"#7c5cc4":"transparent"}`,cursor:"pointer",border:"none",fontFamily:"inherit",textAlign:"left",borderBottom:`2px solid ${tabActivo===t.id?"#7c5cc4":"transparent"}` }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:tabActivo===t.id?"#7c5cc4":"#e9e3f8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:tabActivo===t.id?"#fff":"#9a7080",flexShrink:0 }}>{t.n}</div>
                    <div>
                      <p style={{ fontSize:13,fontWeight:700,color:tabActivo===t.id?"#7c5cc4":"#6b7280",margin:0 }}>{t.label}</p>
                      <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Banner info */}
              <div style={{ padding:"10px 20px",background:"#f0edff",borderBottom:"1px solid #e9e3f8",display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontSize:16,flexShrink:0 }}>ℹ️</span>
                <p style={{ fontSize:12,color:"#5b3fa0",margin:0 }}>
                  {tabActivo==="eval"
                    ? "Primero revisa la evaluación de perfil de cada candidata. Si califica, selecciona su plan de pago y confirma cuando recibas el pago."
                    : "Aquí puedes ver el perfil completo que la candidata completó junto a Destino Au Pair, con su bio, experiencia, referencias y más."}
                </p>
              </div>
            </div>

            {/* FILTROS */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",padding:"12px 16px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ position:"relative",flex:1,minWidth:160 }}>
                <SearchIcon size={13} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9a7080" }}/>
                <input value={busqueda} onChange={e=>{setBusqueda(e.target.value);setPagina(1);}} placeholder="Buscar por nombre o ID..."
                  style={{ width:"100%",paddingLeft:30,paddingRight:10,height:34,border:"1.5px solid #e9e3f8",borderRadius:8,fontSize:12,color:"#374151",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
              </div>
              <select value={filtroPais} onChange={e=>{setFiltroPais(e.target.value);setPagina(1);}} style={SEL}>
                <option value="">País</option>
                {paises.map(p=><option key={p} value={p}>{PAISES_EMOJI[p]||""} {p}</option>)}
              </select>
              <select value={filtroEval} onChange={e=>{setFiltroEval(e.target.value);setPagina(1);}} style={SEL}>
                <option value="">Estado de evaluación</option>
                <option value="califica">Califica</option>
                <option value="requiere_revision">Requiere revisión</option>
                <option value="no_califica">No califica</option>
              </select>
              <select value={orden} onChange={e=>setOrden(e.target.value)} style={SEL}>
                <option value="recientes">Más recientes</option>
                <option value="score">Mayor score</option>
                <option value="nombre">Nombre A-Z</option>
                {tabActivo==="agencia" && <option value="progreso">Mayor progreso</option>}
              </select>
            </div>

            {/* TABLA / CARDS */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>

              {/* Cabecera desktop */}
              {!isMobile && (
                <div style={{ display:"grid",gridTemplateColumns:tabActivo==="eval"?"1.6fr 1.2fr 1.2fr 1.3fr 1.3fr":"1.6fr 1fr 1.2fr 1.2fr 1fr",gap:12,padding:"10px 20px",background:"#faf8ff",borderBottom:"1px solid #e9e3f8" }}>
                  {(tabActivo==="eval"
  ? ["Candidata","Evaluación DAP","Tu evaluación (Agencia)","Plan y pago","Estado del proceso"]
  : ["Candidata","Progreso perfil","Bio / Sobre mí","Experiencia","Acciones"]
).map((h,i)=>(
  <p key={i} style={{ fontSize:10,fontWeight:700,color:"#9a7080",margin:0,textTransform:"uppercase",letterSpacing:".5px" }}>{h}</p>
))}
                </div>
              )}

              {paginadas.length===0 ? (
                <div style={{ padding:"48px 20px",textAlign:"center" }}>
                  <p style={{ fontSize:32,margin:"0 0 8px" }}>🔍</p>
                  <p style={{ fontSize:14,fontWeight:600,color:"#1e1033",margin:"0 0 4px" }}>No hay candidatas</p>
                  <p style={{ fontSize:12,color:"#9a7080",margin:0 }}>Ajusta los filtros o espera a que haya perfiles completados.</p>
                </div>
              ) : paginadas.map((c,i)=>{
                const calDap  = CALIFICACION_MAP[c.calificacion_dap];
                const calAg   = CALIFICACION_MAP[c.eval_agencia];
                const estMap  = ESTADO_MAP[c.estado_agencia] || { bg:"#f3f4f6",color:"#6b7280" };
                const totalCuotas = c.plan==="2_cuotas"?2:c.plan==="4_cuotas"?4:0;
                const borderBottom = i<paginadas.length-1?"1px solid #f0edff":"none";

                if (isMobile) return (
                  <div key={c.id} style={{ padding:"14px 16px",borderBottom }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                      <div style={{ width:38,height:38,borderRadius:"50%",background:"#ede9f8",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:14,fontWeight:700,color:"#7c5cc4" }}>{c.nombre?.[0]}</span>}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <button onClick={()=>tabActivo==="eval"?setModalEval(c):setModalAgencia(c)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,fontSize:13,fontWeight:700,color:"#7c5cc4",fontFamily:"inherit",textAlign:"left" }}>
                          {c.nombre} {c.apellido}
                        </button>
                        <p style={{ fontSize:10,color:"#9a7080",margin:0 }}>{PAISES_EMOJI[c.pais]||""} {c.pais} · {c.edad||"—"} años</p>
                      </div>
                      {tabActivo==="eval" && calDap && <Badge label={calDap.label} bg={calDap.bg} color={calDap.color}/>}
                      {tabActivo==="agencia" && <span style={{ fontSize:12,fontWeight:700,color:"#7c5cc4" }}>{c.progreso_agencia||0}%</span>}
                    </div>
                    {tabActivo==="agencia" && <BarraProgreso pct={c.progreso_agencia} color="#a0435f"/>}
                  </div>
                );

                /* ── DESKTOP ── */
                if (tabActivo==="eval") return (
                  <div key={c.id} style={{ display:"grid",gridTemplateColumns:"1.6fr 1.2fr 1.2fr 1.3fr 1.3fr",gap:12,padding:"16px 20px",borderBottom,alignItems:"start" }}>
                    {/* Candidata */}
                    <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                      <div style={{ width:40,height:40,borderRadius:"50%",background:"#ede9f8",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:15,fontWeight:700,color:"#7c5cc4" }}>{c.nombre?.[0]}</span>}
                      </div>
                      <div>
                        <button onClick={()=>setModalEval(c)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,fontSize:13,fontWeight:700,color:"#7c5cc4",fontFamily:"inherit",textAlign:"left",textDecoration:"underline",textDecorationColor:"#d8d0f0" }}>
                          {c.nombre} {c.apellido}
                        </button>
                        <p style={{ fontSize:10,color:"#9a7080",margin:"2px 0" }}>ID: DA-{String(c.id).padStart(4,"0")}</p>
                        <p style={{ fontSize:11,color:"#6b7280",margin:0 }}>{PAISES_EMOJI[c.pais]||""} {c.pais||"—"}</p>
                      </div>
                    </div>
                    {/* Eval DAP */}
                    <div>
                      {calDap?(<>
                        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
                          <Badge label={calDap.label} bg={calDap.bg} color={calDap.color}/>
                          {c.score_dap&&<span style={{ fontSize:13,fontWeight:700,color:"#1e1033" }}>{c.score_dap}/10</span>}
                        </div>
                        {c.nota_dap&&<p style={{ fontSize:11,color:"#6b7280",margin:"0 0 6px" }}>• {c.nota_dap}</p>}
                        <button onClick={()=>setModalEval(c)} style={{ display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:"#7c5cc4",fontSize:11,fontWeight:600,padding:0,fontFamily:"inherit" }}>
                          Ver evaluación completa <ChevronRightIcon size={12}/>
                        </button>
                      </>):<p style={{ fontSize:12,color:"#9a7080",margin:0 }}>Sin evaluación</p>}
                    </div>
                    {/* Eval agencia */}
                    <div>
                      {c.eval_agencia?(<>
                        {calAg&&<Badge label={calAg.label} bg={calAg.bg} color={calAg.color}/>}
                        {c.eval_agencia==="califica"&&<p style={{ fontSize:11,fontWeight:600,color:"#5a8a3a",margin:"4px 0 2px" }}>¡Perfil aprobado!</p>}
                        {c.eval_updated&&<p style={{ fontSize:10,color:"#9a7080",margin:"0 0 4px" }}>{new Date(c.eval_updated).toLocaleDateString("es-CO")}</p>}
                        {c.nota_agencia&&<p style={{ fontSize:11,color:"#6b7280",margin:"0 0 4px",fontStyle:"italic" }}>"{c.nota_agencia.slice(0,40)}{c.nota_agencia.length>40?"…":""}"</p>}
                      </>):(
                        c.calificacion_dap==="califica"?(<>
                          <p style={{ fontSize:11,color:"#9a7080",margin:"0 0 6px" }}>Aún no evaluada</p>
                          <div style={{ display:"flex",gap:6 }}>
                            <button onClick={()=>accion(c.id,{accion:"evaluar",evaluacion:"califica"})} title="Califica" style={{ width:28,height:28,borderRadius:8,background:"#e8f0e0",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><CheckCircleIcon size={14} style={{ color:"#5a8a3a" }}/></button>
                            <button onClick={()=>accion(c.id,{accion:"evaluar",evaluacion:"requiere_revision"})} title="Requiere revisión" style={{ width:28,height:28,borderRadius:8,background:"#fdf3e3",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><MinusCircleIcon size={14} style={{ color:"#c9973a" }}/></button>
                            <button onClick={()=>accion(c.id,{accion:"evaluar",evaluacion:"no_califica"})} title="No califica" style={{ width:28,height:28,borderRadius:8,background:"#fee2e2",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><XCircleIcon size={14} style={{ color:"#dc2626" }}/></button>
                          </div>
                        </>):<p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Debe calificar primero</p>
                      )}
                      <button onClick={()=>setModalNota({candidata:c,nota:c.nota_agencia})} style={{ display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:"#7c5cc4",fontSize:11,fontWeight:600,padding:"4px 0 0",fontFamily:"inherit" }}>
                        <FileTextIcon size={11}/> {c.nota_agencia?"Editar nota":"Agregar nota"}
                      </button>
                    </div>
                    {/* Plan y pago */}
                    <div>
                      {c.eval_agencia==="califica"?(
                        !c.plan?(<>
                          <p style={{ fontSize:11,fontWeight:600,color:"#1e1033",margin:"0 0 6px" }}>Seleccionar plan</p>
                          <div style={{ display:"flex",gap:6 }}>
                            <button onClick={()=>accion(c.id,{accion:"plan",plan:"2_cuotas"})} style={{ flex:1,padding:"6px",borderRadius:8,border:"1.5px solid #e9e3f8",background:"#fff",color:"#7c5cc4",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>2 cuotas</button>
                            <button onClick={()=>accion(c.id,{accion:"plan",plan:"4_cuotas"})} style={{ flex:1,padding:"6px",borderRadius:8,border:"1.5px solid #e9e3f8",background:"#fff",color:"#7c5cc4",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>4 cuotas</button>
                          </div>
                        </>):(<>
                          <p style={{ fontSize:11,fontWeight:600,color:"#1e1033",margin:"0 0 4px" }}>Plan: {c.plan==="2_cuotas"?"2 cuotas":"4 cuotas"}</p>
                          <div style={{ display:"flex",gap:4,marginBottom:6 }}>
                            {Array.from({length:totalCuotas},(_,i)=>(
                              <div key={i} style={{ width:18,height:18,borderRadius:"50%",background:i<(c.cuotas_pagadas||0)?"#5a8a3a":"#e9e3f8",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                {i<(c.cuotas_pagadas||0)&&<CheckIcon size={9} style={{ color:"#fff" }}/>}
                              </div>
                            ))}
                          </div>
                          <p style={{ fontSize:10,color:"#9a7080",margin:"0 0 6px" }}>{c.cuotas_pagadas||0}/{totalCuotas} cuotas</p>
                          {(c.cuotas_pagadas||0)<totalCuotas?(
                            <button onClick={()=>accion(c.id,{accion:"confirmar_pago",cuotas_pagadas:1})} style={{ width:"100%",padding:"6px",borderRadius:8,border:"none",background:"#7c5cc4",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                              Confirmar pago recibido
                            </button>
                          ):(
                            <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                              <CheckCircleIcon size={12} style={{ color:"#5a8a3a" }}/>
                              <span style={{ fontSize:11,fontWeight:600,color:"#5a8a3a" }}>Pago completo</span>
                            </div>
                          )}
                        </>)
                      ):<p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{c.eval_agencia==="no_califica"?"No aplica":"Debe calificar primero."}</p>}
                    </div>
                    {/* Estado proceso */}
                    <div>
                      <Badge label={c.estado_agencia||"En evaluación"} bg={estMap.bg} color={estMap.color}/>
                      <p style={{ fontSize:11,color:"#6b7280",margin:"6px 0 8px",lineHeight:1.4 }}>
                        {c.estado_agencia==="En evaluación"&&"Revisa la evaluación y decide si califica."}
                        {c.estado_agencia==="Pago pendiente"&&"Confirma el pago para iniciar la activación."}
                        {c.estado_agencia==="En ajustes"&&"La candidata está realizando ajustes."}
                        {c.estado_agencia==="Perfil en activación"&&"Ya puedes iniciar la activación del perfil."}
                        {c.estado_agencia==="No califica"&&"No cumple los requisitos del programa."}
                        {!c.estado_agencia&&"Revisa la evaluación de perfil."}
                      </p>
                      <button onClick={()=>setModalEval(c)} style={{ display:"flex",alignItems:"center",gap:5,background:"#fff",border:"1.5px solid #e9e3f8",color:"#7c5cc4",fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:8,cursor:"pointer",fontFamily:"inherit" }}>
                        👁 Ver detalles
                      </button>
                    </div>
                  </div>
                );

                /* ── TAB AGENCIA ── */
                return (
                  <div key={c.id} style={{ display:"grid",gridTemplateColumns:"1.6fr 1fr 1.2fr 1.2fr 1fr",gap:12,padding:"16px 20px",borderBottom,alignItems:"start" }}>
                    {/* Candidata */}
                    <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                      <div style={{ width:40,height:40,borderRadius:"50%",background:"#ede9f8",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:15,fontWeight:700,color:"#7c5cc4" }}>{c.nombre?.[0]}</span>}
                      </div>
                      <div>
                        <button onClick={()=>setModalAgencia(c)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,fontSize:13,fontWeight:700,color:"#7c5cc4",fontFamily:"inherit",textAlign:"left",textDecoration:"underline",textDecorationColor:"#d8d0f0" }}>
                          {c.nombre} {c.apellido}
                        </button>
                        <p style={{ fontSize:10,color:"#9a7080",margin:"2px 0" }}>ID: DA-{String(c.id).padStart(4,"0")}</p>
                        <p style={{ fontSize:11,color:"#6b7280",margin:0 }}>{PAISES_EMOJI[c.pais]||""} {c.pais||"—"} · {c.edad||"—"} años</p>
                      </div>
                    </div>
                    {/* Progreso agencia */}
                    <div>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:11,color:"#6b7280" }}>Perfil completo</span>
                        <span style={{ fontSize:12,fontWeight:700,color:"#7c5cc4" }}>{c.progreso_agencia||0}%</span>
                      </div>
                      <BarraProgreso pct={c.progreso_agencia} color={c.progreso_agencia>=80?"#5a8a3a":"#7c5cc4"}/>
                      {c.progreso_agencia>=80&&<p style={{ fontSize:10,color:"#5a8a3a",fontWeight:600,margin:"4px 0 0" }}>✓ Listo para agencia</p>}
                    </div>
                    {/* Bio */}
                    <div>
                      {c.bio?<p style={{ fontSize:12,color:"#374151",margin:0,lineHeight:1.4 }}>"{c.bio.slice(0,80)}{c.bio.length>80?"…":""}"</p>
                        :<p style={{ fontSize:11,color:"#9a7080",margin:0,fontStyle:"italic" }}>Sin bio</p>}
                      {c.hobbies&&<p style={{ fontSize:11,color:"#9a7080",margin:"4px 0 0" }}>🎯 {c.hobbies.slice(0,50)}</p>}
                    </div>
                    {/* Experiencia */}
                    <div>
                      <p style={{ fontSize:12,color:"#374151",margin:"0 0 4px" }}>Childcare: <strong>{c.horas_childcare?`${c.horas_childcare} hrs`:"—"}</strong></p>
                      <p style={{ fontSize:12,color:"#374151",margin:"0 0 4px" }}>Exp. niños: <strong>{c.exp_ninos_externos?"Sí":"No"}</strong></p>
                      <p style={{ fontSize:12,color:"#374151",margin:0 }}>Inglés: <strong>{c.nivel_ingles||"—"}</strong></p>
                    </div>
                    {/* Acciones */}
                    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                      <button onClick={()=>setModalAgencia(c)} style={{ display:"flex",alignItems:"center",gap:5,background:"#fff",border:"1.5px solid #e9e3f8",color:"#7c5cc4",fontSize:11,fontWeight:600,padding:"6px 10px",borderRadius:8,cursor:"pointer",fontFamily:"inherit" }}>
                        👁 Ver perfil completo
                      </button>
                      <button onClick={()=>setModalNota({candidata:c,nota:c.nota_agencia})} style={{ display:"flex",alignItems:"center",gap:5,background:"#f5f0ff",border:"1px solid #e9e3f8",color:"#7c5cc4",fontSize:11,fontWeight:600,padding:"6px 10px",borderRadius:8,cursor:"pointer",fontFamily:"inherit" }}>
                        <FileTextIcon size={11} /> {c.nota_agencia?"Editar nota":"Agregar nota"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* PAGINACIÓN */}
              <div style={{ padding:"12px 20px",borderTop:"1px solid #e9e3f8",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
                <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>
                  Mostrando {filtradas.length===0?0:(pagina-1)*porPagina+1} a {Math.min(pagina*porPagina,filtradas.length)} de {filtradas.length} candidatas
                </p>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <button onClick={()=>setPagina(p=>Math.max(1,p-1))} disabled={pagina<=1} style={{ width:28,height:28,borderRadius:8,border:"1px solid #e9e3f8",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:pagina<=1?.4:1 }}>
                    <ChevronLeftIcon size={13} style={{ color:"#7c5cc4" }}/>
                  </button>
                  {Array.from({length:Math.min(totalPags,6)},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setPagina(p)} style={{ width:28,height:28,borderRadius:8,border:"1px solid #e9e3f8",cursor:"pointer",fontSize:12,fontWeight:600,background:p===pagina?"#7c5cc4":"#fff",color:p===pagina?"#fff":"#9a7080" }}>{p}</button>
                  ))}
                  {totalPags>6&&<span style={{ fontSize:12,color:"#9a7080" }}>...</span>}
                  <button onClick={()=>setPagina(p=>Math.min(totalPags,p+1))} disabled={pagina>=totalPags} style={{ width:28,height:28,borderRadius:8,border:"1px solid #e9e3f8",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:pagina>=totalPags?.4:1 }}>
                    <ChevronRightIcon size={13} style={{ color:"#7c5cc4" }}/>
                  </button>
                  <select value={porPagina} onChange={e=>{setPorPagina(Number(e.target.value));setPagina(1);}} style={{ ...SEL,marginLeft:8 }}>
                    {[5,10,20].map(n=><option key={n} value={n}>{n} por página</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR — solo desktop */}
          {!isMobile && (
            <div style={{ width:280,flexShrink:0,display:"flex",flexDirection:"column",gap:16 }}>
              <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e9e3f8",padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 16px" }}>Resumen de evaluación</h3>
                <DonaResumen stats={stats} tabActivo={tabActivo}/>
              </div>

              <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e9e3f8",padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 16px" }}>Proceso explicado</h3>
                {[
                  { n:1,label:"Evaluación de perfil",  desc:"Revisa la evaluación hecha por Destino Au Pair." },
                  { n:2,label:"Plan y pago",            desc:"Selecciona el plan y confirma cuando recibas el pago." },
                  { n:3,label:"Activación del perfil",  desc:"Inicia la activación del perfil junto a Destino Au Pair." },
                  { n:4,label:"Entrevistas y siguientes pasos", desc:"Continúa con entrevistas, match y proceso de visa." },
                ].map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:12,marginBottom:i<3?14:0 }}>
                    <div style={{ width:26,height:26,borderRadius:"50%",background:"#ede9f8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#7c5cc4",flexShrink:0 }}>{p.n}</div>
                    <div>
                      <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 2px" }}>{p.label}</p>
                      <p style={{ fontSize:11,color:"#9a7080",margin:0,lineHeight:1.4 }}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background:"#f5f0ff",borderRadius:20,border:"1px solid #e9e3f8",padding:20 }}>
                <p style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 6px" }}>¿Dudas sobre el proceso?</p>
                <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 14px" }}>Consulta nuestras guías o escríbenos.</p>
                <a href="mailto:hola@destino-aupair.com" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"#fff",border:"1.5px solid #e9e3f8",color:"#7c5cc4",fontSize:12,fontWeight:600,padding:"10px",borderRadius:10,textDecoration:"none" }}>
                  Ir a centro de ayuda ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      {modalEval    && <ModalEvalPerfil   c={modalEval}    onClose={()=>setModalEval(null)}/>}
      {modalAgencia && <ModalPerfilAgencia c={modalAgencia} onClose={()=>setModalAgencia(null)}/>}
      {modalNota && (
        <ModalNota
          candidata={modalNota.candidata}
          notaInicial={modalNota.nota}
          onClose={()=>setModalNota(null)}
          onGuardar={async(nota)=>{ await accion(modalNota.candidata.id,{accion:"nota",nota}); }}
        />
      )}
    </div>
  );
}