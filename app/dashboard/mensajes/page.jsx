"use client";
// app/dashboard/mensajes/page.jsx

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Bell, Calendar, ArrowRight, CheckCheck, Check, ChevronDown, ChevronUp } from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";
import { useMobile } from "@/context/MobileContext";

function formatTime(ts) {
  if (!ts) return "";
  const d=new Date(ts), now=new Date(), diff=now-d;
  if (diff<60000) return "Ahora";
  if (diff<3600000) return `Hace ${Math.floor(diff/60000)} min`;
  if (d.toDateString()===now.toDateString()) return d.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
  return d.toLocaleDateString("es-CO",{day:"2-digit",month:"short"});
}

const TEMAS = [
  "¿Cómo completo mi evaluación de perfil?",
  "¿Cuánto tarda el proceso de visa?",
  "¿Qué documentos necesito subir?",
  "¿Cómo funciona el matching con familias?",
  "¿Cuándo puedo agendar mi primera reunión?",
];

export default function MensajesPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user,     setUser]     = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto,    setTexto]    = useState("");
  const [loading,  setLoading]  = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [showTemas,setShowTemas]= useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const pollRef    = useRef(null);

  const cargar = async(silencioso=false) => {
    if (!silencioso) setLoading(true);
    try {
      const [me,msgs] = await Promise.all([
        fetch("/api/auth/me").then(r=>r.json()).catch(()=>({user:null})),
        fetch("/api/dashboard/mensajes").then(r=>r.json()).catch(()=>({mensajes:[]})),
      ]);
      if (me?.user?.rol==="admin") { router.push("/admin/mensajes"); return; }
      setUser(me?.user||null);
      setMensajes(msgs.mensajes||[]);
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    pollRef.current = setInterval(()=>cargar(true),5000);
    return ()=>clearInterval(pollRef.current);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [mensajes]);

  const enviar = async() => {
    if (!texto.trim()||enviando) return;
    const txt=texto.trim(); setTexto(""); setEnviando(true);
    setMensajes(prev=>[...prev,{id:Date.now(),remitente:"usuario",contenido:txt,leido:0,created_at:new Date().toISOString()}]);
    await fetch("/api/dashboard/mensajes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contenido:txt})});
    setEnviando(false);
    await cargar(true);
    inputRef.current?.focus();
  };

  const handleKey = e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); enviar(); } };
  const usarTema  = t => { setTexto(t); setShowTemas(false); inputRef.current?.focus(); };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #e8849a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",fontFamily:"system-ui,-apple-system,sans-serif",display:"flex",flexDirection:"column" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #ece8f0",padding:isMobile?"12px 16px":"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexShrink:0 }}>
        <div style={{ minWidth:0 }}>
          <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?18:22,fontWeight:700,color:"#1e1033",margin:0 }}>¡Hola, {user?.nombre}! 👋</h1>
          {!isMobile&&<p style={{ fontSize:13,color:"#9a7080",margin:"2px 0 0" }}>Estamos aquí para ayudarte. 💜</p>}
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

      <div style={{ flex:1,maxWidth:1400,width:"100%",margin:"0 auto",padding:isMobile?"12px 16px 16px":"20px 24px 24px",display:"flex",gap:20,minHeight:0,flexDirection:isMobile?"column":"row" }}>

        {/* CHAT */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",background:"#fff",borderRadius:20,border:"1px solid #ece4f0",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)",minHeight:0,height:isMobile?"calc(100vh - 140px)":"auto" }}>

          {/* Chat header */}
          <div style={{ padding:isMobile?"12px 16px":"14px 20px",borderBottom:"1px solid #f0e8f8",display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
            <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#a0435f)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <span style={{ fontSize:16 }}>✈️</span>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:0 }}>Destino Au Pair</p>
              <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:"#10b981" }}/>
                <p style={{ fontSize:11,color:"#10b981",margin:0,fontWeight:600 }}>En línea · Responde en menos de 24h</p>
              </div>
            </div>
            {/* Botón temas en mobile */}
            {isMobile && (
              <button onClick={()=>setShowTemas(s=>!s)}
                style={{ display:"flex",alignItems:"center",gap:4,padding:"6px 12px",borderRadius:99,border:"1px solid #ede9fe",background:"#f5f0ff",color:"#7c3aed",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}>
                💡 Temas {showTemas?<ChevronUp size={12}/>:<ChevronDown size={12}/>}
              </button>
            )}
          </div>

          {/* Temas frecuentes — mobile desplegable */}
          {isMobile && showTemas && (
            <div style={{ padding:"10px 16px",borderBottom:"1px solid #f0e8f8",background:"#faf5ff" }}>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {TEMAS.map((t,i)=>(
                  <button key={i} onClick={()=>usarTema(t)}
                    style={{ background:"#fff",border:"1px solid #ede9fe",borderRadius:10,padding:"6px 10px",fontSize:11,color:"#5b21b6",cursor:"pointer",fontFamily:"inherit",textAlign:"left" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensajes */}
          <div style={{ flex:1,overflowY:"auto",padding:isMobile?"14px 14px 8px":"20px 20px 8px",display:"flex",flexDirection:"column",gap:4 }}>
            {mensajes.length===0 ? (
              <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"40px 20px" }}>
                <div style={{ fontSize:44,marginBottom:12 }}>💬</div>
                <p style={{ fontSize:14,fontWeight:600,color:"#1e1033",margin:"0 0 6px" }}>¡Bienvenida!</p>
                <p style={{ fontSize:13,color:"#9a7080",margin:0,maxWidth:260,lineHeight:1.5 }}>
                  Este es tu canal directo con Destino Au Pair. Escríbenos cualquier duda 💕
                </p>
              </div>
            ) : (
              <>
                <div style={{ textAlign:"center",margin:"6px 0" }}>
                  <span style={{ fontSize:11,color:"#9ca3af",background:"#f3f4f6",padding:"3px 10px",borderRadius:99 }}>
                    Inicio de la conversación
                  </span>
                </div>
                {mensajes.map((m,i) => {
                  const esUsuaria=m.remitente==="usuario";
                  const anterior=mensajes[i-1];
                  const mismoRem=anterior?.remitente===m.remitente;
                  const anteriorDia=anterior?new Date(anterior.created_at).toDateString():null;
                  const esteDia=new Date(m.created_at).toDateString();
                  const showFecha=anterior&&anteriorDia!==esteDia;
                  return (
                    <div key={m.id}>
                      {showFecha&&(
                        <div style={{ textAlign:"center",margin:"10px 0 4px" }}>
                          <span style={{ fontSize:11,color:"#9ca3af",background:"#f3f4f6",padding:"3px 10px",borderRadius:99 }}>
                            {new Date(m.created_at).toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}
                          </span>
                        </div>
                      )}
                      <div style={{ display:"flex",justifyContent:esUsuaria?"flex-end":"flex-start",marginTop:mismoRem?2:6,animation:"fadeUp .2s ease" }}>
                        {!esUsuaria&&!mismoRem&&(
                          <div style={{ width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#a0435f)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:5,flexShrink:0,alignSelf:"flex-end",marginBottom:2 }}>✈️</div>
                        )}
                        {!esUsuaria&&mismoRem&&<div style={{ width:31,flexShrink:0 }}/>}
                        <div style={{ maxWidth:isMobile?"80%":"72%",display:"flex",flexDirection:"column",alignItems:esUsuaria?"flex-end":"flex-start" }}>
                          <div style={{ padding:isMobile?"9px 12px":"10px 14px",borderRadius:esUsuaria?"18px 18px 4px 18px":"18px 18px 18px 4px",background:esUsuaria?"linear-gradient(135deg,#7c3aed,#a0435f)":"#f3f4f6",color:esUsuaria?"#fff":"#1e1033",fontSize:13,lineHeight:1.45,boxShadow:"0 1px 2px rgba(0,0,0,.08)" }}>
                            {m.contenido}
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:3,marginTop:2 }}>
                            <span style={{ fontSize:10,color:"#9ca3af" }}>{formatTime(m.created_at)}</span>
                            {esUsuaria&&(m.leido?<CheckCheck size={11} style={{ color:"#7c3aed" }}/>:<Check size={11} style={{ color:"#9ca3af" }}/>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </>
            )}
          </div>

          {/* Input */}
          <div style={{ padding:isMobile?"10px 14px":"12px 16px",borderTop:"1px solid #f0e8f8",display:"flex",gap:8,alignItems:"flex-end",flexShrink:0 }}>
            <textarea ref={inputRef} value={texto} onChange={e=>setTexto(e.target.value)} onKeyDown={handleKey}
              placeholder="Escribe un mensaje... (Enter para enviar)"
              rows={1}
              style={{ flex:1,border:"1.5px solid #e5e7eb",borderRadius:14,padding:isMobile?"9px 12px":"10px 14px",fontSize:13,color:"#1e1033",outline:"none",resize:"none",fontFamily:"inherit",maxHeight:100,overflowY:"auto",lineHeight:1.45,transition:"border-color .15s" }}
              onFocus={e=>e.target.style.borderColor="#7c3aed"}
              onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            <button onClick={enviar} disabled={!texto.trim()||enviando}
              style={{ width:40,height:40,borderRadius:12,border:"none",cursor:(!texto.trim()||enviando)?"not-allowed":"pointer",background:(!texto.trim()||enviando)?"#e5e7eb":"linear-gradient(135deg,#7c3aed,#a0435f)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0 }}>
              {enviando?<div style={{ width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>:<Send size={16} style={{ color:(!texto.trim()||enviando)?"#9ca3af":"#fff" }}/>}
            </button>
          </div>
        </div>

        {/* SIDEBAR — solo desktop */}
        {!isMobile && (
          <aside style={{ width:260,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ background:"linear-gradient(135deg,#7c3aed15,#ede9fe)",border:"1px solid #c4b5fd",borderRadius:20,padding:18 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <div style={{ width:36,height:36,borderRadius:12,background:"linear-gradient(135deg,#7c3aed,#a0435f)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>✈️</div>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:"#5b21b6",margin:0 }}>Equipo Destino Au Pair</p>
                  <p style={{ fontSize:11,color:"#7c3aed",margin:0 }}>Responde en menos de 24h</p>
                </div>
              </div>
              <p style={{ fontSize:12,color:"#6b4a9a",margin:0,lineHeight:1.5 }}>
                Escríbenos cualquier duda sobre tu proceso. Estamos aquí para acompañarte. 💕
              </p>
            </div>
            <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:18 }}>
              <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:"0 0 12px" }}>Temas frecuentes</h3>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {TEMAS.map((t,i)=>(
                  <button key={i} onClick={()=>usarTema(t)}
                    style={{ textAlign:"left",background:"#faf5ff",border:"1px solid #ede9fe",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#5b21b6",cursor:"pointer",fontFamily:"inherit",transition:"all .12s" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <HelpCard onContact={()=>{}}/>
          </aside>
        )}
      </div>
    </div>
  );
}