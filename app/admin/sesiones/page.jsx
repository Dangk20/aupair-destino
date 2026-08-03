"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Pencil,
  FileText, FileEdit, Folder, Lock, Paperclip, Users, Search, Eye,
  PlayCircle, CheckCircle2, Timer, Trash2,
} from "lucide-react";

const STYLES = `
  .ses-page { min-height:100vh; background:#faf6f7; font-family:system-ui,-apple-system,sans-serif; }
  .ses-inner { max-width:1400px; margin:0 auto; padding:28px 24px 48px; }
  .ses-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:24px; }
  .ses-header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .ses-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:24px; }
  @media(max-width:1100px){ .ses-stats{ grid-template-columns:repeat(3,1fr); } }
  @media(max-width:680px){ .ses-stats{ grid-template-columns:repeat(2,1fr); } }
  .ses-main { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
  @media(max-width:1024px){ .ses-main{ grid-template-columns:1fr; } }
  .ses-sidebar { display:flex; flex-direction:column; gap:16px; }
  @media(max-width:1024px){ .ses-sidebar{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; } }
  @media(max-width:580px){ .ses-sidebar{ grid-template-columns:1fr; } }
  .ses-filters { display:flex; align-items:center; gap:10px; padding:14px 18px; border-bottom:1px solid #f8f0f2; flex-wrap:wrap; }
  .ses-search { position:relative; flex:1 1 160px; min-width:130px; }
  .ses-search input { width:100%; padding:0 12px 0 34px; height:36px; border:1.5px solid #F5E1E7; border-radius:10px; font-size:13px; color:#4A2A38; background:#fff; outline:none; box-sizing:border-box; font-family:inherit; }
  .ses-search .ico { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#C9A9B4; pointer-events:none; }
  .ses-table-wrap { overflow-x:auto; }
  .ses-table { width:100%; border-collapse:collapse; font-size:13px; min-width:740px; }
  .ses-table th { padding:11px 13px; text-align:left; color:#9C8790; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.6px; border-bottom:1px solid #F5E1E7; white-space:nowrap; background:#FBF4F6; }
  .ses-table th.c { text-align:center; }
  .ses-table td { padding:11px 13px; border-bottom:1px solid #fdf0f2; vertical-align:middle; }
  .ses-table tr:last-child td { border-bottom:none; }
  .ses-table tbody tr:hover td { background:#FBF4F6; }
  .btn-ghost { height:36px; padding:0 14px; border-radius:10px; border:1.5px solid #F5E1E7; background:#fff; font-size:13px; color:#9C8790; cursor:pointer; display:inline-flex; align-items:center; gap:6px; white-space:nowrap; font-family:inherit; transition:all .12s; }
  .btn-ghost:hover { background:#FBF4F6; border-color:#C77D93; color:#A0435F; }
  .btn-primary { height:36px; padding:0 18px; border-radius:10px; border:none; background:#A0435F; color:#fff; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; white-space:nowrap; font-family:inherit; transition:background .12s; }
  .btn-primary:hover { background:#7D2F47; }
  .ses-select { height:36px; border:1.5px solid #F5E1E7; border-radius:10px; padding:0 10px; font-size:13px; color:#4A2A38; background:#fff; cursor:pointer; outline:none; font-family:inherit; }
  .act-btn { width:30px; height:30px; border-radius:8px; border:1px solid #F5E1E7; background:#fff; color:#9C8790; cursor:pointer; font-size:13px; display:inline-flex; align-items:center; justify-content:center; transition:all .12s; }
  .act-btn:hover, .act-btn.accent { background:#FCE8EE; border-color:#C77D93; color:#A0435F; }
  .act-btn.danger:hover { background:#fee8e8; border-color:#f0b0b0; color:#c03030; }
  .modal-overlay { position:fixed; inset:0; background:rgba(45,26,34,.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; box-sizing:border-box; }
  .modal-box { background:#fff; border-radius:20px; width:100%; max-width:580px; box-shadow:0 20px 60px rgba(160,67,95,.18); animation:modalIn .2s ease; max-height:92vh; overflow-y:auto; display:flex; flex-direction:column; }
  .modal-input { width:100%; border:1.5px solid #F5E1E7; border-radius:12px; padding:10px 14px; font-size:13px; color:#4A2A38; background:#fff; outline:none; font-family:inherit; resize:vertical; box-sizing:border-box; transition:border-color .15s; }
  .modal-input:focus { border-color:#C77D93; }
  .modal-tabs { display:flex; border-bottom:1px solid #F5E1E7; margin:0 24px; }
  .modal-tab { padding:11px 16px; font-size:13px; font-weight:600; color:#9C8790; cursor:pointer; border:none; background:none; border-bottom:2px solid transparent; margin-bottom:-1px; font-family:inherit; transition:all .12s; }
  .modal-tab.active { color:#A0435F; border-bottom-color:#A0435F; }
  .upload-zone { border:2px dashed #F5E1E7; border-radius:14px; padding:24px; text-align:center; cursor:pointer; transition:all .15s; background:#FBF4F6; }
  .upload-zone:hover, .upload-zone.drag { border-color:#C77D93; }
  .upload-zone input[type=file] { display:none; }
  .recurso-item { display:flex; align-items:center; gap:10px; padding:10px 12px; background:#FBF4F6; border:1px solid #F5E1E7; border-radius:12px; }
  .sv-overlay { position:fixed; inset:0; background:rgba(20,8,14,.6); display:flex; align-items:stretch; justify-content:flex-end; z-index:1000; animation:fadeIn .2s ease; }
  .sv-panel { width:100%; max-width:860px; background:#f9f4f5; overflow-y:auto; animation:slideIn .25s ease; }
  .sv-header { background:linear-gradient(135deg,#4A2A38,#5a2a3a); color:#fff; padding:28px 28px 24px; position:sticky; top:0; z-index:10; }
  .sv-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; padding:24px 28px; }
  @media(max-width:640px){ .sv-grid{ grid-template-columns:1fr; } }
  .sv-card { background:#fff; border-radius:16px; border:1px solid #F5E1E7; overflow:hidden; cursor:pointer; transition:transform .15s, box-shadow .15s; }
  .sv-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(160,67,95,.12); }
  .sv-card.active { border-color:#C77D93; box-shadow:0 0 0 2px #FCE8EE; }
  .toast { position:fixed; top:20px; right:20px; z-index:2000; background:#4A2A38; color:#fff; padding:12px 20px; border-radius:14px; font-size:13px; font-weight:600; box-shadow:0 8px 30px rgba(0,0,0,.2); animation:fadeIn .2s ease; }
  .video-toggle { display:flex; border:1.5px solid #F5E1E7; border-radius:12px; overflow:hidden; }
  .video-toggle button { flex:1; padding:9px 12px; border:none; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
  .video-toggle button.active { background:#A0435F; color:#fff; }
  .video-toggle button:not(.active) { background:#fff; color:#9C8790; }
  .video-toggle button:not(.active):hover { background:#FBF4F6; color:#A0435F; }
  .info-box { background:#f0f8ff; border:1px solid #b8d8f0; border-radius:10px; padding:10px 14px; font-size:12px; color:#A0435F; line-height:1.6; }
  @keyframes spin { to{ transform:rotate(360deg); } }
  @keyframes fadeIn { from{ opacity:0; } to{ opacity:1; } }
  @keyframes slideIn { from{ transform:translateX(40px); opacity:0; } to{ transform:translateX(0); opacity:1; } }
  @keyframes modalIn { from{ opacity:0; transform:scale(.96); } to{ opacity:1; transform:scale(1); } }
`;

