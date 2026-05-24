"use client";
// app/dashboard/perfil/agencia/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FotoUpload from "@/components/dashboard/FotoUpload";
import Link from "next/link";
import {
  LockIcon, ChevronLeftIcon, ChevronRightIcon,
  CheckCircle2Icon, ClockIcon, CircleIcon,
} from "lucide-react";

const SECCIONES = [
  { id:"personal",    n:1,  titulo:"Información personal",         campos:["estatura","peso","nacionalidad","religion","estado_civil","tiene_pasaporte"] },
  { id:"experiencia", n:2,  titulo:"Experiencia con niños",        campos:["experiencia_cuidado","horas_childcare"] },
  { id:"educacion",   n:3,  titulo:"Educación y cursos",           campos:["situacion_actual","carrera_graduada"] },
  { id:"conduccion",  n:4,  titulo:"Conducción (Driving Profile)", campos:["licencia_conduccion","tipo_licencia"] },
  { id:"personalidad",n:5,  titulo:"Personalidad e intereses",     campos:["bio","hobbies"] },
  { id:"preguntas",   n:6,  titulo:"Preguntas para familias",      campos:["por_que_au_pair"] },
  { id:"salud",       n:7,  titulo:"Salud y evaluación médica",    campos:["enfermedad_medicamentos","dieta_especial"] },
  { id:"referencias", n:8,  titulo:"Referencias",                  campos:["referencia_1_nombre","referencia_1_email"] },
  { id:"fotos",       n:9,  titulo:"Fotos y videos del perfil",    campos:["foto_url"] },
  { id:"estado",      n:10, titulo:"Estado del perfil",            campos:["estado_agencia"] },
];

const CAMPOS_EVAL = [
  "cedula","telefono","fecha_nacimiento","ciudad","pais",
  "nivel_ingles","licencia_conduccion","curso_primeros_auxilios",
  "situacion_actual","exp_ninos_externos","horas_exp_ninos",
  "visa_negada","entiende_intercambio_cultural","consciente_riesgo_familiar",
  "enfermedad_medicamentos","depresion_panico",
];

function evalCompleta(u) {
  const llenos = CAMPOS_EVAL.filter(c => u[c] && String(u[c]).trim() !== "").length;
  return Math.round((llenos / CAMPOS_EVAL.length) * 100) >= 100;
}

function seccionCompleta(sec, form) {
  return sec.campos.filter(c => form[c] && String(form[c]).trim() !== "").length >= Math.ceil(sec.campos.length / 2);
}

function calcProgreso(form) {
  return Math.round((SECCIONES.filter(s => seccionCompleta(s, form)).length / SECCIONES.length) * 100);
}

