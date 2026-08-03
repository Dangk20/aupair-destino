"use client";
// app/dashboard/documentos/page.jsx — Rediseño Panel Candidata (borgoña).
// Cargar documentos es lo que se paga: si no activó, el grid va atenuado y
// "Subir" lleva a /pago. El gate real vive en el servidor (403 forbidden).

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Check, CheckCircle2, Lock, Upload, Eye, ArrowRight, AlertCircle, GraduationCap, BookMarked, IdCard, Camera, HeartPulse, ShieldCheck, ScrollText, Stethoscope, Mail, Award, Languages, Baby, FileText, Paperclip, Image as ImageIcon, X,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { useAccessGate, GateLoading, GateScreen } from "@/components/dashboard/AccessGate";

// Ícono de línea por tipo de documento (reemplaza los emojis del API)
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

function UploadModal({ doc, onClose, onUploaded }) {
  const [file,setFile]=useState(null); const [drag,setDrag]=useState(false);
  const [uploading,setUploading]=useState(false); const [error,setError]=useState("");
  const ref=useRef();
  const handleFile=(f)=>{ if(!f)return;
    if(!["application/pdf","image/jpeg","image/png","image/jpg"].includes(f.type)){setError("Solo PDF, JPG o PNG");return;}
    if(f.size>10*1024*1024){setError("Máximo 10 MB");return;} setFile(f); setError(""); };
  const upload=async()=>{ if(!file)return; setUploading(true); setError("");
    const fd=new FormData(); fd.append("file",file); fd.append("tipo_doc",doc.tipo); fd.append("nombre",file.name);
    const res=await fetch("/api/dashboard/documentos",{method:"POST",body:fd}); const data=await res.json();
    if(res.ok){onUploaded();onClose();} else setError(data.error||"Error al subir"); setUploading(false); };
  const ext=file?.name?.split(".").pop()?.toUpperCase();
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(58,37,48,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16,fontFamily:T.font }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:440,boxShadow:"0 26px 60px rgba(58,37,48,.4)",overflow:"hidden" }}>
        <div style={{ height:4,background:T.gradIcon }}/>
        <div style={{ padding:22 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
            <div>
              <p style={{ fontSize:10.5,fontWeight:700,color:T.primary3,textTransform:"uppercase",letterSpacing:".08em",margin:"0 0 4px" }}>Subir documento</p>
              <h2 style={{ fontSize:16,fontWeight:700,color:T.ink,margin:0,display:"flex",alignItems:"center",gap:8 }}>{(() => { const Ic = DOC_ICON[doc.tipo] || FileText; return <Ic size={18}/>; })()} {doc.label}</h2>
              <p style={{ fontSize:12,color:T.textSoft,margin:"4px 0 0" }}>Formatos: {doc.formatos} · Máx. 10 MB</p>
            </div>
            <button onClick={onClose} style={{ background:T.lilac,border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:17,color:T.primary,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          </div>
          {error && <div style={{ background:"#FDECEC",border:"1px solid #F6C9C9",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#C0392B",marginBottom:12,display:"flex",alignItems:"center",gap:8 }}><AlertCircle size={14}/>{error}</div>}
          <div onClick={()=>!file&&ref.current?.click()}
            onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
            style={{ border:`2px dashed ${drag?T.primary:T.border}`,borderRadius:14,padding:22,textAlign:"center",cursor:file?"default":"pointer",background:drag?T.lilac:T.softFill,transition:"all .15s" }}>
            <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])}/>
            {!file ? (
              <><Paperclip size={30} style={{ color:"#C9A9B4", marginBottom:8 }} strokeWidth={1.5}/>
              <p style={{ fontSize:13,fontWeight:600,color:T.primary,margin:"0 0 4px" }}>Arrastra o haz clic para subir</p>
              <p style={{ fontSize:11,color:T.textSoft,margin:0 }}>{doc.formatos} · Máx. 10 MB</p></>
            ) : (
              <div style={{ display:"flex",alignItems:"center",gap:12,justifyContent:"center" }}>
                <div style={{ width:40,height:40,borderRadius:10,background:T.lilac,display:"flex",alignItems:"center",justifyContent:"center" }}>{ext==="PDF"?<FileText size={18} style={{ color:"#A0435F" }}/>:<ImageIcon size={18} style={{ color:"#A0435F" }}/>}</div>
                <div style={{ textAlign:"left",flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:T.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{file.name}</p>
                  <p style={{ fontSize:11,color:T.textSoft,margin:0 }}>{(file.size/1024).toFixed(0)} KB · {ext}</p>
                </div>
                <button onClick={e=>{e.stopPropagation();setFile(null);}} style={{ background:"#FDECEC",border:"none",borderRadius:8,padding:"4px 8px",fontSize:11,color:"#C0392B",cursor:"pointer",flexShrink:0 }}><X size={12}/></button>
              </div>
            )}
          </div>
          <div style={{ display:"flex",gap:10,marginTop:14 }}>
            <button onClick={onClose} style={{ flex:1,padding:11,borderRadius:12,border:`1.5px solid ${T.border}`,background:"#fff",color:T.textSoft,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.font }}>Cancelar</button>
            <button onClick={upload} disabled={!file||uploading}
              style={{ flex:2,padding:11,borderRadius:12,border:"none",background:(!file||uploading)?T.primary3:T.primary,color:"#fff",fontSize:13,fontWeight:700,cursor:(!file||uploading)?"not-allowed":"pointer",fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              {uploading?<><div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"dapspin 1s linear infinite" }}/>Subiendo…</>:<><Upload size={14}/>Subir</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentosPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const gate = useAccessGate("documentos");
  const [docs,setDocs]=useState([]); const [requeridos,setRequeridos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null); const [toast,setToast]=useState(null); const [deleting,setDeleting]=useState(null);

  const cargar=()=>{ const safe=(p,fb=null)=>p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),{user:null}),
      safe(fetch("/api/dashboard/documentos"),{docs:[],docs_requeridos:[]}),
    ]).then(([me,docsData])=>{
      if(me?.user?.rol==="admin"||!me?.user){ router.push("/login"); return; }
      setDocs(docsData.docs||[]); setRequeridos(docsData.docs_requeridos||[]);
      setLoading(false);
    }); };
  useEffect(()=>{ cargar(); },[]);

  const showToast=(msg)=>{ setToast(msg); setTimeout(()=>setToast(null),3000); };
  const eliminar=async(id)=>{ if(!window.confirm("¿Eliminar este documento?"))return; setDeleting(id);
    await fetch(`/api/dashboard/documentos?id=${id}`,{method:"DELETE"}); showToast("Documento eliminado"); cargar(); setDeleting(null); };

  if (loading || gate.loading) return <GateLoading/>;
  if (!gate.access) return <GateScreen estado={gate.estado} titulo="La carga de tu documentación"/>;

  const docsPorTipo = Object.fromEntries(docs.map(d=>[d.tipo_doc,d]));
  const docTotal = requeridos.length;
  // Un documento cuyo archivo se perdió del servidor no cuenta como cargado.
  const docCount = requeridos.filter(r=>docsPorTipo[r.tipo] && docsPorTipo[r.tipo].disponible !== false).length;
  const pct = docTotal? Math.round(docCount/docTotal*100):0;
  const docsDone = docTotal>0 && docCount>=docTotal;
  const hint = docCount===0 ? "Empieza por tu pasaporte y cédula."
             : docsDone ? "Todo listo. Enviaremos tu perfil a revisión."
             : `Vas muy bien, te faltan ${docTotal-docCount} documentos.`;

  return (
    <div style={{ fontFamily:T.font,color:T.text,padding:isMobile?"16px 16px 90px":"28px 30px",maxWidth:860,margin:"0 auto",display:"flex",flexDirection:"column",gap:18 }}>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
      {toast && <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:2000,background:T.ink,color:"#fff",padding:"12px 20px",borderRadius:12,fontSize:13,fontWeight:600 }}>{toast}</div>}
      {modal && <UploadModal doc={modal} onClose={()=>setModal(null)} onUploaded={()=>{ cargar(); showToast("Documento subido"); }}/>}

      {/* header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
        <div>
          <div style={{ fontSize:isMobile?21:26,fontWeight:700,color:T.text,lineHeight:1.1 }}>Tu documentación</div>
          <div style={{ fontSize:13.5,color:T.textSoft,marginTop:3 }}>La llave para presentarte ante la agencia</div>
        </div>
        <button style={{ width:42,height:42,borderRadius:12,background:"#fff",border:"none",display:"flex",alignItems:"center",justifyContent:"center",color:T.primary,cursor:"pointer",position:"relative",flexShrink:0 }}>
          <Bell size={19}/><span style={{ position:"absolute",top:11,right:12,width:7,height:7,borderRadius:"50%",background:T.primary3 }}/>
        </button>
      </div>

      {/* progreso */}
      <div style={{ background:"#fff",borderRadius:18,padding:20,boxShadow:T.shadow }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12 }}>
          <div style={{ fontSize:15,fontWeight:700,color:T.text }}>Tu progreso</div>
          <div style={{ fontSize:15,fontWeight:700,color:T.primary }}>{docCount} / {docTotal}</div>
        </div>
        <div style={{ height:12,background:T.softFill,borderRadius:20,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#A0435F,#C77D93)",borderRadius:20,transition:"width .4s" }}/>
        </div>
        <div style={{ fontSize:12.5,color:T.textSoft,marginTop:9 }}>{hint}</div>
      </div>

      {/* grid documentos */}
      <div style={{ fontSize:15,fontWeight:700,color:T.text }}>Documentos requeridos</div>
      <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fit,minmax(280px,1fr))",gap:12 }}>
        {requeridos.map(r => {
          const subido = docsPorTipo[r.tipo];
          const up = !!subido;
          // El registro existe pero su archivo no está en el servidor: la
          // candidata tiene que volver a subirlo.
          const perdido = up && subido.disponible === false;
          const DocIcon = DOC_ICON[r.tipo] || FileText;
          return (
            <div key={r.tipo} style={{ background:"#fff",border:`1.5px solid ${perdido?"#fca5a5":up?T.primary3:"transparent"}`,borderRadius:16,padding:13,display:"flex",alignItems:"center",gap:12,boxShadow:T.shadow }}>
              <div style={{ width:42,height:42,borderRadius:12,background:perdido?"#FDECEC":up?T.primary:T.lilac,color:perdido?"#C0392B":up?"#fff":T.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><DocIcon size={20}/></div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:600,fontSize:14,color:T.text,lineHeight:1.25,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.label}</div>
                <div style={{ display:"flex",alignItems:"center",gap:4,fontSize:12,color:perdido?"#C0392B":up?T.primary:T.textSoft,fontWeight:600 }}>
                  {up && !perdido && <Check size={12}/>}
                  {perdido?"Vuelve a subirlo":up?"Cargado":"Pendiente"}
                </div>
              </div>
              {perdido ? (
                <button onClick={()=>setModal(r)}
                  style={{ background:"#C0392B",color:"#fff",border:"none",borderRadius:10,padding:"9px 14px",fontFamily:T.font,fontWeight:700,fontSize:12.5,cursor:"pointer",flexShrink:0 }}>
                  Volver a subir
                </button>
              ) : up ? (
                <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                  <a href={subido.url} target="_blank" rel="noopener noreferrer" style={{ width:34,height:34,borderRadius:10,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSoft }}><Eye size={14}/></a>
                  <button onClick={()=>eliminar(subido.id)} disabled={deleting===subido.id} style={{ background:T.lilac,color:T.primary,border:"none",borderRadius:10,padding:"9px 12px",fontFamily:T.font,fontWeight:700,fontSize:12.5,cursor:"pointer" }}>
                    {deleting===subido.id?"…":"Quitar"}
                  </button>
                </div>
              ) : (
                <button onClick={()=>setModal(r)}
                  style={{ background:T.primary,color:"#fff",border:"none",borderRadius:10,padding:"9px 14px",fontFamily:T.font,fontWeight:700,fontSize:12.5,cursor:"pointer",flexShrink:0 }}>
                  Subir
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* documentación completa */}
      {docsDone && (
        <div style={{ background:T.gradHero,borderRadius:22,padding:24,color:"#fff",textAlign:"center" }}>
          <div style={{ width:60,height:60,borderRadius:18,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto" }}><GraduationCap size={30}/></div>
          <div style={{ fontSize:20,fontWeight:700,marginTop:12 }}>¡Documentación completa!</div>
          <div style={{ fontSize:13.5,opacity:.9,marginTop:6,lineHeight:1.5 }}>Nuestro equipo revisará tu perfil (1–3 días hábiles) y lo presentará a una agencia aliada.</div>
          <button onClick={()=>router.push("/dashboard/proceso")} style={{ marginTop:16,background:"#fff",color:T.primary,border:"none",borderRadius:13,padding:"13px 20px",fontFamily:T.font,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8 }}>Ver mi viaje <ArrowRight size={16}/></button>
        </div>
      )}
    </div>
  );
}
