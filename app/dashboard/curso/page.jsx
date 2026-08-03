"use client";
// app/dashboard/curso/page.jsx — Rediseño Panel Candidata (borgoña), estilo "aula".
// Video grande + resumen a la izquierda · lista de clases con progreso a la derecha.
// Videos GRATIS, progresión secuencial. Se completa en la misma página.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Check, Play, Lock, ArrowRight, CheckCircle2, PlayCircle,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";

/* ── Confeti al completar una clase ── */
function Confetti() {
  const colores = [T.primary, T.primary3, "#22C55E", "#F0913E", T.ink, "#FFD166"];
  const piezas = Array.from({ length: 70 });
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:3000, overflow:"hidden" }}>
      {piezas.map((_,i) => {
        const left = Math.random()*100, delay = Math.random()*0.35, dur = 1.7+Math.random()*1.3;
        const size = 6+Math.random()*8, rot = Math.random()*360, bg = colores[i%colores.length];
        return <div key={i} style={{ position:"absolute", top:"-6%", left:`${left}%`, width:size, height:size*0.5, background:bg, borderRadius:2, transform:`rotate(${rot}deg)`, animation:`dapconf ${dur}s ${delay}s ease-in forwards` }}/>;
      })}
      <style>{`@keyframes dapconf{to{transform:translateY(112vh) rotate(760deg);opacity:.15}}`}</style>
    </div>
  );
}

