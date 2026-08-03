"use client";
// app/admin/mensajes/page.jsx

import { useEffect, useState, useRef } from "react";
import { Search, Send, CheckCheck, Check, Users } from "lucide-react";

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" });
  return d.toLocaleDateString("es-CO", { day:"2-digit", month:"short" });
}

export default function AdminMensajesPage() {
  const [conversaciones, setConversaciones] = useState([]);
  const [activa,         setActiva]         = useState(null);
  const [mensajes,       setMensajes]        = useState([]);
  const [texto,          setTexto]           = useState("");
  const [enviando,       setEnviando]        = useState(false);
  const [busqueda,       setBusqueda]        = useState("");
  const [loading,        setLoading]         = useState(true);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const cargarConversaciones = async () => {
    const r = await fetch("/api/admin/mensajes").catch(() => null);
    const d = await r?.json().catch(() => null);
    setConversaciones(d?.conversaciones || []);
    setLoading(false);
  };

  const cargarMensajes = async (usuarioId, silencioso = false) => {
    const r = await fetch(`/api/admin/mensajes?usuario_id=${usuarioId}`).catch(() => null);
    const d = await r?.json().catch(() => null);
    setMensajes(d?.mensajes || []);
    if (!silencioso) cargarConversaciones(); // actualizar badge no leídos
  };

  useEffect(() => {
    cargarConversaciones();
    pollRef.current = setInterval(() => {
      cargarConversaciones();
      if (activa) cargarMensajes(activa.id, true);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activa]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const seleccionar = (conv) => {
    setActiva(conv);
    setMensajes([]);
    cargarMensajes(conv.id);
  };

  const enviar = async () => {
    if (!texto.trim() || !activa || enviando) return;
    const txt = texto.trim();
    setTexto("");
    setEnviando(true);

    // Optimistic
    setMensajes(prev => [...prev, {
      id: Date.now(), remitente:"admin", contenido:txt,
      leido:0, created_at: new Date().toISOString(),
    }]);

    await fetch("/api/admin/mensajes", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ usuario_id: activa.id, contenido: txt }),
    });

    setEnviando(false);
    cargarMensajes(activa.id, true);
    cargarConversaciones();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const convsFiltradas = conversaciones.filter(c =>
    `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ height:"calc(100vh - 0px)", display:"flex", overflow:"hidden", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── LISTA CONVERSACIONES ── */}
      <div style={{ width:300, borderRight:"1px solid #F5E1E7", display:"flex", flexDirection:"column", background:"#fff", flexShrink:0 }}>
        {/* Header */}
        <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid #F5E1E7" }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#4A2A38", margin:"0 0 10px" }}>Mensajes</h2>
          <div style={{ position:"relative" }}>
            <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#C9A9B4" }}/>
            <input type="text" placeholder="Buscar estudiante..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{ width:"100%", paddingLeft:32, paddingRight:10, height:34, border:"1px solid #F5E1E7", borderRadius:10, fontSize:12, color:"#4A2A38", outline:"none", boxSizing:"border-box", background:"#FBF4F6" }}/>
          </div>
        </div>

        {/* Lista */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {loading ? (
            <div style={{ padding:40, textAlign:"center" }}>
              <div style={{ width:24, height:24, border:"2px solid #FCE8EE", borderTopColor:"#A0435F", borderRadius:"50%", margin:"0 auto", animation:"spin 1s linear infinite" }}/>
            </div>
          ) : convsFiltradas.length === 0 ? (
            <div style={{ padding:"32px 20px", textAlign:"center" }}>
              <Users size={32} style={{ color:"#C77D93", margin:"0 auto 10px", display:"block" }}/>
              <p style={{ fontSize:13, color:"#9C8790", margin:0 }}>
                {busqueda ? "Sin resultados" : "Sin conversaciones aún"}
              </p>
            </div>
          ) : convsFiltradas.map(c => (
            <div key={c.id} onClick={() => seleccionar(c)}
              style={{ display:"flex", gap:10, padding:"12px 16px", cursor:"pointer", borderBottom:"1px solid #FBEEF1", transition:"background .1s",
                background: activa?.id === c.id ? "#FCE8EE" : "#fff",
              }}
              onMouseEnter={e => { if (activa?.id !== c.id) e.currentTarget.style.background="#FBF4F6"; }}
              onMouseLeave={e => { if (activa?.id !== c.id) e.currentTarget.style.background="#fff"; }}>

              {/* Avatar */}
              <div style={{ width:40, height:40, borderRadius:"50%", background:"#FCE8EE", border:"1px solid #C77D93", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                {c.foto_url
                  ? <img src={c.foto_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : <span style={{ fontSize:14, fontWeight:700, color:"#A0435F" }}>{c.nombre?.[0]}</span>
                }
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:2 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#4A2A38", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {c.nombre} {c.apellido}
                  </p>
                  <span style={{ fontSize:10, color:"#C9A9B4", flexShrink:0, marginLeft:4 }}>{formatTime(c.ultimo_tiempo)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ fontSize:11, color:"#9C8790", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                    {c.ultimo_mensaje || "Sin mensajes"}
                  </p>
                  {Number(c.no_leidos) > 0 && (
                    <span style={{ background:"#A0435F", color:"#fff", fontSize:9, fontWeight:700, width:17, height:17, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:6 }}>
                      {c.no_leidos}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHAT ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#FBF4F6", minWidth:0 }}>
        {!activa ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
            <div style={{ fontSize:60, marginBottom:16 }}>💬</div>
            <p style={{ fontSize:16, fontWeight:600, color:"#4A2A38", margin:"0 0 6px" }}>Selecciona una conversación</p>
            <p style={{ fontSize:13, color:"#9C8790", margin:0 }}>Elige una estudiante de la lista para ver sus mensajes</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ background:"#fff", borderBottom:"1px solid #F5E1E7", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"#FCE8EE", border:"1px solid #C77D93", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                {activa.foto_url
                  ? <img src={activa.foto_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : <span style={{ fontSize:13, fontWeight:700, color:"#A0435F" }}>{activa.nombre?.[0]}</span>
                }
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:"#4A2A38", margin:0 }}>{activa.nombre} {activa.apellido}</p>
                <p style={{ fontSize:11, color:"#9C8790", margin:0 }}>{activa.email}</p>
              </div>
            </div>

            {/* Mensajes */}
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 8px", display:"flex", flexDirection:"column", gap:4 }}>
              {mensajes.length === 0 ? (
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <p style={{ fontSize:13, color:"#C9A9B4" }}>Sin mensajes aún. Sé el primero en escribir.</p>
                </div>
              ) : mensajes.map((m, i) => {
                const esAdmin  = m.remitente === "admin";
                const anterior = mensajes[i-1];
                const mismoRem = anterior?.remitente === m.remitente;
                return (
                  <div key={m.id} style={{ display:"flex", justifyContent:esAdmin?"flex-end":"flex-start", marginTop:mismoRem?2:8, animation:"fadeUp .15s ease" }}>
                    {!esAdmin && !mismoRem && (
                      <div style={{ width:26, height:26, borderRadius:"50%", background:"#FCE8EE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#A0435F", marginRight:6, flexShrink:0, alignSelf:"flex-end", marginBottom:2 }}>
                        {activa.nombre?.[0]}
                      </div>
                    )}
                    {!esAdmin && mismoRem && <div style={{ width:32, flexShrink:0 }}/>}
                    <div style={{ maxWidth:"68%", display:"flex", flexDirection:"column", alignItems:esAdmin?"flex-end":"flex-start" }}>
                      <div style={{
                        padding:"9px 13px",
                        borderRadius:esAdmin?"16px 16px 4px 16px":"16px 16px 16px 4px",
                        background:esAdmin?"#A0435F":"#fff",
                        color:esAdmin?"#fff":"#4A2A38",
                        fontSize:13, lineHeight:1.4,
                        boxShadow:"0 1px 2px rgba(0,0,0,.07)",
                      }}>
                        {m.contenido}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:3, marginTop:2 }}>
                        <span style={{ fontSize:10, color:"#C9A9B4" }}>{formatTime(m.created_at)}</span>
                        {esAdmin && (m.leido ? <CheckCheck size={11} style={{ color:"#A0435F" }}/> : <Check size={11} style={{ color:"#C9A9B4" }}/>)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div style={{ background:"#fff", borderTop:"1px solid #F5E1E7", padding:"10px 16px", display:"flex", gap:10, alignItems:"flex-end", flexShrink:0 }}>
              <textarea value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={handleKey}
                placeholder={`Responder a ${activa.nombre}...`} rows={1}
                style={{ flex:1, border:"1.5px solid #F5E1E7", borderRadius:12, padding:"9px 13px", fontSize:13, color:"#4A2A38", outline:"none", resize:"none", fontFamily:"inherit", maxHeight:100, overflowY:"auto", lineHeight:1.4 }}
                onFocus={e=>e.target.style.borderColor="#A0435F"}
                onBlur={e=>e.target.style.borderColor="#F5E1E7"}
              />
              <button onClick={enviar} disabled={!texto.trim()||enviando}
                style={{ width:40, height:40, borderRadius:12, border:"none", cursor:(!texto.trim()||enviando)?"not-allowed":"pointer", background:(!texto.trim()||enviando)?"#F5E1E7":"#A0435F", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                {enviando
                  ? <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
                  : <Send size={15} style={{ color:(!texto.trim()||enviando)?"#C9A9B4":"#fff" }}/>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}