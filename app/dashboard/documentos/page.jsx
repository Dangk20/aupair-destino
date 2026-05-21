"use client";
// app/dashboard/documentos/page.jsx

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Calendar, ArrowRight, Upload, CheckCircle2,
  Clock, XCircle, Eye, Trash2, FileText, Image,
  ChevronRight, AlertCircle,
} from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";

/* ─── Colores por estado ─────────────────────────────────────────────────── */
const ESTADO_CFG = {
  aprobado:  { color:"#10b981", bg:"#d1fae5", label:"Aprobado",  icon:CheckCircle2 },
  pendiente: { color:"#d97706", bg:"#fef3c7", label:"En revisión",icon:Clock        },
  rechazado: { color:"#ef4444", bg:"#fee2e2", label:"Rechazado", icon:XCircle       },
};

/* ─── Donut ──────────────────────────────────────────────────────────────── */
function DonutProgress({ pct=0 }) {
  const r=54, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e8f8" strokeWidth="12"/>
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#gd)" strokeWidth="12"
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*.25}
        strokeLinecap="round" style={{ transition:"stroke-dasharray .8s" }}/>
      <defs><linearGradient id="gd" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
      </linearGradient></defs>
      <text x="70" y="63" textAnchor="middle" fill="#1e1033"
        style={{ fontSize:22, fontWeight:700, fontFamily:"Georgia,serif" }}>{pct}%</text>
      <text x="70" y="82" textAnchor="middle" fill="#9a7080"
        style={{ fontSize:11, fontFamily:"system-ui" }}>Completado</text>
    </svg>
  );
}

