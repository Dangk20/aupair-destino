"use client";
// ════════════════════════════════════════════════════════════════════════
// components/perfil/PestanaDocumentos.jsx — La documentación, dentro de la ficha
//
// Un componente con dos modos, no dos componentes. La lista de requeridos y el
// criterio de "archivo perdido" son los mismos mire quien mire; lo único que
// cambia es qué se puede hacer:
//
//   modo="propio"    la candidata sube y quita
//   modo="revision"  el personal aprueba, rechaza, anota y abre el archivo
//
// Dos componentes habrían vuelto a abrir la puerta a que diverjan, que es
// exactamente el patrón que produjo las tres listas de secciones de perfil.
//
// Éste sí pide datos al servidor, a diferencia de FichaCandidata: la
// documentación es un recurso que se muta desde aquí mismo —subir, aprobar,
// quitar— y tenerla que refrescar a través del padre obligaría a que las dos
// pantallas repitieran la misma coreografía.
// ════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import {
  Check, Eye, Upload, Paperclip, X, AlertCircle, AlertTriangle, FileText,
  Image as ImageIcon, CheckCircle2, XCircle, Clock, MessageSquare, Trash2,
  GraduationCap, BookMarked, IdCard, Camera, HeartPulse, ShieldCheck,
  ScrollText, Stethoscope, Mail, Award, Languages, Baby,
} from "lucide-react";
import { T } from "@/lib/tema";
import { estadoDocumentacion, avanceDocumentacion } from "@/lib/documentos";

// Ícono de línea por tipo de documento — reemplaza los emojis que trae la
// lista, para que la ficha no mezcle emoji con la iconografía del producto.
const DOC_ICON = {
  pasaporte:            BookMarked,
  cedula:               IdCard,
  foto_perfil:          Camera,
  primeros_auxilios:    HeartPulse,
  titulo_bachillerato:  GraduationCap,
  antecedentes:         ShieldCheck,
  registro_civil:       ScrollText,
  certificado_medico:   Stethoscope,
  carta_recomendacion:  Mail,
  titulo_universitario: Award,
  certificado_idioma:   Languages,
  foto_experiencia:     Baby,
};

/**
 * Nombre del archivo, si vale la pena mostrarlo.
 *
 * En producción hay filas cuyo `nombre` es la CADENA "null" —quedó de una carga
 * vieja que serializó el valor ausente—, y pintarla deja al lado del documento
 * un "✓ null" que parece un error del sistema.
 */
function nombreArchivo(doc) {
  const n = String(doc?.nombre ?? "").trim();
  return n && n !== "null" && n !== "undefined" ? n : null;
}

const ESTADO_DOC = {
  aprobado:  { bg: T.greenBg,  color: T.green,  label: "Aprobado",    Icono: CheckCircle2 },
  pendiente: { bg: T.amberBg,  color: T.amber,  label: "En revisión", Icono: Clock },
  rechazado: { bg: T.dangerBg, color: T.danger, label: "Rechazado",   Icono: XCircle },
};

