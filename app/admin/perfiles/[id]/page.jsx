"use client";
// app/admin/perfiles/[id]/page.jsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeftIcon, ChevronRightIcon, SaveIcon,
  UserIcon, WrenchIcon, BriefcaseIcon, HeartIcon,
  BabyIcon, FileCheckIcon,
  // ← nuevos para documentos
  CheckCircle2Icon, XCircleIcon, ClockIcon,
  EyeIcon, Trash2Icon, MessageSquareIcon, FileTextIcon, ImageIcon,
} from "lucide-react";

const SECCIONES = [
  { id:"personal",    titulo:"Información personal",     emoji:"👤", icon:UserIcon,      color:"#ec4899", bg:"#fce7f3" },
  { id:"habilidades", titulo:"Requisitos y habilidades",  emoji:"🔧", icon:WrenchIcon,    color:"#7c3aed", bg:"#ede9fe" },
  { id:"situacion",   titulo:"Situación actual",          emoji:"💼", icon:BriefcaseIcon, color:"#d97706", bg:"#fef3c7" },
  { id:"salud",       titulo:"Salud",                     emoji:"❤️", icon:HeartIcon,     color:"#ef4444", bg:"#fee2e2" },
  { id:"experiencia", titulo:"Experiencia con niños",     emoji:"👶", icon:BabyIcon,      color:"#10b981", bg:"#d1fae5" },
  { id:"visas",       titulo:"Visas y compromisos",       emoji:"📋", icon:FileCheckIcon, color:"#1d4ed8", bg:"#dbeafe" },
];

const CAMPOS_PROGRESO = [
  "cedula","telefono","fecha_nacimiento","ciudad","pais",
  "nivel_ingles","licencia_conduccion","curso_primeros_auxilios",
  "situacion_actual","exp_ninos_externos","horas_exp_ninos",
  "visa_negada","entiende_intercambio_cultural","consciente_riesgo_familiar",
  "enfermedad_medicamentos","depresion_panico",
];

function calcProgreso(form) {
  const llenos = CAMPOS_PROGRESO.filter(c => form[c] && String(form[c]).trim() !== "").length;
  return Math.round((llenos / CAMPOS_PROGRESO.length) * 100);
}

const IC = {
  width:"100%", border:"1.5px solid #f0dde2", borderRadius:12,
  padding:"10px 14px", fontSize:13, color:"#1e1033", background:"#fff",
  outline:"none", fontFamily:"inherit", boxSizing:"border-box",
};
const LC = {
  fontSize:10, fontWeight:700, color:"#6b4a54", textTransform:"uppercase",
  letterSpacing:".7px", display:"block", marginBottom:6,
};