const IC = { width:"100%", border:"1.5px solid #f0dde2", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const LC = { fontSize:10, fontWeight:700, color:"#6b4a54", textTransform:"uppercase", letterSpacing:".7px", display:"block", marginBottom:6 };

function Select({ name, value, onChange, options, placeholder="" }) {
  return (
    <select name={name} value={value||""} onChange={onChange} style={IC}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

export default function PerfilAgenciaPage() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [form,      setForm]      = useState({});
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [seccion,   setSeccion]   = useState(0);
  const [evaluCompleta, setEvalCompleta] = useState(false);

  useEffect(() => {
    const safe = (p, fb) => p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"), { user:null }),
      safe(fetch("/api/dashboard/perfil"), null),
    ]).then(([me, perf]) => {
      if (!me?.user) { router.push("/login"); return; }
      if (!me.user.perfil_habilitado) { router.push("/dashboard"); return; }
      setUser(me.user);

      const p = perf?.perfil || me.user;
      if (p.fecha_nacimiento) p.fecha_nacimiento = p.fecha_nacimiento.split?.("T")[0] || p.fecha_nacimiento;
      setForm(p);
      setEvalCompleta(evalCompleta(p));
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const hi  = e => set(e.target.name, e.target.value);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const guardar = async (goNext=false) => {
    setGuardando(true);
    const progreso = calcProgreso(form);
    const res = await fetch("/api/dashboard/perfil", {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...form, progreso_agencia: progreso }),
    });
    if (res.ok) {
      showToast("✓ Guardado correctamente");
      if (goNext && seccion < SECCIONES.length-1) setSeccion(s => s+1);
      if (goNext && seccion === SECCIONES.length-1) router.push("/dashboard/perfil");
    } else showToast("Error al guardar","error");
    setGuardando(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Bloqueado: evaluación no completa ── */
  if (!evaluCompleta) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:32, textAlign:"center" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"#fce8ed", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <LockIcon size={32} style={{ color:"#a0435f" }}/>
      </div>
      <h2 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#2d1a22", margin:0 }}>
        Perfil con la agencia bloqueado
      </h2>
      <p style={{ color:"#9a6672", fontSize:14, maxWidth:360, margin:0, lineHeight:1.7 }}>
        Para acceder a esta sección necesitas completar primero la <strong>Evaluación de Perfil</strong> al 100%.
        Cuando la termines, Jenni desbloqueará esta sección para ti. 💕
      </p>
      <Link href="/dashboard/perfil/evaluacion"
        style={{ background:"#a0435f", color:"#fff", fontSize:13, fontWeight:600, padding:"12px 28px", borderRadius:14, textDecoration:"none" }}>
        Ir a mi evaluación →
      </Link>
      <Link href="/dashboard/perfil" style={{ color:"#a0435f", fontSize:13, textDecoration:"none" }}>
        ← Volver a mi perfil
      </Link>
    </div>
  );

  const sec      = SECCIONES[seccion];
  const progreso = calcProgreso(form);

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input:focus,textarea:focus,select:focus{border-color:#a0435f!important;box-shadow:0 0 0 3px rgba(160,67,95,.1);outline:none;}`}</style>

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:toast.tipo==="error"?"#dc2626":"#1e1033", color:"#fff", padding:"12px 20px", borderRadius:14, fontSize:13, fontWeight:600 }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #f0dde2", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link href="/dashboard/perfil" style={{ display:"flex", alignItems:"center", gap:6, color:"#9a7080", textDecoration:"none", fontSize:13, border:"1px solid #f0dde2", padding:"7px 12px", borderRadius:10 }}>
            <ChevronLeftIcon size={14}/> Volver a mi perfil
          </Link>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#1e1033", margin:0 }}>Perfil con la agencia</h1>
            <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>{SECCIONES.filter(s=>seccionCompleta(s,form)).length} de {SECCIONES.length} secciones completadas</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, maxWidth:300 }}>
          <div style={{ flex:1 }}>
            <div style={{ height:6, background:"#f0dde2", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progreso}%`, background:"linear-gradient(90deg,#a0435f,#e8849a)", borderRadius:99, transition:"width .5s" }}/>
            </div>
          </div>
          <span style={{ fontSize:12, fontWeight:700, color:"#a0435f", flexShrink:0 }}>{progreso}%</span>
        </div>
        <button onClick={() => guardar(false)} disabled={guardando}
          style={{ display:"flex", alignItems:"center", gap:7, background:"#a0435f", color:"#fff", border:"none", fontSize:13, fontWeight:600, padding:"9px 20px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 28px 60px", display:"flex", gap:20 }}>

        {/* Sidebar */}
        <div style={{ width:220, flexShrink:0 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".8px", margin:"0 0 10px" }}>Secciones</p>
          {SECCIONES.map((s,i) => {
            const completa = seccionCompleta(s, form);
            const active   = i === seccion;
            return (
              <button key={s.id} onClick={() => setSeccion(i)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:14, border:"none", cursor:"pointer", textAlign:"left", width:"100%", marginBottom:4, fontFamily:"inherit", transition:"all .12s",
                  background:active?"#fce8ed":"transparent",
                  boxShadow:active?"0 0 0 1.5px #a0435f":"none",
                }}>
                <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700,
                  background:completa?"#e8f0e0":active?"#fce8ed":"#f3f4f6",
                  color:completa?"#5a8a3a":active?"#a0435f":"#9ca3af",
                }}>
                  {completa ? <CheckCircle2Icon size={14} style={{ color:"#5a8a3a" }}/> : s.n}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:11.5, fontWeight:active?700:500, color:active?"#a0435f":completa?"#5a8a3a":"#555", margin:0, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.titulo}</p>
                  <p style={{ fontSize:10, color:completa?"#5a8a3a":"#9ca3af", margin:0 }}>{completa?"✓ Completa":"Pendiente"}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Formulario */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Cabecera sección */}
          <div style={{ background:"linear-gradient(135deg,#a0435f15,#fce8ed)", borderRadius:20, border:"1px solid #f0b8c430", padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"#fce8ed", border:"2px solid #f0b8c440", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#a0435f", flexShrink:0 }}>
              {sec.n}
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"#a0435f", textTransform:"uppercase", letterSpacing:".7px", margin:"0 0 2px" }}>Sección {seccion+1} de {SECCIONES.length}</p>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"#1e1033", margin:0 }}>{sec.titulo}</h2>
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:"28px", display:"flex", flexDirection:"column", gap:20 }}>

            {/* Sección 1 */}
            {seccion===0 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <div><label style={LC}>Estatura *</label><input name="estatura" value={form.estatura||""} onChange={hi} style={IC} placeholder="1.65 m"/></div>
                <div><label style={LC}>Peso *</label><input name="peso" value={form.peso||""} onChange={hi} style={IC} placeholder="55 kg"/></div>
                <div><label style={LC}>Estado civil</label><Select name="estado_civil" value={form.estado_civil} onChange={hi} placeholder="Seleccionar" options={["Soltera","Casada","Unión libre","Divorciada","Viuda"]}/></div>
                <div><label style={LC}>Nacionalidad *</label><Select name="nacionalidad" value={form.nacionalidad} onChange={hi} placeholder="Seleccionar" options={["Colombiana","Venezolana","Ecuatoriana","Peruana","Mexicana","Otra"]}/></div>
                <div><label style={LC}>Religión</label><Select name="religion" value={form.religion} onChange={hi} placeholder="Seleccionar" options={["Cristiana","Católica","Evangélica","Sin religión","Otra"]}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <div><label style={LC}>¿Tienes pasaporte? *</label><Select name="tiene_pasaporte" value={form.tiene_pasaporte} onChange={hi} placeholder="Seleccionar" options={["Sí","No","En trámite"]}/></div>
                <div><label style={LC}>Número de pasaporte</label><input name="numero_pasaporte" value={form.numero_pasaporte||""} onChange={hi} style={IC} placeholder="AR2456789"/></div>
                <div><label style={LC}>Fecha de vencimiento</label><input name="fecha_vencimiento_pasaporte" type="date" value={form.fecha_vencimiento_pasaporte||""} onChange={hi} style={IC}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <div><label style={LC}>¿Tienes visa J-1?</label><Select name="tiene_visa_j1" value={form.tiene_visa_j1} onChange={hi} placeholder="Seleccionar" options={["Sí","No, aún no","Sí, anterior","En trámite"]}/></div>
                <div><label style={LC}>Número DS-2019</label><input name="numero_ds2019" value={form.numero_ds2019||""} onChange={hi} style={IC} placeholder="N1234567890"/></div>
                <div><label style={LC}>Número de Sponsor</label><input name="numero_sponsor" value={form.numero_sponsor||""} onChange={hi} style={IC} placeholder="P1234567"/></div>
              </div>
            </>)}

            {/* Sección 2 */}
            {seccion===1 && (<>
              <div>
                <label style={LC}>Describe tu experiencia con niños *</label>
                <textarea name="experiencia_cuidado" rows={6} value={form.experiencia_cuidado||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Edades de los niños, actividades realizadas, duración, referencias..."/>
              </div>
              <div><label style={LC}>Horas de childcare acumuladas</label><input name="horas_childcare" type="number" min="0" value={form.horas_childcare||""} onChange={hi} style={IC} placeholder="0"/></div>
            </>)}

            {/* Sección 3 */}
            {seccion===2 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div><label style={LC}>¿Qué haces actualmente? *</label><Select name="situacion_actual" value={form.situacion_actual} onChange={hi} placeholder="Seleccionar" options={["Estudio","Trabajo","No hago nada","Desempeño otra actividad"]}/></div>
                <div><label style={LC}>Carrera / Profesión</label><input name="carrera_graduada" value={form.carrera_graduada||""} onChange={hi} style={IC} placeholder="Ej: Enfermería"/></div>
                <div><label style={LC}>¿Tienes curso de primeros auxilios?</label><Select name="curso_primeros_auxilios" value={form.curso_primeros_auxilios} onChange={hi} placeholder="Seleccionar" options={["Si","No","Lo estoy haciendo"]}/></div>
              </div>
            </>)}

            {/* Sección 4 */}
            {seccion===3 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div><label style={LC}>¿Tienes licencia? *</label><Select name="licencia_conduccion" value={form.licencia_conduccion} onChange={hi} placeholder="Seleccionar" options={["Si","No","Está en proceso"]}/></div>
                <div><label style={LC}>Tipo de licencia *</label><Select name="tipo_licencia" value={form.tipo_licencia} onChange={hi} placeholder="Seleccionar" options={["Categoría A","Categoría B","Categoría B1","Categoría C","No aplica"]}/></div>
              </div>
              <div><label style={LC}>Habilidad de conducción</label><Select name="habilidad_conduccion" value={form.habilidad_conduccion} onChange={hi} placeholder="Seleccionar" options={["Nulas","Puedo conducir pero no lo hago bien.","Conduzco bien pero me falta práctica.","Me siento muy cómoda y segura."]}/></div>
            </>)}

            {/* Sección 5 */}
            {seccion===4 && (<>
              <div><label style={LC}>Descripción personal *</label><textarea name="bio" rows={5} value={form.bio||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Tu personalidad, valores, forma de ser..."/></div>
              <div><label style={LC}>Hobbies e intereses *</label><textarea name="hobbies" rows={4} value={form.hobbies||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Deportes, música, arte, viajes, cocina..."/></div>
            </>)}

            {/* Sección 6 */}
            {seccion===5 && (<>
              <div><label style={LC}>¿Por qué quieres ser au pair? *</label><textarea name="por_que_au_pair" rows={6} value={form.por_que_au_pair||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Tus motivaciones, objetivos, qué esperas de la experiencia..."/></div>
            </>)}

            {/* Sección 7 */}
            {seccion===6 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div><label style={LC}>¿Enfermedad con medicamentos constantes? *</label><Select name="enfermedad_medicamentos" value={form.enfermedad_medicamentos} onChange={hi} placeholder="Seleccionar" options={["Si","No"]}/></div>
                <div><label style={LC}>¿Alergias a medicamentos?</label><Select name="alergia_medicamentos" value={form.alergia_medicamentos} onChange={hi} placeholder="Seleccionar" options={["Si","No"]}/></div>
                <div><label style={LC}>Dieta especial</label><Select name="dieta_especial" value={form.dieta_especial} onChange={hi} placeholder="Seleccionar" options={["Ninguna","Vegetariana","Vegana","Sin gluten","Sin lactosa","Otra"]}/></div>
                <div><label style={LC}>¿Fumadora?</label><Select name="fumadora" value={form.fumadora} onChange={hi} placeholder="Seleccionar" options={["No","Sí","Exfumadora"]}/></div>
                <div><label style={LC}>¿Aceptas mascotas?</label><Select name="acepta_mascotas" value={form.acepta_mascotas} onChange={hi} placeholder="Seleccionar" options={["Sí, todos","Sí, solo perros","Sí, solo gatos","No tengo preferencia","No"]}/></div>
              </div>
            </>)}

            {/* Sección 8 */}
            {seccion===7 && (<>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>Referencia 1</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={LC}>Nombre completo *</label><input name="referencia_1_nombre" value={form.referencia_1_nombre||""} onChange={hi} style={IC}/></div>
                  <div><label style={LC}>Relación</label><Select name="referencia_1_relacion" value={form.referencia_1_relacion} onChange={hi} placeholder="Seleccionar" options={["Empleador","Familiar","Profesor","Amigo","Otro"]}/></div>
                  <div><label style={LC}>Email *</label><input name="referencia_1_email" type="email" value={form.referencia_1_email||""} onChange={hi} style={IC}/></div>
                  <div><label style={LC}>Teléfono</label><input name="referencia_1_telefono" value={form.referencia_1_telefono||""} onChange={hi} style={IC}/></div>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>Referencia 2</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={LC}>Nombre completo</label><input name="referencia_2_nombre" value={form.referencia_2_nombre||""} onChange={hi} style={IC}/></div>
                  <div><label style={LC}>Relación</label><Select name="referencia_2_relacion" value={form.referencia_2_relacion} onChange={hi} placeholder="Seleccionar" options={["Empleador","Familiar","Profesor","Amigo","Otro"]}/></div>
                  <div><label style={LC}>Email</label><input name="referencia_2_email" type="email" value={form.referencia_2_email||""} onChange={hi} style={IC}/></div>
                  <div><label style={LC}>Teléfono</label><input name="referencia_2_telefono" value={form.referencia_2_telefono||""} onChange={hi} style={IC}/></div>
                </div>
              </div>
            </>)}

            {/* Sección 9 */}
            {seccion===8 && (<>
              <FotoUpload
                value={form.foto_url}
                onChange={async (base64) => {
                set("foto_url", base64);
                await fetch("/api/dashboard/foto", {
                 method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({ foto_url: base64 }),
                 });
                }}
                />
              <div>
                <label style={LC}>URL de tu video de presentación</label>
                <input name="video_presentacion_url" value={form.video_presentacion_url||""} onChange={hi} style={IC} placeholder="https://youtube.com/... o Google Drive..."/>
              </div>
            </>)}

            {/* Sección 10 */}
            {seccion===9 && (<>
              <div style={{ background:progreso>=80?"#d1fae5":progreso>=50?"#fef3c7":"#fce8ed", border:`1px solid ${progreso>=80?"#6ee7b7":progreso>=50?"#fde68a":"#f0b8c4"}`, borderRadius:16, padding:"20px" }}>
                <p style={{ fontSize:15, fontWeight:700, color:progreso>=80?"#065f46":progreso>=50?"#92400e":"#a0435f", margin:"0 0 8px" }}>
                  {progreso>=80?"🎉 ¡Tu perfil está casi listo!":progreso>=50?"⏳ Sigue completando tu perfil":progreso>0?"📝 Vas por buen camino":"👋 ¡Empecemos!"}
                </p>
                <p style={{ fontSize:13, color:progreso>=80?"#065f46":progreso>=50?"#92400e":"#a0435f", margin:"0 0 12px" }}>
                  {progreso>=80?"Completa las últimas secciones y Jenni revisará tu perfil para enviarlo a la agencia.":progreso>=50?"Faltan algunas secciones. ¡Ya estás más de la mitad!":"Completa todas las secciones para que Jenni pueda revisar tu perfil."}
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1, height:8, background:"rgba(255,255,255,.5)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${progreso}%`, background:progreso>=80?"#10b981":"#a0435f", borderRadius:99, transition:"width .5s" }}/>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:progreso>=80?"#065f46":"#a0435f" }}>{progreso}%</span>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:0 }}>Secciones faltantes:</p>
                {SECCIONES.filter(s => !seccionCompleta(s, form)).map(s => (
                  <button key={s.id} onClick={() => setSeccion(s.n-1)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:12, border:"1.5px solid #f0dde2", background:"#fff", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                    <span style={{ fontSize:12, color:"#9ca3af", width:20 }}>{s.n}.</span>
                    <span style={{ fontSize:13, color:"#374151" }}>{s.titulo}</span>
                    <ChevronRightIcon size={13} style={{ color:"#9ca3af", marginLeft:"auto" }}/>
                  </button>
                ))}
              </div>
            </>)}
          </div>

          {/* Navegación */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20 }}>
            <button onClick={() => setSeccion(s=>Math.max(0,s-1))} disabled={seccion===0}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:12, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a7080", fontSize:13, fontWeight:600, cursor:seccion===0?"not-allowed":"pointer", opacity:seccion===0?.4:1, fontFamily:"inherit" }}>
              <ChevronLeftIcon size={15}/> Anterior
            </button>
            <div style={{ display:"flex", gap:5, alignItems:"center" }}>
              {SECCIONES.map((_,i) => (
                <button key={i} onClick={()=>setSeccion(i)}
                  style={{ width:i===seccion?28:10, height:10, borderRadius:99, border:"none", cursor:"pointer", transition:"all .2s", background:i===seccion?"#a0435f":"#f0dde2" }}/>
              ))}
            </div>
            <button onClick={() => guardar(true)} disabled={guardando}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 22px", borderRadius:12, border:"none", background:"#a0435f", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              {guardando?"Guardando…":seccion<SECCIONES.length-1?<>Guardar y continuar <ChevronRightIcon size={14}/></>:"Finalizar ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}