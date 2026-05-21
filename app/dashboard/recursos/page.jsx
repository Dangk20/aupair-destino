"use client";
// app/dashboard/recursos/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Calendar, ArrowRight, Search, Download,
  ChevronRight, ExternalLink, FileText, Video,
  Link2, BookOpen, CheckSquare, Mic,
} from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";

/* ─── Categorías ─────────────────────────────────────────────────────────── */
const CATEGORIAS = [
  { id:"todos",      label:"Todos los recursos", emoji:"📦" },
  { id:"guias",      label:"Guías y ebooks",      emoji:"📚" },
  { id:"plantillas", label:"Plantillas",           emoji:"📝" },
  { id:"video",      label:"Videos",              emoji:"🎬" },
  { id:"podcast",    label:"Podcasts",             emoji:"🎙️" },
  { id:"link",       label:"Enlaces útiles",       emoji:"🔗" },
  { id:"checklist",  label:"Checklist",            emoji:"☑️" },
];

/* ─── Recursos fallback (mientras no existan en BD) ─────────────────────── */
const RECURSOS_EJEMPLO = [
  { id:1, titulo:"Guía completa del programa Au Pair",    descripcion:"Todo lo que necesitas saber: responsabilidades, beneficios, duración y reglas principales.", categoria:"guias",      tipo:"pdf",      tamano_kb:2400, icono_emoji:"📚", url:"#" },
  { id:2, titulo:"Cómo crear tu perfil ideal",            descripcion:"Tips para destacar tu experiencia, habilidades y personalidad en tu perfil.",               categoria:"guias",      tipo:"pdf",      tamano_kb:800,  icono_emoji:"✨", url:"#" },
  { id:3, titulo:"Checklist de documentos",               descripcion:"Lista completa de documentos que necesitas para tu aplicación y proceso de visa.",           categoria:"checklist",  tipo:"checklist",tamano_kb:500,  icono_emoji:"☑️", url:"#" },
  { id:4, titulo:"Guía para tu viaje",                    descripcion:"Todo lo que necesitas saber antes de viajar: qué llevar, seguro médico y primeros días.",    categoria:"guias",      tipo:"pdf",      tamano_kb:2000, icono_emoji:"✈️", url:"#" },
  { id:5, titulo:"Webinar: Experiencias reales de Au Pairs",descripcion:"Escucha historias y consejos de Au Pairs que ya vivieron esta aventura.",                 categoria:"video",      tipo:"video",    tamano_kb:0,    icono_emoji:"🎬", url:"#" },
  { id:6, titulo:"Manejo del choque cultural",            descripcion:"Consejos para adaptarte a tu nueva cultura y manejar los desafíos emocionales.",            categoria:"guias",      tipo:"pdf",      tamano_kb:1200, icono_emoji:"🌍", url:"#" },
  { id:7, titulo:"Plantilla carta de presentación",       descripcion:"Modelo editable para presentarte ante las familias de manera profesional.",                 categoria:"plantillas", tipo:"plantilla",tamano_kb:400,  icono_emoji:"📝", url:"#" },
  { id:8, titulo:"Podcast: La vida de una Au Pair",       descripcion:"Episodios con consejos prácticos de Au Pairs y coordinadoras del programa.",                categoria:"podcast",    tipo:"podcast",  tamano_kb:0,    icono_emoji:"🎙️", url:"#" },
];

/* ─── Icono por tipo ─────────────────────────────────────────────────────── */
const TIPO_ICONO = {
  pdf:       { icon:FileText, bg:"#fce7f3", color:"#be185d"  },
  video:     { icon:Video,    bg:"#dbeafe", color:"#1d4ed8"  },
  link:      { icon:Link2,    bg:"#d1fae5", color:"#059669"  },
  plantilla: { icon:BookOpen, bg:"#ede9fe", color:"#7c3aed"  },
  podcast:   { icon:Mic,      bg:"#fef3c7", color:"#d97706"  },
  checklist: { icon:CheckSquare,bg:"#dcfce7",color:"#16a34a" },
  ebook:     { icon:BookOpen, bg:"#ede9fe", color:"#7c3aed"  },
};

