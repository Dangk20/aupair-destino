"use client";
// app/admin/perfiles/page.jsx

import { useEffect, useState, useRef } from "react";
import {
  SearchIcon, DownloadIcon, PlusIcon, EyeIcon, PencilIcon,
  XIcon, CheckIcon, FilterIcon, UserIcon, ChevronLeftIcon,
  ChevronRightIcon, MoreVerticalIcon, PrinterIcon, SaveIcon,
} from "lucide-react";

/* ══ helpers ══════════════════════════════════════════════════════════════ */
const ESTADO_CFG = {
  "Completo":          { bg:"#d1fae5", color:"#059669", dot:"#059669" },
  "Verificado":        { bg:"#d1fae5", color:"#059669", dot:"#059669" },
  "En revisión":       { bg:"#dbeafe", color:"#1d4ed8", dot:"#1d4ed8" },
  "Pendiente":         { bg:"#fef3c7", color:"#d97706", dot:"#d97706" },
  "Incompleto":        { bg:"#fee2e2", color:"#dc2626", dot:"#dc2626" },
  "Lista para agencia":{ bg:"#d1fae5", color:"#059669", dot:"#059669" },
  "En progreso":       { bg:"#fef3c7", color:"#d97706", dot:"#d97706" },
};

function EstadoBadge({ estado }) {
  const c = ESTADO_CFG[estado] || { bg:"#f3f4f6", color:"#6b7280", dot:"#9ca3af" };
  return (
    <span style={{ background:c.bg, color:c.color, fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, display:"inline-flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, flexShrink:0 }}/>
      {estado||"Sin estado"}
    </span>
  );
}

function BarraProgreso({ pct=0 }) {
  const color = pct>=80?"#059669":pct>=50?"#1d4ed8":pct>=25?"#d97706":"#dc2626";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:6, background:"#f0e8f0", borderRadius:99, overflow:"hidden", minWidth:60 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width .5s" }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, flexShrink:0 }}>{pct}%</span>
    </div>
  );
}

/* ══ Modal Ver / Editar perfil ════════════════════════════════════════════ */
const SECCIONES_ADMIN = [
  { id:"personal",    titulo:"Información personal",    emoji:"👤" },
  { id:"habilidades", titulo:"Requisitos y habilidades", emoji:"🔧" },
  { id:"situacion",   titulo:"Situación actual",         emoji:"💼" },
  { id:"salud",       titulo:"Salud",                    emoji:"❤️" },
  { id:"experiencia", titulo:"Experiencia con niños",    emoji:"👶" },
  { id:"visas",       titulo:"Visas y compromisos",      emoji:"📋" },
];

function Campo({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom:10 }}>
      <p style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", margin:"0 0 3px" }}>{label}</p>
      <p style={{ fontSize:13, color:"#1e1033", margin:0, lineHeight:1.5 }}>{value}</p>
    </div>
  );
}

