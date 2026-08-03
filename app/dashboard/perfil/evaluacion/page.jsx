"use client";
// app/dashboard/perfil/evaluacion/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Save, CheckCircle2, User, Wrench, Briefcase, Heart, Baby, FileCheck, Check, AlertTriangle,
} from "lucide-react";
import FotoUpload from "@/components/dashboard/FotoUpload";
import DocumentoUpload from "@/components/dashboard/DocumentoUpload";
import { useMobile } from "@/context/MobileContext";
import { PARTE1, validarSeccion, seccionCompleta as seccionCompletaDe, seccionInicial } from "@/lib/campos-perfil";

// La presentación vive acá; QUÉ es obligatorio vive en lib/campos-perfil.js,
// que comparten el formulario, el servidor y el cálculo de progreso.
const PRESENTACION = [
  { icon:User,      color:"#A0435F", bg:"#FCE8EE", desc:"Datos básicos de identificación" },
  { icon:Wrench,    color:"#A0435F", bg:"#FCE8EE", desc:"Inglés, licencia y primeros auxilios" },
  { icon:Briefcase, color:"#E8853B", bg:"#FFF4EC", desc:"Qué estás haciendo actualmente" },
  { icon:Heart,     color:"#C0392B", bg:"#FDECEC", desc:"Condiciones médicas relevantes" },
  { icon:Baby,      color:"#12A46B", bg:"#E6F9F0", desc:"Horas y tipo de experiencia" },
  { icon:FileCheck, color:"#1d4ed8", bg:"#dbeafe", desc:"Historial migratorio" },
];
const SECCIONES = PARTE1.map((s,i) => ({ ...s, ...PRESENTACION[i] }));

const seccionCompleta = (s, form) => seccionCompletaDe(s, form);

