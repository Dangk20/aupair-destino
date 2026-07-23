"use client";
// app/dashboard/recursos/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Calendar, ArrowRight, Search, Download,
  ExternalLink, FileText, Video, Link2, BookOpen,
  CheckSquare, Mic, Lock,
} from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";
import { useMobile } from "@/context/MobileContext";
import { ComingSoon } from "@/components/dashboard/AccessGate";

const CATEGORIAS = [
  { id:"todos",      label:"Todos",      emoji:"📦" },
  { id:"guias",      label:"Guías",      emoji:"📚" },
  { id:"plantillas", label:"Plantillas", emoji:"📝" },
  { id:"video",      label:"Videos",     emoji:"🎬" },
  { id:"podcast",    label:"Podcasts",   emoji:"🎙️" },
  { id:"link",       label:"Enlaces",    emoji:"🔗" },
  { id:"checklist",  label:"Checklist",  emoji:"☑️" },
];

const RECURSOS_EJEMPLO = [
  { id:1,titulo:"Guía completa del programa Au Pair",    descripcion:"Todo lo que necesitas saber: responsabilidades, beneficios y reglas.",categoria:"guias",     tipo:"pdf",      tamano_kb:2400,icono_emoji:"📚",url:"#" },
  { id:2,titulo:"Cómo crear tu perfil ideal",            descripcion:"Tips para destacar tu experiencia y personalidad.",                  categoria:"guias",     tipo:"pdf",      tamano_kb:800, icono_emoji:"✨",url:"#" },
  { id:3,titulo:"Checklist de documentos",               descripcion:"Lista completa de documentos para tu aplicación y visa.",            categoria:"checklist", tipo:"checklist",tamano_kb:500, icono_emoji:"☑️",url:"#" },
  { id:4,titulo:"Guía para tu viaje",                    descripcion:"Qué llevar, seguro médico y primeros días.",                         categoria:"guias",     tipo:"pdf",      tamano_kb:2000,icono_emoji:"✈️",url:"#" },
  { id:5,titulo:"Webinar: Experiencias reales de Au Pairs",descripcion:"Historias y consejos de Au Pairs que ya vivieron esta aventura.", categoria:"video",     tipo:"video",    tamano_kb:0,   icono_emoji:"🎬",url:"#" },
];

const TIPO_ICONO = {
  pdf:       { icon:FileText,   bg:"#fce7f3", color:"#be185d" },
  video:     { icon:Video,      bg:"#dbeafe", color:"#1d4ed8" },
  link:      { icon:Link2,      bg:"#d1fae5", color:"#059669" },
  plantilla: { icon:BookOpen,   bg:"#ede9fe", color:"#7c3aed" },
  podcast:   { icon:Mic,        bg:"#fef3c7", color:"#d97706" },
  checklist: { icon:CheckSquare,bg:"#dcfce7", color:"#16a34a" },
  ebook:     { icon:BookOpen,   bg:"#ede9fe", color:"#7c3aed" },
};

function formatSize(kb) {
  if (!kb||kb===0) return null;
  return kb<1024?`${kb} KB`:`${(kb/1024).toFixed(1)} MB`;
}

