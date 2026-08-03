"use client";
// app/agencia/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DownloadIcon, SlidersIcon, EyeIcon, FileTextIcon,
  MessageSquareIcon, ArrowRightIcon,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

const PAISES_EMOJI = {
  "Colombia":"🇨🇴","Mexico":"🇲🇽","México":"🇲🇽","Brasil":"🇧🇷","Brazil":"🇧🇷",
  "Argentina":"🇦🇷","Peru":"🇵🇪","Perú":"🇵🇪","Chile":"🇨🇱","Ecuador":"🇪🇨",
  "Venezuela":"🇻🇪","Costa Rica":"🇨🇷",
};

const FASES = {
  "Lista para conectar": { bg:"#FCE8EE", color:"#A0435F" },
  "En match":            { bg:"#FFF4EC", color:"#E8853B" },
  "Visa en proceso":     { bg:"#FDECEC", color:"#C0392B" },
  "Completado":          { bg:"#E6F9F0", color:"#12A46B" },
  "Aprobada":            { bg:"#E6F9F0", color:"#12A46B" },
  "En progreso":         { bg:"#FCE8EE", color:"#4A2A38" },
};

function FaseBadge({ fase }) {
  const s = FASES[fase] || { bg:"#F3F4F6", color:"#6B7280" };
  return <span style={{ fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:99,background:s.bg,color:s.color,whiteSpace:"nowrap" }}>{fase||"Lista para conectar"}</span>;
}

function EstadoBadge({ estado }) {
  const activo = estado === "Aprobada" || !estado;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:5 }}>
      <div style={{ width:7,height:7,borderRadius:"50%",background:activo?"#12A46B":"#E8853B",flexShrink:0 }}/>
      <span style={{ fontSize:11,color:activo?"#12A46B":"#E8853B",fontWeight:600 }}>{activo?"Aprobada":"En progreso"}</span>
    </div>
  );
}

