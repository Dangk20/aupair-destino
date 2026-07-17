"use client";
// app/agencia/perfiles/page.jsx

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon, DownloadIcon, SlidersIcon,
  CheckCircleIcon, XCircleIcon, MinusCircleIcon,
  FileTextIcon, ChevronRightIcon, ChevronLeftIcon,
  ChevronDownIcon, XIcon, CheckIcon, SaveIcon, EditIcon,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

const PAISES_EMOJI = { "Colombia":"🇨🇴","Mexico":"🇲🇽","México":"🇲🇽","Brasil":"🇧🇷","Brazil":"🇧🇷","Argentina":"🇦🇷","Peru":"🇵🇪","Perú":"🇵🇪","Chile":"🇨🇱","Ecuador":"🇪🇨","Venezuela":"🇻🇪" };

const CALIFICACION_MAP = {
  califica:          { label:"Califica",          bg:"#e8f0e0", color:"#5a8a3a", emoji:"✅" },
  requiere_revision: { label:"Requiere revisión", bg:"#fdf3e3", color:"#c9973a", emoji:"⚠️" },
  no_califica:       { label:"No califica",       bg:"#fee2e2", color:"#dc2626", emoji:"❌" },
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

const IC = { width:"100%",border:"1.5px solid #e9e3f8",borderRadius:8,padding:"7px 10px",fontSize:12,color:"#1e1033",background:"#fff",outline:"none",fontFamily:"inherit",boxSizing:"border-box" };
const LC = { fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".5px",display:"block",marginBottom:3 };

/* ══ PANEL LATERAL DESLIZANTE ══ */
function PanelDetalle({ candidata, onClose, onAccion, tabActivo }) {
  const [tabPanel,   setTabPanel]   = useState("eval");
  const [saving,     setSaving]     = useState(false);
  const [nota,       setNota]       = useState(candidata?.nota_agencia||"");
  const [editando,   setEditando]   = useState(false);
  const [formAgencia,setFormAgencia]= useState({
    bio:               candidata?.bio||"",
    hobbies:           candidata?.hobbies||"",
    por_que_au_pair:   candidata?.por_que_au_pair||"",
    estatura:          candidata?.estatura||"",
    peso:              candidata?.peso||"",
    nacionalidad:      candidata?.nacionalidad||"",
    tiene_pasaporte:   candidata?.tiene_pasaporte||false,
    tipo_licencia:     candidata?.tipo_licencia||"",
    dieta_especial:    candidata?.dieta_especial||"",
  });

  useEffect(()=>{
    if (tabActivo==="agencia") setTabPanel("agencia");
    else setTabPanel("eval");
    setNota(candidata?.nota_agencia||"");
    setFormAgencia({
      bio:candidata?.bio||"",
      hobbies:candidata?.hobbies||"",
      por_que_au_pair:candidata?.por_que_au_pair||"",
      estatura:candidata?.estatura||"",
      peso:candidata?.peso||"",
      nacionalidad:candidata?.nacionalidad||"",
      tiene_pasaporte:candidata?.tiene_pasaporte||false,
      tipo_licencia:candidata?.tipo_licencia||"",
      dieta_especial:candidata?.dieta_especial||"",
    });
  },[candidata, tabActivo]);

  if (!candidata) return null;
  const calDap = CALIFICACION_MAP[candidata.calificacion_dap];
  const calAg  = CALIFICACION_MAP[candidata.eval_agencia];
  const estMap = ESTADO_MAP[candidata.estado_agencia]||{ bg:"#f3f4f6",color:"#6b7280" };
  const totalCuotas = candidata.plan==="2_cuotas"?2:candidata.plan==="4_cuotas"?4:0;

  const guardarNota = async()=>{
    setSaving(true);
    await onAccion(candidata.id,{accion:"nota",nota});
    setSaving(false);
  };

  const guardarPerfil = async()=>{
    setSaving(true);
    await onAccion(candidata.id,{accion:"actualizar_perfil",...formAgencia});
    setSaving(false);
    setEditando(false);
  };

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.4)",zIndex:50,backdropFilter:"blur(2px)" }}/>

      {/* Panel */}
      <div style={{ position:"fixed",top:0,right:0,height:"100vh",width:"min(560px,100vw)",background:"#fff",zIndex:51,display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,.15)",animation:"slideIn .25s ease" }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header panel */}
        <div style={{ background:"linear-gradient(135deg,#1e1033,#7c5cc4)",padding:"16px 20px",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,.15)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"2px solid rgba(255,255,255,.3)" }}>
                {candidata.foto_url?<img src={candidata.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:16,fontWeight:700,color:"#fff" }}>{candidata.nombre?.[0]}</span>}
              </div>
              <div>
                <p style={{ fontSize:15,fontWeight:700,color:"#fff",margin:0 }}>{candidata.nombre} {candidata.apellido}</p>
                <p style={{ fontSize:11,color:"rgba(255,255,255,.7)",margin:0 }}>ID: DA-{String(candidata.id).padStart(4,"0")} · {PAISES_EMOJI[candidata.pais]||""} {candidata.pais} · {candidata.edad||"—"} años</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.15)",border:"none",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <XIcon size={16}/>
            </button>
          </div>

          {/* Tabs del panel */}
          <div style={{ display:"flex",gap:4 }}>
            {[
              { id:"eval",    label:"Evaluación de perfil" },
              { id:"agencia", label:"Perfil con la agencia" },
              { id:"proceso", label:"Plan y proceso" },
            ].map(t=>(
              <button key={t.id} onClick={()=>setTabPanel(t.id)}
                style={{ padding:"6px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",background:tabPanel===t.id?"rgba(255,255,255,.9)":"rgba(255,255,255,.15)",color:tabPanel===t.id?"#1e1033":"rgba(255,255,255,.8)",transition:"all .15s" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido scrollable */}
        <div style={{ flex:1,overflowY:"auto",padding:20 }}>

          {/* ══ TAB EVALUACIÓN ══ */}
          {tabPanel==="eval" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

              {/* Score DAP */}
              {calDap && (
                <div style={{ background:calDap.bg,borderRadius:12,padding:"12px 16px",border:`1px solid ${calDap.color}30`,display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:22 }}>{calDap.emoji}</span>
                  <div>
                    <p style={{ fontSize:13,fontWeight:700,color:calDap.color,margin:0 }}>{calDap.label}{candidata.score_dap?` — Score: ${candidata.score_dap}/10`:""}</p>
                    {candidata.nota_dap&&<p style={{ fontSize:11,color:"#6b7280",margin:"2px 0 0" }}>{candidata.nota_dap}</p>}
                  </div>
                </div>
              )}

              {/* Progreso */}
              <div style={{ background:"#f9f7ff",borderRadius:12,padding:"12px 16px",border:"1px solid #e9e3f8" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:12,fontWeight:600,color:"#1e1033" }}>Progreso de evaluación</span>
                  <span style={{ fontSize:12,fontWeight:700,color:"#7c5cc4" }}>{candidata.progreso_eval||0}%</span>
                </div>
                <BarraProgreso pct={candidata.progreso_eval} color="#7c5cc4"/>
              </div>

              {/* Datos personales */}
              <div>
                <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 8px",padding:"6px 0",borderBottom:"1px solid #e9e3f8" }}>Datos personales</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {[
                    { label:"Cédula",            val:candidata.cedula||"—" },
                    { label:"Teléfono",          val:candidata.telefono||"—" },
                    { label:"Fecha nacimiento",  val:candidata.fecha_nacimiento?new Date(candidata.fecha_nacimiento).toLocaleDateString("es-CO"):"—" },
                    { label:"Ciudad",            val:candidata.ciudad||"—" },
                    { label:"Nivel de inglés",   val:candidata.nivel_ingles||"—" },
                    { label:"Situación actual",  val:candidata.situacion_actual||"—" },
                    { label:"Carrera",           val:candidata.carrera_graduada||"—" },
                    { label:"Horas childcare",   val:candidata.horas_childcare?`${candidata.horas_childcare} hrs`:"—" },
                  ].map((f,i)=>(
                    <div key={i} style={{ background:"#f9f7ff",borderRadius:8,padding:"8px 10px",border:"1px solid #e9e3f8" }}>
                      <p style={{ fontSize:9,color:"#9a7080",margin:"0 0 2px",textTransform:"uppercase",fontWeight:700 }}>{f.label}</p>
                      <p style={{ fontSize:12,fontWeight:600,color:"#1e1033",margin:0 }}>{f.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requisitos */}
              <div>
                <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 8px",padding:"6px 0",borderBottom:"1px solid #e9e3f8" }}>Requisitos del programa</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {[
                    { label:"Licencia conducción",  val:SI_NO(candidata.licencia_conduccion) },
                    { label:"Primeros auxilios",    val:SI_NO(candidata.curso_primeros_auxilios) },
                    { label:"Exp. con niños",       val:SI_NO(candidata.exp_ninos_externos) },
                    { label:"Visa negada",          val:SI_NO(candidata.visa_negada) },
                    { label:"Familiar en USA",      val:SI_NO(candidata.familiar_residencia_usa) },
                    { label:"Entiende intercambio", val:SI_NO(candidata.entiende_intercambio_cultural) },
                    { label:"Enfermedades",         val:SI_NO(candidata.enfermedad_medicamentos) },
                    { label:"Depresión/pánico",     val:SI_NO(candidata.depresion_panico) },
                  ].map((f,i)=>(
                    <div key={i} style={{ background:"#f9f7ff",borderRadius:8,padding:"8px 10px",border:"1px solid #e9e3f8" }}>
                      <p style={{ fontSize:9,color:"#9a7080",margin:"0 0 2px",textTransform:"uppercase",fontWeight:700 }}>{f.label}</p>
                      <p style={{ fontSize:12,fontWeight:600,color:"#1e1033",margin:0 }}>{f.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calificación agencia */}
              <div style={{ background:"#f9f7ff",borderRadius:12,padding:"14px 16px",border:"1px solid #e9e3f8" }}>
                <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 10px" }}>Tu calificación como agencia</p>
                {calAg && (
                  <div style={{ marginBottom:10 }}>
                    <Badge label={calAg.label} bg={calAg.bg} color={calAg.color}/>
                    {candidata.eval_agencia==="califica"&&<span style={{ fontSize:11,fontWeight:600,color:"#5a8a3a",marginLeft:8 }}>¡Perfil aprobado!</span>}
                  </div>
                )}
                <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                  {[
                    { val:"califica",          label:"✅ Califica",          bg:"#e8f0e0",color:"#5a8a3a",activeBg:"#5a8a3a" },
                    { val:"requiere_revision",  label:"⚠️ Revisar",           bg:"#fdf3e3",color:"#c9973a",activeBg:"#c9973a" },
                    { val:"no_califica",        label:"❌ No califica",       bg:"#fee2e2",color:"#dc2626",activeBg:"#dc2626" },
                  ].map(btn=>(
                    <button key={btn.val} onClick={()=>onAccion(candidata.id,{accion:"evaluar",evaluacion:btn.val})}
                      style={{ flex:1,padding:"8px 6px",borderRadius:8,border:`2px solid ${candidata.eval_agencia===btn.val?btn.activeBg:btn.bg}`,background:candidata.eval_agencia===btn.val?btn.activeBg:btn.bg,color:candidata.eval_agencia===btn.val?"#fff":btn.color,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s" }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
                <label style={LC}>Nota interna sobre esta candidata</label>
                <textarea value={nota} onChange={e=>setNota(e.target.value)} rows={3} placeholder="Escribe tus observaciones..."
                  style={{ ...IC,resize:"vertical",marginBottom:8 }}/>
                <button onClick={guardarNota} disabled={saving} style={{ width:"100%",padding:"9px",borderRadius:8,border:"none",background:"#7c5cc4",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:saving?.6:1 }}>
                  {saving?"Guardando...":"💾 Guardar nota"}
                </button>
              </div>
            </div>
          )}

          {/* ══ TAB AGENCIA ══ */}
          {tabPanel==="agencia" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

              {/* Progreso */}
              <div style={{ background:"#f9f7ff",borderRadius:12,padding:"12px 16px",border:"1px solid #e9e3f8" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:12,fontWeight:600,color:"#1e1033" }}>Perfil con la agencia</span>
                  <span style={{ fontSize:12,fontWeight:700,color:candidata.progreso_agencia>=80?"#5a8a3a":"#7c5cc4" }}>{candidata.progreso_agencia||0}%</span>
                </div>
                <BarraProgreso pct={candidata.progreso_agencia} color={candidata.progreso_agencia>=80?"#5a8a3a":"#7c5cc4"}/>
                {candidata.progreso_agencia>=80&&<p style={{ fontSize:11,color:"#5a8a3a",fontWeight:600,margin:"4px 0 0" }}>✓ Listo para agencia</p>}
              </div>

              {/* Botón editar */}
              <div style={{ display:"flex",justifyContent:"flex-end" }}>
                <button onClick={()=>setEditando(e=>!e)} style={{ display:"flex",alignItems:"center",gap:6,background:editando?"#fee2e2":"#f5f0ff",border:`1px solid ${editando?"#fecaca":"#e9e3f8"}`,color:editando?"#dc2626":"#7c5cc4",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer",fontFamily:"inherit" }}>
                  {editando?<><XIcon size={12}/> Cancelar</> : <><EditIcon size={12}/> Editar perfil</>}
                </button>
              </div>

              {/* Bio */}
              <div>
                <label style={LC}>Sobre mí (Bio)</label>
                {editando
                  ? <textarea value={formAgencia.bio} onChange={e=>setFormAgencia(f=>({...f,bio:e.target.value}))} rows={4} style={{ ...IC,resize:"vertical" }} placeholder="Cuéntanos sobre ti..."/>
                  : <div style={{ background:"#f9f7ff",borderRadius:8,padding:"10px 12px",border:"1px solid #e9e3f8",fontSize:12,color:"#374151",lineHeight:1.5,minHeight:60 }}>
                      {candidata.bio||<span style={{ color:"#9a7080",fontStyle:"italic" }}>Sin bio</span>}
                    </div>}
              </div>

              {/* Hobbies */}
              <div>
                <label style={LC}>Hobbies e intereses</label>
                {editando
                  ? <input value={formAgencia.hobbies} onChange={e=>setFormAgencia(f=>({...f,hobbies:e.target.value}))} style={IC} placeholder="Ej: Fotografía, música, natación"/>
                  : <div style={{ background:"#f9f7ff",borderRadius:8,padding:"10px 12px",border:"1px solid #e9e3f8",fontSize:12,color:"#374151" }}>
                      {candidata.hobbies||<span style={{ color:"#9a7080",fontStyle:"italic" }}>Sin hobbies</span>}
                    </div>}
              </div>

              {/* Por qué au pair */}
              <div>
                <label style={LC}>¿Por qué quiere ser Au Pair?</label>
                {editando
                  ? <textarea value={formAgencia.por_que_au_pair} onChange={e=>setFormAgencia(f=>({...f,por_que_au_pair:e.target.value}))} rows={3} style={{ ...IC,resize:"vertical" }} placeholder="Motivación para ser Au Pair..."/>
                  : <div style={{ background:"#fce8ed",borderRadius:8,padding:"10px 12px",border:"1px solid #f0b8c4",fontSize:12,color:"#2d1a22",lineHeight:1.5,minHeight:50 }}>
                      {candidata.por_que_au_pair||<span style={{ color:"#9a7080",fontStyle:"italic" }}>Sin respuesta</span>}
                    </div>}
              </div>

              {/* Datos adicionales */}
              <div>
                <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 8px",padding:"6px 0",borderBottom:"1px solid #e9e3f8" }}>Información adicional</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {editando ? (
                    <>
                      {[
                        { label:"Estatura (cm)", key:"estatura", type:"number" },
                        { label:"Peso (kg)",     key:"peso",     type:"number" },
                        { label:"Nacionalidad",  key:"nacionalidad", type:"text" },
                        { label:"Tipo licencia", key:"tipo_licencia", type:"text" },
                        { label:"Dieta especial",key:"dieta_especial", type:"text" },
                      ].map(f=>(
                        <div key={f.key}>
                          <label style={LC}>{f.label}</label>
                          <input type={f.type} value={formAgencia[f.key]} onChange={e=>setFormAgencia(p=>({...p,[f.key]:e.target.value}))} style={IC} placeholder={f.label}/>
                        </div>
                      ))}
                      <div>
                        <label style={LC}>Tiene pasaporte</label>
                        <select value={formAgencia.tiene_pasaporte?"1":"0"} onChange={e=>setFormAgencia(f=>({...f,tiene_pasaporte:e.target.value==="1"}))} style={IC}>
                          <option value="1">Sí</option>
                          <option value="0">No</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    [
                      { label:"Estatura",      val:candidata.estatura?`${candidata.estatura} cm`:"—" },
                      { label:"Peso",          val:candidata.peso?`${candidata.peso} kg`:"—" },
                      { label:"Nacionalidad",  val:candidata.nacionalidad||"—" },
                      { label:"Pasaporte",     val:SI_NO(candidata.tiene_pasaporte) },
                      { label:"Tipo licencia", val:candidata.tipo_licencia||"—" },
                      { label:"Dieta especial",val:candidata.dieta_especial||"—" },
                    ].map((f,i)=>(
                      <div key={i} style={{ background:"#f9f7ff",borderRadius:8,padding:"8px 10px",border:"1px solid #e9e3f8" }}>
                        <p style={{ fontSize:9,color:"#9a7080",margin:"0 0 2px",textTransform:"uppercase",fontWeight:700 }}>{f.label}</p>
                        <p style={{ fontSize:12,fontWeight:600,color:"#1e1033",margin:0 }}>{f.val}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Referencias */}
              <div>
                <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 8px",padding:"6px 0",borderBottom:"1px solid #e9e3f8" }}>Referencias</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {[
                    { label:"Referencia 1",       val:candidata.referencia_1_nombre||"—" },
                    { label:"Email ref. 1",        val:candidata.referencia_1_email||"—" },
                    { label:"Teléfono ref. 1",     val:candidata.referencia_1_telefono||"—" },
                    { label:"Referencia 2",        val:candidata.referencia_2_nombre||"—" },
                    { label:"Email ref. 2",        val:candidata.referencia_2_email||"—" },
                  ].map((f,i)=>(
                    <div key={i} style={{ background:"#f9f7ff",borderRadius:8,padding:"8px 10px",border:"1px solid #e9e3f8" }}>
                      <p style={{ fontSize:9,color:"#9a7080",margin:"0 0 2px",textTransform:"uppercase",fontWeight:700 }}>{f.label}</p>
                      <p style={{ fontSize:12,fontWeight:600,color:"#1e1033",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{f.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {editando && (
                <button onClick={guardarPerfil} disabled={saving}
                  style={{ width:"100%",padding:"11px",borderRadius:10,border:"none",background:"#7c5cc4",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:saving?.6:1 }}>
                  <SaveIcon size={13}/>{saving?"Guardando...":"Guardar cambios"}
                </button>
              )}
            </div>
          )}

          {/* ══ TAB PROCESO ══ */}
          {tabPanel==="proceso" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

              {/* Estado actual */}
              <div style={{ background:"#f9f7ff",borderRadius:12,padding:"14px 16px",border:"1px solid #e9e3f8" }}>
                <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 8px" }}>Estado del proceso</p>
                <Badge label={candidata.estado_agencia||"En evaluación"} bg={estMap.bg} color={estMap.color}/>
                <p style={{ fontSize:12,color:"#6b7280",margin:"8px 0 0",lineHeight:1.5 }}>
                  {candidata.estado_agencia==="En evaluación"&&"Revisa la evaluación de perfil y decide si la candidata califica para tu agencia."}
                  {candidata.estado_agencia==="Pago pendiente"&&"Confirma el pago para iniciar la activación del perfil con Destino Au Pair."}
                  {candidata.estado_agencia==="En ajustes"&&"La candidata está realizando los ajustes recomendados por la agencia."}
                  {candidata.estado_agencia==="Perfil en activación"&&"Ya puedes iniciar el proceso de activación del perfil junto a Destino Au Pair."}
                  {candidata.estado_agencia==="No califica"&&"La candidata no cumple con los requisitos del programa."}
                  {!candidata.estado_agencia&&"Revisa la evaluación de perfil para comenzar el proceso."}
                </p>
              </div>

              {/* Plan de pago */}
              <div style={{ background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #e9e3f8" }}>
                <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 10px" }}>Plan de pago</p>
                {candidata.eval_agencia==="califica" ? (
                  !candidata.plan ? (
                    <>
                      <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 10px" }}>Elige cuántas cuotas deseas pagar por esta candidata.</p>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                        <button onClick={()=>onAccion(candidata.id,{accion:"plan",plan:"2_cuotas"})}
                          style={{ padding:"14px",borderRadius:10,border:"2px solid #e9e3f8",background:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"center" }}>
                          <p style={{ fontSize:18,fontWeight:700,color:"#7c5cc4",margin:"0 0 4px" }}>2 cuotas</p>
                          <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Pago en 2 partes</p>
                        </button>
                        <button onClick={()=>onAccion(candidata.id,{accion:"plan",plan:"4_cuotas"})}
                          style={{ padding:"14px",borderRadius:10,border:"2px solid #e9e3f8",background:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"center" }}>
                          <p style={{ fontSize:18,fontWeight:700,color:"#7c5cc4",margin:"0 0 4px" }}>4 cuotas</p>
                          <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Pago en 4 partes</p>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ background:"#f5f0ff",borderRadius:10,padding:"12px 14px",marginBottom:12 }}>
                        <p style={{ fontSize:12,fontWeight:700,color:"#7c5cc4",margin:"0 0 6px" }}>Plan elegido: {candidata.plan==="2_cuotas"?"2 cuotas":"4 cuotas"}</p>
                        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                          {Array.from({length:totalCuotas},(_,i)=>(
                            <div key={i} style={{ width:32,height:32,borderRadius:"50%",background:i<(candidata.cuotas_pagadas||0)?"#5a8a3a":"#e9e3f8",display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${i<(candidata.cuotas_pagadas||0)?"#5a8a3a":"#d1d5db"}` }}>
                              {i<(candidata.cuotas_pagadas||0)?<CheckIcon size={14} style={{ color:"#fff" }}/>:<span style={{ fontSize:11,fontWeight:700,color:"#9a7080" }}>{i+1}</span>}
                            </div>
                          ))}
                          <span style={{ fontSize:12,color:"#6b7280",marginLeft:4 }}>{candidata.cuotas_pagadas||0} de {totalCuotas} pagadas</span>
                        </div>
                      </div>
                      {(candidata.cuotas_pagadas||0)<totalCuotas ? (
                        <button onClick={()=>onAccion(candidata.id,{accion:"confirmar_pago",cuotas_pagadas:1})}
                          style={{ width:"100%",padding:"12px",borderRadius:10,border:"none",background:"#7c5cc4",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                          ✓ Confirmar pago recibido
                        </button>
                      ) : (
                        <div style={{ background:"#e8f0e0",borderRadius:10,padding:"12px",textAlign:"center",border:"1px solid #bbf7d0" }}>
                          <p style={{ fontSize:13,fontWeight:700,color:"#5a8a3a",margin:0 }}>✅ Pago completo</p>
                          <p style={{ fontSize:11,color:"#059669",margin:"4px 0 0" }}>Todas las cuotas han sido confirmadas</p>
                        </div>
                      )}
                    </>
                  )
                ) : (
                  <div style={{ background:"#fafafa",borderRadius:10,padding:"12px 14px",border:"1px solid #e9e3f8" }}>
                    <p style={{ fontSize:12,color:"#9a7080",margin:0 }}>
                      {candidata.eval_agencia==="no_califica"?"Esta candidata no califica — no aplica plan de pago.":"Primero debes calificar a la candidata como apta para seleccionar el plan."}
                    </p>
                  </div>
                )}
              </div>

              {/* Línea de tiempo proceso */}
              <div>
                <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 12px" }}>Pasos del proceso</p>
                {[
                  { n:1, label:"Evaluación de perfil",       done:!!candidata.eval_agencia, active:!candidata.eval_agencia },
                  { n:2, label:"Plan y pago seleccionado",   done:!!candidata.plan,         active:candidata.eval_agencia==="califica"&&!candidata.plan },
                  { n:3, label:"Pago confirmado",            done:(candidata.cuotas_pagadas||0)>0, active:!!candidata.plan&&(candidata.cuotas_pagadas||0)===0 },
                  { n:4, label:"Perfil en activación",       done:candidata.estado_agencia==="Perfil en activación", active:false },
                ].map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:12,marginBottom:i<3?12:0,alignItems:"flex-start" }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:p.done?"#5a8a3a":p.active?"#7c5cc4":"#e9e3f8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`2px solid ${p.done?"#5a8a3a":p.active?"#7c5cc4":"#d1d5db"}` }}>
                      {p.done?<CheckIcon size={13} style={{ color:"#fff" }}/>:<span style={{ fontSize:11,fontWeight:700,color:p.active?"#fff":"#9a7080" }}>{p.n}</span>}
                    </div>
                    <div style={{ flex:1,paddingTop:4 }}>
                      <p style={{ fontSize:12,fontWeight:p.active?700:600,color:p.done?"#5a8a3a":p.active?"#7c5cc4":"#6b7280",margin:0 }}>{p.label}</p>
                      {p.active&&<p style={{ fontSize:10,color:"#9a7080",margin:"2px 0 0" }}>Paso actual</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"12px 20px",borderTop:"1px solid #e9e3f8",flexShrink:0,display:"flex",gap:10 }}>
          <button onClick={onClose} style={{ flex:1,padding:"10px",borderRadius:10,border:"1.5px solid #e9e3f8",background:"#fff",color:"#9a7080",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            Cerrar
          </button>
          {tabPanel==="eval" && (
            <button onClick={guardarNota} disabled={saving}
              style={{ flex:2,padding:"10px",borderRadius:10,border:"none",background:"#7c5cc4",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:saving?.6:1 }}>
              {saving?"Guardando...":"💾 Guardar nota"}
            </button>
          )}
          {tabPanel==="agencia" && editando && (
            <button onClick={guardarPerfil} disabled={saving}
              style={{ flex:2,padding:"10px",borderRadius:10,border:"none",background:"#7c5cc4",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:saving?.6:1 }}>
              {saving?"Guardando...":"💾 Guardar cambios"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   DONA RESUMEN
════════════════════════════════════════ */
function DonaResumen({ stats, tabActivo }) {
  const total = stats.total||1;
  const data = tabActivo==="eval"
    ? [{ label:"Califican",val:stats.califican||0,color:"#5a8a3a" },{ label:"Req. revisión",val:stats.requierenRevision||0,color:"#c9973a" },{ label:"No califican",val:stats.noCalifican||0,color:"#dc2626" }]
    : [{ label:"Completo",val:stats.perfilCompleto||0,color:"#5a8a3a" },{ label:"En progreso",val:(stats.total||0)-(stats.perfilCompleto||0),color:"#7c5cc4" }];
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

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function AgenciaPerfilesPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,        setUser]        = useState(null);
  const [candidatas,  setCandidatas]  = useState([]);
  const [stats,       setStats]       = useState({ total:0,califican:0,requierenRevision:0,noCalifican:0,perfilCompleto:0 });
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const [tabActivo,   setTabActivo]   = useState("eval");
  const [panelCand,   setPanelCand]   = useState(null);

  const [busqueda,    setBusqueda]    = useState("");
  const [filtroPais,  setFiltroPais]  = useState("");
  const [filtroEval,  setFiltroEval]  = useState("");
  const [orden,       setOrden]       = useState("recientes");
  const [pagina,      setPagina]      = useState(1);
  const [porPagina,   setPorPagina]   = useState(5);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = useCallback(async()=>{
    const [me,data] = await Promise.all([
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
    const res = await fetch(`/api/agencia/perfiles/${id}`,{ method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body) });
    const data = await res.json();
    if (data.ok) {
      showToast(data.msg||"Guardado ✓");
      await cargar();
      // Actualizar el panel con datos frescos
      if (panelCand?.id===id) {
        const fresh = await fetch("/api/agencia/perfiles").then(r=>r.ok?r.json():null).catch(()=>null);
        if (fresh?.ok) {
          const updated = fresh.candidatas.find(c=>c.id===id);
          if (updated) setPanelCand(updated);
        }
      }
    } else showToast(data.error||"Error","error");
  };

  const exportar = () => {
    const csv=["Nombre,País,Score DAP,Calificación,Plan,Cuotas,Estado\n",...candidatas.map(c=>`${c.nombre} ${c.apellido},${c.pais||""},${c.score_dap||""},${c.calificacion_dap||""},${c.plan||""},${c.cuotas_pagadas||0},${c.estado_agencia||""}`)].join("\n");
    const a=Object.assign(document.createElement("a"),{href:`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,download:"perfiles.csv"});
    a.click(); showToast("Exportado ✓");
  };

  const paises = [...new Set(candidatas.map(c=>c.pais).filter(Boolean))];
  let filtradas = candidatas.filter(c=>{
    const q=busqueda.toLowerCase();
    return (!q||`${c.nombre} ${c.apellido} ${c.id}`.toLowerCase().includes(q))&&(!filtroPais||c.pais===filtroPais)&&(!filtroEval||c.eval_agencia===filtroEval);
  });
  if (orden==="recientes") filtradas=[...filtradas].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  else if (orden==="score") filtradas=[...filtradas].sort((a,b)=>(b.score_dap||0)-(a.score_dap||0));
  else if (orden==="nombre") filtradas=[...filtradas].sort((a,b)=>a.nombre.localeCompare(b.nombre));
  else if (orden==="progreso") filtradas=[...filtradas].sort((a,b)=>(b.progreso_agencia||0)-(a.progreso_agencia||0));

  const totalPags=Math.ceil(filtradas.length/porPagina);
  const paginadas=filtradas.slice((pagina-1)*porPagina,pagina*porPagina);
  const SEL={ height:34,border:"1.5px solid #e9e3f8",borderRadius:8,padding:"0 10px",fontSize:12,color:"#374151",background:"#fff",outline:"none",fontFamily:"inherit",cursor:"pointer" };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f3ff" }}>
      <div style={{ width:36,height:36,border:"3px solid #7c5cc4",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#f5f3ff",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast&&<div style={{ position:"fixed",top:20,right:20,zIndex:400,background:toast.tipo==="error"?"#dc2626":"#1e1033",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.15)",display:"flex",alignItems:"center",gap:8 }}>
        {toast.tipo==="error"?"❌":"✓"} {toast.msg}
      </div>}

      {/* PANEL LATERAL */}
      {panelCand && <PanelDetalle candidata={panelCand} onClose={()=>setPanelCand(null)} onAccion={accion} tabActivo={tabActivo}/>}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e9e3f8",padding:isMobile?"14px 16px":"20px 28px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?20:24,fontWeight:700,color:"#1e1033",margin:0 }}>¡Hola, {user?.nombre}! 👋</h1>
            <p style={{ fontSize:13,color:"#9a7080",margin:"4px 0 0" }}>Gestiona y revisa los perfiles de las candidatas aprobadas por Destino Au Pair.</p>
          </div>
          {!isMobile&&(
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={exportar} style={{ display:"flex",alignItems:"center",gap:7,background:"#fff",border:"1.5px solid #e9e3f8",color:"#7c5cc4",fontSize:13,fontWeight:600,padding:"9px 18px",borderRadius:12,cursor:"pointer",fontFamily:"inherit" }}>
                <DownloadIcon size={14}/> Exportar lista
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:isMobile?"14px 16px 40px":"20px 28px 40px",maxWidth:1400,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,flexDirection:isMobile?"column":"row" }}>
          <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:16 }}>

            {/* Tabs */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"14px 20px",borderBottom:"1px solid #e9e3f8" }}>
                <h2 style={{ fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:"#1e1033",margin:0 }}>Perfiles de candidatas</h2>
              </div>
              <div style={{ display:"flex",borderBottom:"1px solid #e9e3f8" }}>
                {[
                  { id:"eval",    n:1, label:"Evaluación de perfil",  desc:"Revisa y evalúa a las candidatas" },
                  { id:"agencia", n:2, label:"Perfil con la agencia", desc:"Perfil completo junto a Destino Au Pair" },
                ].map(t=>(
                  <button key={t.id} onClick={()=>{ setTabActivo(t.id); setPagina(1); }}
                    style={{ flex:1,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,background:tabActivo===t.id?"#f5f0ff":"#fff",borderBottom:`2px solid ${tabActivo===t.id?"#7c5cc4":"transparent"}`,cursor:"pointer",border:"none",fontFamily:"inherit",textAlign:"left" }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:tabActivo===t.id?"#7c5cc4":"#e9e3f8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:tabActivo===t.id?"#fff":"#9a7080",flexShrink:0 }}>{t.n}</div>
                    <div>
                      <p style={{ fontSize:13,fontWeight:700,color:tabActivo===t.id?"#7c5cc4":"#6b7280",margin:0 }}>{t.label}</p>
                      <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ padding:"10px 20px",background:"#f0edff",display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontSize:16,flexShrink:0 }}>ℹ️</span>
                <p style={{ fontSize:12,color:"#5b3fa0",margin:0 }}>
                  {tabActivo==="eval"?"Haz clic en el nombre de una candidata para ver su evaluación completa, calificarla y agregar notas.":"Haz clic en el nombre de una candidata para ver y editar su perfil con la agencia."}
                </p>
              </div>
            </div>

            {/* Filtros */}
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
                <option value="">Evaluación agencia</option>
                <option value="califica">Califica</option>
                <option value="requiere_revision">Requiere revisión</option>
                <option value="no_califica">No califica</option>
              </select>
              <select value={orden} onChange={e=>setOrden(e.target.value)} style={SEL}>
                <option value="recientes">Más recientes</option>
                <option value="score">Mayor score</option>
                <option value="nombre">Nombre A-Z</option>
                {tabActivo==="agencia"&&<option value="progreso">Mayor progreso</option>}
              </select>
            </div>

            {/* Tabla */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              {!isMobile&&(
                <div style={{ display:"grid",gridTemplateColumns:tabActivo==="eval"?"1.8fr 1fr 1fr 1fr 1fr":"1.8fr 1fr 1.2fr 1.2fr 1fr",gap:12,padding:"10px 20px",background:"#faf8ff",borderBottom:"1px solid #e9e3f8" }}>
                  {(tabActivo==="eval"
                    ?["Candidata","Score DAP","Tu evaluación","Plan y cuotas","Estado"]
                    :["Candidata","Progreso perfil","Bio","Experiencia","Acciones"]
                  ).map((h,i)=>(
                    <p key={i} style={{ fontSize:10,fontWeight:700,color:"#9a7080",margin:0,textTransform:"uppercase",letterSpacing:".5px" }}>{h}</p>
                  ))}
                </div>
              )}

              {paginadas.length===0?(
                <div style={{ padding:"48px 20px",textAlign:"center" }}>
                  <p style={{ fontSize:32,margin:"0 0 8px" }}>🔍</p>
                  <p style={{ fontSize:14,fontWeight:600,color:"#1e1033",margin:"0 0 4px" }}>No hay candidatas</p>
                  <p style={{ fontSize:12,color:"#9a7080",margin:0 }}>Ajusta los filtros.</p>
                </div>
              ):paginadas.map((c,i)=>{
                const calDap=CALIFICACION_MAP[c.calificacion_dap];
                const calAg=CALIFICACION_MAP[c.eval_agencia];
                const estMap=ESTADO_MAP[c.estado_agencia]||{ bg:"#f3f4f6",color:"#6b7280" };
                const totalC=c.plan==="2_cuotas"?2:c.plan==="4_cuotas"?4:0;
                const border=i<paginadas.length-1?"1px solid #f0edff":"none";

                if (isMobile) return (
                  <div key={c.id} style={{ padding:"14px 16px",borderBottom:border }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:38,height:38,borderRadius:"50%",background:"#ede9f8",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:14,fontWeight:700,color:"#7c5cc4" }}>{c.nombre?.[0]}</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <button onClick={()=>setPanelCand(c)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,fontSize:13,fontWeight:700,color:"#7c5cc4",fontFamily:"inherit",textAlign:"left" }}>
                          {c.nombre} {c.apellido}
                        </button>
                        <p style={{ fontSize:10,color:"#9a7080",margin:0 }}>{PAISES_EMOJI[c.pais]||""} {c.pais} · {c.edad||"—"} años</p>
                      </div>
                      {calDap&&<Badge label={calDap.label} bg={calDap.bg} color={calDap.color}/>}
                    </div>
                    {tabActivo==="agencia"&&<div style={{ marginTop:8 }}><BarraProgreso pct={c.progreso_agencia} color="#7c5cc4"/></div>}
                  </div>
                );

                if (tabActivo==="eval") return (
                  <div key={c.id} style={{ display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr 1fr",gap:12,padding:"14px 20px",borderBottom:border,alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
                      <div style={{ width:38,height:38,borderRadius:"50%",background:"#ede9f8",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:14,fontWeight:700,color:"#7c5cc4" }}>{c.nombre?.[0]}</span>}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <button onClick={()=>setPanelCand(c)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,fontSize:13,fontWeight:700,color:"#7c5cc4",fontFamily:"inherit",textAlign:"left",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%",display:"block" }}>
                          {c.nombre} {c.apellido}
                        </button>
                        <p style={{ fontSize:10,color:"#9a7080",margin:0 }}>ID: DA-{String(c.id).padStart(4,"0")} · {PAISES_EMOJI[c.pais]||""} {c.pais}</p>
                      </div>
                    </div>
                    <div>
                      {calDap?<><Badge label={calDap.label} bg={calDap.bg} color={calDap.color}/>{c.score_dap&&<p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"4px 0 0" }}>{c.score_dap}/10</p>}</>:<p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Sin score</p>}
                    </div>
                    <div>
                      {calAg?<><Badge label={calAg.label} bg={calAg.bg} color={calAg.color}/></>:<p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Sin evaluar</p>}
                    </div>
                    <div>
                      {c.plan?(
                        <div style={{ display:"flex",gap:4 }}>
                          {Array.from({length:totalC},(_,i)=>(
                            <div key={i} style={{ width:16,height:16,borderRadius:"50%",background:i<(c.cuotas_pagadas||0)?"#5a8a3a":"#e9e3f8",display:"flex",alignItems:"center",justifyContent:"center" }}>
                              {i<(c.cuotas_pagadas||0)&&<CheckIcon size={9} style={{ color:"#fff" }}/>}
                            </div>
                          ))}
                          <span style={{ fontSize:10,color:"#9a7080",marginLeft:4 }}>{c.cuotas_pagadas||0}/{totalC}</span>
                        </div>
                      ):<p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Sin plan</p>}
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <Badge label={c.estado_agencia||"En evaluación"} bg={estMap.bg} color={estMap.color}/>
                      <button onClick={()=>setPanelCand(c)} style={{ width:26,height:26,borderRadius:7,background:"#f5f0ff",border:"1px solid #e9e3f8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }} title="Abrir panel">
                        <ChevronRightIcon size={13} style={{ color:"#7c5cc4" }}/>
                      </button>
                    </div>
                  </div>
                );

                return (
                  <div key={c.id} style={{ display:"grid",gridTemplateColumns:"1.8fr 1fr 1.2fr 1.2fr 1fr",gap:12,padding:"14px 20px",borderBottom:border,alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
                      <div style={{ width:38,height:38,borderRadius:"50%",background:"#ede9f8",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:14,fontWeight:700,color:"#7c5cc4" }}>{c.nombre?.[0]}</span>}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <button onClick={()=>setPanelCand(c)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,fontSize:13,fontWeight:700,color:"#7c5cc4",fontFamily:"inherit",textAlign:"left" }}>
                          {c.nombre} {c.apellido}
                        </button>
                        <p style={{ fontSize:10,color:"#9a7080",margin:0 }}>{PAISES_EMOJI[c.pais]||""} {c.pais}</p>
                      </div>
                    </div>
                    <div>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:10,color:"#6b7280" }}>Completo</span>
                        <span style={{ fontSize:11,fontWeight:700,color:"#7c5cc4" }}>{c.progreso_agencia||0}%</span>
                      </div>
                      <BarraProgreso pct={c.progreso_agencia} color={c.progreso_agencia>=80?"#5a8a3a":"#7c5cc4"}/>
                    </div>
                    <p style={{ fontSize:12,color:"#374151",margin:0 }}>{c.bio?`"${c.bio.slice(0,50)}…"`:<span style={{ color:"#9a7080",fontStyle:"italic" }}>Sin bio</span>}</p>
                    <div>
                      <p style={{ fontSize:11,color:"#374151",margin:"0 0 2px" }}>Childcare: <strong>{c.horas_childcare?`${c.horas_childcare}h`:"—"}</strong></p>
                      <p style={{ fontSize:11,color:"#374151",margin:0 }}>Inglés: <strong>{c.nivel_ingles||"—"}</strong></p>
                    </div>
                    <button onClick={()=>setPanelCand(c)} style={{ display:"flex",alignItems:"center",gap:5,background:"#f5f0ff",border:"1px solid #e9e3f8",color:"#7c5cc4",fontSize:11,fontWeight:600,padding:"7px 10px",borderRadius:8,cursor:"pointer",fontFamily:"inherit" }}>
                      Ver perfil <ChevronRightIcon size={12}/>
                    </button>
                  </div>
                );
              })}

              {/* Paginación */}
              <div style={{ padding:"12px 20px",borderTop:"1px solid #e9e3f8",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
                <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Mostrando {filtradas.length===0?0:(pagina-1)*porPagina+1}–{Math.min(pagina*porPagina,filtradas.length)} de {filtradas.length}</p>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <button onClick={()=>setPagina(p=>Math.max(1,p-1))} disabled={pagina<=1} style={{ width:28,height:28,borderRadius:8,border:"1px solid #e9e3f8",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:pagina<=1?.4:1 }}><ChevronLeftIcon size={13} style={{ color:"#7c5cc4" }}/></button>
                  {Array.from({length:Math.min(totalPags,6)},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setPagina(p)} style={{ width:28,height:28,borderRadius:8,border:"1px solid #e9e3f8",cursor:"pointer",fontSize:12,fontWeight:600,background:p===pagina?"#7c5cc4":"#fff",color:p===pagina?"#fff":"#9a7080" }}>{p}</button>
                  ))}
                  {totalPags>6&&<span style={{ fontSize:12,color:"#9a7080" }}>...</span>}
                  <button onClick={()=>setPagina(p=>Math.min(totalPags,p+1))} disabled={pagina>=totalPags} style={{ width:28,height:28,borderRadius:8,border:"1px solid #e9e3f8",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:pagina>=totalPags?.4:1 }}><ChevronRightIcon size={13} style={{ color:"#7c5cc4" }}/></button>
                  <select value={porPagina} onChange={e=>{setPorPagina(Number(e.target.value));setPagina(1);}} style={{ ...SEL,marginLeft:8 }}>
                    {[5,10,20].map(n=><option key={n} value={n}>{n} por página</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR DERECHO */}
          {!isMobile&&(
            <div style={{ width:280,flexShrink:0,display:"flex",flexDirection:"column",gap:16 }}>
              <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e9e3f8",padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 16px" }}>Resumen de evaluación</h3>
                <DonaResumen stats={stats} tabActivo={tabActivo}/>
              </div>
              <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e9e3f8",padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 14px" }}>Proceso</h3>
                {[
                  { n:1,label:"Evaluación",   desc:"Revisa y califica a la candidata." },
                  { n:2,label:"Plan y pago",  desc:"Selecciona plan y confirma pago." },
                  { n:3,label:"Activación",   desc:"Inicia activación con Destino Au Pair." },
                  { n:4,label:"Entrevistas",  desc:"Match y proceso de visa." },
                ].map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:10,marginBottom:i<3?12:0 }}>
                    <div style={{ width:24,height:24,borderRadius:"50%",background:"#ede9f8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#7c5cc4",flexShrink:0 }}>{p.n}</div>
                    <div>
                      <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:"0 0 1px" }}>{p.label}</p>
                      <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#f5f0ff",borderRadius:20,padding:20,border:"1px solid #e9e3f8" }}>
                <p style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:"0 0 6px" }}>¿Dudas?</p>
                <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 12px" }}>Escríbenos para apoyo en el proceso.</p>
                <a href="mailto:hola@destino-aupair.com" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"#fff",border:"1.5px solid #e9e3f8",color:"#7c5cc4",fontSize:12,fontWeight:600,padding:"9px",borderRadius:10,textDecoration:"none" }}>Centro de ayuda ↗</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}