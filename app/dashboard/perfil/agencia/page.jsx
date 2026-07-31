"use client";
// app/dashboard/perfil/agencia/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FotoUpload from "@/components/dashboard/FotoUpload";
import Link from "next/link";
import { LockIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircle2Icon } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import {
  PARTE2, parteCompleta, validarSeccion,
  seccionCompleta as seccionCompletaDe, progresoParte,
} from "@/lib/campos-perfil";

// Los títulos y el orden viven acá; QUÉ es obligatorio viene de
// lib/campos-perfil.js, la misma fuente que usan el servidor y el progreso.
// "Estado del perfil" lo diligencia el equipo, no la candidata: sin obligatorios.
const TITULOS = [
  { id:"personal",    n:1,  titulo:"Información personal" },
  { id:"experiencia", n:2,  titulo:"Experiencia con niños" },
  { id:"educacion",   n:3,  titulo:"Educación y cursos" },
  { id:"conduccion",  n:4,  titulo:"Conducción (Driving Profile)" },
  { id:"personalidad",n:5,  titulo:"Personalidad e intereses" },
  { id:"preguntas",   n:6,  titulo:"Preguntas para familias" },
  { id:"salud",       n:7,  titulo:"Salud y evaluación médica" },
  { id:"referencias", n:8,  titulo:"Referencias" },
  { id:"fotos",       n:9,  titulo:"Fotos y videos del perfil" },
  { id:"estado",      n:10, titulo:"Estado del perfil" },
];
const SECCIONES = TITULOS.map(t => ({
  ...t,
  campos: PARTE2.find(s => s.id === t.id)?.campos || [],
}));

// La Parte 2 se desbloquea sólo con la Parte 1 completa.
const evalCompleta = (u) => parteCompleta(1, u);
// Una sección está completa con TODOS sus obligatorios, no con la mitad: ese
// criterio era el que dejaba perfiles "100%" con campos vacíos.
const seccionCompleta = (sec, form) => seccionCompletaDe(sec, form);
const calcProgreso = (form) => progresoParte(2, form);

