"use client";
// app/agencia/documentos/page.jsx

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, DownloadIcon, FileTextIcon, EyeIcon,
  FolderOpen,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

const PAISES_EMOJI = { "Colombia":"🇨🇴","Mexico":"🇲🇽","México":"🇲🇽","Brasil":"🇧🇷","Argentina":"🇦🇷","Peru":"🇵🇪","Perú":"🇵🇪","Chile":"🇨🇱","Ecuador":"🇪🇨" };

const DOCS_LABELS = {
  cedula:               "Cédula de identidad",
  pasaporte:            "Pasaporte",
  foto_perfil:          "Foto de perfil",
  carta_presentacion:   "Carta de presentación",
  certificado_ingles:   "Certificado de inglés",
  antecedentes:         "Antecedentes penales",
  referencias:          "Cartas de referencia",
  curso_primeros:       "Curso primeros auxilios",
};

export default function AgenciaDocumentosPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const [candidatas, setCandidatas] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [busqueda,   setBusqueda]   = useState("");
  const [user,       setUser]       = useState(null);

  const cargar = useCallback(async()=>{
    const [me, data] = await Promise.all([
      fetch("/api/auth/me").then(r=>r.ok?r.json():null).catch(()=>null),
      fetch("/api/agencia/candidatas").then(r=>r.ok?r.json():null).catch(()=>null),
    ]);
    if (!me?.user) { router.push("/login"); return; }
    setUser(me.user);
    if (data?.ok) setCandidatas(data.candidatas||[]);
    setLoading(false);
  },[router]);

  useEffect(()=>{ cargar(); },[cargar]);

  const filtradas = candidatas.filter(c=>{
    const q = busqueda.toLowerCase();
    return !q || `${c.nombre} ${c.apellido}`.toLowerCase().includes(q);
  });

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FBF4F6" }}>
      <div style={{ width:36,height:36,border:"3px solid #A0435F",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#FBF4F6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #F5E1E7",padding:isMobile?"14px 16px":"20px 28px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?20:24,fontWeight:700,color:"#4A2A38",margin:0 }}>Documentos</h1>
            <p style={{ fontSize:13,color:"#9C8790",margin:"4px 0 0" }}>Revisa los documentos subidos por cada candidata.</p>
          </div>
        </div>
      </div>

      <div style={{ padding:isMobile?"14px 16px 40px":"20px 28px 40px",maxWidth:1100,margin:"0 auto" }}>

        {/* Búsqueda */}
        <div style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",padding:"12px 16px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
          <div style={{ position:"relative" }}>
            <SearchIcon size={13} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9C8790" }}/>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar candidata..."
              style={{ width:"100%",paddingLeft:30,height:36,border:"1.5px solid #F5E1E7",borderRadius:8,fontSize:12,color:"#6B7280",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
          </div>
        </div>

        {/* Lista */}
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {filtradas.length===0 ? (
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",padding:"48px 20px",textAlign:"center" }}>
              <FolderOpen size={38} style={{ color:"#C9A9B4", margin:"0 auto 8px", display:"block" }} strokeWidth={1.5}/>
              <p style={{ fontSize:14,fontWeight:600,color:"#4A2A38",margin:0 }}>No hay candidatas con perfil completado</p>
            </div>
          ) : filtradas.map(c=>(
            <div key={c.id} style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              {/* Header candidata */}
              <div style={{ padding:"14px 20px",borderBottom:"1px solid #FBF4F6",display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:"#FCE8EE",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:13,fontWeight:700,color:"#A0435F" }}>{c.nombre?.[0]}</span>}
                </div>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:"#4A2A38",margin:0 }}>{c.nombre} {c.apellido}</p>
                  <p style={{ fontSize:11,color:"#9C8790",margin:0 }}>{PAISES_EMOJI[c.pais]||""} {c.pais||"—"} · ID: DA-{String(c.id).padStart(4,"0")}</p>
                </div>
              </div>

              {/* Documentos */}
              <div style={{ padding:"14px 20px",display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:10 }}>
                {Object.entries(DOCS_LABELS).map(([key,label])=>{
                  const tiene = !!c[key];
                  return (
                    <div key={key} style={{ background:tiene?"#E6F9F0":"#F3F4F6",borderRadius:10,padding:"10px 12px",border:`1px solid ${tiene?"#E6F9F0":"#F5E1E7"}`,display:"flex",alignItems:"center",gap:8 }}>
                      <FileTextIcon size={14} style={{ color:tiene?"#12A46B":"#9C8790",flexShrink:0 }}/>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:11,fontWeight:600,color:tiene?"#4A2A38":"#9C8790",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{label}</p>
                        <p style={{ fontSize:10,color:tiene?"#12A46B":"#C9A9B4",margin:0,fontWeight:600 }}>{tiene?"Disponible":"Sin subir"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Foto si existe */}
              {c.foto_url && (
                <div style={{ padding:"0 20px 14px",display:"flex",alignItems:"center",gap:10 }}>
                  <img src={c.foto_url} alt="Foto perfil" style={{ width:60,height:60,borderRadius:10,objectFit:"cover",border:"2px solid #F5E1E7" }}/>
                  <div>
                    <p style={{ fontSize:12,fontWeight:600,color:"#4A2A38",margin:0 }}>Foto de perfil</p>
                    <a href={c.foto_url} target="_blank" rel="noreferrer" style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"#A0435F",fontWeight:600,marginTop:4,textDecoration:"none" }}>
                      <EyeIcon size={11}/> Ver foto
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}