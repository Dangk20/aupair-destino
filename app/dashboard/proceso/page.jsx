"use client";
// app/dashboard/proceso/page.jsx — Mi Destino (pasaporte / sellos de viaje).
// Rediseño Panel Candidata (borgoña). Dos columnas: pasaporte + timeline · rail derecho.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Check, Star, Globe, Award, ArrowRight, FileText, Calendar, MessageCircle } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema-candidata";

const DESC = {
  curso:             "Tu formación para entender todo el proceso.",
  cuentanos_de_ti:   "Completa tu perfil para presentarte ante una agencia.",
  evaluacion_perfil: "Nuestro equipo revisa tu perfil (1–3 días hábiles).",
  perfil_agencia:    "Presentamos tu perfil a una agencia aliada.",
  match:             "La agencia te acepta. El momento soñado.",
  visa:              "Tramitamos tu visa para viajar.",
  viaje:             "Preparación final y ¡despegas!",
};

export default function MiDestinoPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const [user,setUser]=useState(null); const [pasos,setPasos]=useState([]);
  const [reunion,setReunion]=useState(null); const [docs,setDocs]=useState({count:0,total:0});
  const [loading,setLoading]=useState(true);

  useEffect(() => {
    const safe=(p,fb=null)=>p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),{user:null}),
      safe(fetch("/api/dashboard/proceso"),null),
      safe(fetch("/api/dashboard/reunion"),null),
      safe(fetch("/api/dashboard/documentos"),{docs:[],docs_requeridos:[]}),
    ]).then(([me,proc,reu,dd])=>{
      setUser(me?.user||null); setPasos(proc?.pasos||[]); setReunion(reu?.reunion||null);
      const total=(dd?.docs_requeridos||[]).length;
      const subidos=new Set((dd?.docs||[]).map(d=>d.tipo_doc));
      const count=(dd?.docs_requeridos||[]).filter(r=>subidos.has(r.tipo)).length;
      setDocs({count,total}); setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font }}>
      <div style={{ width:40,height:40,border:`3px solid ${T.lilac}`,borderTopColor:T.primary,borderRadius:"50%",animation:"dapspin 1s linear infinite" }}/>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const est = (s) => s==="completado" ? "done" : (s==="bloqueado" ? "soon" : "current");
  const sellos = pasos.filter(p=>est(p.status)==="done").length;
  const totalPasos = pasos.length||6;
  const pct = Math.round(sellos/totalPasos*100);
  const actual = pasos.find(p=>est(p.status)==="current") || pasos.find(p=>est(p.status)!=="done");
  const tieneAcceso = !!user?.tiene_acceso;

  // Próximo paso (dinámico)
  let prox;
  if (!tieneAcceso)                     prox = { title:"Activa tu acompañamiento", desc:"Es el paso que te presenta ante una agencia aliada.", cta:"Activar", href:"/pago" };
  else if (docs.count < docs.total)     prox = { title:"Carga tu documentación", desc:`Te faltan ${docs.total-docs.count} documentos para presentar tu perfil.`, cta:"Ir a documentos", href:"/dashboard/documentos" };
  else                                  prox = { title:"Perfil en revisión", desc:"Nuestro equipo revisa tu perfil (1–3 días hábiles).", cta:null };

  return (
    <div style={{ fontFamily:T.font,color:T.text,padding:isMobile?"16px 16px 90px":"28px 30px",display:"flex",gap:22,flexDirection:isMobile?"column":"row",maxWidth:1180,margin:"0 auto",width:"100%" }}>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}@keyframes pulsering{0%{box-shadow:0 0 0 0 rgba(160,67,95,.5)}70%{box-shadow:0 0 0 9px rgba(160,67,95,0)}100%{box-shadow:0 0 0 0 rgba(160,67,95,0)}}`}</style>

      {/* ── MAIN ── */}
      <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:18 }}>
        {/* header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
          <div>
            <div style={{ fontSize:isMobile?21:26,fontWeight:700,color:T.text,lineHeight:1.1 }}>Mi Destino</div>
            <div style={{ fontSize:13.5,color:T.textSoft,marginTop:3 }}>Tu pasaporte al sueño de ser au pair</div>
          </div>
          <button style={{ width:42,height:42,borderRadius:12,background:"#fff",border:"none",display:"flex",alignItems:"center",justifyContent:"center",color:T.primary,cursor:"pointer",position:"relative",flexShrink:0 }}>
            <Bell size={19}/><span style={{ position:"absolute",top:11,right:12,width:7,height:7,borderRadius:"50%",background:T.primary3 }}/>
          </button>
        </div>

        {/* PASAPORTE */}
        <div style={{ borderRadius:24,padding:26,background:T.gradPass,color:"#fff",position:"relative",overflow:"hidden",boxShadow:"0 18px 40px rgba(160,67,95,.3)" }}>
          <div style={{ position:"absolute",inset:0,background:"radial-gradient(420px 220px at 88% 8%,rgba(200,125,147,.28),transparent)",pointerEvents:"none" }}/>
          <div style={{ position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16 }}>
            <div style={{ display:"flex",gap:16,alignItems:"center" }}>
              <div style={{ width:64,height:64,borderRadius:18,overflow:"hidden",flexShrink:0,border:"2px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                {user?.foto_url ? <img src={user.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span style={{ fontWeight:700,fontSize:22 }}>{user?.nombre?.[0]||"?"}</span>}
              </div>
              <div>
                <div style={{ fontSize:11,letterSpacing:".16em",color:"#F2D9E1",fontWeight:700 }}>PASAPORTE · AU PAIR</div>
                <div style={{ fontSize:21,fontWeight:700,marginTop:4 }}>{user?.nombre} {user?.apellido}</div>
                <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12.5,opacity:.85,marginTop:2 }}><Globe size={14}/> {user?.pais||"Colombia"} → El mundo</div>
              </div>
            </div>
            <div style={{ opacity:.9 }}><Star size={40}/></div>
          </div>
          <div style={{ position:"relative",marginTop:22,display:"flex",gap:26 }}>
            <div><div style={{ fontSize:11,opacity:.65 }}>ETAPA ACTUAL</div><div style={{ fontWeight:700,fontSize:15,marginTop:2 }}>{actual?.label||"—"}</div></div>
            <div><div style={{ fontSize:11,opacity:.65 }}>SELLOS</div><div style={{ fontWeight:700,fontSize:15,marginTop:2 }}>{sellos} / {totalPasos}</div></div>
          </div>
        </div>

        {/* SELLOS DE VIAJE */}
        <div style={{ fontSize:15,fontWeight:700,color:T.text }}>Tus sellos de viaje</div>
        <div style={{ display:"flex",flexDirection:"column" }}>
          {pasos.map((p,i) => {
            const st=est(p.status), done=st==="done", cur=st==="current", last=i===pasos.length-1;
            const sb={ width:50,height:50,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 };
            const stamp = done ? {...sb,background:T.ink,color:"#F2D9E1",border:`2px solid ${T.primary3}`,transform:"rotate(-8deg)"}
                        : cur  ? {...sb,background:"#fff",border:`3px solid ${T.primary3}`,color:T.primary3,animation:"pulsering 2s infinite"}
                               : {...sb,background:T.lilac,color:T.softText};
            const body = done ? { background:"#fff",boxShadow:T.shadow }
                       : cur  ? { background:"linear-gradient(135deg,#FCE8EE,#F7E4EA)" }
                              : { background:"#fff",border:`1px dashed ${T.border}` };
            const chip = done ? { t:"Sellado", c:T.primary, bg:T.lilac }
                       : cur  ? { t:"En curso", c:"#fff", bg:T.primary3 }
                              : { t:"Próximamente", c:T.softText, bg:T.softFill };
            return (
              <div key={p.id} style={{ display:"flex",gap:16 }}>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
                  <div style={stamp}>{done ? <Check size={22}/> : cur ? <Star size={22}/> : <span style={{ fontWeight:700 }}>{i+1}</span>}</div>
                  {!last && <div style={{ width:3,flex:1,minHeight:20,background:done?T.primary3:T.softLine,margin:"4px 0" }}/>}
                </div>
                <div style={{ flex:1,borderRadius:16,padding:14,marginBottom:14,...body }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:8 }}>
                    <div style={{ fontWeight:700,fontSize:14.5,color:T.text }}>{i+1}. {p.label}</div>
                    <div style={{ fontSize:11,fontWeight:700,color:chip.c,background:chip.bg,padding:"4px 11px",borderRadius:12,whiteSpace:"nowrap" }}>{chip.t}</div>
                  </div>
                  <div style={{ fontSize:12.5,color:T.textSoft,marginTop:4,lineHeight:1.5 }}>{p.nota || DESC[p.id] || p.sublabel || ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT RAIL — se apila debajo en móvil ── */}
      {(
        <aside style={{ width:isMobile?"100%":320,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>
          {/* avance */}
          <div style={{ background:"#fff",borderRadius:18,padding:18,boxShadow:T.shadow }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
              <div style={{ fontSize:14,fontWeight:700,color:T.text }}>Tu avance del viaje</div>
              <div style={{ fontSize:13,fontWeight:700,color:T.primary }}>{pct}%</div>
            </div>
            <div style={{ height:9,background:T.softFill,borderRadius:20,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#A0435F,#C77D93)",borderRadius:20,transition:"width .5s" }}/>
            </div>
            <div style={{ fontSize:12,color:T.textSoft,marginTop:8 }}>{sellos} de {totalPasos} sellos conseguidos</div>
          </div>

          {/* próximo paso */}
          <div style={{ background:T.gradHero,borderRadius:18,padding:18,color:"#fff" }}>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:".08em",opacity:.9 }}>PRÓXIMO PASO</div>
            <div style={{ fontSize:15,fontWeight:700,marginTop:5 }}>{prox.title}</div>
            <div style={{ fontSize:12.5,opacity:.92,marginTop:6,lineHeight:1.5 }}>{prox.desc}</div>
            {prox.cta && (
              <button onClick={()=>router.push(prox.href)} style={{ marginTop:12,width:"100%",background:"#fff",color:T.primary,border:"none",borderRadius:12,padding:11,fontFamily:T.font,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7 }}>
                {prox.cta} <ArrowRight size={15}/>
              </button>
            )}
          </div>

          {/* documentación */}
          <div style={{ background:"#fff",borderRadius:18,padding:18,boxShadow:T.shadow }}>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:10 }}>
              <div style={{ width:34,height:34,borderRadius:10,background:T.lilac,color:T.primary,display:"flex",alignItems:"center",justifyContent:"center" }}><FileText size={17}/></div>
              <div style={{ fontSize:13.5,fontWeight:700,color:T.text }}>Tu documentación</div>
            </div>
            <div style={{ height:8,background:T.softFill,borderRadius:20,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${docs.total?Math.round(docs.count/docs.total*100):0}%`,background:"linear-gradient(90deg,#A0435F,#C77D93)",borderRadius:20 }}/>
            </div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8 }}>
              <div style={{ fontSize:12,color:T.textSoft }}>{docs.count} de {docs.total} cargados</div>
              <Link href="/dashboard/documentos" style={{ fontSize:12,fontWeight:700,color:T.primary,textDecoration:"none",display:"flex",alignItems:"center",gap:3 }}>Ver <ArrowRight size={13}/></Link>
            </div>
          </div>

          {/* asesora / reunión */}
          <div style={{ background:T.lilac,borderRadius:18,padding:18 }}>
            <div style={{ display:"flex",alignItems:"center",gap:9,color:T.primary,fontWeight:700,fontSize:13,marginBottom:6 }}><Calendar size={15}/> Tu próxima reunión</div>
            <div style={{ fontSize:12.5,color:T.textSoft,lineHeight:1.45 }}>{reunion ? `${reunion.fecha} · ${reunion.hora}` : "Aún no tienes una agendada. Reserva una llamada con tu asesora."}</div>
            <Link href="/dashboard/reuniones" style={{ display:"block",textAlign:"center",marginTop:12,background:"#fff",color:T.primary,borderRadius:12,padding:11,fontWeight:700,fontSize:13,textDecoration:"none" }}>Agendar reunión</Link>
          </div>

          {/* soporte */}
          <button onClick={()=>router.push("/dashboard/mensajes")} style={{ background:"#fff",borderRadius:18,padding:16,boxShadow:T.shadow,border:"none",cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",gap:11,textAlign:"left" }}>
            <div style={{ width:34,height:34,borderRadius:10,background:T.softFill,color:T.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><MessageCircle size={17}/></div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:T.text }}>¿Necesitas ayuda?</div>
              <div style={{ fontSize:11.5,color:T.textSoft }}>Escríbele a tu asesora</div>
            </div>
          </button>
        </aside>
      )}
    </div>
  );
}