function Radio({ name, options, value, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
      {options.map(opt => (
        <label key={opt} onClick={() => onChange(name, opt)}
          style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <div style={{
            width:20, height:20, borderRadius:"50%", flexShrink:0,
            border:`2px solid ${value===opt?"#a0435f":"#f0dde2"}`,
            background:value===opt?"#a0435f":"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all .12s",
          }}>
            {value===opt && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>}
          </div>
          <span style={{ fontSize:13, color:"#1e1033", lineHeight:1.4 }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

/* ══ Tab Documentos ══════════════════════════════════════════════════════ */
const ESTADO_DOC = {
  aprobado:  { bg:"#d1fae5", color:"#059669", label:"Aprobado",   icon:CheckCircle2Icon },
  pendiente: { bg:"#fef3c7", color:"#d97706", label:"En revisión", icon:ClockIcon        },
  rechazado: { bg:"#fee2e2", color:"#dc2626", label:"Rechazado",  icon:XCircleIcon       },
};

function TabDocumentos({ userId }) {
  const [docs,          setDocs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [editando,      setEditando]      = useState(null);
  const [notaTemp,      setNotaTemp]      = useState("");
  const [guardando,     setGuardando]     = useState(false);
  const [toast,         setToast]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = () => {
    setLoading(true);
    fetch(`/api/admin/perfiles/${userId}/documentos`)
      .then(r => r.json())
      .then(d => { setDocs(d.docs||[]); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [userId]);

  const actualizarEstado = async (docId, estado) => {
    setGuardando(true);
    const res = await fetch(`/api/admin/perfiles/${userId}/documentos`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ doc_id:docId, estado }),
    });
    if (res.ok) { showToast(`✓ Documento ${estado}`); cargar(); }
    else showToast("Error al actualizar","error");
    setGuardando(false);
  };

  const guardarNota = async (docId) => {
    setGuardando(true);
    const res = await fetch(`/api/admin/perfiles/${userId}/documentos`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ doc_id:docId, nota_admin:notaTemp }),
    });
    if (res.ok) { showToast("✓ Nota guardada"); setEditando(null); cargar(); }
    else showToast("Error","error");
    setGuardando(false);
  };

  const eliminar = async (docId) => {
    const res = await fetch(`/api/admin/perfiles/${userId}/documentos?doc_id=${docId}`, { method:"DELETE" });
    if (res.ok) { showToast("Eliminado"); setConfirmDelete(null); cargar(); }
    else showToast("Error","error");
  };

  if (loading) return (
    <div style={{ padding:"48px", display:"flex", justifyContent:"center" }}>
      <div style={{ width:32, height:32, border:"2px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
    </div>
  );

  if (docs.length === 0) return (
    <div style={{ padding:"56px 24px", textAlign:"center" }}>
      <div style={{ fontSize:52, marginBottom:14 }}>📂</div>
      <p style={{ fontSize:15, fontWeight:600, color:"#1e1033", margin:"0 0 6px" }}>Sin documentos subidos</p>
      <p style={{ fontSize:13, color:"#9a7080", margin:0 }}>Esta aplicante aún no ha subido documentos.</p>
    </div>
  );

  const aprobados  = docs.filter(d => d.estado==="aprobado").length;
  const pendientes = docs.filter(d => d.estado==="pendiente").length;
  const rechazados = docs.filter(d => d.estado==="rechazado").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:3000, background:toast.tipo==="error"?"#dc2626":"#1e1033", color:"#fff", padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600 }}>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"Total",       val:docs.length,  color:"#1e1033", bg:"#f5f0ff" },
          { label:"Aprobados",   val:aprobados,    color:"#059669", bg:"#d1fae5" },
          { label:"En revisión", val:pendientes,   color:"#d97706", bg:"#fef3c7" },
          { label:"Rechazados",  val:rechazados,   color:"#dc2626", bg:"#fee2e2" },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, borderRadius:14, padding:"14px 16px", textAlign:"center" }}>
            <p style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:700, color:s.color, margin:0 }}>{s.val}</p>
            <p style={{ fontSize:11, color:s.color, margin:0, fontWeight:600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div style={{ background:"#fff", borderRadius:20, border:"1px solid #f0dde2", overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #fce8ed", background:"#fff8f9" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#2d1a22", margin:0 }}>
            {docs.length} documento{docs.length!==1?"s":""} subido{docs.length!==1?"s":""}
          </p>
        </div>

        {docs.map((doc, i) => {
          const ext   = doc.nombre?.split(".").pop()?.toUpperCase() || "";
          const isImg = ["JPG","JPEG","PNG","GIF","WEBP"].includes(ext);
          const isPDF = ext === "PDF";
          const cfg   = ESTADO_DOC[doc.estado||"pendiente"];
          const EstIcon = cfg.icon;
          const enEdit  = editando === doc.id;

          return (
            <div key={doc.id} style={{ padding:"18px 20px", borderBottom:i<docs.length-1?"1px solid #fff0f3":"none" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>

                {/* Ícono tipo */}
                <div style={{ width:48, height:48, borderRadius:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background: isPDF?"#fce7f3":isImg?"#dbeafe":"#f3f4f6",
                }}>
                  {isPDF
                    ? <FileTextIcon size={22} style={{ color:"#a0435f" }}/>
                    : isImg
                    ? <ImageIcon size={22} style={{ color:"#1d4ed8" }}/>
                    : <FileTextIcon size={22} style={{ color:"#6b7280" }}/>}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                    <p style={{ fontSize:14, fontWeight:600, color:"#1e1033", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:280 }}>
                      {doc.nombre}
                    </p>
                    <span style={{ background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99, display:"inline-flex", alignItems:"center", gap:4 }}>
                      <EstIcon size={11}/>{cfg.label}
                    </span>
                    <span style={{ fontSize:10, color:"#9a7080", background:"#f5f0ff", padding:"2px 8px", borderRadius:99 }}>
                      {doc.tipo_doc}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:12 }}>
                    <span style={{ fontSize:11, color:"#9a7080" }}>📎 {doc.tamano_kb ? `${doc.tamano_kb} KB` : "—"}</span>
                    <span style={{ fontSize:11, color:"#9a7080" }}>📅 {doc.created_at ? new Date(doc.created_at).toLocaleDateString("es-CO") : "—"}</span>
                  </div>
                  {/* Nota admin existente */}
                  {doc.nota_admin && !enEdit && (
                    <div style={{ marginTop:8, background:"#fef3c7", border:"1px solid #fde68a", borderRadius:8, padding:"8px 12px" }}>
                      <p style={{ fontSize:11, color:"#92400e", margin:0 }}>💬 <strong>Nota:</strong> {doc.nota_admin}</p>
                    </div>
                  )}
                  {/* Editor nota */}
                  {enEdit && (
                    <div style={{ marginTop:10 }}>
                      <textarea
                        value={notaTemp} onChange={e=>setNotaTemp(e.target.value)}
                        placeholder="Nota para la aplicante (ella la verá en su dashboard)..."
                        rows={3} autoFocus
                        style={{ width:"100%", border:"1.5px solid #f0dde2", borderRadius:10, padding:"9px 12px", fontSize:12, color:"#1e1033", fontFamily:"inherit", resize:"vertical", boxSizing:"border-box", outline:"none" }}/>
                      <div style={{ display:"flex", gap:8, marginTop:8 }}>
                        <button onClick={() => guardarNota(doc.id)} disabled={guardando}
                          style={{ padding:"7px 16px", borderRadius:10, border:"none", background:"#a0435f", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                          {guardando?"Guardando…":"Guardar nota"}
                        </button>
                        <button onClick={() => setEditando(null)}
                          style={{ padding:"7px 14px", borderRadius:10, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a7080", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div style={{ display:"flex", gap:6, flexShrink:0, alignItems:"flex-start" }}>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" title="Ver documento"
                      style={{ width:34, height:34, borderRadius:10, background:"#f5f0ff", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                      <EyeIcon size={15} style={{ color:"#7c3aed" }}/>
                    </a>
                  )}
                  <button onClick={() => { setEditando(enEdit?null:doc.id); setNotaTemp(doc.nota_admin||""); }}
                    title="Agregar nota"
                    style={{ width:34, height:34, borderRadius:10, background:doc.nota_admin?"#fef3c7":"#f3f4f6", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <MessageSquareIcon size={15} style={{ color:doc.nota_admin?"#d97706":"#9a7080" }}/>
                  </button>
                  <button onClick={() => actualizarEstado(doc.id,"aprobado")} disabled={guardando||doc.estado==="aprobado"}
                    title="Aprobar"
                    style={{ width:34, height:34, borderRadius:10, background:doc.estado==="aprobado"?"#d1fae5":"#fff", border:`1.5px solid ${doc.estado==="aprobado"?"#6ee7b7":"#e5e7eb"}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:doc.estado==="aprobado"?.5:1 }}>
                    <CheckCircle2Icon size={15} style={{ color:"#059669" }}/>
                  </button>
                  <button onClick={() => actualizarEstado(doc.id,"rechazado")} disabled={guardando||doc.estado==="rechazado"}
                    title="Rechazar"
                    style={{ width:34, height:34, borderRadius:10, background:doc.estado==="rechazado"?"#fee2e2":"#fff", border:`1.5px solid ${doc.estado==="rechazado"?"#fca5a5":"#e5e7eb"}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:doc.estado==="rechazado"?.5:1 }}>
                    <XCircleIcon size={15} style={{ color:"#dc2626" }}/>
                  </button>
                  {confirmDelete===doc.id ? (
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={() => eliminar(doc.id)}
                        style={{ padding:"6px 10px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                        Sí
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(doc.id)} title="Eliminar"
                      style={{ width:34, height:34, borderRadius:10, background:"#fff", border:"1.5px solid #fee2e2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Trash2Icon size={14} style={{ color:"#dc2626" }}/>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function AdminPerfilIdPage() {
  const { id }  = useParams();
  const router  = useRouter();

  const [form,      setForm]      = useState({});
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [seccion,   setSeccion]   = useState(0);
  const [tab,       setTab]       = useState("evaluacion"); // ← NUEVO

  useEffect(() => {
    fetch(`/api/admin/perfiles/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.perfil) {
          const p = { ...d.perfil };
          if (p.fecha_nacimiento) p.fecha_nacimiento = p.fecha_nacimiento.split("T")[0];
          setForm(p);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const hi  = e => set(e.target.name, e.target.value);

  const showToast = (msg, tipo="ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const guardar = async (goNext = false) => {
    setGuardando(true);
    const res = await fetch(`/api/admin/perfiles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      showToast("✓ Guardado correctamente");
      if (goNext && seccion < SECCIONES.length - 1) setSeccion(s => s + 1);
      if (goNext && seccion === SECCIONES.length - 1) router.push("/admin/perfiles");
    } else {
      showToast(data.error || "Error al guardar", "error");
    }
    setGuardando(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!form.id) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
      <p style={{ color:"#9a7080", fontSize:14 }}>Perfil no encontrado.</p>
      <Link href="/admin/perfiles" style={{ color:"#a0435f", fontSize:13, textDecoration:"none", fontWeight:600 }}>← Volver a perfiles</Link>
    </div>
  );

  const sec      = SECCIONES[seccion];
  const Icon     = sec.icon;
  const progreso = calcProgreso(form);
  const edad     = form.fecha_nacimiento
    ? Math.floor((new Date() - new Date(form.fecha_nacimiento)) / (365.25*24*60*60*1000))
    : null;

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus,textarea:focus,select:focus{border-color:#a0435f!important;box-shadow:0 0 0 3px rgba(160,67,95,.1);}
      `}</style>

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:toast.tipo==="error"?"#dc2626":"#1e1033", color:"#fff", padding:"12px 20px", borderRadius:14, fontSize:13, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #f0dde2", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link href="/admin/perfiles"
            style={{ display:"flex", alignItems:"center", gap:6, color:"#9a7080", textDecoration:"none", fontSize:13, border:"1px solid #f0dde2", padding:"7px 12px", borderRadius:10 }}>
            <ChevronLeftIcon size={14}/> Perfiles
          </Link>
          <span style={{ color:"#f0dde2" }}>›</span>
          <span style={{ fontSize:13, color:"#a0435f", fontWeight:600 }}>{form.nombre} {form.apellido}</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, maxWidth:320 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, color:"#9a7080" }}>Progreso del perfil</span>
              <span style={{ fontSize:11, fontWeight:700, color:"#a0435f" }}>{progreso}% completado</span>
            </div>
            <div style={{ height:6, background:"#f0dde2", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progreso}%`, background:"linear-gradient(90deg,#a0435f,#e8849a)", borderRadius:99, transition:"width .5s" }}/>
            </div>
          </div>
          {tab==="evaluacion" && (
            <span style={{ fontSize:11, color:"#9a7080", flexShrink:0, whiteSpace:"nowrap" }}>{seccion+1} de {SECCIONES.length} páginas</span>
          )}
        </div>

        <div style={{ display:"flex", gap:10, flexShrink:0 }}>
          <Link href={`/admin/perfiles/${id}/agencia`}
            style={{ display:"flex", alignItems:"center", gap:6, border:"1.5px solid #f0dde2", background:"#fff", color:"#2d1a22", fontSize:13, fontWeight:600, padding:"9px 16px", borderRadius:10, textDecoration:"none" }}>
            🏢 Perfil agencia
          </Link>
          <button onClick={() => router.push("/admin/perfiles")}
            style={{ padding:"9px 18px", borderRadius:10, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a7080", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Cancelar
          </button>
          {tab==="evaluacion" && (
            <button onClick={() => guardar(false)} disabled={guardando}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:10, border:"none", background:"#a0435f", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              {guardando
                ? <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>Guardando…</>
                : <><SaveIcon size={13}/> Guardar cambios</>}
            </button>
          )}
        </div>
      </div>

      {/* ── HERO con foto grande ── */}
      <div style={{ background:"linear-gradient(135deg,#2d1a22 0%,#a0435f 100%)", padding:"32px 32px 40px", display:"flex", alignItems:"flex-end", gap:28, flexWrap:"wrap", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,.04)" }}/>
        <div style={{ position:"absolute", bottom:-60, right:80, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.03)" }}/>

        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ width:120, height:120, borderRadius:28, overflow:"hidden", border:"4px solid rgba(255,255,255,.25)", background:"#fce8ed", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 12px 32px rgba(0,0,0,.3)" }}>
            {form.foto_url
              ? <img src={form.foto_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}}/>
              : <span style={{ fontFamily:"Georgia,serif", fontSize:48, color:"rgba(255,255,255,.8)", fontWeight:700 }}>{form.nombre?.[0]||"?"}</span>}
          </div>
          <div style={{ position:"absolute", bottom:-10, right:-10, width:36, height:36, borderRadius:"50%", background:progreso>=90?"#10b981":progreso>=50?"#d97706":"#9ca3af", border:"3px solid #2d1a22", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:9, fontWeight:800, color:"#fff" }}>{progreso}%</span>
          </div>
        </div>

        <div style={{ flex:1, minWidth:0, paddingBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
            <span style={{ background:progreso>=90?"#10b981":progreso>=50?"#d97706":"#6b7280", color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99, textTransform:"uppercase", letterSpacing:".5px" }}>
              {progreso>=90?"Completo":progreso>=50?"En revisión":progreso>0?"Incompleto":"Pendiente"}
            </span>
            {form.tiene_acceso
              ? <span style={{ background:"rgba(16,185,129,.25)", color:"#a7f3d0", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>✓ Con acceso al programa</span>
              : <span style={{ background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.5)", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>Sin acceso</span>}
          </div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:700, color:"#fff", margin:"0 0 4px", lineHeight:1.2 }}>
            {form.nombre} {form.apellido}
            {edad ? <span style={{ fontSize:17, fontWeight:400, opacity:.65, marginLeft:10 }}>{edad} años</span> : null}
          </h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.7)", margin:"0 0 12px" }}>{form.email}</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {form.ciudad && <span style={{ background:"rgba(255,255,255,.12)", color:"rgba(255,255,255,.85)", fontSize:12, fontWeight:500, padding:"4px 12px", borderRadius:99 }}>📍 {form.ciudad}{form.pais?`, ${form.pais}`:""}</span>}
            {form.nivel_ingles && <span style={{ background:"rgba(255,255,255,.12)", color:"rgba(255,255,255,.85)", fontSize:12, fontWeight:500, padding:"4px 12px", borderRadius:99 }}>🌐 Inglés {form.nivel_ingles}</span>}
            {form.licencia_conduccion==="Si" && <span style={{ background:"rgba(255,255,255,.12)", color:"rgba(255,255,255,.85)", fontSize:12, fontWeight:500, padding:"4px 12px", borderRadius:99 }}>🚗 Licencia</span>}
            {form.exp_ninos_externos==="Si" && <span style={{ background:"rgba(255,255,255,.12)", color:"rgba(255,255,255,.85)", fontSize:12, fontWeight:500, padding:"4px 12px", borderRadius:99 }}>👶 {form.horas_exp_ninos||"Exp. con niños"}</span>}
          </div>
        </div>

        <div style={{ flexShrink:0, textAlign:"right" }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,.45)", textTransform:"uppercase", letterSpacing:".6px", margin:"0 0 3px" }}>Registro</p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.85)", fontWeight:600, margin:"0 0 14px" }}>
            {form.created_at ? new Date(form.created_at).toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"}) : "—"}
          </p>
          <p style={{ fontSize:10, color:"rgba(255,255,255,.45)", textTransform:"uppercase", letterSpacing:".6px", margin:"0 0 6px" }}>Estado admin</p>
          <select value={form.estado_perfil||"Pendiente"} onChange={e => set("estado_perfil", e.target.value)}
            style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)", borderRadius:10, padding:"7px 12px", fontSize:12, color:"#fff", outline:"none", fontFamily:"inherit", cursor:"pointer", minWidth:140 }}>
            {["Pendiente","En revisión","Completo","Verificado","Incompleto"].map(e => (
              <option key={e} style={{ color:"#1e1033", background:"#fff" }}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TABS ← NUEVO ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #f0dde2", padding:"0 28px", display:"flex", gap:0 }}>
        {[
          { id:"evaluacion", emoji:"🗂️", label:"Evaluación de Perfil" },
          { id:"documentos", emoji:"📎", label:"Documentos" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:"14px 22px", border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", transition:"all .12s",
              color:     tab===t.id ? "#a0435f" : "#9a7080",
              borderBottom: tab===t.id ? "2px solid #a0435f" : "2px solid transparent",
            }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 28px 60px" }}>

        {/* ═══ TAB DOCUMENTOS ═══ */}
        {tab==="documentos" && <TabDocumentos userId={id}/>}

        {/* ═══ TAB EVALUACIÓN ═══ */}
        {tab==="evaluacion" && (
          <div style={{ display:"flex", gap:20 }}>

            {/* Sidebar */}
            <div style={{ width:220, flexShrink:0 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".8px", margin:"0 0 10px" }}>Secciones</p>
              {SECCIONES.map((s,i) => {
                const SIcon  = s.icon;
                const active = i === seccion;
                return (
                  <button key={s.id} onClick={() => setSeccion(i)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:14, border:"none", cursor:"pointer", textAlign:"left", width:"100%", marginBottom:4, fontFamily:"inherit", transition:"all .12s",
                      background:active ? s.bg : "transparent",
                      boxShadow:active ? `0 0 0 1.5px ${s.color}` : "none",
                    }}>
                    <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:active?s.bg:"#f3f4f6" }}>
                      <SIcon size={14} style={{ color:active?s.color:"#9ca3af" }}/>
                    </div>
                    <p style={{ fontSize:11.5, fontWeight:active?700:500, color:active?s.color:"#555", margin:0 }}>{s.titulo}</p>
                  </button>
                );
              })}
            </div>

            {/* Formulario */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ background:`linear-gradient(135deg,${sec.color}15,${sec.bg})`, borderRadius:20, border:`1px solid ${sec.color}30`, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:sec.bg, border:`2px solid ${sec.color}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={22} style={{ color:sec.color }}/>
                </div>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:sec.color, textTransform:"uppercase", letterSpacing:".7px", margin:"0 0 2px" }}>Sección {seccion+1} de {SECCIONES.length}</p>
                  <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"#1e1033", margin:0 }}>{sec.titulo}</h2>
                </div>
              </div>

              <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:"28px", display:"flex", flexDirection:"column", gap:20 }}>

                {/* ── 0: Personal ── */}
                {seccion===0 && (<>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <div><label style={LC}>Cédula</label><input name="cedula" value={form.cedula||""} onChange={hi} style={IC} placeholder="1234567890"/></div>
                    <div><label style={LC}>Teléfono</label><input name="telefono" value={form.telefono||""} onChange={hi} style={IC} placeholder="+57 300 0000000"/></div>
                    <div><label style={LC}>Fecha de nacimiento</label><input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento||""} onChange={hi} style={IC}/></div>
                    <div><label style={LC}>País destino</label><input name="pais_destino" value={form.pais_destino||""} onChange={hi} style={IC} placeholder="Estados Unidos"/></div>
                    <div><label style={LC}>Ciudad</label><input name="ciudad" value={form.ciudad||""} onChange={hi} style={IC}/></div>
                    <div><label style={LC}>País</label><input name="pais" value={form.pais||""} onChange={hi} style={IC}/></div>
                  </div>
                  <div>
                    <label style={LC}>URL foto de perfil</label>
                    <input name="foto_url" value={form.foto_url?.startsWith("data:")?"[Imagen subida ✓]":form.foto_url||""} onChange={hi} style={IC} placeholder="https://..." readOnly={form.foto_url?.startsWith("data:")}/>
                    {form.foto_url && <img src={form.foto_url} alt="" onError={e=>{e.target.style.display="none"}} style={{ width:80, height:80, borderRadius:12, objectFit:"cover", marginTop:8, border:"2px solid #f0dde2" }}/>}
                  </div>
                  <div><label style={LC}>Descripción personal</label><textarea name="bio" rows={4} value={form.bio||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Descripción de la aplicante..."/></div>
                </>)}

                {/* ── 1: Habilidades ── */}
                {seccion===1 && (<>
                  {[
                    {k:"conoce_requisitos_26",    label:"¿Conoce requisitos para 26 años?",    opts:["Si","No"]},
                    {k:"conoce_requisitos_18_20", label:"¿Conoce requisitos para 18-20 años?", opts:["Si","No"]},
                    {k:"curso_primeros_auxilios", label:"¿Curso de primeros auxilios?",         opts:["Si","No","Lo estoy haciendo"]},
                    {k:"nivel_ingles",            label:"Nivel de inglés conversacional",        opts:["Ninguno","Básico","Intermedio","Avanzado"]},
                    {k:"licencia_conduccion",     label:"¿Tiene licencia de conducción?",        opts:["Si","No","Está en proceso","No, pero puede obtenerla en menos de un mes"]},
                  ].map(f => (
                    <div key={f.k}><label style={LC}>{f.label}</label><Radio name={f.k} options={f.opts} value={form[f.k]||""} onChange={set}/></div>
                  ))}
                  <div><label style={LC}>Habilidad de conducción</label><textarea name="habilidad_conduccion" rows={2} value={form.habilidad_conduccion||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/></div>
                </>)}

                {/* ── 2: Situación ── */}
                {seccion===2 && (<>
                  <div><label style={LC}>¿Qué hace actualmente?</label><Radio name="situacion_actual" options={["Estudio","Trabajo","No hago nada","Desempeño otra actividad"]} value={form.situacion_actual||""} onChange={set}/></div>
                  {form.situacion_actual==="Desempeño otra actividad" && <div><label style={LC}>Explica con detalles</label><textarea name="detalle_otra_actividad" rows={3} value={form.detalle_otra_actividad||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/></div>}
                  {form.situacion_actual==="Estudio" && <div><label style={LC}>¿Qué estudia, semestre y duración?</label><textarea name="detalle_estudios" rows={3} value={form.detalle_estudios||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/></div>}
                  {form.situacion_actual==="Trabajo" && <div><label style={LC}>¿Formal o informal? ¿Desde cuándo?</label><textarea name="detalle_trabajo" rows={3} value={form.detalle_trabajo||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/></div>}
                  {form.situacion_actual==="No hago nada" && <div><label style={LC}>¿Desde cuándo?</label><textarea name="detalle_sin_ocupacion" rows={2} value={form.detalle_sin_ocupacion||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/></div>}
                  <div><label style={LC}>Si ya se graduó, ¿qué estudió?</label><input name="carrera_graduada" value={form.carrera_graduada||""} onChange={hi} style={IC} placeholder="Ej: Administración de Empresas"/></div>
                </>)}

                {/* ── 3: Salud ── */}
                {seccion===3 && (<>
                  {[
                    {k:"enfermedad_medicamentos", label:"¿Enfermedad que requiera medicamentos constantes?", opts:["Si","No"], dk:"detalle_enfermedad_med"},
                    {k:"enfermedad_grave",        label:"¿Ha tenido enfermedad grave?",                       opts:["Si","No"], dk:"detalle_enfermedad_grave"},
                    {k:"depresion_panico",        label:"¿Depresión o ataques de pánico diagnosticados?",     opts:["Si","No"]},
                    {k:"trastorno_alimenticio",   label:"¿Trastorno alimenticio?",                            opts:["Si","No"]},
                    {k:"autolesiones",            label:"¿Se ha autolesionado?",                              opts:["Si","No"]},
                    {k:"abuso_sustancias",        label:"¿Ha abusado de sustancias tóxicas?",                 opts:["Si","No"]},
                    {k:"isotretinoina",           label:"¿Tratamiento con isotretinoina en últimos 3 meses?", opts:["Si","No"]},
                    {k:"condiciones_fisicas",     label:"¿Condiciones físicas que impidan cuidar niños?",     opts:["Si","No"]},
                    {k:"alergia_medicamentos",    label:"¿Alérgica a algún medicamento?",                     opts:["Si","No"], dk:"detalle_alergias"},
                  ].map(f=>(
                    <div key={f.k}>
                      <label style={LC}>{f.label}</label>
                      <Radio name={f.k} options={f.opts} value={form[f.k]||""} onChange={set}/>
                      {f.dk&&form[f.k]==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>Explica con detalle</label><textarea name={f.dk} rows={3} value={form[f.dk]||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/></div>}
                    </div>
                  ))}
                  <div><label style={LC}>Detalle salud mental</label><textarea name="detalle_salud_mental" rows={3} value={form.detalle_salud_mental||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Si no aplica, 'No aplica'"/></div>
                  <div><label style={LC}>Dosis COVID</label><Radio name="dosis_covid" options={["Ninguna","Una","Dos","Más de dos"]} value={form.dosis_covid||""} onChange={set}/></div>
                  <div><label style={LC}>Vacuna COVID</label><input name="vacuna_covid" value={form.vacuna_covid||""} onChange={hi} style={IC} placeholder="Pfizer, Moderna..."/></div>
                </>)}

                {/* ── 4: Experiencia ── */}
                {seccion===4 && (<>
                  <div><label style={LC}>¿Tiene experiencia con niños externos a la familia?</label><Radio name="exp_ninos_externos" options={["Si","No","La estoy haciendo"]} value={form.exp_ninos_externos||""} onChange={set}/></div>
                  <div><label style={LC}>¿Cuántas horas de experiencia tiene?</label><Radio name="horas_exp_ninos" options={["Menos de 500 horas","Entre 501 y 800 horas","Entre 801 y 1500 horas","Más de 1500"]} value={form.horas_exp_ninos||""} onChange={set}/></div>
                  <div style={{ background:"#fff8f9", borderRadius:16, border:"1px solid #f0dde2", padding:"20px", marginTop:4 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"#a0435f", textTransform:"uppercase", letterSpacing:".7px", margin:"0 0 14px" }}>📊 Datos para la agencia</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                      <div><label style={LC}>Horas childcare</label><input name="horas_childcare" type="number" min="0" value={form.horas_childcare||""} onChange={hi} style={IC} placeholder="0"/></div>
                      <div><label style={LC}>Estado agencia</label><select name="estado_agencia" value={form.estado_agencia||"En progreso"} onChange={hi} style={IC}>{["En progreso","En revisión","Lista para agencia","Incompleto"].map(o=><option key={o}>{o}</option>)}</select></div>
                      <div><label style={LC}>Progreso agencia (%)</label><input name="progreso_agencia" type="number" min="0" max="100" value={form.progreso_agencia||0} onChange={hi} style={IC}/></div>
                    </div>
                  </div>
                </>)}

                {/* ── 5: Visas ── */}
                {seccion===5 && (<>
                  <div>
                    <label style={LC}>¿Le han negado alguna visa?</label>
                    <Radio name="visa_negada" options={["Si","No"]} value={form.visa_negada||""} onChange={set}/>
                    {form.visa_negada==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>¿Cuándo, razón y país?</label><textarea name="detalle_visa_negada" rows={3} value={form.detalle_visa_negada||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/></div>}
                  </div>
                  <div><label style={LC}>¿Le han cancelado alguna visa?</label><textarea name="visa_cancelada" rows={2} value={form.visa_cancelada||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Si no aplica, 'No'"/></div>
                  {[
                    {k:"familiar_residencia_usa",   label:"¿Familiar solicitando residencia en USA?",          dk:"detalle_familiar_residencia"},
                    {k:"familiar_visa_estudio_usa", label:"¿Familiar con visa de estudio o situación ilegal?",  dk:"detalle_familiar_visa_estudio"},
                  ].map(f=>(
                    <div key={f.k}>
                      <label style={LC}>{f.label}</label>
                      <Radio name={f.k} options={["Si","No"]} value={form[f.k]||""} onChange={set}/>
                      {form[f.k]==="Si"&&<div style={{ marginTop:10 }}><label style={LC}>¿Quién y cuál es su situación?</label><textarea name={f.dk} rows={3} value={form[f.dk]||""} onChange={hi} style={{ ...IC, resize:"vertical" }}/></div>}
                    </div>
                  ))}
                  <div><label style={LC}>¿Ha permanecido más tiempo del autorizado en otro país?</label><textarea name="overstay_otro_pais" rows={2} value={form.overstay_otro_pais||""} onChange={hi} style={{ ...IC, resize:"vertical" }} placeholder="Si no aplica, 'No'"/></div>
                  <div><label style={LC}>¿Entiende que el programa es solo intercambio cultural?</label><Radio name="entiende_intercambio_cultural" options={["SI","No"]} value={form.entiende_intercambio_cultural||""} onChange={set}/></div>
                  <div><label style={LC}>¿Consciente del riesgo si un familiar pide asilo?</label><Radio name="consciente_riesgo_familiar" options={["SI","No"]} value={form.consciente_riesgo_familiar||""} onChange={set}/></div>
                  <div>
                    <label style={LC}>¿Ha participado antes en Au Pair USA?</label>
                    <Radio name="participo_programa_ap" options={["Si","No"]} value={form.participo_programa_ap||""} onChange={set}/>
                    {form.participo_programa_ap==="Si"&&(
                      <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:14 }}>
                        <div><label style={LC}>¿Finalizó exitosamente?</label><Radio name="finalizo_programa_ap" options={["Si","No"]} value={form.finalizo_programa_ap||""} onChange={set}/></div>
                        <div><label style={LC}>¿Puede proveer certificados?</label><Radio name="puede_proveer_certificados" options={["Si","No"]} value={form.puede_proveer_certificados||""} onChange={set}/></div>
                      </div>
                    )}
                  </div>
                </>)}
              </div>

              {/* Navegación */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20 }}>
                <button onClick={() => setSeccion(s => Math.max(0,s-1))} disabled={seccion===0}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:12, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a7080", fontSize:13, fontWeight:600, cursor:seccion===0?"not-allowed":"pointer", opacity:seccion===0?.4:1, fontFamily:"inherit" }}>
                  <ChevronLeftIcon size={15}/> Anterior
                </button>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {SECCIONES.map((_,i) => (
                    <button key={i} onClick={() => setSeccion(i)}
                      style={{ width:i===seccion?28:10, height:10, borderRadius:99, border:"none", cursor:"pointer", transition:"all .2s", background:i===seccion?"#a0435f":"#f0dde2" }}/>
                  ))}
                </div>
                <button onClick={() => guardar(true)} disabled={guardando}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 22px", borderRadius:12, border:"none", background:"#a0435f", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  {guardando
                    ? <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>Guardando…</>
                    : seccion < SECCIONES.length-1
                    ? <>Guardar y continuar <ChevronRightIcon size={15}/></>
                    : <>Finalizar ✓</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}