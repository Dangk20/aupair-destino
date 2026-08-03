"use client";
// app/agencia/configuracion/page.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, EyeOff, Lock, Check, AlertCircle,
  User,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

const IC = { width:"100%",border:"1.5px solid #F5E1E7",borderRadius:10,padding:"9px 12px",fontSize:13,color:"#4A2A38",background:"#fff",outline:"none",fontFamily:"inherit",boxSizing:"border-box" };
const LC = { fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:".6px",display:"block",marginBottom:5 };

export default function AgenciaConfiguracionPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const [form, setForm] = useState({ nombre:"", apellido:"", email:"", telefono:"", ciudad:"", pais:"" });
  const [passActual,  setPassActual]  = useState("");
  const [passNuevo,   setPassNuevo]   = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [showPA, setShowPA] = useState(false);
  const [showPN, setShowPN] = useState(false);
  const [showPC, setShowPC] = useState(false);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  useEffect(()=>{
    fetch("/api/auth/me").then(r=>r.ok?r.json():null).then(d=>{
      if (!d?.user) { router.push("/login"); return; }
      setUser(d.user);
      setForm({ nombre:d.user.nombre||"", apellido:d.user.apellido||"", email:d.user.email||"", telefono:d.user.telefono||"", ciudad:d.user.ciudad||"", pais:d.user.pais||"" });
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[router]);

  const guardarPerfil = async() => {
    setSaving(true);
    const res = await fetch("/api/agencia/perfil", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const data = await res.json();
    if (data.ok) showToast("Perfil actualizado");
    else showToast(data.error||"Error","error");
    setSaving(false);
  };

  const cambiarPassword = async(e) => {
    e.preventDefault();
    if (passNuevo !== passConfirm) { showToast("Las contraseñas no coinciden","error"); return; }
    if (passNuevo.length < 8) { showToast("Mínimo 8 caracteres","error"); return; }
    setSaving(true);
    const res = await fetch("/api/agencia/perfil", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ accion:"cambiar_password", password_actual:passActual, password_nuevo:passNuevo }) });
    const data = await res.json();
    if (data.ok) { showToast("Contraseña actualizada"); setPassActual(""); setPassNuevo(""); setPassConfirm(""); }
    else showToast(data.error||"Error","error");
    setSaving(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FBF4F6" }}>
      <div style={{ width:36,height:36,border:"3px solid #A0435F",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#FBF4F6",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:200,background:toast.tipo==="error"?"#C0392B":"#4A2A38",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.15)",display:"flex",alignItems:"center",gap:8 }}>
        {toast.tipo==="error"?<AlertCircle size={14}/>:<Check size={14}/>}{toast.msg}
      </div>}

      {/* HEADER */}
      <div style={{ background:"#fff",borderBottom:"1px solid #F5E1E7",padding:isMobile?"14px 16px":"20px 28px" }}>
        <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?20:24,fontWeight:700,color:"#4A2A38",margin:0 }}>Configuración</h1>
        <p style={{ fontSize:13,color:"#9C8790",margin:"4px 0 0" }}>Actualiza los datos de tu cuenta de agencia.</p>
      </div>

      <div style={{ padding:isMobile?"14px 16px 40px":"20px 28px 40px",maxWidth:900,margin:"0 auto",display:"flex",flexDirection:"column",gap:16 }}>

        {/* Perfil */}
        <div style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#4A2A38",margin:"0 0 20px",display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ width:28,height:28,borderRadius:8,background:"#FCE8EE",display:"inline-flex",alignItems:"center",justifyContent:"center" }}><User size={15} style={{ color:"#A0435F" }}/></span>
            Información de la agencia
          </h2>
          <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14 }}>
            <div>
              <label style={LC}>Nombre</label>
              <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} style={IC} placeholder="Tu nombre"/>
            </div>
            <div>
              <label style={LC}>Apellido</label>
              <input value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} style={IC} placeholder="Tu apellido"/>
            </div>
            <div>
              <label style={LC}>Email</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={IC} placeholder="tu@agencia.com"/>
            </div>
            <div>
              <label style={LC}>Teléfono</label>
              <input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} style={IC} placeholder="+1 555 000 0000"/>
            </div>
            <div>
              <label style={LC}>Ciudad</label>
              <input value={form.ciudad} onChange={e=>setForm({...form,ciudad:e.target.value})} style={IC} placeholder="Nueva York"/>
            </div>
            <div>
              <label style={LC}>País</label>
              <input value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})} style={IC} placeholder="Estados Unidos"/>
            </div>
          </div>
          <button onClick={guardarPerfil} disabled={saving}
            style={{ display:"flex",alignItems:"center",gap:7,background:"#A0435F",color:"#fff",fontSize:13,fontWeight:600,padding:"11px 22px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit",marginTop:20,opacity:saving?.6:1 }}>
            <Save size={13}/>{saving?"Guardando...":"Guardar cambios"}
          </button>
        </div>

        {/* Seguridad */}
        <div style={{ background:"#fff",borderRadius:16,border:"1px solid #F5E1E7",padding:isMobile?16:24,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#4A2A38",margin:"0 0 6px",display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ width:28,height:28,borderRadius:8,background:"#FCE8EE",display:"inline-flex",alignItems:"center",justifyContent:"center" }}><Lock size={15} style={{ color:"#A0435F" }}/></span>
            Cambiar contraseña
          </h2>
          <p style={{ fontSize:13,color:"#9C8790",margin:"0 0 20px" }}>Actualiza tu contraseña de acceso al portal.</p>
          <form onSubmit={cambiarPassword} style={{ maxWidth:420,display:"flex",flexDirection:"column",gap:14 }}>
            {[
              { label:"Contraseña actual",          val:passActual,  set:setPassActual,  show:showPA, setShow:setShowPA },
              { label:"Nueva contraseña",           val:passNuevo,   set:setPassNuevo,   show:showPN, setShow:setShowPN },
              { label:"Confirmar nueva contraseña", val:passConfirm, set:setPassConfirm, show:showPC, setShow:setShowPC },
            ].map(f=>(
              <div key={f.label}>
                <label style={LC}>{f.label}</label>
                <div style={{ position:"relative" }}>
                  <Lock size={13} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#C9A9B4" }}/>
                  <input type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)} required
                    placeholder="••••••••" style={{ ...IC,paddingLeft:34,paddingRight:40 }}/>
                  <button type="button" onClick={()=>f.setShow(s=>!s)}
                    style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9C8790" }}>
                    {f.show?<EyeOff size={14}/>:<Eye size={14}/>}
                  </button>
                </div>
              </div>
            ))}
            {passNuevo && passNuevo.length>=8 && passNuevo===passConfirm && (
              <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#12A46B",fontWeight:600 }}>
                <Check size={13}/> Las contraseñas coinciden
              </div>
            )}
            <button type="submit" disabled={saving||!passActual||!passNuevo||!passConfirm}
              style={{ padding:"11px",borderRadius:12,border:"none",background:"#A0435F",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:(!passActual||!passNuevo||!passConfirm)?.5:1 }}>
              <Lock size={13}/>{saving?"Actualizando...":"Actualizar contraseña"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}