"use client";
// app/dashboard/page.jsx — Rediseño Panel Candidata (sistema "pasaporte/viaje")

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Check, Star, ArrowRight, Globe, MessageCircle, Calendar, Sparkles,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";

export default function DashboardPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,       setUser]       = useState(null);
  const [sesData,    setSesData]    = useState(null);
  const [proceso,    setProceso]    = useState(null);
  const [reunion,    setReunion]    = useState(null);
  const [docsData,   setDocs]       = useState({docs:[],docs_requeridos:[]});
  const [loading,    setLoading]    = useState(true);
  const [bienvenida, setBienvenida] = useState(false);

  useEffect(() => {
    const safe = (p, fb=null) =>
      p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),              {user:null}),
      safe(fetch("/api/dashboard/sesiones"),   null),
      safe(fetch("/api/dashboard/proceso"),    null),
      safe(fetch("/api/dashboard/reunion"),    null),
      safe(fetch("/api/dashboard/documentos"), {docs:[],docs_requeridos:[]}),
    ]).then(([me,ses,proc,reu,docsData]) => {
      setUser(me?.user||null);
      setSesData(ses);
      setProceso(proc);
      setReunion(reu?.reunion||null);
      setDocs(docsData||{docs:[],docs_requeridos:[]});
      if(me?.user&&!me.user.vio_bienvenida) setBienvenida(true);
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  const cerrarBienvenida = async () => {
    setBienvenida(false);
    await fetch("/api/dashboard/bienvenida",{method:"POST"}).catch(()=>{});
    router.push("/dashboard/curso");
  };
  // Cierra la bienvenida pero se queda explorando el panel (sin ir a los videos).
  const explorarPanel = async () => {
    setBienvenida(false);
    await fetch("/api/dashboard/bienvenida",{method:"POST"}).catch(()=>{});
  };

  const { completadas=0, total=0, porcentaje=0 } = sesData||{};
  const cursoCompleto = proceso?.curso_completo || (total>0 && completadas>=total);
  const tieneAcceso   = !!user?.tiene_acceso;

  // Pasos reales de proceso → etapas del "ruta al sueño"
  const pasosSrc = proceso?.pasos?.length>0 ? proceso.pasos : [
    { id:"curso",            label:"Curso",            status: cursoCompleto?"completado":"disponible" },
    { id:"documentos",       label:"Documentos",       status: tieneAcceso?"disponible":"bloqueado" },
    { id:"evaluacion_perfil",label:"Evaluación",       status:"bloqueado" },
    { id:"perfil_agencia",   label:"Agencia",          status:"bloqueado" },
    { id:"match",            label:"Match",            status:"bloqueado" },
    { id:"viaje",            label:"Visa & Viaje",     status:"bloqueado" },
  ];
  const estado = (s) => s==="completado" ? "done" : (s==="disponible"||s==="en_revision") ? "current" : "soon";

  // Documentos: ¿ya cargó todos los requeridos?
  const docsTotal   = (docsData?.docs_requeridos||[]).length;
  const docsSubidos = new Set((docsData?.docs||[]).map(d=>d.tipo_doc));
  const docsCount   = (docsData?.docs_requeridos||[]).filter(r=>docsSubidos.has(r.tipo)).length;
  const docsListos  = docsTotal>0 && docsCount>=docsTotal;
  // Perfil (ambas partes) completo → el paso "cuentanos_de_ti" sellado
  const perfilListo = proceso?.pasos?.find(p=>p.id==="cuentanos_de_ti")?.status==="completado";

  // Hero: próximo paso REAL. Prioridad de acciones de la candidata; si ya hizo
  // todo lo suyo, usa el proximoPaso del proceso (que incluye "esperar / en revisión").
  let hero;
  if (!cursoCompleto)      hero = { kicker:"TU PRÓXIMO PASO", title:"Continúa tu formación", desc:"Mira tus videos: te preparan para todo lo que viene. Son 100% gratis.", cta:"Continuar mi curso", href:"/dashboard/curso" };
  else if (!tieneAcceso)   hero = { kicker:"TU PRÓXIMO PASO", title:"Terminaste tu formación. Ahora prepárate para conocer a tu agencia.", desc:"Activa tu acompañamiento para que una agencia aliada revise tu perfil y te acepte.", cta:"Activar mi acompañamiento", href:"/pago" };
  else if (!perfilListo)   hero = { kicker:"TU PRÓXIMO PASO", title:"Cuéntanos de ti", desc:"Completa tu perfil (ambas partes) para que podamos presentarte ante una agencia.", cta:"Completar mi perfil", href:"/dashboard/perfil" };
  else if (!docsListos)    hero = { kicker:"TU PRÓXIMO PASO", title:"Carga tu documentación", desc:"Sube tus documentos para que presentemos tu perfil a una agencia aliada.", cta:"Ir a mis documentos", href:"/dashboard/documentos" };
  else if (proceso?.proximoPaso) {
    const esperando = /revisando|revisi/i.test(proceso.proximoPaso.titulo||"");
    hero = { kicker: esperando?"EN PROCESO":"TU PRÓXIMO PASO", title: proceso.proximoPaso.titulo, desc: proceso.proximoPaso.detalle, cta: esperando?null:proceso.proximoPaso.label_boton, href: proceso.proximoPaso.link };
  }
  else                     hero = { kicker:"EN PROCESO", title:"Estamos revisando tu perfil", desc:"Nuestro equipo lo revisa y te avisará aquí y por correo (1–3 días hábiles).", cta:null, href:"/dashboard/proceso" };

  if (loading) return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.font }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:`3px solid ${T.lilac}`, borderTopColor:T.primary, borderRadius:"50%", margin:"0 auto 12px", animation:"dapspin 1s linear infinite" }}/>
        <p style={{ fontSize:13, color:T.textSoft }}>Cargando tu Destino…</p>
      </div>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const railProgress = pasosSrc.slice(0,4).map(p => ({ label:p.label, st:estado(p.status) }));

  return (
    <div style={{ fontFamily:T.font, color:T.text, padding:isMobile?"16px 16px 90px":"28px 30px", display:"flex", gap:22, flexDirection:isMobile?"column":"row", maxWidth:1180, margin:"0 auto", width:"100%" }}>
      <style>{`@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes pulsering{0%{box-shadow:0 0 0 0 rgba(160,67,95,.5)}70%{box-shadow:0 0 0 9px rgba(160,67,95,0)}100%{box-shadow:0 0 0 0 rgba(160,67,95,0)}}`}</style>

      {/* ── MAIN ── */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:18 }}>
        {/* header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div>
            <div style={{ fontSize:isMobile?21:26, fontWeight:700, color:T.text, lineHeight:1.1 }}>Hola, {user?.nombre}</div>
            <div style={{ fontSize:13.5, color:T.textSoft, marginTop:3 }}>Cada paso te acerca a tu aventura</div>
          </div>
          <button style={{ width:42, height:42, borderRadius:12, background:"#fff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", color:T.primary, cursor:"pointer", position:"relative", flexShrink:0 }}>
            <Bell size={19}/>
            <span style={{ position:"absolute", top:11, right:12, width:7, height:7, borderRadius:"50%", background:T.primary3 }}/>
          </button>
        </div>

        {/* HERO — próximo paso */}
        <div style={{ borderRadius:24, padding:28, color:"#fff", background:T.gradHero, position:"relative", overflow:"hidden", boxShadow:T.shadowHero }}>
          <div style={{ position:"absolute", right:-40, top:-40, width:170, height:170, borderRadius:"50%", background:"rgba(255,255,255,.09)" }}/>
          <div style={{ position:"absolute", right:26, top:24, opacity:.9, animation:"floaty 4s ease-in-out infinite" }}><Globe size={34}/></div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:".14em", opacity:.85 }}>{hero.kicker}</div>
          <div style={{ fontSize:22, fontWeight:700, lineHeight:1.28, margin:"10px 0 8px", maxWidth:"22ch" }}>{hero.title}</div>
          <div style={{ fontSize:13.5, opacity:.92, maxWidth:"44ch", lineHeight:1.55 }}>{hero.desc}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:20 }}>
            {hero.cta && (
              <button onClick={()=>router.push(hero.href)} style={{ background:"#fff", color:T.primary, border:"none", borderRadius:13, padding:"13px 20px", fontFamily:T.font, fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                {hero.cta} <ArrowRight size={17}/>
              </button>
            )}
            <button onClick={()=>router.push("/dashboard/proceso")} style={{ background: hero.cta?"rgba(255,255,255,.15)":"#fff", color: hero.cta?"#fff":T.primary, border: hero.cta?"1px solid rgba(255,255,255,.4)":"none", borderRadius:13, padding:"13px 18px", fontFamily:T.font, fontWeight:700, fontSize:13.5, cursor:"pointer" }}>
              Ver mi viaje
            </button>
          </div>
        </div>

        {/* RUTA AL SUEÑO */}
        <div style={{ background:"#fff", borderRadius:22, padding:22, boxShadow:T.shadow }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontSize:16, fontWeight:700, color:T.text }}>Tu ruta al sueño</div>
            <Link href="/dashboard/proceso" style={{ color:T.primary, fontWeight:600, fontSize:13, textDecoration:"none", display:"flex", alignItems:"center", gap:5 }}>Ver pasaporte <ArrowRight size={14}/></Link>
          </div>
          <div style={{ display:"flex", overflowX:"auto", paddingBottom:6 }}>
            {pasosSrc.map((p,i) => {
              const st = estado(p.status), done=st==="done", cur=st==="current";
              const base = { width:44, height:44, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, zIndex:1, position:"relative" };
              const dot = done ? {...base, background:T.primary, color:"#fff"}
                        : cur  ? {...base, background:"#fff", border:`3px solid ${T.primary3}`, color:T.primary3, animation:"pulsering 2s infinite"}
                               : {...base, background:T.lilac, color:T.softText};
              return (
                <div key={p.id} style={{ flex:1, minWidth:90, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", position:"relative", padding:"0 4px" }}>
                  <div style={{ position:"absolute", top:22, left:"-50%", width:"100%", height:3, background: i===0?"transparent":(done||cur?T.primary3:T.softLine), zIndex:0 }}/>
                  <div style={dot}>{done ? <Check size={20}/> : cur ? <Star size={18}/> : i+1}</div>
                  <div style={{ fontSize:12.5, fontWeight:600, marginTop:9, color: st==="soon"?T.textSoft:T.text, lineHeight:1.2 }}>{p.label}</div>
                  <div style={{ fontSize:11, fontWeight:600, marginTop:2, color: done?T.primary:cur?T.primary3:T.softText }}>{done?"Completado":cur?"En curso":"Próximamente"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT RAIL — se apila debajo en móvil ── */}
      {(
        <aside style={{ width:isMobile?"100%":296, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", borderRadius:18, padding:14, boxShadow:T.shadow }}>
            <div style={{ width:46, height:46, borderRadius:14, overflow:"hidden", flexShrink:0, background:T.lilac, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {user?.foto_url ? <img src={user.foto_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ color:T.primary, fontWeight:700 }}>{user?.nombre?.[0]||"?"}</span>}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{user?.nombre} {user?.apellido}</div>
              <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11.5, color:T.textSoft }}><Sparkles size={13}/> Futura Au Pair</div>
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:18, padding:18, boxShadow:T.shadow }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>Tu progreso</div>
            {railProgress.map((r,i) => {
              const done=r.st==="done", cur=r.st==="current";
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0" }}>
                  <div style={{ width:28, height:28, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: done?T.primary:cur?T.lilac:T.softFill, color: done?"#fff":cur?T.primary3:T.softText }}>
                    {done ? <Check size={15}/> : cur ? <Star size={14}/> : <span style={{ fontSize:12, fontWeight:700 }}>{i+1}</span>}
                  </div>
                  <div style={{ flex:1, fontSize:13, fontWeight:600, color: r.st==="soon"?T.textSoft:T.text }}>{r.label}</div>
                  {(done||cur) && <span style={{ fontSize:10.5, fontWeight:700, color: done?T.primary:T.primary3 }}>{done?"Listo":"Ahora"}</span>}
                </div>
              );
            })}
          </div>

          <div style={{ background:T.lilac, borderRadius:18, padding:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, color:T.primary, fontWeight:700, fontSize:13, marginBottom:6 }}><Calendar size={15}/> Tu próxima reunión</div>
            <div style={{ fontSize:12.5, color:T.textSoft, lineHeight:1.45 }}>
              {reunion ? `${reunion.fecha} · ${reunion.hora}` : "Aún no tienes una agendada. Reserva una llamada con tu asesora."}
            </div>
            <Link href="/dashboard/reuniones" style={{ display:"block", textAlign:"center", marginTop:12, background:"#fff", color:T.primary, borderRadius:12, padding:11, fontWeight:700, fontSize:13, textDecoration:"none" }}>Agendar reunión</Link>
          </div>
        </aside>
      )}

      {/* ── WELCOME MODAL ── */}
      {bienvenida && user && (
        <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:22, background:"rgba(38,35,92,.42)", backdropFilter:"blur(3px)" }}>
          <div style={{ width:"100%", maxWidth:384, background:"#fff", borderRadius:26, padding:"0 26px 28px", textAlign:"center", boxShadow:"0 30px 70px rgba(38,35,92,.4)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", left:0, right:0, top:0, height:96, background:T.gradHero, overflow:"hidden" }}>
              <div style={{ position:"absolute", right:-24, top:-24, width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,.12)" }}/>
            </div>
            <div style={{ position:"relative", width:76, height:76, borderRadius:22, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", color:T.primary, margin:"52px auto 0", boxShadow:"0 14px 28px rgba(160,67,95,.3)", animation:"floaty 4s ease-in-out infinite" }}><Globe size={36}/></div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:T.greenBg, color:T.green, fontWeight:600, fontSize:12, padding:"6px 12px", borderRadius:20, marginTop:16 }}><Check size={15}/> Tu cuenta ya está activa</div>
            <div style={{ fontSize:23, fontWeight:700, color:T.ink, marginTop:12 }}>¡Bienvenida, {user.nombre}!</div>
            <div style={{ fontSize:13.5, color:T.textSoft, marginTop:8, lineHeight:1.55 }}>Tu Destino Au&nbsp;Pair empieza hoy. Comienza por tu sesión de bienvenida: son videos 100% gratis que te preparan para todo lo que viene.</div>
            <button onClick={cerrarBienvenida} style={{ marginTop:22, width:"100%", background:T.primary, color:"#fff", border:"none", borderRadius:15, padding:15, fontFamily:T.font, fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 12px 26px rgba(160,67,95,.3)" }}>
              Empezar mi Destino <ArrowRight size={18}/>
            </button>
            <button onClick={explorarPanel} style={{ marginTop:10, width:"100%", background:T.lilac, color:T.primary, border:"none", borderRadius:15, padding:13, fontFamily:T.font, fontWeight:600, fontSize:13.5, cursor:"pointer" }}>
              Explorar mi panel primero
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