function ModalPerfil({ perfil, onClose, onSave, modo }) {
  const [seccion, setSeccion] = useState(0);
  const [form, setForm]       = useState({ ...perfil });
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast]     = useState(null);
  const IC = { width:"100%", border:"1.5px solid #f0dde2", borderRadius:10, padding:"9px 12px", fontSize:13, color:"#1e1033", outline:"none", fontFamily:"inherit", boxSizing:"border-box", background:"#fff" };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const hi = e => set(e.target.name, e.target.value);

  const guardar = async () => {
    setGuardando(true);
    const res = await fetch(`/api/admin/perfiles/${perfil.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    if (res.ok) {
      setToast("✓ Guardado");
      setTimeout(() => { setToast(null); onSave(); onClose(); }, 1200);
    } else setToast("Error al guardar");
    setGuardando(false);
  };

  const exportPDF = () => {
    const w = window.open("","_blank");
    const edad = perfil.fecha_nacimiento ? Math.floor((new Date()-new Date(perfil.fecha_nacimiento))/(365.25*24*60*60*1000)) : "";
    w.document.write(`
      <html><head><title>Perfil ${perfil.nombre} ${perfil.apellido}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:30px;color:#1e1033;font-size:13px;}
        h1{font-size:22px;color:#a0435f;margin-bottom:4px;}
        h2{font-size:14px;color:#a0435f;border-bottom:1px solid #f0dde2;padding-bottom:6px;margin:20px 0 10px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .campo{margin-bottom:8px;}
        .lbl{font-size:10px;font-weight:700;color:#9a7080;text-transform:uppercase;letter-spacing:.6px;}
        .val{font-size:13px;color:#1e1033;}
        .badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;}
        @media print{body{padding:15px;}}
      </style></head><body>
      <h1>${perfil.nombre} ${perfil.apellido}${edad?` · ${edad} años`:""}</h1>
      <p style="color:#9a7080;margin:0 0 4px">${perfil.email}</p>
      <p style="color:#9a7080;margin:0 0 16px">${perfil.ciudad||""} ${perfil.pais?"· "+perfil.pais:""}</p>
      <span class="badge" style="background:${ESTADO_CFG[perfil.estado]?.bg||"#f3f4f6"};color:${ESTADO_CFG[perfil.estado]?.color||"#6b7280"}">${perfil.estado||"Pendiente"}</span>
      
      <h2>👤 Información personal</h2>
      <div class="grid">
        <div class="campo"><p class="lbl">Cédula</p><p class="val">${perfil.cedula||"—"}</p></div>
        <div class="campo"><p class="lbl">Teléfono</p><p class="val">${perfil.telefono||"—"}</p></div>
        <div class="campo"><p class="lbl">Fecha nacimiento</p><p class="val">${perfil.fecha_nacimiento?new Date(perfil.fecha_nacimiento).toLocaleDateString("es-CO"):"—"}</p></div>
        <div class="campo"><p class="lbl">País destino</p><p class="val">${perfil.pais_destino||"—"}</p></div>
      </div>
      ${perfil.bio?`<div class="campo"><p class="lbl">Bio</p><p class="val">${perfil.bio}</p></div>`:""}

      <h2>🔧 Requisitos y habilidades</h2>
      <div class="grid">
        <div class="campo"><p class="lbl">Nivel inglés</p><p class="val">${perfil.nivel_ingles||"—"}</p></div>
        <div class="campo"><p class="lbl">Licencia conducción</p><p class="val">${perfil.licencia_conduccion||"—"}</p></div>
        <div class="campo"><p class="lbl">Primeros auxilios</p><p class="val">${perfil.curso_primeros_auxilios||"—"}</p></div>
        <div class="campo"><p class="lbl">Habilidad conducción</p><p class="val">${perfil.habilidad_conduccion||"—"}</p></div>
      </div>

      <h2>💼 Situación actual</h2>
      <div class="campo"><p class="lbl">¿Qué hace actualmente?</p><p class="val">${perfil.situacion_actual||"—"}</p></div>
      ${perfil.carrera_graduada?`<div class="campo"><p class="lbl">Carrera graduada</p><p class="val">${perfil.carrera_graduada}</p></div>`:""}

      <h2>👶 Experiencia con niños</h2>
      <div class="grid">
        <div class="campo"><p class="lbl">Experiencia externa</p><p class="val">${perfil.exp_ninos_externos||"—"}</p></div>
        <div class="campo"><p class="lbl">Horas experiencia</p><p class="val">${perfil.horas_exp_ninos||"—"}</p></div>
      </div>

      <h2>❤️ Salud</h2>
      <div class="grid">
        <div class="campo"><p class="lbl">Enfermedad/medicamentos</p><p class="val">${perfil.enfermedad_medicamentos||"—"}</p></div>
        <div class="campo"><p class="lbl">Depresión/pánico</p><p class="val">${perfil.depresion_panico||"—"}</p></div>
        <div class="campo"><p class="lbl">Vacuna COVID</p><p class="val">${perfil.vacuna_covid||"—"} (${perfil.dosis_covid||"—"})</p></div>
        <div class="campo"><p class="lbl">Alergias</p><p class="val">${perfil.alergia_medicamentos||"—"}${perfil.detalle_alergias?" — "+perfil.detalle_alergias:""}</p></div>
      </div>

      <h2>📋 Visas y compromisos</h2>
      <div class="grid">
        <div class="campo"><p class="lbl">Visa negada</p><p class="val">${perfil.visa_negada||"—"}${perfil.detalle_visa_negada?" — "+perfil.detalle_visa_negada:""}</p></div>
        <div class="campo"><p class="lbl">Familiar en USA</p><p class="val">${perfil.familiar_residencia_usa||"—"}</p></div>
        <div class="campo"><p class="lbl">Entiende intercambio</p><p class="val">${perfil.entiende_intercambio_cultural||"—"}</p></div>
        <div class="campo"><p class="lbl">Participó en AP USA</p><p class="val">${perfil.participo_programa_ap||"—"}</p></div>
      </div>

      <p style="margin-top:30px;font-size:11px;color:#9a7080;border-top:1px solid #f0dde2;padding-top:10px">
        Exportado el ${new Date().toLocaleDateString("es-CO")} — Destino Au Pair
      </p>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
  };

  const sec = SECCIONES_ADMIN[seccion];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(30,16,51,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:"#1e1033", color:"#fff", padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600 }}>{toast}</div>}

      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:880, maxHeight:"92vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 25px 60px rgba(0,0,0,.2)" }}>
        {/* Header del modal */}
        <div style={{ height:4, background:"linear-gradient(90deg,#a0435f,#e8849a)" }}/>
        <div style={{ padding:"18px 24px", borderBottom:"1px solid #f0dde2", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:"#fce8ed", border:"2px solid #f0b8c4", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
            {perfil.foto_url
              ? <img src={perfil.foto_url} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : <UserIcon size={20} style={{ color:"#a0435f" }}/>}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#1e1033", margin:0 }}>
                {perfil.nombre} {perfil.apellido}
              </h2>
              <EstadoBadge estado={perfil.estado}/>
            </div>
            <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>{perfil.email} {perfil.ciudad?"· "+perfil.ciudad:""} {perfil.pais?"· "+perfil.pais:""}</p>
          </div>
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            <button onClick={exportPDF}
              style={{ display:"flex", alignItems:"center", gap:6, border:"1.5px solid #f0dde2", background:"#fff", color:"#a0435f", fontSize:12, fontWeight:600, padding:"8px 14px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>
              <PrinterIcon size={13}/> Exportar PDF
            </button>
            <button onClick={onClose}
              style={{ width:32, height:32, borderRadius:10, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <XIcon size={14} style={{ color:"#a0435f" }}/>
            </button>
          </div>
        </div>

        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          {/* Sidebar secciones */}
          <div style={{ width:200, borderRight:"1px solid #f0dde2", padding:"16px 10px", display:"flex", flexDirection:"column", gap:4, flexShrink:0, overflowY:"auto" }}>
            {/* Estado admin */}
            <div style={{ padding:"10px 12px", marginBottom:8, background:"#fff8f9", borderRadius:12, border:"1px solid #f0dde2" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", margin:"0 0 6px" }}>Estado</p>
              <select value={form.estado||"Pendiente"} onChange={e => set("estado", e.target.value)}
                style={{ width:"100%", border:"1.5px solid #f0dde2", borderRadius:8, padding:"6px 8px", fontSize:12, color:"#1e1033", outline:"none", fontFamily:"inherit", background:"#fff" }}>
                {["Pendiente","En revisión","Completo","Verificado","Incompleto"].map(e => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
            {SECCIONES_ADMIN.map((s, i) => (
              <button key={s.id} onClick={() => setSeccion(i)}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:12, border:"none", cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all .12s",
                  background: i===seccion ? "#fce8ed" : "transparent",
                  color: i===seccion ? "#a0435f" : "#6b4a54",
                  fontWeight: i===seccion ? 700 : 500,
                  fontSize: 12,
                }}>
                <span style={{ fontSize:14 }}>{s.emoji}</span>
                {s.titulo}
              </button>
            ))}
          </div>

          {/* Contenido sección */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 16px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>{sec.emoji}</span>{sec.titulo}
            </h3>

            {/* ── Sección 0: Personal ── */}
            {seccion === 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  {k:"cedula",label:"Cédula"},
                  {k:"telefono",label:"Teléfono"},
                  {k:"fecha_nacimiento",label:"Fecha nacimiento",type:"date"},
                  {k:"pais_destino",label:"País destino"},
                  {k:"ciudad",label:"Ciudad"},
                  {k:"pais",label:"País"},
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>{f.label}</label>
                    <input name={f.k} type={f.type||"text"} value={form[f.k]||""} onChange={hi} style={IC}/>
                  </div>
                ))}
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Bio</label>
                  <textarea name="bio" rows={3} value={form.bio||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/>
                </div>
              </div>
            )}

            {/* ── Sección 1: Habilidades ── */}
            {seccion === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  {k:"nivel_ingles",       label:"Nivel de inglés",         opts:["Ninguno","Básico","Intermedio","Avanzado"]},
                  {k:"licencia_conduccion",label:"Licencia de conducción",   opts:["Si","No","Está en proceso"]},
                  {k:"curso_primeros_auxilios",label:"Primeros auxilios",    opts:["Si","No","Lo estoy haciendo"]},
                  {k:"conoce_requisitos_26",label:"Conoce req. 26 años",     opts:["Si","No"]},
                  {k:"conoce_requisitos_18_20",label:"Conoce req. 18-20",   opts:["Si","No"]},
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>{f.label}</label>
                    <select name={f.k} value={form[f.k]||""} onChange={hi} style={IC}>
                      <option value="">— Seleccionar —</option>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Habilidad conducción</label>
                  <textarea name="habilidad_conduccion" rows={2} value={form.habilidad_conduccion||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/>
                </div>
              </div>
            )}

            {/* ── Sección 2: Situación ── */}
            {seccion === 2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Situación actual</label>
                  <select name="situacion_actual" value={form.situacion_actual||""} onChange={hi} style={IC}>
                    <option value="">— Seleccionar —</option>
                    {["Estudio","Trabajo","No hago nada","Desempeño otra actividad"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                {["detalle_otra_actividad","detalle_estudios","detalle_trabajo","detalle_sin_ocupacion"].map(k => (
                  form[k] ? (
                    <div key={k}>
                      <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>
                        {k.replace("detalle_","Detalle ").replace(/_/g," ")}
                      </label>
                      <textarea name={k} rows={3} value={form[k]||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/>
                    </div>
                  ) : null
                ))}
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Carrera graduada</label>
                  <input name="carrera_graduada" value={form.carrera_graduada||""} onChange={hi} style={IC}/>
                </div>
              </div>
            )}

            {/* ── Sección 3: Salud ── */}
            {seccion === 3 && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  {k:"enfermedad_medicamentos",label:"Enfermedad/medicamentos"},
                  {k:"enfermedad_grave",       label:"Enfermedad grave"},
                  {k:"depresion_panico",       label:"Depresión/pánico"},
                  {k:"trastorno_alimenticio",  label:"Trastorno alimenticio"},
                  {k:"autolesiones",           label:"Autolesiones"},
                  {k:"abuso_sustancias",       label:"Sustancias tóxicas"},
                  {k:"isotretinoina",          label:"Isotretinoina"},
                  {k:"condiciones_fisicas",    label:"Condiciones físicas"},
                  {k:"alergia_medicamentos",   label:"Alergias medicamentos"},
                  {k:"dosis_covid",            label:"Dosis COVID"},
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>{f.label}</label>
                    <select name={f.k} value={form[f.k]||""} onChange={hi} style={IC}>
                      <option value="">—</option>
                      {["Si","No","Lo estoy haciendo","Ninguna","Una","Dos","Más de dos"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Vacuna COVID</label>
                  <input name="vacuna_covid" value={form.vacuna_covid||""} onChange={hi} style={IC} placeholder="Pfizer, Moderna..."/>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Detalle salud mental</label>
                  <textarea name="detalle_salud_mental" rows={3} value={form.detalle_salud_mental||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/>
                </div>
              </div>
            )}

            {/* ── Sección 4: Experiencia ── */}
            {seccion === 4 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Experiencia con niños externos</label>
                  <select name="exp_ninos_externos" value={form.exp_ninos_externos||""} onChange={hi} style={IC}>
                    <option value="">—</option>
                    {["Si","No","La estoy haciendo"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Horas de experiencia</label>
                  <select name="horas_exp_ninos" value={form.horas_exp_ninos||""} onChange={hi} style={IC}>
                    <option value="">—</option>
                    {["Menos de 500 horas","Entre 501 y 800 horas","Entre 801 y 1500 horas","Más de 1500"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                {/* Campos agencia */}
                <div style={{ background:"#fff8f9", borderRadius:14, border:"1px solid #f0dde2", padding:16, marginTop:8 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#a0435f", margin:"0 0 12px", textTransform:"uppercase", letterSpacing:".6px" }}>Perfil con la agencia</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Horas childcare</label>
                      <input name="horas_childcare" type="number" min="0" value={form.horas_childcare||""} onChange={hi} style={IC}/>
                    </div>
                    <div>
                      <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Estado agencia</label>
                      <select name="estado_agencia" value={form.estado_agencia||"En progreso"} onChange={hi} style={IC}>
                        {["En progreso","En revisión","Lista para agencia","Incompleto"].map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Progreso agencia (%)</label>
                      <input name="progreso_agencia" type="number" min="0" max="100" value={form.progreso_agencia||0} onChange={hi} style={IC}/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Sección 5: Visas ── */}
            {seccion === 5 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  {k:"visa_negada",label:"Visa negada",opts:["Si","No"]},
                  {k:"familiar_residencia_usa",label:"Familiar con residencia USA",opts:["Si","No"]},
                  {k:"familiar_visa_estudio_usa",label:"Familiar con visa estudio USA",opts:["Si","No"]},
                  {k:"entiende_intercambio_cultural",label:"Entiende intercambio cultural",opts:["SI","No"]},
                  {k:"consciente_riesgo_familiar",label:"Consciente riesgo familiar",opts:["SI","No"]},
                  {k:"participo_programa_ap",label:"Participó en AP USA",opts:["Si","No"]},
                ].map(f=>(
                  <div key={f.k}>
                    <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>{f.label}</label>
                    <select name={f.k} value={form[f.k]||""} onChange={hi} style={IC}>
                      <option value="">—</option>
                      {f.opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 }}>Overstay en otro país</label>
                  <textarea name="overstay_otro_pais" rows={2} value={form.overstay_otro_pais||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Si no aplica, 'No'"/>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop:"1px solid #f0dde2", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff", flexShrink:0 }}>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setSeccion(Math.max(0, seccion-1))} disabled={seccion===0}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", borderRadius:10, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a7080", fontSize:12, fontWeight:600, cursor:seccion===0?"not-allowed":"pointer", opacity:seccion===0?.4:1, fontFamily:"inherit" }}>
              <ChevronLeftIcon size={13}/> Anterior
            </button>
            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              {SECCIONES_ADMIN.map((_,i) => (
                <button key={i} onClick={() => setSeccion(i)}
                  style={{ width:i===seccion?24:8, height:8, borderRadius:99, border:"none", cursor:"pointer", transition:"all .2s", background:i===seccion?"#a0435f":"#f0dde2" }}/>
              ))}
            </div>
            <button onClick={() => setSeccion(Math.min(SECCIONES_ADMIN.length-1, seccion+1))} disabled={seccion===SECCIONES_ADMIN.length-1}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", borderRadius:10, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a7080", fontSize:12, fontWeight:600, cursor:seccion===SECCIONES_ADMIN.length-1?"not-allowed":"pointer", opacity:seccion===SECCIONES_ADMIN.length-1?.4:1, fontFamily:"inherit" }}>
              Siguiente <ChevronRightIcon size={13}/>
            </button>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} style={{ padding:"9px 18px", borderRadius:10, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a7080", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Cancelar
            </button>
            <button onClick={guardar} disabled={guardando}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 20px", borderRadius:10, border:"none", background:"#a0435f", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              {guardando
                ? <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>Guardando…</>
                : <><SaveIcon size={13}/> Guardar cambios</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ PÁGINA PRINCIPAL ═════════════════════════════════════════════════════ */
export default function AdminPerfilesPage() {
  const [perfiles,    setPerfiles]    = useState([]);
  const [statsEval,   setStatsEval]   = useState(null);
  const [statsAgencia,setStatsAgencia]= useState(null);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState(1); // 1=evaluacion 2=agencia
  const [search,      setSearch]      = useState("");
  const [filtroEstado,setFiltroEstado]= useState("");
  const [filtroCiudad,setFiltroCiudad]= useState("");
  const [modalPerfil, setModalPerfil] = useState(null);
  const [toast,       setToast]       = useState(null);
  const [pagina,      setPagina]      = useState(1);
  const POR_PAG = 8;

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2500); };

  const cargar = async () => {
    setLoading(true);
    const params = new URLSearchParams({ q:search, estado:filtroEstado, ciudad:filtroCiudad });
    const res = await fetch(`/api/admin/perfiles?${params}`);
    const d   = await res.json();
    setPerfiles(d.perfiles || []);
    setStatsEval(d.stats_evaluacion || {});
    setStatsAgencia(d.stats_agencia || {});
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [search, filtroEstado, filtroCiudad]);

  const exportarLista = () => {
    const lineas = [
      "Nombre|Email|Ciudad|Estado|Progreso|Inglés|Licencia|Horas|Registro",
      ...visibles.map(p =>
        `${p.nombre} ${p.apellido}|${p.email}|${p.ciudad}|${p.estado}|${p.progreso}%|${p.nivel_ingles||"—"}|${p.licencia_conduccion||"—"}|${p.horas_exp_ninos||"—"}|${new Date(p.created_at).toLocaleDateString("es-CO")}`
      )
    ].join("\n");
    const a = Object.assign(document.createElement("a"),{
      href:`data:text/plain;charset=utf-8,${encodeURIComponent(lineas)}`, download:"perfiles.txt"
    });
    a.click();
    showToast("Lista exportada ✓");
  };

  // Filtrar por tab
  const lista = tab === 1
    ? perfiles
    : perfiles.filter(p => p.tiene_acceso);

  const totalPags = Math.ceil(lista.length / POR_PAG);
  const visibles  = lista.slice((pagina-1)*POR_PAG, pagina*POR_PAG);

  const se = statsEval   || {};
  const sa = statsAgencia|| {};

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .row-h:hover{background:#fff8f9!important;}`}</style>

      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:3000, background:"#1e1033", color:"#fff", padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600 }}>{toast}</div>}

      <div style={{ padding:"28px 32px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16 }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:"#1e1033", margin:0 }}>Perfiles</h1>
            <p style={{ fontSize:13, color:"#9a7080", margin:"4px 0 0" }}>Gestiona y revisa todos los perfiles registrados</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={exportarLista}
              style={{ display:"flex", alignItems:"center", gap:7, border:"1.5px solid #f0dde2", background:"#fff", color:"#2d1a22", fontSize:13, fontWeight:600, padding:"10px 18px", borderRadius:12, cursor:"pointer", fontFamily:"inherit" }}>
              <DownloadIcon size={14}/> Exportar
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display:"flex", gap:0, marginBottom:24, background:"#fff", borderRadius:14, border:"1px solid #f0dde2", overflow:"hidden", width:"fit-content" }}>
          {[
            { id:1, label:"1. Evaluación de Perfil",  icon:"🗂️" },
            { id:2, label:"2. Perfil con la agencia",  icon:"🏢" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setPagina(1); }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", transition:"all .12s",
                background: tab===t.id ? "#fce8ed" : "#fff",
                color:      tab===t.id ? "#a0435f"  : "#9a7080",
                borderBottom: tab===t.id ? "2px solid #a0435f" : "2px solid transparent",
              }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ── Stats ── */}
        {tab === 1 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:24 }}>
            {[
              { label:"Perfiles totales",     val:se.total,       icon:"👥", color:"#1e1033", bg:"#f5f0ff" },
              { label:"Completos",            val:se.completos,   icon:"✅", color:"#059669", bg:"#d1fae5" },
              { label:"En revisión",          val:se.en_revision, icon:"🔍", color:"#1d4ed8", bg:"#dbeafe" },
              { label:"Pendientes",           val:se.pendientes,  icon:"⏳", color:"#d97706", bg:"#fef3c7" },
              { label:"Incompletos",          val:se.incompletos, icon:"⚠️", color:"#dc2626", bg:"#fee2e2" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:16, border:"1px solid #f0dde2", padding:"16px 18px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
                  <p style={{ fontSize:11, color:"#9a7080", margin:0, lineHeight:1.3 }}>{s.label}</p>
                </div>
                <p style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:s.color, margin:0 }}>{s.val??0}</p>
                <p style={{ fontSize:10, color:"#9a7080", margin:"4px 0 0" }}>
                  {s.val&&se.total ? `${Math.round((s.val/se.total)*100)}% del total` : "0% del total"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:24 }}>
            {[
              { label:"Total perfiles",       val:sa.total,       icon:"👥", color:"#1e1033", bg:"#f5f0ff" },
              { label:"Listos para agencia",  val:sa.listos,      icon:"🏆", color:"#059669", bg:"#d1fae5" },
              { label:"En progreso",          val:sa.en_progreso, icon:"⏳", color:"#d97706", bg:"#fef3c7" },
              { label:"En revisión",          val:sa.en_revision, icon:"🔍", color:"#1d4ed8", bg:"#dbeafe" },
              { label:"Incompletos",          val:sa.incompletos, icon:"⚠️", color:"#dc2626", bg:"#fee2e2" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:16, border:"1px solid #f0dde2", padding:"16px 18px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
                  <p style={{ fontSize:11, color:"#9a7080", margin:0, lineHeight:1.3 }}>{s.label}</p>
                </div>
                <p style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:s.color, margin:0 }}>{s.val??0}</p>
                <p style={{ fontSize:10, color:"#9a7080", margin:"4px 0 0" }}>
                  {s.val&&sa.total ? `${Math.round((s.val/sa.total)*100)}% del total` : "0% del total"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filtros ── */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0dde2", padding:"14px 18px", marginBottom:20, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <SearchIcon size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#c0909a" }}/>
            <input type="text" placeholder="Buscar por nombre, correo o país..." value={search}
              onChange={e => { setSearch(e.target.value); setPagina(1); }}
              style={{ width:"100%", paddingLeft:36, paddingRight:12, height:38, border:"1.5px solid #f0dde2", borderRadius:10, fontSize:13, color:"#1e1033", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
          </div>
          <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}
            style={{ height:38, border:"1.5px solid #f0dde2", borderRadius:10, padding:"0 12px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", cursor:"pointer" }}>
            <option value="">Todos los estados</option>
            {tab===1
              ? ["Completo","Verificado","En revisión","Pendiente","Incompleto"].map(e=><option key={e}>{e}</option>)
              : ["Lista para agencia","En progreso","En revisión","Incompleto"].map(e=><option key={e}>{e}</option>)
            }
          </select>
          <input type="text" placeholder="Todas las ubicaciones" value={filtroCiudad}
            onChange={e => { setFiltroCiudad(e.target.value); setPagina(1); }}
            style={{ height:38, border:"1.5px solid #f0dde2", borderRadius:10, padding:"0 12px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", width:180 }}/>
          {(filtroEstado||filtroCiudad||search) && (
            <button onClick={() => { setSearch(""); setFiltroEstado(""); setFiltroCiudad(""); }}
              style={{ padding:"8px 14px", border:"1.5px solid #f0dde2", borderRadius:10, background:"#fff", color:"#9a7080", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Limpiar
            </button>
          )}
        </div>

        {/* ── Tabla ── */}
        <div style={{ background:"#fff", borderRadius:20, border:"1px solid #f0dde2", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>

          {/* Headers Tab 1 */}
          {tab === 1 && (
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 1.2fr 100px", gap:12, padding:"12px 20px", borderBottom:"1px solid #fce8ed", background:"#fff8f9" }}>
              {["Usuario","Ubicación","Estado","Progreso","Última actividad","Acciones"].map(h => (
                <p key={h} style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".7px", margin:0 }}>{h}</p>
              ))}
            </div>
          )}

          {/* Headers Tab 2 */}
          {tab === 2 && (
            <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr .8fr .8fr 1.1fr 1.2fr 1fr 1fr 100px", gap:10, padding:"12px 20px", borderBottom:"1px solid #fce8ed", background:"#fff8f9" }}>
              {["Aplicante","Ciudad","Inglés","Licencia","Horas childcare","Progreso agencia","Estado","Registro","Acciones"].map(h => (
                <p key={h} style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".7px", margin:0 }}>{h}</p>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ padding:"48px", display:"flex", justifyContent:"center" }}>
              <div style={{ width:32, height:32, border:"2px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
            </div>
          ) : visibles.length === 0 ? (
            <p style={{ textAlign:"center", padding:"48px", fontSize:13, color:"#9a7080" }}>No se encontraron perfiles.</p>
          ) : (
            <div>
              {visibles.map((p, i) => {
                const edad = p.fecha_nacimiento ? Math.floor((new Date()-new Date(p.fecha_nacimiento))/(365.25*24*60*60*1000)) : null;
                return tab === 1 ? (
                  /* ── Fila Tab 1 ── */
                  <div key={p.id} className="row-h"
                    style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 1.2fr 100px", gap:12, padding:"14px 20px", borderBottom:i<visibles.length-1?"1px solid #fff0f3":"none", alignItems:"center", background:"#fff" }}>
                    {/* Usuario */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                      <div style={{ width:38, height:38, borderRadius:12, background:"#fce8ed", border:"2px solid #f0b8c4", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {p.foto_url ? <img src={p.foto_url} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ color:"#a0435f", fontWeight:700, fontFamily:"Georgia,serif" }}>{p.nombre?.[0]}</span>}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nombre} {p.apellido}</p>
                        <p style={{ fontSize:11, color:"#9a7080", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.email}</p>
                      </div>
                    </div>
                    {/* Ubicación */}
                    <p style={{ fontSize:12, color:"#6b4a54", margin:0 }}>📍 {p.ciudad||"—"}{p.pais?", "+p.pais:""}</p>
                    {/* Estado */}
                    <EstadoBadge estado={p.estado}/>
                    {/* Progreso */}
                    <BarraProgreso pct={p.progreso}/>
                    {/* Última actividad */}
                    <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>{p.ultima_actividad}</p>
                    {/* Acciones */}
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => setModalPerfil(p)}
                        style={{ width:30, height:30, borderRadius:9, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                        title="Ver y editar perfil">
                        <EyeIcon size={13} style={{ color:"#a0435f" }}/>
                      </button>
                      <button onClick={() => setModalPerfil(p)}
                        style={{ width:30, height:30, borderRadius:9, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                        title="Editar">
                        <PencilIcon size={13} style={{ color:"#a0435f" }}/>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Fila Tab 2 ── */
                  <div key={p.id} className="row-h"
                    style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr .8fr .8fr 1.1fr 1.2fr 1fr 1fr 100px", gap:10, padding:"14px 20px", borderBottom:i<visibles.length-1?"1px solid #fff0f3":"none", alignItems:"center", background:"#fff" }}>
                    {/* Aplicante */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                      <div style={{ width:38, height:38, borderRadius:12, background:"#fce8ed", border:"2px solid #f0b8c4", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {p.foto_url ? <img src={p.foto_url} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ color:"#a0435f", fontWeight:700, fontFamily:"Georgia,serif" }}>{p.nombre?.[0]}</span>}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nombre} {p.apellido}</p>
                        <p style={{ fontSize:11, color:"#9a7080", margin:0 }}>{p.email}</p>
                        {p.cedula && <p style={{ fontSize:10, color:"#c0909a", margin:0 }}>{p.cedula}</p>}
                      </div>
                    </div>
                    {/* Ciudad */}
                    <p style={{ fontSize:12, color:"#6b4a54", margin:0 }}>📍 {p.ciudad||"—"}</p>
                    {/* Inglés */}
                    {p.nivel_ingles
                      ? <span style={{ background:"#e8f4fd", color:"#1d4ed8", fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:99, whiteSpace:"nowrap" }}>{p.nivel_ingles}</span>
                      : <span style={{ color:"#c0909a", fontSize:12 }}>—</span>}
                    {/* Licencia */}
                    {p.licencia_conduccion === "Si"
                      ? <span style={{ background:"#d1fae5", color:"#059669", fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:99 }}>Sí</span>
                      : p.licencia_conduccion === "No"
                      ? <span style={{ background:"#fee2e2", color:"#dc2626", fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:99 }}>No</span>
                      : <span style={{ background:"#fef3c7", color:"#d97706", fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:99 }}>En proceso</span>}
                    {/* Horas childcare */}
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>{p.horas_childcare||0} h</p>
                      <p style={{ fontSize:10, color:
                        (p.horas_childcare||0)>1500?"#059669":(p.horas_childcare||0)>800?"#d97706":"#dc2626",
                        margin:0, fontWeight:600
                      }}>
                        {(p.horas_childcare||0)>1500?"Más de 1500 h":(p.horas_childcare||0)>800?"Entre 801 y 1500 h":(p.horas_childcare||0)>500?"Entre 501 y 800 h":"Menos de 500 h"}
                      </p>
                    </div>
                    {/* Progreso agencia */}
                    <BarraProgreso pct={p.progreso_agencia||0}/>
                    {/* Estado agencia */}
                    <EstadoBadge estado={p.estado_agencia||"En progreso"}/>
                    {/* Registro */}
                    <div>
                      <p style={{ fontSize:12, color:"#1e1033", margin:0 }}>{new Date(p.created_at).toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"})}</p>
                      <p style={{ fontSize:10, color:"#9a7080", margin:0 }}>{p.ultima_actividad}</p>
                    </div>
                    {/* Acciones */}
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => setModalPerfil(p)}
                        style={{ width:30, height:30, borderRadius:9, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <EyeIcon size={13} style={{ color:"#a0435f" }}/>
                      </button>
                      <button onClick={() => setModalPerfil(p)}
                        style={{ width:30, height:30, borderRadius:9, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <PencilIcon size={13} style={{ color:"#a0435f" }}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          <div style={{ padding:"14px 20px", borderTop:"1px solid #fce8ed", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>
              Mostrando {Math.min((pagina-1)*POR_PAG+1, lista.length)} a {Math.min(pagina*POR_PAG, lista.length)} de {lista.length} perfiles
            </p>
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={() => setPagina(p => Math.max(1,p-1))}
                style={{ width:30, height:30, borderRadius:8, border:"1px solid #f0dde2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ChevronLeftIcon size={13} style={{ color:"#9a7080" }}/>
              </button>
              {Array.from({ length:Math.min(totalPags,5) }, (_,i) => i+1).map(n => (
                <button key={n} onClick={() => setPagina(n)}
                  style={{ width:30, height:30, borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:n===pagina?"#a0435f":"#fff", color:n===pagina?"#fff":"#6b7280" }}>
                  {n}
                </button>
              ))}
              {totalPags > 5 && <span style={{ display:"flex", alignItems:"center", fontSize:12, color:"#9a7080", padding:"0 4px" }}>...</span>}
              {totalPags > 5 && (
                <button onClick={() => setPagina(totalPags)}
                  style={{ width:30, height:30, borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:pagina===totalPags?"#a0435f":"#fff", color:pagina===totalPags?"#fff":"#6b7280" }}>
                  {totalPags}
                </button>
              )}
              <button onClick={() => setPagina(p => Math.min(totalPags,p+1))}
                style={{ width:30, height:30, borderRadius:8, border:"1px solid #f0dde2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ChevronRightIcon size={13} style={{ color:"#9a7080" }}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal perfil ── */}
      {modalPerfil && (
        <ModalPerfil
          perfil={modalPerfil}
          onClose={() => setModalPerfil(null)}
          onSave={() => { cargar(); showToast("Perfil actualizado ✓"); }}
        />
      )}
    </div>
  );
}