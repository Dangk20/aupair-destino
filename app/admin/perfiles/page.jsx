"use client";
// app/admin/perfiles/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon, DownloadIcon, EyeIcon, PencilIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from "lucide-react";

function EstadoBadge({ estado }) {
  const CFG = {
    "Completo":          { bg:"#d1fae5", color:"#059669" },
    "Verificado":        { bg:"#d1fae5", color:"#059669" },
    "En revisión":       { bg:"#dbeafe", color:"#1d4ed8" },
    "Pendiente":         { bg:"#fef3c7", color:"#d97706" },
    "Incompleto":        { bg:"#fee2e2", color:"#dc2626" },
    "Lista para agencia":{ bg:"#d1fae5", color:"#059669" },
    "En progreso":       { bg:"#fef3c7", color:"#d97706" },
    "Sin acceso":        { bg:"#f3f4f6", color:"#6b7280" },
  };
  const c = CFG[estado] || { bg:"#f3f4f6", color:"#6b7280" };
  return (
    <span style={{ background:c.bg, color:c.color, fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, display:"inline-flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.color, flexShrink:0 }}/>
      {estado||"Sin estado"}
    </span>
  );
}

function BarraProgreso({ pct=0 }) {
  const color = pct>=80?"#059669":pct>=50?"#1d4ed8":pct>=25?"#d97706":"#dc2626";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:6, background:"#f0e8f0", borderRadius:99, overflow:"hidden", minWidth:60 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width .5s" }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, flexShrink:0 }}>{pct}%</span>
    </div>
  );
}

export default function AdminPerfilesPage() {
  const router = useRouter();
  const [perfiles,     setPerfiles]     = useState([]);
  const [statsEval,    setStatsEval]    = useState({});
  const [statsAgencia, setStatsAgencia] = useState({});
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState(1);
  const [search,       setSearch]       = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [toast,        setToast]        = useState(null);
  const [pagina,       setPagina]       = useState(1);
  const POR_PAG = 10;

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2500); };

  const cargar = async () => {
    setLoading(true);
    const params = new URLSearchParams({ q:search, estado:filtroEstado, ciudad:filtroCiudad });
    try {
      const res = await fetch(`/api/admin/perfiles?${params}`);
      const d   = await res.json();
      setPerfiles(d.perfiles || []);
      setStatsEval(d.stats_evaluacion || {});
      setStatsAgencia(d.stats_agencia || {});
    } catch { showToast("Error cargando perfiles"); }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [search, filtroEstado, filtroCiudad]);

  const exportarLista = () => {
    const lineas = [
      "Nombre|Email|Ciudad|Estado|Progreso|Inglés|Licencia|Registro",
      ...lista.map(p =>
        `${p.nombre} ${p.apellido}|${p.email}|${p.ciudad||"—"}|${p.estado}|${p.progreso}%|${p.nivel_ingles||"—"}|${p.licencia_conduccion||"—"}|${p.created_at?new Date(p.created_at).toLocaleDateString("es-CO"):"—"}`
      )
    ].join("\n");
    const a = Object.assign(document.createElement("a"),{
      href:`data:text/plain;charset=utf-8,${encodeURIComponent(lineas)}`, download:"perfiles.txt"
    });
    a.click(); showToast("Lista exportada ✓");
  };

  const lista      = tab===1 ? perfiles : perfiles.filter(p => p.tiene_acceso);
  const totalPags  = Math.ceil(lista.length / POR_PAG);
  const visibles   = lista.slice((pagina-1)*POR_PAG, pagina*POR_PAG);
  const se = statsEval;
  const sa = statsAgencia;

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .row-h:hover{background:#fff8f9!important;}`}</style>

      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:3000, background:"#1e1033", color:"#fff", padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600 }}>{toast}</div>}

      <div style={{ padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16 }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:"#1e1033", margin:0 }}>Perfiles</h1>
            <p style={{ fontSize:13, color:"#9a7080", margin:"4px 0 0" }}>Gestiona y revisa todos los perfiles registrados</p>
          </div>
          <button onClick={exportarLista}
            style={{ display:"flex", alignItems:"center", gap:7, border:"1.5px solid #f0dde2", background:"#fff", color:"#2d1a22", fontSize:13, fontWeight:600, padding:"10px 18px", borderRadius:12, cursor:"pointer", fontFamily:"inherit" }}>
            <DownloadIcon size={14}/> Exportar
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", marginBottom:24, background:"#fff", borderRadius:14, border:"1px solid #f0dde2", overflow:"hidden", width:"fit-content" }}>
          {[{id:1,label:"1. Evaluación de Perfil",emoji:"🗂️"},{id:2,label:"2. Perfil con la agencia",emoji:"🏢"}].map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setPagina(1);}}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit",
                background:tab===t.id?"#fce8ed":"#fff", color:tab===t.id?"#a0435f":"#9a7080",
                borderBottom:tab===t.id?"2px solid #a0435f":"2px solid transparent",
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:24 }}>
          {(tab===1 ? [
            {label:"Perfiles totales",     val:se.total,        icon:"👥", color:"#1e1033", bg:"#f5f0ff"},
            {label:"Completos",            val:se.completos,    icon:"✅", color:"#059669", bg:"#d1fae5"},
            {label:"En revisión",          val:se.en_revision,  icon:"🔍", color:"#1d4ed8", bg:"#dbeafe"},
            {label:"Pendientes",           val:se.pendientes,   icon:"⏳", color:"#d97706", bg:"#fef3c7"},
            {label:"Incompletos",          val:se.incompletos,  icon:"⚠️", color:"#dc2626", bg:"#fee2e2"},
          ] : [
            {label:"Total perfiles",       val:sa.total,        icon:"👥", color:"#1e1033", bg:"#f5f0ff"},
            {label:"Listos para agencia",  val:sa.listos,       icon:"🏆", color:"#059669", bg:"#d1fae5"},
            {label:"En progreso",          val:sa.en_progreso,  icon:"⏳", color:"#d97706", bg:"#fef3c7"},
            {label:"En revisión",          val:sa.en_revision,  icon:"🔍", color:"#1d4ed8", bg:"#dbeafe"},
            {label:"Incompletos",          val:sa.incompletos,  icon:"⚠️", color:"#dc2626", bg:"#fee2e2"},
          ]).map((s,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:16, border:"1px solid #f0dde2", padding:"16px 18px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
                <p style={{ fontSize:11, color:"#9a7080", margin:0, lineHeight:1.3 }}>{s.label}</p>
              </div>
              <p style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:s.color, margin:0 }}>{s.val??0}</p>
              <p style={{ fontSize:10, color:"#9a7080", margin:"4px 0 0" }}>
                {s.val&&(tab===1?se.total:sa.total)?`${Math.round((s.val/(tab===1?se.total:sa.total))*100)}% del total`:"0% del total"}
              </p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0dde2", padding:"14px 18px", marginBottom:20, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <SearchIcon size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#c0909a" }}/>
            <input type="text" placeholder="Buscar por nombre, correo o país..." value={search}
              onChange={e=>{setSearch(e.target.value);setPagina(1);}}
              style={{ width:"100%", paddingLeft:36, paddingRight:12, height:38, border:"1.5px solid #f0dde2", borderRadius:10, fontSize:13, color:"#1e1033", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
          </div>
          <select value={filtroEstado} onChange={e=>{setFiltroEstado(e.target.value);setPagina(1);}}
            style={{ height:38, border:"1.5px solid #f0dde2", borderRadius:10, padding:"0 12px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", cursor:"pointer" }}>
            <option value="">Todos los estados</option>
            {(tab===1
              ? ["Completo","En revisión","Pendiente","Incompleto"]
              : ["Lista para agencia","En progreso","En revisión","Incompleto"]
            ).map(e=><option key={e}>{e}</option>)}
          </select>
          <input type="text" placeholder="Todas las ubicaciones" value={filtroCiudad}
            onChange={e=>{setFiltroCiudad(e.target.value);setPagina(1);}}
            style={{ height:38, border:"1.5px solid #f0dde2", borderRadius:10, padding:"0 12px", fontSize:13, color:"#1e1033", outline:"none", fontFamily:"inherit", width:180 }}/>
          {(filtroEstado||filtroCiudad||search) && (
            <button onClick={()=>{setSearch("");setFiltroEstado("");setFiltroCiudad("");}}
              style={{ padding:"8px 14px", border:"1.5px solid #f0dde2", borderRadius:10, background:"#fff", color:"#9a7080", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Limpiar
            </button>
          )}
        </div>

        {/* Tabla */}
        <div style={{ background:"#fff", borderRadius:20, border:"1px solid #f0dde2", overflow:"hidden" }}>

          {/* Headers Tab 1 */}
          {tab===1 && (
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 1.2fr 100px", gap:12, padding:"12px 20px", borderBottom:"1px solid #fce8ed", background:"#fff8f9" }}>
              {["Usuario","Ubicación","Estado","Progreso","Última actividad","Acciones"].map(h=>(
                <p key={h} style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".7px", margin:0 }}>{h}</p>
              ))}
            </div>
          )}

          {/* Headers Tab 2 */}
          {tab===2 && (
            <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr .8fr .8fr 1.1fr 1.2fr 1fr 100px", gap:10, padding:"12px 20px", borderBottom:"1px solid #fce8ed", background:"#fff8f9" }}>
              {["Aplicante","Ciudad","Inglés","Licencia","Horas childcare","Progreso agencia","Estado agencia","Acciones"].map(h=>(
                <p key={h} style={{ fontSize:10, fontWeight:700, color:"#9a7080", textTransform:"uppercase", letterSpacing:".7px", margin:0 }}>{h}</p>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ padding:"48px", display:"flex", justifyContent:"center" }}>
              <div style={{ width:32, height:32, border:"2px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
            </div>
          ) : visibles.length===0 ? (
            <p style={{ textAlign:"center", padding:"48px", fontSize:13, color:"#9a7080" }}>No se encontraron perfiles.</p>
          ) : (
            <div>
              {visibles.map((p,i) => (
                tab===1 ? (
                  /* Fila Tab 1 */
                  <div key={p.id} className="row-h"
                    style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 1.2fr 100px", gap:12, padding:"14px 20px", borderBottom:i<visibles.length-1?"1px solid #fff0f3":"none", alignItems:"center", background:"#fff" }}>
                    {/* Usuario */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:"#fce8ed", border:"2px solid #f0b8c4", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {p.foto_url
                          ? <img src={p.foto_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}}/>
                          : <span style={{ color:"#a0435f", fontWeight:700, fontFamily:"Georgia,serif", fontSize:16 }}>{p.nombre?.[0]}</span>}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nombre} {p.apellido}</p>
                        <p style={{ fontSize:11, color:"#9a7080", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.email}</p>
                      </div>
                    </div>
                    <p style={{ fontSize:12, color:"#6b4a54", margin:0 }}>📍 {p.ciudad||"—"}{p.pais?", "+p.pais:""}</p>
                    <EstadoBadge estado={p.estado}/>
                    <BarraProgreso pct={p.progreso}/>
                    <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>{p.ultima_actividad}</p>
                    {/* Acciones — navegan a página completa */}
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => router.push(`/admin/perfiles/${p.id}`)}
                        title="Ver perfil completo"
                        style={{ width:32, height:32, borderRadius:9, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <EyeIcon size={14} style={{ color:"#a0435f" }}/>
                      </button>
                      <button onClick={() => router.push(`/admin/perfiles/${p.id}`)}
                        title="Editar perfil"
                        style={{ width:32, height:32, borderRadius:9, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <PencilIcon size={14} style={{ color:"#a0435f" }}/>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Fila Tab 2 */
                  <div key={p.id} className="row-h"
                    style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr .8fr .8fr 1.1fr 1.2fr 1fr 100px", gap:10, padding:"14px 20px", borderBottom:i<visibles.length-1?"1px solid #fff0f3":"none", alignItems:"center", background:"#fff" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:"#fce8ed", border:"2px solid #f0b8c4", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {p.foto_url
                          ? <img src={p.foto_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}}/>
                          : <span style={{ color:"#a0435f", fontWeight:700, fontFamily:"Georgia,serif", fontSize:16 }}>{p.nombre?.[0]}</span>}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:"#1e1033", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nombre} {p.apellido}</p>
                        <p style={{ fontSize:11, color:"#9a7080", margin:0 }}>{p.email}</p>
                        {p.cedula && <p style={{ fontSize:10, color:"#c0909a", margin:0 }}>{p.cedula}</p>}
                      </div>
                    </div>
                    <p style={{ fontSize:12, color:"#6b4a54", margin:0 }}>📍 {p.ciudad||"—"}</p>
                    {p.nivel_ingles
                      ? <span style={{ background:"#e8f4fd", color:"#1d4ed8", fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:99, whiteSpace:"nowrap" }}>{p.nivel_ingles}</span>
                      : <span style={{ color:"#c0909a", fontSize:12 }}>—</span>}
                    {p.licencia_conduccion==="Si"
                      ? <span style={{ background:"#d1fae5", color:"#059669", fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:99 }}>Sí</span>
                      : p.licencia_conduccion==="No"
                      ? <span style={{ background:"#fee2e2", color:"#dc2626", fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:99 }}>No</span>
                      : <span style={{ background:"#fef3c7", color:"#d97706", fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:99 }}>En proceso</span>}
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>{p.horas_childcare||0} h</p>
                      <p style={{ fontSize:10, color:(p.horas_childcare||0)>1500?"#059669":(p.horas_childcare||0)>800?"#d97706":"#dc2626", margin:0, fontWeight:600 }}>
                        {(p.horas_childcare||0)>1500?"Más de 1500 h":(p.horas_childcare||0)>800?"801-1500 h":(p.horas_childcare||0)>500?"501-800 h":"Menos de 500 h"}
                      </p>
                    </div>
                    <BarraProgreso pct={p.progreso_agencia||0}/>
                    <EstadoBadge estado={p.estado_agencia||"En progreso"}/>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => router.push(`/admin/perfiles/${p.id}`)}
                        style={{ width:32, height:32, borderRadius:9, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <EyeIcon size={14} style={{ color:"#a0435f" }}/>
                      </button>
                      <button onClick={() => router.push(`/admin/perfiles/${p.id}`)}
                        style={{ width:32, height:32, borderRadius:9, background:"#fce8ed", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <PencilIcon size={14} style={{ color:"#a0435f" }}/>
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Paginación */}
          <div style={{ padding:"14px 20px", borderTop:"1px solid #fce8ed", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>
              Mostrando {lista.length===0?0:Math.min((pagina-1)*POR_PAG+1,lista.length)} a {Math.min(pagina*POR_PAG,lista.length)} de {lista.length} perfiles
            </p>
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={()=>setPagina(p=>Math.max(1,p-1))}
                style={{ width:30, height:30, borderRadius:8, border:"1px solid #f0dde2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ChevronLeftIcon size={13} style={{ color:"#9a7080" }}/>
              </button>
              {Array.from({length:Math.min(totalPags,5)},(_,i)=>i+1).map(n=>(
                <button key={n} onClick={()=>setPagina(n)}
                  style={{ width:30, height:30, borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:n===pagina?"#a0435f":"#fff", color:n===pagina?"#fff":"#6b7280" }}>
                  {n}
                </button>
              ))}
              {totalPags>5 && <span style={{ display:"flex", alignItems:"center", fontSize:12, color:"#9a7080", padding:"0 4px" }}>...</span>}
              {totalPags>5 && (
                <button onClick={()=>setPagina(totalPags)}
                  style={{ width:30, height:30, borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:pagina===totalPags?"#a0435f":"#fff", color:pagina===totalPags?"#fff":"#6b7280" }}>
                  {totalPags}
                </button>
              )}
              <button onClick={()=>setPagina(p=>Math.min(totalPags,p+1))}
                style={{ width:30, height:30, borderRadius:8, border:"1px solid #f0dde2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ChevronRightIcon size={13} style={{ color:"#9a7080" }}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}