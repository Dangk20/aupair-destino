"use client";
// app/dashboard/proceso/page.jsx — Mi Destino (pasaporte / sellos de viaje).
// Rediseño Panel Candidata (borgoña). Dos columnas: pasaporte + timeline · rail derecho.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Star, Globe, Award, ArrowRight, FileText, Calendar, MessageCircle } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { proximasReuniones } from "@/lib/reuniones";
import { proximoPasoCandidata } from "@/lib/proximo-paso";
import { useContacto, enlaceAgendar } from "@/components/dashboard/useContacto";
import LineaDeTiempo from "@/components/perfil/LineaDeTiempo";
import { etapaPorId } from "@/lib/etapas-candidata";


export default function MiDestinoPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const contacto = useContacto();
  const [user,setUser]=useState(null); const [pasos,setPasos]=useState([]); const [proceso,setProceso]=useState(null);
  const [reunion,setReunion]=useState(null); const [docs,setDocs]=useState({count:0,total:0});
  const [loading,setLoading]=useState(true);
  // Etapa, agencia e historial: la línea de tiempo compartida con la ficha.
  const [recorrido,setRecorrido]=useState(null);

  useEffect(() => {
    const safe=(p,fb=null)=>p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"),{user:null}),
      safe(fetch("/api/dashboard/proceso"),null),
      safe(fetch("/api/dashboard/reuniones"),null),
      safe(fetch("/api/dashboard/documentos"),{docs:[],docs_requeridos:[]}),
      safe(fetch("/api/dashboard/historial"),null),
    ]).then(([me,proc,reu,dd,hist])=>{
      setRecorrido(hist);
      setUser(me?.user||null); setPasos(proc?.pasos||[]); setProceso(proc); setReunion(proximasReuniones(reu?.reuniones||[]));
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
  // La misma regla que el inicio (lib/proximo-paso.js).
  const prox = proximoPasoCandidata({
    cursoCompleto: !!proceso?.curso_completo,
    tieneAcceso,
    perfilListo: pasos.find(p=>p.id==="perfil")?.status==="completado",
    docsListos: docs.total>0 && docs.count>=docs.total,
    proceso,
  });
  const agendar = enlaceAgendar(contacto.whatsapp, user?.nombre);

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
            <div><div style={{ fontSize:11,opacity:.65 }}>ETAPA ACTUAL</div><div style={{ fontWeight:700,fontSize:15,marginTop:2 }}>{etapaPorId(recorrido?.etapa)?.label||actual?.label||"—"}</div></div>
            <div><div style={{ fontSize:11,opacity:.65 }}>SELLOS</div><div style={{ fontWeight:700,fontSize:15,marginTop:2 }}>{sellos} / {totalPasos}</div></div>
          </div>
        </div>

        {/* EL RECORRIDO — la misma línea de tiempo que ve el equipo en tu ficha */}
        <div style={{ fontSize:15,fontWeight:700,color:T.text }}>Tu recorrido</div>
        <div style={{ background:"#fff",borderRadius:20,padding:isMobile?16:22,boxShadow:T.shadow }}>
          {recorrido
            ? <LineaDeTiempo etapa={recorrido.etapa} agencia={recorrido.agencia?.nombre} historial={recorrido.historial} modo="propio"/>
            : <div style={{ fontSize:13,color:T.textSoft }}>No pudimos cargar tu recorrido. Intenta de nuevo en un momento.</div>}
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
            <div style={{ display:"flex",alignItems:"center",gap:9,color:T.primary,fontWeight:700,fontSize:13,marginBottom:6 }}><Calendar size={15}/> {reunion?.length > 1 ? "Tus próximas reuniones" : "Tu próxima reunión"}</div>
            <div style={{ fontSize:12.5,color:T.textSoft,lineHeight:1.45 }}>{reunion?.length ? reunion.map((r) => (
                <div key={r.id} style={{ background:"#fff", borderRadius:12, padding:"9px 11px", marginTop:6 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:T.ink }}>{r.fecha.charAt(0).toUpperCase() + r.fecha.slice(1)}</div>
                  <div style={{ fontSize:11.5, color:T.textSoft }}>{r.hora}{r.con ? ` · con ${r.con}` : ""}</div>
                </div>
              )) : "Aún no tienes una agendada. Reserva una llamada con tu asesora."}</div>
            <a href={agendar.href} target={agendar.externo?"_blank":undefined} rel="noopener noreferrer" style={{ display:"block", textAlign:"center", marginTop:12, background:"#fff", color:T.primary, borderRadius:12, padding:11, fontWeight:700, fontSize:13, textDecoration:"none" }}>{reunion?.length ? "Agendar otra reunión" : "Agendar reunión"}</a>
          </div>

          {/* soporte */}
          <button onClick={()=>window.dispatchEvent(new Event("dap:abrir-chat"))} style={{ background:"#fff",borderRadius:18,padding:16,boxShadow:T.shadow,border:"none",cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",gap:11,textAlign:"left" }}>
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
