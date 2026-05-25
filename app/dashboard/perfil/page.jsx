"use client";
// app/dashboard/perfil/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Calendar, ArrowRight, Lock, PlayCircle,
  ChevronRight, CheckCircle2, Clock,
} from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";
import { useMobile } from "@/context/MobileContext";

const SECCIONES = [
  { id:"personal",    campos:["cedula","telefono","fecha_nacimiento","ciudad","pais"] },
  { id:"habilidades", campos:["conoce_requisitos_26","conoce_requisitos_18_20","curso_primeros_auxilios","nivel_ingles","licencia_conduccion","habilidad_conduccion"] },
  { id:"situacion",   campos:["situacion_actual"] },
  { id:"salud",       campos:["enfermedad_medicamentos","enfermedad_grave","depresion_panico","trastorno_alimenticio","autolesiones","abuso_sustancias","detalle_salud_mental","isotretinoina","condiciones_fisicas","alergia_medicamentos","dosis_covid","vacuna_covid"] },
  { id:"experiencia", campos:["exp_ninos_externos","horas_exp_ninos"] },
  { id:"visas",       campos:["visa_negada","visa_cancelada","familiar_residencia_usa","familiar_visa_estudio_usa","overstay_otro_pais","entiende_intercambio_cultural","consciente_riesgo_familiar","participo_programa_ap"] },
];

const SECCIONES_AGENCIA = [
  { campos:["estatura","peso","nacionalidad","tiene_pasaporte"] },
  { campos:["exp_ninos_externos","horas_exp_ninos","horas_childcare"] },
  { campos:["situacion_actual","carrera_graduada"] },
  { campos:["licencia_conduccion","tipo_licencia"] },
  { campos:["bio","hobbies"] },
  { campos:["por_que_au_pair"] },
  { campos:["enfermedad_medicamentos","dieta_especial"] },
  { campos:["referencia_1_nombre","referencia_1_email"] },
  { campos:["foto_url"] },
  { campos:["estado_agencia"] },
];

function seccionesCompletas(p) {
  if (!p) return 0;
  return SECCIONES.filter(s => s.campos.every(c => p[c] && String(p[c]).trim() !== "")).length;
}
function progresoAgencia(p) {
  if (!p) return 0;
  const comp = SECCIONES_AGENCIA.filter(s =>
    s.campos.filter(c => p[c] && String(p[c]).trim() !== "" && p[c] !== "0").length >= Math.ceil(s.campos.length/2)
  ).length;
  return Math.round((comp/SECCIONES_AGENCIA.length)*100);
}

const PASOS_PERFIL = [
  { num:1, label:"Evaluación\nde perfil",  color:"#ec4899", bg:"#fce7f3" },
  { num:2, label:"Perfil con\nla agencia", color:"#7c3aed", bg:"#ede9fe" },
  { num:3, label:"Match",                  color:"#9ca3af", bg:"#f3f4f6" },
  { num:4, label:"Visa",                   color:"#9ca3af", bg:"#f3f4f6" },
  { num:5, label:"Viaje",                  color:"#9ca3af", bg:"#f3f4f6" },
];

function MiniRoadmap({ pasos }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", width:"100%", overflowX:"auto" }}>
      {pasos.map((p,i) => {
        const isLast=i===pasos.length-1, locked=p.status==="bloqueado", done=p.status==="completado", active=p.status==="en_progreso", pending=p.status==="pendiente";
        return (
          <div key={p.num} style={{ display:"flex", alignItems:"flex-start", flex:isLast?"0 0 auto":"1 1 0", minWidth:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, width:72 }}>
              <div style={{ width:46, height:46, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:locked?"#f3f4f6":p.bg, border:locked?"2px solid #e5e7eb":`2px solid ${p.color}`, boxShadow:active?`0 0 0 3px ${p.bg}`:"none" }}>
                {locked?<Lock size={14} style={{ color:"#d1d5db" }}/>:done?<CheckCircle2 size={20} style={{ color:p.color }}/>:<span style={{ fontSize:16,fontWeight:800,color:p.color,fontFamily:"Georgia,serif" }}>{p.num}</span>}
              </div>
              <p style={{ fontSize:10, fontWeight:600, color:"#1e1033", textAlign:"center", lineHeight:1.3, margin:0, whiteSpace:"pre-line", maxWidth:70 }}>{p.label}</p>
              <p style={{ fontSize:9, fontWeight:600, margin:0, color:active?"#ec4899":pending?"#7c3aed":"#9ca3af" }}>
                {active?"En progreso":pending?"Pendiente":locked?"Bloqueado":"Completado"}
              </p>
            </div>
            {!isLast && <div style={{ flex:1, borderTop:"2px dashed", borderColor:done?p.color:"#e5e7eb", marginTop:23 }}/>}
          </div>
        );
      })}
    </div>
  );
}

