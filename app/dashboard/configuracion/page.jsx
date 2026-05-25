"use client";
// app/dashboard/configuracion/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Calendar, ArrowRight, User, Shield, Globe,
  HelpCircle, ChevronRight, Eye, EyeOff, Check,
  AlertTriangle, Lock, LogOut,
} from "lucide-react";
import { HelpCard } from "@/components/dashboard/DashboardWidgets";

/* ── Donut ─────────────────────────────────────────────────────────────── */
function DonutProgress({ pct=0 }) {
  const r=54, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e8f8" strokeWidth="12"/>
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#gc)" strokeWidth="12"
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*.25}
        strokeLinecap="round" style={{ transition:"stroke-dasharray .8s" }}/>
      <defs><linearGradient id="gc" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a0435f"/>
      </linearGradient></defs>
      <text x="70" y="63" textAnchor="middle" fill="#1e1033" style={{ fontSize:22, fontWeight:700, fontFamily:"Georgia,serif" }}>{pct}%</text>
      <text x="70" y="82" textAnchor="middle" fill="#9a7080" style={{ fontSize:11, fontFamily:"system-ui" }}>Completado</text>
    </svg>
  );
}

/* ── Campo editable ─────────────────────────────────────────────────────── */
function CampoEditable({ label, valor, campo, tipo="text", onGuardar, loading }) {
  const [editando, setEditando] = useState(false);
  const [temp,     setTemp]     = useState(valor||"");

  const guardar = async () => {
    await onGuardar({ [campo]: temp });
    setEditando(false);
  };
  const cancelar = () => { setTemp(valor||""); setEditando(false); };

  return (
    <div style={{ display:"flex", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #f5eef8" }}>
      <span style={{ width:200, fontSize:13, color:"#6b7280", flexShrink:0 }}>{label}</span>
      <div style={{ flex:1 }}>
        {editando ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type={tipo} value={temp} onChange={e=>setTemp(e.target.value)}
              style={{ flex:1, border:"1.5px solid #a0435f", borderRadius:10, padding:"8px 12px", fontSize:13, color:"#1e1033", outline:"none", fontFamily:"inherit", background:"#fff" }}
              autoFocus/>
            <button onClick={guardar} disabled={loading}
              style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#a0435f", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              {loading?"...":"Guardar"}
            </button>
            <button onClick={cancelar}
              style={{ padding:"8px 12px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Cancelar
            </button>
          </div>
        ) : (
          <span style={{ fontSize:13, color:"#1e1033" }}>{valor||"—"}</span>
        )}
      </div>
      {!editando && (
        <button onClick={()=>{ setTemp(valor||""); setEditando(true); }}
          style={{ padding:"6px 16px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff", color:"#374151", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
          Editar
        </button>
      )}
    </div>
  );
}

/* ── Toggle switch ──────────────────────────────────────────────────────── */
function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} style={{ width:44, height:24, borderRadius:99, background:value?"#7c3aed":"#d1d5db", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?23:3, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.15)" }}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function ConfiguracionPage() {
  const router = useRouter();
  const [config,    setConfig]    = useState(null);
  const [proceso,   setProceso]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [tab,       setTab]       = useState("cuenta");
  const [toast,     setToast]     = useState(null);

  // Seguridad
  const [passActual,  setPassActual]  = useState("");
  const [passNuevo,   setPassNuevo]   = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [showPA,      setShowPA]      = useState(false);
  const [showPN,      setShowPN]      = useState(false);
  const [showPC,      setShowPC]      = useState(false);

  // Eliminar cuenta
  const [modalEliminar, setModalEliminar] = useState(false);
  const [passEliminar,  setPassEliminar]  = useState("");
  const [showPE,        setShowPE]        = useState(false);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    const safe = (p,fb=null) => p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/dashboard/configuracion"), null),
      safe(fetch("/api/dashboard/proceso"),       null),
    ]).then(([cfg, proc]) => {
      if (cfg?.config) setConfig(cfg.config);
      setProceso(proc);
      setLoading(false);
    });
  }, []);

  const guardar = async (campos) => {
    setSaving(true);
    const res = await fetch("/api/dashboard/configuracion", {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(campos),
    });
    const data = await res.json();
    if (res.ok) {
      setConfig(c => ({ ...c, ...campos }));
      showToast("✓ Cambios guardados");
    } else showToast(data.error||"Error al guardar","error");
    setSaving(false);
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    if (passNuevo !== passConfirm) { showToast("Las contraseñas no coinciden","error"); return; }
    if (passNuevo.length < 8) { showToast("Mínimo 8 caracteres","error"); return; }
    setSaving(true);
    const res = await fetch("/api/dashboard/configuracion", {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ accion:"cambiar_password", password_actual:passActual, password_nuevo:passNuevo }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("✓ Contraseña actualizada");
      setPassActual(""); setPassNuevo(""); setPassConfirm("");
    } else showToast(data.error||"Error","error");
    setSaving(false);
  };

  const eliminarCuenta = async () => {
    setSaving(true);
    const res = await fetch("/api/dashboard/configuracion", {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ accion:"eliminar_cuenta", password_confirm:passEliminar }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Cuenta eliminada");
      setTimeout(() => router.push("/login"), 1500);
    } else showToast(data.error||"Contraseña incorrecta","error");
    setSaving(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #e8849a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const fasesCompletadas = proceso?.pasos?.filter(p=>["evaluacion_perfil","perfil_agencia","match","visa","viaje"].includes(p.id)&&p.status==="completado")?.length||0;
  const pctProceso       = Math.round((fasesCompletadas/5)*100);
  const c = config || {};

  const TABS = [
    { id:"cuenta",        icon:User,        label:"Mi cuenta" },
    { id:"notificaciones",icon:Bell,        label:"Notificaciones" },
    { id:"seguridad",     icon:Shield,      label:"Seguridad" },
    { id:"idioma",        icon:Globe,       label:"Idioma y región" },
    { id:"ayuda",         icon:HelpCircle,  label:"Ayuda y soporte" },
  ];

  const SX = { fontSize:13, color:"#1e1033" };
  const LX = { fontSize:13, color:"#6b7280", width:220, flexShrink:0 };
  const ROW = { display:"flex", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #f5eef8" };

  return (
    <div style={{ minHeight:"100vh", background:"#faf5f6", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .tab-btn:hover{color:#a0435f!important;}`}</style>

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:3000, background:toast.tipo==="error"?"#dc2626":"#1e1033", color:"#fff", padding:"12px 20px", borderRadius:14, fontSize:13, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* Modal eliminar cuenta */}
      {modalEliminar && (
        <div style={{ position:"fixed", inset:0, background:"rgba(30,16,51,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setModalEliminar(false)}>
          <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:420, padding:32 }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <AlertTriangle size={26} style={{ color:"#dc2626" }}/>
            </div>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"#1e1033", textAlign:"center", margin:"0 0 8px" }}>
              ¿Eliminar tu cuenta?
            </h3>
            <p style={{ fontSize:13, color:"#6b7280", textAlign:"center", margin:"0 0 20px", lineHeight:1.6 }}>
              Esta acción es permanente e irreversible. Se eliminarán todos tus datos, documentos y progreso.
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:".7px", display:"block", marginBottom:6 }}>
                Confirma tu contraseña
              </label>
              <div style={{ position:"relative" }}>
                <input type={showPE?"text":"password"} value={passEliminar} onChange={e=>setPassEliminar(e.target.value)}
                  placeholder="••••••••" autoFocus
                  style={{ width:"100%", border:"1.5px solid #f0dde2", borderRadius:10, padding:"10px 40px 10px 14px", fontSize:13, color:"#1e1033", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                <button type="button" onClick={()=>setShowPE(s=>!s)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9a7080" }}>
                  {showPE?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{setModalEliminar(false);setPassEliminar("");}}
                style={{ flex:1, padding:"11px", borderRadius:12, border:"1.5px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                Cancelar
              </button>
              <button onClick={eliminarCuenta} disabled={!passEliminar||saving}
                style={{ flex:1, padding:"11px", borderRadius:12, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", opacity:!passEliminar?0.5:1 }}>
                {saving?"Eliminando...":"Sí, eliminar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ece8f0", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, position:"sticky", top:0, zIndex:20 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#1e1033", margin:0 }}>¡Hola, {c.nombre}! 👋</h1>
          <p style={{ fontSize:13, color:"#9a7080", margin:"2px 0 0" }}>Sigue aprendiendo y preparándote para tu aventura. 💜</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <button style={{ position:"relative", padding:8, borderRadius:12, border:"1px solid #ece4f0", background:"#fff", cursor:"pointer" }}>
            <Bell size={17} style={{ color:"#9a7080" }}/>
            <span style={{ position:"absolute", top:6, right:6, width:7, height:7, background:"#a0435f", borderRadius:"50%", border:"1.5px solid #fff" }}/>
          </button>
          <Link href="/dashboard/reuniones" style={{ display:"flex", alignItems:"center", gap:6, border:"1.5px solid #e0d0e8", color:"#6b4a70", fontSize:13, fontWeight:500, padding:"8px 14px", borderRadius:12, textDecoration:"none", background:"#fff" }}>
            <Calendar size={14}/> Agendar reunión
          </Link>
          <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", gap:6, background:"#5b21b6", color:"#fff", fontSize:13, fontWeight:600, padding:"9px 16px", borderRadius:12, textDecoration:"none" }}>
            Ver mi proceso completo <ArrowRight size={13}/>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px 28px 40px", display:"flex", gap:20 }}>
        <div style={{ flex:1, minWidth:0 }}>

          {/* Título */}
          <div style={{ marginBottom:20 }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>Configuración</h2>
            <p style={{ fontSize:13, color:"#9a7080", margin:0 }}>Administra tus preferencias y ajustes de cuenta.</p>
          </div>

          {/* Tabs */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #ece4f0", overflow:"hidden", marginBottom:20 }}>
            <div style={{ display:"flex", borderBottom:"1px solid #f5eef8", overflowX:"auto" }}>
              {TABS.map(t => {
                const TIcon = t.icon;
                const active = tab === t.id;
                return (
                  <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"14px 20px", border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", whiteSpace:"nowrap", transition:"all .12s",
                      color: active ? "#a0435f" : "#6b7280",
                      borderBottom: active ? "2px solid #a0435f" : "2px solid transparent",
                    }}>
                    <TIcon size={15} style={{ color: active?"#a0435f":"#9ca3af" }}/>
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div style={{ padding:"24px 28px" }}>

              {/* ══ TAB: MI CUENTA ══ */}
              {tab==="cuenta" && (<>

                {/* Información personal */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:24, marginBottom:32 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:4 }}>
                    <User size={24} style={{ color:"#7c3aed" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>Información personal</h3>
                    <p style={{ fontSize:13, color:"#9a7080", margin:"0 0 16px" }}>Actualiza tu información básica.</p>
                    <CampoEditable label="Nombre completo"    valor={`${c.nombre||""} ${c.apellido||""}`.trim()} campo="nombre"           onGuardar={guardar} loading={saving}/>
                    <CampoEditable label="Correo electrónico" valor={c.email}           campo="email"           tipo="email" onGuardar={guardar} loading={saving}/>
                    <CampoEditable label="Teléfono"           valor={c.telefono}        campo="telefono"        tipo="tel"   onGuardar={guardar} loading={saving}/>
                    <CampoEditable label="Fecha de nacimiento" valor={c.fecha_nacimiento?.split?.("T")[0]} campo="fecha_nacimiento" tipo="date" onGuardar={guardar} loading={saving}/>
                    <CampoEditable label="País de residencia" valor={c.pais}            campo="pais"                         onGuardar={guardar} loading={saving}/>
                  </div>
                </div>

                {/* Preferencias */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:24, marginBottom:32 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"#fce7f3", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:4 }}>
                    <span style={{ fontSize:24 }}>⚙️</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>Preferencias de la plataforma</h3>
                    <p style={{ fontSize:13, color:"#9a7080", margin:"0 0 16px" }}>Personaliza tu experiencia en la plataforma.</p>
                    {[
                      { label:"Zona horaria",          campo:"zona_horaria",      opts:["America/Bogota","America/Mexico_City","America/New_York","America/Los_Angeles","Europe/Madrid"], display:{"America/Bogota":"(GMT-5) Hora de Bogotá","America/Mexico_City":"(GMT-6) Hora de México","America/New_York":"(GMT-5) Hora del Este (Miami)","America/Los_Angeles":"(GMT-8) Hora del Pacífico","Europe/Madrid":"(GMT+1) Hora de España"} },
                      { label:"Formato de fecha",      campo:"formato_fecha",     opts:["DD/MM/AAAA","MM/DD/AAAA","AAAA-MM-DD"] },
                      { label:"Tema de la plataforma", campo:"tema_plataforma",   opts:["Claro","Oscuro","Automático"] },
                      { label:"Idioma de la plataforma",campo:"idioma_plataforma",opts:["Español","English","Português"] },
                    ].map(f => (
                      <div key={f.campo} style={ROW}>
                        <span style={LX}>{f.label}</span>
                        <select value={c[f.campo]||f.opts[0]} onChange={e=>guardar({[f.campo]:e.target.value})}
                          style={{ flex:1, border:"1.5px solid #f0dde2", borderRadius:10, padding:"8px 12px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", cursor:"pointer", maxWidth:300 }}>
                          {f.opts.map(o=><option key={o} value={o}>{f.display?.[o]||o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacidad */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:24 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"#d1fae5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:4 }}>
                    <Shield size={24} style={{ color:"#059669" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>Privacidad</h3>
                    <p style={{ fontSize:13, color:"#9a7080", margin:"0 0 16px" }}>Tú tienes el control de tu información.</p>

                    <div style={ROW}>
                      <span style={LX}>Privacidad de mi perfil</span>
                      <span style={{ ...SX, flex:1 }}>{c.privacidad_perfil||"Solo visible para la agencia"}</span>
                      <button onClick={()=>guardar({privacidad_perfil:"Solo visible para la agencia"})}
                        style={{ padding:"6px 16px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff", color:"#374151", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
                        Editar
                      </button>
                    </div>

                    <div style={ROW}>
                      <span style={LX}>Compartir progreso</span>
                      <span style={{ ...SX, flex:1 }}>{c.compartir_progreso?"Permitir a mi asesora ver mi progreso":"No compartir mi progreso"}</span>
                      <button onClick={()=>guardar({compartir_progreso:c.compartir_progreso?0:1})}
                        style={{ padding:"6px 16px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff", color:"#374151", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
                        Editar
                      </button>
                    </div>

                    <div style={{ ...ROW, borderBottom:"none" }}>
                      <span style={LX}>Eliminar cuenta</span>
                      <button onClick={()=>setModalEliminar(true)}
                        style={{ fontSize:13, color:"#dc2626", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:500, padding:0, flex:1, textAlign:"left" }}>
                        Eliminar mi cuenta de la plataforma
                      </button>
                      <button onClick={()=>setModalEliminar(true)}
                        style={{ padding:"6px 16px", borderRadius:8, border:"1.5px solid #fecaca", background:"#fee2e2", color:"#dc2626", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </>)}

              {/* ══ TAB: NOTIFICACIONES ══ */}
              {tab==="notificaciones" && (<>
                <div style={{ display:"flex", alignItems:"flex-start", gap:24 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:4 }}>
                    <Bell size={24} style={{ color:"#d97706" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>Preferencias de notificaciones</h3>
                    <p style={{ fontSize:13, color:"#9a7080", margin:"0 0 20px" }}>Controla qué notificaciones quieres recibir.</p>

                    {[
                      { campo:"notif_email",      label:"Notificaciones por email",     desc:"Recibe actualizaciones de tu proceso por correo electrónico" },
                      { campo:"notif_plataforma", label:"Notificaciones en plataforma", desc:"Recibe alertas y mensajes dentro del dashboard" },
                      { campo:"notif_mensajes",   label:"Nuevos mensajes",              desc:"Te notificamos cuando Jenni te envíe un mensaje" },
                      { campo:"notif_reuniones",  label:"Recordatorios de reuniones",   desc:"Recibe recordatorios antes de tus reuniones agendadas" },
                    ].map(n => (
                      <div key={n.campo} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0", borderBottom:"1px solid #f5eef8" }}>
                        <div>
                          <p style={{ fontSize:14, fontWeight:600, color:"#1e1033", margin:"0 0 2px" }}>{n.label}</p>
                          <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>{n.desc}</p>
                        </div>
                        <Toggle value={!!c[n.campo]} onChange={()=>guardar({[n.campo]:c[n.campo]?0:1})}/>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              {/* ══ TAB: SEGURIDAD ══ */}
              {tab==="seguridad" && (<>
                <div style={{ display:"flex", alignItems:"flex-start", gap:24 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:4 }}>
                    <Lock size={24} style={{ color:"#1d4ed8" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>Cambiar contraseña</h3>
                    <p style={{ fontSize:13, color:"#9a7080", margin:"0 0 20px" }}>Usa una contraseña segura de al menos 8 caracteres.</p>

                    <form onSubmit={cambiarPassword} style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:420 }}>
                      {[
                        { label:"Contraseña actual",       val:passActual,  set:setPassActual,  show:showPA, setShow:setShowPA  },
                        { label:"Nueva contraseña",        val:passNuevo,   set:setPassNuevo,   show:showPN, setShow:setShowPN  },
                        { label:"Confirmar nueva contraseña", val:passConfirm, set:setPassConfirm, show:showPC, setShow:setShowPC },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:".7px", display:"block", marginBottom:6 }}>{f.label}</label>
                          <div style={{ position:"relative" }}>
                            <Lock size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9ca3af" }}/>
                            <input type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)} required
                              placeholder="••••••••"
                              style={{ width:"100%", border:"1.5px solid #f0dde2", borderRadius:12, padding:"10px 40px 10px 36px", fontSize:13, color:"#1e1033", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                            <button type="button" onClick={()=>f.setShow(s=>!s)}
                              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9a7080" }}>
                              {f.show?<EyeOff size={15}/>:<Eye size={15}/>}
                            </button>
                          </div>
                        </div>
                      ))}

                      {passNuevo && passNuevo.length >= 8 && passNuevo === passConfirm && (
                        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#059669", fontWeight:600 }}>
                          <Check size={14}/> Las contraseñas coinciden
                        </div>
                      )}

                      <button type="submit" disabled={saving||!passActual||!passNuevo||!passConfirm}
                        style={{ padding:"12px", borderRadius:12, border:"none", background:"#a0435f", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", opacity:(!passActual||!passNuevo||!passConfirm)?0.5:1 }}>
                        {saving?"Actualizando...":"Actualizar contraseña"}
                      </button>
                    </form>
                  </div>
                </div>
              </>)}

              {/* ══ TAB: IDIOMA Y REGIÓN ══ */}
              {tab==="idioma" && (<>
                <div style={{ display:"flex", alignItems:"flex-start", gap:24 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"#d1fae5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:4 }}>
                    <Globe size={24} style={{ color:"#059669" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>Idioma y región</h3>
                    <p style={{ fontSize:13, color:"#9a7080", margin:"0 0 20px" }}>Configura tu idioma y preferencias regionales.</p>

                    {[
                      { label:"Idioma de la plataforma", campo:"idioma_plataforma", opts:["Español","English","Português"] },
                      { label:"Zona horaria",            campo:"zona_horaria",      opts:["America/Bogota","America/Mexico_City","America/New_York","America/Los_Angeles","Europe/Madrid"],
                        display:{"America/Bogota":"(GMT-5) Bogotá, Lima, Quito","America/Mexico_City":"(GMT-6) Ciudad de México","America/New_York":"(GMT-5) Nueva York, Miami","America/Los_Angeles":"(GMT-8) Los Ángeles","Europe/Madrid":"(GMT+1) Madrid"} },
                      { label:"Formato de fecha",        campo:"formato_fecha",     opts:["DD/MM/AAAA","MM/DD/AAAA","AAAA-MM-DD"] },
                    ].map(f => (
                      <div key={f.campo} style={ROW}>
                        <span style={LX}>{f.label}</span>
                        <select value={c[f.campo]||f.opts[0]} onChange={e=>guardar({[f.campo]:e.target.value})}
                          style={{ flex:1, border:"1.5px solid #f0dde2", borderRadius:10, padding:"8px 12px", fontSize:13, color:"#1e1033", background:"#fff", outline:"none", fontFamily:"inherit", cursor:"pointer", maxWidth:300 }}>
                          {f.opts.map(o=><option key={o} value={o}>{f.display?.[o]||o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              {/* ══ TAB: AYUDA Y SOPORTE ══ */}
              {tab==="ayuda" && (<>
                <div style={{ display:"flex", alignItems:"flex-start", gap:24 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:4 }}>
                    <HelpCircle size={24} style={{ color:"#7c3aed" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 4px" }}>Ayuda y soporte</h3>
                    <p style={{ fontSize:13, color:"#9a7080", margin:"0 0 20px" }}>¿Necesitas ayuda? Estamos aquí para ti.</p>

                    {[
                      { emoji:"💬", titulo:"Escribir a soporte",     desc:"Envía un mensaje directo a Jenni y te responderá a la brevedad.", link:"/dashboard/mensajes", label:"Ir a mensajes" },
                      { emoji:"📅", titulo:"Agendar una reunión",     desc:"Programa una sesión con tu asesora para resolver tus dudas.",    link:"/dashboard/reuniones", label:"Agendar reunión" },
                      { emoji:"📚", titulo:"Centro de recursos",      desc:"Accede a guías, videos y documentos de ayuda.",                  link:"/dashboard/recursos",  label:"Ver recursos" },
                      { emoji:"🎓", titulo:"Ver el curso",            desc:"Continúa con tus lecciones y clases del programa.",              link:"/dashboard/curso",     label:"Ir al curso" },
                    ].map((a,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0", borderBottom: i<3?"1px solid #f5eef8":"none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                          <div style={{ width:44, height:44, borderRadius:12, background:"#f5f0ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                            {a.emoji}
                          </div>
                          <div>
                            <p style={{ fontSize:14, fontWeight:600, color:"#1e1033", margin:"0 0 2px" }}>{a.titulo}</p>
                            <p style={{ fontSize:12, color:"#9a7080", margin:0 }}>{a.desc}</p>
                          </div>
                        </div>
                        <Link href={a.link}
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#fff", color:"#374151", fontSize:12, fontWeight:600, textDecoration:"none", flexShrink:0 }}>
                          {a.label} <ChevronRight size={13}/>
                        </Link>
                      </div>
                    ))}

                    {/* Info seguridad */}
                    <div style={{ marginTop:24, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:14, padding:"16px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <Shield size={18} style={{ color:"#059669" }}/>
                        <p style={{ fontSize:13, fontWeight:700, color:"#065f46", margin:0 }}>Tu seguridad es importante</p>
                      </div>
                      <p style={{ fontSize:12, color:"#065f46", margin:"0 0 10px", lineHeight:1.6 }}>
                        Nunca compartimos tu información personal con terceros sin tu consentimiento.
                      </p>
                      <button style={{ fontSize:12, fontWeight:600, color:"#059669", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:0, display:"flex", alignItems:"center", gap:4 }}>
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
        <aside style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>
          {/* Progreso */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.04)", textAlign:"center" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:"0 0 16px", textAlign:"left" }}>Tu progreso en el proceso</h3>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
              <DonutProgress pct={pctProceso}/>
            </div>
            <p style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:"#1e1033", margin:"0 0 2px" }}>
              {fasesCompletadas} de 5 fases completadas
            </p>
            <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 14px", lineHeight:1.5 }}>Sigue así, vas por buen camino 💜</p>
            <Link href="/dashboard/proceso" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"1.5px solid #ede9fe", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
              🗺️ Ver mi proceso completo
            </Link>
          </div>

          {/* ¿Necesitas ayuda? */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"#f5f0ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:22 }}>🎧</span>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>¿Necesitas ayuda?</p>
                <p style={{ fontSize:11, color:"#9a7080", margin:0 }}>Estamos aquí para apoyarte.</p>
              </div>
            </div>
            <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 12px", lineHeight:1.5 }}>
              Nuestro equipo está aquí para apoyarte en cada paso.
            </p>
            <Link href="/dashboard/mensajes"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:"#fff", border:"1.5px solid #ece4f0", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"10px", borderRadius:12, textDecoration:"none" }}>
              💬 Escribir a soporte
            </Link>
          </div>

          {/* Seguridad */}
          <div style={{ background:"#fff", borderRadius:20, border:"1px solid #ece4f0", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"#d1fae5", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Shield size={18} style={{ color:"#059669" }}/>
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:"#1e1033", margin:0 }}>Tu seguridad es importante</p>
            </div>
            <p style={{ fontSize:12, color:"#9a7080", margin:"0 0 10px", lineHeight:1.5 }}>
              Nunca compartimos tu información personal con terceros.
            </p>
            <button onClick={()=>setTab("seguridad")}
              style={{ fontSize:12, fontWeight:600, color:"#059669", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:0, display:"flex", alignItems:"center", gap:4 }}>
              Ver más consejos de seguridad <ChevronRight size={12}/>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}