export default function RecursosPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,      setUser]      = useState(null);
  const [recursos,  setRecursos]  = useState([]);
  const [proceso,   setProceso]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [categoria, setCategoria] = useState("todos");
  const [busqueda,  setBusqueda]  = useState("");
  const [ordenar,   setOrdenar]   = useState("recientes");

  useEffect(() => {
    const safe=(p,fb=null)=>p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),                      {user:null}),
      safe(fetch("/api/dashboard/recursos?limit=50"), {recursos:[]}),
      safe(fetch("/api/dashboard/proceso"),            null),
    ]).then(([me,rData,proc]) => {
      setUser(me?.user||null);
      setRecursos(rData.recursos?.length>0?rData.recursos:RECURSOS_EJEMPLO);
      setProceso(proc); setLoading(false);
    });
  }, []);

  const filtrados = recursos
    .filter(r=>categoria==="todos"||r.categoria===categoria||r.tipo===categoria)
    .filter(r=>!busqueda||r.titulo.toLowerCase().includes(busqueda.toLowerCase())||(r.descripcion||"").toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a,b)=>ordenar==="az"?a.titulo.localeCompare(b.titulo):new Date(b.created_at||0)-new Date(a.created_at||0));

  const fasesCompletadas = proceso?.pasos?.filter(p=>["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id)&&p.status==="completado")?.length||0;
  const pctProceso = Math.round((fasesCompletadas/5)*100);

  return <ComingSoon titulo="El centro de recursos" detalle="Estamos preparando guías, plantillas y materiales para tu proceso. Muy pronto disponibles aquí."/>;

  return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .rec-row:hover{background:#faf5ff!important;}`}</style>

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #ece8f0",padding:isMobile?"12px 16px":"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,position:"sticky",top:0,zIndex:20 }}>
        <div style={{ minWidth:0 }}>
          <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?18:22,fontWeight:700,color:"#1e1033",margin:0 }}>¡Hola, {user?.nombre}! 👋</h1>
          {!isMobile && <p style={{ fontSize:13,color:"#9a7080",margin:"2px 0 0" }}>Sigue aprendiendo y preparándote. 💜</p>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          <button style={{ position:"relative",padding:8,borderRadius:12,border:"1px solid #ece4f0",background:"#fff",cursor:"pointer",flexShrink:0 }}>
            <Bell size={17} style={{ color:"#9a7080" }}/>
            <span style={{ position:"absolute",top:6,right:6,width:7,height:7,background:"#a0435f",borderRadius:"50%",border:"1.5px solid #fff" }}/>
          </button>
          {!isMobile && (
            <>
              <Link href="/dashboard/reuniones" style={{ display:"flex",alignItems:"center",gap:6,border:"1.5px solid #e0d0e8",color:"#6b4a70",fontSize:13,fontWeight:500,padding:"8px 14px",borderRadius:12,textDecoration:"none",background:"#fff" }}>
                <Calendar size={14}/> Agendar reunión
              </Link>
              <Link href="/dashboard/proceso" style={{ display:"flex",alignItems:"center",gap:6,background:"#5b21b6",color:"#fff",fontSize:13,fontWeight:600,padding:"9px 16px",borderRadius:12,textDecoration:"none" }}>
                Ver mi proceso <ArrowRight size={13}/>
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth:1400,margin:"0 auto",padding:isMobile?"14px 16px 40px":"20px 24px 40px",display:"flex",gap:20,flexDirection:isMobile?"column":"row" }}>
        <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:14 }}>

          <div>
            <h2 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?18:20,fontWeight:700,color:"#1e1033",margin:"0 0 4px" }}>Recursos</h2>
            <p style={{ fontSize:13,color:"#9a7080",margin:0 }}>Herramientas, plantillas y documentos para tu proceso Au Pair.</p>
          </div>

          {/* TABS */}
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none" }}>
            {CATEGORIAS.map(cat=>(
              <button key={cat.id} onClick={()=>setCategoria(cat.id)}
                style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"7px 12px":"8px 14px",borderRadius:99,border:"none",cursor:"pointer",fontSize:isMobile?11:12,fontWeight:600,whiteSpace:"nowrap",transition:"all .12s",fontFamily:"inherit",
                  background:categoria===cat.id?"#7c3aed":"#fff",color:categoria===cat.id?"#fff":"#6b7280",
                  boxShadow:categoria===cat.id?"0 2px 8px rgba(124,58,237,.3)":"0 1px 3px rgba(0,0,0,.07)",
                }}>
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* BUSCADOR */}
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <div style={{ flex:1,position:"relative" }}>
              <Search size={14} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#9ca3af" }}/>
              <input type="text" placeholder="Buscar recursos..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}
                style={{ width:"100%",paddingLeft:36,paddingRight:12,height:38,border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:13,color:"#1e1033",outline:"none",boxSizing:"border-box",fontFamily:"inherit" }}/>
            </div>
            {!isMobile && (
              <select value={ordenar} onChange={e=>setOrdenar(e.target.value)}
                style={{ height:38,border:"1.5px solid #e5e7eb",borderRadius:12,padding:"0 12px",fontSize:13,color:"#1e1033",background:"#fff",cursor:"pointer",outline:"none",fontFamily:"inherit" }}>
                <option value="recientes">Más recientes</option>
                <option value="az">A → Z</option>
              </select>
            )}
          </div>

          {/* LISTA */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            {filtrados.length===0 ? (
              <div style={{ padding:"40px 24px",textAlign:"center" }}>
                <div style={{ fontSize:36,marginBottom:10 }}>🔍</div>
                <p style={{ fontSize:14,color:"#9a7080",margin:0 }}>No se encontraron recursos con ese filtro.</p>
              </div>
            ) : filtrados.map((r,i) => {
              const tipoCfg=TIPO_ICONO[r.tipo]||TIPO_ICONO.pdf;
              const TipoIcon=tipoCfg.icon;
              const size=formatSize(r.tamano_kb);
              return (
                <div key={r.id} className="rec-row"
                  style={{ padding:isMobile?"14px 16px":"16px 20px",borderBottom:i<filtrados.length-1?"1px solid #f5eef8":"none",background:"#fff" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    {/* Ícono */}
                    <div style={{ width:42,height:42,borderRadius:12,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,background:tipoCfg.bg }}>
                      {r.icono_emoji||<TipoIcon size={18} style={{ color:tipoCfg.color }}/>}
                    </div>
                    {/* Info */}
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:isMobile?13:14,fontWeight:600,color:"#1e1033",margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:isMobile?"normal":"nowrap" }}>{r.titulo}</p>
                      {!isMobile && r.descripcion && <p style={{ fontSize:12,color:"#9a7080",margin:0,lineHeight:1.4 }}>{r.descripcion}</p>}
                      <div style={{ display:"flex",gap:7,marginTop:4 }}>
                        <span style={{ fontSize:10,fontWeight:600,background:tipoCfg.bg,color:tipoCfg.color,padding:"2px 7px",borderRadius:99,textTransform:"uppercase" }}>{r.tipo}</span>
                        {size&&<span style={{ fontSize:10,color:"#9ca3af" }}>{size}</span>}
                      </div>
                    </div>
                    {/* Botón */}
                    {!isMobile && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:12,border:"1.5px solid #ede9fe",background:"#fff",color:"#7c3aed",fontSize:12,fontWeight:600,textDecoration:"none",flexShrink:0,opacity:r.url==="#"?.5:1,cursor:r.url==="#"?"not-allowed":"pointer" }}>
                        {r.tipo==="link"?<ExternalLink size={12}/>:r.tipo==="video"?<Video size={12}/>:<Download size={12}/>}
                        {r.tipo==="link"?"Abrir":r.tipo==="video"?"Ver":"Descargar"}
                      </a>
                    )}
                  </div>
                  {/* Botón mobile — debajo */}
                  {isMobile && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginTop:10,padding:"9px",borderRadius:12,border:"1.5px solid #ede9fe",background:"#fff",color:"#7c3aed",fontSize:12,fontWeight:600,textDecoration:"none",opacity:r.url==="#"?.5:1 }}>
                      {r.tipo==="link"?<ExternalLink size={13}/>:r.tipo==="video"?<Video size={13}/>:<Download size={13}/>}
                      {r.tipo==="link"?"Abrir enlace":r.tipo==="video"?"Ver video":"Ver / Descargar"}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:isMobile?"100%":260,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":20 }}>
            <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:"0 0 12px",textAlign:"left" }}>Tu progreso</h3>
            {isMobile ? (
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:"#1e1033" }}>{fasesCompletadas} de 5 fases</span>
                  <span style={{ fontSize:13,fontWeight:700,color:"#7c3aed" }}>{pctProceso}%</span>
                </div>
                <div style={{ height:8,background:"#f0e8f8",borderRadius:99,overflow:"hidden",marginBottom:12 }}>
                  <div style={{ height:"100%",width:`${pctProceso}%`,background:"linear-gradient(90deg,#7c3aed,#a0435f)",borderRadius:99,transition:"width .7s" }}/>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display:"flex",justifyContent:"center",marginBottom:12 }}>
                  <svg width="120" height="120" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#f0e8f8" strokeWidth="12"/>
                    <circle cx="70" cy="70" r="54" fill="none" stroke="url(#grr)" strokeWidth="12"
                      strokeDasharray={`${(pctProceso/100)*2*Math.PI*54} ${(1-pctProceso/100)*2*Math.PI*54}`}
                      strokeDashoffset={2*Math.PI*54*.25} strokeLinecap="round" style={{ transition:"stroke-dasharray .8s" }}/>
                    <defs><linearGradient id="grr" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
                    </linearGradient></defs>
                    <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22,fontWeight:700,fontFamily:"Georgia,serif" }}>{pctProceso}%</text>
                    <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11,fontFamily:"system-ui" }}>Completado</text>
                  </svg>
                </div>
                <p style={{ fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 2px",textAlign:"center" }}>{fasesCompletadas} de 5 fases</p>
                <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px",textAlign:"center" }}>Sigue así 💜</p>
              </>
            )}
            <Link href="/dashboard/proceso" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:"1.5px solid #ede9fe",color:"#7c3aed",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>
              🗺️ Ver mi proceso completo
            </Link>
          </div>
          <HelpCard onContact={()=>router.push("/dashboard/mensajes")}/>
        </aside>
      </div>
    </div>
  );
}