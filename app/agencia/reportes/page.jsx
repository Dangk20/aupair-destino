"use client";
// app/agencia/reportes/page.jsx

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DownloadIcon, TrendingUpIcon, UsersIcon, CheckCircleIcon, DollarSignIcon } from "lucide-react";
import { useMobile } from "@/context/MobileContext";

export default function AgenciaReportesPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const [user,       setUser]       = useState(null);
  const [candidatas, setCandidatas] = useState([]);
  const [loading,    setLoading]    = useState(true);

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

  const exportar = () => {
    const csv = ["Nombre,País,Edad,Estado,Progreso\n",
      ...candidatas.map(c=>`${c.nombre} ${c.apellido},${c.pais||""},${c.edad||""},${c.estado_agencia||""},${c.progreso||0}%`)
    ].join("\n");
    const a = Object.assign(document.createElement("a"),{href:`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,download:"reporte-candidatas.csv"});
    a.click();
  };

  const stats = {
    total:       candidatas.length,
    listas:      candidatas.filter(c=>!c.estado_agencia||c.estado_agencia==="Lista para conectar").length,
    enMatch:     candidatas.filter(c=>c.estado_agencia==="En match").length,
    visaProceso: candidatas.filter(c=>c.estado_agencia==="Visa en proceso").length,
    completadas: candidatas.filter(c=>c.estado_agencia==="Completado").length,
  };

  const paises = Object.entries(
    candidatas.reduce((acc,c)=>{ if(c.pais) acc[c.pais]=(acc[c.pais]||0)+1; return acc; },{})
  ).sort((a,b)=>b[1]-a[1]);

  const fases = [
    { label:"Lista para conectar", val:stats.listas,      color:"#A0435F", pct:stats.total?Math.round(stats.listas/stats.total*100):0 },
    { label:"En match",            val:stats.enMatch,     color:"#E8853B", pct:stats.total?Math.round(stats.enMatch/stats.total*100):0 },
    { label:"Visa en proceso",     val:stats.visaProceso, color:"#C0392B", pct:stats.total?Math.round(stats.visaProceso/stats.total*100):0 },
    { label:"Completado",          val:stats.completadas, color:"#12A46B", pct:stats.total?Math.round(stats.completadas/stats.total*100):0 },
  ];

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
      <div style={{ background:"#fff",borderBottom:"1px solid #e9e3f8",padding:isMobile?"14px 16px":"20px 28px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?20:24,fontWeight:700,color:"#4A2A38",margin:0 }}>Reportes</h1>
            <p style={{ fontSize:13,color:"#9C8790",margin:"4px 0 0" }}>Resumen de actividad y estadísticas de tus candidatas.</p>
          </div>
          <button onClick={exportar} style={{ display:"flex",alignItems:"center",gap:7,background:"#A0435F",color:"#fff",fontSize:13,fontWeight:600,padding:"9px 18px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit" }}>
            <DownloadIcon size={14}/> Exportar reporte
          </button>
        </div>
      </div>

      <div style={{ padding:isMobile?"14px 16px 40px":"20px 28px 40px",maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",gap:16 }}>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12 }}>
          {[
            { icon:UsersIcon,       label:"Total candidatas",  val:stats.total,       color:"#A0435F", emoji:"👥" },
            { icon:CheckCircleIcon, label:"Listas para match", val:stats.listas,      color:"#12A46B", emoji:"✅" },
            { icon:TrendingUpIcon,  label:"En proceso",        val:stats.enMatch,     color:"#E8853B", emoji:"📈" },
            { icon:CheckCircleIcon, label:"Completadas",       val:stats.completadas, color:"#12A46B", emoji:"🏆" },
          ].map((s,i)=>(
            <div key={i} style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize:24,marginBottom:8 }}>{s.emoji}</div>
              <p style={{ fontSize:11,color:"#9C8790",margin:"0 0 2px",textTransform:"uppercase",fontWeight:600,letterSpacing:".5px" }}>{s.label}</p>
              <p style={{ fontFamily:"Georgia,serif",fontSize:28,fontWeight:700,color:"#4A2A38",margin:0 }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16 }}>

          {/* Distribución por fase */}
          <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:"#4A2A38",margin:"0 0 16px" }}>Distribución por fase</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {fases.map((f,i)=>(
                <div key={i}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:f.color }}/>
                      <span style={{ fontSize:12,color:"#6B7280" }}>{f.label}</span>
                    </div>
                    <span style={{ fontSize:12,fontWeight:700,color:"#4A2A38" }}>{f.val} ({f.pct}%)</span>
                  </div>
                  <div style={{ height:8,background:"#e9e3f8",borderRadius:99,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${f.pct}%`,background:f.color,borderRadius:99,transition:"width .3s" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Por país */}
          <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:"#4A2A38",margin:"0 0 16px" }}>Candidatas por país</h3>
            {paises.length===0 ? (
              <p style={{ fontSize:12,color:"#9C8790",textAlign:"center",padding:"20px 0" }}>Sin datos aún</p>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {paises.slice(0,6).map(([pais,count],i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#FBF4F6",borderRadius:10,border:"1px solid #e9e3f8" }}>
                    <span style={{ fontSize:13,color:"#6B7280" }}>{pais}</span>
                    <span style={{ fontSize:13,fontWeight:700,color:"#A0435F" }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabla resumen */}
        <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
          <div style={{ padding:"14px 20px",borderBottom:"1px solid #e9e3f8" }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:"#4A2A38",margin:0 }}>Detalle de candidatas</h3>
          </div>
          {!isMobile && (
            <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:12,padding:"8px 20px",background:"#faf8ff",borderBottom:"1px solid #e9e3f8" }}>
              {["Candidata","País","Edad","Estado"].map((h,i)=>(
                <p key={i} style={{ fontSize:10,fontWeight:700,color:"#9C8790",margin:0,textTransform:"uppercase",letterSpacing:".5px" }}>{h}</p>
              ))}
            </div>
          )}
          {candidatas.slice(0,10).map((c,i)=>(
            <div key={c.id} style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr 1fr 1fr",gap:12,padding:"12px 20px",borderBottom:i<Math.min(10,candidatas.length)-1?"1px solid #FBF4F6":"none",alignItems:"center" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:32,height:32,borderRadius:"50%",background:"#FCE8EE",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  {c.foto_url?<img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ fontSize:12,fontWeight:700,color:"#A0435F" }}>{c.nombre?.[0]}</span>}
                </div>
                <div>
                  <p style={{ fontSize:12,fontWeight:600,color:"#4A2A38",margin:0 }}>{c.nombre} {c.apellido}</p>
                  <p style={{ fontSize:10,color:"#9C8790",margin:0 }}>{c.email}</p>
                </div>
              </div>
              <p style={{ fontSize:12,color:"#6B7280",margin:0 }}>{c.pais||"—"}</p>
              <p style={{ fontSize:12,color:"#6B7280",margin:0 }}>{c.edad||"—"} años</p>
              <span style={{ fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:"#FCE8EE",color:"#A0435F",display:"inline-block" }}>
                {c.estado_agencia||"Lista para conectar"}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}