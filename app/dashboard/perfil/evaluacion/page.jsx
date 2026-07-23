"use client";
// app/dashboard/perfil/evaluacion/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Save, CheckCircle2,
  User, Wrench, Briefcase, Heart, Baby, FileCheck, Check,
} from "lucide-react";
import FotoUpload from "@/components/dashboard/FotoUpload";
import DocumentoUpload from "@/components/dashboard/DocumentoUpload";
import { useMobile } from "@/context/MobileContext";

const SECCIONES = [
  { id:"personal",    icon:User,      color:"#ec4899", bg:"#fce7f3", titulo:"Información personal",    desc:"Datos básicos de identificación",    campos_req:["cedula","telefono","fecha_nacimiento","ciudad","pais"] },
  { id:"habilidades", icon:Wrench,    color:"#7c3aed", bg:"#ede9fe", titulo:"Requisitos y habilidades", desc:"Inglés, licencia y primeros auxilios", campos_req:["conoce_requisitos_26","conoce_requisitos_18_20","curso_primeros_auxilios","nivel_ingles","licencia_conduccion","habilidad_conduccion"] },
  { id:"situacion",   icon:Briefcase, color:"#d97706", bg:"#fef3c7", titulo:"Situación actual",          desc:"Qué estás haciendo actualmente",     campos_req:["situacion_actual"] },
  { id:"salud",       icon:Heart,     color:"#ef4444", bg:"#fee2e2", titulo:"Salud",                     desc:"Condiciones médicas relevantes",      campos_req:["enfermedad_medicamentos","enfermedad_grave","depresion_panico","trastorno_alimenticio","autolesiones","abuso_sustancias","detalle_salud_mental","isotretinoina","condiciones_fisicas","alergia_medicamentos","dosis_covid","vacuna_covid"] },
  { id:"experiencia", icon:Baby,      color:"#10b981", bg:"#d1fae5", titulo:"Experiencia con niños",     desc:"Horas y tipo de experiencia",         campos_req:["exp_ninos_externos","horas_exp_ninos"] },
  { id:"visas",       icon:FileCheck, color:"#1d4ed8", bg:"#dbeafe", titulo:"Visas y compromisos",       desc:"Historial migratorio",                campos_req:["visa_negada","visa_cancelada","familiar_residencia_usa","familiar_visa_estudio_usa","overstay_otro_pais","entiende_intercambio_cultural","consciente_riesgo_familiar","participo_programa_ap"] },
];

function seccionCompleta(s, form) {
  return s.campos_req.every(c => form[c] && String(form[c]).trim() !== "");
}