/* ── Modal de subida (sólo modo "propio") ───────────────────────────────── */
function ModalSubir({ doc, onCerrar, onSubido }) {
  const [file, setFile]           = useState(null);
  const [drag, setDrag]           = useState(false);
  const [subiendo, setSubiendo]   = useState(false);
  const [error, setError]         = useState("");
  const ref = useRef();

  const tomar = (f) => {
    if (!f) return;
    if (!["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(f.type))
      return setError("Solo PDF, JPG o PNG");
    if (f.size > 10 * 1024 * 1024) return setError("Máximo 10 MB");
    setFile(f); setError("");
  };

  const subir = async () => {
    if (!file) return;
    setSubiendo(true); setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("tipo_doc", doc.tipo);
    fd.append("nombre", file.name);
    const res  = await fetch("/api/dashboard/documentos", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { onSubido(); onCerrar(); }
    else setError(data.error || "Error al subir");
    setSubiendo(false);
  };

  const ext = file?.name?.split(".").pop()?.toUpperCase();
  const Ic  = DOC_ICON[doc.tipo] || FileText;

  return (
    <div onClick={e => e.target === e.currentTarget && onCerrar()}
      style={{ position:"fixed", inset:0, background:"rgba(58,37,48,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16, fontFamily:T.font }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:440, boxShadow:"0 26px 60px rgba(58,37,48,.4)", overflow:"hidden" }}>
        <div style={{ height:4, background:T.gradIcon }} />
        <div style={{ padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:10.5, fontWeight:700, color:T.primary3, textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 4px" }}>Subir documento</p>
              <h2 style={{ fontSize:16, fontWeight:700, color:T.ink, margin:0, display:"flex", alignItems:"center", gap:8 }}><Ic size={18} /> {doc.label}</h2>
              <p style={{ fontSize:12, color:T.textSoft, margin:"4px 0 0" }}>Formatos: {doc.formatos} · Máx. 10 MB</p>
            </div>
            <button onClick={onCerrar} style={{ background:T.lilac, border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", fontSize:17, color:T.primary, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>

          {error && <div style={{ background:T.dangerBg, border:`1px solid ${T.danger}33`, borderRadius:10, padding:"10px 14px", fontSize:13, color:T.danger, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}><AlertCircle size={14} />{error}</div>}

          <div onClick={() => !file && ref.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); tomar(e.dataTransfer.files[0]); }}
            style={{ border:`2px dashed ${drag ? T.primary : T.border}`, borderRadius:14, padding:22, textAlign:"center", cursor:file ? "default" : "pointer", background:drag ? T.lilac : T.softFill, transition:"all .15s" }}>
            <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e => tomar(e.target.files[0])} />
            {!file ? (
              <>
                <Paperclip size={30} style={{ color:T.softText, marginBottom:8 }} strokeWidth={1.5} />
                <p style={{ fontSize:13, fontWeight:600, color:T.primary, margin:"0 0 4px" }}>Arrastra o haz clic para subir</p>
                <p style={{ fontSize:11, color:T.textSoft, margin:0 }}>{doc.formatos} · Máx. 10 MB</p>
              </>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:T.lilac, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {ext === "PDF" ? <FileText size={18} style={{ color:T.primary }} /> : <ImageIcon size={18} style={{ color:T.primary }} />}
                </div>
                <div style={{ textAlign:"left", flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:T.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
                  <p style={{ fontSize:11, color:T.textSoft, margin:0 }}>{(file.size / 1024).toFixed(0)} KB · {ext}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ background:T.dangerBg, border:"none", borderRadius:8, padding:"4px 8px", fontSize:11, color:T.danger, cursor:"pointer", flexShrink:0 }}><X size={12} /></button>
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <button onClick={onCerrar} style={{ flex:1, padding:11, borderRadius:12, border:`1.5px solid ${T.border}`, background:"#fff", color:T.textSoft, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>Cancelar</button>
            <button onClick={subir} disabled={!file || subiendo}
              style={{ flex:2, padding:11, borderRadius:12, border:"none", background:(!file || subiendo) ? T.primary3 : T.primary, color:"#fff", fontSize:13, fontWeight:700, cursor:(!file || subiendo) ? "not-allowed" : "pointer", fontFamily:T.font, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {subiendo
                ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"dapspin 1s linear infinite" }} />Subiendo…</>
                : <><Upload size={14} /> Subir</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Editor de nota del admin (sólo modo "revision") ────────────────────── */
function EditorNota({ valor, guardando, onGuardar, onCancelar }) {
  const [texto, setTexto] = useState(valor || "");
  return (
    <div style={{ marginTop:10 }}>
      <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={3} autoFocus
        placeholder="Nota para la candidata (la verá en su panel)…"
        style={{ width:"100%", border:`1.5px solid ${T.border}`, borderRadius:10, padding:"9px 12px", fontSize:12, color:T.text, fontFamily:T.font, resize:"vertical", boxSizing:"border-box", outline:"none" }} />
      <div style={{ display:"flex", gap:8, marginTop:8 }}>
        <button onClick={() => onGuardar(texto)} disabled={guardando}
          style={{ padding:"7px 16px", borderRadius:10, border:"none", background:T.primary, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>
          {guardando ? "Guardando…" : "Guardar nota"}
        </button>
        <button onClick={onCancelar}
          style={{ padding:"7px 14px", borderRadius:10, border:`1.5px solid ${T.border}`, background:"#fff", color:T.textSoft, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

/**
 * @param {"propio"|"revision"} modo
 * @param {number|string} usuarioId  a quién pertenece la documentación (modo revision)
 * @param {boolean} puedeVer  en modo "propio", si tiene el permiso de documentos.
 *        Cuando es false NO se pide nada al servidor: se muestra el aviso y ya.
 */
export default function PestanaDocumentos({ modo = "propio", usuarioId, puedeVer = true }) {
  const revision = modo === "revision";

  const [docs, setDocs]         = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal]       = useState(null);
  const [aviso, setAviso]       = useState(null);
  const [editando, setEditando] = useState(null);
  const [ocupado, setOcupado]   = useState(false);
  const [confirmar, setConfirmar] = useState(null);

  const decir = (msg) => { setAviso(msg); setTimeout(() => setAviso(null), 3000); };

  const cargar = () => {
    // Sin permiso no se pregunta: el aviso no necesita datos y pedirlos sólo
    // produciría un 403 en la consola de la candidata.
    if (!revision && !puedeVer) { setCargando(false); return; }
    setCargando(true);
    const url = revision
      ? `/api/admin/perfiles/${usuarioId}/documentos`
      : "/api/dashboard/documentos";
    fetch(url)
      .then(r => r.json())
      .then(d => { setDocs(d.docs || []); setCargando(false); })
      .catch(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, [modo, usuarioId, puedeVer]);

  const cambiarEstado = async (docId, estado) => {
    setOcupado(true);
    const res = await fetch(`/api/admin/perfiles/${usuarioId}/documentos`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId, estado }),
    });
    if (res.ok) { decir(`Documento ${estado}`); cargar(); } else decir("No se pudo actualizar");
    setOcupado(false);
  };

  const guardarNota = async (docId, nota) => {
    setOcupado(true);
    const res = await fetch(`/api/admin/perfiles/${usuarioId}/documentos`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId, nota_admin: nota }),
    });
    if (res.ok) { decir("Nota guardada"); setEditando(null); cargar(); } else decir("No se pudo guardar");
    setOcupado(false);
  };

  const quitar = async (docId) => {
    const url = revision
      ? `/api/admin/perfiles/${usuarioId}/documentos?doc_id=${docId}`
      : `/api/dashboard/documentos?id=${docId}`;
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) { decir("Documento eliminado"); setConfirmar(null); cargar(); } else decir("No se pudo eliminar");
  };

  /* ── Candidata sin el permiso ─────────────────────────────────────────── */
  if (!revision && !puedeVer) {
    return (
      <div style={{ background:"#fff", borderRadius:18, padding:28, boxShadow:T.shadow, textAlign:"center", fontFamily:T.font }}>
        <div style={{ width:56, height:56, borderRadius:16, background:T.gradIcon, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          <Paperclip size={24} />
        </div>
        <div style={{ fontSize:16, fontWeight:700, color:T.ink }}>Tu documentación se abre con tu acompañamiento</div>
        <div style={{ fontSize:13, color:T.textSoft, marginTop:6, lineHeight:1.6, maxWidth:420, margin:"6px auto 0" }}>
          La carga de documentos es parte de tu acompañamiento. Actívalo para que te
          presentemos ante una agencia aliada y te guiemos hasta viajar.
        </div>
      </div>
    );
  }

  if (cargando) return (
    <div style={{ padding:48, display:"flex", justifyContent:"center" }}>
      <div style={{ width:32, height:32, border:`2px solid ${T.primary3}`, borderTopColor:"transparent", borderRadius:"50%", animation:"dapspin 1s linear infinite" }} />
    </div>
  );

  const estado = estadoDocumentacion(docs);
  const { cargados, total } = avanceDocumentacion(docs);
  const pct = total ? Math.round((cargados / total) * 100) : 0;

  // En revisión importa además cómo va la evaluación de lo que sí llegó.
  const aprobados  = docs.filter(d => d.estado === "aprobado").length;
  const rechazados = docs.filter(d => d.estado === "rechazado").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, fontFamily:T.font }}>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>

      {aviso && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:2000, background:T.ink, color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:600 }}>
          {aviso}
        </div>
      )}
      {modal && <ModalSubir doc={modal} onCerrar={() => setModal(null)} onSubido={() => { cargar(); decir("Documento subido"); }} />}

      {/* Avance de la documentación obligatoria */}
      <div style={{ background:"#fff", borderRadius:18, padding:18, boxShadow:T.shadow }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
          <div style={{ fontSize:14.5, fontWeight:700, color:T.text }}>Documentación obligatoria</div>
          <div style={{ fontSize:14.5, fontWeight:700, color:T.primary }}>{cargados} / {total}</div>
        </div>
        <div style={{ height:10, background:T.softFill, borderRadius:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#A0435F,#C77D93)", borderRadius:20, transition:"width .4s" }} />
        </div>
        {revision && (
          <div style={{ display:"flex", gap:14, marginTop:10, fontSize:12, color:T.textSoft }}>
            <span style={{ color:T.green,  fontWeight:600 }}>{aprobados} aprobados</span>
            <span style={{ color:T.amber,  fontWeight:600 }}>{docs.length - aprobados - rechazados} en revisión</span>
            <span style={{ color:T.danger, fontWeight:600 }}>{rechazados} rechazados</span>
          </div>
        )}
      </div>

      {/* Cada documento del programa, cargado o no */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {estado.map(r => {
          const doc      = r.doc;
          const perdido  = !!doc && doc.disponible === false;
          const DocIcon  = DOC_ICON[r.tipo] || FileText;
          const cfg      = doc ? (ESTADO_DOC[doc.estado] || ESTADO_DOC.pendiente) : null;
          const enEdicion = editando === doc?.id;

          return (
            <div key={r.tipo} style={{
              background:"#fff", borderRadius:16, padding:14, boxShadow:T.shadow,
              border:`1.5px solid ${perdido ? T.danger : r.cargado ? T.primary3 : "transparent"}`,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background: perdido ? T.dangerBg : r.cargado ? T.primary : T.lilac,
                  color:      perdido ? T.danger   : r.cargado ? "#fff"    : T.primary }}>
                  <DocIcon size={20} />
                </div>

                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:14, fontWeight:600, color:T.text }}>{r.label}</span>
                    {!r.requerido && (
                      <span style={{ fontSize:10, fontWeight:700, color:T.textSoft, background:T.softFill, padding:"2px 8px", borderRadius:20 }}>Opcional</span>
                    )}
                    {doc && !perdido && cfg && (
                      <span style={{ background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4 }}>
                        <cfg.Icono size={11} />{cfg.label}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, marginTop:2, fontWeight:600, display:"flex", alignItems:"center", gap:4,
                    color: perdido ? T.danger : r.cargado ? T.primary : T.textSoft }}>
                    {r.cargado && <Check size={12} />}
                    {perdido ? "Archivo no disponible" : r.cargado ? "Cargado" : "Pendiente"}
                    {r.cargado && nombreArchivo(doc) && (
                      <span style={{ fontWeight:400, color:T.textSoft }}>· {nombreArchivo(doc)}</span>
                    )}
                  </div>
                </div>

                {/* Acciones — lo único que cambia entre los dos modos */}
                <div style={{ display:"flex", gap:6, flexShrink:0, alignItems:"center" }}>
                  {doc && !perdido && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" title="Abrir documento"
                      style={{ width:34, height:34, borderRadius:10, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:T.textSoft }}>
                      <Eye size={14} />
                    </a>
                  )}

                  {revision && doc && (
                    <>
                      <button onClick={() => setEditando(enEdicion ? null : doc.id)} title="Dejar una nota"
                        style={{ width:34, height:34, borderRadius:10, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                          background: doc.nota_admin ? T.amberBg : T.neutralBg, color: doc.nota_admin ? T.amber : T.textSoft }}>
                        <MessageSquare size={14} />
                      </button>
                      <button onClick={() => cambiarEstado(doc.id, "aprobado")} disabled={ocupado || doc.estado === "aprobado"} title="Aprobar"
                        style={{ width:34, height:34, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                          background: doc.estado === "aprobado" ? T.greenBg : "#fff",
                          border:`1.5px solid ${doc.estado === "aprobado" ? T.greenBg : T.neutralLine}`,
                          opacity: doc.estado === "aprobado" ? .5 : 1 }}>
                        <CheckCircle2 size={14} style={{ color:T.green }} />
                      </button>
                      <button onClick={() => cambiarEstado(doc.id, "rechazado")} disabled={ocupado || doc.estado === "rechazado"} title="Rechazar"
                        style={{ width:34, height:34, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                          background: doc.estado === "rechazado" ? T.dangerBg : "#fff",
                          border:`1.5px solid ${doc.estado === "rechazado" ? T.danger : T.neutralLine}`,
                          opacity: doc.estado === "rechazado" ? .5 : 1 }}>
                        <XCircle size={14} style={{ color:T.danger }} />
                      </button>
                    </>
                  )}

                  {doc && (confirmar === doc.id ? (
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={() => quitar(doc.id)}
                        style={{ padding:"6px 10px", borderRadius:8, border:"none", background:T.danger, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>Sí</button>
                      <button onClick={() => setConfirmar(null)}
                        style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${T.neutralLine}`, background:"#fff", color:T.neutral, fontSize:11, cursor:"pointer", fontFamily:T.font }}>No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmar(doc.id)} title="Quitar documento"
                      style={{ width:34, height:34, borderRadius:10, background:"#fff", border:`1.5px solid ${T.dangerBg}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Trash2 size={14} style={{ color:T.danger }} />
                    </button>
                  ))}

                  {/* Subir sólo lo hace la dueña del perfil: el admin no tiene
                      el archivo, y la ruta de carga escribe sobre la sesión. */}
                  {!revision && (!doc || perdido) && (
                    <button onClick={() => setModal(r)}
                      style={{ background: perdido ? T.danger : T.primary, color:"#fff", border:"none", borderRadius:10, padding:"9px 14px", fontFamily:T.font, fontWeight:700, fontSize:12.5, cursor:"pointer" }}>
                      {perdido ? "Volver a subir" : "Subir"}
                    </button>
                  )}
                </div>
              </div>

              {/* El archivo se perdió del almacenamiento */}
              {perdido && (
                <div style={{ marginTop:10, background:T.dangerBg, border:`1px solid ${T.danger}`, borderRadius:10, padding:"9px 12px", fontSize:11.5, color:T.danger, lineHeight:1.5 }}>
                  <AlertTriangle size={12} style={{ display:"inline", verticalAlign:"-2px", marginRight:5 }} />
                  <strong>El registro existe pero el archivo no está en el servidor.</strong>{" "}
                  {revision ? "Pídele a la candidata que lo vuelva a cargar." : "Vuelve a subirlo, por favor."}
                </div>
              )}

              {/* Nota del equipo: la candidata la lee, el admin la escribe */}
              {doc?.nota_admin && !enEdicion && (
                <div style={{ marginTop:10, background:T.amberBg, borderRadius:10, padding:"9px 12px", fontSize:11.5, color:T.amber, lineHeight:1.5 }}>
                  <MessageSquare size={12} style={{ display:"inline", verticalAlign:"-2px", marginRight:5 }} />
                  <strong>Nota del equipo:</strong> {doc.nota_admin}
                </div>
              )}
              {revision && enEdicion && (
                <EditorNota valor={doc.nota_admin} guardando={ocupado}
                  onGuardar={(texto) => guardarNota(doc.id, texto)}
                  onCancelar={() => setEditando(null)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