const IC = { width:"100%", border:"1.5px solid #f0dde2", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
// El borde rojo se pierde al enfocar el campo (la regla :focus de la página
// usa !important sobre border-color), así que el error se marca además con
// un outline inline, que sí sobrevive al foco.
const IC_ERR = { ...IC, border:"1.5px solid #dc2626", background:"#fef2f2", outline:"2px solid #dc2626", outlineOffset:"1px" };
const LC = { fontSize:10, fontWeight:700, color:"#6b4a54", textTransform:"uppercase", letterSpacing:".7px", display:"block", marginBottom:6 };

function Select({ name, value, onChange, options, placeholder="", estilo }) {
  return (
    <select name={name} value={value||""} onChange={onChange} style={estilo||IC}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

/** Mensaje bajo un campo obligatorio sin diligenciar. */
function Msg({ visible }) {
  if (!visible) return null;
  return (
    <p style={{ fontSize:11.5, color:"#dc2626", fontWeight:600, margin:"5px 0 0" }}>
      Este campo es obligatorio.
    </p>
  );
}

export default function PerfilAgenciaPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,         setUser]         = useState(null);
  const [form,         setForm]         = useState({});
  const [loading,      setLoading]      = useState(true);
  const [guardando,    setGuardando]    = useState(false);
  const [toast,        setToast]        = useState(null);
  const [seccion,      setSeccion]      = useState(0);
  const [evaluOk,      setEvalOk]       = useState(false);
  const [menuMobile,   setMenuMobile]   = useState(false);
  // Campos obligatorios marcados en rojo tras una validación fallida.
  const [faltantes,    setFaltantes]    = useState([]);

  useEffect(() => {
    const safe = (p, fb) => p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"), {user:null}),
      safe(fetch("/api/dashboard/perfil"), null),
    ]).then(([me, perf]) => {
      if (!me?.user) { router.push("/login"); return; }
      if (!me.user.perfil_habilitado) { router.push("/dashboard"); return; }
      setUser(me.user);
      const p = perf?.perfil || me.user;
      if (p.fecha_nacimiento) p.fecha_nacimiento = p.fecha_nacimiento.split?.("T")[0] || p.fecha_nacimiento;
      setForm(p);
      setEvalOk(evalCompleta(p));
      setLoading(false);
    });
  }, []);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    // La marca de error desaparece en cuanto la candidata diligencia el campo.
    if (String(v ?? "").trim() !== "") setFaltantes(f => f.filter(c => c.name !== k));
  };
  const hi  = e => set(e.target.name, e.target.value);
  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  // ── Validación (mismas reglas que la Parte 1) ────────────────────────────
  const enError = (name) => faltantes.some(c => c.name === name);
  const ic = (name) => (enError(name) ? IC_ERR : IC);

  const señalarFaltantes = (lista) => {
    setFaltantes(lista);
    setTimeout(() => {
      const el = document.querySelector(`[name="${lista[0].name}"]`);
      if (el?.scrollIntoView) el.scrollIntoView({ behavior:"smooth", block:"center" });
      if (el?.focus) el.focus({ preventScroll:true });
    }, 60);
  };

  /** Navegar a otra sección: sólo si la actual está completa. */
  const irASeccion = (i) => {
    if (i === seccion) return;
    if (i < seccion) { setFaltantes([]); setSeccion(i); return; }
    const { ok, faltantes:pendientes } = validarSeccion(SECCIONES[seccion], form);
    if (!ok) { señalarFaltantes(pendientes); return; }
    setFaltantes([]); setSeccion(i);
  };

  const guardar = async (goNext=false) => {
    const { ok, faltantes:pendientes } = validarSeccion(SECCIONES[seccion], form);
    // Avanzar exige la sección completa; guardar sin avanzar siempre se permite.
    if (goNext && !ok) { señalarFaltantes(pendientes); return; }

    setGuardando(true);
    const progreso = calcProgreso(form);
    const res = await fetch("/api/dashboard/perfil", {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...form, progreso_agencia: progreso }),
    });
    if (res.ok) {
      if (goNext) {
        setFaltantes([]);
        showToast("✓ Guardado correctamente");
        if (seccion < SECCIONES.length-1) setSeccion(s => s+1);
        else router.push("/dashboard/perfil");
      } else if (!ok) {
        showToast("✓ Guardado — aún te faltan campos");
        señalarFaltantes(pendientes);
      } else {
        setFaltantes([]);
        showToast("✓ Guardado correctamente");
      }
    } else showToast("Error al guardar","error");
    setGuardando(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #e8849a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Bloqueado ── */
  if (!evaluOk) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32,textAlign:"center" }}>
      <div style={{ width:72,height:72,borderRadius:"50%",background:"#fce8ed",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <LockIcon size={32} style={{ color:"#a0435f" }}/>
      </div>
      <h2 style={{ fontFamily:"'Poppins',system-ui,-apple-system,sans-serif",fontSize:22,fontWeight:700,color:"#2d1a22",margin:0 }}>Perfil con la agencia bloqueado</h2>
      <p style={{ color:"#9a6672",fontSize:14,maxWidth:360,margin:0,lineHeight:1.7 }}>
        Necesitas completar primero la <strong>Evaluación de Perfil</strong> al 100%. 💕
      </p>
      <Link href="/dashboard/perfil/evaluacion" style={{ background:"#a0435f",color:"#fff",fontSize:13,fontWeight:600,padding:"12px 28px",borderRadius:14,textDecoration:"none" }}>
        Ir a mi evaluación →
      </Link>
      <Link href="/dashboard/perfil" style={{ color:"#a0435f",fontSize:13,textDecoration:"none" }}>← Volver a mi perfil</Link>
    </div>
  );

  const sec      = SECCIONES[seccion];
  const progreso = calcProgreso(form);
  const G1  = { display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14 };
  const G3  = { display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr", gap:14 };

  return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",fontFamily:"'Poppins',system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input:focus,textarea:focus,select:focus{border-color:#a0435f!important;box-shadow:0 0 0 3px rgba(160,67,95,.1);outline:none;}`}</style>

      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:2000,background:toast.tipo==="error"?"#dc2626":"#1e1033",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600 }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #f0dde2",padding:isMobile?"12px 16px":"14px 28px",position:"sticky",top:0,zIndex:20 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
            <Link href="/dashboard/perfil" style={{ display:"flex",alignItems:"center",gap:5,color:"#9a7080",textDecoration:"none",fontSize:12,border:"1px solid #f0dde2",padding:"6px 10px",borderRadius:10,flexShrink:0 }}>
              <ChevronLeftIcon size={13}/> {isMobile?"Volver":"Volver a mi perfil"}
            </Link>
            {!isMobile && (
              <div>
                <h1 style={{ fontFamily:"'Poppins',system-ui,-apple-system,sans-serif",fontSize:17,fontWeight:700,color:"#1e1033",margin:0 }}>Perfil con la agencia</h1>
                <p style={{ fontSize:12,color:"#9a7080",margin:0 }}>{SECCIONES.filter(s=>seccionCompleta(s,form)).length} de {SECCIONES.length} secciones completadas</p>
              </div>
            )}
          </div>
          {/* Barra de progreso */}
          <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,maxWidth:280 }}>
            <div style={{ flex:1,height:6,background:"#f0dde2",borderRadius:99,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${progreso}%`,background:"linear-gradient(90deg,#a0435f,#e8849a)",borderRadius:99,transition:"width .5s" }}/>
            </div>
            <span style={{ fontSize:12,fontWeight:700,color:"#a0435f",flexShrink:0 }}>{progreso}%</span>
          </div>
          <button onClick={()=>guardar(false)} disabled={guardando}
            style={{ background:"#a0435f",color:"#fff",border:"none",fontSize:isMobile?12:13,fontWeight:600,padding:isMobile?"8px 14px":"9px 20px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}>
            {guardando?"...":"Guardar"}
          </button>
        </div>

        {/* Tabs mobile — scroll horizontal */}
        {isMobile && (
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingTop:10,paddingBottom:2,scrollbarWidth:"none" }}>
            {SECCIONES.map((s,i) => {
              const completa=seccionCompleta(s,form), active=i===seccion;
              return (
                <button key={s.id} onClick={()=>irASeccion(i)}
                  style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:99,border:"none",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",transition:"all .12s",fontSize:11,fontWeight:active?700:500,
                    background:active?"#a0435f":completa?"#e8f0e0":"#f3f4f6",
                    color:active?"#fff":completa?"#5a8a3a":"#6b7280",
                  }}>
                  {completa&&!active?<CheckCircle2Icon size={11}/>:<span>{s.n}</span>}
                  {s.titulo}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ maxWidth:1100,margin:"0 auto",padding:isMobile?"16px 16px 60px":"24px 28px 60px",display:"flex",gap:20 }}>

        {/* Sidebar — solo desktop */}
        {!isMobile && (
          <div style={{ width:220,flexShrink:0 }}>
            <p style={{ fontSize:10,fontWeight:700,color:"#9a7080",textTransform:"uppercase",letterSpacing:".8px",margin:"0 0 10px" }}>Secciones</p>
            {SECCIONES.map((s,i) => {
              const completa=seccionCompleta(s,form), active=i===seccion;
              return (
                <button key={s.id} onClick={()=>irASeccion(i)}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:14,border:"none",cursor:"pointer",textAlign:"left",width:"100%",marginBottom:4,fontFamily:"inherit",transition:"all .12s",background:active?"#fce8ed":"transparent",boxShadow:active?"0 0 0 1.5px #a0435f":"none" }}>
                  <div style={{ width:28,height:28,borderRadius:8,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,background:completa?"#e8f0e0":active?"#fce8ed":"#f3f4f6",color:completa?"#5a8a3a":active?"#a0435f":"#9ca3af" }}>
                    {completa?<CheckCircle2Icon size={14} style={{ color:"#5a8a3a" }}/>:s.n}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:11.5,fontWeight:active?700:500,color:active?"#a0435f":completa?"#5a8a3a":"#555",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.titulo}</p>
                    <p style={{ fontSize:10,color:completa?"#5a8a3a":"#9ca3af",margin:0 }}>{completa?"✓ Completa":"Pendiente"}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Formulario */}
        <div style={{ flex:1,minWidth:0 }}>
          {/* Cabecera sección */}
          <div style={{ background:"linear-gradient(135deg,#a0435f15,#fce8ed)",borderRadius:16,border:"1px solid #f0b8c430",padding:isMobile?"14px 16px":"18px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:40,height:40,borderRadius:12,background:"#fce8ed",border:"2px solid #f0b8c440",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#a0435f",flexShrink:0 }}>
              {sec.n}
            </div>
            <div>
              <p style={{ fontSize:10,fontWeight:700,color:"#a0435f",textTransform:"uppercase",letterSpacing:".7px",margin:"0 0 2px" }}>Sección {seccion+1} de {SECCIONES.length}</p>
              <h2 style={{ fontFamily:"'Poppins',system-ui,-apple-system,sans-serif",fontSize:isMobile?16:18,fontWeight:700,color:"#1e1033",margin:0 }}>{sec.titulo}</h2>
            </div>
          </div>

          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"16px":"28px",display:"flex",flexDirection:"column",gap:16 }}>

            {faltantes.length>0 && (
              <div style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"12px 16px",fontSize:13,color:"#dc2626" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,fontWeight:700 }}>
                  <span>⚠️</span>
                  {faltantes.length===1
                    ? "Falta 1 campo obligatorio por diligenciar"
                    : `Faltan ${faltantes.length} campos obligatorios por diligenciar`}
                </div>
                <ul style={{ margin:"8px 0 0",paddingLeft:26,fontWeight:500,lineHeight:1.7 }}>
                  {faltantes.map(c => (
                    <li key={c.name}>
                      <button onClick={()=>{
                        const el=document.querySelector(`[name="${c.name}"]`);
                        el?.scrollIntoView?.({ behavior:"smooth",block:"center" });
                        el?.focus?.({ preventScroll:true });
                      }} style={{ background:"none",border:"none",padding:0,color:"#dc2626",fontSize:13,fontFamily:"inherit",textDecoration:"underline",cursor:"pointer" }}>
                        {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── 1: Personal ── */}
            {seccion===0 && (<>
              <div style={G3}>
                <div><label style={LC}>Estatura *</label><input name="estatura" value={form.estatura||""} onChange={hi} style={ic("estatura")} placeholder="1.65 m"/><Msg visible={enError("estatura")}/></div>
                <div><label style={LC}>Peso *</label><input name="peso" value={form.peso||""} onChange={hi} style={ic("peso")} placeholder="55 kg"/><Msg visible={enError("peso")}/></div>
                <div><label style={LC}>Estado civil</label><Select name="estado_civil" value={form.estado_civil} onChange={hi} placeholder="Seleccionar" options={["Soltera","Casada","Unión libre","Divorciada","Viuda"]} estilo={ic("estado_civil")}/><Msg visible={enError("estado_civil")}/></div>
                <div><label style={LC}>Nacionalidad *</label><Select name="nacionalidad" value={form.nacionalidad} onChange={hi} placeholder="Seleccionar" options={["Colombiana","Venezolana","Ecuatoriana","Peruana","Mexicana","Otra"]} estilo={ic("nacionalidad")}/><Msg visible={enError("nacionalidad")}/></div>
                <div><label style={LC}>Religión</label><Select name="religion" value={form.religion} onChange={hi} placeholder="Seleccionar" options={["Cristiana","Católica","Evangélica","Sin religión","Otra"]} estilo={ic("religion")}/><Msg visible={enError("religion")}/></div>
              </div>
              <div style={G3}>
                <div><label style={LC}>¿Tienes pasaporte? *</label><Select name="tiene_pasaporte" value={form.tiene_pasaporte} onChange={hi} placeholder="Seleccionar" options={["Sí","No","En trámite"]} estilo={ic("tiene_pasaporte")}/><Msg visible={enError("tiene_pasaporte")}/></div>
                <div><label style={LC}>Número de pasaporte</label><input name="numero_pasaporte" value={form.numero_pasaporte||""} onChange={hi} style={ic("numero_pasaporte")} placeholder="AR2456789"/><Msg visible={enError("numero_pasaporte")}/></div>
                <div><label style={LC}>Fecha de vencimiento</label><input name="fecha_vencimiento_pasaporte" type="date" value={(form.fecha_vencimiento_pasaporte||"").slice(0,10)} onChange={hi} style={ic("fecha_vencimiento_pasaporte")}/><Msg visible={enError("fecha_vencimiento_pasaporte")}/></div>
              </div>
              <div style={G3}>
                <div><label style={LC}>¿Tienes visa J-1?</label><Select name="tiene_visa_j1" value={form.tiene_visa_j1} onChange={hi} placeholder="Seleccionar" options={["Sí","No, aún no","Sí, anterior","En trámite"]} estilo={ic("tiene_visa_j1")}/><Msg visible={enError("tiene_visa_j1")}/></div>
                <div><label style={LC}>Número DS-2019</label><input name="numero_ds2019" value={form.numero_ds2019||""} onChange={hi} style={ic("numero_ds2019")} placeholder="N1234567890"/><Msg visible={enError("numero_ds2019")}/></div>
                <div><label style={LC}>Número de Sponsor</label><input name="numero_sponsor" value={form.numero_sponsor||""} onChange={hi} style={ic("numero_sponsor")} placeholder="P1234567"/><Msg visible={enError("numero_sponsor")}/></div>
              </div>
            </>)}

            {/* ── 2: Experiencia ── */}
            {seccion===1 && (<>
              <div><label style={LC}>Describe tu experiencia con niños *</label><textarea name="experiencia_cuidado" rows={isMobile?4:6} value={form.experiencia_cuidado||""} onChange={hi} style={{ ...ic("experiencia_cuidado"),resize:"vertical" }} placeholder="Edades de los niños, actividades realizadas, duración..."/><Msg visible={enError("experiencia_cuidado")}/></div>
              <div><label style={LC}>Horas de childcare acumuladas *</label><input name="horas_childcare" type="number" min="0" value={form.horas_childcare||""} onChange={hi} style={ic("horas_childcare")} placeholder="0"/><Msg visible={enError("horas_childcare")}/></div>
            </>)}

            {/* ── 3: Educación ── */}
            {seccion===2 && (<>
              <div style={G1}>
                <div><label style={LC}>¿Qué haces actualmente? *</label><Select name="situacion_actual" value={form.situacion_actual} onChange={hi} placeholder="Seleccionar" options={["Estudio","Trabajo","No hago nada","Desempeño otra actividad"]} estilo={ic("situacion_actual")}/><Msg visible={enError("situacion_actual")}/></div>
                <div><label style={LC}>Carrera / Profesión</label><input name="carrera_graduada" value={form.carrera_graduada||""} onChange={hi} style={ic("carrera_graduada")} placeholder="Ej: Enfermería"/><Msg visible={enError("carrera_graduada")}/></div>
                <div><label style={LC}>¿Tienes curso de primeros auxilios?</label><Select name="curso_primeros_auxilios" value={form.curso_primeros_auxilios} onChange={hi} placeholder="Seleccionar" options={["Si","No","Lo estoy haciendo"]} estilo={ic("curso_primeros_auxilios")}/><Msg visible={enError("curso_primeros_auxilios")}/></div>
              </div>
            </>)}

            {/* ── 4: Conducción ── */}
            {seccion===3 && (<>
              <div style={G1}>
                <div><label style={LC}>¿Tienes licencia? *</label><Select name="licencia_conduccion" value={form.licencia_conduccion} onChange={hi} placeholder="Seleccionar" options={["Si","No","Está en proceso"]} estilo={ic("licencia_conduccion")}/><Msg visible={enError("licencia_conduccion")}/></div>
                <div><label style={LC}>Tipo de licencia *</label><Select name="tipo_licencia" value={form.tipo_licencia} onChange={hi} placeholder="Seleccionar" options={["Categoría A","Categoría B","Categoría B1","Categoría C","No aplica"]} estilo={ic("tipo_licencia")}/><Msg visible={enError("tipo_licencia")}/></div>
              </div>
              <div><label style={LC}>Habilidad de conducción</label><Select name="habilidad_conduccion" value={form.habilidad_conduccion} onChange={hi} placeholder="Seleccionar" options={["Nulas","Puedo conducir pero no lo hago bien.","Conduzco bien pero me falta práctica.","Me siento muy cómoda y segura."]} estilo={ic("habilidad_conduccion")}/><Msg visible={enError("habilidad_conduccion")}/></div>
            </>)}

            {/* ── 5: Personalidad ── */}
            {seccion===4 && (<>
              <div><label style={LC}>Descripción personal *</label><textarea name="bio" rows={isMobile?4:5} value={form.bio||""} onChange={hi} style={{ ...ic("bio"),resize:"vertical" }} placeholder="Tu personalidad, valores, forma de ser..."/><Msg visible={enError("bio")}/></div>
              <div><label style={LC}>Hobbies e intereses *</label><textarea name="hobbies" rows={isMobile?3:4} value={form.hobbies||""} onChange={hi} style={{ ...ic("hobbies"),resize:"vertical" }} placeholder="Deportes, música, arte, viajes, cocina..."/><Msg visible={enError("hobbies")}/></div>
            </>)}

            {/* ── 6: Preguntas ── */}
            {seccion===5 && (<>
              <div><label style={LC}>¿Por qué quieres ser au pair? *</label><textarea name="por_que_au_pair" rows={isMobile?5:6} value={form.por_que_au_pair||""} onChange={hi} style={{ ...ic("por_que_au_pair"),resize:"vertical" }} placeholder="Tus motivaciones, objetivos, qué esperas de la experiencia..."/><Msg visible={enError("por_que_au_pair")}/></div>
            </>)}

            {/* ── 7: Salud ── */}
            {seccion===6 && (<>
              <div style={G1}>
                <div><label style={LC}>¿Enfermedad con medicamentos constantes? *</label><Select name="enfermedad_medicamentos" value={form.enfermedad_medicamentos} onChange={hi} placeholder="Seleccionar" options={["Si","No"]} estilo={ic("enfermedad_medicamentos")}/><Msg visible={enError("enfermedad_medicamentos")}/></div>
                <div><label style={LC}>¿Alergias a medicamentos?</label><Select name="alergia_medicamentos" value={form.alergia_medicamentos} onChange={hi} placeholder="Seleccionar" options={["Si","No"]} estilo={ic("alergia_medicamentos")}/><Msg visible={enError("alergia_medicamentos")}/></div>
                <div><label style={LC}>Dieta especial *</label><Select name="dieta_especial" value={form.dieta_especial} onChange={hi} placeholder="Seleccionar" options={["Ninguna","Vegetariana","Vegana","Sin gluten","Sin lactosa","Otra"]} estilo={ic("dieta_especial")}/><Msg visible={enError("dieta_especial")}/></div>
                <div><label style={LC}>¿Fumadora?</label><Select name="fumadora" value={form.fumadora} onChange={hi} placeholder="Seleccionar" options={["No","Sí","Exfumadora"]} estilo={ic("fumadora")}/><Msg visible={enError("fumadora")}/></div>
                <div><label style={LC}>¿Aceptas mascotas?</label><Select name="acepta_mascotas" value={form.acepta_mascotas} onChange={hi} placeholder="Seleccionar" options={["Sí, todos","Sí, solo perros","Sí, solo gatos","No tengo preferencia","No"]} estilo={ic("acepta_mascotas")}/><Msg visible={enError("acepta_mascotas")}/></div>
              </div>
            </>)}

            {/* ── 8: Referencias ── */}
            {seccion===7 && (<>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                <p style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:0 }}>Referencia 1</p>
                <div style={G1}>
                  <div><label style={LC}>Nombre completo *</label><input name="referencia_1_nombre" value={form.referencia_1_nombre||""} onChange={hi} style={ic("referencia_1_nombre")}/><Msg visible={enError("referencia_1_nombre")}/></div>
                  <div><label style={LC}>Relación</label><Select name="referencia_1_relacion" value={form.referencia_1_relacion} onChange={hi} placeholder="Seleccionar" options={["Empleador","Familiar","Profesor","Amigo","Otro"]} estilo={ic("referencia_1_relacion")}/><Msg visible={enError("referencia_1_relacion")}/></div>
                  <div><label style={LC}>Email *</label><input name="referencia_1_email" type="email" value={form.referencia_1_email||""} onChange={hi} style={ic("referencia_1_email")}/><Msg visible={enError("referencia_1_email")}/></div>
                  <div><label style={LC}>Teléfono</label><input name="referencia_1_telefono" value={form.referencia_1_telefono||""} onChange={hi} style={ic("referencia_1_telefono")}/><Msg visible={enError("referencia_1_telefono")}/></div>
                </div>
                <p style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:0 }}>Referencia 2</p>
                <div style={G1}>
                  <div><label style={LC}>Nombre completo</label><input name="referencia_2_nombre" value={form.referencia_2_nombre||""} onChange={hi} style={ic("referencia_2_nombre")}/><Msg visible={enError("referencia_2_nombre")}/></div>
                  <div><label style={LC}>Relación</label><Select name="referencia_2_relacion" value={form.referencia_2_relacion} onChange={hi} placeholder="Seleccionar" options={["Empleador","Familiar","Profesor","Amigo","Otro"]} estilo={ic("referencia_2_relacion")}/><Msg visible={enError("referencia_2_relacion")}/></div>
                  <div><label style={LC}>Email</label><input name="referencia_2_email" type="email" value={form.referencia_2_email||""} onChange={hi} style={ic("referencia_2_email")}/><Msg visible={enError("referencia_2_email")}/></div>
                  <div><label style={LC}>Teléfono</label><input name="referencia_2_telefono" value={form.referencia_2_telefono||""} onChange={hi} style={ic("referencia_2_telefono")}/><Msg visible={enError("referencia_2_telefono")}/></div>
                </div>
              </div>
            </>)}

            {/* ── 9: Fotos ── */}
            {seccion===8 && (<>
              <FotoUpload value={form.foto_url} onChange={async (base64) => {
                set("foto_url", base64);
                await fetch("/api/dashboard/foto", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({foto_url:base64}) });
              }}/>
              <div>
                <label style={LC}>URL de tu video de presentación</label>
                <input name="video_presentacion_url" value={form.video_presentacion_url||""} onChange={hi} style={ic("video_presentacion_url")} placeholder="https://youtube.com/... o Google Drive..."/><Msg visible={enError("video_presentacion_url")}/>
              </div>
            </>)}

            {/* ── 10: Estado ── */}
            {seccion===9 && (<>
              <div style={{ background:progreso>=80?"#d1fae5":progreso>=50?"#fef3c7":"#fce8ed",border:`1px solid ${progreso>=80?"#6ee7b7":progreso>=50?"#fde68a":"#f0b8c4"}`,borderRadius:16,padding:16 }}>
                <p style={{ fontSize:14,fontWeight:700,color:progreso>=80?"#065f46":progreso>=50?"#92400e":"#a0435f",margin:"0 0 6px" }}>
                  {progreso>=80?"🎉 ¡Tu perfil está casi listo!":progreso>=50?"⏳ Sigue completando":progreso>0?"📝 Vas por buen camino":"👋 ¡Empecemos!"}
                </p>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ flex:1,height:7,background:"rgba(255,255,255,.5)",borderRadius:99,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${progreso}%`,background:progreso>=80?"#10b981":"#a0435f",borderRadius:99,transition:"width .5s" }}/>
                  </div>
                  <span style={{ fontSize:13,fontWeight:700,color:progreso>=80?"#065f46":"#a0435f" }}>{progreso}%</span>
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:0 }}>Secciones faltantes:</p>
                {SECCIONES.filter(s=>!seccionCompleta(s,form)).map(s=>(
                  <button key={s.id} onClick={()=>setSeccion(s.n-1)}
                    style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,border:"1.5px solid #f0dde2",background:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"left" }}>
                    <span style={{ fontSize:12,color:"#9ca3af",width:20 }}>{s.n}.</span>
                    <span style={{ fontSize:13,color:"#374151" }}>{s.titulo}</span>
                    <ChevronRightIcon size={13} style={{ color:"#9ca3af",marginLeft:"auto" }}/>
                  </button>
                ))}
              </div>
            </>)}
          </div>

          {/* Navegación */}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16 }}>
            <button onClick={()=>setSeccion(s=>Math.max(0,s-1))} disabled={seccion===0}
              style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 14px":"10px 18px",borderRadius:12,border:"1.5px solid #f0dde2",background:"#fff",color:"#9a7080",fontSize:13,fontWeight:600,cursor:seccion===0?"not-allowed":"pointer",opacity:seccion===0?.4:1,fontFamily:"inherit" }}>
              <ChevronLeftIcon size={14}/> Anterior
            </button>
            {/* Dots */}
            <div style={{ display:"flex",gap:4,alignItems:"center" }}>
              {SECCIONES.map((_,i)=>(
                <button key={i} onClick={()=>irASeccion(i)}
                  style={{ width:i===seccion?24:8,height:8,borderRadius:99,border:"none",cursor:"pointer",transition:"all .2s",background:i===seccion?"#a0435f":"#f0dde2" }}/>
              ))}
            </div>
            <button onClick={()=>guardar(true)} disabled={guardando}
              style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 14px":"10px 22px",borderRadius:12,border:"none",background:"#a0435f",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
              {guardando?"Guardando…":seccion<SECCIONES.length-1?<>Guardar <ChevronRightIcon size={13}/></>:"Finalizar ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}