const IC = { width:"100%", border:"1.5px solid #f0dde2", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box", transition:"border-color .15s" };
const LC = { fontSize:11, fontWeight:700, color:"#1e1033", textTransform:"uppercase", letterSpacing:".7px", display:"block", marginBottom:6 };

function Radio({ name, options, value, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
      {options.map(opt => (
        <label key={opt} onClick={()=>onChange(name,opt)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <div style={{ width:20,height:20,borderRadius:"50%",border:`2px solid ${value===opt?"#ec4899":"#f0dde2"}`,background:value===opt?"#ec4899":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .12s" }}>
            {value===opt&&<div style={{ width:8,height:8,borderRadius:"50%",background:"#fff" }}/>}
          </div>
          <span style={{ fontSize:13,color:"#1e1033",lineHeight:1.4 }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

const FORM_INIT = {
  foto_url:"",cedula:"",telefono:"",fecha_nacimiento:"",ciudad:"",pais:"",bio:"",pais_destino:"",
  cedula_frontal_url:"",cedula_posterior_url:"",
  conoce_requisitos_26:"",conoce_requisitos_18_20:"",curso_primeros_auxilios:"",nivel_ingles:"",licencia_conduccion:"",habilidad_conduccion:"",
  situacion_actual:"",detalle_otra_actividad:"",detalle_estudios:"",carrera_graduada:"",detalle_trabajo:"",detalle_sin_ocupacion:"",
  enfermedad_medicamentos:"",detalle_enfermedad_med:"",enfermedad_grave:"",detalle_enfermedad_grave:"",
  depresion_panico:"",trastorno_alimenticio:"",autolesiones:"",abuso_sustancias:"",detalle_salud_mental:"",isotretinoina:"",
  condiciones_fisicas:"",alergia_medicamentos:"",detalle_alergias:"",dosis_covid:"",vacuna_covid:"",
  exp_ninos_externos:"",horas_exp_ninos:"",
  visa_negada:"",detalle_visa_negada:"",visa_cancelada:"",
  familiar_residencia_usa:"",detalle_familiar_residencia:"",familiar_visa_estudio_usa:"",detalle_familiar_visa_estudio:"",
  overstay_otro_pais:"",entiende_intercambio_cultural:"",consciente_riesgo_familiar:"",
  participo_programa_ap:"",finalizo_programa_ap:"",puede_proveer_certificados:"",
};

export default function PerfilEvaluacionPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [paso,         setPaso]         = useState(0);
  const [form,         setForm]         = useState(FORM_INIT);
  const [loading,      setLoading]      = useState(true);
  const [guardando,    setGuardando]    = useState(false);
  const [toast,        setToast]        = useState(null);
  const [user,         setUser]         = useState(null);
  const [errorVal,     setErrorVal]     = useState("");

  useEffect(() => {
    const safe = (p,fb=null) => p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),          {user:null}),
      safe(fetch("/api/dashboard/perfil"), null),
    ]).then(([me,perf]) => {
      if (me?.user&&!me.user.perfil_habilitado) { router.push("/dashboard"); return; }
      setUser(me?.user||null);
      if (perf?.perfil) {
        const p=perf.perfil;
        setForm(prev => {
          const u={...prev};
          Object.keys(prev).forEach(k=>{ if(p[k]!=null) u[k]=String(p[k]); });
          if (p.fecha_nacimiento) u.fecha_nacimiento=p.fecha_nacimiento.split("T")[0];
          return u;
        });
      }
      setLoading(false);
    });
  }, []);

  const set = (name, value) => setForm(prev=>({...prev,[name]:value}));
  const hi  = e => set(e.target.name, e.target.value);

  // Sube un documento (cédula frontal/posterior) de inmediato, igual que la foto
  const subirDocumento = async (campo, base64) => {
    set(campo, base64);
    await fetch("/api/dashboard/documento", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ campo, valor: base64 }),
    }).catch(()=>{});
  };

  const guardar = async (goNext=false) => {
    setErrorVal("");
    if (goNext) {
      const vacios = seccion.campos_req.filter(c=>!form[c]||String(form[c]).trim()==="");
      if (vacios.length>0) {
        setErrorVal(`Completa todos los campos obligatorios. Faltan ${vacios.length} campo(s).`);
        window.scrollTo({top:0,behavior:"smooth"});
        return;
      }
    }
    setGuardando(true);
    const res = await fetch("/api/dashboard/perfil", {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res.ok) {
      setToast("✓ Guardado correctamente");
      setTimeout(()=>setToast(null),2500);
      if (goNext&&paso<SECCIONES.length-1) setPaso(paso+1);
      if (goNext&&paso===SECCIONES.length-1) router.push("/dashboard/perfil");
    } else setToast("Error al guardar");
    setGuardando(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #e8849a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const seccion     = SECCIONES[paso];
  const Icon        = seccion.icon;
  const completadas = SECCIONES.filter(s=>seccionCompleta(s,form)).length;
  const pctGlobal   = Math.round((completadas/SECCIONES.length)*100);
  const estaCompleta = seccionCompleta(seccion,form);
  const G2 = { display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14 };

  return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input:focus,textarea:focus,select:focus{border-color:#ec4899!important;box-shadow:0 0 0 3px rgba(236,72,153,.1);}`}</style>

      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:2000,background:"#1e1033",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600 }}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #ece8f0",padding:isMobile?"12px 16px":"14px 28px",position:"sticky",top:0,zIndex:20 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
            <Link href="/dashboard/perfil" style={{ display:"flex",alignItems:"center",gap:5,color:"#9a7080",textDecoration:"none",fontSize:12,border:"1px solid #ece4f0",padding:"6px 10px",borderRadius:10,flexShrink:0 }}>
              <ChevronLeft size={13}/> {isMobile?"Volver":"Volver a mi perfil"}
            </Link>
            {!isMobile && (
              <div>
                <h1 style={{ fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:"#1e1033",margin:0 }}>Evaluación de perfil</h1>
                <p style={{ fontSize:12,color:"#9a7080",margin:0 }}>{completadas} de {SECCIONES.length} secciones completadas</p>
              </div>
            )}
          </div>
          {/* Barra progreso */}
          <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,maxWidth:280 }}>
            <div style={{ flex:1,height:7,background:"#f0e8f0",borderRadius:99,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${pctGlobal}%`,background:"linear-gradient(90deg,#ec4899,#be185d)",borderRadius:99,transition:"width .5s" }}/>
            </div>
            <span style={{ fontSize:12,fontWeight:700,color:"#ec4899",flexShrink:0 }}>{pctGlobal}%</span>
          </div>
        </div>

        {/* Tabs mobile */}
        {isMobile && (
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingTop:10,paddingBottom:2,scrollbarWidth:"none" }}>
            {SECCIONES.map((s,i) => {
              const completa=seccionCompleta(s,form), active=i===paso;
              return (
                <button key={s.id} onClick={()=>setPaso(i)}
                  style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:99,border:"none",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",fontSize:11,fontWeight:active?700:500,transition:"all .12s",
                    background:active?s.color:completa?s.bg:"#f3f4f6",
                    color:active?"#fff":completa?s.color:"#6b7280",
                  }}>
                  {completa&&!active?<Check size={11}/>:<span>{i+1}</span>}
                  {s.titulo.split(" ")[0]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ maxWidth:1100,margin:"0 auto",padding:isMobile?"16px 16px 60px":"24px 24px 48px",display:"flex",gap:20 }}>

        {/* SIDEBAR — solo desktop */}
        {!isMobile && (
          <div style={{ width:220,flexShrink:0,display:"flex",flexDirection:"column",gap:4 }}>
            <p style={{ fontSize:10,fontWeight:700,color:"#9a7080",textTransform:"uppercase",letterSpacing:".8px",margin:"0 0 10px" }}>Secciones</p>
            {SECCIONES.map((s,i) => {
              const SIcon=s.icon, active=i===paso, completa=seccionCompleta(s,form);
              return (
                <button key={s.id} onClick={()=>setPaso(i)}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:14,border:"none",cursor:"pointer",textAlign:"left",transition:"all .12s",fontFamily:"inherit",background:active?s.bg:"transparent",boxShadow:active?`0 0 0 1.5px ${s.color}`:"none" }}>
                  <div style={{ width:28,height:28,borderRadius:8,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:completa?s.bg:active?s.bg:"#f3f4f6" }}>
                    {completa?<Check size={14} style={{ color:s.color }}/>:<SIcon size={14} style={{ color:active?s.color:"#9ca3af" }}/>}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:11.5,fontWeight:active?700:500,color:active?s.color:"#555",margin:0,lineHeight:1.3 }}>{s.titulo}</p>
                    {completa&&<p style={{ fontSize:10,color:s.color,margin:0 }}>✓ Completa</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* FORMULARIO */}
        <div style={{ flex:1,minWidth:0 }}>
          {/* Cabecera sección */}
          <div style={{ background:`linear-gradient(135deg,${seccion.color}15,${seccion.bg})`,borderRadius:18,border:`1px solid ${seccion.color}30`,padding:isMobile?"14px 16px":"20px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:44,height:44,borderRadius:14,background:seccion.bg,border:`2px solid ${seccion.color}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <Icon size={20} style={{ color:seccion.color }}/>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:10,fontWeight:700,color:seccion.color,textTransform:"uppercase",letterSpacing:".7px",margin:"0 0 2px" }}>Sección {paso+1} de {SECCIONES.length}</p>
              <h2 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?15:18,fontWeight:700,color:"#1e1033",margin:"0 0 2px" }}>{seccion.titulo}</h2>
              {!isMobile&&<p style={{ fontSize:12,color:"#9a7080",margin:0 }}>{seccion.desc}</p>}
            </div>
            {estaCompleta && (
              <div style={{ display:"flex",alignItems:"center",gap:5,background:"#d1fae5",color:"#10b981",fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:99,flexShrink:0 }}>
                <CheckCircle2 size={12}/> Completa
              </div>
            )}
          </div>

          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"16px":"24px",display:"flex",flexDirection:"column",gap:18 }}>

            {errorVal && (
              <div style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#dc2626",fontWeight:500 }}>
                <span>⚠️</span>{errorVal}
              </div>
            )}

            {/* ── Sección 0: Personal ── */}
            {paso===0 && (<>
              <FotoUpload value={form.foto_url} onChange={async(base64)=>{ set("foto_url",base64); await fetch("/api/dashboard/foto",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({foto_url:base64})}); }}/>

              <div style={G2}>
                <div><label style={LC}>Cédula *</label><input name="cedula" type="text" placeholder="1234567890" value={form.cedula} onChange={hi} style={IC}/></div>
                <div><label style={LC}>Teléfono *</label><input name="telefono" type="text" placeholder="+57 300 000 0000" value={form.telefono} onChange={hi} style={IC}/></div>
              </div>

              {/* Documento de identidad — frontal y posterior */}
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#2d1a22", margin:"0 0 4px" }}>Foto de tu cédula</p>
                <p style={{ fontSize:11, color:"#9a7080", margin:"0 0 12px", lineHeight:1.5 }}>
                  Sube una foto clara de ambos lados de tu documento de identidad.
                </p>
                <div style={G2}>
                  <DocumentoUpload
                    value={form.cedula_frontal_url}
                    onChange={(base64)=>subirDocumento("cedula_frontal_url", base64)}
                    label="Cédula — Lado frontal"
                  />
                  <DocumentoUpload
                    value={form.cedula_posterior_url}
                    onChange={(base64)=>subirDocumento("cedula_posterior_url", base64)}
                    label="Cédula — Lado posterior"
                  />
                </div>
              </div>

              <div><label style={LC}>Fecha de nacimiento *</label><input name="fecha_nacimiento" type="date" value={(form.fecha_nacimiento||"").slice(0,10)} onChange={hi} style={IC}/></div>
              <div style={G2}>
                <div><label style={LC}>Ciudad *</label><input name="ciudad" type="text" placeholder="Bogotá" value={form.ciudad} onChange={hi} style={IC}/></div>
                <div><label style={LC}>País *</label><input name="pais" type="text" placeholder="Colombia" value={form.pais} onChange={hi} style={IC}/></div>
              </div>
              <div><label style={LC}>Descripción personal</label><textarea name="bio" rows={3} placeholder="Cuéntanos quién eres..." value={form.bio} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>
              <div><label style={LC}>País de destino deseado</label><input name="pais_destino" type="text" placeholder="Estados Unidos" value={form.pais_destino} onChange={hi} style={IC}/></div>
            </>)}

            {/* ── Sección 1: Habilidades ── */}
            {paso===1 && (<>
              {[
                {name:"conoce_requisitos_26",   label:"¿Sabes que si tienes 26 años debes cumplir requisitos de inglés, licencia y horas? *",        opts:["Si","No"]},
                {name:"conoce_requisitos_18_20",label:"¿Sabes que entre 18-20 años necesitas primeros auxilios, natación y 1500 horas mínimo? *",     opts:["Si","No"]},
                {name:"curso_primeros_auxilios",label:"¿Has hecho curso de primeros auxilios? *",                                                      opts:["Si","No","Lo estoy haciendo"]},
                {name:"nivel_ingles",           label:"¿Cuál es tu nivel de inglés conversacional? *",                                                opts:["Ninguno","Básico","Intermedio","Avanzado"]},
                {name:"licencia_conduccion",    label:"¿Tienes licencia de conducción? *",                                                            opts:["Si","No","Está en proceso","No, pero tengo habilidades y la puedo obtener en menos de un mes"]},
                {name:"habilidad_conduccion",   label:"¿Cómo calificarías tus habilidades para conducir? *",                                          opts:["Nulas","Puedo conducir pero no lo hago bien.","Conduzco bien pero me falta práctica.","Me siento muy cómoda y segura."]},
              ].map(q=><div key={q.name}><label style={LC}>{q.label}</label><Radio name={q.name} options={q.opts} value={form[q.name]} onChange={set}/></div>)}
            </>)}

            {/* ── Sección 2: Situación ── */}
            {paso===2 && (<>
              <div><label style={LC}>¿Qué haces en este momento? *</label><Radio name="situacion_actual" options={["Estudio","Trabajo","No hago nada","Desempeño otra actividad"]} value={form.situacion_actual} onChange={set}/></div>
              {form.situacion_actual==="Desempeño otra actividad"&&<div><label style={LC}>Explica con detalles</label><textarea name="detalle_otra_actividad" rows={3} value={form.detalle_otra_actividad} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>}
              {form.situacion_actual==="Estudio"&&<div><label style={LC}>¿Qué estudias, semestre y duración?</label><textarea name="detalle_estudios" rows={3} value={form.detalle_estudios} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>}
              {form.situacion_actual==="Trabajo"&&<div><label style={LC}>¿Formal o informal? ¿Desde cuándo?</label><textarea name="detalle_trabajo" rows={3} value={form.detalle_trabajo} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>}
              {form.situacion_actual==="No hago nada"&&<div><label style={LC}>¿Desde cuándo?</label><textarea name="detalle_sin_ocupacion" rows={2} value={form.detalle_sin_ocupacion} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>}
              <div><label style={LC}>Si ya te graduaste, ¿qué estudiaste?</label><input name="carrera_graduada" type="text" placeholder="Ej: Administración de Empresas" value={form.carrera_graduada} onChange={hi} style={IC}/></div>
            </>)}

            {/* ── Sección 3: Salud ── */}
            {paso===3 && (<>
              {[
                {name:"enfermedad_medicamentos",label:"¿Tienes enfermedad que requiera medicamentos constantes? *",opts:["Si","No"],dk:"detalle_enfermedad_med",dl:"Por favor explica"},
                {name:"enfermedad_grave",       label:"¿Tienes o has tenido alguna enfermedad grave? *",          opts:["Si","No"],dk:"detalle_enfermedad_grave",dl:"Explica con detalle"},
                {name:"depresion_panico",       label:"¿Has sufrido depresión o ataques de pánico diagnosticados? *",opts:["Si","No"]},
                {name:"trastorno_alimenticio",  label:"¿Has sufrido trastorno alimenticio? *",                   opts:["Si","No"]},
                {name:"autolesiones",           label:"¿Te has autolesionado? *",                                opts:["Si","No"]},
                {name:"abuso_sustancias",       label:"¿Has abusado de sustancias tóxicas? *",                  opts:["Si","No"]},
                {name:"isotretinoina",          label:"¿Sigues tratamiento con Isotretinoina últimos 3 meses? *",opts:["Si","No"]},
                {name:"condiciones_fisicas",    label:"¿Sufres condiciones físicas que impidan cuidar niños? *", opts:["Si","No"]},
                {name:"alergia_medicamentos",   label:"¿Eres alérgica a algún medicamento? *",                  opts:["Si","No"],dk:"detalle_alergias",dl:"¿A cuáles?"},
              ].map(q=>(
                <div key={q.name}>
                  <label style={LC}>{q.label}</label>
                  <Radio name={q.name} options={q.opts} value={form[q.name]} onChange={set}/>
                  {q.dk&&form[q.name]==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>{q.dl}</label><textarea name={q.dk} rows={3} value={form[q.dk]} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>}
                </div>
              ))}
              <div><label style={LC}>Si has tenido alteración mental, ¿cuándo fue y cómo la controlaste? *</label><textarea name="detalle_salud_mental" rows={3} placeholder="Si no aplica, escribe 'No aplica'" value={form.detalle_salud_mental} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>
              <div><label style={LC}>¿Cuántas dosis de vacuna covid? *</label><Radio name="dosis_covid" options={["Ninguna","Una","Dos","Más de dos"]} value={form.dosis_covid} onChange={set}/></div>
              <div><label style={LC}>¿Qué vacuna te aplicaron? *</label><input name="vacuna_covid" type="text" placeholder="Ej: Pfizer, Moderna..." value={form.vacuna_covid} onChange={hi} style={IC}/></div>
            </>)}

            {/* ── Sección 4: Experiencia ── */}
            {paso===4 && (<>
              <div><label style={LC}>¿Tienes experiencia con niños que no sean de tu familia? *</label><Radio name="exp_ninos_externos" options={["Si","No","La estoy haciendo"]} value={form.exp_ninos_externos} onChange={set}/></div>
              <div><label style={LC}>¿Cuántas horas de experiencia tienes? *</label><Radio name="horas_exp_ninos" options={["Menos de 500 horas","Entre 501 y 800 horas","Entre 801 y 1500 horas","Más de 1500"]} value={form.horas_exp_ninos} onChange={set}/></div>
            </>)}

            {/* ── Sección 5: Visas ── */}
            {paso===5 && (<>
              <div>
                <label style={LC}>¿Te han negado alguna visa? *</label>
                <Radio name="visa_negada" options={["Si","No"]} value={form.visa_negada} onChange={set}/>
                {form.visa_negada==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>Detalla cuándo, razón y país</label><textarea name="detalle_visa_negada" rows={3} value={form.detalle_visa_negada} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>}
              </div>
              <div><label style={LC}>¿Te han cancelado alguna visa? *</label><textarea name="visa_cancelada" rows={2} placeholder="Si no aplica, escribe 'No'" value={form.visa_cancelada} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>
              <div>
                <label style={LC}>¿Familiar en USA solicitando residencia o green card? *</label>
                <Radio name="familiar_residencia_usa" options={["Si","No"]} value={form.familiar_residencia_usa} onChange={set}/>
                {form.familiar_residencia_usa==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>¿Quién y qué solicita?</label><textarea name="detalle_familiar_residencia" rows={3} value={form.detalle_familiar_residencia} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>}
              </div>
              <div>
                <label style={LC}>¿Familiar en USA con visa de estudio o en situación ilegal? *</label>
                <Radio name="familiar_visa_estudio_usa" options={["Si","No"]} value={form.familiar_visa_estudio_usa} onChange={set}/>
                {form.familiar_visa_estudio_usa==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>¿Quién y cuál es su situación?</label><textarea name="detalle_familiar_visa_estudio" rows={3} value={form.detalle_familiar_visa_estudio} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>}
              </div>
              <div><label style={LC}>¿Has permanecido en otro país más tiempo del autorizado? *</label><textarea name="overstay_otro_pais" rows={2} placeholder="Si no aplica, escribe 'No'" value={form.overstay_otro_pais} onChange={hi} style={{ ...IC,resize:"vertical" }}/></div>
              <div><label style={LC}>¿Entiendes que el programa es solo intercambio cultural y debes regresar? *</label><Radio name="entiende_intercambio_cultural" options={["SI","No"]} value={form.entiende_intercambio_cultural} onChange={set}/></div>
              <div><label style={LC}>¿Consciente de que si un familiar pide asilo el programa se cancela sin devolución? *</label><Radio name="consciente_riesgo_familiar" options={["SI","No"]} value={form.consciente_riesgo_familiar} onChange={set}/></div>
              <div>
                <label style={LC}>¿Has participado antes en Au Pair USA? *</label>
                <Radio name="participo_programa_ap" options={["Si","No"]} value={form.participo_programa_ap} onChange={set}/>
                {form.participo_programa_ap==="Si"&&(
                  <div style={{ display:"flex",flexDirection:"column",gap:14,marginTop:14 }}>
                    <div><label style={LC}>¿Finalizaste exitosamente?</label><Radio name="finalizo_programa_ap" options={["Si","No","No aplica"]} value={form.finalizo_programa_ap} onChange={set}/></div>
                    <div><label style={LC}>¿Puedes proveer certificados?</label><Radio name="puede_proveer_certificados" options={["Si","No"]} value={form.puede_proveer_certificados} onChange={set}/></div>
                  </div>
                )}
              </div>
            </>)}
          </div>

          {/* NAVEGACIÓN */}
          <div style={{ display:"flex",gap:10,marginTop:14,justifyContent:"space-between",alignItems:"center" }}>
            <button onClick={()=>setPaso(Math.max(0,paso-1))} disabled={paso===0}
              style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 14px":"10px 18px",borderRadius:12,border:"1.5px solid #ece4f0",background:"#fff",color:"#9a7080",fontSize:13,fontWeight:600,cursor:paso===0?"not-allowed":"pointer",opacity:paso===0?.4:1,fontFamily:"inherit" }}>
              <ChevronLeft size={14}/> {isMobile?"":"Anterior"}
            </button>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>guardar(false)} disabled={guardando}
                style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 12px":"10px 18px",borderRadius:12,border:"1.5px solid #ece4f0",background:"#fff",color:"#9a7080",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                <Save size={13}/> {isMobile?"":"Guardar"}
              </button>
              <button onClick={()=>guardar(true)} disabled={guardando}
                style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 14px":"10px 22px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${seccion.color},${seccion.color}cc)`,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 12px ${seccion.color}40` }}>
                {guardando
                  ? <><div style={{ width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>...</>
                  : paso<SECCIONES.length-1
                  ? <>{isMobile?"Continuar":"Guardar y continuar"} <ChevronRight size={14}/></>
                  : "Finalizar ✓"}
              </button>
            </div>
          </div>

          {/* Dots */}
          <div style={{ display:"flex",justifyContent:"center",gap:7,marginTop:14 }}>
            {SECCIONES.map((s,i) => {
              const completa=seccionCompleta(s,form);
              return (
                <button key={i} onClick={()=>setPaso(i)}
                  style={{ width:i===paso?26:9,height:9,borderRadius:99,border:"none",cursor:"pointer",transition:"all .2s",background:completa?s.color:i===paso?"#ec4899":"#e5e7eb" }}/>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}