/* ── Reproductor de la sesión activa ── */
function Player({ sesion }) {
  const yt  = sesion?.video_youtube_id;
  const drv = sesion?.video_drive_id;
  const url = sesion?.url_video || "";
  const esYt = !yt && !drv && (url.includes("youtube.com")||url.includes("youtu.be"));
  const esVimeo = !yt && !drv && url.includes("vimeo.com");
  const esMp4 = !yt && !drv && !esYt && !esVimeo && !!url;
  const box = { position:"absolute", inset:0, width:"100%", height:"100%", border:"none" };
  return (
    <div style={{ position:"relative", width:"100%", aspectRatio:"16/9", borderRadius:20, overflow:"hidden", background:T.ink, boxShadow:"0 14px 34px rgba(160,67,95,.16)" }}>
      {yt && <iframe style={box} src={`https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>}
      {drv && <div style={{ position:"absolute", inset:0, overflow:"hidden" }}><iframe src={`https://drive.google.com/file/d/${drv}/preview`} style={{ width:"100%", height:"calc(100% + 52px)", marginTop:-52, border:"none", display:"block" }} allow="autoplay; fullscreen" allowFullScreen/></div>}
      {esYt && <iframe style={box} src={url.replace("watch?v=","embed/")} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>}
      {esVimeo && <iframe style={box} src={url.replace("vimeo.com/","player.vimeo.com/video/")} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>}
      {esMp4 && <video style={box} src={url} controls/>}
      {!yt && !drv && !esYt && !esVimeo && !esMp4 && (
        <div style={{ position:"absolute", inset:0, background:T.gradHero, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,.95)", display:"flex", alignItems:"center", justifyContent:"center", color:T.primary }}><Play size={26} fill={T.primary}/></div>
          <div style={{ fontSize:16, fontWeight:700, marginTop:12, textAlign:"center", padding:"0 16px" }}>{sesion?.titulo}</div>
          <div style={{ fontSize:12, opacity:.85, marginTop:2 }}>El video estará disponible pronto</div>
        </div>
      )}
    </div>
  );
}

export default function CursoPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,    setUser]    = useState(null);
  const [sesData, setSesData] = useState(null);
  const [activaId,setActivaId]= useState(null);
  const [loading, setLoading] = useState(true);
  const [completando,setCompletando]=useState(false);
  const [confetti,setConfetti]=useState(false);

  const cargar = (selectAvailable=false) => {
    const safe=(p,fb=null)=>p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    return Promise.all([
      safe(fetch("/api/auth/me"),            {user:null}),
      safe(fetch("/api/dashboard/sesiones"), null),
    ]).then(([me,ses]) => {
      setUser(me?.user||null); setSesData(ses);
      if (selectAvailable || activaId===null) {
        const av = ses?.sesiones?.find(s=>s.estado==="available") || ses?.sesiones?.[0];
        if (av) setActivaId(av.id);
      }
      setLoading(false);
    });
  };
  useEffect(()=>{ cargar(); },[]);

  const { completadas=0, total=0, porcentaje=0, sesiones=[] } = sesData||{};
  const cursoCompleto = total>0 && completadas>=total;
  const tieneAcceso   = !!user?.tiene_acceso;
  const activa = sesiones.find(s=>s.id===activaId) || null;

  const seleccionar = (s) => { if(s.estado!=="locked") setActivaId(s.id); };

  const completar = async () => {
    if (!activa || activa.estado==="completed") return;
    setCompletando(true);
    await fetch("/api/dashboard/completar",{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ id_sesion:activa.id }) }).catch(()=>{});
    setConfetti(true); setTimeout(()=>setConfetti(false), 2600);
    const ses = await fetch("/api/dashboard/sesiones").then(r=>r.json()).catch(()=>null);
    setSesData(ses);
    const next = ses?.sesiones?.find(s=>s.estado==="available");
    if (next) setActivaId(next.id);
    setCompletando(false);
  };

  if (loading) return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.font }}>
      <div style={{ width:40, height:40, border:`3px solid ${T.lilac}`, borderTopColor:T.primary, borderRadius:"50%", animation:"dapspin 1s linear infinite" }}/>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily:T.font, color:T.text, padding:isMobile?"16px 16px 90px":"28px 30px", display:"flex", flexDirection:"column", gap:16, maxWidth:1180, margin:"0 auto", width:"100%" }}>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
      {confetti && <Confetti/>}

      {/* header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div>
          <div style={{ fontSize:isMobile?21:26, fontWeight:700, color:T.text, lineHeight:1.1 }}>Tu curso</div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, marginTop:6, background:T.greenBg, color:T.green, fontWeight:600, fontSize:12.5, padding:"6px 12px", borderRadius:22 }}>
            <Check size={14}/> 100% gratis, siempre. Sin pagos para ver los videos.
          </div>
        </div>
        <button style={{ width:42, height:42, borderRadius:12, background:"#fff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", color:T.primary, cursor:"pointer", position:"relative", flexShrink:0 }}>
          <Bell size={19}/><span style={{ position:"absolute", top:11, right:12, width:7, height:7, borderRadius:"50%", background:T.primary3 }}/>
        </button>
      </div>

      {/* dos columnas */}
      <div style={{ display:"flex", gap:20, flexDirection:isMobile?"column":"row", alignItems:"flex-start" }}>

        {/* ── IZQUIERDA: reproductor + resumen ── */}
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>
          <Player sesion={activa}/>

          {activa && (
            <div style={{ background:"#fff", borderRadius:20, padding:isMobile?18:22, boxShadow:T.shadow }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:isMobile?17:19, fontWeight:700, color:T.text }}>{activa.titulo}</div>
                  <div style={{ fontSize:12.5, color:T.textSoft, marginTop:2 }}>Módulo {sesiones.findIndex(s=>s.id===activa.id)+1}{activa.duracion?` · ${activa.duracion}`:""}</div>
                </div>
                {activa.estado==="completed" ? (
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:T.primary, fontSize:13, fontWeight:700 }}><CheckCircle2 size={17}/> Completada</div>
                ) : (
                  <button onClick={completar} disabled={completando}
                    style={{ background:T.primary, color:"#fff", border:"none", borderRadius:12, padding:"11px 18px", fontFamily:T.font, fontWeight:700, fontSize:13.5, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                    {completando ? "Guardando…" : <>Marcar completada y continuar <ArrowRight size={16}/></>}
                  </button>
                )}
              </div>
              {activa.descripcion && (
                <>
                  <div style={{ height:1, background:T.border, margin:"16px 0" }}/>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", color:T.textSoft, marginBottom:8 }}>RESUMEN</div>
                  <p style={{ fontSize:13.5, color:T.text, lineHeight:1.65, margin:0, whiteSpace:"pre-line" }}>{activa.descripcion}</p>
                </>
              )}
            </div>
          )}

          {/* CTA conversión (al terminar, si no pagó) */}
          {cursoCompleto && !tieneAcceso && (
            <div style={{ background:"linear-gradient(140deg,#FCE8EE,#F7E4EA)", borderRadius:22, padding:24 }}>
              <div style={{ fontSize:18, fontWeight:700, color:T.ink, lineHeight:1.3 }}>Ya sabes cómo funciona. ¿Lista para dar el salto real?</div>
              <div style={{ fontSize:13.5, color:T.textSoft, marginTop:8, lineHeight:1.55 }}>Los videos te prepararon. El siguiente paso es presentarte ante una agencia aliada de verdad, con nuestro acompañamiento.</div>
              <button onClick={()=>router.push("/pago")} style={{ marginTop:16, background:T.primary, color:"#fff", border:"none", borderRadius:13, padding:"14px 22px", fontFamily:T.font, fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                Quiero avanzar hacia mi agencia <ArrowRight size={17}/>
              </button>
            </div>
          )}
        </div>

        {/* ── DERECHA: progreso + lista de clases ── */}
        <aside style={{ width:isMobile?"100%":360, flexShrink:0, background:"#fff", borderRadius:20, boxShadow:T.shadow, overflow:"hidden", alignSelf:"stretch" }}>
          <div style={{ padding:"18px 20px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Progreso del curso</div>
              <div style={{ fontSize:13, fontWeight:700, color:T.primary }}>{porcentaje}%</div>
            </div>
            <div style={{ height:8, background:T.softFill, borderRadius:20, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${porcentaje}%`, background:"linear-gradient(90deg,#A0435F,#C77D93)", borderRadius:20, transition:"width .5s" }}/>
            </div>
            <div style={{ fontSize:12, color:T.textSoft, marginTop:7 }}>{completadas} de {total} clases completadas</div>
          </div>

          <div style={{ maxHeight:isMobile?"none":560, overflowY:"auto" }}>
            {sesiones.map((s,i) => {
              const completed=s.estado==="completed", locked=s.estado==="locked";
              const isActiva=s.id===activaId;
              return (
                <div key={s.id} onClick={()=>seleccionar(s)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:i<sesiones.length-1?`1px solid ${T.softFill}`:"none", cursor:locked?"default":"pointer", background:isActiva?T.lilac:"#fff", opacity:locked?.55:1 }}>
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: completed?T.primary:locked?T.softFill:isActiva?"#fff":T.lilac, color: completed?"#fff":locked?T.softText:T.primary, fontWeight:700, fontSize:13 }}>
                    {completed ? <Check size={16}/> : locked ? <Lock size={14}/> : isActiva ? <PlayCircle size={16}/> : i+1}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13.5, fontWeight:600, color:locked?T.textSoft:T.text, lineHeight:1.3 }}>{s.titulo}</div>
                    <div style={{ fontSize:11.5, fontWeight:600, color: completed?T.primary:isActiva?T.primary:T.textSoft, marginTop:1 }}>
                      {completed?"Completado":isActiva?"Viendo ahora":locked?"Bloqueado":`Módulo ${i+1}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA persistente: activar acompañamiento (si aún no paga) */}
          {!tieneAcceso && (
            <div style={{ margin:16, padding:18, borderRadius:16, background:T.gradHero, color:"#fff" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", opacity:.9 }}>TU SIGUIENTE PASO</div>
              <div style={{ fontSize:15, fontWeight:700, marginTop:5, lineHeight:1.3 }}>Activa tu acompañamiento</div>
              <div style={{ fontSize:12.5, opacity:.92, marginTop:6, lineHeight:1.5 }}>Da el salto real: te presentamos ante una agencia aliada y te acompañamos hasta viajar.</div>
              <button onClick={()=>router.push("/pago")} style={{ marginTop:12, width:"100%", background:"#fff", color:T.primary, border:"none", borderRadius:12, padding:12, fontFamily:T.font, fontWeight:700, fontSize:13.5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                Activar mi acompañamiento <ArrowRight size={16}/>
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