function formatSize(kb) {
  if (!kb || kb === 0) return null;
  if (kb < 1024) return `${kb} KB`;
  return `${(kb/1024).toFixed(1)} MB`;
}

/* ─── Donut ──────────────────────────────────────────────────────────────── */
function DonutProgress({ pct=0 }) {
  const r=54, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e8f8" strokeWidth="12"/>
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#gr)" strokeWidth="12"
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*.25}
        strokeLinecap="round"/>
      <defs><linearGradient id="gr" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
      </linearGradient></defs>
      <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22, fontWeight:700, fontFamily:"Georgia,serif" }}>{pct}%</text>
      <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11, fontFamily:"system-ui" }}>Completado</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function RecursosPage() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [recursos,  setRecursos]  = useState([]);
  const [proceso,   setProceso]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [categoria, setCategoria] = useState("todos");
  const [busqueda,  setBusqueda]  = useState("");
  const [ordenar,   setOrdenar]   = useState("recientes");

  useEffect(() => {
    const safe = (p, fb=null) => p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),           { user:null }),
      safe(fetch("/api/dashboard/recursos?limit=50"), { recursos:[] }),
      safe(fetch("/api/dashboard/proceso"), null),
    ]).then(([me, rData, proc]) => {
      setUser(me?.user || null);
      setRecursos(rData.recursos?.length > 0 ? rData.recursos : RECURSOS_EJEMPLO);
      setProceso(proc);
      setLoading(false);
    });
  }, []);

  /* ── Filtrar ── */
  const filtrados = recursos
    .filter(r => categoria === "todos" || r.categoria === categoria || r.tipo === categoria)
    .filter(r => !busqueda || r.titulo.toLowerCase().includes(busqueda.toLowerCase()) || (r.descripcion||"").toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a,b) => ordenar === "az" ? a.titulo.localeCompare(b.titulo) : new Date(b.created_at||0) - new Date(a.created_at||0));

  const fasesCompletadas = proceso?.pasos?.filter(p => ["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id) && p.status==="completado")?.length || 0;
  const pctProceso = Math.round((fasesCompletadas / 5) * 100);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .rec-row:hover{background:#faf5ff!important;} .cat-btn:hover{background:#f5f0ff!important;}`}</style>

      {/* HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ece8f0", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, position:"sticky", top:0, zIndex:20 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#1e1033", margin:0 }}>¡Hola, {user?.nombre}! 👋</h1>
          <p style={{ fontSize:13, color:"#9a7080", margin:"2px 0 0" }}>Sigue aprendiendo y preparándote para tu aventura. 💜</p>
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
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700, color:"#1e1033", margin:"0 0 6px" }}>Recursos</h2>
            <p style={{ fontSize:13, color:"#9a7080", margin:0 }}>Encuentra herramientas, plantillas y documentos útiles para tu proceso Au Pair.</p>
          </div>

          {/* TABS por categoría */}
          <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:4 }}>
            {CATEGORIAS.map(cat => (
              <button key={cat.id} className="cat-btn" onClick={() => setCategoria(cat.id)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, whiteSpace:"nowrap", transition:"all .12s", fontFamily:"inherit",
                  background: categoria===cat.id ? "#7c3aed" : "#fff",
                  color:       categoria===cat.id ? "#fff"    : "#6b7280",
                  boxShadow:   categoria===cat.id ? "0 2px 8px rgba(124,58,237,.3)" : "0 1px 3px rgba(0,0,0,.07)",
                }}>
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* BUSCADOR + ORDEN */}
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ flex:1, position:"relative" }}>
              <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9ca3af" }}/>
              <input type="text" placeholder="Buscar recursos..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                style={{ width:"100%", paddingLeft:36, paddingRight:12, height:40, border:"1.5px solid #e5e7eb", borderRadius:12, fontSize:13, color:"#1e1033", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
            </div>
            <select value={ordenar} onChange={e => setOrdenar(e.target.value)}
              style={{ height:40, border:"1.5px solid #e5e7eb", borderRadius:12, padding:"0 12px", fontSize:13, color:"#1e1033", background:"#fff", cursor:"pointer", outline:"none", fontFamily:"inherit" }}>
              <option value="recientes">Más recientes</option>
              <option value="az">A → Z</option>
            </select>
          </div>

          {/* LISTA */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            {filtrados.length === 0 ? (
              <div style={{ padding:"48px 24px", textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
                <p style={{ fontSize:14, color:"#9a7080", margin:0 }}>No se encontraron recursos con ese filtro.</p>
              </div>
            ) : filtrados.map((r, i) => {
              const tipoCfg = TIPO_ICONO[r.tipo] || TIPO_ICONO.pdf;
              const TipoIcon = tipoCfg.icon;
              const size = formatSize(r.tamano_kb);
              return (
                <div key={r.id} className="rec-row"
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", borderBottom:i<filtrados.length-1?"1px solid #f5eef8":"none", background:"#fff", transition:"background .12s" }}>

                  {/* Icono tipo */}
                  <div style={{ width:46, height:46, borderRadius:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
                    background: tipoCfg.bg,
                  }}>
                    {r.icono_emoji || <TipoIcon size={20} style={{ color:tipoCfg.color }}/>}
                  </div>

                  {/* Contenido */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:"#1e1033", margin:"0 0 3px" }}>{r.titulo}</p>
                    {r.descripcion && (
                      <p style={{ fontSize:12, color:"#9a7080", margin:0, lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {r.descripcion}
                      </p>
                    )}
                    <div style={{ display:"flex", gap:8, marginTop:5 }}>
                      <span style={{ fontSize:10, fontWeight:600, background:tipoCfg.bg, color:tipoCfg.color, padding:"2px 8px", borderRadius:99, textTransform:"uppercase" }}>
                        {r.tipo}
                      </span>
                      {size && <span style={{ fontSize:10, color:"#9ca3af" }}>{size}</span>}
                    </div>
                  </div>

                  {/* Botón */}
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:12, border:"1.5px solid #ede9fe", background:"#fff", color:"#7c3aed", fontSize:12, fontWeight:600, textDecoration:"none", flexShrink:0, cursor:r.url==="#"?"not-allowed":"pointer", opacity:r.url==="#"?.5:1 }}>
                    {r.tipo==="link" ? <ExternalLink size={13}/> : r.tipo==="video" ? <Video size={13}/> : <Download size={13}/>}
                    {r.tipo==="link" ? "Abrir enlace" : r.tipo==="video" ? "Ver video" : "Ver / Descargar"}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #ece4f0", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"#f5f0ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📦</div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:0 }}>¿Tienes algún recurso para compartir?</p>
                <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>Recomienda herramientas que puedan ayudar a otras futuras Au Pairs.</p>
              </div>
            </div>
            <button style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:12, border:"1.5px solid #ede9fe", background:"#fff", color:"#7c3aed", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              📤 Compartir recurso
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.04)", textAlign:"center" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:"0 0 16px", textAlign:"left" }}>Tu progreso en el proceso</h3>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
              <DonutProgress pct={pctProceso}/>
            </div>
            <p style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 2px" }}>
              {fasesCompletadas} de 5 fases completadas
            </p>
            <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 14px" }}>Sigue así, vas por buen camino 💜</p>
            <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"1.5px solid #ede9fe", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
              🗺️ Ver mi proceso completo
            </Link>
          </div>

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

          <HelpCard onContact={() => router.push("/dashboard/mensajes")}/>
        </aside>
      </div>
    </div>
  );
}