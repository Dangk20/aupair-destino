"use client";
// app/dashboard/configuracion/page.jsx — Rediseño Panel Candidata (borgoña).
// Una sola columna (sin rail). Tabs: cuenta, notificaciones, seguridad, idioma, ayuda.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, User, Shield, Globe, HelpCircle, Settings, ChevronRight, Eye, EyeOff, Check, AlertTriangle, Lock, MessageCircle, Calendar, FolderOpen, GraduationCap, X,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";

function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} style={{ width:44, height:24, borderRadius:99, background:value?T.primary:"#E0CDD4", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?23:3, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.15)" }}/>
    </div>
  );
}

function CampoEditable({ label, valor, campo, tipo="text", onGuardar, loading, isMobile }) {
  const [editando, setEditando] = useState(false);
  const [temp,     setTemp]     = useState(valor||"");
  const guardar  = async () => { await onGuardar({[campo]:temp}); setEditando(false); };
  const cancelar = () => { setTemp(valor||""); setEditando(false); };

  if (editando) return (
    <div style={{ padding:"12px 0", borderBottom:`1px solid ${T.softFill}` }}>
      <p style={{ fontSize:11, fontWeight:700, color:T.textSoft, textTransform:"uppercase", letterSpacing:".5px", margin:"0 0 8px" }}>{label}</p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <input type={tipo} value={temp} onChange={e=>setTemp(e.target.value)}
          style={{ flex:1, minWidth:120, border:`1.5px solid ${T.primary}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", fontFamily:T.font, background:"#fff" }} autoFocus/>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={guardar} disabled={loading} style={{ padding:"9px 14px", borderRadius:10, border:"none", background:T.primary, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:T.font }}>{loading?"...":"Guardar"}</button>
          <button onClick={cancelar} style={{ padding:"9px 12px", borderRadius:10, border:`1.5px solid ${T.border}`, background:"#fff", color:T.textSoft, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:T.font }}><X size={13}/></button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 0", borderBottom:`1px solid ${T.softFill}` }}>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:11, color:T.textSoft, margin:"0 0 1px" }}>{label}</p>
        <p style={{ fontSize:13, fontWeight:500, color:T.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:isMobile?180:340 }}>{valor||"—"}</p>
      </div>
      <button onClick={()=>{ setTemp(valor||""); setEditando(true); }}
        style={{ padding:"6px 14px", borderRadius:9, border:`1.5px solid ${T.border}`, background:"#fff", color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:T.font, flexShrink:0 }}>Editar</button>
    </div>
  );
}

const TABS = [
  { id:"cuenta",         icon:User,       label:"Mi cuenta",       labelShort:"Cuenta" },
  { id:"notificaciones", icon:Bell,       label:"Notificaciones",  labelShort:"Notif." },
  { id:"seguridad",      icon:Shield,     label:"Seguridad",       labelShort:"Seguridad" },
  { id:"idioma",         icon:Globe,      label:"Idioma y región", labelShort:"Idioma" },
  { id:"ayuda",          icon:HelpCircle, label:"Ayuda y soporte", labelShort:"Ayuda" },
];

export default function ConfiguracionPage() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [config,  setConfig]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState("cuenta");
  const [toast,   setToast]   = useState(null);

  const [passActual,setPassActual]=useState(""); const [passNuevo,setPassNuevo]=useState(""); const [passConfirm,setPassConfirm]=useState("");
  const [showPA,setShowPA]=useState(false); const [showPN,setShowPN]=useState(false); const [showPC,setShowPC]=useState(false);
  const [modalEliminar,setModalEliminar]=useState(false); const [passEliminar,setPassEliminar]=useState(""); const [showPE,setShowPE]=useState(false);

  const showToast=(msg,tipo="ok")=>{ setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    fetch("/api/dashboard/configuracion").then(r=>r.json()).then(cfg=>{ if(cfg?.config) setConfig(cfg.config); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const guardar=async(campos)=>{ setSaving(true);
    const res=await fetch("/api/dashboard/configuracion",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(campos)});
    const data=await res.json();
    if(res.ok){ setConfig(c=>({...c,...campos})); showToast("Cambios guardados"); } else showToast(data.error||"Error al guardar","error"); setSaving(false); };

  const cambiarPassword=async(e)=>{ e.preventDefault();
    if(passNuevo!==passConfirm){ showToast("Las contraseñas no coinciden","error"); return; }
    if(passNuevo.length<8){ showToast("Mínimo 8 caracteres","error"); return; }
    setSaving(true);
    const res=await fetch("/api/dashboard/configuracion",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({accion:"cambiar_password",password_actual:passActual,password_nuevo:passNuevo})});
    const data=await res.json();
    if(res.ok){ showToast("Contraseña actualizada"); setPassActual(""); setPassNuevo(""); setPassConfirm(""); } else showToast(data.error||"Error","error"); setSaving(false); };

  const eliminarCuenta=async()=>{ setSaving(true);
    const res=await fetch("/api/dashboard/configuracion",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({accion:"eliminar_cuenta",password_confirm:passEliminar})});
    const data=await res.json();
    if(res.ok){ showToast("Cuenta eliminada"); setTimeout(()=>router.push("/login"),1500); } else showToast(data.error||"Contraseña incorrecta","error"); setSaving(false); };

  if (loading) return (
    <div style={{ minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font }}>
      <div style={{ width:40,height:40,border:`3px solid ${T.lilac}`,borderTopColor:T.primary,borderRadius:"50%",animation:"dapspin 1s linear infinite" }}/>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const c = config||{};
  const selectStyle = { flex:1, border:`1.5px solid ${T.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:T.text, background:"#fff", outline:"none", fontFamily:T.font, cursor:"pointer", width:"100%" };
  const SecIcon = ({ Icon }) => <div style={{ width:isMobile?40:52, height:isMobile?40:52, borderRadius:14, background:T.lilac, color:T.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon size={isMobile?18:22}/></div>;

  return (
    <div style={{ fontFamily:T.font, color:T.text, padding:isMobile?"16px 16px 90px":"28px 30px", maxWidth:860, margin:"0 auto", width:"100%", display:"flex", flexDirection:"column", gap:18 }}>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>

      {toast && <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:3000,background:toast.tipo==="error"?"#C0392B":T.ink,color:"#fff",padding:"12px 20px",borderRadius:12,fontSize:13,fontWeight:600 }}>{toast.msg}</div>}

      {/* Modal eliminar */}
      {modalEliminar && (
        <div style={{ position:"fixed",inset:0,background:"rgba(58,37,48,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setModalEliminar(false)}>
          <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:420,padding:isMobile?20:30 }}>
            <div style={{ width:52,height:52,borderRadius:"50%",background:"#FDECEC",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}><AlertTriangle size={24} style={{ color:"#C0392B" }}/></div>
            <h3 style={{ fontSize:17,fontWeight:700,color:T.ink,textAlign:"center",margin:"0 0 8px" }}>¿Eliminar tu cuenta?</h3>
            <p style={{ fontSize:13,color:T.textSoft,textAlign:"center",margin:"0 0 18px",lineHeight:1.6 }}>Esta acción es permanente. Se eliminarán todos tus datos, documentos y progreso.</p>
            <label style={{ fontSize:11,fontWeight:700,color:T.text,textTransform:"uppercase",letterSpacing:".7px",display:"block",marginBottom:6 }}>Confirma tu contraseña</label>
            <div style={{ position:"relative",marginBottom:14 }}>
              <input type={showPE?"text":"password"} value={passEliminar} onChange={e=>setPassEliminar(e.target.value)} placeholder="••••••••" autoFocus
                style={{ width:"100%",border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 40px 10px 14px",fontSize:13,color:T.text,outline:"none",fontFamily:T.font,boxSizing:"border-box" }}/>
              <button type="button" onClick={()=>setShowPE(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textSoft }}>{showPE?<EyeOff size={15}/>:<Eye size={15}/>}</button>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>{setModalEliminar(false);setPassEliminar("");}} style={{ flex:1,padding:11,borderRadius:12,border:`1.5px solid ${T.border}`,background:"#fff",color:T.textSoft,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.font }}>Cancelar</button>
              <button onClick={eliminarCuenta} disabled={!passEliminar||saving} style={{ flex:1,padding:11,borderRadius:12,border:"none",background:"#C0392B",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:T.font,opacity:!passEliminar?.5:1 }}>{saving?"Eliminando...":"Sí, eliminar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
        <div>
          <div style={{ fontSize:isMobile?21:26,fontWeight:700,color:T.text,lineHeight:1.1 }}>Configuración</div>
          <div style={{ fontSize:13.5,color:T.textSoft,marginTop:3 }}>Administra tus preferencias y ajustes de cuenta.</div>
        </div>
        <button style={{ width:42,height:42,borderRadius:12,background:"#fff",border:"none",display:"flex",alignItems:"center",justifyContent:"center",color:T.primary,cursor:"pointer",position:"relative",flexShrink:0 }}>
          <Settings size={19}/>
        </button>
      </div>

      {/* card con tabs */}
      <div style={{ background:"#fff",borderRadius:20,boxShadow:T.shadow,overflow:"hidden" }}>
        <div style={{ display:"flex",borderBottom:`1px solid ${T.border}`,overflowX:"auto" }}>
          {TABS.map(t => { const TIcon=t.icon, active=tab===t.id; return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ display:"flex",alignItems:"center",gap:isMobile?5:7,padding:isMobile?"12px 12px":"15px 20px",border:"none",background:"none",cursor:"pointer",fontSize:isMobile?11:13,fontWeight:active?700:600,fontFamily:T.font,whiteSpace:"nowrap",flexShrink:0,color:active?T.primary:T.textSoft,borderBottom:active?`2px solid ${T.primary}`:"2px solid transparent" }}>
              <TIcon size={isMobile?13:15}/>{isMobile?t.labelShort:t.label}
            </button>
          ); })}
        </div>

        <div style={{ padding:isMobile?16:"24px 28px" }}>
          {/* ══ CUENTA ══ */}
          {tab==="cuenta" && (<>
            <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:20,marginBottom:24 }}>
              <SecIcon Icon={User}/>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.text,margin:"0 0 3px" }}>Información personal</h3>
                <p style={{ fontSize:12,color:T.textSoft,margin:"0 0 14px" }}>Actualiza tu información básica.</p>
                <CampoEditable label="Nombre completo"     valor={`${c.nombre||""} ${c.apellido||""}`.trim()} campo="nombre" onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                <CampoEditable label="Correo electrónico"  valor={c.email} campo="email" tipo="email" onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                <CampoEditable label="Teléfono"            valor={c.telefono} campo="telefono" tipo="tel" onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                <CampoEditable label="Fecha de nacimiento" valor={c.fecha_nacimiento?.split?.("T")[0]} campo="fecha_nacimiento" tipo="date" onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                <CampoEditable label="País de residencia"  valor={c.pais} campo="pais" onGuardar={guardar} loading={saving} isMobile={isMobile}/>
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:20,marginBottom:24 }}>
              <SecIcon Icon={Settings}/>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.text,margin:"0 0 3px" }}>Preferencias de la plataforma</h3>
                <p style={{ fontSize:12,color:T.textSoft,margin:"0 0 14px" }}>Personaliza tu experiencia.</p>
                {[
                  { label:"Zona horaria",campo:"zona_horaria",opts:["America/Bogota","America/Mexico_City","America/New_York","America/Los_Angeles","Europe/Madrid"],display:{"America/Bogota":"(GMT-5) Bogotá","America/Mexico_City":"(GMT-6) México","America/New_York":"(GMT-5) Miami","America/Los_Angeles":"(GMT-8) Los Ángeles","Europe/Madrid":"(GMT+1) España"} },
                  { label:"Formato de fecha",campo:"formato_fecha",opts:["DD/MM/AAAA","MM/DD/AAAA","AAAA-MM-DD"] },
                  { label:"Idioma de la plataforma",campo:"idioma_plataforma",opts:["Español","English","Português"] },
                ].map(f=>(
                  <div key={f.campo} style={{ padding:"10px 0",borderBottom:`1px solid ${T.softFill}` }}>
                    <p style={{ fontSize:11,color:T.textSoft,margin:"0 0 6px" }}>{f.label}</p>
                    <select value={c[f.campo]||f.opts[0]} onChange={e=>guardar({[f.campo]:e.target.value})} style={selectStyle}>
                      {f.opts.map(o=><option key={o} value={o}>{f.display?.[o]||o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:20 }}>
              <SecIcon Icon={Shield}/>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.text,margin:"0 0 3px" }}>Privacidad</h3>
                <p style={{ fontSize:12,color:T.textSoft,margin:"0 0 14px" }}>Tú tienes el control de tu información.</p>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"12px 0",borderTop:`1px solid ${T.softFill}`,flexWrap:"wrap" }}>
                  <div>
                    <p style={{ fontSize:13,fontWeight:600,color:"#C0392B",margin:0 }}>Eliminar cuenta</p>
                    <p style={{ fontSize:11,color:T.textSoft,margin:0 }}>Acción permanente e irreversible</p>
                  </div>
                  <button onClick={()=>setModalEliminar(true)} style={{ padding:"7px 14px",borderRadius:10,border:"1.5px solid #F6C9C9",background:"#FDECEC",color:"#C0392B",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font,flexShrink:0 }}>Eliminar</button>
                </div>
              </div>
            </div>
          </>)}

          {/* ══ NOTIFICACIONES ══ */}
          {tab==="notificaciones" && (
            <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:20 }}>
              <SecIcon Icon={Bell}/>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.text,margin:"0 0 3px" }}>Preferencias de notificaciones</h3>
                <p style={{ fontSize:12,color:T.textSoft,margin:"0 0 14px" }}>Controla qué notificaciones quieres recibir.</p>
                {[
                  { campo:"notif_email",label:"Notificaciones por email",desc:"Recibe actualizaciones por correo" },
                  { campo:"notif_plataforma",label:"Notificaciones en plataforma",desc:"Alertas y mensajes en el dashboard" },
                  { campo:"notif_mensajes",label:"Nuevos mensajes",desc:"Cuando el equipo te envíe un mensaje" },
                  { campo:"notif_reuniones",label:"Recordatorios de reuniones",desc:"Antes de tus reuniones agendadas" },
                ].map(n=>(
                  <div key={n.campo} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.softFill}`,gap:12 }}>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:13,fontWeight:600,color:T.text,margin:"0 0 1px" }}>{n.label}</p>
                      <p style={{ fontSize:11,color:T.textSoft,margin:0 }}>{n.desc}</p>
                    </div>
                    <Toggle value={!!c[n.campo]} onChange={()=>guardar({[n.campo]:c[n.campo]?0:1})}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ SEGURIDAD ══ */}
          {tab==="seguridad" && (
            <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:20 }}>
              <SecIcon Icon={Lock}/>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.text,margin:"0 0 3px" }}>Cambiar contraseña</h3>
                <p style={{ fontSize:12,color:T.textSoft,margin:"0 0 14px" }}>Usa una contraseña segura de al menos 8 caracteres.</p>
                <form onSubmit={cambiarPassword} style={{ display:"flex",flexDirection:"column",gap:12,maxWidth:420 }}>
                  {[
                    { label:"Contraseña actual",val:passActual,set:setPassActual,show:showPA,setShow:setShowPA },
                    { label:"Nueva contraseña",val:passNuevo,set:setPassNuevo,show:showPN,setShow:setShowPN },
                    { label:"Confirmar nueva contraseña",val:passConfirm,set:setPassConfirm,show:showPC,setShow:setShowPC },
                  ].map(f=>(
                    <div key={f.label}>
                      <label style={{ fontSize:11,fontWeight:700,color:T.text,textTransform:"uppercase",letterSpacing:".7px",display:"block",marginBottom:6 }}>{f.label}</label>
                      <div style={{ position:"relative" }}>
                        <Lock size={13} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.textSoft }}/>
                        <input type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)} required placeholder="••••••••"
                          style={{ width:"100%",border:`1.5px solid ${T.border}`,borderRadius:12,padding:"10px 40px 10px 34px",fontSize:13,color:T.text,outline:"none",fontFamily:T.font,boxSizing:"border-box" }}/>
                        <button type="button" onClick={()=>f.setShow(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textSoft }}>{f.show?<EyeOff size={14}/>:<Eye size={14}/>}</button>
                      </div>
                    </div>
                  ))}
                  {passNuevo&&passNuevo.length>=8&&passNuevo===passConfirm&&(
                    <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.primary,fontWeight:600 }}><Check size={13}/> Las contraseñas coinciden</div>
                  )}
                  <button type="submit" disabled={saving||!passActual||!passNuevo||!passConfirm}
                    style={{ padding:12,borderRadius:12,border:"none",background:T.primary,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:T.font,opacity:(!passActual||!passNuevo||!passConfirm)?.5:1 }}>{saving?"Actualizando...":"Actualizar contraseña"}</button>
                </form>
              </div>
            </div>
          )}

          {/* ══ IDIOMA ══ */}
          {tab==="idioma" && (
            <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:20 }}>
              <SecIcon Icon={Globe}/>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.text,margin:"0 0 3px" }}>Idioma y región</h3>
                <p style={{ fontSize:12,color:T.textSoft,margin:"0 0 14px" }}>Configura tu idioma y preferencias regionales.</p>
                {[
                  { label:"Idioma de la plataforma",campo:"idioma_plataforma",opts:["Español","English","Português"] },
                  { label:"Zona horaria",campo:"zona_horaria",opts:["America/Bogota","America/Mexico_City","America/New_York","America/Los_Angeles","Europe/Madrid"],display:{"America/Bogota":"(GMT-5) Bogotá","America/Mexico_City":"(GMT-6) México","America/New_York":"(GMT-5) Miami","America/Los_Angeles":"(GMT-8) Los Ángeles","Europe/Madrid":"(GMT+1) España"} },
                  { label:"Formato de fecha",campo:"formato_fecha",opts:["DD/MM/AAAA","MM/DD/AAAA","AAAA-MM-DD"] },
                ].map(f=>(
                  <div key={f.campo} style={{ padding:"10px 0",borderBottom:`1px solid ${T.softFill}` }}>
                    <p style={{ fontSize:11,color:T.textSoft,margin:"0 0 6px" }}>{f.label}</p>
                    <select value={c[f.campo]||f.opts[0]} onChange={e=>guardar({[f.campo]:e.target.value})} style={selectStyle}>
                      {f.opts.map(o=><option key={o} value={o}>{f.display?.[o]||o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ AYUDA ══ */}
          {tab==="ayuda" && (
            <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:20 }}>
              <SecIcon Icon={HelpCircle}/>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.text,margin:"0 0 3px" }}>Ayuda y soporte</h3>
                <p style={{ fontSize:12,color:T.textSoft,margin:"0 0 14px" }}>¿Necesitas ayuda? Estamos aquí para ti.</p>
                {[
                  { icon:MessageCircle,titulo:"Escribir a soporte",desc:"Te responderemos a la brevedad.",link:"/dashboard/mensajes",label:"Ir a mensajes" },
                  { icon:Calendar,titulo:"Agendar una reunión",desc:"Sesión con tu asesora para resolver dudas.",link:"/dashboard/reuniones",label:"Agendar" },
                  { icon:FolderOpen,titulo:"Centro de recursos",desc:"Guías, videos y documentos de ayuda.",link:"/dashboard/recursos",label:"Ver recursos" },
                  { icon:GraduationCap,titulo:"Ver el curso",desc:"Continúa con tus lecciones del programa.",link:"/dashboard/curso",label:"Ir al curso" },
                ].map((a,i,arr)=>{ const Ic=a.icon; return (
                  <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"12px 0",borderBottom:i<arr.length-1?`1px solid ${T.softFill}`:"none",flexWrap:isMobile?"wrap":"nowrap" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0 }}>
                      <div style={{ width:isMobile?36:44,height:isMobile?36:44,borderRadius:12,background:T.lilac,color:T.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic size={isMobile?17:20}/></div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:13,fontWeight:600,color:T.text,margin:"0 0 1px" }}>{a.titulo}</p>
                        {!isMobile&&<p style={{ fontSize:11,color:T.textSoft,margin:0 }}>{a.desc}</p>}
                      </div>
                    </div>
                    <Link href={a.link} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:10,border:`1.5px solid ${T.border}`,background:"#fff",color:T.primary,fontSize:12,fontWeight:600,textDecoration:"none",flexShrink:0 }}>{a.label} <ChevronRight size={12}/></Link>
                  </div>
                ); })}
                <div style={{ marginTop:20,background:T.lilac,borderRadius:14,padding:"14px 16px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                    <Shield size={16} style={{ color:T.primary }}/>
                    <p style={{ fontSize:13,fontWeight:700,color:T.ink,margin:0 }}>Tu seguridad es importante</p>
                  </div>
                  <p style={{ fontSize:12,color:T.textSoft,margin:0,lineHeight:1.6 }}>Nunca compartimos tu información personal con terceros.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