const MOD_C = {
  "Modulo 1":["#FCE8EE","#A0435F"],"Modulo 2":["#fce0d0","#9a4020"],
  "Modulo 3":["#fdf0d0","#8a6010"],"Modulo 4":["#e0f0e0","#306030"],
  "Modulo 5":["#e0eafa","#2040a0"],"Modulo 6":["#ede0fc","#5030a0"],
};
const ModBadge = ({ m }) => {
  const [bg,fg] = MOD_C[m]||["#FCE8EE","#7D2F47"];
  return <span style={{background:bg,color:fg,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:999}}>{m||"—"}</span>;
};
const StatusBadge = ({ estado }) => {
  const pub = !estado || /publicada/i.test(estado);
  return <span style={{background:pub?"#e8f4e8":"#f8f0e0",color:pub?"#12A46B":"#8a6010",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:999}}>{pub?"Publicada":"Borrador"}</span>;
};
const GRADS=[["#FCE8EE","#f0c0cc"],["#e8f0fc","#c0ccf0"],["#e8fce8","#b0e0b0"],["#fce8fc","#e0b0e0"],["#fce8d0","#f0c090"],["#e0f0f8","#a0d0e8"]];
const Thumb = ({ orden }) => { const [g1,g2]=GRADS[(orden-1)%GRADS.length]; return <div style={{width:44,height:34,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg,${g1},${g2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#A0435F"}}>{orden}</div>; };

const TIPO_ICON  = { pdf:FileText, docx:FileEdit, otro:Folder };
const TIPO_COLOR = { pdf:["#FCE8EE","#A0435F"], docx:["#FCE8EE","#3060c0"], otro:["#FBF4F6","#7D2F47"] };
function formatBytes(kb) { if(!kb)return""; return kb<1024?`${kb} KB`:`${(kb/1024).toFixed(1)} MB`; }
function extractYoutubeId(url) {
  if (!url) return "";
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : url.trim();
}

function DonutChart({ completadas=0, enProgreso=0, sinIniciar=100 }) {
  const r=54,cx=70,cy=70,sw=14,circ=2*Math.PI*r;
  const slices=[{pct:completadas,color:"#A0435F"},{pct:enProgreso,color:"#C77D93"},{pct:sinIniciar,color:"#f5e0e5"}];
  let off=0;
  return (
    <svg viewBox="0 0 140 140" width={130} height={130} style={{flexShrink:0}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FCE8EE" strokeWidth={sw}/>
      {slices.map((s)=>{ const d=(s.pct/100)*circ; const el=<circle key={s.color} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw} strokeDasharray={`${d} ${circ-d}`} strokeDashoffset={-off*circ/100+circ*.25}/>; off+=s.pct; return el; })}
      <text x={cx} y={cy-8}  textAnchor="middle" fill="#4A2A38" fontSize="22" fontWeight="700" fontFamily="Georgia,serif">{completadas}%</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="#9C8790" fontSize="11">Promedio</text>
      <text x={cx} y={cy+26} textAnchor="middle" fill="#9C8790" fontSize="11">general</text>
    </svg>
  );
}

// ── Shared form fields ──
function VideoFields({ form, setForm, videoTipo, setVideoTipo }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Video</span>
      <div className="video-toggle">
        <button className={videoTipo==="drive"?"active":""} onClick={()=>setVideoTipo("drive")}><Lock size={12} style={{display:"inline",verticalAlign:"-1px",marginRight:4}}/>Google Drive (pago)</button>
        <button className={videoTipo==="youtube"?"active":""} onClick={()=>setVideoTipo("youtube")}>▶ YouTube (gratis)</button>
      </div>
      {videoTipo==="drive" ? (
        <>
          <input className="modal-input" type="text" placeholder="ID del archivo en Drive (Ej: 1ABC123xyz)"
            value={form.video_drive_id} onChange={e=>setForm({...form,video_drive_id:e.target.value.trim()})}/>
          <div className="info-box">
            <strong>Como obtener el ID:</strong><br/>
            1. Drive → clic derecho → Compartir → "Cualquier persona con el enlace"<br/>
            2. Copia: drive.google.com/file/d/<strong>ESTE_ID</strong>/view<br/>
            3. Pega solo el ID aqui
          </div>
          {form.video_drive_id && (
            <div style={{position:"relative",paddingBottom:"56.25%",borderRadius:12,overflow:"hidden",background:"#111"}}>
              <iframe src={`https://drive.google.com/file/d/${form.video_drive_id}/preview`}
                style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} allow="autoplay; fullscreen" allowFullScreen/>
            </div>
          )}
        </>
      ) : (
        <>
          <input className="modal-input" type="text" placeholder="URL o ID de YouTube"
            value={form.video_youtube_id} onChange={e=>setForm({...form,video_youtube_id:e.target.value})}/>
          <div className="info-box">
            Pega la URL completa o solo el ID.<br/>
            Ej: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>
          </div>
          {form.video_youtube_id && (
            <div style={{position:"relative",paddingBottom:"56.25%",borderRadius:12,overflow:"hidden",background:"#111"}}>
              <iframe src={`https://www.youtube.com/embed/${extractYoutubeId(form.video_youtube_id)}?rel=0&modestbranding=1`}
                style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} allowFullScreen/>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Edit Modal ──
function EditModal({ sesion, onClose, onSaved }) {
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({
    titulo:           sesion.titulo           || "",
    descripcion:      sesion.descripcion      || "",
    video_drive_id:   sesion.video_drive_id   || "",
    video_youtube_id: sesion.video_youtube_id || "",
    es_gratis:        sesion.es_gratis === 1 || sesion.es_gratis === true,
    duracion_min:     sesion.duracion_min     || "",
    modulo:           sesion.modulo           || "",
    estado:           sesion.estado           || "Publicada",
  });
  const [videoTipo, setVideoTipo] = useState(sesion.video_youtube_id ? "youtube" : "drive");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [recursos, setRecursos] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [drag, setDrag] = useState(false);
  const [nombreEdit, setNombreEdit] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const cargarRecursos = useCallback(() => {
    setLoadingRec(true);
    fetch(`/api/admin/recursos?sesion_id=${sesion.id}`)
      .then(r=>r.json()).then(d=>{ setRecursos(d.recursos||[]); setLoadingRec(false); })
      .catch(()=>setLoadingRec(false));
  }, [sesion.id]);

  useEffect(() => { if(tab==="recursos") cargarRecursos(); }, [tab]);

  const save = async () => {
    if (!form.titulo.trim()) { setErr("El titulo es obligatorio."); return; }
    setSaving(true); setErr("");
    const payload = { id:sesion.id, ...form,
      video_youtube_id: videoTipo==="youtube" ? extractYoutubeId(form.video_youtube_id) : null,
      video_drive_id:   videoTipo==="drive"   ? form.video_drive_id.trim() : null,
    };
    try {
      const res = await fetch("/api/admin/sesiones", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      if (res.ok) { onSaved(); onClose(); }
      else { const d=await res.json().catch(()=>{}); setErr(d?.error||"Error al guardar."); }
    } catch { setErr("Error de conexion."); }
    setSaving(false);
  };

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { setUploadErr("Solo PDF o Word"); return; }
    if (file.size > 20*1024*1024) { setUploadErr("Maximo 20 MB"); return; }
    setSelectedFile(file); setNombreEdit(file.name.replace(/\.[^.]+$/,"")); setUploadErr("");
  };
  const uploadFile = async () => {
    if (!selectedFile) return;
    setUploading(true); setUploadErr("");
    const fd = new FormData();
    fd.append("sesion_id", sesion.id); fd.append("file", selectedFile); fd.append("nombre", nombreEdit||selectedFile.name);
    try {
      const res = await fetch("/api/admin/recursos", { method:"POST", body:fd });
      if (res.ok) { setSelectedFile(null); setNombreEdit(""); cargarRecursos(); }
      else setUploadErr("Error al subir.");
    } catch { setUploadErr("Error de conexion."); }
    setUploading(false);
  };
  const deleteRecurso = async (id) => {
    if (!confirm("Eliminar este recurso?")) return;
    await fetch(`/api/admin/recursos?id=${id}`, { method:"DELETE" });
    cargarRecursos();
  };

  return (
    <div className="modal-overlay" onClick={(e)=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div style={{padding:"20px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#C9A9B4",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Sesion {sesion.orden}</div>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#4A2A38",fontFamily:"Georgia,serif"}}>{sesion.titulo}</h2>
          </div>
          <button onClick={onClose} style={{background:"#FCE8EE",border:"none",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:20,color:"#A0435F",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
        </div>
        <div className="modal-tabs" style={{marginTop:14}}>
          <button className={`modal-tab${tab==="info"?" active":""}`} onClick={()=>setTab("info")}>Info</button>
          <button className={`modal-tab${tab==="video"?" active":""}`} onClick={()=>setTab("video")}>Video</button>
          <button className={`modal-tab${tab==="recursos"?" active":""}`} onClick={()=>setTab("recursos")}>
            Recursos {recursos.length>0&&<span style={{background:"#FCE8EE",color:"#A0435F",borderRadius:99,fontSize:10,fontWeight:700,padding:"1px 6px",marginLeft:4}}>{recursos.length}</span>}
          </button>
        </div>

        {tab==="info" && (
          <div style={{padding:"18px 24px",display:"flex",flexDirection:"column",gap:14,overflowY:"auto"}}>
            {err&&<div style={{background:"#FCE8EE",border:"1px solid #C77D93",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#A0435F"}}>{err}</div>}
            <label style={{display:"flex",flexDirection:"column",gap:5}}>
              <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Titulo *</span>
              <input className="modal-input" type="text" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/>
            </label>
            <label style={{display:"flex",flexDirection:"column",gap:5}}>
              <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Descripcion</span>
              <textarea className="modal-input" rows={3} value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/>
            </label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <label style={{display:"flex",flexDirection:"column",gap:5}}>
                <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Duracion (min)</span>
                <input className="modal-input" type="number" min="1" placeholder="45" value={form.duracion_min} onChange={e=>setForm({...form,duracion_min:e.target.value})}/>
              </label>
              <label style={{display:"flex",flexDirection:"column",gap:5}}>
                <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Modulo</span>
                <input className="modal-input" type="text" placeholder="Modulo 1" value={form.modulo} onChange={e=>setForm({...form,modulo:e.target.value})}/>
              </label>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <label style={{display:"flex",flexDirection:"column",gap:5}}>
                <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Estado</span>
                <select className="modal-input" value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} style={{cursor:"pointer"}}>
                  <option value="Publicada">Publicada</option>
                  <option value="Borrador">Borrador</option>
                </select>
              </label>
              <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:"#FBF4F6",border:"1.5px solid #F5E1E7",borderRadius:12,padding:"10px 14px",marginTop:18}}>
                <div onClick={()=>setForm({...form,es_gratis:!form.es_gratis})}
                  style={{width:20,height:20,borderRadius:6,border:`2px solid ${form.es_gratis?"#A0435F":"#C77D93"}`,background:form.es_gratis?"#A0435F":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  {form.es_gratis&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>v</span>}
                </div>
                <div>
                  <span style={{fontSize:13,fontWeight:600,color:"#4A2A38"}}>Sesion gratuita</span>
                  <p style={{margin:0,fontSize:11,color:"#9C8790"}}>Visible sin pago</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {tab==="video" && (
          <div style={{padding:"18px 24px",overflowY:"auto"}}>
            <VideoFields form={form} setForm={setForm} videoTipo={videoTipo} setVideoTipo={setVideoTipo}/>
          </div>
        )}

        {tab==="recursos" && (
          <div style={{padding:"18px 24px",display:"flex",flexDirection:"column",gap:16,overflowY:"auto"}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7,marginBottom:10}}>Subir documento</div>
              <div className={`upload-zone${drag?" drag":""}`}
                onClick={()=>!selectedFile&&fileRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setDrag(true);}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={e=>handleFile(e.target.files[0])}/>
                {!selectedFile ? (
                  <><Paperclip size={28} style={{color:"#C77D93",marginBottom:8}}/>
                  <div style={{fontSize:13,fontWeight:600,color:"#A0435F",marginBottom:4}}>Arrastra o haz clic</div>
                  <div style={{fontSize:11,color:"#C9A9B4"}}>PDF, Word - max. 20 MB</div></>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
                      {selectedFile.name.endsWith(".pdf")?<FileText size={22}/>:<FileEdit size={22}/>}
                      <div style={{textAlign:"left"}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#4A2A38"}}>{selectedFile.name}</div>
                        <div style={{fontSize:11,color:"#9C8790"}}>{formatBytes(Math.round(selectedFile.size/1024))}</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setSelectedFile(null);setNombreEdit("");}} style={{background:"#FCE8EE",border:"none",borderRadius:8,padding:"4px 8px",fontSize:11,color:"#A0435F",cursor:"pointer",marginLeft:"auto"}}>x</button>
                    </div>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#9C8790",marginBottom:4}}>Nombre para estudiantes:</div>
                      <input className="modal-input" value={nombreEdit} onChange={e=>setNombreEdit(e.target.value)} placeholder="Guia de documentos"/>
                    </div>
                  </div>
                )}
              </div>
              {uploadErr&&<div style={{marginTop:8,fontSize:12,color:"#A0435F"}}>{uploadErr}</div>}
              {selectedFile&&(
                <button onClick={uploadFile} disabled={uploading}
                  style={{marginTop:10,width:"100%",padding:"10px",borderRadius:12,border:"none",background:uploading?"#C9A9B4":"#A0435F",color:"#fff",fontSize:13,fontWeight:600,cursor:uploading?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {uploading?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Subiendo...</>:"Subir documento"}
                </button>
              )}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7,marginBottom:10}}>Documentos en esta sesion</div>
              {loadingRec ? (
                <div style={{textAlign:"center",padding:20}}><div style={{width:24,height:24,border:"3px solid #FCE8EE",borderTopColor:"#A0435F",borderRadius:"50%",margin:"0 auto",animation:"spin 1s linear infinite"}}/></div>
              ) : recursos.length===0 ? (
                <div style={{textAlign:"center",padding:"20px 0",color:"#C9A9B4",fontSize:13}}>Sin documentos aun.</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {recursos.map((r)=>{
                    const [bg,fg]=TIPO_COLOR[r.tipo]||TIPO_COLOR.otro;
                    return (
                      <div key={r.id} className="recurso-item">
                        <div style={{width:34,height:34,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#A0435F"}}>{(() => { const I = TIPO_ICON[r.tipo] || Folder; return <I size={16}/>; })()}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:"#4A2A38",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.nombre}</div>
                          <div style={{fontSize:11,color:"#C9A9B4"}}>
                            <span style={{background:bg,color:fg,borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:600,marginRight:6}}>{r.tipo?.toUpperCase()}</span>
                            {formatBytes(r.tamano_kb)}
                          </div>
                        </div>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" style={{padding:"5px 10px",borderRadius:8,border:"1px solid #F5E1E7",background:"#fff",color:"#9C8790",fontSize:12,textDecoration:"none"}}>Abrir</a>
                        <button onClick={()=>deleteRecurso(r.id)} style={{padding:"5px 10px",borderRadius:8,border:"1px solid #FCE8EE",background:"#FCE8EE",color:"#A0435F",fontSize:12,cursor:"pointer"}}>Borrar</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{padding:"0 24px 20px",display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0}}>
          <button onClick={onClose} style={{padding:"9px 18px",borderRadius:12,border:"1.5px solid #F5E1E7",background:"#fff",color:"#9C8790",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
          {tab!=="recursos"&&(
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:12,border:"none",background:saving?"#C9A9B4":"#A0435F",color:"#fff",fontSize:13,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}}>
              {saving?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Guardando...</>:"Guardar cambios"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Nueva Modal ──
function NuevaModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    titulo:"", descripcion:"", video_drive_id:"", video_youtube_id:"",
    es_gratis:false, duracion_min:"", modulo:"", estado:"Publicada",
  });
  const [videoTipo, setVideoTipo] = useState("drive");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    if (!form.titulo.trim()) { setErr("El titulo es obligatorio."); return; }
    setSaving(true); setErr("");
    const payload = { ...form,
      video_youtube_id: videoTipo==="youtube" ? extractYoutubeId(form.video_youtube_id) : null,
      video_drive_id:   videoTipo==="drive"   ? form.video_drive_id.trim() : null,
    };
    try {
      const res = await fetch("/api/admin/sesiones", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      if (res.ok) { onSaved(); onClose(); }
      else { const d=await res.json().catch(()=>{}); setErr(d?.error||"Error al crear."); }
    } catch { setErr("Error de conexion."); }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={(e)=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div style={{padding:"20px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#4A2A38",fontFamily:"Georgia,serif"}}>Nueva sesion</h2>
          <button onClick={onClose} style={{background:"#FCE8EE",border:"none",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:20,color:"#A0435F",display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
        </div>
        <div style={{padding:"18px 24px",display:"flex",flexDirection:"column",gap:14,overflowY:"auto"}}>
          {err&&<div style={{background:"#FCE8EE",border:"1px solid #C77D93",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#A0435F"}}>{err}</div>}
          <label style={{display:"flex",flexDirection:"column",gap:5}}>
            <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Titulo *</span>
            <input className="modal-input" type="text" placeholder="Como preparar tu visa" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/>
          </label>
          <label style={{display:"flex",flexDirection:"column",gap:5}}>
            <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Descripcion</span>
            <textarea className="modal-input" rows={2} value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/>
          </label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <label style={{display:"flex",flexDirection:"column",gap:5}}>
              <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Duracion (min)</span>
              <input className="modal-input" type="number" min="1" placeholder="45" value={form.duracion_min} onChange={e=>setForm({...form,duracion_min:e.target.value})}/>
            </label>
            <label style={{display:"flex",flexDirection:"column",gap:5}}>
              <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Modulo</span>
              <input className="modal-input" type="text" placeholder="Modulo 1" value={form.modulo} onChange={e=>setForm({...form,modulo:e.target.value})}/>
            </label>
          </div>
          <VideoFields form={form} setForm={setForm} videoTipo={videoTipo} setVideoTipo={setVideoTipo}/>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:"#FBF4F6",border:"1.5px solid #F5E1E7",borderRadius:12,padding:"10px 14px"}}>
            <div onClick={()=>setForm({...form,es_gratis:!form.es_gratis})}
              style={{width:20,height:20,borderRadius:6,border:`2px solid ${form.es_gratis?"#A0435F":"#C77D93"}`,background:form.es_gratis?"#A0435F":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
              {form.es_gratis&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>v</span>}
            </div>
            <div>
              <span style={{fontSize:13,fontWeight:600,color:"#4A2A38"}}>Sesion gratuita</span>
              <p style={{margin:0,fontSize:11,color:"#9C8790"}}>Visible para todas sin pago</p>
            </div>
          </label>
          <label style={{display:"flex",flexDirection:"column",gap:5}}>
            <span style={{fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.7}}>Estado</span>
            <select className="modal-input" value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} style={{cursor:"pointer"}}>
              <option value="Publicada">Publicada</option>
              <option value="Borrador">Borrador</option>
            </select>
          </label>
        </div>
        <div style={{padding:"0 24px 20px",display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0}}>
          <button onClick={onClose} style={{padding:"9px 18px",borderRadius:12,border:"1.5px solid #F5E1E7",background:"#fff",color:"#9C8790",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
          <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:12,border:"none",background:saving?"#C9A9B4":"#A0435F",color:"#fff",fontSize:13,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}}>
            {saving?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Creando...</>:"Crear sesion"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Student View ──
function StudentView({ sesiones, onClose }) {
  const [selected, setSelected] = useState(null);
  const published = sesiones.filter(s=>!s.estado||/publicada/i.test(s.estado));
  useEffect(()=>{ const first=published.find(s=>s.es_gratis===1||s.es_gratis===true)||published[0]; if(first) setSelected(first); },[]);

  const getEmbed = (s) => {
    if (!s) return null;
    if (s.video_youtube_id) return `https://www.youtube.com/embed/${s.video_youtube_id}?rel=0&modestbranding=1`;
    if (s.video_drive_id)   return `https://drive.google.com/file/d/${s.video_drive_id}/preview`;
    return null;
  };
  const embedUrl = getEmbed(selected);
  const done = Math.round(published.length * 0.68);

  return (
    <div className="sv-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sv-panel">
        <div className="sv-header">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"rgba(255,255,255,.85)",marginBottom:14}}>
              Vista de estudiante
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:10,width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
          </div>
          <h2 style={{margin:"0 0 4px",fontSize:"clamp(18px,3vw,24px)",fontWeight:700,fontFamily:"Georgia,serif",color:"#fff"}}>Destino Au Pair</h2>
          <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,.65)"}}>{published.length} sesiones</p>
          <div style={{marginTop:14,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1,height:6,background:"rgba(255,255,255,.2)",borderRadius:99}}>
              <div style={{height:"100%",width:`${Math.round(done/Math.max(published.length,1)*100)}%`,background:"#C77D93",borderRadius:99}}/>
            </div>
            <span style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>{done}/{published.length} completadas</span>
          </div>
        </div>

        {selected && (
          <div style={{background:"#fff",margin:"24px 28px 0",borderRadius:16,border:"1px solid #F5E1E7",overflow:"hidden"}}>
            <div style={{position:"relative",width:"100%",paddingTop:"56.25%",background:"#1a0a10"}}>
              {embedUrl ? (
                <iframe src={embedUrl} allowFullScreen allow="autoplay; fullscreen"
                  style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}}/>
              ) : (
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#C77D93",gap:10}}>
                  <span style={{fontSize:48}}>play</span>
                  <span style={{fontSize:14}}>Sin video asignado</span>
                </div>
              )}
            </div>
            <div style={{padding:"16px 20px"}}>
              <div style={{fontSize:11,color:"#C9A9B4",fontWeight:600,textTransform:"uppercase",marginBottom:4}}>Sesion {selected.orden}</div>
              <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:700,color:"#4A2A38",fontFamily:"Georgia,serif"}}>{selected.titulo}</h3>
              {selected.descripcion&&<p style={{margin:0,fontSize:13,color:"#7a5060",lineHeight:1.6}}>{selected.descripcion}</p>}
            </div>
          </div>
        )}

        <div style={{padding:"20px 28px 8px"}}>
          <h4 style={{margin:"0 0 14px",fontSize:13,fontWeight:700,color:"#9C8790",textTransform:"uppercase",letterSpacing:.6}}>Todas las sesiones</h4>
        </div>
        <div className="sv-grid">
          {published.map((s,i)=>{
            const active=selected?.id===s.id;
            const isDone=i<done;
            const [g1,g2]=GRADS[i%GRADS.length];
            return (
              <div key={s.id} className={`sv-card${active?" active":""}`} onClick={()=>setSelected(s)}>
                <div style={{position:"relative",height:110,background:`linear-gradient(135deg,${g1},${g2})`}}>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:30,fontWeight:800,color:"rgba(160,67,95,.3)",fontFamily:"Georgia,serif"}}>{s.orden}</span>
                  </div>
                  {(s.es_gratis===1||s.es_gratis===true)&&<div style={{position:"absolute",top:8,left:8,background:"#A0435F",color:"#fff",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:99}}>GRATIS</div>}
                  {isDone&&<div style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",background:"#12A46B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff"}}>ok</div>}
                  {active&&<div style={{position:"absolute",bottom:8,right:8,background:"#A0435F",color:"#fff",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:99}}>VIENDO</div>}
                </div>
                <div style={{padding:"12px 14px 14px"}}>
                  <div style={{fontSize:10,color:"#C9A9B4",fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Sesion {s.orden}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#4A2A38",lineHeight:1.35,marginBottom:4}}>{s.titulo}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {s.video_drive_id&&<span style={{fontSize:10,color:"#A0435F",background:"#FCE8EE",padding:"2px 6px",borderRadius:99}}>Drive</span>}
                    {s.video_youtube_id&&<span style={{fontSize:10,color:"#A0435F",background:"#FCE8EE",padding:"2px 6px",borderRadius:99}}>YouTube</span>}
                    {isDone?<span style={{fontSize:11,color:"#12A46B"}}>Completada</span>:<span style={{fontSize:11,color:"#9C8790"}}>Pendiente</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{height:32}}/>
      </div>
    </div>
  );
}

// ═══════════════════════════ MAIN PAGE ═══════════════════════════
export default function AdminSesionesPage() {
  const [sesiones, setSesiones] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [nuevaModal, setNuevaModal] = useState(false);
  const [studentView, setStudentView] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filterMod, setFilterMod] = useState("Todos");
  const [filterEst, setFilterEst] = useState("Todos");
  const [sortAsc, setSortAsc] = useState(true);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/sesiones").then(r=>r.json()),
      fetch("/api/admin/stats").then(r=>r.json()),
    ]).then(([d,s])=>{ setSesiones(d.sesiones||[]); setStats(s); setLoading(false); })
      .catch(()=>setLoading(false));
  };
  useEffect(()=>{ cargar(); },[]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3200); };

  const eliminarSesion = async (id, titulo) => {
    if (!confirm(`Eliminar la sesion "${titulo}"? Esta accion no se puede deshacer.`)) return;
    await fetch(`/api/admin/sesiones?id=${id}`, { method:"DELETE" });
    showToast("Sesion eliminada");
    cargar();
  };

  const total      = stats?.total_sesiones        ?? sesiones.length;
  const publicadas = stats?.publicadas            ?? sesiones.filter(s=>!s.estado||/publicada/i.test(s.estado)).length;
  const promedio   = stats?.promedio_completado   ?? 0;
  const tiempoP    = stats?.tiempo_promedio       ?? "—";
  const totalRec   = stats?.total_recursos        ?? 0;
  const cPct       = stats?.completadas_pct       ?? 0;
  const ePct       = stats?.en_progreso_pct       ?? 0;
  const sPct       = stats?.sin_iniciar_pct       ?? 100;
  const actividad  = stats?.actividad             || [];
  const tiposRec   = stats?.recursos_por_tipo     || [];
  const TIPO_LABELS = { pdf:"Guias PDF", docx:"Documentos Word", otro:"Otros" };

  const modulos = ["Todos",...new Set(sesiones.map(s=>s.modulo).filter(Boolean))];
  const visible = sesiones
    .filter(s=>{
      const q=search.toLowerCase();
      if(q&&!s.titulo.toLowerCase().includes(q)&&!(s.descripcion||"").toLowerCase().includes(q)) return false;
      if(filterMod!=="Todos"&&s.modulo!==filterMod) return false;
      if(filterEst!=="Todos"){ const pub=!s.estado||/publicada/i.test(s.estado); if(filterEst==="Publicada"&&!pub) return false; if(filterEst==="Borrador"&&pub) return false; }
      return true;
    })
    .sort((a,b)=>sortAsc?a.orden-b.orden:b.orden-a.orden);

  // Antes eran una mezcla de emoji, una letra suelta ("T") y la palabra "ok".
  const statCards = [
    { Icono:PlayCircle,   bg:"#FCE8EE", color:"#A0435F", label:"Total sesiones",      val:total },
    { Icono:Users,        bg:"#FCE8EE", color:"#A0435F", label:"Completadas (prom.)", val:`${promedio}%`, bar:true, barVal:promedio },
    { Icono:CheckCircle2, bg:"#E6F9F0", color:"#12A46B", label:"Publicadas",          val:publicadas },
    { Icono:Timer,        bg:"#FFF4EC", color:"#E8853B", label:"Tiempo promedio",     val:tiempoP },
    { Icono:Paperclip,    bg:"#FBF4F6", color:"#A0435F", label:"Recursos",            val:totalRec },
  ];

  return (
    <div className="ses-page">
      <style>{STYLES}</style>
      {toast&&<div className="toast"><CheckCircle2 size={14} style={{display:"inline",verticalAlign:"-2px",marginRight:6}}/>{toast}</div>}
      {editModal&&<EditModal  sesion={editModal} onClose={()=>setEditModal(null)}  onSaved={()=>{ cargar(); showToast("Sesion actualizada"); }}/>}
      {nuevaModal&&<NuevaModal                   onClose={()=>setNuevaModal(false)} onSaved={()=>{ cargar(); showToast("Sesion creada"); }}/>}
      {studentView&&<StudentView sesiones={sesiones} onClose={()=>setStudentView(false)}/>}

      <div className="ses-inner">
        <div className="ses-header">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <h1 style={{margin:0,fontSize:"clamp(18px,3vw,26px)",fontWeight:700,color:"#4A2A38",fontFamily:"Georgia,serif"}}>Sesiones del programa</h1>
              <span style={{background:"#FCE8EE",color:"#A0435F",borderRadius:8,padding:"2px 9px",fontSize:12,fontWeight:700}}>{total}</span>
            </div>
            <p style={{margin:"4px 0 0",fontSize:13,color:"#9C8790"}}>Gestiona el contenido, videos y recursos de cada sesion.</p>
          </div>
          <div className="ses-header-actions">
            <button className="btn-ghost" onClick={()=>setStudentView(true)} style={{borderColor:"#C77D93",color:"#A0435F"}}>Vista de estudiante</button>
            <button className="btn-primary" onClick={()=>setNuevaModal(true)}>+ Nueva sesion</button>
          </div>
        </div>

        <div className="ses-stats">
          {statCards.map(c=>(
            <div key={c.label} style={{background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:c.color}}><c.Icono size={18}/></div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,color:"#9C8790",marginBottom:1}}>{c.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:"#4A2A38",lineHeight:1.1}}>{loading?"—":c.val}</div>
                {c.bar&&<div style={{height:3,background:"#FCE8EE",borderRadius:99,margin:"5px 0 2px",width:80}}><div style={{height:"100%",width:`${c.barVal||0}%`,background:"#A0435F",borderRadius:99}}/></div>}
              </div>
            </div>
          ))}
        </div>

        <div className="ses-main">
          <div style={{background:"#fff",borderRadius:20,border:"1px solid #F5E1E7",overflow:"hidden"}}>
            <div className="ses-filters">
              <div className="ses-search">
                <Search size={14} className="ico"/>
                <input type="text" placeholder="Buscar sesion…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <select className="ses-select" value={filterMod} onChange={e=>setFilterMod(e.target.value)}>
                {modulos.map(m=><option key={m}>{m}</option>)}
              </select>
              <select className="ses-select" value={filterEst} onChange={e=>setFilterEst(e.target.value)}>
                {["Todos","Publicada","Borrador"].map(e=><option key={e}>{e}</option>)}
              </select>
              <button className="btn-ghost" onClick={()=>setSortAsc(!sortAsc)}>Orden {sortAsc?"asc":"desc"}</button>
            </div>
            <div className="ses-table-wrap">
              <table className="ses-table">
                <thead>
                  <tr>
                    <th className="c" style={{width:38}}>#</th>
                    <th>Sesion</th><th>Modulo</th><th>Duracion</th>
                    <th className="c">Video</th><th className="c">Gratis</th>
                    <th>Estado</th><th className="c">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading?(
                    <tr><td colSpan={8} style={{padding:48,textAlign:"center"}}><div style={{width:28,height:28,border:"3px solid #FCE8EE",borderTopColor:"#A0435F",borderRadius:"50%",margin:"0 auto",animation:"spin 1s linear infinite"}}/></td></tr>
                  ):visible.length===0?(
                    <tr><td colSpan={8} style={{padding:48,textAlign:"center",color:"#C9A9B4"}}>Sin resultados.</td></tr>
                  ):visible.map(s=>(
                    <tr key={s.id}>
                      <td style={{textAlign:"center"}}><span style={{fontSize:12,fontWeight:600,color:"#C9A9B4"}}>{s.orden}</span></td>
                      <td style={{minWidth:180}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <Thumb orden={s.orden}/>
                          <div style={{minWidth:0}}>
                            <div style={{fontWeight:600,color:"#4A2A38",fontSize:13}}>{s.titulo}</div>
                            <div style={{fontSize:11,color:"#C9A9B4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220}}>
                              {(s.descripcion||"Sin descripcion").slice(0,50)}{(s.descripcion||"").length>50?"...":""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><ModBadge m={s.modulo}/></td>
                      <td style={{color:"#555",whiteSpace:"nowrap"}}>{s.duracion_min?`${s.duracion_min} min`:"—"}</td>
                      <td style={{textAlign:"center"}}>
                        {s.video_drive_id
                          ? <span style={{fontSize:10,background:"#FCE8EE",color:"#A0435F",padding:"3px 8px",borderRadius:99,fontWeight:600}}>Drive</span>
                          : s.video_youtube_id
                          ? <span style={{fontSize:10,background:"#FCE8EE",color:"#A0435F",padding:"3px 8px",borderRadius:99,fontWeight:600}}>YouTube</span>
                          : <span style={{fontSize:10,color:"#C9A9B4"}}>Sin video</span>
                        }
                      </td>
                      <td style={{textAlign:"center"}}>
                        {(s.es_gratis===1||s.es_gratis===true)
                          ? <span style={{color:"#12A46B",fontWeight:700,fontSize:12}}>Si</span>
                          : <span style={{color:"#C9A9B4",fontSize:12}}>No</span>
                        }
                      </td>
                      <td><StatusBadge estado={s.estado}/></td>
                      <td>
                        <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                          <button className="act-btn" title="Vista estudiante" onClick={()=>setStudentView(true)}><Eye size={14}/></button>
                          <button className="act-btn accent" title="Editar" onClick={()=>setEditModal(s)}><Pencil size={14}/></button>
                          <button className="act-btn danger" title="Eliminar" onClick={()=>eliminarSesion(s.id,s.titulo)}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading&&<div style={{padding:"10px 18px",borderTop:"1px solid #f8f0f2",fontSize:12,color:"#C9A9B4"}}>Mostrando {visible.length} de {total} sesiones</div>}
          </div>

          <div className="ses-sidebar">
            <div style={{background:"#fff",borderRadius:20,border:"1px solid #F5E1E7",padding:20}}>
              <div style={{fontWeight:700,fontSize:14,color:"#4A2A38",marginBottom:16}}>Progreso general</div>
              <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <DonutChart completadas={cPct} enProgreso={ePct} sinIniciar={sPct}/>
                <div style={{display:"flex",flexDirection:"column",gap:10,flex:1,minWidth:90}}>
                  {[["Completadas",`${cPct}%`,"#A0435F"],["En progreso",`${ePct}%`,"#C77D93"],["Sin iniciar",`${sPct}%`,"#F5E1E7"]].map(([l,p,c])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:3,background:c,flexShrink:0}}/>
                      <span style={{fontSize:12,color:"#9C8790",flex:1}}>{l}</span>
                      <span style={{fontSize:12,fontWeight:700,color:"#4A2A38"}}>{loading?"—":p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{background:"#fff",borderRadius:20,border:"1px solid #F5E1E7",padding:20}}>
              <div style={{fontWeight:700,fontSize:14,color:"#4A2A38",marginBottom:14}}>Actividad reciente</div>
              {actividad.length===0 ? (
                <div style={{textAlign:"center",padding:"12px 0",color:"#C9A9B4",fontSize:12}}>Sin actividad reciente.</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {actividad.slice(0,5).map((a,i)=>{
                    const bgs=["#FCE8EE","#FCE8EE","#e8fee8","#fef8e0","#f8e8fe"];
                    return (
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <div style={{width:30,height:30,borderRadius:9,background:bgs[i%bgs.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#A0435F",flexShrink:0}}>
                          {(a.ini_nombre||"?")}
                        </div>
                        <div>
                          <div style={{fontSize:12,color:"#4A2A38"}}>
                            <b style={{fontWeight:600}}>{a.nombre}</b> {a.tipo_evento==="completado"?"completo":"inicio"} {a.sesion_titulo}
                          </div>
                          <div style={{fontSize:11,color:"#C9A9B4"}}>
                            {new Date(a.fecha).toLocaleDateString("es-CO",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{background:"#fff",borderRadius:20,border:"1px solid #F5E1E7",padding:20}}>
              <div style={{fontWeight:700,fontSize:14,color:"#4A2A38",marginBottom:14}}>Tipos de recursos</div>
              {tiposRec.length===0 ? (
                <div style={{textAlign:"center",padding:"8px 0",color:"#C9A9B4",fontSize:12}}>Sin recursos aun.</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {tiposRec.map(r=>{
                    const [bg]=TIPO_COLOR[r.tipo]||TIPO_COLOR.otro;
                    return (
                      <div key={r.tipo} style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:30,height:30,borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{(() => { const I = TIPO_ICON[r.tipo] || Folder; return <I size={15}/>; })()}</div>
                        <span style={{fontSize:13,color:"#555",flex:1}}>{TIPO_LABELS[r.tipo]||r.tipo}</span>
                        <span style={{fontSize:13,fontWeight:700,color:"#4A2A38"}}>{r.cantidad}</span>
                      </div>
                    );
                  })}
                  <div style={{marginTop:8,paddingTop:12,borderTop:"1px solid #F5E1E7",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#9C8790",textTransform:"uppercase",letterSpacing:.5}}>Total</span>
                    <span style={{fontSize:14,fontWeight:700,color:"#4A2A38"}}>{loading?"—":totalRec}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}