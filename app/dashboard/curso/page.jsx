"use client";
// app/dashboard/curso/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlayCircle, Lock, CheckCircle2, BookOpen, UserCheck,
  Building2, Heart, FileCheck, Plane, Clock, MessageCircle,
  Award, ArrowRight, Bell, Calendar, Headphones,
} from "lucide-react";
import { StepCircle, PASO_META, PASOS_DEFAULT } from "@/components/dashboard/DashboardWidgets";
import { useMobile } from "@/context/MobileContext";

function DonutProgress({ porcentaje=0 }) {
  const r=54, circ=2*Math.PI*r, dash=(porcentaje/100)*circ;
  return (
    <svg width="120" height="120" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e8f8" strokeWidth="12"/>
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#gc2)" strokeWidth="12"
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*.25} strokeLinecap="round"
        style={{ transition:"stroke-dasharray .8s" }}/>
      <defs><linearGradient id="gc2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
      </linearGradient></defs>
      <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22,fontWeight:700,fontFamily:"Georgia,serif" }}>{porcentaje}%</text>
      <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11,fontFamily:"system-ui" }}>Completado</text>
    </svg>
  );
}

export default function CursoPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,    setUser]    = useState(null);
  const [sesData, setSesData] = useState(null);
  const [proceso, setProceso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p,fb=null) => p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),            {user:null}),
      safe(fetch("/api/dashboard/sesiones"), null),
      safe(fetch("/api/dashboard/proceso"),  null),
    ]).then(([me,ses,proc]) => {
      setUser(me?.user||null); setSesData(ses); setProceso(proc); setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  const { completadas=0, total=0, sesiones=[] } = sesData||{};
  const pasos          = proceso?.pasos?.length>0 ? proceso.pasos : PASOS_DEFAULT;
  const porcentajeProg = proceso?.porcentaje_curso||sesData?.porcentaje||0;
  const sesionActual   = sesiones.find(s=>s.estado==="available");
  const primeraSesion  = sesiones[0];
  const ultimaCompletada = [...sesiones].reverse().find(s=>s.estado==="completed");
  const idxSiguiente   = ultimaCompletada ? sesiones.findIndex(s=>s.id===ultimaCompletada.id)+1 : 0;
  const siguienteSesion = sesiones[idxSiguiente]||null;
  const cursoCompleto  = total>0&&completadas>=total;
  const mostrarNotif   = completadas===0&&sesiones.length>0;

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #e8849a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const P = isMobile ? "14px 16px" : "14px 28px";

  return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .ses-row:hover{background:#faf5ff!important;}`}</style>

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #ece8f0",padding:P,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,position:"sticky",top:0,zIndex:20 }}>
        <div style={{ minWidth:0 }}>
          <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?18:22,fontWeight:700,color:"#1e1033",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            ¡Hola, {user?.nombre}! 👋
          </h1>
          {!isMobile && <p style={{ fontSize:13,color:"#9a7080",margin:"2px 0 0" }}>{sesionActual?`Continúa con ${sesionActual.titulo}`:cursoCompleto?"¡Completaste el programa! 🎉":"Comienza tu primera sesión"} 💜</p>}
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

        {/* MAIN */}
        <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:16 }}>

          {/* ROADMAP */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":"20px 24px",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <h2 style={{ fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 14px" }}>Mi Destino Au Pair</h2>
            <div style={{ display:"flex",alignItems:"flex-start",overflowX:"auto",paddingBottom:4 }}>
              {pasos.map((p,i)=><StepCircle key={p.id} paso={p} index={i} isLast={i===pasos.length-1}/>)}
            </div>
          </div>

          {/* NOTIFICATION */}
          {mostrarNotif && primeraSesion && (
            <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:10,flex:1,minWidth:0 }}>
                <Clock size={15} style={{ color:"#d97706",flexShrink:0,marginTop:2 }}/>
                <div>
                  <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:"0 0 2px" }}>Completa la sesión de bienvenida para desbloquear el curso.</p>
                  <p style={{ fontSize:12,color:"#9a7080",margin:0 }}>Es 100% gratuita.</p>
                </div>
              </div>
              <Link href={`/dashboard/sesion/${primeraSesion.id}`} style={{ fontSize:12,fontWeight:600,color:"#a0435f",textDecoration:"none",border:"1px solid #f0dde2",padding:"6px 14px",borderRadius:10,background:"#fff",whiteSpace:"nowrap",flexShrink:0 }}>
                Ver detalles
              </Link>
            </div>
          )}

          {/* PAYWALL */}
          {!user?.tiene_acceso && completadas>=1 && (
            <div style={{ background:"linear-gradient(135deg,#a0435f,#c9607a)",borderRadius:20,padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,boxShadow:"0 8px 24px rgba(160,67,95,.25)",flexWrap:"wrap" }}>
              <div>
                <p style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,.8)",textTransform:"uppercase",letterSpacing:".8px",margin:"0 0 4px" }}>✨ Desbloquea el programa completo</p>
                <p style={{ fontSize:14,fontWeight:600,color:"#fff",margin:0 }}>Accede a las <strong>{total-1} sesiones restantes</strong> por <span style={{ color:"#fce8ed",fontWeight:700 }}>$35 USD</span></p>
                <p style={{ fontSize:12,color:"rgba(255,255,255,.65)",margin:"4px 0 0" }}>Pago único · Certificado incluido</p>
              </div>
              <Link href="/pago" style={{ flexShrink:0,background:"#fff",color:"#a0435f",fontSize:13,fontWeight:700,padding:"11px 22px",borderRadius:14,textDecoration:"none",whiteSpace:"nowrap" }}>
                Pagar ahora →
              </Link>
            </div>
          )}

          {/* SESSION LIST */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",boxShadow:"0 1px 4px rgba(0,0,0,.04)",overflow:"hidden" }}>
            <div style={{ padding:isMobile?"12px 16px":"16px 24px",borderBottom:"1px solid #f5eef8" }}>
              <h2 style={{ fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#1e1033",margin:0 }}>Sesiones del curso</h2>
            </div>
            <div>
              {sesiones.length===0 ? (
                <div style={{ padding:"40px 24px",textAlign:"center" }}>
                  <div style={{ fontSize:40,marginBottom:10 }}>📚</div>
                  <p style={{ fontSize:14,color:"#9a7080",margin:0 }}>Las sesiones aparecerán aquí pronto.</p>
                </div>
              ) : sesiones.map((s,i) => {
                const available=s.estado==="available", completed=s.estado==="completed", locked=s.estado==="locked";
                const isGratis=s.es_gratis===1||s.es_gratis===true;
                return (
                  <div key={s.id} className="ses-row"
                    style={{ display:"flex",alignItems:"center",gap:isMobile?10:16,padding:isMobile?"12px 16px":"15px 24px",borderBottom:i<sesiones.length-1?"1px solid #f8f4fc":"none",cursor:locked?"default":"pointer",background:available?"#faf5ff":"#fff",transition:"background .12s" }}
                    onClick={()=>!locked&&router.push(`/dashboard/sesion/${s.id}`)}>
                    <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,background:completed?"#d1fae5":available?"#a0435f":"#f3f4f6",color:completed?"#10b981":available?"#fff":"#9ca3af" }}>
                      {completed?<CheckCircle2 size={16} style={{ color:"#10b981" }}/>:i+1}
                    </div>
                    {!isMobile && (
                      <div style={{ width:30,height:30,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:completed?"#d1fae5":available?"#fce8ed":"#f3f4f6" }}>
                        {completed?<CheckCircle2 size={14} style={{ color:"#10b981" }}/>:available?<PlayCircle size={14} style={{ color:"#a0435f" }}/>:<Lock size={12} style={{ color:"#d1d5db" }}/>}
                      </div>
                    )}
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap" }}>
                        {isGratis && <span style={{ fontSize:9,fontWeight:700,background:"#fce8ed",color:"#a0435f",padding:"2px 7px",borderRadius:99,textTransform:"uppercase",letterSpacing:".5px",flexShrink:0 }}>GRATIS</span>}
                        <p style={{ fontSize:isMobile?13:14,fontWeight:600,color:locked?"#9ca3af":"#1e1033",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.titulo}</p>
                      </div>
                      {s.descripcion&&!isMobile && <p style={{ fontSize:12,color:locked?"#c0c0c0":"#9a7080",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.descripcion}</p>}
                    </div>
                    {s.duracion&&!isMobile && <span style={{ fontSize:11,color:"#b0909a",whiteSpace:"nowrap",flexShrink:0 }}>{s.duracion}</span>}
                    {locked ? (
                      <div style={{ fontSize:11,color:"#9ca3af",background:"#f3f4f6",border:"1px solid #e5e7eb",padding:isMobile?"6px 10px":"8px 16px",borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",gap:4 }}>
                        <Lock size={10}/>{!isMobile&&" Bloqueado"}
                      </div>
                    ) : completed ? (
                      <div style={{ fontSize:11,fontWeight:600,color:"#10b981",background:"#d1fae5",padding:isMobile?"6px 10px":"8px 16px",borderRadius:10,flexShrink:0 }}>✓</div>
                    ) : (
                      <button onClick={e=>{e.stopPropagation();router.push(`/dashboard/sesion/${s.id}`);}}
                        style={{ fontSize:isMobile?11:13,fontWeight:600,color:"#fff",background:"#a0435f",border:"none",padding:isMobile?"7px 12px":"9px 18px",borderRadius:10,cursor:"pointer",flexShrink:0,boxShadow:"0 2px 8px rgba(160,67,95,.25)" }}>
                        {i===0&&completadas===0?"Comenzar":"Continuar"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:isMobile?"100%":260,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>

          {/* Progreso donut */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":20,boxShadow:"0 1px 4px rgba(0,0,0,.04)",textAlign:"center" }}>
            <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:"0 0 14px",textAlign:"left" }}>Tu progreso en el curso</h3>
            {isMobile ? (
              /* Mobile: barra horizontal en vez de donut */
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:"#1e1033" }}>{completadas} de {total} sesiones</span>
                  <span style={{ fontSize:13,fontWeight:700,color:"#a0435f" }}>{porcentajeProg}%</span>
                </div>
                <div style={{ height:10,background:"#f0e8f0",borderRadius:99,overflow:"hidden",marginBottom:12 }}>
                  <div style={{ height:"100%",width:`${porcentajeProg}%`,background:"linear-gradient(90deg,#7c3aed,#a0435f)",borderRadius:99,transition:"width .7s" }}/>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex",justifyContent:"center",marginBottom:14 }}>
                <DonutProgress porcentaje={porcentajeProg}/>
              </div>
            )}
            {!isMobile && <p style={{ fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:"#1e1033",margin:"0 0 2px" }}>{completadas} de {total}</p>}
            {!isMobile && <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px" }}>Sesiones completadas</p>}
            {cursoCompleto
              ? <Link href="/dashboard/certificado" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,border:"1.5px solid #ede9fe",color:"#7c3aed",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}><Award size={14}/> Ver mi certificado</Link>
              : <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,border:"1.5px solid #e5e7eb",color:"#b0b0b0",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,background:"#f9f9f9",cursor:"not-allowed" }}><Lock size={12} style={{ color:"#c0c0c0" }}/> Ver mi certificado <span style={{ fontSize:10,color:"#c0c0c0" }}>({completadas}/{total})</span></div>}
          </div>

          {/* Próximo paso */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":18,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <div style={{ width:26,height:26,borderRadius:8,background:"#f5f0ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>🎯</div>
              <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:0 }}>Próximo paso</h3>
            </div>
            {cursoCompleto ? (
              <>
                <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:"0 0 10px" }}>¡Completaste todas las sesiones! 🎉</p>
                <Link href="/dashboard/certificado" style={{ display:"block",textAlign:"center",background:"#10b981",color:"#fff",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>Ver mi certificado</Link>
              </>
            ) : siguienteSesion ? (
              <>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <div style={{ width:34,height:34,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:siguienteSesion.estado==="locked"?"#f3f4f6":"#fce8ed",color:siguienteSesion.estado==="locked"?"#9ca3af":"#a0435f" }}>
                    {sesiones.findIndex(s=>s.id===siguienteSesion.id)+1}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:12,fontWeight:700,color:"#1e1033",margin:0,lineHeight:1.3 }}>{siguienteSesion.titulo}</p>
                    {siguienteSesion.descripcion && <p style={{ fontSize:11,color:"#9a7080",margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{siguienteSesion.descripcion}</p>}
                  </div>
                </div>
                {siguienteSesion.estado==="locked" && <div style={{ background:"#fef3c7",borderRadius:10,padding:"7px 12px",marginBottom:10,fontSize:11,color:"#d97706" }}>🔒 Esta sesión requiere desbloquear el programa</div>}
                <Link href={siguienteSesion.estado==="locked"?"/pago":`/dashboard/sesion/${siguienteSesion.id}`}
                  style={{ display:"block",textAlign:"center",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none",background:siguienteSesion.estado==="locked"?"#a0435f":"#5b21b6",color:"#fff" }}>
                  {siguienteSesion.estado==="locked"?"🔓 Desbloquear sesión":"▶ Comenzar sesión"}
                </Link>
              </>
            ) : (
              <p style={{ fontSize:13,color:"#9a7080",margin:0 }}>Las sesiones aparecerán pronto.</p>
            )}
          </div>

          {/* Help */}
          <div style={{ borderRadius:20,overflow:"hidden",boxShadow:"0 4px 16px rgba(160,67,95,.18)" }}>
            <div style={{ background:"linear-gradient(135deg,#a0435f,#c9607a,#e8849a)",padding:"18px 18px 0",position:"relative" }}>
              <div style={{ position:"absolute",top:-14,right:-14,width:72,height:72,borderRadius:"50%",background:"rgba(255,255,255,.1)" }}/>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8,position:"relative",zIndex:1 }}>
                <div style={{ width:34,height:34,borderRadius:12,background:"rgba(255,255,255,.2)",border:"1.5px solid rgba(255,255,255,.35)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Headphones size={16} style={{ color:"#fff" }}/>
                </div>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:"#fff",margin:0 }}>¿Necesitas ayuda?</p>
                  <p style={{ fontSize:11,color:"rgba(255,255,255,.75)",margin:0 }}>Estamos aquí para ti 💕</p>
                </div>
              </div>
              <div style={{ textAlign:"right",fontSize:36,lineHeight:1,marginBottom:-8,position:"relative",zIndex:1,opacity:.9 }}>🎈</div>
            </div>
            <div style={{ background:"#fff",padding:"14px 18px 16px" }}>
              <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 10px",lineHeight:1.5 }}>Escríbenos y te respondemos lo antes posible.</p>
              <button onClick={()=>router.push("/dashboard/mensajes")}
                style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,width:"100%",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#a0435f,#c9607a)",color:"#fff",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,boxShadow:"0 3px 10px rgba(160,67,95,.3)",fontFamily:"inherit" }}>
                <MessageCircle size={13}/> Escribir a soporte
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}