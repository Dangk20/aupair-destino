"use client";
// app/dashboard/configuracion/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, User, Shield, Globe, HelpCircle,
  ChevronRight, Eye, EyeOff, Check, AlertTriangle, Lock,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} style={{ width:44, height:24, borderRadius:99, background:value?"#7c3aed":"#d1d5db", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
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
    <div style={{ padding:"12px 0", borderBottom:"1px solid #f5eef8" }}>
      <p style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:".5px", margin:"0 0 8px" }}>{label}</p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <input type={tipo} value={temp} onChange={e=>setTemp(e.target.value)}
          style={{ flex:1, minWidth:120, border:"1.5px solid #a0435f", borderRadius:10, padding:"8px 12px", fontSize:13, color:"#1e1033", outline:"none", fontFamily:"inherit", background:"#fff" }}
          autoFocus/>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={guardar} disabled={loading}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#a0435f", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            {loading?"...":"Guardar"}
          </button>
          <button onClick={cancelar}
            style={{ padding:"8px 12px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 0", borderBottom:"1px solid #f5eef8" }}>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:11, color:"#9a7080", margin:"0 0 1px" }}>{label}</p>
        <p style={{ fontSize:13, fontWeight:500, color:"#1e1033", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:isMobile?180:300 }}>{valor||"—"}</p>
      </div>
      <button onClick={()=>{ setTemp(valor||""); setEditando(true); }}
        style={{ padding:"5px 14px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff", color:"#374151", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
        Editar
      </button>
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
  const [proceso, setProceso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState("cuenta");
  const [toast,   setToast]   = useState(null);

  const [passActual,  setPassActual]  = useState("");
  const [passNuevo,   setPassNuevo]   = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [showPA, setShowPA] = useState(false);
  const [showPN, setShowPN] = useState(false);
  const [showPC, setShowPC] = useState(false);

  const [modalEliminar, setModalEliminar] = useState(false);
  const [passEliminar,  setPassEliminar]  = useState("");
  const [showPE, setShowPE] = useState(false);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    const safe=(p,fb=null)=>p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/dashboard/configuracion"),null),
      safe(fetch("/api/dashboard/proceso"),null),
    ]).then(([cfg,proc]) => {
      if (cfg?.config) setConfig(cfg.config);
      setProceso(proc); setLoading(false);
    });
  }, []);

  const guardar = async(campos) => {
    setSaving(true);
    const res = await fetch("/api/dashboard/configuracion",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(campos)});
    const data = await res.json();
    if (res.ok) { setConfig(c=>({...c,...campos})); showToast("✓ Cambios guardados"); }
    else showToast(data.error||"Error al guardar","error");
    setSaving(false);
  };

  const cambiarPassword = async(e) => {
    e.preventDefault();
    if (passNuevo!==passConfirm) { showToast("Las contraseñas no coinciden","error"); return; }
    if (passNuevo.length<8) { showToast("Mínimo 8 caracteres","error"); return; }
    setSaving(true);
    const res = await fetch("/api/dashboard/configuracion",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({accion:"cambiar_password",password_actual:passActual,password_nuevo:passNuevo})});
    const data = await res.json();
    if (res.ok) { showToast("✓ Contraseña actualizada"); setPassActual(""); setPassNuevo(""); setPassConfirm(""); }
    else showToast(data.error||"Error","error");
    setSaving(false);
  };

  const eliminarCuenta = async() => {
    setSaving(true);
    const res = await fetch("/api/dashboard/configuracion",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({accion:"eliminar_cuenta",password_confirm:passEliminar})});
    const data = await res.json();
    if (res.ok) { showToast("Cuenta eliminada"); setTimeout(()=>router.push("/login"),1500); }
    else showToast(data.error||"Contraseña incorrecta","error");
    setSaving(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #e8849a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const fasesCompletadas = proceso?.pasos?.filter(p=>["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id)&&p.status==="completado")?.length||0;
  const pctProceso = Math.round((fasesCompletadas/5)*100);
  const c = config||{};

  const seccionIcon = (bg, Icon, color) => (
    <div style={{ width:isMobile?40:56, height:isMobile?40:56, borderRadius:14, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={isMobile?18:24} style={{ color }}/>
    </div>
  );

  const selectStyle = { flex:1, border:"1.5px solid #f0dde2", borderRadius:10, padding:"8px 12px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", cursor:"pointer", width:"100%" };

  return (
    <div style={{ minHeight:"100vh",background:"#faf5f6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:3000,background:toast.tipo==="error"?"#dc2626":"#1e1033",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* Modal eliminar */}
      {modalEliminar && (
        <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setModalEliminar(false)}>
          <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:420,padding:isMobile?20:32 }}>
            <div style={{ width:52,height:52,borderRadius:"50%",background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}>
              <AlertTriangle size={24} style={{ color:"#dc2626" }}/>
            </div>
            <h3 style={{ fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#1e1033",textAlign:"center",margin:"0 0 8px" }}>¿Eliminar tu cuenta?</h3>
            <p style={{ fontSize:13,color:"#6b7280",textAlign:"center",margin:"0 0 18px",lineHeight:1.6 }}>
              Esta acción es permanente. Se eliminarán todos tus datos, documentos y progreso.
            </p>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:".7px",display:"block",marginBottom:6 }}>Confirma tu contraseña</label>
              <div style={{ position:"relative" }}>
                <input type={showPE?"text":"password"} value={passEliminar} onChange={e=>setPassEliminar(e.target.value)} placeholder="••••••••" autoFocus
                  style={{ width:"100%",border:"1.5px solid #f0dde2",borderRadius:10,padding:"10px 40px 10px 14px",fontSize:13,color:"#1e1033",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
                <button type="button" onClick={()=>setShowPE(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9a7080" }}>
                  {showPE?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>{setModalEliminar(false);setPassEliminar("");}}
                style={{ flex:1,padding:"11px",borderRadius:12,border:"1.5px solid #e5e7eb",background:"#fff",color:"#6b7280",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancelar</button>
              <button onClick={eliminarCuenta} disabled={!passEliminar||saving}
                style={{ flex:1,padding:"11px",borderRadius:12,border:"none",background:"#dc2626",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:!passEliminar?0.5:1 }}>
                {saving?"Eliminando...":"Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #ece8f0",padding:isMobile?"12px 16px":"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,position:"sticky",top:0,zIndex:20 }}>
        <div style={{ minWidth:0 }}>
          <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?17:22,fontWeight:700,color:"#1e1033",margin:0 }}>Configuración ⚙️</h1>
          {!isMobile&&<p style={{ fontSize:13,color:"#9a7080",margin:"2px 0 0" }}>Administra tus preferencias y ajustes.</p>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          <button style={{ position:"relative",padding:8,borderRadius:12,border:"1px solid #ece4f0",background:"#fff",cursor:"pointer",flexShrink:0 }}>
            <Bell size={17} style={{ color:"#9a7080" }}/>
            <span style={{ position:"absolute",top:6,right:6,width:7,height:7,background:"#a0435f",borderRadius:"50%",border:"1.5px solid #fff" }}/>
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:isMobile?"14px 16px 40px":"24px 28px 40px",display:"flex",gap:20,flexDirection:isMobile?"column":"row" }}>
        <div style={{ flex:1,minWidth:0 }}>

          {!isMobile && (
            <div style={{ marginBottom:18 }}>
              <h2 style={{ fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:"#1e1033",margin:"0 0 4px" }}>Configuración</h2>
              <p style={{ fontSize:13,color:"#9a7080",margin:0 }}>Administra tus preferencias y ajustes de cuenta.</p>
            </div>
          )}

          {/* Tabs */}
          <div style={{ background:"#fff",borderRadius:16,border:"1px solid #ece4f0",overflow:"hidden",marginBottom:16 }}>
            <div style={{ display:"flex",borderBottom:"1px solid #f5eef8",overflowX:"auto",scrollbarWidth:"none" }}>
              {TABS.map(t => {
                const TIcon=t.icon, active=tab===t.id;
                return (
                  <button key={t.id} onClick={()=>setTab(t.id)}
                    style={{ display:"flex",alignItems:"center",gap:isMobile?5:7,padding:isMobile?"10px 12px":"14px 20px",border:"none",background:"none",cursor:"pointer",fontSize:isMobile?11:13,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .12s",flexShrink:0,
                      color:active?"#a0435f":"#6b7280",
                      borderBottom:active?"2px solid #a0435f":"2px solid transparent",
                    }}>
                    <TIcon size={isMobile?13:15} style={{ color:active?"#a0435f":"#9ca3af" }}/>
                    {isMobile?t.labelShort:t.label}
                  </button>
                );
              })}
            </div>

            <div style={{ padding:isMobile?"16px":"24px 28px" }}>

              {/* ══ CUENTA ══ */}
              {tab==="cuenta" && (<>
                {/* Info personal */}
                <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:24,marginBottom:24 }}>
                  {seccionIcon("#ede9fe",User,"#7c3aed")}
                  <div style={{ flex:1,minWidth:0 }}>
                    <h3 style={{ fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 3px" }}>Información personal</h3>
                    <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px" }}>Actualiza tu información básica.</p>
                    <CampoEditable label="Nombre completo"     valor={`${c.nombre||""} ${c.apellido||""}`.trim()} campo="nombre"           onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                    <CampoEditable label="Correo electrónico"  valor={c.email}           campo="email"           tipo="email" onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                    <CampoEditable label="Teléfono"            valor={c.telefono}        campo="telefono"        tipo="tel"   onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                    <CampoEditable label="Fecha de nacimiento" valor={c.fecha_nacimiento?.split?.("T")[0]} campo="fecha_nacimiento" tipo="date" onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                    <CampoEditable label="País de residencia"  valor={c.pais}            campo="pais"                         onGuardar={guardar} loading={saving} isMobile={isMobile}/>
                  </div>
                </div>

                {/* Preferencias */}
                <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:24,marginBottom:24 }}>
                  {seccionIcon("#fce7f3",()=><span style={{ fontSize:isMobile?16:22 }}>⚙️</span>,"#a0435f")}
                  <div style={{ flex:1,minWidth:0 }}>
                    <h3 style={{ fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 3px" }}>Preferencias de la plataforma</h3>
                    <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px" }}>Personaliza tu experiencia.</p>
                    {[
                      { label:"Zona horaria",           campo:"zona_horaria",      opts:["America/Bogota","America/Mexico_City","America/New_York","America/Los_Angeles","Europe/Madrid"], display:{"America/Bogota":"(GMT-5) Bogotá","America/Mexico_City":"(GMT-6) México","America/New_York":"(GMT-5) Miami","America/Los_Angeles":"(GMT-8) Los Ángeles","Europe/Madrid":"(GMT+1) España"} },
                      { label:"Formato de fecha",       campo:"formato_fecha",     opts:["DD/MM/AAAA","MM/DD/AAAA","AAAA-MM-DD"] },
                      { label:"Tema de la plataforma",  campo:"tema_plataforma",   opts:["Claro","Oscuro","Automático"] },
                      { label:"Idioma de la plataforma",campo:"idioma_plataforma", opts:["Español","English","Português"] },
                    ].map(f=>(
                      <div key={f.campo} style={{ padding:"10px 0",borderBottom:"1px solid #f5eef8" }}>
                        <p style={{ fontSize:11,color:"#9a7080",margin:"0 0 6px" }}>{f.label}</p>
                        <select value={c[f.campo]||f.opts[0]} onChange={e=>guardar({[f.campo]:e.target.value})} style={selectStyle}>
                          {f.opts.map(o=><option key={o} value={o}>{f.display?.[o]||o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacidad */}
                <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:24 }}>
                  {seccionIcon("#d1fae5",Shield,"#059669")}
                  <div style={{ flex:1,minWidth:0 }}>
                    <h3 style={{ fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 3px" }}>Privacidad</h3>
                    <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px" }}>Tú tienes el control de tu información.</p>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 0",borderBottom:"1px solid #f5eef8",flexWrap:"wrap" }}>
                      <div>
                        <p style={{ fontSize:13,fontWeight:500,color:"#1e1033",margin:0 }}>Privacidad de mi perfil</p>
                        <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{c.privacidad_perfil||"Solo visible para la agencia"}</p>
                      </div>
                      <button onClick={()=>guardar({privacidad_perfil:"Solo visible para la agencia"})}
                        style={{ padding:"6px 14px",borderRadius:8,border:"1.5px solid #e5e7eb",background:"#fff",color:"#374151",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}>Editar</button>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 0",borderBottom:"1px solid #f5eef8",flexWrap:"wrap" }}>
                      <div>
                        <p style={{ fontSize:13,fontWeight:500,color:"#1e1033",margin:0 }}>Compartir progreso</p>
                        <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{c.compartir_progreso?"Mi asesora puede ver mi progreso":"No compartir mi progreso"}</p>
                      </div>
                      <button onClick={()=>guardar({compartir_progreso:c.compartir_progreso?0:1})}
                        style={{ padding:"6px 14px",borderRadius:8,border:"1.5px solid #e5e7eb",background:"#fff",color:"#374151",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}>Editar</button>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 0",flexWrap:"wrap" }}>
                      <div>
                        <p style={{ fontSize:13,fontWeight:500,color:"#dc2626",margin:0 }}>Eliminar cuenta</p>
                        <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Acción permanente e irreversible</p>
                      </div>
                      <button onClick={()=>setModalEliminar(true)}
                        style={{ padding:"6px 14px",borderRadius:8,border:"1.5px solid #fecaca",background:"#fee2e2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}>Eliminar</button>
                    </div>
                  </div>
                </div>
              </>)}

              {/* ══ NOTIFICACIONES ══ */}
              {tab==="notificaciones" && (<>
                <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:24 }}>
                  {seccionIcon("#fef3c7",Bell,"#d97706")}
                  <div style={{ flex:1,minWidth:0 }}>
                    <h3 style={{ fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 3px" }}>Preferencias de notificaciones</h3>
                    <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px" }}>Controla qué notificaciones quieres recibir.</p>
                    {[
                      { campo:"notif_email",      label:"Notificaciones por email",     desc:"Recibe actualizaciones por correo" },
                      { campo:"notif_plataforma", label:"Notificaciones en plataforma", desc:"Alertas y mensajes en el dashboard" },
                      { campo:"notif_mensajes",   label:"Nuevos mensajes",              desc:"Cuando Jenni te envíe un mensaje" },
                      { campo:"notif_reuniones",  label:"Recordatorios de reuniones",   desc:"Antes de tus reuniones agendadas" },
                    ].map(n=>(
                      <div key={n.campo} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f5eef8",gap:12 }}>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:"0 0 1px" }}>{n.label}</p>
                          <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{n.desc}</p>
                        </div>
                        <Toggle value={!!c[n.campo]} onChange={()=>guardar({[n.campo]:c[n.campo]?0:1})}/>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              {/* ══ SEGURIDAD ══ */}
              {tab==="seguridad" && (<>
                <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:24 }}>
                  {seccionIcon("#dbeafe",Lock,"#1d4ed8")}
                  <div style={{ flex:1,minWidth:0 }}>
                    <h3 style={{ fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 3px" }}>Cambiar contraseña</h3>
                    <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px" }}>Usa una contraseña segura de al menos 8 caracteres.</p>
                    <form onSubmit={cambiarPassword} style={{ display:"flex",flexDirection:"column",gap:12,maxWidth:420 }}>
                      {[
                        { label:"Contraseña actual",          val:passActual,  set:setPassActual,  show:showPA, setShow:setShowPA  },
                        { label:"Nueva contraseña",           val:passNuevo,   set:setPassNuevo,   show:showPN, setShow:setShowPN  },
                        { label:"Confirmar nueva contraseña", val:passConfirm, set:setPassConfirm, show:showPC, setShow:setShowPC  },
                      ].map(f=>(
                        <div key={f.label}>
                          <label style={{ fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:".7px",display:"block",marginBottom:6 }}>{f.label}</label>
                          <div style={{ position:"relative" }}>
                            <Lock size={13} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#9ca3af" }}/>
                            <input type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)} required placeholder="••••••••"
                              style={{ width:"100%",border:"1.5px solid #f0dde2",borderRadius:12,padding:"10px 40px 10px 34px",fontSize:13,color:"#1e1033",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
                            <button type="button" onClick={()=>f.setShow(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9a7080" }}>
                              {f.show?<EyeOff size={14}/>:<Eye size={14}/>}
                            </button>
                          </div>
                        </div>
                      ))}
                      {passNuevo&&passNuevo.length>=8&&passNuevo===passConfirm&&(
                        <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#059669",fontWeight:600 }}>
                          <Check size={13}/> Las contraseñas coinciden
                        </div>
                      )}
                      <button type="submit" disabled={saving||!passActual||!passNuevo||!passConfirm}
                        style={{ padding:"12px",borderRadius:12,border:"none",background:"#a0435f",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:(!passActual||!passNuevo||!passConfirm)?0.5:1 }}>
                        {saving?"Actualizando...":"Actualizar contraseña"}
                      </button>
                    </form>
                  </div>
                </div>
              </>)}

              {/* ══ IDIOMA ══ */}
              {tab==="idioma" && (<>
                <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:24 }}>
                  {seccionIcon("#d1fae5",Globe,"#059669")}
                  <div style={{ flex:1,minWidth:0 }}>
                    <h3 style={{ fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 3px" }}>Idioma y región</h3>
                    <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px" }}>Configura tu idioma y preferencias regionales.</p>
                    {[
                      { label:"Idioma de la plataforma", campo:"idioma_plataforma", opts:["Español","English","Português"] },
                      { label:"Zona horaria",            campo:"zona_horaria",      opts:["America/Bogota","America/Mexico_City","America/New_York","America/Los_Angeles","Europe/Madrid"],
                        display:{"America/Bogota":"(GMT-5) Bogotá","America/Mexico_City":"(GMT-6) México","America/New_York":"(GMT-5) Miami","America/Los_Angeles":"(GMT-8) Los Ángeles","Europe/Madrid":"(GMT+1) España"} },
                      { label:"Formato de fecha",        campo:"formato_fecha",     opts:["DD/MM/AAAA","MM/DD/AAAA","AAAA-MM-DD"] },
                    ].map(f=>(
                      <div key={f.campo} style={{ padding:"10px 0",borderBottom:"1px solid #f5eef8" }}>
                        <p style={{ fontSize:11,color:"#9a7080",margin:"0 0 6px" }}>{f.label}</p>
                        <select value={c[f.campo]||f.opts[0]} onChange={e=>guardar({[f.campo]:e.target.value})} style={selectStyle}>
                          {f.opts.map(o=><option key={o} value={o}>{f.display?.[o]||o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              {/* ══ AYUDA ══ */}
              {tab==="ayuda" && (<>
                <div style={{ display:"flex",alignItems:"flex-start",gap:isMobile?12:24 }}>
                  {seccionIcon("#ede9fe",HelpCircle,"#7c3aed")}
                  <div style={{ flex:1,minWidth:0 }}>
                    <h3 style={{ fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 3px" }}>Ayuda y soporte</h3>
                    <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px" }}>¿Necesitas ayuda? Estamos aquí para ti.</p>
                    {[
                      { emoji:"💬",titulo:"Escribir a soporte",   desc:"Jenni te responderá a la brevedad.",         link:"/dashboard/mensajes",  label:"Ir a mensajes" },
                      { emoji:"📅",titulo:"Agendar una reunión",  desc:"Sesión con tu asesora para resolver dudas.", link:"/dashboard/reuniones", label:"Agendar" },
                      { emoji:"📚",titulo:"Centro de recursos",   desc:"Guías, videos y documentos de ayuda.",       link:"/dashboard/recursos",  label:"Ver recursos" },
                      { emoji:"🎓",titulo:"Ver el curso",         desc:"Continúa con tus lecciones del programa.",   link:"/dashboard/curso",     label:"Ir al curso" },
                    ].map((a,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"12px 0",borderBottom:i<3?"1px solid #f5eef8":"none",flexWrap:isMobile?"wrap":"nowrap" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0 }}>
                          <div style={{ width:isMobile?36:44,height:isMobile?36:44,borderRadius:12,background:"#f5f0ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:isMobile?18:20,flexShrink:0 }}>{a.emoji}</div>
                          <div style={{ minWidth:0 }}>
                            <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:"0 0 1px" }}>{a.titulo}</p>
                            {!isMobile&&<p style={{ fontSize:11,color:"#9a7080",margin:0 }}>{a.desc}</p>}
                          </div>
                        </div>
                        <Link href={a.link}
                          style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"#fff",color:"#374151",fontSize:12,fontWeight:600,textDecoration:"none",flexShrink:0 }}>
                          {a.label} <ChevronRight size={12}/>
                        </Link>
                      </div>
                    ))}
                    <div style={{ marginTop:20,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:14,padding:"14px 16px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                        <Shield size={16} style={{ color:"#059669" }}/>
                        <p style={{ fontSize:13,fontWeight:700,color:"#065f46",margin:0 }}>Tu seguridad es importante</p>
                      </div>
                      <p style={{ fontSize:12,color:"#065f46",margin:"0 0 8px",lineHeight:1.6 }}>Nunca compartimos tu información personal con terceros.</p>
                      <button onClick={()=>setTab("seguridad")}
                        style={{ fontSize:12,fontWeight:600,color:"#059669",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0,display:"flex",alignItems:"center",gap:4 }}>
                        Ver más consejos de seguridad <ChevronRight size={12}/>
                      </button>
                    </div>
                  </div>
                </div>
              </>)}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside style={{ width:isMobile?"100%":260,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":20 }}>
            <h3 style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:"0 0 12px",textAlign:"left" }}>Tu progreso en el proceso</h3>
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
                <div style={{ display:"flex",justifyContent:"center",marginBottom:12 }}>
                  <svg width="120" height="120" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#f0e8f8" strokeWidth="12"/>
                    <circle cx="70" cy="70" r="54" fill="none" stroke="url(#gcfg)" strokeWidth="12"
                      strokeDasharray={`${(pctProceso/100)*2*Math.PI*54} ${(1-pctProceso/100)*2*Math.PI*54}`}
                      strokeDashoffset={2*Math.PI*54*.25} strokeLinecap="round" style={{ transition:"stroke-dasharray .8s" }}/>
                    <defs><linearGradient id="gcfg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
                    </linearGradient></defs>
                    <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22,fontWeight:700,fontFamily:"Georgia,serif" }}>{pctProceso}%</text>
                    <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11,fontFamily:"system-ui" }}>Completado</text>
                  </svg>
                </div>
                <p style={{ fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#1e1033",margin:"0 0 2px",textAlign:"center" }}>{fasesCompletadas} de 5 fases completadas</p>
                <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 14px",lineHeight:1.5,textAlign:"center" }}>Sigue así, vas por buen camino 💜</p>
              </>
            )}
            <Link href="/dashboard/proceso" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:"1.5px solid #ede9fe",color:"#7c3aed",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>
              🗺️ Ver mi proceso completo
            </Link>
          </div>

          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":18 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"#f5f0ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>🎧</div>
              <div>
                <p style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:0 }}>¿Necesitas ayuda?</p>
                <p style={{ fontSize:11,color:"#9a7080",margin:0 }}>Estamos aquí para apoyarte.</p>
              </div>
            </div>
            <Link href="/dashboard/mensajes"
              style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:"#fff",border:"1.5px solid #ece4f0",color:"#7c3aed",fontSize:12,fontWeight:600,padding:"10px",borderRadius:12,textDecoration:"none" }}>
              💬 Escribir a soporte
            </Link>
          </div>

          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #ece4f0",padding:isMobile?"14px 16px":18 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <Shield size={16} style={{ color:"#059669" }}/>
              </div>
              <p style={{ fontSize:13,fontWeight:700,color:"#1e1033",margin:0 }}>Tu seguridad</p>
            </div>
            <button onClick={()=>setTab("seguridad")}
              style={{ fontSize:12,fontWeight:600,color:"#059669",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0,display:"flex",alignItems:"center",gap:4 }}>
              Ver consejos de seguridad <ChevronRight size={12}/>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}