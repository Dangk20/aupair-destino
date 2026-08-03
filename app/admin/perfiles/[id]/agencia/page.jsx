"use client";
// app/admin/perfiles/[id]/agencia/page.jsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeftIcon, ChevronRightIcon, SaveIcon, CheckCircle2Icon,
  ClockIcon, CircleIcon, DownloadIcon, EyeIcon,
} from "lucide-react";

/* ══ Secciones ═══════════════════════════════════════════════════════════ */
const SECCIONES = [
  { id:"personal",      n:1,  titulo:"Información personal",         campos:["estatura","peso","nacionalidad","religion","estado_civil","tiene_pasaporte","numero_pasaporte","tiene_visa_j1"] },
  { id:"experiencia",   n:2,  titulo:"Experiencia con niños",         campos:["exp_ninos_externos","horas_exp_ninos","horas_childcare","experiencia_cuidado"] },
  { id:"educacion",     n:3,  titulo:"Educación y cursos",            campos:["situacion_actual","carrera_graduada","curso_primeros_auxilios"] },
  { id:"conduccion",   n:4,  titulo:"Conducción (Driving Profile)",   campos:["licencia_conduccion","tipo_licencia","habilidad_conduccion"] },
  { id:"personalidad",  n:5,  titulo:"Personalidad e intereses",      campos:["bio","hobbies"] },
  { id:"preguntas",     n:6,  titulo:"Preguntas para familias",       campos:["por_que_au_pair"] },
  { id:"salud",         n:7,  titulo:"Salud y evaluación médica",     campos:["enfermedad_medicamentos","alergia_medicamentos","dieta_especial","fumadora","acepta_mascotas"] },
  { id:"referencias",   n:8,  titulo:"Referencias",                   campos:["referencia_1_nombre","referencia_1_email"] },
  { id:"fotos",         n:9,  titulo:"Fotos y videos del perfil",     campos:["foto_url","video_presentacion_url"] },
  { id:"estado",        n:10, titulo:"Estado del perfil",             campos:["estado_agencia","notas_agencia"] },
];

function seccionCompleta(sec, form) {
  return sec.campos.filter(c => form[c] && String(form[c]).trim() !== "").length >= Math.ceil(sec.campos.length / 2);
}

function calcProgresoAgencia(form) {
  const comp = SECCIONES.filter(s => seccionCompleta(s, form)).length;
  return Math.round((comp / SECCIONES.length) * 100);
}