/* Dona SVG */
function DonaProgreso({ stats }) {
  const total = stats.total || 1;
  const data = [
    { label:"Lista para conectar", val:stats.listasConectar, color:"#A0435F" },
    { label:"En match",            val:stats.enMatch,        color:"#E8853B" },
    { label:"Visa en proceso",     val:stats.visaEnProceso,  color:"#C0392B" },
    { label:"Completado",          val:stats.completadas,    color:"#12A46B" },
  ];
  const r=60, cx=80, cy=80, stroke=18, circ=2*Math.PI*r;
  let acc=0;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:20 }}>
      <svg width={160} height={160} viewBox="0 0 160 160" style={{ flexShrink:0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e9e3f8" strokeWidth={stroke}/>
        {data.map((d,i)=>{
          const dash=(d.val/total)*circ;
          const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ-dash}`}
            strokeDashoffset={-(acc/total)*circ}
            transform={`rotate(-90 ${cx} ${cy})`}/>;
          acc+=d.val; return el;
        })}
        <text x={cx} y={cy-6} textAnchor="middle" fontSize={22} fontWeight={700} fill="#4A2A38" fontFamily="Georgia,serif">{total}</text>
        <text x={cx} y={cx+10} textAnchor="middle" fontSize={11} fill="#9C8790">Total</text>
      </svg>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {data.map((d,i)=>(
          <div key={i} style={{ display:"flex",alignItems:"center",gap:7 }}>
            <div style={{ width:9,height:9,borderRadius:"50%",background:d.color,flexShrink:0 }}/>
            <div>
              <p style={{ fontSize:11,color:"#6B7280",margin:0 }}>{d.label}</p>
              <p style={{ fontSize:11,fontWeight:700,color:"#4A2A38",margin:0 }}>{d.val} ({total>0?Math.round(d.val/total*100):0}%)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgenciaDashboard() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,       setUser]       = useState(null);
  const [candidatas, setCandidatas] = useState([]);
  const [stats,      setStats]      = useState({ total:0,listasConectar:0,enMatch:0,visaEnProceso:0,completadas:0 });
  const [loading,    setLoading]    = useState(true);
  const [filtro,     setFiltro]     = useState("");
  const [verMas,     setVerMas]     = useState(false);

  useEffect(()=>{
    Promise.all([
      fetch("/api/auth/me").then(r=>r.ok?r.json():null).catch(()=>null),
      fetch("/api/agencia/candidatas").then(r=>r.ok?r.json():null).catch(()=>null),
    ]).then(([me,data])=>{
      if (!me?.user) { router.push("/login"); return; }
      setUser(me.user);
      if (data?.ok) { setCandidatas(data.candidatas||[]); setStats(data.stats||{}); }
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  const exportar = () => {
    const csv = ["Nombre,Edad,País,Fase,Email",
      ...candidatas.map(c=>`${c.nombre} ${c.apellido},${c.edad||"—"},${c.pais||"—"},${c.estado_agencia||"Lista para conectar"},${c.email}`)
    ].join("\n");
    const a = Object.assign(document.createElement("a"),{href:`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,download:"candidatas.csv"});
    a.click();
  };

  const filtradas = candidatas.filter(c=>{
    if (!filtro) return true;
    return `${c.nombre} ${c.apellido} ${c.pais} ${c.ciudad}`.toLowerCase().includes(filtro.toLowerCase());
  });
  const visibles = verMas ? filtradas : filtradas.slice(0,5);

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FBF4F6" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36,height:36,border:"3px solid #A0435F",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 12px" }}/>
        <p style={{ fontSize:13,color:"#9C8790" }}>Cargando candidatas...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#FBF4F6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e9e3f8",padding:isMobile?"14px 16px":"20px 28px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?20:24,fontWeight:700,color:"#4A2A38",margin:0 }}>
              ¡Hola, {user?.nombre}! 👋
            </h1>
            <p style={{ fontSize:13,color:"#9C8790",margin:"4px 0 0" }}>Aquí tienes el resumen de tus candidatas activas.</p>
          </div>
          {!isMobile && (
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={exportar}
                style={{ display:"flex",alignItems:"center",gap:7,background:"#fff",border:"1.5px solid #e9e3f8",color:"#A0435F",fontSize:13,fontWeight:600,padding:"9px 18px",borderRadius:12,cursor:"pointer",fontFamily:"inherit" }}>
                <DownloadIcon size={14}/> Exportar reporte
              </button>
              <button
                style={{ display:"flex",alignItems:"center",gap:7,background:"#A0435F",color:"#fff",fontSize:13,fontWeight:600,padding:"9px 18px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit" }}>
                <SlidersIcon size={14}/> Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:isMobile?"14px 16px 40px":"20px 28px 40px",maxWidth:1400,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,flexDirection:isMobile?"column":"row" }}>

          {/* COLUMNA PRINCIPAL */}
          <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:20 }}>

            {/* STATS */}
            <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12 }}>
              {[
                { label:"Total candidatas",      val:stats.total,          desc:"Aprobadas y visibles para tu agencia",        color:"#A0435F", emoji:"👥" },
                { label:"Listas para conectar",  val:stats.listasConectar, desc:"En espera de que inicies el primer contacto", color:"#12A46B", emoji:"✅" },
                { label:"En proceso de match",   val:stats.enMatch,        desc:"Ya hay comunicación con Host Family",          color:"#E8853B", emoji:"⭐" },
                { label:"En proceso de visa",    val:stats.visaEnProceso,  desc:"Documentos enviados a la embajada",            color:"#C0392B", emoji:"📋" },
              ].map((s,i)=>(
                <div key={i} style={{ background:"#fff",borderRadius:16,border:"1px solid #e9e3f8",padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background:`${s.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{s.emoji}</div>
                    <div>
                      <p style={{ fontFamily:"Georgia,serif",fontSize:28,fontWeight:700,color:"#4A2A38",margin:0,lineHeight:1 }}>{s.val}</p>
                      <p style={{ fontSize:12,fontWeight:600,color:"#4A2A38",margin:"4px 0 2px" }}>{s.label}</p>
                      <p style={{ fontSize:11,color:"#9C8790",margin:0,lineHeight:1.4 }}>{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TABLA CANDIDATAS */}
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e9e3f8",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"16px 20px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
                <div>
                  <h2 style={{ fontSize:16,fontWeight:700,color:"#4A2A38",margin:0 }}>Candidatas aprobadas</h2>
                  <p style={{ fontSize:12,color:"#9C8790",margin:"2px 0 0" }}>Solo ves las candidatas que Destino Au Pair ha aprobado para tu agencia.</p>
                </div>
                <Link href="/agencia/perfiles"
                  style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:"#A0435F",textDecoration:"none",background:"#FBF4F6",padding:"8px 14px",borderRadius:10,border:"1px solid #FCE8EE" }}>
                  Ver todas las candidatas <ArrowRightIcon size={13}/>
                </Link>
              </div>

              {/* Buscador */}
              <div style={{ padding:"10px 20px",borderBottom:"1px solid #F3F4F6" }}>
                <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Buscar por nombre, ciudad o país..."
                  style={{ width:"100%",border:"1.5px solid #e9e3f8",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#4A2A38",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
              </div>

              {filtradas.length === 0 ? (
                <div style={{ padding:"48px 20px",textAlign:"center" }}>
                  <p style={{ fontSize:32,margin:"0 0 8px" }}>🔍</p>
                  <p style={{ fontSize:14,fontWeight:600,color:"#4A2A38",margin:"0 0 4px" }}>No hay candidatas aún</p>
                  <p style={{ fontSize:12,color:"#9C8790",margin:0 }}>Las candidatas aparecerán cuando completen su evaluación de perfil.</p>
                </div>
              ) : isMobile ? (
                // Mobile cards
                <div>
                  {visibles.map((c,i)=>(
                    <div key={c.id} style={{ padding:"14px 16px",borderBottom:i<visibles.length-1?"1px solid #F3F4F6":"none" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                        <div style={{ width:38,height:38,borderRadius:"50%",background:"#FCE8EE",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          {c.foto_url
                            ? <img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                            : <span style={{ fontSize:14,fontWeight:700,color:"#A0435F" }}>{c.nombre?.[0]}</span>}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <p style={{ fontSize:13,fontWeight:600,color:"#4A2A38",margin:0 }}>{c.nombre} {c.apellido}</p>
                          <p style={{ fontSize:11,color:"#9C8790",margin:0 }}>ID: DA-{String(c.id).padStart(4,"0")} · {c.edad||"—"} años · {PAISES_EMOJI[c.pais]||""} {c.pais||"—"}</p>
                        </div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
                        <FaseBadge fase={c.estado_agencia}/>
                        <div style={{ display:"flex",gap:6 }}>
                          <Link href={`/agencia/perfiles/${c.id}`} style={{ width:30,height:30,borderRadius:8,background:"#FBF4F6",border:"1px solid #FCE8EE",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none" }}>
                            <EyeIcon size={13} style={{ color:"#A0435F" }}/>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop table
                <>
                  <div style={{ display:"grid",gridTemplateColumns:"2fr .6fr .8fr 1.2fr .8fr .8fr",gap:12,padding:"10px 20px",background:"#F3F4F6",borderBottom:"1px solid #F3F4F6" }}>
                    {["Candidata","Edad","País","Fase actual","Estado","Acción"].map((h,i)=>(
                      <p key={i} style={{ fontSize:10,fontWeight:700,color:"#9C8790",margin:0,textTransform:"uppercase",letterSpacing:".5px" }}>{h}</p>
                    ))}
                  </div>
                  {visibles.map((c,i)=>(
                    <div key={c.id} style={{ display:"grid",gridTemplateColumns:"2fr .6fr .8fr 1.2fr .8fr .8fr",gap:12,padding:"14px 20px",borderBottom:i<visibles.length-1?"1px solid #f9f0f9":"none",alignItems:"center" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:12,minWidth:0 }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",background:"#FCE8EE",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          {c.foto_url
                            ? <img src={c.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                            : <span style={{ fontSize:15,fontWeight:700,color:"#A0435F" }}>{c.nombre?.[0]}</span>}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:13,fontWeight:600,color:"#4A2A38",margin:0 }}>{c.nombre} {c.apellido}</p>
                          <p style={{ fontSize:10,color:"#9C8790",margin:0 }}>ID: DA-{String(c.id).padStart(4,"0")}</p>
                        </div>
                      </div>
                      <p style={{ fontSize:13,color:"#6B7280",margin:0 }}>{c.edad||"—"} años</p>
                      <p style={{ fontSize:13,color:"#6B7280",margin:0 }}>{PAISES_EMOJI[c.pais]||""} {c.pais||"—"}</p>
                      <FaseBadge fase={c.estado_agencia}/>
                      <EstadoBadge estado={c.estado_agencia}/>
                      <div style={{ display:"flex",gap:6 }}>
                        <Link href={`/agencia/perfiles/${c.id}`} title="Ver perfil"
                          style={{ width:30,height:30,borderRadius:8,background:"#FBF4F6",border:"1px solid #FCE8EE",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none" }}>
                          <EyeIcon size={13} style={{ color:"#A0435F" }}/>
                        </Link>
                        <button title="Documentos"
                          style={{ width:30,height:30,borderRadius:8,background:"#FBF4F6",border:"1px solid #FCE8EE",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                          <FileTextIcon size={13} style={{ color:"#A0435F" }}/>
                        </button>
                        <button title="Contactar"
                          style={{ width:30,height:30,borderRadius:8,background:"#FBF4F6",border:"1px solid #FCE8EE",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                          <MessageSquareIcon size={13} style={{ color:"#A0435F" }}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {filtradas.length > 5 && (
                <div style={{ padding:"14px 20px",borderTop:"1px solid #F3F4F6",textAlign:"center" }}>
                  <button onClick={()=>setVerMas(v=>!v)}
                    style={{ display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"1.5px solid #e9e3f8",color:"#A0435F",fontSize:12,fontWeight:600,padding:"9px 20px",borderRadius:10,cursor:"pointer",fontFamily:"inherit" }}>
                    {verMas ? "Ver menos" : `Ver más candidatas (${filtradas.length - 5} más)`}
                  </button>
                </div>
              )}
            </div>

            {/* AVISO */}
            <div style={{ background:"#FCE8EE",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10,border:"1px solid #F5E1E7" }}>
              <span style={{ fontSize:16,flexShrink:0 }}>ℹ️</span>
              <p style={{ fontSize:12,color:"#7D2F47",margin:0,lineHeight:1.5 }}>
                <strong>Recuerda:</strong> Solo puedes ver y comunicarte con las candidatas que Destino Au Pair ha aprobado y compartido contigo.
              </p>
            </div>
          </div>

          {/* PANEL LATERAL — solo desktop */}
          {!isMobile && (
            <div style={{ width:300,flexShrink:0,display:"flex",flexDirection:"column",gap:16 }}>

              {/* PROGRESO GENERAL */}
              <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e9e3f8",padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <h3 style={{ fontSize:14,fontWeight:700,color:"#4A2A38",margin:"0 0 16px" }}>Progreso general</h3>
                <DonaProgreso stats={stats}/>
              </div>

              {/* ACTIVIDAD RECIENTE */}
              <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e9e3f8",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ padding:"14px 16px",borderBottom:"1px solid #F3F4F6" }}>
                  <h3 style={{ fontSize:14,fontWeight:700,color:"#4A2A38",margin:0 }}>Actividad reciente</h3>
                </div>
                <div style={{ padding:"0 16px" }}>
                  {candidatas.slice(0,3).map((c,i)=>(
                    <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"12px 0",borderBottom:i<2?"1px solid #F3F4F6":"none" }}>
                      <div style={{ width:28,height:28,borderRadius:"50%",background:"#FCE8EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#A0435F",flexShrink:0 }}>
                        {c.nombre?.[0]}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <p style={{ fontSize:12,fontWeight:600,color:"#4A2A38",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                          {c.nombre} {c.apellido} fue aprobada
                        </p>
                        <p style={{ fontSize:10,color:"#9C8790",margin:"2px 0 0" }}>
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("es-CO") : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                  {candidatas.length === 0 && <p style={{ fontSize:12,color:"#9C8790",padding:"16px 0",textAlign:"center",margin:0 }}>Sin actividad aún.</p>}
                </div>
                <div style={{ padding:"10px 16px",borderTop:"1px solid #F3F4F6" }}>
                  <Link href="/agencia/perfiles" style={{ fontSize:12,fontWeight:600,color:"#A0435F",textDecoration:"none",display:"flex",alignItems:"center",gap:4 }}>
                    Ver toda la actividad <ArrowRightIcon size={12}/>
                  </Link>
                </div>
              </div>

              {/* RECORDATORIOS */}
              <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e9e3f8",padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                  <div style={{ width:32,height:32,borderRadius:10,background:"#FFF4EC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>📅</div>
                  <p style={{ fontSize:13,fontWeight:700,color:"#4A2A38",margin:0 }}>Recordatorios importantes</p>
                </div>
                <p style={{ fontSize:12,color:"#6B7280",margin:"0 0 12px",lineHeight:1.5 }}>
                  Responde a las candidatas listas para conectar en un máximo de 7 días.
                </p>
                <a href="mailto:hola@destino-aupair.com"
                  style={{ fontSize:12,fontWeight:600,color:"#A0435F",textDecoration:"none",display:"flex",alignItems:"center",gap:4 }}>
                  Ver lineamientos <ArrowRightIcon size={12}/>
                </a>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}