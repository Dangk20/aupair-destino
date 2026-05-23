"use client";
// app/dashboard/reuniones/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Calendar, ArrowRight, Video, ExternalLink,
  CheckCircle2, Clock, XCircle, CalendarPlus, Lock,
} from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";

function buildCalendarUrl(r) {
  const fecha = r.fecha_raw || r.fecha;
  const start = `${fecha?.replace(/-/g,"")}T${(r.hora_inicio||"09:00").replace(":","").padEnd(6,"00")}`;
  const end   = `${fecha?.replace(/-/g,"")}T${(r.hora_fin||"10:00").replace(":","").padEnd(6,"00")}`;
  const params = new URLSearchParams({ action:"TEMPLATE", text:r.titulo||"Reunión Destino Au Pair", dates:`${start}/${end}`, details:`${r.descripcion||""}\n\nMeet: ${r.meet_url||""}`, location:r.meet_url||"Google Meet" });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const ESTADO_CFG = {
  programada: { color:"#7c3aed", bg:"#ede9fe", label:"Programada", Icon:Clock        },
  completada: { color:"#10b981", bg:"#d1fae5", label:"Completada", Icon:CheckCircle2 },
  cancelada:  { color:"#ef4444", bg:"#fee2e2", label:"Cancelada",  Icon:XCircle      },
};

function DonutProgress({ pct=0 }) {
  const r=54, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e8f8" strokeWidth="12"/>
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#gr2)" strokeWidth="12"
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*.25} strokeLinecap="round"/>
      <defs><linearGradient id="gr2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
      </linearGradient></defs>
      <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22, fontWeight:700, fontFamily:"Georgia,serif" }}>{pct}%</text>
      <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11 }}>Completado</text>
    </svg>
  );
}