/* ══ Estilos ══════════════════════════════════════════════════════════════ */
const IC = { width:"100%", border:"1.5px solid #E5E7EB", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#4A2A38", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const LC = { fontSize:11, fontWeight:600, color:"#6B7280", display:"block", marginBottom:6 };

function Select({ name, value, onChange, options, placeholder="" }) {
  return (
    <select name={name} value={value||""} onChange={onChange} style={IC}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function AdminPerfilAgenciaPage() {
  const { id }  = useParams();
  const router  = useRouter();

  const [form,      setForm]      = useState({});
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [seccion,   setSeccion]   = useState(0);

  useEffect(() => {
    fetch(`/api/admin/perfiles/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.perfil) {
          const p = { ...d.perfil };
          if (p.fecha_nacimiento) p.fecha_nacimiento = p.fecha_nacimiento.split("T")[0];
          if (p.fecha_vencimiento_pasaporte) p.fecha_vencimiento_pasaporte = p.fecha_vencimiento_pasaporte.split("T")[0];
          setForm(p);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const hi  = e => set(e.target.name, e.target.value);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const guardar = async (goNext=false) => {
    setGuardando(true);
    // Calcular progreso antes de guardar
    const progreso = calcProgresoAgencia(form);
    const payload  = { ...form, progreso_agencia: progreso };

    const res = await fetch(`/api/admin/perfiles/${id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setForm(f => ({ ...f, progreso_agencia: progreso }));
      showToast("✓ Guardado correctamente");
      if (goNext && seccion < SECCIONES.length-1) setSeccion(s => s+1);
      if (goNext && seccion === SECCIONES.length-1) router.push("/admin/perfiles");
    } else showToast(data.error||"Error al guardar","error");
    setGuardando(false);
  };

  const exportPDF = () => {
    const w = window.open("","_blank");
    const edad = form.fecha_nacimiento ? Math.floor((new Date()-new Date(form.fecha_nacimiento))/(365.25*24*60*60*1000)) : "";
    w.document.write(`<html><head><title>Perfil Agencia — ${form.nombre} ${form.apellido}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;font-size:13px;color:#4A2A38}
    h1{color:#A0435F;font-size:22px;margin-bottom:4px}h2{color:#A0435F;font-size:14px;border-bottom:1px solid #F5E1E7;padding-bottom:6px;margin:20px 0 10px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.campo{margin-bottom:8px}
    .lbl{font-size:10px;font-weight:700;color:#9C8790;text-transform:uppercase;letter-spacing:.6px}.val{font-size:13px}</style></head><body>
    <h1>${form.nombre} ${form.apellido}${edad?` · ${edad} años`:""}</h1>
    <p style="color:#9C8790;margin:0 0 4px">${form.email||""}</p>
    <p style="color:#9C8790;margin:0 0 16px">${form.ciudad||""} ${form.nacionalidad?`· ${form.nacionalidad}`:""}</p>
    <h2>Información personal</h2>
    <div class="grid">
      <div class="campo"><p class="lbl">Estatura</p><p class="val">${form.estatura||"—"}</p></div>
      <div class="campo"><p class="lbl">Peso</p><p class="val">${form.peso||"—"}</p></div>
      <div class="campo"><p class="lbl">Nacionalidad</p><p class="val">${form.nacionalidad||"—"}</p></div>
      <div class="campo"><p class="lbl">Religión</p><p class="val">${form.religion||"—"}</p></div>
      <div class="campo"><p class="lbl">Estado civil</p><p class="val">${form.estado_civil||"—"}</p></div>
      <div class="campo"><p class="lbl">Pasaporte</p><p class="val">${form.tiene_pasaporte||"—"} ${form.numero_pasaporte?"— "+form.numero_pasaporte:""}</p></div>
      <div class="campo"><p class="lbl">Visa J-1</p><p class="val">${form.tiene_visa_j1||"—"}</p></div>
      <div class="campo"><p class="lbl">Nivel inglés</p><p class="val">${form.nivel_ingles||"—"}</p></div>
    </div>
    <h2>Experiencia con niños</h2>
    <div class="grid">
      <div class="campo"><p class="lbl">Experiencia externa</p><p class="val">${form.exp_ninos_externos||"—"}</p></div>
      <div class="campo"><p class="lbl">Horas exp.</p><p class="val">${form.horas_exp_ninos||"—"}</p></div>
      <div class="campo"><p class="lbl">Horas childcare</p><p class="val">${form.horas_childcare||0} h</p></div>
    </div>
    ${form.experiencia_cuidado?`<div class="campo"><p class="lbl">Detalle experiencia</p><p class="val">${form.experiencia_cuidado}</p></div>`:""}
    <h2>Educación</h2>
    <div class="grid">
      <div class="campo"><p class="lbl">Situación actual</p><p class="val">${form.situacion_actual||"—"}</p></div>
      <div class="campo"><p class="lbl">Carrera</p><p class="val">${form.carrera_graduada||"—"}</p></div>
      <div class="campo"><p class="lbl">Primeros auxilios</p><p class="val">${form.curso_primeros_auxilios||"—"}</p></div>
    </div>
    <h2>Salud</h2>
    <div class="grid">
      <div class="campo"><p class="lbl">Enfermedades</p><p class="val">${form.enfermedad_medicamentos||"—"}</p></div>
      <div class="campo"><p class="lbl">Alergias</p><p class="val">${form.alergia_medicamentos||"—"} ${form.detalle_alergias?"— "+form.detalle_alergias:""}</p></div>
      <div class="campo"><p class="lbl">Dieta especial</p><p class="val">${form.dieta_especial||"—"}</p></div>
      <div class="campo"><p class="lbl">Fumadora</p><p class="val">${form.fumadora||"—"}</p></div>
      <div class="campo"><p class="lbl">Acepta mascotas</p><p class="val">${form.acepta_mascotas||"—"}</p></div>
    </div>
    <h2>Referencias</h2>
    <div class="grid">
      <div class="campo"><p class="lbl">Referencia 1</p><p class="val">${form.referencia_1_nombre||"—"} — ${form.referencia_1_relacion||""}</p></div>
      <div class="campo"><p class="lbl">Contacto</p><p class="val">${form.referencia_1_email||""} ${form.referencia_1_telefono?"/ "+form.referencia_1_telefono:""}</p></div>
      <div class="campo"><p class="lbl">Referencia 2</p><p class="val">${form.referencia_2_nombre||"—"} — ${form.referencia_2_relacion||""}</p></div>
      <div class="campo"><p class="lbl">Contacto</p><p class="val">${form.referencia_2_email||""} ${form.referencia_2_telefono?"/ "+form.referencia_2_telefono:""}</p></div>
    </div>
    ${form.bio?`<h2>Personalidad</h2><p>${form.bio}</p>`:""}
    ${form.por_que_au_pair?`<h2>¿Por qué quiere ser au pair?</h2><p>${form.por_que_au_pair}</p>`:""}
    <p style="margin-top:30px;font-size:11px;color:#9C8790;border-top:1px solid #F5E1E7;padding-top:10px">
      Exportado el ${new Date().toLocaleDateString("es-CO")} — Destino Au Pair · Progreso: ${calcProgresoAgencia(form)}%
    </p></body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#FBF4F6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #C77D93", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const sec      = SECCIONES[seccion];
  const progreso = calcProgresoAgencia(form);
  const edad     = form.fecha_nacimiento ? Math.floor((new Date()-new Date(form.fecha_nacimiento))/(365.25*24*60*60*1000)) : null;

  return (
    <div style={{ minHeight:"100vh", background:"#F3F4F6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input:focus,textarea:focus,select:focus{border-color:#A0435F!important;box-shadow:0 0 0 3px rgba(160,67,95,.1);outline:none;}`}</style>

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:toast.tipo==="error"?"#C0392B":"#4A2A38", color:"#fff", padding:"12px 20px", borderRadius:14, fontSize:13, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E5E7EB", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, position:"sticky", top:0, zIndex:30 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => router.push("/admin/perfiles")}
            style={{ display:"flex", alignItems:"center", gap:6, color:"#6B7280", fontSize:13, border:"none", background:"none", cursor:"pointer", fontFamily:"inherit" }}>
            <ChevronLeftIcon size={14}/> Volver al listado
          </button>
        </div>
        {/* Breadcrumb */}
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#6B7280" }}>
          <span style={{ cursor:"pointer", color:"#A0435F" }} onClick={()=>router.push("/admin/perfiles")}>Perfiles</span>
          <span>›</span>
          <span>Perfil con la agencia</span>
          <span>›</span>
          <span style={{ color:"#A0435F", fontWeight:600 }}>Ver / Editar perfil</span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={exportPDF}
            style={{ display:"flex", alignItems:"center", gap:7, border:"1.5px solid #E5E7EB", background:"#fff", color:"#6B7280", fontSize:13, fontWeight:600, padding:"8px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>
            <DownloadIcon size={13}/> Exportar PDF
          </button>
          <button onClick={() => router.push(`/admin/perfiles/${id}`)}
            style={{ display:"flex", alignItems:"center", gap:7, border:"1.5px solid #E5E7EB", background:"#fff", color:"#6B7280", fontSize:13, fontWeight:600, padding:"8px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>
            <EyeIcon size={13}/> Ver evaluación
          </button>
          <button onClick={() => guardar(false)} disabled={guardando}
            style={{ display:"flex", alignItems:"center", gap:7, background:"#A0435F", color:"#fff", border:"none", fontSize:13, fontWeight:600, padding:"8px 20px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>
            {guardando
              ? <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>Guardando…</>
              : <><SaveIcon size={13}/> Guardar cambios</>}
            <ChevronRightIcon size={13} style={{ opacity:.6 }}/>
          </button>
        </div>
      </div>

      {/* ── PERFIL HEADER ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E5E7EB", padding:"20px 24px", display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
        {/* Foto */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ width:80, height:80, borderRadius:20, overflow:"hidden", border:"3px solid #F5E1E7", background:"#FCE8EE", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {form.foto_url
              ? <img src={form.foto_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}}/>
              : <span style={{ fontFamily:"Georgia,serif", fontSize:32, color:"#A0435F", fontWeight:700 }}>{form.nombre?.[0]||"?"}</span>}
          </div>
          <div style={{ position:"absolute", bottom:-6, right:-6, width:24, height:24, background:"#A0435F", borderRadius:"50%", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <span style={{ color:"#fff", fontSize:11 }}>✏️</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700, color:"#4A2A38", margin:0 }}>{form.nombre} {form.apellido}</h2>
            <span style={{ background:"#FCE8EE", color:"#A0435F", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>Perfil con la agencia</span>
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#6B7280" }}>{form.email}</span>
            {form.cedula && <span style={{ fontSize:12, color:"#6B7280" }}>📋 {form.cedula}</span>}
          </div>
          <div style={{ display:"flex", gap:12, marginTop:6, flexWrap:"wrap" }}>
            {form.ciudad && <span style={{ fontSize:12, color:"#6B7280" }}>📍 {form.ciudad}{form.pais?", "+form.pais:""}</span>}
            {form.fecha_nacimiento && <span style={{ fontSize:12, color:"#6B7280" }}>📅 {new Date(form.fecha_nacimiento).toLocaleDateString("es-CO")} ({edad} años)</span>}
            {form.nacionalidad && <span style={{ fontSize:12, color:"#6B7280" }}>🏳️ {form.nacionalidad}</span>}
          </div>
        </div>

        {/* Fechas */}
        <div style={{ flexShrink:0, textAlign:"right" }}>
          <p style={{ fontSize:11, color:"#9C8790", margin:"0 0 2px" }}>Fecha de registro</p>
          <p style={{ fontSize:13, fontWeight:600, color:"#4A2A38", margin:"0 0 8px" }}>
            {form.created_at ? new Date(form.created_at).toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"}) : "—"}
          </p>
          <p style={{ fontSize:11, color:"#9C8790", margin:"0 0 2px" }}>Última actualización</p>
          <p style={{ fontSize:13, color:"#6B7280", margin:0 }}>Hace unos momentos</p>
        </div>

        {/* Progreso */}
        <div style={{ background:"#FBF4F6", border:"1px solid #F5E1E7", borderRadius:16, padding:"14px 20px", flexShrink:0, minWidth:200 }}>
          <p style={{ fontSize:12, fontWeight:600, color:"#4A2A38", margin:"0 0 8px" }}>Progreso del perfil</p>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ flex:1, height:8, background:"#F5E1E7", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progreso}%`, background:progreso>=80?"#12A46B":"#A0435F", borderRadius:99, transition:"width .5s" }}/>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:progreso>=80?"#12A46B":"#A0435F", flexShrink:0 }}>{progreso}%</span>
          </div>
          <p style={{ fontSize:11, color:"#9C8790", margin:0 }}>
            {SECCIONES.filter(s=>seccionCompleta(s,form)).length} de {SECCIONES.length} secciones completadas
          </p>
          <button style={{ fontSize:11, color:"#A0435F", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:0, marginTop:4 }}>
            Ver checklist completo
          </button>
        </div>
      </div>

      {/* ── BODY 3 COLUMNAS ── */}
      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr 260px", gap:0, minHeight:"calc(100vh - 200px)" }}>

        {/* ── Sidebar izquierdo — secciones ── */}
        <div style={{ borderRight:"1px solid #E5E7EB", padding:"20px 12px", background:"#fff", position:"sticky", top:64, height:"fit-content" }}>
          {SECCIONES.map((s,i) => {
            const completa = seccionCompleta(s, form);
            const active   = i === seccion;
            return (
              <button key={s.id} onClick={() => setSeccion(i)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:12, border:"none", cursor:"pointer", textAlign:"left", width:"100%", marginBottom:3, fontFamily:"inherit", transition:"all .12s",
                  background: active ? "#FCE8EE" : "transparent",
                }}>
                {/* Número / icono */}
                <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700,
                  background: completa ? "#E6F9F0" : active ? "#FCE8EE" : "#F3F4F6",
                  color: completa ? "#12A46B" : active ? "#A0435F" : "#6B7280",
                }}>
                  {completa ? <CheckCircle2Icon size={15} style={{ color:"#12A46B" }}/> : s.n}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight: active?700:500, color: active?"#A0435F":completa?"#12A46B":"#6B7280", margin:0, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.titulo}</p>
                  <p style={{ fontSize:10, color: completa?"#12A46B":"#C9A9B4", margin:0 }}>{completa?"Completada":"Pendiente"}</p>
                </div>
              </button>
            );
          })}

          {/* Notas internas */}
          <div style={{ marginTop:20, padding:"14px 12px", background:"#F3F4F6", borderRadius:12, border:"1px solid #E5E7EB" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#6B7280", margin:"0 0 4px" }}>Notas internas de la agencia</p>
            <p style={{ fontSize:11, color:"#C9A9B4", margin:"0 0 10px" }}>Notas visibles solo para el equipo.</p>
            <textarea name="notas_agencia" value={form.notas_agencia||""} onChange={hi} rows={3}
              placeholder="Agregar nota..."
              style={{ width:"100%", border:"1.5px solid #E5E7EB", borderRadius:8, padding:"8px 10px", fontSize:12, color:"#4A2A38", fontFamily:"inherit", resize:"vertical", boxSizing:"border-box", outline:"none" }}/>
          </div>
        </div>

        {/* ── Contenido central ── */}
        <div style={{ padding:"24px", background:"#F3F4F6" }}>
          {/* Header sección */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"#FCE8EE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#A0435F" }}>
                {sec.n}
              </div>
              <div>
                <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"#4A2A38", margin:0 }}>{sec.titulo}</h2>
                <p style={{ fontSize:12, color:"#C9A9B4", margin:0 }}>Cuéntanos más sobre la aplicante.</p>
              </div>
            </div>
          </div>

          {/* Campos */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E5E7EB", padding:"24px", display:"flex", flexDirection:"column", gap:20 }}>

            {/* ── 1: Información personal ── */}
            {seccion===0 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>Nombre completo *</label>
                  <input value={`${form.nombre||""} ${form.apellido||""}`} readOnly style={{ ...IC, background:"#F3F4F6", color:"#6B7280" }}/>
                </div>
                <div>
                  <label style={LC}>Fecha de nacimiento *</label>
                  <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento||""} onChange={hi} style={IC}/>
                </div>
                <div>
                  <label style={LC}>Edad</label>
                  <input value={edad ? `${edad} años` : "—"} readOnly style={{ ...IC, background:"#F3F4F6", color:"#6B7280" }}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>Ciudad de residencia *</label>
                  <input name="ciudad" value={form.ciudad||""} onChange={hi} style={IC} placeholder="Medellín, Antioquia"/>
                </div>
                <div>
                  <label style={LC}>Estatura *</label>
                  <input name="estatura" value={form.estatura||""} onChange={hi} style={IC} placeholder="1.65 m"/>
                </div>
                <div>
                  <label style={LC}>Peso *</label>
                  <input name="peso" value={form.peso||""} onChange={hi} style={IC} placeholder="55 kg"/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>Nacionalidad *</label>
                  <Select name="nacionalidad" value={form.nacionalidad} onChange={hi} placeholder="Seleccionar" options={["Colombiana","Venezolana","Ecuatoriana","Peruana","Mexicana","Otra"]}/>
                </div>
                <div>
                  <label style={LC}>Religión</label>
                  <Select name="religion" value={form.religion} onChange={hi} placeholder="Seleccionar" options={["Cristiana","Católica","Evangélica","Sin religión","Otra"]}/>
                </div>
                <div>
                  <label style={LC}>Estado civil</label>
                  <Select name="estado_civil" value={form.estado_civil} onChange={hi} placeholder="Seleccionar" options={["Soltera","Casada","Unión libre","Divorciada","Viuda"]}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>Nivel de inglés conversacional *</label>
                  <Select name="nivel_ingles" value={form.nivel_ingles} onChange={hi} placeholder="Seleccionar" options={["Ninguno","Básico","Intermedio","Avanzado"]}/>
                </div>
                <div>
                  <label style={LC}>¿Tienes licencia de conducción? *</label>
                  <Select name="licencia_conduccion" value={form.licencia_conduccion} onChange={hi} placeholder="Seleccionar" options={["Si","No","Está en proceso"]}/>
                </div>
                <div>
                  <label style={LC}>Tipo de licencia *</label>
                  <Select name="tipo_licencia" value={form.tipo_licencia} onChange={hi} placeholder="Seleccionar" options={["Categoría A","Categoría B","Categoría B1","Categoría C","No aplica"]}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>¿Tienes pasaporte? *</label>
                  <Select name="tiene_pasaporte" value={form.tiene_pasaporte} onChange={hi} placeholder="Seleccionar" options={["Sí","No","En trámite"]}/>
                </div>
                <div>
                  <label style={LC}>Número de pasaporte *</label>
                  <input name="numero_pasaporte" value={form.numero_pasaporte||""} onChange={hi} style={IC} placeholder="AR2456789"/>
                </div>
                <div>
                  <label style={LC}>Fecha de vencimiento *</label>
                  <input name="fecha_vencimiento_pasaporte" type="date" value={form.fecha_vencimiento_pasaporte||""} onChange={hi} style={IC}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>¿Tienes visa J-1? *</label>
                  <Select name="tiene_visa_j1" value={form.tiene_visa_j1} onChange={hi} placeholder="Seleccionar" options={["Sí","No, aún no","Sí, anterior","En trámite"]}/>
                </div>
                <div>
                  <label style={LC}>Número DS-2019</label>
                  <input name="numero_ds2019" value={form.numero_ds2019||""} onChange={hi} style={IC} placeholder="Ej: N1234567890"/>
                </div>
                <div>
                  <label style={LC}>Número de Sponsor</label>
                  <input name="numero_sponsor" value={form.numero_sponsor||""} onChange={hi} style={IC} placeholder="Ej: P1234567"/>
                </div>
              </div>
              <div style={{ background:"#FFF4EC", border:"1px solid #FFF4EC", borderRadius:12, padding:"12px 16px", display:"flex", gap:10 }}>
                <span style={{ fontSize:18 }}>📋</span>
                <p style={{ fontSize:12, color:"#E8853B", margin:0 }}>
                  Asegúrate de que toda la información sea correcta y esté actualizada. Esta información será visible para las familias anfitrionas cuando el <strong>perfil sea aprobado.</strong>
                </p>
              </div>
            </>)}

            {/* ── 2: Experiencia con niños ── */}
            {seccion===1 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>¿Tiene experiencia con niños externos? *</label>
                  <Select name="exp_ninos_externos" value={form.exp_ninos_externos} onChange={hi} placeholder="Seleccionar" options={["Si","No","La estoy haciendo"]}/>
                </div>
                <div>
                  <label style={LC}>Horas de experiencia *</label>
                  <Select name="horas_exp_ninos" value={form.horas_exp_ninos} onChange={hi} placeholder="Seleccionar" options={["Menos de 500 horas","Entre 501 y 800 horas","Entre 801 y 1500 horas","Más de 1500"]}/>
                </div>
                <div>
                  <label style={LC}>Horas childcare verificadas</label>
                  <input name="horas_childcare" type="number" min="0" value={form.horas_childcare||""} onChange={hi} style={IC} placeholder="0"/>
                </div>
              </div>
              <div>
                <label style={LC}>Describe tu experiencia con niños *</label>
                <textarea name="experiencia_cuidado" rows={5} value={form.experiencia_cuidado||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Describe detalladamente la experiencia: edades de los niños, actividades realizadas, duración, referencias..."/>
              </div>
            </>)}

            {/* ── 3: Educación ── */}
            {seccion===2 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>¿Qué hace actualmente? *</label>
                  <Select name="situacion_actual" value={form.situacion_actual} onChange={hi} placeholder="Seleccionar" options={["Estudio","Trabajo","No hago nada","Desempeño otra actividad"]}/>
                </div>
                <div>
                  <label style={LC}>Carrera / Profesión</label>
                  <input name="carrera_graduada" value={form.carrera_graduada||""} onChange={hi} style={IC} placeholder="Ej: Enfermería, Psicología..."/>
                </div>
                <div>
                  <label style={LC}>¿Tiene curso de primeros auxilios? *</label>
                  <Select name="curso_primeros_auxilios" value={form.curso_primeros_auxilios} onChange={hi} placeholder="Seleccionar" options={["Si","No","Lo estoy haciendo"]}/>
                </div>
              </div>
              {(form.situacion_actual==="Estudio") && (
                <div>
                  <label style={LC}>¿Qué estudia, semestre y duración?</label>
                  <textarea name="detalle_estudios" rows={3} value={form.detalle_estudios||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/>
                </div>
              )}
              {(form.situacion_actual==="Trabajo") && (
                <div>
                  <label style={LC}>¿Formal o informal? ¿Desde cuándo?</label>
                  <textarea name="detalle_trabajo" rows={3} value={form.detalle_trabajo||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/>
                </div>
              )}
            </>)}

            {/* ── 4: Conducción ── */}
            {seccion===3 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>¿Tiene licencia de conducción? *</label>
                  <Select name="licencia_conduccion" value={form.licencia_conduccion} onChange={hi} placeholder="Seleccionar" options={["Si","No","Está en proceso"]}/>
                </div>
                <div>
                  <label style={LC}>Tipo de licencia *</label>
                  <Select name="tipo_licencia" value={form.tipo_licencia} onChange={hi} placeholder="Seleccionar" options={["Categoría A","Categoría B","Categoría B1","Categoría C","No aplica"]}/>
                </div>
              </div>
              <div>
                <label style={LC}>Habilidad de conducción *</label>
                <Select name="habilidad_conduccion" value={form.habilidad_conduccion} onChange={hi} placeholder="Seleccionar" options={[
                  "Nulas","Puedo conducir pero no lo hago bien. Aún me siento insegura.",
                  "Conduzco bien pero aún me falta práctica.",
                  "Me siento muy cómoda y segura cuando conduzco."
                ]}/>
              </div>
            </>)}

            {/* ── 5: Personalidad ── */}
            {seccion===4 && (<>
              <div>
                <label style={LC}>Descripción personal *</label>
                <textarea name="bio" rows={5} value={form.bio||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Describe la personalidad, valores, forma de ser..."/>
              </div>
              <div>
                <label style={LC}>Hobbies e intereses *</label>
                <textarea name="hobbies" rows={4} value={form.hobbies||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Deportes, música, arte, viajes, cocina..."/>
              </div>
            </>)}

            {/* ── 6: Preguntas para familias ── */}
            {seccion===5 && (<>
              <div>
                <label style={LC}>¿Por qué quiere ser au pair? *</label>
                <textarea name="por_que_au_pair" rows={5} value={form.por_que_au_pair||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Motivaciones, objetivos, qué espera de la experiencia..."/>
              </div>
            </>)}

            {/* ── 7: Salud ── */}
            {seccion===6 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>¿Enfermedad que requiera medicamentos? *</label>
                  <Select name="enfermedad_medicamentos" value={form.enfermedad_medicamentos} onChange={hi} placeholder="Seleccionar" options={["Si","No"]}/>
                </div>
                {form.enfermedad_medicamentos==="Si" && (
                  <div>
                    <label style={LC}>Detalle</label>
                    <input name="detalle_enfermedad_med" value={form.detalle_enfermedad_med||""} onChange={hi} style={IC}/>
                  </div>
                )}
                <div>
                  <label style={LC}>¿Alergias a medicamentos? *</label>
                  <Select name="alergia_medicamentos" value={form.alergia_medicamentos} onChange={hi} placeholder="Seleccionar" options={["Si","No"]}/>
                </div>
                {form.alergia_medicamentos==="Si" && (
                  <div>
                    <label style={LC}>¿A cuáles?</label>
                    <input name="detalle_alergias" value={form.detalle_alergias||""} onChange={hi} style={IC}/>
                  </div>
                )}
                <div>
                  <label style={LC}>Dieta especial</label>
                  <Select name="dieta_especial" value={form.dieta_especial} onChange={hi} placeholder="Seleccionar" options={["Ninguna","Vegetariana","Vegana","Sin gluten","Sin lactosa","Otra"]}/>
                </div>
                <div>
                  <label style={LC}>¿Fumadora?</label>
                  <Select name="fumadora" value={form.fumadora} onChange={hi} placeholder="Seleccionar" options={["No","Sí","Exfumadora"]}/>
                </div>
                <div>
                  <label style={LC}>¿Acepta mascotas?</label>
                  <Select name="acepta_mascotas" value={form.acepta_mascotas} onChange={hi} placeholder="Seleccionar" options={["Sí, todos","Sí, solo perros","Sí, solo gatos","No tengo preferencia","No"]}/>
                </div>
              </div>
            </>)}

            {/* ── 8: Referencias ── */}
            {seccion===7 && (<>
              <div style={{ background:"#F3F4F6", borderRadius:12, padding:"16px", marginBottom:4 }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#6B7280", margin:"0 0 14px" }}>Referencia 1</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={LC}>Nombre completo *</label><input name="referencia_1_nombre" value={form.referencia_1_nombre||""} onChange={hi} style={IC}/></div>
                  <div><label style={LC}>Relación</label><Select name="referencia_1_relacion" value={form.referencia_1_relacion} onChange={hi} placeholder="Seleccionar" options={["Empleador","Familiar","Profesor","Amigo","Otro"]}/></div>
                  <div><label style={LC}>Email</label><input name="referencia_1_email" type="email" value={form.referencia_1_email||""} onChange={hi} style={IC}/></div>
                  <div><label style={LC}>Teléfono</label><input name="referencia_1_telefono" value={form.referencia_1_telefono||""} onChange={hi} style={IC}/></div>
                </div>
              </div>
              <div style={{ background:"#F3F4F6", borderRadius:12, padding:"16px" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#6B7280", margin:"0 0 14px" }}>Referencia 2</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={LC}>Nombre completo</label><input name="referencia_2_nombre" value={form.referencia_2_nombre||""} onChange={hi} style={IC}/></div>
                  <div><label style={LC}>Relación</label><Select name="referencia_2_relacion" value={form.referencia_2_relacion} onChange={hi} placeholder="Seleccionar" options={["Empleador","Familiar","Profesor","Amigo","Otro"]}/></div>
                  <div><label style={LC}>Email</label><input name="referencia_2_email" type="email" value={form.referencia_2_email||""} onChange={hi} style={IC}/></div>
                  <div><label style={LC}>Teléfono</label><input name="referencia_2_telefono" value={form.referencia_2_telefono||""} onChange={hi} style={IC}/></div>
                </div>
              </div>
            </>)}

            {/* ── 9: Fotos y videos ── */}
            {seccion===8 && (<>
              <div>
                <label style={LC}>URL foto de perfil principal *</label>
                <input name="foto_url" value={form.foto_url||""} onChange={hi} style={IC} placeholder="https://..."/>
                {form.foto_url && <img src={form.foto_url} alt="" onError={e=>{e.target.style.display="none"}} style={{ width:100, height:100, borderRadius:14, objectFit:"cover", marginTop:10, border:"2px solid #F5E1E7" }}/>}
              </div>
              <div>
                <label style={LC}>URL video de presentación</label>
                <input name="video_presentacion_url" value={form.video_presentacion_url||""} onChange={hi} style={IC} placeholder="https://youtube.com/... o https://drive.google.com/..."/>
                {form.video_presentacion_url && (
                  <a href={form.video_presentacion_url} target="_blank" rel="noopener noreferrer"
                    style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:8, color:"#A0435F", fontSize:12, textDecoration:"none", fontWeight:600 }}>
                    ▶ Ver video
                  </a>
                )}
              </div>
            </>)}

            {/* ── 10: Estado del perfil ── */}
            {seccion===9 && (<>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={LC}>Estado del perfil con la agencia *</label>
                  <Select name="estado_agencia" value={form.estado_agencia} onChange={hi} placeholder="Seleccionar" options={["En progreso","En revisión","Lista para agencia","Incompleto","Aprobada","Rechazada"]}/>
                </div>
                <div>
                  <label style={LC}>Progreso agencia (%)</label>
                  <input value={progreso} readOnly style={{ ...IC, background:"#F3F4F6", color:"#6B7280" }}/>
                </div>
              </div>
              <div style={{ background:progreso>=80?"#E6F9F0":progreso>=50?"#FFF4EC":"#FDECEC", border:`1px solid ${progreso>=80?"#6ee7b7":progreso>=50?"#FFF4EC":"#C0392B"}`, borderRadius:12, padding:"14px 16px" }}>
                <p style={{ fontSize:13, fontWeight:700, color:progreso>=80?"#12A46B":progreso>=50?"#E8853B":"#7f1d1d", margin:"0 0 4px" }}>
                  {progreso>=80?"✅ Perfil casi listo":progreso>=50?"⏳ Perfil en progreso":"❌ Perfil incompleto"}
                </p>
                <p style={{ fontSize:12, color:progreso>=80?"#12A46B":progreso>=50?"#E8853B":"#7f1d1d", margin:0 }}>
                  {progreso>=80?"El perfil está en buen estado para enviar a la agencia.":progreso>=50?"Faltan algunas secciones por completar.":"El perfil necesita más información antes de enviarlo."}
                </p>
              </div>
            </>)}
          </div>

          {/* ── Navegación inferior ── */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20 }}>
            <button onClick={() => guardar(false)}
              style={{ padding:"10px 20px", borderRadius:10, border:"1.5px solid #E5E7EB", background:"#fff", color:"#6B7280", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Guardar y salir
            </button>

            {/* Números de página */}
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <button onClick={()=>setSeccion(s=>Math.max(0,s-1))} disabled={seccion===0}
                style={{ width:28, height:28, borderRadius:8, border:"1px solid #E5E7EB", background:"#fff", cursor:seccion===0?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:seccion===0?.4:1 }}>
                <ChevronLeftIcon size={13} style={{ color:"#6B7280" }}/>
              </button>
              {SECCIONES.map((_,i) => (
                <button key={i} onClick={()=>setSeccion(i)}
                  style={{ width:32, height:32, borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:i===seccion?"#A0435F":"#fff", color:i===seccion?"#fff":"#6B7280", border:`1px solid ${i===seccion?"#A0435F":"#E5E7EB"}` }}>
                  {i+1}
                </button>
              ))}
              <button onClick={()=>setSeccion(s=>Math.min(SECCIONES.length-1,s+1))} disabled={seccion===SECCIONES.length-1}
                style={{ width:28, height:28, borderRadius:8, border:"1px solid #E5E7EB", background:"#fff", cursor:seccion===SECCIONES.length-1?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:seccion===SECCIONES.length-1?.4:1 }}>
                <ChevronRightIcon size={13} style={{ color:"#6B7280" }}/>
              </button>
            </div>

            <button onClick={() => guardar(true)} disabled={guardando}
              style={{ display:"flex", alignItems:"center", gap:7, background:"#A0435F", color:"#fff", border:"none", fontSize:13, fontWeight:600, padding:"10px 22px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>
              {guardando
                ? <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>Guardando…</>
                : seccion < SECCIONES.length-1 ? <>Guardar y continuar <ChevronRightIcon size={14}/></> : <>Finalizar ✓</>}
            </button>
          </div>
        </div>

        {/* ── Sidebar derecho — Checklist ── */}
        <div style={{ borderLeft:"1px solid #E5E7EB", padding:"20px 16px", background:"#fff", position:"sticky", top:64, height:"fit-content" }}>
          {/* Checklist */}
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#4A2A38", margin:"0 0 12px" }}>Checklist del perfil</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {SECCIONES.map((s,i) => {
                const completa = seccionCompleta(s, form);
                const active   = i === seccion;
                return (
                  <div key={s.id} onClick={() => setSeccion(i)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", borderRadius:10, cursor:"pointer", background:active?"#FBF4F6":"transparent", border:active?"1px solid #F5E1E7":"1px solid transparent", transition:"all .1s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                      <span style={{ fontSize:11, color:"#C9A9B4", flexShrink:0, width:16 }}>{s.n}.</span>
                      <span style={{ fontSize:12, color:"#6B7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.titulo}</span>
                    </div>
                    {completa
                      ? <span style={{ fontSize:11, color:"#12A46B", fontWeight:600, flexShrink:0 }}>Completado <CheckCircle2Icon size={12} style={{ display:"inline", verticalAlign:"middle" }}/></span>
                      : <span style={{ fontSize:11, color:"#C9A9B4", flexShrink:0 }}>Pendiente <CircleIcon size={12} style={{ display:"inline", verticalAlign:"middle", opacity:.5 }}/></span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estado actual */}
          <div style={{ background:"#FFF4EC", border:"1px solid #FFF4EC", borderRadius:12, padding:"14px", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#E8853B", flexShrink:0, display:"inline-block" }}/>
              <p style={{ fontSize:12, fontWeight:700, color:"#E8853B", margin:0 }}>
                {form.estado_agencia||"En progreso"}
              </p>
            </div>
            <p style={{ fontSize:11, color:"#E8853B", margin:0, lineHeight:1.5 }}>
              Tu perfil está en construcción. Completa todas las secciones para enviarlo a revisión.
            </p>
          </div>

          {/* Acciones rápidas */}
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"#4A2A38", margin:"0 0 10px" }}>Acciones rápidas</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[
                { emoji:"👁️", label:"Ver perfil como familia anfitriona" },
                { emoji:"⬇️", label:"Descargar perfil (borrador)" },
                { emoji:"🕐", label:"Historial de cambios" },
              ].map((a,i) => (
                <button key={i} onClick={i===1?exportPDF:undefined}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:10, border:"1px solid #E5E7EB", background:"#fff", cursor:"pointer", fontFamily:"inherit", textAlign:"left", width:"100%" }}>
                  <span style={{ fontSize:14 }}>{a.emoji}</span>
                  <span style={{ fontSize:12, color:"#6B7280" }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}