/* ─── Modal de carga ─────────────────────────────────────────────────────── */
function UploadModal({ doc, onClose, onUploaded }) {
  const [file,      setFile]      = useState(null);
  const [drag,      setDrag]      = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const ref = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const ok = ["application/pdf","image/jpeg","image/png","image/jpg"];
    if (!ok.includes(f.type)) { setError("Solo PDF, JPG o PNG"); return; }
    if (f.size > 10*1024*1024) { setError("Máximo 10 MB"); return; }
    setFile(f); setError("");
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true); setError("");
    const fd = new FormData();
    fd.append("file",    file);
    fd.append("tipo_doc",doc.tipo);
    fd.append("nombre",  file.name);
    const res = await fetch("/api/dashboard/documentos", { method:"POST", body:fd });
    const data = await res.json();
    if (res.ok) { onUploaded(); onClose(); }
    else setError(data.error || "Error al subir");
    setUploading(false);
  };

  const ext = file?.name?.split(".").pop()?.toUpperCase();

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(30,16,51,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:460, boxShadow:"0 20px 60px rgba(0,0,0,.15)", overflow:"hidden" }}>
        <div style={{ height:4, background:"linear-gradient(90deg,#7c3aed,#a0435f)" }} />
        <div style={{ padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:.7, margin:"0 0 4px" }}>
                Subir documento
              </p>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#1e1033", margin:0 }}>
                {doc.emoji} {doc.label}
              </h2>
              <p style={{ fontSize:12, color:"#9a7080", margin:"4px 0 0" }}>Formatos: {doc.formatos} · Máx. 10 MB</p>
            </div>
            <button onClick={onClose} style={{ background:"#f3f4f6", border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:18, color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>

          {error && (
            <div style={{ background:"#fee2e2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <AlertCircle size={14}/> {error}
            </div>
          )}

          {/* Drop zone */}
          <div
            onClick={() => !file && ref.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            style={{ border:`2px dashed ${drag?"#7c3aed":"#e5e7eb"}`, borderRadius:14, padding:24, textAlign:"center", cursor:file?"default":"pointer", background:drag?"#f5f0ff":"#fafafa", transition:"all .15s" }}>
            <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])} />
            {!file ? (
              <>
                <div style={{ fontSize:40, marginBottom:8 }}>📎</div>
                <p style={{ fontSize:13, fontWeight:600, color:"#7c3aed", margin:"0 0 4px" }}>Arrastra o haz clic para subir</p>
                <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>{doc.formatos} · Máx. 10 MB</p>
              </>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center" }}>
                <div style={{ width:44, height:44, borderRadius:10, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                  {ext==="PDF" ? "📄" : "🖼️"}
                </div>
                <div style={{ textAlign:"left" }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:0 }}>{file.name}</p>
                  <p style={{ fontSize:11, color:"#9a7080", margin:0 }}>{(file.size/1024).toFixed(0)} KB · {ext}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); }}
                  style={{ marginLeft:"auto", background:"#fee2e2", border:"none", borderRadius:8, padding:"4px 8px", fontSize:11, color:"#dc2626", cursor:"pointer" }}>
                  ✕ Quitar
                </button>
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:12, border:"1.5px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Cancelar
            </button>
            <button onClick={upload} disabled={!file||uploading}
              style={{ flex:2, padding:"10px", borderRadius:12, border:"none", background:(!file||uploading)?"#c4b5fd":"linear-gradient(135deg,#7c3aed,#a0435f)", color:"#fff", fontSize:13, fontWeight:600, cursor:(!file||uploading)?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {uploading ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>Subiendo…</> : <><Upload size={14}/>Subir documento</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function DocumentosPage() {
  const router = useRouter();
  const [user,       setUser]       = useState(null);
  const [docs,       setDocs]       = useState([]);
  const [requeridos, setRequeridos] = useState([]);
  const [proceso,    setProceso]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filtro,     setFiltro]     = useState("todos"); // todos | pendiente | aprobado | faltantes
  const [modal,      setModal]      = useState(null);    // doc requerido seleccionado
  const [toast,      setToast]      = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  const cargar = () => {
    const safe = (p, fb=null) => p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),              { user:null }),
      safe(fetch("/api/dashboard/documentos"), { docs:[], docs_requeridos:[] }),
      safe(fetch("/api/dashboard/proceso"),    null),
    ]).then(([me, docsData, proc]) => {
      if (me?.user?.rol === "admin" || !me?.user) { router.push("/login"); return; }
      setUser(me.user);
      setDocs(docsData.docs || []);
      setRequeridos(docsData.docs_requeridos || []);
      setProceso(proc);
      setLoading(false);
    });
  };

  useEffect(() => { cargar(); }, []);

  const showToast = (msg, tipo="ok") => { setToast({ msg, tipo }); setTimeout(()=>setToast(null), 3000); };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este documento?")) return;
    setDeleting(id);
    await fetch(`/api/dashboard/documentos?id=${id}`, { method:"DELETE" });
    showToast("Documento eliminado");
    cargar();
    setDeleting(null);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Calcular progreso ── */
  const docsPorTipo     = Object.fromEntries(docs.map(d => [d.tipo_doc, d]));
  const requeridosOblig = requeridos.filter(r => r.requerido);
  const subidos         = requeridosOblig.filter(r => docsPorTipo[r.tipo]);
  const aprobados       = requeridosOblig.filter(r => docsPorTipo[r.tipo]?.estado === "aprobado");
  const pctSubidos      = Math.round((subidos.length / Math.max(requeridosOblig.length, 1)) * 100);
  const fasesCompletadas = proceso?.pasos?.filter(p => ["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id) && p.status === "completado")?.length || 0;
  const pctProceso      = Math.round((fasesCompletadas / 5) * 100);

  /* ── Filtrar docs requeridos ── */
  const filtrados = requeridos.filter(r => {
    const subido = docsPorTipo[r.tipo];
    if (filtro === "aprobado")  return subido?.estado === "aprobado";
    if (filtro === "pendiente") return subido?.estado === "pendiente";
    if (filtro === "faltantes") return !subido;
    return true;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .doc-row:hover{background:#faf5ff!important;}`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:toast.tipo==="error"?"#dc2626":"#1e1033", color:"#fff", padding:"12px 20px", borderRadius:14, fontSize:13, fontWeight:600 }}>
          {toast.msg}
        </div>
      )}

      {/* Modal upload */}
      {modal && <UploadModal doc={modal} onClose={() => setModal(null)} onUploaded={() => { cargar(); showToast("✓ Documento subido correctamente"); }} />}

      {/* TOP HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ece8f0", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, position:"sticky", top:0, zIndex:20 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#1e1033", margin:0 }}>¡Hola, {user?.nombre}! 👋</h1>
          <p style={{ fontSize:13, color:"#9a7080", margin:"2px 0 0" }}>Organiza y mantén al día todos tus documentos. 💜</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <button style={{ position:"relative", padding:8, borderRadius:12, border:"1px solid #ece4f0", background:"#fff", cursor:"pointer" }}>
            <Bell size={17} style={{ color:"#9a7080" }}/>
            <span style={{ position:"absolute", top:6, right:6, width:7, height:7, background:"#a0435f", borderRadius:"50%", border:"1.5px solid #fff" }}/>
          </button>
          <Link href="/dashboard/reuniones" style={{ display:"flex", alignItems:"center", gap:6, border:"1.5px solid #e0d0e8", color:"#6b4a70", fontSize:13, fontWeight:500, padding:"8px 14px", borderRadius:12, textDecoration:"none", background:"#fff" }}>
            <Calendar size={14}/> Agendar reunión
          </Link>
          <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", gap:6, background:"#5b21b6", color:"#fff", fontSize:13, fontWeight:600, padding:"9px 16px", borderRadius:12, textDecoration:"none" }}>
            Ver mi proceso completo <ArrowRight size={13}/>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"20px 24px 40px", display:"flex", gap:20 }}>
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>

          {/* HEADER */}
          <div>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700, color:"#1e1033", margin:"0 0 6px" }}>Documentos y guías</h2>
            <p style={{ fontSize:13, color:"#9a7080", margin:0 }}>Sube aquí todos los documentos requeridos para tu proceso Au Pair. El equipo los revisará y te notificará.</p>
          </div>

          {/* PROGRESO GENERAL */}
          <div style={{ background:"linear-gradient(135deg,#7c3aed15,#ede9fe)", border:"1px solid #c4b5fd", borderRadius:16, padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:"#5b21b6", margin:"0 0 8px" }}>
                {subidos.length} de {requeridosOblig.length} documentos obligatorios subidos
              </p>
              <div style={{ height:8, background:"#ede9fe", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pctSubidos}%`, background:"linear-gradient(90deg,#7c3aed,#a0435f)", borderRadius:99, transition:"width .6s" }}/>
              </div>
              <p style={{ fontSize:11, color:"#7c3aed", margin:"6px 0 0", fontWeight:600 }}>{pctSubidos}% completado</p>
            </div>
            <div style={{ display:"flex", gap:12, flexShrink:0 }}>
              {[
                { n:aprobados.length,          label:"Aprobados",   color:"#10b981", bg:"#d1fae5" },
                { n:subidos.length-aprobados.length, label:"En revisión", color:"#d97706", bg:"#fef3c7" },
                { n:requeridosOblig.length-subidos.length, label:"Faltantes", color:"#ef4444", bg:"#fee2e2" },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center", background:s.bg, padding:"8px 14px", borderRadius:12 }}>
                  <p style={{ fontSize:20, fontWeight:700, color:s.color, margin:0, fontFamily:"Georgia,serif" }}>{s.n}</p>
                  <p style={{ fontSize:10, color:s.color, margin:0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FILTROS */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { id:"todos",     label:"Todos",        n:requeridos.length },
              { id:"faltantes", label:"Faltantes",    n:requeridosOblig.length-subidos.length },
              { id:"pendiente", label:"En revisión",  n:docs.filter(d=>d.estado==="pendiente").length },
              { id:"aprobado",  label:"Aprobados",    n:aprobados.length },
            ].map(f => (
              <button key={f.id} onClick={() => setFiltro(f.id)}
                style={{ padding:"7px 14px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all .12s", fontFamily:"inherit",
                  background: filtro===f.id ? "#7c3aed" : "#fff",
                  color: filtro===f.id ? "#fff" : "#6b7280",
                  boxShadow: filtro===f.id ? "0 2px 8px rgba(124,58,237,.3)" : "0 1px 3px rgba(0,0,0,.08)",
                }}>
                {f.label} <span style={{ fontSize:10, opacity:.8 }}>({f.n})</span>
              </button>
            ))}
          </div>

          {/* LISTA DE DOCUMENTOS */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            {filtrados.map((r, i) => {
              const subido = docsPorTipo[r.tipo];
              const estadoCfg = subido ? (ESTADO_CFG[subido.estado] || ESTADO_CFG.pendiente) : null;
              const EstadoIcon = estadoCfg?.icon;
              return (
                <div key={r.tipo} className="doc-row"
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", borderBottom:i<filtrados.length-1?"1px solid #f5eef8":"none", background:"#fff", transition:"background .12s" }}>

                  {/* Icono */}
                  <div style={{ width:46, height:46, borderRadius:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
                    background: subido ? (estadoCfg?.bg || "#fef3c7") : "#f3f4f6",
                  }}>
                    {r.emoji}
                  </div>

                  {/* Contenido */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:"#1e1033", margin:0 }}>{r.label}</p>
                      {r.requerido && <span style={{ fontSize:9, fontWeight:700, background:"#fce7f3", color:"#be185d", padding:"2px 7px", borderRadius:99, textTransform:"uppercase" }}>Obligatorio</span>}
                    </div>
                    <p style={{ fontSize:11, color:"#9a7080", margin:0 }}>Formatos aceptados: {r.formatos}</p>
                    {subido && (
                      <p style={{ fontSize:11, color:"#6b7280", margin:"2px 0 0" }}>
                        📎 {subido.nombre} · {subido.tamano_kb} KB
                      </p>
                    )}
                    {subido?.nota_admin && (
                      <p style={{ fontSize:11, color:"#dc2626", margin:"2px 0 0", fontStyle:"italic" }}>
                        💬 {subido.nota_admin}
                      </p>
                    )}
                  </div>

                  {/* Estado badge */}
                  {subido ? (
                    <div style={{ display:"flex", alignItems:"center", gap:6, background:estadoCfg?.bg, color:estadoCfg?.color, fontSize:11, fontWeight:600, padding:"5px 12px", borderRadius:99, flexShrink:0 }}>
                      <EstadoIcon size={12}/> {estadoCfg?.label}
                    </div>
                  ) : (
                    <div style={{ fontSize:11, fontWeight:600, color:"#9ca3af", background:"#f3f4f6", padding:"5px 12px", borderRadius:99, flexShrink:0 }}>
                      Sin subir
                    </div>
                  )}

                  {/* Acciones */}
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    {subido && (
                      <>
                        <a href={subido.url} target="_blank" rel="noopener noreferrer"
                          style={{ width:32, height:32, borderRadius:9, border:"1px solid #e5e7eb", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:"#6b7280" }}>
                          <Eye size={14}/>
                        </a>
                        <button onClick={() => eliminar(subido.id)} disabled={deleting===subido.id}
                          style={{ width:32, height:32, borderRadius:9, border:"1px solid #fecaca", background:"#fee2e2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#dc2626" }}>
                          {deleting===subido.id ? <div style={{ width:12, height:12, border:"2px solid #dc262640", borderTopColor:"#dc2626", borderRadius:"50%", animation:"spin 1s linear infinite" }}/> : <Trash2 size={13}/>}
                        </button>
                      </>
                    )}
                    <button onClick={() => setModal(r)}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:`1.5px solid ${subido?"#e5e7eb":"#7c3aed"}`, background:subido?"#fff":"#7c3aed", color:subido?"#6b7280":"#fff", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0, fontFamily:"inherit" }}>
                      <Upload size={13}/> {subido ? "Reemplazar" : "Subir"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #ece4f0", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"#f5f0ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>❓</div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:0 }}>¿No encuentras lo que buscas?</p>
                <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>Escríbenos y con gusto te ayudaremos.</p>
              </div>
            </div>
            <button style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:12, border:"1.5px solid #ece4f0", background:"#fff", color:"#7c3aed", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              💬 Escribir a soporte
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.04)", textAlign:"center" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:"0 0 16px", textAlign:"left" }}>Tu progreso en el proceso</h3>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
              <DonutProgress pct={pctProceso} />
            </div>
            <p style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 2px" }}>
              {fasesCompletadas} de 5 fases completadas
            </p>
            <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 14px" }}>Sigue así, vas por buen camino 💜</p>
            <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"1.5px solid #ede9fe", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
              🗺️ Ver mi proceso completo
            </Link>
          </div>

          {/* Próximo paso */}
          {proceso?.proximoPaso && (
            <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <div style={{ width:28, height:28, borderRadius:9, background:"#fce7f3", display:"flex", alignItems:"center", justifyContent:"center" }}>🎯</div>
                <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>Próximo paso</h3>
              </div>
              <p style={{ fontSize:13, color:"#1e1033", margin:"0 0 12px", lineHeight:1.5 }}>{proceso.proximoPaso.titulo}</p>
              <Link href={proceso.proximoPaso.link||"#"} style={{ display:"block", textAlign:"center", background:"#5b21b6", color:"#fff", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
                {proceso.proximoPaso.label_boton}
              </Link>
            </div>
          )}

          <HelpCard onContact={() => router.push("/dashboard/mensajes")} />
        </aside>
      </div>
    </div>
  );
}