"use client";
// app/admin/configuracion/page.jsx

import { useEffect, useState } from "react";
import {
  Settings, Globe, Shield, MessageSquare,
  Instagram, Save, Check, AlertCircle,
  Eye, EyeOff, Lock,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

const IC = (extra={}) => ({ width:"100%", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"9px 12px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box", ...extra });
const LC = { fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 };

function Toggle({ value, onChange, color="#a0435f" }) {
  return (
    <div onClick={()=>onChange(!value)} style={{ width:44,height:24,borderRadius:99,background:value?color:"#d1d5db",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0 }}>
      <div style={{ width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:value?23:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.15)" }}/>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange, color }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:"1px solid #f3f4f6",gap:12 }}>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:13,fontWeight:600,color:"#1e1033",margin:0 }}>{label}</p>
        <p style={{ fontSize:12,color:"#9a7080",margin:"2px 0 0",lineHeight:1.4 }}>{desc}</p>
      </div>
      <Toggle value={value} onChange={onChange} color={color}/>
    </div>
  );
}

const TABS = [
  { id:"general",   icon:Settings,      label:"General" },
  { id:"sistema",   icon:Globe,         label:"Sistema" },
  { id:"redes",     icon:Instagram,     label:"Redes sociales" },
  { id:"mensajes",  icon:MessageSquare, label:"Mensajes" },
  { id:"seguridad", icon:Shield,        label:"Seguridad" },
];

export default function AdminConfiguracionPage() {
  const { isMobile } = useMobile();
  const [tab,     setTab]     = useState("general");
  const [config,  setConfig]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const [passActual,  setPassActual]  = useState("");
  const [passNuevo,   setPassNuevo]   = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [showPA, setShowPA] = useState(false);
  const [showPN, setShowPN] = useState(false);
  const [showPC, setShowPC] = useState(false);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  useEffect(()=>{
    fetch("/api/admin/configuracion")
      .then(r=>r.json())
      .then(d=>{ setConfig(d.config||{}); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  const set = (k,v) => setConfig(c=>({...c,[k]:v}));

  const guardar = async() => {
    setSaving(true);
    const res = await fetch("/api/admin/configuracion",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(config)});
    const data = await res.json();
    if (res.ok) showToast("✓ Configuración guardada");
    else showToast(data.error||"Error al guardar","error");
    setSaving(false);
  };

  const cambiarPassword = async(e) => {
    e.preventDefault();
    if (passNuevo !== passConfirm) { showToast("Las contraseñas no coinciden","error"); return; }
    if (passNuevo.length < 8) { showToast("Mínimo 8 caracteres","error"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/configuracion",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({accion:"cambiar_password",password_actual:passActual,password_nuevo:passNuevo})});
    const data = await res.json();
    if (res.ok) { showToast("✓ Contraseña actualizada"); setPassActual(""); setPassNuevo(""); setPassConfirm(""); }
    else showToast(data.error||"Error","error");
    setSaving(false);
  };

  const SaveBtn = () => (
    <button onClick={guardar} disabled={saving}
      style={{ display:"flex",alignItems:"center",gap:7,background:"#a0435f",color:"#fff",fontSize:13,fontWeight:600,padding:"11px 22px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit",marginTop:24,opacity:saving?.6:1 }}>
      <Save size={13}/>{saving?"Guardando...":"Guardar cambios"}
    </button>
  );

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#f9fafb",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid #a0435f",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:200,background:toast.tipo==="error"?"#dc2626":"#1e1033",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.15)",display:"flex",alignItems:"center",gap:8 }}>
          {toast.tipo==="error"?<AlertCircle size={14}/>:<Check size={14}/>}{toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e5e7eb",padding:isMobile?"14px 16px":"20px 28px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:16 }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?20:24,fontWeight:700,color:"#1e1033",margin:0,display:"flex",alignItems:"center",gap:10 }}>
              <Settings size={isMobile?20:22} style={{ color:"#a0435f" }}/> Configuración
            </h1>
            <p style={{ fontSize:12,color:"#9a6672",margin:"4px 0 0" }}>Gestiona los ajustes generales del programa, redes sociales y personaliza tu plataforma.</p>
          </div>
          <button onClick={guardar} disabled={saving}
            style={{ display:"flex",alignItems:"center",gap:6,background:"#a0435f",color:"#fff",fontSize:12,fontWeight:700,padding:isMobile?"8px 14px":"10px 20px",borderRadius:11,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0,opacity:saving?.6:1 }}>
            <Save size={13}/>{saving?"Guardando...":"Guardar cambios"}
          </button>
        </div>

        {/* TABS HORIZONTALES */}
        <div style={{ display:"flex",gap:0,overflowX:"auto",scrollbarWidth:"none",marginBottom:-1 }}>
          {TABS.map(t=>{
            const TIcon=t.icon, active=tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{ display:"flex",alignItems:"center",gap:6,padding:isMobile?"10px 14px":"10px 18px",border:"none",borderBottom:`2px solid ${active?"#a0435f":"transparent"}`,background:"transparent",cursor:"pointer",fontSize:isMobile?12:13,fontWeight:active?700:500,color:active?"#a0435f":"#6b7280",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .1s" }}>
                <TIcon size={14} style={{ color:active?"#a0435f":"#9ca3af" }}/>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth:1100,margin:"0 auto",padding:isMobile?"16px":"28px 24px 40px" }}>

        {/* ══ GENERAL ══ */}
        {tab==="general" && (
          <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20 }}>
            {/* Col 1 */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:28,height:28,borderRadius:8,background:"#fce8ed",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>ℹ️</span>
                Información general
              </h3>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                <div>
                  <label style={LC}>Nombre del programa</label>
                  <input value={config.nombre_programa||""} onChange={e=>set("nombre_programa",e.target.value)} style={IC()} placeholder="Destino Au Pair"/>
                </div>
                <div>
                  <label style={LC}>Email de contacto</label>
                  <input type="email" value={config.email_contacto||""} onChange={e=>set("email_contacto",e.target.value)} style={IC()} placeholder="hola@destino-aupair.com"/>
                </div>
                <div>
                  <label style={LC}>WhatsApp de contacto</label>
                  <input value={config.whatsapp||""} onChange={e=>set("whatsapp",e.target.value)} style={IC()} placeholder="13478886836"/>
                  <p style={{ fontSize:11,color:"#9a7080",margin:"4px 0 0" }}>Sin + ni espacios</p>
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:28,height:28,borderRadius:8,background:"#fce8ed",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>📝</span>
                Descripción
              </h3>
              <div>
                <label style={LC}>Descripción del programa</label>
                <textarea value={config.descripcion||""} onChange={e=>set("descripcion",e.target.value)} rows={6}
                  style={{ ...IC(),resize:"vertical" }} placeholder="Describe tu programa..."/>
                <p style={{ fontSize:11,color:"#9a7080",margin:"4px 0 0" }}>{(config.descripcion||"").length}/300 caracteres</p>
              </div>
            </div>

            <div style={{ gridColumn:isMobile?"1":"1/-1" }}>
              <SaveBtn/>
            </div>
          </div>
        )}

        {/* ══ SISTEMA ══ */}
        {tab==="sistema" && (
          <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20 }}>
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 4px",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:28,height:28,borderRadius:8,background:"#fce8ed",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>⚙️</span>
                Ajustes del sistema
              </h3>
              <p style={{ fontSize:12,color:"#9a7080",margin:"0 0 8px" }}>Controla el comportamiento general de la plataforma.</p>
              <ToggleRow
                label="Registro de nuevos usuarios"
                desc="Permitir que nuevas personas se registren"
                value={config.registro_abierto==="1"}
                onChange={v=>set("registro_abierto",v?"1":"0")}
                color="#059669"
              />
              <ToggleRow
                label="Aprobación manual de acceso"
                desc="Jenni debe aprobar manualmente cada acceso"
                value={config.aprobacion_manual==="1"}
                onChange={v=>set("aprobacion_manual",v?"1":"0")}
                color="#d97706"
              />
              <ToggleRow
                label="Modo mantenimiento"
                desc="La plataforma no estará visible para las usuarias"
                value={config.modo_mantenimiento==="1"}
                onChange={v=>set("modo_mantenimiento",v?"1":"0")}
                color="#dc2626"
              />
              {config.modo_mantenimiento==="1" && (
                <div style={{ background:"#fee2e2",border:"1px solid #fecaca",borderRadius:12,padding:"12px 16px",marginTop:12,display:"flex",alignItems:"flex-start",gap:10 }}>
                  <AlertCircle size={16} style={{ color:"#dc2626",flexShrink:0,marginTop:1 }}/>
                  <p style={{ fontSize:12,color:"#dc2626",margin:0,fontWeight:600,lineHeight:1.5 }}>
                    ⚠️ Modo mantenimiento activo — las usuarias no pueden acceder.
                  </p>
                </div>
              )}
            </div>

            {/* Resumen estado */}
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:28,height:28,borderRadius:8,background:"#f0fdf4",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>📊</span>
                Estado actual
              </h3>
              {[
                { label:"Registro de usuarios",  val:config.registro_abierto==="1"?"Abierto ✓":"Cerrado ✗",    bg:config.registro_abierto==="1"?"#f0fdf4":"#fef2f2",     color:config.registro_abierto==="1"?"#059669":"#dc2626" },
                { label:"Aprobación de acceso",  val:config.aprobacion_manual==="1"?"Manual":"Automática",      bg:config.aprobacion_manual==="1"?"#fffbeb":"#f0fdf4",     color:config.aprobacion_manual==="1"?"#d97706":"#059669" },
                { label:"Modo mantenimiento",    val:config.modo_mantenimiento==="1"?"Activo ⚠️":"Inactivo ✓",  bg:config.modo_mantenimiento==="1"?"#fef2f2":"#f0fdf4",    color:config.modo_mantenimiento==="1"?"#dc2626":"#059669" },
              ].map((s,i)=>(
                <div key={i} style={{ background:s.bg,borderRadius:12,padding:"12px 16px",marginBottom:10 }}>
                  <p style={{ fontSize:11,color:"#6b7280",margin:"0 0 2px" }}>{s.label}</p>
                  <p style={{ fontSize:13,fontWeight:700,color:s.color,margin:0 }}>{s.val}</p>
                </div>
              ))}
            </div>

            <div style={{ gridColumn:isMobile?"1":"1/-1" }}>
              <SaveBtn/>
            </div>
          </div>
        )}

        {/* ══ REDES ══ */}
        {tab==="redes" && (
          <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)",maxWidth:600 }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 6px",display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ width:28,height:28,borderRadius:8,background:"#fce8ed",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>📱</span>
              Redes sociales
            </h3>
            <p style={{ fontSize:13,color:"#9a7080",margin:"0 0 20px" }}>Estos links aparecen en la página de pago y en la landing.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              {[
                { key:"instagram", label:"Instagram",  placeholder:"https://instagram.com/destinoaupair", emoji:"📸" },
                { key:"tiktok",    label:"TikTok",     placeholder:"https://tiktok.com/@destinoaupair",  emoji:"🎵" },
                { key:"youtube",   label:"YouTube",    placeholder:"https://youtube.com/@destinoaupair", emoji:"▶️" },
                { key:"facebook",  label:"Facebook",   placeholder:"https://facebook.com/destinoaupair", emoji:"👥" },
              ].map(r=>(
                <div key={r.key}>
                  <label style={LC}>{r.emoji} {r.label}</label>
                  <input type="url" value={config[r.key]||""} onChange={e=>set(r.key,e.target.value)} style={IC()} placeholder={r.placeholder}/>
                </div>
              ))}
            </div>
            <SaveBtn/>
          </div>
        )}

        {/* ══ MENSAJES ══ */}
        {tab==="mensajes" && (
          <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)",maxWidth:700 }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 6px",display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ width:28,height:28,borderRadius:8,background:"#fce8ed",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>💬</span>
              Mensajes personalizados
            </h3>
            <p style={{ fontSize:13,color:"#9a7080",margin:"0 0 20px" }}>Personaliza los mensajes que ven las usuarias en momentos clave.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
              {[
                { key:"mensaje_bienvenida", label:"Mensaje de bienvenida",       desc:"Se muestra cuando la usuaria se registra por primera vez", emoji:"👋" },
                { key:"mensaje_acceso",     label:"Mensaje de acceso concedido",  desc:"Se muestra cuando Jenni activa el acceso completo al programa", emoji:"🎉" },
              ].map(m=>(
                <div key={m.key}>
                  <label style={LC}>{m.emoji} {m.label}</label>
                  <p style={{ fontSize:11,color:"#9a7080",margin:"0 0 6px" }}>{m.desc}</p>
                  <textarea value={config[m.key]||""} onChange={e=>set(m.key,e.target.value)} rows={3}
                    style={{ ...IC(),resize:"vertical" }}/>
                  <p style={{ fontSize:11,color:"#9a7080",margin:"4px 0 0" }}>{(config[m.key]||"").length}/200 caracteres</p>
                </div>
              ))}
            </div>
            <SaveBtn/>
          </div>
        )}

        {/* ══ SEGURIDAD ══ */}
        {tab==="seguridad" && (
          <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20 }}>
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <h3 style={{ fontSize:14,fontWeight:700,color:"#1e1033",margin:"0 0 6px",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:28,height:28,borderRadius:8,background:"#fce8ed",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>🔒</span>
                Cambiar contraseña
              </h3>
              <p style={{ fontSize:13,color:"#9a7080",margin:"0 0 20px" }}>Actualiza tu contraseña de acceso al panel admin.</p>
              <form onSubmit={cambiarPassword} style={{ display:"flex",flexDirection:"column",gap:16 }}>
                {[
                  { label:"Contraseña actual",          val:passActual,  set:setPassActual,  show:showPA, setShow:setShowPA },
                  { label:"Nueva contraseña",           val:passNuevo,   set:setPassNuevo,   show:showPN, setShow:setShowPN },
                  { label:"Confirmar nueva contraseña", val:passConfirm, set:setPassConfirm, show:showPC, setShow:setShowPC },
                ].map(f=>(
                  <div key={f.label}>
                    <label style={LC}>{f.label}</label>
                    <div style={{ position:"relative" }}>
                      <Lock size={13} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#9ca3af" }}/>
                      <input type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)} required
                        placeholder="••••••••" style={{ ...IC(),paddingLeft:34,paddingRight:40 }}/>
                      <button type="button" onClick={()=>f.setShow(s=>!s)}
                        style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9a7080" }}>
                        {f.show?<EyeOff size={14}/>:<Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                ))}
                {passNuevo && passNuevo.length>=8 && passNuevo===passConfirm && (
                  <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#059669",fontWeight:600 }}>
                    <Check size={13}/> Las contraseñas coinciden
                  </div>
                )}
                <button type="submit" disabled={saving||!passActual||!passNuevo||!passConfirm}
                  style={{ padding:"11px",borderRadius:12,border:"none",background:"#a0435f",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:(!passActual||!passNuevo||!passConfirm)?.5:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginTop:4 }}>
                  <Lock size={13}/>{saving?"Actualizando...":"Actualizar contraseña"}
                </button>
              </form>
            </div>

            <div style={{ background:"#f0fdf4",borderRadius:16,border:"1px solid #bbf7d0",padding:isMobile?16:24 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                <Shield size={16} style={{ color:"#059669" }}/>
                <p style={{ fontSize:14,fontWeight:700,color:"#065f46",margin:0 }}>Consejos de seguridad</p>
              </div>
              <ul style={{ fontSize:13,color:"#065f46",margin:0,paddingLeft:18,lineHeight:2 }}>
                <li>Usa al menos 8 caracteres con letras y números</li>
                <li>Incluye mayúsculas y caracteres especiales</li>
                <li>No compartas tu contraseña con nadie</li>
                <li>Cámbiala cada 3 meses</li>
                <li>No uses la misma contraseña en otros sitios</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}