export default function ReunionesPage() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [reuniones, setReuniones] = useState([]);
  const [proceso,   setProceso]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [filtro,    setFiltro]    = useState("proximas");

  // ── Control de acceso ──────────────────────────────────────────────────────
  const [acceso, setAcceso] = useState(null);
  useEffect(() => {
    fetch("/api/dashboard/acceso")
      .then(r => r.json())
      .then(d => setAcceso(d.reuniones))
      .catch(() => setAcceso(false));
  }, []);

  useEffect(() => {
    const safe = (p, fb=null) => p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),             { user:null }),
      safe(fetch("/api/dashboard/reuniones"), { reuniones:[] }),
      safe(fetch("/api/dashboard/proceso"),   null),
    ]).then(([me, rData, proc]) => {
      setUser(me?.user||null);
      setReuniones(rData.reuniones||[]);
      setProceso(proc);
      setLoading(false);
    });
  }, []);

  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const proximas = reuniones.filter(r => new Date(r.fecha)>=hoy && r.estado!=="cancelada");
  const pasadas  = reuniones.filter(r => new Date(r.fecha)<hoy  || r.estado==="completada");
  const mostrar  = filtro==="proximas" ? proximas : pasadas;
  const fasesComp = proceso?.pasos?.filter(p=>["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id)&&p.status==="completado")?.length||0;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Verificación de acceso ─────────────────────────────────────────────────
  if (acceso === null) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (acceso === false) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:32, textAlign:"center" }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:"#fce8ed", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Lock size={28} style={{ color:"#a0435f" }}/>
      </div>
      <h2 style={{ fontFamily:"Georgia,serif", fontWeight:700, color:"#2d1a22", fontSize:20, margin:0 }}>Esta sección no está disponible aún</h2>
      <p style={{ color:"#9a6672", fontSize:14, maxWidth:300, margin:0, lineHeight:1.6 }}>Jenni está preparando tu acceso. Te avisaremos cuando esté lista.</p>
      <Link href="/dashboard" style={{ background:"#a0435f", color:"#fff", fontSize:13, fontWeight:600, padding:"12px 28px", borderRadius:14, textDecoration:"none" }}>Volver al inicio</Link>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ece8f0", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, position:"sticky", top:0, zIndex:20 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#1e1033", margin:0 }}>¡Hola, {user?.nombre}! 👋</h1>
          <p style={{ fontSize:13, color:"#9a7080", margin:"2px 0 0" }}>Gestiona tus reuniones con el equipo. 💜</p>
        </div>
        <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", gap:6, background:"#5b21b6", color:"#fff", fontSize:13, fontWeight:600, padding:"9px 16px", borderRadius:12, textDecoration:"none" }}>
          Ver mi proceso <ArrowRight size={13}/>
        </Link>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"20px 24px 40px", display:"flex", gap:20 }}>
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700, color:"#1e1033", margin:"0 0 6px" }}>Reuniones</h2>
            <p style={{ fontSize:13, color:"#9a7080", margin:0 }}>Aquí aparecerán todas las reuniones que el equipo de Destino Au Pair programe contigo.</p>
          </div>

          {/* Próxima destacada */}
          {proximas[0] && (
            <div style={{ background:"linear-gradient(135deg,#5b21b6,#7c3aed)", borderRadius:20, padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap", boxShadow:"0 8px 24px rgba(91,33,182,.25)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>📅</div>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.7)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 2px" }}>Próxima reunión</p>
                  <p style={{ fontSize:16, fontWeight:700, color:"#fff", margin:"0 0 2px" }}>{proximas[0].titulo}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,.8)", margin:0 }}>
                    {new Date(proximas[0].fecha).toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})} · {proximas[0].hora_inicio?.slice(0,5)} EST
                    {proximas[0].asesora && ` · con ${proximas[0].asesora}`}
                  </p>
                </div>
              </div>
              <div style={{ display:"flex", gap:10, flexShrink:0, flexWrap:"wrap" }}>
                {proximas[0].meet_url && (
                  <a href={proximas[0].meet_url} target="_blank" rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", color:"#5b21b6", fontSize:12, fontWeight:700, padding:"9px 16px", borderRadius:12, textDecoration:"none" }}>
                    <Video size={14}/> Unirse al Meet
                  </a>
                )}
                <a href={buildCalendarUrl({ ...proximas[0], fecha_raw:proximas[0].fecha })} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.15)", color:"#fff", fontSize:12, fontWeight:600, padding:"9px 16px", borderRadius:12, textDecoration:"none", border:"1px solid rgba(255,255,255,.3)" }}>
                  <CalendarPlus size={14}/> Agregar a Calendar
                </a>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div style={{ display:"flex", gap:8 }}>
            {[{id:"proximas",label:"Próximas",n:proximas.length},{id:"pasadas",label:"Pasadas",n:pasadas.length}].map(f=>(
              <button key={f.id} onClick={()=>setFiltro(f.id)}
                style={{ padding:"7px 16px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit", transition:"all .12s",
                  background:filtro===f.id?"#5b21b6":"#fff", color:filtro===f.id?"#fff":"#6b7280",
                  boxShadow:filtro===f.id?"0 2px 8px rgba(91,33,182,.3)":"0 1px 3px rgba(0,0,0,.07)",
                }}>
                {f.label} ({f.n})
              </button>
            ))}
          </div>

          {/* Lista */}
          {mostrar.length===0 ? (
            <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:"48px 24px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
              <p style={{ fontSize:15, fontWeight:600, color:"#1e1033", margin:"0 0 6px" }}>{filtro==="proximas"?"Sin reuniones próximas":"Sin reuniones pasadas"}</p>
              <p style={{ fontSize:13, color:"#9a7080", margin:0 }}>{filtro==="proximas"?"El equipo te asignará una reunión pronto. 💜":"Aquí aparecerán tus reuniones anteriores."}</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {mostrar.map(r => {
                const cfg = ESTADO_CFG[r.estado]||ESTADO_CFG.programada;
                const EstadoIcon = cfg.Icon;
                return (
                  <div key={r.id} style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:"18px 22px", display:"flex", alignItems:"center", gap:16, boxShadow:"0 1px 4px rgba(0,0,0,.04)", flexWrap:"wrap" }}>
                    <div style={{ textAlign:"center", background:"#f5f0ff", borderRadius:14, padding:"10px 14px", flexShrink:0 }}>
                      <p style={{ fontSize:22, fontWeight:800, color:"#5b21b6", margin:0, fontFamily:"Georgia,serif", lineHeight:1 }}>{new Date(r.fecha).getDate()}</p>
                      <p style={{ fontSize:11, fontWeight:600, color:"#7c3aed", margin:0, textTransform:"uppercase" }}>{new Date(r.fecha).toLocaleDateString("es-CO",{month:"short"})}</p>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <p style={{ fontSize:15, fontWeight:700, color:"#1e1033", margin:0 }}>{r.titulo}</p>
                        <span style={{ fontSize:10, fontWeight:700, background:cfg.bg, color:cfg.color, padding:"3px 9px", borderRadius:99, display:"flex", alignItems:"center", gap:4 }}>
                          <EstadoIcon size={10}/> {cfg.label}
                        </span>
                      </div>
                      <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                        <span style={{ fontSize:12, color:"#9a7080" }}>🕐 {r.hora_inicio?.slice(0,5)}{r.hora_fin?` - ${r.hora_fin.slice(0,5)}`:""} EST</span>
                        {r.asesora && <span style={{ fontSize:12, color:"#9a7080" }}>👩‍💼 {r.asesora}</span>}
                        {r.meet_url && <span style={{ fontSize:12, color:"#7c3aed", display:"flex", alignItems:"center", gap:4 }}><Video size={12}/> Google Meet</span>}
                      </div>
                      {r.descripcion && <p style={{ fontSize:12, color:"#9a7080", margin:"6px 0 0" }}>{r.descripcion}</p>}
                    </div>
                    {r.estado==="programada" && (
                      <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                        {r.meet_url && (
                          <a href={r.meet_url} target="_blank" rel="noopener noreferrer"
                            style={{ display:"flex", alignItems:"center", gap:6, background:"#5b21b6", color:"#fff", fontSize:12, fontWeight:600, padding:"8px 14px", borderRadius:11, textDecoration:"none" }}>
                            <Video size={13}/> Unirse
                          </a>
                        )}
                        <a href={buildCalendarUrl({...r,fecha_raw:r.fecha})} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:6, border:"1.5px solid #ede9fe", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"8px 14px", borderRadius:11, textDecoration:"none", background:"#fff" }}>
                          <CalendarPlus size={13}/> Calendar
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:20, textAlign:"center" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:"0 0 16px", textAlign:"left" }}>Tu progreso</h3>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><DonutProgress pct={Math.round(fasesComp/5*100)}/></div>
            <p style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 2px" }}>{fasesComp} de 5 fases</p>
            <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 14px" }}>Sigue así 💜</p>
            <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"1.5px solid #ede9fe", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
              🗺️ Ver mi proceso
            </Link>
          </div>
          {proceso?.proximoPaso && (
            <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18 }}>
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
          <HelpCard onContact={()=>router.push("/dashboard/mensajes")}/>
        </aside>
      </div>
    </div>
  );
}