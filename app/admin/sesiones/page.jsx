"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  .ses-page { min-height:100vh; background:#faf6f7; font-family:system-ui,-apple-system,sans-serif; }
  .ses-inner { max-width:1400px; margin:0 auto; padding:28px 24px 48px; }
  .ses-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:24px; }
  .ses-header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

  /* Stats */
  .ses-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:24px; }
  @media(max-width:1100px){ .ses-stats{ grid-template-columns:repeat(3,1fr); } }
  @media(max-width:680px){  .ses-stats{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:380px){  .ses-stats{ grid-template-columns:1fr; } }

  /* Layout */
  .ses-main { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
  @media(max-width:1024px){ .ses-main{ grid-template-columns:1fr; } }
  .ses-sidebar { display:flex; flex-direction:column; gap:16px; }
  @media(max-width:1024px){ .ses-sidebar{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; } }
  @media(max-width:580px){  .ses-sidebar{ grid-template-columns:1fr; } }

  /* Filters */
  .ses-filters { display:flex; align-items:center; gap:10px; padding:14px 18px; border-bottom:1px solid #f8f0f2; flex-wrap:wrap; }
  .ses-search { position:relative; flex:1 1 160px; min-width:130px; }
  .ses-search input { width:100%; padding:0 12px 0 34px; height:36px; border:1.5px solid #f0dde2; border-radius:10px; font-size:13px; color:#2d1a22; background:#fff; outline:none; box-sizing:border-box; font-family:inherit; }
  .ses-search .ico { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#c0909a; font-size:13px; pointer-events:none; }

  /* Table */
  .ses-table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
  .ses-table { width:100%; border-collapse:collapse; font-size:13px; min-width:740px; }
  .ses-table th { padding:11px 13px; text-align:left; color:#9a6672; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.6px; border-bottom:1px solid #f0dde2; white-space:nowrap; background:#fff8f9; }
  .ses-table th.c { text-align:center; }
  .ses-table td { padding:11px 13px; border-bottom:1px solid #fdf0f2; vertical-align:middle; }
  .ses-table tr:last-child td { border-bottom:none; }
  .ses-table tbody tr { transition:background .1s; }
  .ses-table tbody tr:hover td { background:#fff8f9; }

  /* Buttons */
  .btn-ghost { height:36px; padding:0 14px; border-radius:10px; border:1.5px solid #f0dde2; background:#fff; font-size:13px; color:#9a6672; cursor:pointer; display:inline-flex; align-items:center; gap:6px; white-space:nowrap; font-family:inherit; transition:all .12s; }
  .btn-ghost:hover { background:#fff8f9; border-color:#e8b0bc; color:#a0435f; }
  .btn-primary { height:36px; padding:0 18px; border-radius:10px; border:none; background:#a0435f; color:#fff; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; white-space:nowrap; font-family:inherit; transition:background .12s; }
  .btn-primary:hover { background:#8a3550; }
  .ses-select { height:36px; border:1.5px solid #f0dde2; border-radius:10px; padding:0 10px; font-size:13px; color:#2d1a22; background:#fff; cursor:pointer; outline:none; font-family:inherit; }
  .act-btn { width:30px; height:30px; border-radius:8px; border:1px solid #f0dde2; background:#fff; color:#9a6672; cursor:pointer; font-size:13px; display:inline-flex; align-items:center; justify-content:center; transition:all .12s; }
  .act-btn:hover, .act-btn.accent { background:#fce8ed; border-color:#e8b0bc; color:#a0435f; }

  /* Edit modal */
  .modal-overlay { position:fixed; inset:0; background:rgba(45,26,34,.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; box-sizing:border-box; }
  .modal-box { background:#fff; border-radius:20px; width:100%; max-width:580px; box-shadow:0 20px 60px rgba(160,67,95,.18); animation:modalIn .2s ease; max-height:92vh; overflow-y:auto; display:flex; flex-direction:column; }
  .modal-input { width:100%; border:1.5px solid #f0dde2; border-radius:12px; padding:10px 14px; font-size:13px; color:#2d1a22; background:#fff; outline:none; font-family:inherit; resize:vertical; box-sizing:border-box; transition:border-color .15s; }
  .modal-input:focus { border-color:#e8849a; }

  /* Modal tabs */
  .modal-tabs { display:flex; border-bottom:1px solid #f0dde2; margin:0 24px; gap:0; }
  .modal-tab { padding:11px 16px; font-size:13px; font-weight:600; color:#9a6672; cursor:pointer; border:none; background:none; border-bottom:2px solid transparent; margin-bottom:-1px; font-family:inherit; transition:all .12s; }
  .modal-tab.active { color:#a0435f; border-bottom-color:#a0435f; }
  .modal-tab:hover { color:#a0435f; }

  /* File upload zone */
  .upload-zone { border:2px dashed #f0dde2; border-radius:14px; padding:24px; text-align:center; cursor:pointer; transition:all .15s; background:#fff8f9; }
  .upload-zone:hover, .upload-zone.drag { border-color:#e8849a; background:#fce8ed20; }
  .upload-zone input[type=file] { display:none; }

  /* Resource item */
  .recurso-item { display:flex; align-items:center; gap:10px; padding:10px 12px; background:#fff8f9; border:1px solid #f0dde2; border-radius:12px; }
  .recurso-item:hover { background:#fce8ed20; border-color:#e8b0bc; }

  /* Student view */
  .sv-overlay { position:fixed; inset:0; background:rgba(20,8,14,.6); display:flex; align-items:stretch; justify-content:flex-end; z-index:1000; animation:fadeIn .2s ease; }
  .sv-panel { width:100%; max-width:860px; background:#f9f4f5; overflow-y:auto; animation:slideIn .25s ease; }
  @media(max-width:600px){ .sv-panel{ max-width:100%; } }
  .sv-header { background:linear-gradient(135deg,#2d1a22,#5a2a3a); color:#fff; padding:28px 28px 24px; position:sticky; top:0; z-index:10; }
  .sv-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; padding:24px 28px; }
  @media(max-width:640px){ .sv-grid{ grid-template-columns:1fr; } }
  .sv-card { background:#fff; border-radius:16px; border:1px solid #f0dde2; overflow:hidden; cursor:pointer; transition:transform .15s, box-shadow .15s; }
  .sv-card:hover:not(.locked) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(160,67,95,.12); }
  .sv-card.locked { opacity:.65; cursor:default; }
  .sv-card.active { border-color:#e8849a; box-shadow:0 0 0 2px #fce8ed; }

  /* Toast */
  .toast { position:fixed; top:20px; right:20px; z-index:2000; background:#2d1a22; color:#fff; padding:12px 20px; border-radius:14px; font-size:13px; font-weight:600; box-shadow:0 8px 30px rgba(0,0,0,.2); animation:fadeIn .2s ease; }

  @keyframes spin    { to{ transform:rotate(360deg); } }
  @keyframes fadeIn  { from{ opacity:0; } to{ opacity:1; } }
  @keyframes slideIn { from{ transform:translateX(40px); opacity:0; } to{ transform:translateX(0); opacity:1; } }
  @keyframes modalIn { from{ opacity:0; transform:scale(.96); } to{ opacity:1; transform:scale(1); } }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const MOD_C = {
  "Módulo 1":["#fce8ed","#a0435f"],"Módulo 2":["#fce0d0","#9a4020"],
  "Módulo 3":["#fdf0d0","#8a6010"],"Módulo 4":["#e0f0e0","#306030"],
  "Módulo 5":["#e0eafa","#2040a0"],"Módulo 6":["#ede0fc","#5030a0"],
};
const ModBadge = ({ m }) => {
  const [bg,fg] = MOD_C[m]||["#f0e8f8","#6030a0"];
  return <span style={{ background:bg,color:fg,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:999,whiteSpace:"nowrap" }}>{m||"—"}</span>;
};
const StatusBadge = ({ estado }) => {
  const pub = !estado || /publicada/i.test(estado);
  return <span style={{ background:pub?"#e8f4e8":"#f8f0e0",color:pub?"#2a7a2a":"#8a6010",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:999 }}>{pub?"Publicada":estado||"Borrador"}</span>;
};
const GRADS=[["#fce8ed","#f0c0cc"],["#e8f0fc","#c0ccf0"],["#e8fce8","#b0e0b0"],["#fce8fc","#e0b0e0"],["#fce8d0","#f0c090"],["#e0f0f8","#a0d0e8"]];
const Thumb = ({ orden }) => { const [g1,g2]=GRADS[(orden-1)%GRADS.length]; return <div style={{ width:44,height:34,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg,${g1},${g2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#a0435f" }}>{orden}</div>; };

const TIPO_ICON = { pdf:"📄", docx:"📝", otro:"📁" };
const TIPO_COLOR = { pdf:["#fce8ed","#a0435f"], docx:["#e8effe","#3060c0"], otro:["#f0eaff","#6030a0"] };

function formatBytes(kb) {
  if (!kb) return "";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb/1024).toFixed(1)} MB`;
}

function getEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  if (/\.mp4/i.test(url)) return url;
  return null;
}

/* ─── Donut chart ─────────────────────────────────────────────────────────── */
function DonutChart({ completadas=0, enProgreso=0, sinIniciar=100 }) {
  const r=54,cx=70,cy=70,sw=14,circ=2*Math.PI*r;
  const slices=[{pct:completadas,color:"#c0435f"},{pct:enProgreso,color:"#e8b0bc"},{pct:sinIniciar,color:"#f5e0e5"}];
  let off=0;
  return (
    <svg viewBox="0 0 140 140" width={130} height={130} style={{ flexShrink:0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fce8ed" strokeWidth={sw} />
      {slices.map((s)=>{ const d=(s.pct/100)*circ; const el=<circle key={s.color} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw} strokeDasharray={`${d} ${circ-d}`} strokeDashoffset={-off*circ/100+circ*.25} />; off+=s.pct; return el; })}
      <text x={cx} y={cy-8}  textAnchor="middle" fill="#2d1a22" fontSize="22" fontWeight="700" fontFamily="Georgia,serif">{completadas}%</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="#9a6672" fontSize="11" fontFamily="system-ui">Promedio</text>
      <text x={cx} y={cy+26} textAnchor="middle" fill="#9a6672" fontSize="11" fontFamily="system-ui">general</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EDIT MODAL — tabs: Info | Recursos
───────────────────────────────────────────────────────────────────────────── */
function EditModal({ sesion, onClose, onSaved }) {
  const [tab,     setTab]     = useState("info");
  const [form,    setForm]    = useState({ titulo:sesion.titulo||"", descripcion:sesion.descripcion||"", url_video:sesion.url_video||"" });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  // ── Resources state ──
  const [recursos,     setRecursos]     = useState([]);
  const [loadingRec,   setLoadingRec]   = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [uploadErr,    setUploadErr]    = useState("");
  const [drag,         setDrag]         = useState(false);
  const [nombreEdit,   setNombreEdit]   = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const cargarRecursos = useCallback(() => {
    setLoadingRec(true);
    fetch(`/api/admin/recursos?sesion_id=${sesion.id}`)
      .then(r=>r.json())
      .then(d=>{ setRecursos(d.recursos||[]); setLoadingRec(false); })
      .catch(()=>setLoadingRec(false));
  }, [sesion.id]);

  useEffect(() => { if (tab==="recursos") cargarRecursos(); }, [tab]);

  // ── Save session info ──
  const save = async () => {
    if (!form.titulo.trim()) { setErr("El título es obligatorio."); return; }
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/admin/sesiones",{
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ id:sesion.id, ...form }),
      });
      if (res.ok) { onSaved(); onClose(); }
      else setErr("Error al guardar.");
    } catch { setErr("Error de conexión."); }
    setSaving(false);
  };

  // ── Upload file ──
  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { setUploadErr("Solo se permiten archivos PDF o Word (.doc, .docx)"); return; }
    if (file.size > 20*1024*1024) { setUploadErr("El archivo no puede superar 20 MB"); return; }
    setSelectedFile(file);
    setNombreEdit(file.name.replace(/\.[^.]+$/,""));
    setUploadErr("");
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setUploading(true); setUploadErr("");
    const fd = new FormData();
    fd.append("sesion_id", sesion.id);
    fd.append("file", selectedFile);
    fd.append("nombre", nombreEdit || selectedFile.name);
    try {
      const res = await fetch("/api/admin/recursos", { method:"POST", body:fd });
      if (res.ok) { setSelectedFile(null); setNombreEdit(""); cargarRecursos(); }
      else setUploadErr("Error al subir el archivo.");
    } catch { setUploadErr("Error de conexión."); }
    setUploading(false);
  };

  const deleteRecurso = async (id) => {
    if (!confirm("¿Eliminar este recurso?")) return;
    await fetch(`/api/admin/recursos?id=${id}`, { method:"DELETE" });
    cargarRecursos();
  };

  return (
    <div className="modal-overlay" onClick={(e)=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ padding:"20px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0 }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:"#c0909a",textTransform:"uppercase",letterSpacing:1,marginBottom:2 }}>Sesión {sesion.orden}</div>
            <h2 style={{ margin:0,fontSize:18,fontWeight:700,color:"#2d1a22",fontFamily:"Georgia,serif" }}>{sesion.titulo}</h2>
          </div>
          <button onClick={onClose} style={{ background:"#fce8ed",border:"none",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:20,color:"#a0435f",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>×</button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs" style={{ marginTop:14 }}>
          <button className={`modal-tab${tab==="info"?" active":""}`} onClick={()=>setTab("info")}>✏️ Información</button>
          <button className={`modal-tab${tab==="recursos"?" active":""}`} onClick={()=>setTab("recursos")}>
            📎 Recursos {recursos.length>0&&<span style={{ background:"#fce8ed",color:"#a0435f",borderRadius:99,fontSize:10,fontWeight:700,padding:"1px 6px",marginLeft:4 }}>{recursos.length}</span>}
          </button>
        </div>

        {/* ── Tab: Info ── */}
        {tab==="info" && (
          <div style={{ padding:"18px 24px",display:"flex",flexDirection:"column",gap:14,overflowY:"auto" }}>
            {err&&<div style={{ background:"#fce8ed",border:"1px solid #e8b0bc",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#a0435f" }}>{err}</div>}
            {[
              {label:"Título",     key:"titulo",      type:"input"},
              {label:"Descripción",key:"descripcion", type:"textarea"},
              {label:"URL del video",key:"url_video", type:"input",ph:"https://vimeo.com/… o https://youtube.com/…"},
            ].map(({label,key,type,ph})=>(
              <label key={key} style={{ display:"flex",flexDirection:"column",gap:5 }}>
                <span style={{ fontSize:11,fontWeight:700,color:"#2d1a22",textTransform:"uppercase",letterSpacing:.7 }}>{label}</span>
                {type==="textarea"
                  ? <textarea className="modal-input" rows={3} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />
                  : <input className="modal-input" type={key==="url_video"?"url":"text"} placeholder={ph} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />}
                {key==="url_video"&&<span style={{ fontSize:11,color:"#c0909a" }}>Soporta YouTube, Vimeo o MP4 directo</span>}
              </label>
            ))}
          </div>
        )}

        {/* ── Tab: Recursos ── */}
        {tab==="recursos" && (
          <div style={{ padding:"18px 24px",display:"flex",flexDirection:"column",gap:16,overflowY:"auto" }}>
            {/* Upload zone */}
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:"#2d1a22",textTransform:"uppercase",letterSpacing:.7,marginBottom:10 }}>
                Subir documento
              </div>
              <div
                className={`upload-zone${drag?" drag":""}`}
                onClick={()=>!selectedFile&&fileRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setDrag(true);}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
              >
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={e=>handleFile(e.target.files[0])} />
                {!selectedFile ? (
                  <>
                    <div style={{ fontSize:32,marginBottom:8 }}>📎</div>
                    <div style={{ fontSize:13,fontWeight:600,color:"#a0435f",marginBottom:4 }}>Arrastra o haz clic para subir</div>
                    <div style={{ fontSize:11,color:"#c0909a" }}>PDF, Word (.doc, .docx) — máx. 20 MB</div>
                  </>
                ) : (
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,justifyContent:"center" }}>
                      <span style={{ fontSize:24 }}>{selectedFile.name.endsWith(".pdf")?"📄":"📝"}</span>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:13,fontWeight:600,color:"#2d1a22" }}>{selectedFile.name}</div>
                        <div style={{ fontSize:11,color:"#9a6672" }}>{formatBytes(Math.round(selectedFile.size/1024))}</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setSelectedFile(null);setNombreEdit("");}} style={{ background:"#fce8ed",border:"none",borderRadius:8,padding:"4px 8px",fontSize:11,color:"#a0435f",cursor:"pointer",marginLeft:"auto" }}>✕ Quitar</button>
                    </div>
                    {/* Nombre personalizado */}
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:11,fontWeight:600,color:"#9a6672",marginBottom:4 }}>Nombre que verán los estudiantes:</div>
                      <input className="modal-input" value={nombreEdit} onChange={e=>setNombreEdit(e.target.value)} placeholder="Ej: Guía de documentos requeridos" />
                    </div>
                  </div>
                )}
              </div>
              {uploadErr&&<div style={{ marginTop:8,fontSize:12,color:"#c0435f" }}>{uploadErr}</div>}
              {selectedFile&&(
                <button onClick={uploadFile} disabled={uploading}
                  style={{ marginTop:10,width:"100%",padding:"10px",borderRadius:12,border:"none",background:uploading?"#c0909a":"#a0435f",color:"#fff",fontSize:13,fontWeight:600,cursor:uploading?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  {uploading?<><div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite" }} />Subiendo…</>:"⬆ Subir documento"}
                </button>
              )}
            </div>

            {/* Recursos existentes */}
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:"#2d1a22",textTransform:"uppercase",letterSpacing:.7,marginBottom:10 }}>
                Documentos en esta sesión
              </div>
              {loadingRec ? (
                <div style={{ textAlign:"center",padding:20 }}><div style={{ width:24,height:24,border:"3px solid #fce8ed",borderTopColor:"#a0435f",borderRadius:"50%",margin:"0 auto",animation:"spin 1s linear infinite" }} /></div>
              ) : recursos.length===0 ? (
                <div style={{ textAlign:"center",padding:"20px 0",color:"#c0909a",fontSize:13 }}>
                  Sin documentos aún. ¡Sube el primero! 👆
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {recursos.map((r)=>{
                    const [bg,fg]=TIPO_COLOR[r.tipo]||TIPO_COLOR.otro;
                    return (
                      <div key={r.id} className="recurso-item">
                        <div style={{ width:34,height:34,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{TIPO_ICON[r.tipo]||"📁"}</div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:600,color:"#2d1a22",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.nombre}</div>
                          <div style={{ fontSize:11,color:"#c0909a" }}>
                            <span style={{ background:bg,color:fg,borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:600,marginRight:6 }}>{r.tipo.toUpperCase()}</span>
                            {formatBytes(r.tamano_kb)}
                          </div>
                        </div>
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          style={{ padding:"5px 10px",borderRadius:8,border:"1px solid #f0dde2",background:"#fff",color:"#9a6672",fontSize:12,cursor:"pointer",textDecoration:"none" }}>
                          ↓
                        </a>
                        <button onClick={()=>deleteRecurso(r.id)}
                          style={{ padding:"5px 10px",borderRadius:8,border:"1px solid #fce8ed",background:"#fce8ed",color:"#a0435f",fontSize:12,cursor:"pointer" }}>
                          🗑
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {tab==="info" && (
          <div style={{ padding:"0 24px 20px",display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0 }}>
            <button onClick={onClose} style={{ padding:"9px 18px",borderRadius:12,border:"1.5px solid #f0dde2",background:"#fff",color:"#9a6672",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancelar</button>
            <button onClick={save} disabled={saving} style={{ padding:"9px 22px",borderRadius:12,border:"none",background:saving?"#c0909a":"#a0435f",color:"#fff",fontSize:13,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8 }}>
              {saving?<><div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite" }} />Guardando…</>:"✓ Guardar cambios"}
            </button>
          </div>
        )}
        {tab==="recursos" && (
          <div style={{ padding:"0 24px 20px",flexShrink:0 }}>
            <button onClick={onClose} className="btn-ghost" style={{ width:"100%" }}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STUDENT VIEW
───────────────────────────────────────────────────────────────────────────── */
function StudentView({ sesiones, onClose }) {
  const [selected, setSelected] = useState(null);
  const published = sesiones.filter(s=>!s.estado||/publicada/i.test(s.estado));

  useEffect(()=>{
    const first=published.find(s=>s.es_gratis===1||s.es_gratis===true)||published[0];
    if(first) setSelected(first);
  },[]);

  const embedUrl   = selected ? getEmbedUrl(selected.url_video) : null;
  const completadas = Math.round(published.length*0.68);

  return (
    <div className="sv-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sv-panel">
        <div className="sv-header">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"rgba(255,255,255,.85)",marginBottom:14 }}>
              👁 Vista de estudiante — solo lectura
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:10,width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>×</button>
          </div>
          <h2 style={{ margin:"0 0 4px",fontSize:"clamp(18px,3vw,24px)",fontWeight:700,fontFamily:"Georgia,serif",color:"#fff" }}>Destino Au Pair — Programa completo</h2>
          <p style={{ margin:0,fontSize:13,color:"rgba(255,255,255,.65)" }}>{published.length} sesiones · Acceso completo</p>
          <div style={{ marginTop:14,display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ flex:1,height:6,background:"rgba(255,255,255,.2)",borderRadius:99 }}>
              <div style={{ height:"100%",width:`${Math.round(completadas/Math.max(published.length,1)*100)}%`,background:"#e8849a",borderRadius:99 }} />
            </div>
            <span style={{ fontSize:12,color:"rgba(255,255,255,.75)",whiteSpace:"nowrap" }}>{completadas}/{published.length} completadas</span>
          </div>
        </div>

        {selected&&(
          <div style={{ background:"#fff",margin:"24px 28px 0",borderRadius:16,border:"1px solid #f0dde2",overflow:"hidden" }}>
            <div style={{ position:"relative",width:"100%",paddingTop:"56.25%",background:"#1a0a10" }}>
              {embedUrl ? (
                /\.mp4/i.test(embedUrl)
                  ? <video src={embedUrl} controls style={{ position:"absolute",inset:0,width:"100%",height:"100%",border:"none" }} />
                  : <iframe src={embedUrl} allowFullScreen allow="autoplay; fullscreen" style={{ position:"absolute",inset:0,width:"100%",height:"100%",border:"none" }} />
              ) : (
                <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#e8849a",gap:10 }}>
                  <span style={{ fontSize:48 }}>▶</span>
                  <span style={{ fontSize:14 }}>Sin URL de video asignada</span>
                </div>
              )}
            </div>
            <div style={{ padding:"16px 20px 20px" }}>
              <div style={{ fontSize:11,color:"#c0909a",fontWeight:600,textTransform:"uppercase",letterSpacing:.6,marginBottom:4 }}>Sesión {selected.orden} · {selected.modulo||""}</div>
              <h3 style={{ margin:"0 0 8px",fontSize:18,fontWeight:700,color:"#2d1a22",fontFamily:"Georgia,serif" }}>{selected.titulo}</h3>
              {selected.descripcion&&<p style={{ margin:"0 0 14px",fontSize:13,color:"#7a5060",lineHeight:1.6 }}>{selected.descripcion}</p>}
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                <button style={{ flex:1,minWidth:120,padding:"10px",borderRadius:12,border:"none",background:"#a0435f",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>▶ Continuar sesión</button>
                <button style={{ padding:"10px 14px",borderRadius:12,border:"1.5px solid #f0dde2",background:"#fff",color:"#9a6672",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>✓ Marcar completa</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding:"20px 28px 8px" }}>
          <h4 style={{ margin:"0 0 14px",fontSize:13,fontWeight:700,color:"#9a6672",textTransform:"uppercase",letterSpacing:.6 }}>Todas las sesiones</h4>
        </div>
        <div className="sv-grid">
          {published.map((s,i)=>{
            const locked=(!s.estado||!/publicada/i.test(s.estado))&&s.es_gratis!==1&&s.es_gratis!==true;
            const active=selected?.id===s.id;
            const done=i<completadas;
            const [g1,g2]=GRADS[i%GRADS.length];
            return (
              <div key={s.id} className={`sv-card${locked?" locked":""}${active?" active":""}`} onClick={()=>!locked&&setSelected(s)}>
                <div style={{ position:"relative",height:110,background:`linear-gradient(135deg,${g1},${g2})`,overflow:"hidden" }}>
                  <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ fontSize:30,fontWeight:800,color:"rgba(160,67,95,.3)",fontFamily:"Georgia,serif" }}>{s.orden}</span>
                  </div>
                  {locked&&<div style={{ position:"absolute",inset:0,background:"rgba(45,26,34,.45)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26 }}>🔒</div>}
                  {(s.es_gratis===1||s.es_gratis===true)&&<div style={{ position:"absolute",top:8,left:8,background:"#a0435f",color:"#fff",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:99 }}>GRATIS</div>}
                  {done&&!locked&&<div style={{ position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",background:"#2a7a2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff" }}>✓</div>}
                  {active&&<div style={{ position:"absolute",bottom:8,right:8,background:"#a0435f",color:"#fff",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:99 }}>▶ VIENDO</div>}
                </div>
                <div style={{ padding:"12px 14px 14px" }}>
                  <div style={{ fontSize:10,color:"#c0909a",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:3 }}>Sesión {s.orden}{s.modulo?` · ${s.modulo}`:""}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:locked?"#bbb":"#2d1a22",lineHeight:1.35,marginBottom:4 }}>{s.titulo}</div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                    {s.duracion&&<span style={{ fontSize:11,color:"#a0435f",background:"#fce8ed",padding:"2px 8px",borderRadius:99 }}>⏱ {s.duracion}</span>}
                    {locked?<span style={{ fontSize:11,color:"#bbb" }}>🔒 Bloqueada</span>:done?<span style={{ fontSize:11,color:"#2a7a2a" }}>✓ Completada</span>:<span style={{ fontSize:11,color:"#9a6672" }}>· Pendiente</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height:32 }} />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════════════════════════════════════ */
export default function AdminSesionesPage() {
  const [sesiones,    setSesiones]    = useState([]);
  const [stats,       setStats]       = useState(null);       // ← real stats from DB
  const [loading,     setLoading]     = useState(true);
  const [editModal,   setEditModal]   = useState(null);
  const [studentView, setStudentView] = useState(false);
  const [toast,       setToast]       = useState("");
  const [search,      setSearch]      = useState("");
  const [filterMod,   setFilterMod]   = useState("Todos");
  const [filterEst,   setFilterEst]   = useState("Todos");
  const [sortAsc,     setSortAsc]     = useState(true);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/sesiones").then(r=>r.json()),
      fetch("/api/admin/stats").then(r=>r.json()),
    ])
      .then(([d, s]) => {
        setSesiones(d.sesiones || []);
        setStats(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3200); };

  const total      = stats?.total_sesiones    ?? sesiones.length;
  const publicadas = stats?.publicadas        ?? 0;
  const promedio   = stats?.promedio_completado ?? 0;
  const tiempoP    = stats?.tiempo_promedio   ?? "—";
  const totalRec   = stats?.total_recursos    ?? 0;

  // Distribución dona
  const cPct = stats?.completadas_pct  ?? 0;
  const ePct = stats?.en_progreso_pct  ?? 0;
  const sPct = stats?.sin_iniciar_pct  ?? 100;

  // Tipos de recursos desde BD
  const TIPO_LABELS = { pdf:"Guías en PDF", docx:"Documentos Word", otro:"Otros archivos" };
  const tiposRecursos = stats?.recursos_por_tipo || [];

  // Actividad reciente desde BD (o vacío)
  const actividad = stats?.actividad || [];

  const modulos = ["Todos", ...new Set(sesiones.map(s=>s.modulo).filter(Boolean))];

  const visible = sesiones
    .filter(s => {
      const q=search.toLowerCase();
      if(q&&!s.titulo.toLowerCase().includes(q)&&!(s.descripcion||"").toLowerCase().includes(q)) return false;
      if(filterMod!=="Todos"&&s.modulo!==filterMod) return false;
      if(filterEst!=="Todos"){
        const pub=!s.estado||/publicada/i.test(s.estado);
        if(filterEst==="Publicada"&&!pub) return false;
        if(filterEst==="Borrador"&&pub) return false;
      }
      return true;
    })
    .sort((a,b)=>sortAsc?a.orden-b.orden:b.orden-a.orden);

  const statCards = [
    { icon:"▶",  bg:"#fce8ed",label:"Total sesiones",     val:total,            sub:"En el programa" },
    { icon:"👥", bg:"#e8f0fe",label:"Completadas (prom.)",val:`${promedio}%`,   sub:"Progreso de estudiantes", bar:true, barVal:promedio },
    { icon:"✓",  bg:"#e8f4e8",label:"Sesiones publicadas",val:publicadas,       sub:`${total?Math.round(publicadas/total*100):0}% del programa` },
    { icon:"⏱",  bg:"#fff4e0",label:"Tiempo promedio",    val:tiempoP,          sub:"Por estudiante" },
    { icon:"📎", bg:"#f0eaff",label:"Recursos",           val:totalRec,         sub:"PDF y documentos" },
  ];

  return (
    <div className="ses-page">
      <style>{STYLES}</style>
      {toast&&<div className="toast">✓ {toast}</div>}
      {editModal&&<EditModal sesion={editModal} onClose={()=>setEditModal(null)} onSaved={()=>{cargar();showToast("Sesión actualizada correctamente");}} />}
      {studentView&&<StudentView sesiones={sesiones} onClose={()=>setStudentView(false)} />}

      <div className="ses-inner">
        {/* Header */}
        <div className="ses-header">
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
              <h1 style={{ margin:0,fontSize:"clamp(18px,3vw,26px)",fontWeight:700,color:"#2d1a22",fontFamily:"Georgia,serif" }}>Sesiones del programa</h1>
              <span style={{ background:"#fce8ed",color:"#a0435f",borderRadius:8,padding:"2px 9px",fontSize:12,fontWeight:700 }}>{total}</span>
            </div>
            <p style={{ margin:"4px 0 0",fontSize:13,color:"#9a6672" }}>Gestiona el contenido, recursos y acceso a cada sesión.</p>
          </div>
          <div className="ses-header-actions">
            <button className="btn-ghost" onClick={()=>setStudentView(true)} style={{ borderColor:"#e8b0bc",color:"#a0435f" }}>👁 Vista de estudiante</button>
            <button className="btn-primary">+ Nueva sesión</button>
          </div>
        </div>

        {/* Stats */}
        <div className="ses-stats">
          {statCards.map(c=>(
            <div key={c.label} style={{ background:"#fff",borderRadius:16,border:"1px solid #f0dde2",padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:11,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>{c.icon}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:11,color:"#9a6672",marginBottom:1 }}>{c.label}</div>
                <div style={{ fontSize:22,fontWeight:700,color:"#2d1a22",lineHeight:1.1 }}>{loading?"—":c.val}</div>
                {c.bar&&<div style={{ height:3,background:"#fce8ed",borderRadius:99,margin:"5px 0 2px",width:80 }}><div style={{ height:"100%",width:`${c.barVal||0}%`,background:"#a0435f",borderRadius:99,transition:"width 1s ease" }} /></div>}
                <div style={{ fontSize:11,color:"#9a6672",marginTop:1 }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="ses-main">
          {/* Table */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #f0dde2",overflow:"hidden" }}>
            <div className="ses-filters">
              <div className="ses-search">
                <span className="ico">🔍</span>
                <input type="text" placeholder="Buscar sesión…" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
              <select className="ses-select" value={filterMod} onChange={e=>setFilterMod(e.target.value)}>
                {modulos.map(m=><option key={m}>{m}</option>)}
              </select>
              <select className="ses-select" value={filterEst} onChange={e=>setFilterEst(e.target.value)}>
                {["Todos","Publicada","Borrador"].map(e=><option key={e}>{e}</option>)}
              </select>
              <button className="btn-ghost" onClick={()=>setSortAsc(!sortAsc)}>⇅ {sortAsc?"Asc":"Desc"}</button>
            </div>
            <div className="ses-table-wrap">
              <table className="ses-table">
                <thead>
                  <tr>
                    <th className="c" style={{ width:38 }}>#</th>
                    <th>Sesión</th><th>Módulo</th><th>Duración</th>
                    <th className="c">Lecc.</th><th className="c">Rec.</th>
                    <th>Estado</th><th>Publicada</th><th className="c">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading?(
                    <tr><td colSpan={9} style={{ padding:48,textAlign:"center" }}><div style={{ width:28,height:28,border:"3px solid #fce8ed",borderTopColor:"#a0435f",borderRadius:"50%",margin:"0 auto",animation:"spin 1s linear infinite" }} /></td></tr>
                  ):visible.length===0?(
                    <tr><td colSpan={9} style={{ padding:48,textAlign:"center",color:"#c0909a" }}>Sin resultados.</td></tr>
                  ):visible.map(s=>(
                    <tr key={s.id}>
                      <td style={{ textAlign:"center" }}><span style={{ fontSize:12,fontWeight:600,color:"#c0909a" }}>{s.orden}</span></td>
                      <td style={{ minWidth:180 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <Thumb orden={s.orden} />
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:600,color:"#2d1a22",fontSize:13 }}>
                              {s.titulo}
                              {(s.es_gratis===1||s.es_gratis===true)&&<span style={{ marginLeft:6,fontSize:9,background:"#fce8ed",color:"#a0435f",fontWeight:700,padding:"2px 6px",borderRadius:99 }}>GRATIS</span>}
                            </div>
                            <div style={{ fontSize:11,color:"#c0909a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220 }}>
                              {(s.descripcion||"Sin descripción").slice(0,50)}{(s.descripcion||"").length>50?"…":""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><ModBadge m={s.modulo} /></td>
                      <td style={{ color:"#555",whiteSpace:"nowrap" }}>{s.duracion||"—"}</td>
                      <td style={{ textAlign:"center",fontWeight:500,color:"#2d1a22" }}>{s.lecciones??("—")}</td>
                      <td style={{ textAlign:"center",fontWeight:500,color:"#2d1a22" }}>{s.recursos??("—")}</td>
                      <td><StatusBadge estado={s.estado} /></td>
                      <td style={{ color:"#9a6672",whiteSpace:"nowrap",fontSize:12 }}>
                        {s.publicada_el?new Date(s.publicada_el).toLocaleDateString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric"}):"—"}
                      </td>
                      <td>
                        <div style={{ display:"flex",gap:4,justifyContent:"center" }}>
                          <button className="act-btn" title="Vista estudiante" onClick={()=>setStudentView(true)}>👁</button>
                          <button className="act-btn accent" title="Editar" onClick={()=>setEditModal(s)}>✏️</button>
                          <button className="act-btn" title="Más opciones">⋯</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading&&<div style={{ padding:"10px 18px",borderTop:"1px solid #f8f0f2",fontSize:12,color:"#c0909a" }}>Mostrando {visible.length} de {total} sesiones</div>}
          </div>

          {/* Sidebar */}
          <div className="ses-sidebar">
            {/* Dona — datos reales */}
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #f0dde2",padding:20 }}>
              <div style={{ fontWeight:700,fontSize:14,color:"#2d1a22",marginBottom:16 }}>Progreso general</div>
              <div style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
                <DonutChart completadas={cPct} enProgreso={ePct} sinIniciar={sPct} />
                <div style={{ display:"flex",flexDirection:"column",gap:10,flex:1,minWidth:90 }}>
                  {[["Completadas",`${cPct}%`,"#c0435f"],["En progreso",`${ePct}%`,"#e8b0bc"],["Sin iniciar",`${sPct}%`,"#f0dde2"]].map(([l,p,c])=>(
                    <div key={l} style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ width:10,height:10,borderRadius:3,background:c,flexShrink:0 }} />
                      <span style={{ fontSize:12,color:"#9a6672",flex:1 }}>{l}</span>
                      <span style={{ fontSize:12,fontWeight:700,color:"#2d1a22" }}>{loading?"—":p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actividad reciente — desde BD */}
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #f0dde2",padding:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#2d1a22" }}>Actividad reciente</div>
                <button style={{ background:"none",border:"none",fontSize:12,color:"#a0435f",cursor:"pointer",fontWeight:600 }}>Ver todas</button>
              </div>
              {actividad.length===0?(
                <div style={{ textAlign:"center",padding:"12px 0",color:"#c0909a",fontSize:12 }}>Sin actividad reciente.</div>
              ):(
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  {actividad.map((a,i)=>{
                    const bgs=["#fce8ed","#e8effe","#e8fee8","#fef8e0","#f8e8fe"];
                    return (
                      <div key={a.id||i} style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                        <div style={{ width:30,height:30,borderRadius:9,background:bgs[i%bgs.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#a0435f",flexShrink:0 }}>
                          {(a.ini_nombre||"?")}{(a.ini_apellido||"")}
                        </div>
                        <div>
                          <div style={{ fontSize:12,color:"#2d1a22" }}>
                            <b style={{ fontWeight:600 }}>{a.nombre}</b>{" "}
                            {a.tipo_evento==="completado"?"completó":"inició"} {a.sesion_titulo}
                          </div>
                          <div style={{ fontSize:11,color:"#c0909a" }}>
                            {new Date(a.fecha).toLocaleDateString("es-CO",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tipos de recursos — desde BD */}
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #f0dde2",padding:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#2d1a22" }}>Tipos de recursos</div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {tiposRecursos.length===0?(
                  <div style={{ textAlign:"center",padding:"8px 0",color:"#c0909a",fontSize:12 }}>Sin recursos aún.</div>
                ):tiposRecursos.map(r=>{
                  const [bg]=TIPO_COLOR[r.tipo]||TIPO_COLOR.otro;
                  return (
                    <div key={r.tipo} style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:30,height:30,borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>{TIPO_ICON[r.tipo]||"📁"}</div>
                      <span style={{ fontSize:13,color:"#555",flex:1 }}>{TIPO_LABELS[r.tipo]||r.tipo}</span>
                      <span style={{ fontSize:13,fontWeight:700,color:"#2d1a22" }}>{r.cantidad}</span>
                    </div>
                  );
                })}
                <div style={{ marginTop:8,paddingTop:12,borderTop:"1px solid #f0dde2",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ fontSize:12,fontWeight:700,color:"#9a6672",textTransform:"uppercase",letterSpacing:.5 }}>Total</span>
                  <span style={{ fontSize:14,fontWeight:700,color:"#2d1a22" }}>{loading?"—":totalRec}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}