const IC = { width:"100%", border:"1.5px solid #F5E1E7", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#4A2A38", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box", transition:"border-color .15s" };
// El borde rojo se pierde al enfocar el campo (la regla :focus de la página
// usa !important sobre border-color), así que el error se marca además con
// un outline inline, que sí sobrevive al foco.
const IC_ERR = { ...IC, border:"1.5px solid #C0392B", background:"#FDECEC", outline:"2px solid #C0392B", outlineOffset:"1px" };
const LC = { fontSize:11, fontWeight:700, color:"#4A2A38", textTransform:"uppercase", letterSpacing:".7px", display:"block", marginBottom:6 };

function Radio({ name, options, value, onChange, error }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4,
      ...(error ? { border:"1.5px solid #C0392B", background:"#FDECEC", borderRadius:12, padding:"10px 12px" } : {}) }}>
      {options.map(opt => (
        <label key={opt} onClick={()=>onChange(name,opt)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <div style={{ width:20,height:20,borderRadius:"50%",border:`2px solid ${value===opt?"#A0435F":error?"#C0392B":"#F5E1E7"}`,background:value===opt?"#A0435F":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .12s" }}>
            {value===opt&&<div style={{ width:8,height:8,borderRadius:"50%",background:"#fff" }}/>}
          </div>
          <span style={{ fontSize:13,color:"#4A2A38",lineHeight:1.4 }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

/** Mensaje bajo un campo obligatorio sin diligenciar. */
function Msg({ visible }) {
  if (!visible) return null;
  return (
    <p style={{ fontSize:11.5, color:"#C0392B", fontWeight:600, margin:"5px 0 0" }}>
      Este campo es obligatorio.
    </p>
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
  // Campos obligatorios marcados en rojo tras una validación fallida.
  const [faltantes,    setFaltantes]    = useState([]);

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
        // ?seccion=<id> — la pantalla de perfil enlaza directo a una sección.
        // Se honra sólo si las anteriores están completas; si no, se abre en
        // la primera que falte. Ver seccionInicial() en campos-perfil.js.
        const pedida = new URLSearchParams(window.location.search).get("seccion");
        if (pedida) setPaso(seccionInicial(SECCIONES, p, pedida));
      }
      setLoading(false);
    });
  }, []);

  const set = (name, value) => {
    setForm(prev=>({...prev,[name]:value}));
    // La marca de error desaparece en cuanto la candidata diligencia el campo.
    if (String(value ?? "").trim() !== "") setFaltantes(f => f.filter(c => c.name !== name));
  };
  const hi  = e => set(e.target.name, e.target.value);

  // ── Validación ────────────────────────────────────────────────────────────
  const enError = (name) => faltantes.some(c => c.name === name);
  const ic = (name) => (enError(name) ? IC_ERR : IC);

  /**
   * Marca los campos con problema, arma el resumen y lleva el foco al primero.
   * La lista mezcla dos cosas: campos vacíos y campos llenos con un valor que
   * su regla rechaza (los segundos traen `error` con el motivo).
   */
  const señalarFaltantes = (lista) => {
    setFaltantes(lista);
    const malos = lista.filter(c => c.error);
    setErrorVal(
      malos.length === 1 && lista.length === 1
        ? malos[0].error
        : lista.length === 1
          ? `Falta diligenciar: ${lista[0].label}.`
          : `Revisa ${lista.length} campos: ${lista.map(c=>c.label).join(", ")}.`
    );
    // Foco en el primer campo con error.
    setTimeout(() => {
      const el = document.querySelector(`[name="${lista[0].name}"]`);
      if (el?.scrollIntoView) el.scrollIntoView({ behavior:"smooth", block:"center" });
      if (el?.focus) el.focus({ preventScroll:true });
      else window.scrollTo({ top:0, behavior:"smooth" });
    }, 60);
  };

  /** Navegar a otra sección: sólo si la actual está completa. */
  const irASeccion = (i) => {
    if (i === paso) return;
    // Retroceder siempre se permite: nunca dejar a la candidata encerrada.
    if (i < paso) { setErrorVal(""); setFaltantes([]); setPaso(i); return; }
    const { ok, faltantes:pendientes, invalidos } = validarSeccion(SECCIONES[paso], form);
    if (!ok) { señalarFaltantes([...pendientes, ...invalidos]); return; }
    setErrorVal(""); setFaltantes([]); setPaso(i);
  };

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
    const { ok, faltantes:pendientes, invalidos } = validarSeccion(SECCIONES[paso], form);

    // Avanzar exige la sección completa. Guardar sin avanzar siempre se
    // permite: la candidata debe poder dejar el formulario a medias.
    if (goNext && !ok) { señalarFaltantes([...pendientes, ...invalidos]); return; }

    setGuardando(true);
    const res = await fetch("/api/dashboard/perfil", {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res.ok) {
      if (goNext) {
        setFaltantes([]);
        setToast("Guardado correctamente");
        if (paso<SECCIONES.length-1) setPaso(paso+1);
        else router.push("/dashboard/perfil");
      } else if (!ok) {
        // Guardado parcial: se guardó, pero le decimos qué le falta.
        setToast("Guardado — aún te faltan campos");
        señalarFaltantes(pendientes);
      } else {
        setFaltantes([]);
        setToast("Guardado correctamente");
      }
      setTimeout(()=>setToast(null),2500);
    } else setToast("Error al guardar");
    setGuardando(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#FBF4F6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #C77D93",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
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
    <div style={{ minHeight:"100vh",background:"#FBF4F6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input:focus,textarea:focus,select:focus{border-color:#A0435F!important;box-shadow:0 0 0 3px rgba(160,67,95,.1);}`}</style>

      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:2000,background:"#4A2A38",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600 }}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #F5E1E7",padding:isMobile?"12px 16px":"14px 28px",position:"sticky",top:0,zIndex:20 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
            <Link href="/dashboard/perfil" style={{ display:"flex",alignItems:"center",gap:5,color:"#9C8790",textDecoration:"none",fontSize:12,border:"1px solid #F5E1E7",padding:"6px 10px",borderRadius:10,flexShrink:0 }}>
              <ChevronLeft size={13}/> {isMobile?"Volver":"Volver a mi perfil"}
            </Link>
            {!isMobile && (
              <div>
                <h1 style={{ fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:"#4A2A38",margin:0 }}>Evaluación de perfil</h1>
                <p style={{ fontSize:12,color:"#9C8790",margin:0 }}>{completadas} de {SECCIONES.length} secciones completadas</p>
              </div>
            )}
          </div>
          {/* Barra progreso */}
          <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,maxWidth:280 }}>
            <div style={{ flex:1,height:7,background:"#f0e8f0",borderRadius:99,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${pctGlobal}%`,background:"linear-gradient(90deg,#A0435F,#7D2F47)",borderRadius:99,transition:"width .5s" }}/>
            </div>
            <span style={{ fontSize:12,fontWeight:700,color:"#A0435F",flexShrink:0 }}>{pctGlobal}%</span>
          </div>
        </div>

        {/* Tabs mobile */}
        {isMobile && (
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingTop:10,paddingBottom:2,scrollbarWidth:"none" }}>
            {SECCIONES.map((s,i) => {
              const completa=seccionCompleta(s,form), active=i===paso;
              return (
                <button key={s.id} onClick={()=>irASeccion(i)}
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
            <p style={{ fontSize:10,fontWeight:700,color:"#9C8790",textTransform:"uppercase",letterSpacing:".8px",margin:"0 0 10px" }}>Secciones</p>
            {SECCIONES.map((s,i) => {
              const SIcon=s.icon, active=i===paso, completa=seccionCompleta(s,form);
              return (
                <button key={s.id} onClick={()=>irASeccion(i)}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:14,border:"none",cursor:"pointer",textAlign:"left",transition:"all .12s",fontFamily:"inherit",background:active?s.bg:"transparent",boxShadow:active?`0 0 0 1.5px ${s.color}`:"none" }}>
                  <div style={{ width:28,height:28,borderRadius:8,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:completa?s.bg:active?s.bg:"#f3f4f6" }}>
                    {completa?<Check size={14} style={{ color:s.color }}/>:<SIcon size={14} style={{ color:active?s.color:"#C9A9B4" }}/>}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:11.5,fontWeight:active?700:500,color:active?s.color:"#555",margin:0,lineHeight:1.3 }}>{s.titulo}</p>
                    {completa&&<p style={{ fontSize:10,color:s.color,margin:0 }}>Completa</p>}
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
              <h2 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?15:18,fontWeight:700,color:"#4A2A38",margin:"0 0 2px" }}>{seccion.titulo}</h2>
              {!isMobile&&<p style={{ fontSize:12,color:"#9C8790",margin:0 }}>{seccion.desc}</p>}
            </div>
            {estaCompleta && (
              <div style={{ display:"flex",alignItems:"center",gap:5,background:"#E6F9F0",color:"#12A46B",fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:99,flexShrink:0 }}>
                <CheckCircle2 size={12}/> Completa
              </div>
            )}
          </div>

          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #F5E1E7",padding:isMobile?"16px":"24px",display:"flex",flexDirection:"column",gap:18 }}>

            {errorVal && (
              <div style={{ background:"#FDECEC",border:"1px solid #FDECEC",borderRadius:12,padding:"12px 16px",fontSize:13,color:"#C0392B" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,fontWeight:700 }}>
                  <AlertTriangle size={14}/>
                  {faltantes.some(c=>c.error)
                    ? (faltantes.length===1 ? "Revisa este campo" : `Revisa ${faltantes.length} campos`)
                    : faltantes.length===1
                      ? "Falta 1 campo obligatorio por diligenciar"
                      : `Faltan ${faltantes.length} campos obligatorios por diligenciar`}
                </div>
                {faltantes.length>0 && (
                  <ul style={{ margin:"8px 0 0",paddingLeft:26,fontWeight:500,lineHeight:1.7 }}>
                    {faltantes.map(c => (
                      <li key={c.name}>
                        {c.error && <span style={{ display:"block",fontWeight:600 }}>{c.error}</span>}
                        <button onClick={()=>{
                          const el=document.querySelector(`[name="${c.name}"]`);
                          el?.scrollIntoView?.({ behavior:"smooth",block:"center" });
                          el?.focus?.({ preventScroll:true });
                        }} style={{ background:"none",border:"none",padding:0,color:"#C0392B",fontSize:13,fontFamily:"inherit",textDecoration:"underline",cursor:"pointer" }}>
                          {c.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── Sección 0: Personal ── */}
            {paso===0 && (<>
              <FotoUpload value={form.foto_url} onChange={async(base64)=>{ set("foto_url",base64); await fetch("/api/dashboard/foto",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({foto_url:base64})}); }}/>

              <div style={G2}>
                <div><label style={LC}>Cédula *</label><input name="cedula" type="text" placeholder="1234567890" value={form.cedula} onChange={hi} style={ic("cedula")}/><Msg visible={enError("cedula")}/></div>
                <div><label style={LC}>Teléfono *</label><input name="telefono" type="text" placeholder="+57 300 000 0000" value={form.telefono} onChange={hi} style={ic("telefono")}/><Msg visible={enError("telefono")}/></div>
              </div>

              {/* Documento de identidad — frontal y posterior */}
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#3A2530", margin:"0 0 4px" }}>Foto de tu cédula</p>
                <p style={{ fontSize:11, color:"#9C8790", margin:"0 0 12px", lineHeight:1.5 }}>
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

              <div><label style={LC}>Fecha de nacimiento *</label><input name="fecha_nacimiento" type="date" value={(form.fecha_nacimiento||"").slice(0,10)} onChange={hi} style={ic("fecha_nacimiento")}/><Msg visible={enError("fecha_nacimiento")}/></div>
              <div style={G2}>
                <div><label style={LC}>Ciudad *</label><input name="ciudad" type="text" placeholder="Bogotá" value={form.ciudad} onChange={hi} style={ic("ciudad")}/><Msg visible={enError("ciudad")}/></div>
                <div><label style={LC}>País *</label><input name="pais" type="text" placeholder="Colombia" value={form.pais} onChange={hi} style={ic("pais")}/><Msg visible={enError("pais")}/></div>
              </div>
              <div><label style={LC}>Descripción personal</label><textarea name="bio" rows={3} placeholder="Cuéntanos quién eres..." value={form.bio} onChange={hi} style={{ ...ic("bio"),resize:"vertical" }}/><Msg visible={enError("bio")}/></div>
              <div><label style={LC}>País de destino deseado</label><input name="pais_destino" type="text" placeholder="Estados Unidos" value={form.pais_destino} onChange={hi} style={ic("pais_destino")}/><Msg visible={enError("pais_destino")}/></div>
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
              ].map(q=><div key={q.name}><label style={LC}>{q.label}</label><Radio name={q.name} options={q.opts} value={form[q.name]} onChange={set} error={enError(q.name)}/><Msg visible={enError(q.name)}/></div>)}
            </>)}

            {/* ── Sección 2: Situación ── */}
            {paso===2 && (<>
              <div><label style={LC}>¿Qué haces en este momento? *</label><Radio name="situacion_actual" options={["Estudio","Trabajo","No hago nada","Desempeño otra actividad"]} value={form.situacion_actual} onChange={set} error={enError("situacion_actual")}/><Msg visible={enError("situacion_actual")}/></div>
              {form.situacion_actual==="Desempeño otra actividad"&&<div><label style={LC}>Explica con detalles *</label><textarea name="detalle_otra_actividad" rows={3} value={form.detalle_otra_actividad} onChange={hi} style={{ ...ic("detalle_otra_actividad"),resize:"vertical" }}/><Msg visible={enError("detalle_otra_actividad")}/></div>}
              {form.situacion_actual==="Estudio"&&<div><label style={LC}>¿Qué estudias, semestre y duración? *</label><textarea name="detalle_estudios" rows={3} value={form.detalle_estudios} onChange={hi} style={{ ...ic("detalle_estudios"),resize:"vertical" }}/><Msg visible={enError("detalle_estudios")}/></div>}
              {form.situacion_actual==="Trabajo"&&<div><label style={LC}>¿Formal o informal? ¿Desde cuándo? *</label><textarea name="detalle_trabajo" rows={3} value={form.detalle_trabajo} onChange={hi} style={{ ...ic("detalle_trabajo"),resize:"vertical" }}/><Msg visible={enError("detalle_trabajo")}/></div>}
              {form.situacion_actual==="No hago nada"&&<div><label style={LC}>¿Desde cuándo? *</label><textarea name="detalle_sin_ocupacion" rows={2} value={form.detalle_sin_ocupacion} onChange={hi} style={{ ...ic("detalle_sin_ocupacion"),resize:"vertical" }}/><Msg visible={enError("detalle_sin_ocupacion")}/></div>}
              <div><label style={LC}>Si ya te graduaste, ¿qué estudiaste?</label><input name="carrera_graduada" type="text" placeholder="Ej: Administración de Empresas" value={form.carrera_graduada} onChange={hi} style={ic("carrera_graduada")}/><Msg visible={enError("carrera_graduada")}/></div>
            </>)}

            {/* ── Sección 3: Salud ── */}
            {paso===3 && (<>
              {[
                {name:"enfermedad_medicamentos",label:"¿Tienes enfermedad que requiera medicamentos constantes? *",opts:["Si","No"],dk:"detalle_enfermedad_med",dl:"Por favor explica *"},
                {name:"enfermedad_grave",       label:"¿Tienes o has tenido alguna enfermedad grave? *",          opts:["Si","No"],dk:"detalle_enfermedad_grave",dl:"Explica con detalle *"},
                {name:"depresion_panico",       label:"¿Has sufrido depresión o ataques de pánico diagnosticados? *",opts:["Si","No"]},
                {name:"trastorno_alimenticio",  label:"¿Has sufrido trastorno alimenticio? *",                   opts:["Si","No"]},
                {name:"autolesiones",           label:"¿Te has autolesionado? *",                                opts:["Si","No"]},
                {name:"abuso_sustancias",       label:"¿Has abusado de sustancias tóxicas? *",                  opts:["Si","No"]},
                {name:"isotretinoina",          label:"¿Sigues tratamiento con Isotretinoina últimos 3 meses? *",opts:["Si","No"]},
                {name:"condiciones_fisicas",    label:"¿Sufres condiciones físicas que impidan cuidar niños? *", opts:["Si","No"]},
                {name:"alergia_medicamentos",   label:"¿Eres alérgica a algún medicamento? *",                  opts:["Si","No"],dk:"detalle_alergias",dl:"¿A cuáles? *"},
              ].map(q=>(
                <div key={q.name}>
                  <label style={LC}>{q.label}</label>
                  <Radio name={q.name} options={q.opts} value={form[q.name]} onChange={set} error={enError(q.name)}/><Msg visible={enError(q.name)}/>
                  {q.dk&&form[q.name]==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>{q.dl}</label><textarea name={q.dk} rows={3} value={form[q.dk]} onChange={hi} style={{ ...ic(q.dk),resize:"vertical" }}/><Msg visible={enError(q.dk)}/></div>}
                </div>
              ))}
              <div><label style={LC}>Si has tenido alteración mental, ¿cuándo fue y cómo la controlaste? *</label><textarea name="detalle_salud_mental" rows={3} placeholder="Si no aplica, escribe 'No aplica'" value={form.detalle_salud_mental} onChange={hi} style={{ ...ic("detalle_salud_mental"),resize:"vertical" }}/><Msg visible={enError("detalle_salud_mental")}/></div>
              <div><label style={LC}>¿Cuántas dosis de vacuna covid? *</label><Radio name="dosis_covid" options={["Ninguna","Una","Dos","Más de dos"]} value={form.dosis_covid} onChange={set} error={enError("dosis_covid")}/><Msg visible={enError("dosis_covid")}/></div>
              <div><label style={LC}>¿Qué vacuna te aplicaron? *</label><input name="vacuna_covid" type="text" placeholder="Ej: Pfizer, Moderna..." value={form.vacuna_covid} onChange={hi} style={ic("vacuna_covid")}/><Msg visible={enError("vacuna_covid")}/></div>
            </>)}

            {/* ── Sección 4: Experiencia ── */}
            {paso===4 && (<>
              <div><label style={LC}>¿Tienes experiencia con niños que no sean de tu familia? *</label><Radio name="exp_ninos_externos" options={["Si","No","La estoy haciendo"]} value={form.exp_ninos_externos} onChange={set} error={enError("exp_ninos_externos")}/><Msg visible={enError("exp_ninos_externos")}/></div>
              <div><label style={LC}>¿Cuántas horas de experiencia tienes? *</label><Radio name="horas_exp_ninos" options={["Menos de 500 horas","Entre 501 y 800 horas","Entre 801 y 1500 horas","Más de 1500"]} value={form.horas_exp_ninos} onChange={set} error={enError("horas_exp_ninos")}/><Msg visible={enError("horas_exp_ninos")}/></div>
            </>)}

            {/* ── Sección 5: Visas ── */}
            {paso===5 && (<>
              <div>
                <label style={LC}>¿Te han negado alguna visa? *</label>
                <Radio name="visa_negada" options={["Si","No"]} value={form.visa_negada} onChange={set} error={enError("visa_negada")}/><Msg visible={enError("visa_negada")}/>
                {form.visa_negada==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>Detalla cuándo, razón y país *</label><textarea name="detalle_visa_negada" rows={3} value={form.detalle_visa_negada} onChange={hi} style={{ ...ic("detalle_visa_negada"),resize:"vertical" }}/><Msg visible={enError("detalle_visa_negada")}/></div>}
              </div>
              <div><label style={LC}>¿Te han cancelado alguna visa? *</label><textarea name="visa_cancelada" rows={2} placeholder="Si no aplica, escribe 'No'" value={form.visa_cancelada} onChange={hi} style={{ ...ic("visa_cancelada"),resize:"vertical" }}/><Msg visible={enError("visa_cancelada")}/></div>
              <div>
                <label style={LC}>¿Familiar en USA solicitando residencia o green card? *</label>
                <Radio name="familiar_residencia_usa" options={["Si","No"]} value={form.familiar_residencia_usa} onChange={set} error={enError("familiar_residencia_usa")}/><Msg visible={enError("familiar_residencia_usa")}/>
                {form.familiar_residencia_usa==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>¿Quién y qué solicita? *</label><textarea name="detalle_familiar_residencia" rows={3} value={form.detalle_familiar_residencia} onChange={hi} style={{ ...ic("detalle_familiar_residencia"),resize:"vertical" }}/><Msg visible={enError("detalle_familiar_residencia")}/></div>}
              </div>
              <div>
                <label style={LC}>¿Familiar en USA con visa de estudio o en situación ilegal? *</label>
                <Radio name="familiar_visa_estudio_usa" options={["Si","No"]} value={form.familiar_visa_estudio_usa} onChange={set} error={enError("familiar_visa_estudio_usa")}/><Msg visible={enError("familiar_visa_estudio_usa")}/>
                {form.familiar_visa_estudio_usa==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>¿Quién y cuál es su situación? *</label><textarea name="detalle_familiar_visa_estudio" rows={3} value={form.detalle_familiar_visa_estudio} onChange={hi} style={{ ...ic("detalle_familiar_visa_estudio"),resize:"vertical" }}/><Msg visible={enError("detalle_familiar_visa_estudio")}/></div>}
              </div>
              <div><label style={LC}>¿Has permanecido en otro país más tiempo del autorizado? *</label><textarea name="overstay_otro_pais" rows={2} placeholder="Si no aplica, escribe 'No'" value={form.overstay_otro_pais} onChange={hi} style={{ ...ic("overstay_otro_pais"),resize:"vertical" }}/><Msg visible={enError("overstay_otro_pais")}/></div>
              <div><label style={LC}>¿Entiendes que el programa es solo intercambio cultural y debes regresar? *</label><Radio name="entiende_intercambio_cultural" options={["SI","No"]} value={form.entiende_intercambio_cultural} onChange={set} error={enError("entiende_intercambio_cultural")}/><Msg visible={enError("entiende_intercambio_cultural")}/></div>
              <div><label style={LC}>¿Consciente de que si un familiar pide asilo el programa se cancela sin devolución? *</label><Radio name="consciente_riesgo_familiar" options={["SI","No"]} value={form.consciente_riesgo_familiar} onChange={set} error={enError("consciente_riesgo_familiar")}/><Msg visible={enError("consciente_riesgo_familiar")}/></div>
              <div>
                <label style={LC}>¿Has participado antes en Au Pair USA? *</label>
                <Radio name="participo_programa_ap" options={["Si","No"]} value={form.participo_programa_ap} onChange={set} error={enError("participo_programa_ap")}/><Msg visible={enError("participo_programa_ap")}/>
                {form.participo_programa_ap==="Si"&&(
                  <div style={{ display:"flex",flexDirection:"column",gap:14,marginTop:14 }}>
                    <div><label style={LC}>¿Finalizaste exitosamente? *</label><Radio name="finalizo_programa_ap" options={["Si","No","No aplica"]} value={form.finalizo_programa_ap} onChange={set} error={enError("finalizo_programa_ap")}/><Msg visible={enError("finalizo_programa_ap")}/></div>
                    <div><label style={LC}>¿Puedes proveer certificados? *</label><Radio name="puede_proveer_certificados" options={["Si","No"]} value={form.puede_proveer_certificados} onChange={set} error={enError("puede_proveer_certificados")}/><Msg visible={enError("puede_proveer_certificados")}/></div>
                  </div>
                )}
              </div>
            </>)}
          </div>

          {/* NAVEGACIÓN */}
          <div style={{ display:"flex",gap:10,marginTop:14,justifyContent:"space-between",alignItems:"center" }}>
            <button onClick={()=>setPaso(Math.max(0,paso-1))} disabled={paso===0}
              style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 14px":"10px 18px",borderRadius:12,border:"1.5px solid #F5E1E7",background:"#fff",color:"#9C8790",fontSize:13,fontWeight:600,cursor:paso===0?"not-allowed":"pointer",opacity:paso===0?.4:1,fontFamily:"inherit" }}>
              <ChevronLeft size={14}/> {isMobile?"":"Anterior"}
            </button>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>guardar(false)} disabled={guardando}
                style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 12px":"10px 18px",borderRadius:12,border:"1.5px solid #F5E1E7",background:"#fff",color:"#9C8790",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                <Save size={13}/> {isMobile?"":"Guardar"}
              </button>
              <button onClick={()=>guardar(true)} disabled={guardando}
                style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 14px":"10px 22px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${seccion.color},${seccion.color}cc)`,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 12px ${seccion.color}40` }}>
                {guardando
                  ? <><div style={{ width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>...</>
                  : paso<SECCIONES.length-1
                  ? <>{isMobile?"Continuar":"Guardar y continuar"} <ChevronRight size={14}/></>
                  : "Finalizar"}
              </button>
            </div>
          </div>

          {/* Dots */}
          <div style={{ display:"flex",justifyContent:"center",gap:7,marginTop:14 }}>
            {SECCIONES.map((s,i) => {
              const completa=seccionCompleta(s,form);
              return (
                <button key={i} onClick={()=>irASeccion(i)}
                  style={{ width:i===paso?26:9,height:9,borderRadius:99,border:"none",cursor:"pointer",transition:"all .2s",background:completa?s.color:i===paso?"#A0435F":"#e5e7eb" }}/>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}