function DonutProgress({ pct=0 }) {
  const r=54, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <svg width="120" height="120" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e8f8" strokeWidth="12"/>
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#gpp)" strokeWidth="12"
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*.25} strokeLinecap="round" style={{ transition:"stroke-dasharray .8s" }}/>
      <defs><linearGradient id="gpp" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
      </linearGradient></defs>
      <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22,fontWeight:700,fontFamily:"Georgia,serif" }}>{pct}%</text>
      <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11,fontFamily:"system-ui" }}>Completado</text>
    </svg>
  );
}

export default function PerfilOverviewPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,    setUser]    = useState(null);
  const [perfil,  setPerfil]  = useState(null);
  const [proceso, setProceso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p,fb=null) => p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),           {user:null}),
      safe(fetch("/api/dashboard/perfil"),  null),
      safe(fetch("/api/dashboard/proceso"), null),
    ]).then(([me,perf,proc]) => {
      if (me?.user&&!me.user.perfil_habilitado) { router.push("/dashboard"); return; }
      setUser(me?.user||null); setPerfil(perf?.perfil||null); setProceso(proc); setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #e8849a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const secCompletas   = seccionesCompletas(perfil);
  const totalSecciones = SECCIONES.length;
  const pctEval        = Math.round((secCompletas/totalSecciones)*100);
  const evalCompleta   = secCompletas===totalSecciones;
  const pctAgencia     = progresoAgencia(perfil);
  const agenciaIniciada = pctAgencia>0;
  const fasesCompletadas = proceso?.pasos?.filter(p=>["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id)&&p.status==="completado")?.length||0;
  const pctProceso = Math.round((fasesCompletadas/5)*100);

  const pasosConEstado = PASOS_PERFIL.map((p,i) => {
    const ids=["evaluacion_perfil","perfil_agencia","match","visa","viaje"];
    const procPaso=proceso?.pasos?.find(pp=>pp.id===ids[i]);
    let status=procPaso?.status||"bloqueado";
    if (i===0) status=evalCompleta?"completado":"en_progreso";
    if (i===1) {
      if (procPaso?.status==="completado") status="completado";
      else if (evalCompleta) status=agenciaIniciada?"en_progreso":"pendiente";
      else status="bloqueado";
    }
    return { ...p, status };
  });

  const FASES = [
    { num:1, id:"evaluacion_perfil", titulo:"Evaluación de perfil", desc:"Responde todas las secciones para crear un perfil auténtico.", status:evalCompleta?"completado":"en_progreso", secCompletas, totalSecciones, boton:evalCompleta?"Ver evaluación":secCompletas>0?"Continuar evaluación":"Comenzar evaluación", link:"/dashboard/perfil/evaluacion" },
    { num:2, id:"perfil_agencia", titulo:"Perfil con la agencia", desc:evalCompleta?"Completa tu perfil para presentarte a las familias.":"Completa tu evaluación primero.", status:evalCompleta?(proceso?.pasos?.find(p=>p.id==="perfil_agencia")?.status==="completado"?"completado":agenciaIniciada?"en_progreso":"pendiente"):"bloqueado", bloqueadoMsg:"Se desbloquea al completar la evaluación", link:"/dashboard/perfil/agencia", boton:agenciaIniciada?"Continuar mi perfil":"Comenzar mi perfil", pctAgencia },
    { num:3, id:"match", titulo:"Match con la familia", desc:"Se desbloquea cuando tu perfil esté completo.", status:proceso?.pasos?.find(p=>p.id==="match")?.status||"bloqueado" },
    { num:4, id:"visa", titulo:"Visa", desc:"Se desbloquea en la fase anterior.", status:proceso?.pasos?.find(p=>p.id==="visa")?.status||"bloqueado" },
    { num:5, id:"viaje", titulo:"Viaje", desc:"Se desbloquea en la fase anterior.", status:proceso?.pasos?.find(p=>p.id==="viaje")?.status||"bloqueado" },
  ];

  const siguienteFase = FASES.find(f=>f.status!=="completado");

  return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .fase-row:hover{background:#faf5ff!important;}`}</style>

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #ece8f0",padding:isMobile?"12px 16px":"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,position:"sticky",top:0,zIndex:20 }}>
        <div style={{ minWidth:0 }}>
          <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?18:22,fontWeight:700,color:"#1e1033",margin:0 }}>¡Hola, {user?.nombre}! 👋</h1>
          {!isMobile && <p style={{ fontSize:13,color:"#9a7080",margin:"2px 0 0" }}>Continúa con tu proceso 💜</p>}
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

          {/* ROADMAP */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":"20px 28px",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <h2 style={{ fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 14px" }}>Mi perfil</h2>
            <MiniRoadmap pasos={pasosConEstado}/>
          </div>

          {/* NOTIFICACIONES */}
          {!evalCompleta && (
            <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:10,flex:1,minWidth:0 }}>
                <Clock size={15} style={{ color:"#d97706",flexShrink:0,marginTop:2 }}/>
                <div>
                  <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:"0 0 2px" }}>Completa tu evaluación para desbloquear el perfil con la agencia.</p>
                  <p style={{ fontSize:12,color:"#9a7080",margin:0 }}>{secCompletas} de {totalSecciones} secciones completadas</p>
                </div>
              </div>
              <Link href="/dashboard/perfil/evaluacion" style={{ fontSize:12,fontWeight:600,color:"#a0435f",textDecoration:"none",border:"1px solid #f0dde2",padding:"6px 14px",borderRadius:10,background:"#fff",whiteSpace:"nowrap",flexShrink:0 }}>
                {secCompletas>0?"Continuar":"Comenzar"}
              </Link>
            </div>
          )}
          {evalCompleta && !agenciaIniciada && (
            <div style={{ background:"linear-gradient(135deg,#ede9fe,#fce7f3)",border:"1px solid #c4b5fd",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:10,flex:1 }}>
                <span style={{ fontSize:20,flexShrink:0 }}>🎉</span>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:"0 0 2px" }}>¡Evaluación completa! Perfil con la agencia desbloqueado.</p>
                  <p style={{ fontSize:12,color:"#7c3aed",margin:0,fontWeight:600 }}>Comienza tu perfil profesional 💜</p>
                </div>
              </div>
              <Link href="/dashboard/perfil/agencia" style={{ fontSize:12,fontWeight:700,color:"#fff",textDecoration:"none",padding:"9px 18px",borderRadius:12,background:"linear-gradient(135deg,#7c3aed,#a0435f)",whiteSpace:"nowrap",flexShrink:0 }}>
                Comenzar →
              </Link>
            </div>
          )}
          {evalCompleta && agenciaIniciada && pctAgencia<100 && (
            <div style={{ background:"#ede9fe",border:"1px solid #c4b5fd",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0 }}>
                <span style={{ fontSize:16,flexShrink:0 }}>📝</span>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:"0 0 4px" }}>Perfil con la agencia — {pctAgencia}% listo</p>
                  <div style={{ height:5,background:"rgba(255,255,255,.5)",borderRadius:99,overflow:"hidden",maxWidth:180 }}>
                    <div style={{ height:"100%",width:`${pctAgencia}%`,background:"#7c3aed",borderRadius:99 }}/>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/perfil/agencia" style={{ fontSize:12,fontWeight:600,color:"#7c3aed",textDecoration:"none",border:"1px solid #c4b5fd",padding:"7px 14px",borderRadius:10,background:"#fff",whiteSpace:"nowrap",flexShrink:0 }}>
                Continuar →
              </Link>
            </div>
          )}

          {/* FASES */}
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",boxShadow:"0 1px 4px rgba(0,0,0,.04)",overflow:"hidden" }}>
            <div style={{ padding:isMobile?"12px 16px":"16px 24px",borderBottom:"1px solid #f5eef8" }}>
              <h2 style={{ fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#1e1033",margin:0 }}>Etapas del proceso</h2>
            </div>
            {FASES.map((f,i) => {
              const locked=f.status==="bloqueado", done=f.status==="completado", active=f.status==="en_progreso", pending=f.status==="pendiente";
              const isLast=i===FASES.length-1;
              return (
                <div key={f.id} className="fase-row"
                  style={{ padding:isMobile?"14px 16px":"16px 24px",borderBottom:isLast?"none":"1px solid #f8f4fc",background:"#fff",transition:"background .12s",cursor:locked?"default":"pointer" }}
                  onClick={()=>!locked&&f.link&&router.push(f.link)}>

                  {/* Fila principal */}
                  <div style={{ display:"flex",alignItems:"center",gap:isMobile?10:14,marginBottom:isMobile&&(i===0||i===1)&&!locked&&!done?10:0 }}>
                    {/* Número */}
                    <div style={{ width:36,height:36,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,fontFamily:"Georgia,serif",background:done?"#d1fae5":active?"#fce7f3":pending?"#ede9fe":"#f3f4f6",color:done?"#10b981":active?"#ec4899":pending?"#7c3aed":"#9ca3af",border:active?"2px solid #ec4899":pending?"2px solid #7c3aed":"2px solid transparent" }}>
                      {done?<CheckCircle2 size={18} style={{ color:"#10b981" }}/>:f.num}
                    </div>

                    {/* Icono — solo desktop */}
                    {!isMobile && (
                      <div style={{ width:32,height:32,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:done?"#d1fae5":active?"#fce7f3":pending?"#ede9fe":"#f3f4f6" }}>
                        {done?<CheckCircle2 size={15} style={{ color:"#10b981" }}/>:active?<PlayCircle size={15} style={{ color:"#ec4899" }}/>:pending?<PlayCircle size={15} style={{ color:"#7c3aed" }}/>:<Lock size={13} style={{ color:"#d1d5db" }}/>}
                      </div>
                    )}

                    {/* Badge — solo desktop */}
                    {!isMobile && (
                      <div style={{ width:88,flexShrink:0 }}>
                        <span style={{ fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:99,whiteSpace:"nowrap",background:done?"#d1fae5":active?"#fce7f3":pending?"#ede9fe":"#f3f4f6",color:done?"#10b981":active?"#ec4899":pending?"#7c3aed":"#9ca3af" }}>
                          {done?"Completado":active?"En progreso":pending?"Disponible":"Bloqueado"}
                        </span>
                      </div>
                    )}

                    {/* Contenido */}
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                        <p style={{ fontSize:isMobile?13:14,fontWeight:600,color:locked?"#9ca3af":"#1e1033",margin:0 }}>{f.num}. {f.titulo}</p>
                        {isMobile && (
                          <span style={{ fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:done?"#d1fae5":active?"#fce7f3":pending?"#ede9fe":"#f3f4f6",color:done?"#10b981":active?"#ec4899":pending?"#7c3aed":"#9ca3af",flexShrink:0 }}>
                            {done?"✓ Completado":active?"En progreso":pending?"Disponible":"Bloqueado"}
                          </span>
                        )}
                      </div>
                      {(!isMobile||locked) && <p style={{ fontSize:12,color:locked?"#c0c0c0":"#9a7080",margin:"2px 0 0",lineHeight:1.4 }}>{f.desc}</p>}
                    </div>

                    {/* CTA desktop o fases 3-5 */}
                    {!isMobile && i===0 && !done && (
                      <div style={{ flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,minWidth:180 }}>
                        <span style={{ fontSize:11,color:"#9a7080" }}>{secCompletas} de {totalSecciones} secciones</span>
                        <div style={{ width:160,height:5,background:"#f0e8f0",borderRadius:99,overflow:"hidden" }}>
                          <div style={{ height:"100%",width:`${pctEval}%`,background:"linear-gradient(90deg,#ec4899,#f472b6)",borderRadius:99 }}/>
                        </div>
                        <button onClick={e=>{e.stopPropagation();router.push("/dashboard/perfil/evaluacion");}} style={{ fontSize:12,fontWeight:600,color:"#fff",background:"linear-gradient(135deg,#ec4899,#be185d)",border:"none",padding:"8px 16px",borderRadius:10,cursor:"pointer" }}>{f.boton}</button>
                      </div>
                    )}
                    {!isMobile && i===0 && done && (
                      <button onClick={e=>{e.stopPropagation();router.push("/dashboard/perfil/evaluacion");}} style={{ fontSize:12,fontWeight:600,color:"#10b981",background:"#d1fae5",border:"none",padding:"8px 14px",borderRadius:10,cursor:"pointer",flexShrink:0 }}>Ver evaluación</button>
                    )}
                    {!isMobile && i===1 && (pending||active) && (
                      <div style={{ flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,minWidth:180 }}>
                        {agenciaIniciada && (
                          <>
                            <span style={{ fontSize:11,color:"#9a7080" }}>{pctAgencia}% completado</span>
                            <div style={{ width:160,height:5,background:"#ede9fe",borderRadius:99,overflow:"hidden" }}>
                              <div style={{ height:"100%",width:`${pctAgencia}%`,background:"linear-gradient(90deg,#7c3aed,#a0435f)",borderRadius:99 }}/>
                            </div>
                          </>
                        )}
                        <button onClick={e=>{e.stopPropagation();router.push("/dashboard/perfil/agencia");}} style={{ fontSize:12,fontWeight:600,color:"#fff",background:"linear-gradient(135deg,#7c3aed,#a0435f)",border:"none",padding:"8px 16px",borderRadius:10,cursor:"pointer" }}>{f.boton}</button>
                      </div>
                    )}
                    {!isMobile && i===1 && locked && (
                      <div style={{ flexShrink:0,display:"flex",alignItems:"center",gap:7,background:"#fce7f3",border:"1px solid #f9a8d4",borderRadius:10,padding:"7px 12px",maxWidth:200 }}>
                        <Lock size={12} style={{ color:"#ec4899",flexShrink:0 }}/>
                        <span style={{ fontSize:11,color:"#9d174d",fontWeight:500,lineHeight:1.3 }}>{f.bloqueadoMsg}</span>
                      </div>
                    )}
                    {i>1 && locked && <ChevronRight size={16} style={{ color:"#d1d5db",flexShrink:0 }}/>}
                  </div>

                  {/* CTA mobile — debajo del contenido */}
                  {isMobile && i===0 && !done && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:11,color:"#9a7080" }}>{secCompletas} de {totalSecciones} secciones</span>
                        <span style={{ fontSize:11,fontWeight:700,color:"#ec4899" }}>{pctEval}%</span>
                      </div>
                      <div style={{ height:5,background:"#f0e8f0",borderRadius:99,overflow:"hidden",marginBottom:10 }}>
                        <div style={{ height:"100%",width:`${pctEval}%`,background:"linear-gradient(90deg,#ec4899,#f472b6)",borderRadius:99 }}/>
                      </div>
                      <button onClick={e=>{e.stopPropagation();router.push("/dashboard/perfil/evaluacion");}} style={{ width:"100%",fontSize:13,fontWeight:600,color:"#fff",background:"linear-gradient(135deg,#ec4899,#be185d)",border:"none",padding:"10px",borderRadius:10,cursor:"pointer",fontFamily:"inherit" }}>{f.boton}</button>
                    </div>
                  )}
                  {isMobile && i===1 && (pending||active) && (
                    <div style={{ marginTop:10 }}>
                      {agenciaIniciada && (
                        <>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                            <span style={{ fontSize:11,color:"#9a7080" }}>Progreso agencia</span>
                            <span style={{ fontSize:11,fontWeight:700,color:"#7c3aed" }}>{pctAgencia}%</span>
                          </div>
                          <div style={{ height:5,background:"#ede9fe",borderRadius:99,overflow:"hidden",marginBottom:10 }}>
                            <div style={{ height:"100%",width:`${pctAgencia}%`,background:"linear-gradient(90deg,#7c3aed,#a0435f)",borderRadius:99 }}/>
                          </div>
                        </>
                      )}
                      <button onClick={e=>{e.stopPropagation();router.push("/dashboard/perfil/agencia");}} style={{ width:"100%",fontSize:13,fontWeight:600,color:"#fff",background:"linear-gradient(135deg,#7c3aed,#a0435f)",border:"none",padding:"10px",borderRadius:10,cursor:"pointer",fontFamily:"inherit" }}>{f.boton}</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:isMobile?"100%":260,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":20,boxShadow:"0 1px 4px rgba(0,0,0,.04)",textAlign:"center" }}>
            <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:"0 0 14px",textAlign:"left" }}>Tu progreso en el proceso</h3>
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
                <div style={{ display:"flex",justifyContent:"center",marginBottom:12 }}><DonutProgress pct={pctProceso}/></div>
                <p style={{ fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#1e1033",margin:"0 0 2px" }}>{fasesCompletadas} de 5 fases completadas</p>
                <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px",lineHeight:1.4 }}>Sigue así, vas por buen camino 💜</p>
              </>
            )}
            <Link href="/dashboard/proceso" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:"1.5px solid #ede9fe",color:"#7c3aed",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>
              🗺️ Ver mi proceso completo
            </Link>
          </div>

          {siguienteFase && (
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":18,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                <div style={{ width:26,height:26,borderRadius:8,background:"#fce7f3",display:"flex",alignItems:"center",justifyContent:"center" }}>🎯</div>
                <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:0 }}>Próximo paso</h3>
              </div>
              {siguienteFase.id==="evaluacion_perfil" ? (
                <>
                  <p style={{ fontSize:13,color:"#1e1033",margin:"0 0 10px",lineHeight:1.5 }}>Completa tu <span style={{ color:"#ec4899",fontWeight:700 }}>evaluación de perfil</span>.</p>
                  <Link href="/dashboard/perfil/evaluacion" style={{ display:"block",textAlign:"center",background:"#5b21b6",color:"#fff",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>
                    {secCompletas>0?"Continuar evaluación":"Comenzar evaluación"}
                  </Link>
                </>
              ) : siguienteFase.id==="perfil_agencia" ? (
                <>
                  <p style={{ fontSize:13,color:"#1e1033",margin:"0 0 10px",lineHeight:1.5 }}>Completa tu <span style={{ color:"#7c3aed",fontWeight:700 }}>perfil con la agencia</span>.</p>
                  <Link href="/dashboard/perfil/agencia" style={{ display:"block",textAlign:"center",background:"linear-gradient(135deg,#7c3aed,#a0435f)",color:"#fff",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>
                    {agenciaIniciada?"Continuar perfil":"Comenzar perfil"}
                  </Link>
                </>
              ) : (
                <p style={{ fontSize:13,color:"#9a7080",margin:0 }}>{siguienteFase.titulo} — próximamente disponible.</p>
              )}
            </div>
          )}

          <HelpCard onContact={()=>router.push("/dashboard/mensajes")}/>
        </aside>
      </div>
    </div>
  );
}