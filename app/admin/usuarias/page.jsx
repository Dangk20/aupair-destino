"use client";

import { useEffect, useState } from "react";
import {
  Unlock as UnlockIcon, Gift as GiftIcon, TrendingUp as TrendingUpIcon,
  GraduationCap as GraduationCapIcon, UserCheck as UserCheckIcon,
  Building2 as Building2Icon, BarChart2 as BarChart2Icon, Tag as TagIcon,
  SearchIcon, UserIcon, DownloadIcon, PlusIcon, EyeIcon,
  PencilIcon, XIcon, CheckIcon,
  BookOpenIcon, FileTextIcon, CalendarIcon,
  MessageCircleIcon, UsersIcon, ShieldIcon, CreditCardIcon,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

const SECCIONES = [
  { key:"tiene_acceso",      label:"Sesiones",   icon:BookOpenIcon,      color:"#12A46B", bg:"#E6F9F0" },
  { key:"perfil_habilitado", label:"Perfil",     icon:UserIcon,          color:"#A0435F", bg:"#FCE8EE" },
  { key:"acceso_documentos", label:"Documentos", icon:FileTextIcon,      color:"#4A2A38", bg:"#FCE8EE" },
  { key:"acceso_recursos",   label:"Recursos",   icon:ShieldIcon,        color:"#E8853B", bg:"#FFF4EC" },
  { key:"acceso_reuniones",  label:"Reuniones",  icon:CalendarIcon,      color:"#A0435F", bg:"#FCE8EE" },
  { key:"acceso_mensajes",   label:"Mensajes",   icon:MessageCircleIcon, color:"#12A46B", bg:"#E6F9F0" },
  { key:"acceso_comunidad",  label:"Comunidad",  icon:UsersIcon,         color:"#A0435F", bg:"#FBF4F6" },
];

function Toggle({ active, onChange, color="#12A46B", disabled=false }) {
  return (
    <button onClick={()=>!disabled&&onChange(!active)} disabled={disabled}
      style={{ width:36,height:20,borderRadius:99,border:"none",cursor:disabled?"not-allowed":"pointer",background:active?color:"#e0d0d8",position:"relative",transition:"background .2s",flexShrink:0,opacity:disabled?.5:1 }}>
      <div style={{ width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:active?19:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)" }}/>
    </button>
  );
}

function ModalVer({ u, onClose }) {
  if (!u) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#A0435F] via-[#C77D93] to-[#A0435F]"/>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E1E7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FCE8EE] border-2 border-[#C77D93] overflow-hidden flex items-center justify-center">
              {u.foto_url?<img src={u.foto_url} alt="" className="w-full h-full object-cover"/>:<span className="text-[#A0435F] font-bold font-serif">{u.nombre?.[0]}</span>}
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#4A2A38]">{u.nombre} {u.apellido}</h3>
              <p className="text-[11px] text-[#9C8790]">{u.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FCE8EE] flex items-center justify-center"><XIcon size={14} className="text-[#A0435F]"/></button>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          {[
            {label:"ID",              val:`#${u.id}`},
            {label:"Progreso",        val:`${u.porcentaje||0}% (${u.sesiones_completadas||0} ses.)`},
            {label:"Código referido", val:u.codigo_referido||"Sin código"},
            {label:"Código promo",    val:u.codigo_promo_usado||"—"},
            {label:"Referida por",    val:u.referente_nombre||"—"},
            {label:"Pago",            val:u.monto_pagado?`$${u.monto_pagado} USD`:"—"},
            {label:"Comisión",        val:u.comision_generada?`$${u.comision_generada} USD`:"—"},
            {label:"Registro",        val:u.created_at?new Date(u.created_at).toLocaleDateString("es-CO"):"—"},
          ].map((s,i)=>(
            <div key={i} className="bg-[#FBF4F6] border border-[#F5E1E7] rounded-xl px-3 py-2.5">
              <p className="text-[9px] text-[#9C8790] uppercase tracking-wide mb-0.5">{s.label}</p>
              <p className="text-[12px] font-bold text-[#4A2A38]">{s.val}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-2">
          <p className="text-[10px] font-bold text-[#9C8790] uppercase tracking-wide mb-2">Accesos activos</p>
          <div className="flex flex-wrap gap-2">
            {SECCIONES.map(s=>{
              const activo=u[s.key]; const Icon=s.icon;
              return (
                <div key={s.key} style={{ display:"flex",alignItems:"center",gap:5,background:activo?s.bg:"#FBF4F6",borderRadius:99,padding:"4px 10px" }}>
                  <Icon size={11} style={{ color:activo?s.color:"#C9A9B4" }}/>
                  <span style={{ fontSize:11,fontWeight:600,color:activo?s.color:"#C9A9B4" }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="px-5 pb-5 pt-3">
          <button onClick={onClose} className="w-full bg-[#A0435F] text-white font-semibold text-[13px] py-3 rounded-xl">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function ModalEditar({ u, onClose, onSave }) {
  const [form, setForm] = useState({ nombre:u.nombre||"", apellido:u.apellido||"", email:u.email||"" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#A0435F] via-[#C77D93] to-[#A0435F]"/>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E1E7]">
          <h3 className="font-bold text-[16px] text-[#4A2A38]">Editar usuario</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FCE8EE] flex items-center justify-center"><XIcon size={14} className="text-[#A0435F]"/></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[{label:"Nombre",key:"nombre"},{label:"Apellido",key:"apellido"},{label:"Email",key:"email"}].map(f=>(
            <div key={f.key}>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-[#4A2A38] mb-1">{f.label}</label>
              <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                className="w-full border border-[#F5E1E7] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#C77D93] bg-[#FBF4F6]"/>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border-2 border-[#F5E1E7] text-[#9C8790] font-semibold text-[13px] py-3 rounded-xl">Cancelar</button>
          <button onClick={()=>{onSave(u.id,form);onClose();}} className="flex-1 bg-[#A0435F] text-white font-semibold text-[13px] py-3 rounded-xl">Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ModalNuevo({ onClose, onSave }) {
  const [form, setForm] = useState({ nombre:"",apellido:"",email:"",password:"" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#A0435F] via-[#C77D93] to-[#A0435F]"/>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E1E7]">
          <h3 className="font-bold text-[16px] text-[#4A2A38]">Nuevo usuario</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FCE8EE] flex items-center justify-center"><XIcon size={14} className="text-[#A0435F]"/></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[{label:"Nombre",key:"nombre",type:"text"},{label:"Apellido",key:"apellido",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Contraseña",key:"password",type:"password"}].map(f=>(
            <div key={f.key}>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-[#4A2A38] mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                className="w-full border border-[#F5E1E7] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#C77D93] bg-[#FBF4F6]"/>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border-2 border-[#F5E1E7] text-[#9C8790] font-semibold text-[13px] py-3 rounded-xl">Cancelar</button>
          <button onClick={()=>{onSave(form);onClose();}} className="flex-1 bg-[#A0435F] text-white font-semibold text-[13px] py-3 rounded-xl">Crear</button>
        </div>
      </div>
    </div>
  );
}

function ModalCambiarRol({ u, onClose, onCambiar, cargando }) {
  const [paso, setPaso] = useState(1); // 1: seleccionar rol, 2: configurar código (si asociada)
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [codigoPersonalizado, setCodigoPersonalizado] = useState("");
  const [codigoGenerado, setCodigoGenerado] = useState(null);

  const rolesDisponibles = [
    { valor: "usuaria", label: "Usuaria (Estudiante)", color: "bg-blue-100 text-blue-700", icon: "👩‍🎓" },
    { valor: "asociada", label: "Asociada (Asesora)", color: "bg-purple-100 text-purple-700", icon: "👩‍🏫" },
    { valor: "agencia", label: "Agencia", color: "bg-amber-100 text-amber-700", icon: "🏢" },
    { valor: "admin", label: "Admin (Administrador)", color: "bg-red-100 text-red-700", icon: "👨‍💼" },
  ];

  const handleSeleccionarRol = (nuevoRol) => {
    setRolSeleccionado(nuevoRol);
    
    // Si es asociada, ir al paso 2; si no, aplicar directamente
    if (nuevoRol === "asociada") {
      setPaso(2);
    } else {
      onCambiar(u.id, nuevoRol);
      handleCerrar();
    }
  };

  const handleConfirmarCambio = async () => {
    if (rolSeleccionado === "asociada") {
      // Pasar el código personalizado si existe
      await onCambiar(u.id, rolSeleccionado, codigoPersonalizado);
    }
    handleCerrar();
  };

  const handleCerrar = () => {
    setPaso(1);
    setRolSeleccionado(null);
    setCodigoPersonalizado("");
    setCodigoGenerado(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/50 backdrop-blur-sm" onClick={handleCerrar}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#A0435F] via-[#A0435F] to-[#A0435F]"/>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E1E7]">
          <div>
            <h3 className="font-bold text-[16px] text-[#4A2A38]">
              {paso === 1 ? "Cambiar rol de usuario" : "Configurar código de referido"}
            </h3>
            <p className="text-[11px] text-[#9C8790]">{u.nombre} {u.apellido}</p>
          </div>
          <button onClick={handleCerrar} className="w-8 h-8 rounded-full bg-[#FCE8EE] flex items-center justify-center"><XIcon size={14} className="text-[#A0435F]"/></button>
        </div>

        {paso === 1 ? (
          // PASO 1: Seleccionar rol
          <div className="px-5 py-4 space-y-2">
            {rolesDisponibles.map(rol => (
              <button
                key={rol.valor}
                onClick={() => handleSeleccionarRol(rol.valor)}
                disabled={u.rol === rol.valor || cargando === u.id}
                className={`w-full p-4 rounded-xl border-2 transition text-left font-medium text-[13px] ${
                  u.rol === rol.valor
                    ? `${rol.color} opacity-50 cursor-not-allowed border-opacity-50`
                    : `${rol.color} hover:opacity-80 active:opacity-100 cursor-pointer border-opacity-0 hover:border-opacity-20`
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{rol.icon} {rol.label}</span>
                  {cargando === u.id && <div className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          // PASO 2: Configurar código para asociada
          <div className="px-5 py-4 space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <p className="text-[11px] text-[#A0435F] font-semibold mb-1">CÓDIGO DE REFERIDO</p>
              <p className="text-[12px] text-purple-700">
                Las nuevas usuarias que se registren con este código serán asignadas automáticamente a esta asesora.
              </p>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#4A2A38] mb-2 block">
                Código personalizado (opcional)
              </label>
              <input
                type="text"
                value={codigoPersonalizado}
                onChange={(e) => setCodigoPersonalizado(e.target.value.toUpperCase())}
                placeholder="Ej: ANA2024, PROMO001..."
                className="w-full px-3 py-2 border border-[#e0d0d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A0435F] font-mono text-[12px]"
              />
              <p className="text-[10px] text-[#9C8790] mt-1">
                Dejar vacío para generar uno automáticamente
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPaso(1)}
                className="flex-1 px-3 py-2 border border-[#F5E1E7] text-[#9C8790] rounded-xl font-medium text-[12px] hover:bg-[#FBF4F6]"
              >
                ← Atrás
              </button>
              <button
                onClick={handleConfirmarCambio}
                disabled={cargando === u.id}
                className="flex-1 px-3 py-2 bg-[#A0435F] text-white rounded-xl font-medium text-[12px] hover:bg-[#A0435F] disabled:opacity-50"
              >
                {cargando === u.id ? "Procesando..." : "Cambiar a Asesora"}
              </button>
            </div>
          </div>
        )}

        <div className="px-5 pb-5 border-t border-[#F5E1E7]">
          <button onClick={handleCerrar} className="w-full border border-[#F5E1E7] text-[#9C8790] text-[13px] font-semibold py-3 rounded-xl mt-3">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function ModalAccesos({ u, onClose, onToggle }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#A0435F] via-[#C77D93] to-[#A0435F]"/>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E1E7]">
          <div>
            <h3 className="font-bold text-[16px] text-[#4A2A38]">Gestionar accesos</h3>
            <p className="text-[11px] text-[#9C8790]">{u.nombre} {u.apellido}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FCE8EE] flex items-center justify-center"><XIcon size={14} className="text-[#A0435F]"/></button>
        </div>
        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {SECCIONES.map(sec=>{
            const Icon=sec.icon, activo=!!u[sec.key];
            return (
              <div key={sec.key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:activo?sec.bg+"80":"#FBF4F6",borderRadius:14,border:`1px solid ${activo?sec.bg:"#F5E1E7"}` }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:32,height:32,borderRadius:10,background:activo?sec.bg:"#FBF4F6",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <Icon size={15} style={{ color:activo?sec.color:"#C9A9B4" }}/>
                  </div>
                  <div>
                    <p style={{ fontSize:13,fontWeight:600,color:activo?"#4A2A38":"#9C8790",margin:0 }}>{sec.label}</p>
                    <p style={{ fontSize:10,color:activo?sec.color:"#C9A9B4",margin:0,fontWeight:600 }}>{activo?"Activo":"Desactivado"}</p>
                  </div>
                </div>
                <Toggle active={activo} color={sec.color} onChange={(val)=>onToggle(u.id,sec.key,val)}/>
              </div>
            );
          })}
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full border border-[#F5E1E7] text-[#9C8790] text-[13px] font-semibold py-3 rounded-xl">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Pago — versión corregida con type="button" explícito ── */
function ModalPago({ usuaria, titulo, subtitulo, gradiente, onClose, onConfirmar }) {
  const [monto, setMonto] = useState(String(usuaria.monto_pagado||"35"));
  const [guardando, setGuardando] = useState(false);

  const handleConfirmar = async () => {
    if (monto === "" || Number(monto) < 0) return;
    setGuardando(true);
    await onConfirmar(monto);
    setGuardando(false);
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(45,26,34,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:400,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ height:4,background:gradiente||"linear-gradient(90deg,#A0435F,#C77D93)" }}/>
        <div style={{ padding:24 }}>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#4A2A38",margin:"0 0 6px" }}>{titulo}</h2>
          <p style={{ fontSize:13,color:"#9C8790",margin:"0 0 20px" }}>{subtitulo} <strong>{usuaria.nombre} {usuaria.apellido}</strong></p>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <span style={{ fontSize:11,fontWeight:700,color:"#4A2A38",textTransform:"uppercase",letterSpacing:.6 }}>Monto (USD)</span>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#9C8790",fontWeight:600 }}>$</span>
              <input
                type="number" min="0" step="1" value={monto}
                onChange={e=>setMonto(e.target.value)}
                autoFocus
                style={{ width:"100%",border:"1.5px solid #F5E1E7",borderRadius:12,padding:"10px 14px 10px 32px",fontSize:16,fontWeight:700,color:"#4A2A38",outline:"none",boxSizing:"border-box" }}
              />
            </div>
            <div style={{ display:"flex",gap:8,marginTop:4 }}>
              {["0","29","35","300"].map(p=>(
                <button key={p} type="button" onClick={()=>setMonto(p)}
                  style={{ flex:1,padding:"7px",borderRadius:10,border:`1.5px solid ${monto===p?"#A0435F":"#F5E1E7"}`,background:monto===p?"#FCE8EE":"#fff",color:monto===p?"#A0435F":"#9C8790",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                  ${p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",gap:10,marginTop:20 }}>
            <button type="button" onClick={onClose}
              style={{ flex:1,padding:"10px",borderRadius:12,border:"1.5px solid #F5E1E7",background:"#fff",color:"#9C8790",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={monto===""||Number(monto)<0||guardando}
              style={{ flex:2,padding:"10px",borderRadius:12,border:"none",background:(monto===""||Number(monto)<0)?"#F5E1E7":"#A0435F",color:(monto===""||Number(monto)<0)?"#C9A9B4":"#fff",fontSize:13,fontWeight:600,cursor:guardando?"wait":"pointer",fontFamily:"inherit",opacity:guardando?.7:1 }}>
              {guardando?"Guardando...":"✓ Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function AdminUsuariosPage() {
  const { isMobile } = useMobile();

  const [usuarios,      setUsuarios]      = useState([]);
  const [stats,         setStats]         = useState(null);
  const [actividad,     setActividad]     = useState([]);
  const [topRef,        setTopRef]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [codigoFiltro,  setCodigoFiltro]  = useState("");
  const [tabActivo,     setTabActivo]     = useState("todos");
  const [ordenar,       setOrdenar]       = useState("recientes");
  const [modalVer,          setModalVer]          = useState(null);
  const [modalEditar,       setModalEditar]       = useState(null);
  const [modalNuevo,        setModalNuevo]        = useState(false);
  const [modalAccesos,      setModalAccesos]      = useState(null);
  const [modalPago,         setModalPago]         = useState(null);
  const [modalEditPago,     setModalEditPago]     = useState(null);
  const [modalCambiarRol,   setModalCambiarRol]   = useState(null);
  const [cargandoRol,       setCargandoRol]       = useState(null);
  const [toast,             setToast]             = useState(null);
  const [pagina,            setPagina]            = useState(1);
  const POR_PAGINA = isMobile ? 6 : 8;

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = async() => {
    setLoading(true);
    try {
      const [uRes,sRes,aRes,tRes] = await Promise.all([
        fetch("/api/admin/usuarias"),
        fetch("/api/admin/usuarios/stats"),
        fetch("/api/admin/usuarios/actividad"),
        fetch("/api/admin/usuarios/top-referentes"),
      ]);
      const [uData,sData,aData,tData] = await Promise.all([uRes.json(),sRes.json(),aRes.json(),tRes.json()]);
      setUsuarios(uData.usuarias||[]);
      setStats(sData);
      setActividad(aData.actividad||[]);
      setTopRef(tData.referentes||[]);
    } catch { showToast("Error cargando datos","error"); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ cargar(); },[]);

  const toggleAcceso = (u) => {
    if (!u.tiene_acceso) setModalPago(u);
    else confirmarToggle(u.id, false, 0);
  };

  const confirmarToggle = async(id, tiene_acceso, monto) => {
    setModalPago(null);
    const res = await fetch("/api/admin/toggle-acceso", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, tiene_acceso, monto: Number(monto) }),
    });
    const data = await res.json();
    if (data.ok) {
      showToast(tiene_acceso ? "✓ Acceso activado" : "Acceso desactivado");
      await cargar();
    } else {
      showToast(data.error || "Error al actualizar acceso", "error");
    }
  };

  const toggleSeccion = async(usuarioId, seccion, valor) => {
    setUsuarios(prev=>prev.map(u=>u.id===usuarioId?{...u,[seccion]:valor?1:0}:u));
    setModalAccesos(prev=>prev?{...prev,[seccion]:valor?1:0}:prev);
    const res = await fetch("/api/admin/toggle-acceso", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id:usuarioId, seccion, valor }),
    });
    const data = await res.json();
    if (!data.ok) {
      setUsuarios(prev=>prev.map(u=>u.id===usuarioId?{...u,[seccion]:!valor?1:0}:u));
      showToast("Error al actualizar","error");
    } else {
      showToast(`${SECCIONES.find(s=>s.key===seccion)?.label} ${valor?"activado":"desactivado"} ✓`);
    }
  };

  const corregirMonto = async(usuarioId, monto) => {
  try {
    const res = await fetch("/api/admin/toggle-acceso", {
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ usuario_id: usuarioId, monto: Number(monto) }),
    });
    const data = await res.json();
    if (data.ok) {
      setModalEditPago(null); // ← cerrar DESPUÉS del fetch
      showToast("Monto corregido ✓");
      await cargar();
    } else {
      showToast(data.error || "Error al corregir monto", "error");
    }
  } catch(e) {
    showToast("Error de conexión", "error");
  }
};

  const guardarEdicion = async(id, form) => {
    await fetch(`/api/admin/usuarias/${id}`, {method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    showToast("Usuario actualizado ✓");
    await cargar();
  };

  const crearUsuario = async(form) => {
    const res = await fetch("/api/auth/register", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    if (res.ok) { showToast("Usuario creado ✓"); await cargar(); }
    else showToast("Error al crear usuario","error");
  };

  const handleCambiarRol = async(usuarioId, nuevoRol, codigoReferido) => {
    setCargandoRol(usuarioId);
    try {
      const body = { nuevoRol };
      if (codigoReferido) {
        body.codigoReferido = codigoReferido;
      }
      
      const res = await fetch(`/api/admin/usuarios/${usuarioId}/cambiar-rol`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        const roleNames = {
          "asociada": "Asociada",
          "admin": "Admin",
          "usuaria": "Usuaria",
          "agencia": "Agencia"
        };
        let message = `Rol cambiado a ${roleNames[nuevoRol]} ✓`;
        if (data.codigoReferido) {
          message += ` | Código: ${data.codigoReferido}`;
        }
        showToast(message);
        setModalCambiarRol(null);
        await cargar();
      } else {
        showToast(data.error || "Error al cambiar rol", "error");
      }
    } catch(err) {
      console.error("Error changing role:", err);
      showToast("Error al cambiar el rol", "error");
    } finally {
      setCargandoRol(null);
    }
  };

  const exportar = () => {
    const lineas = ["ID|Nombre|Email|Progreso|Código|Pago",
      ...filtrados.map(u=>`${u.id}|${u.nombre} ${u.apellido}|${u.email}|${u.porcentaje||0}%|${u.codigo_referido||"—"}|${u.tiene_acceso?`$${u.monto_pagado||35} USD`:"Gratis"}`)
    ].join("\n");
    const a = Object.assign(document.createElement("a"),{href:`data:text/plain;charset=utf-8,${encodeURIComponent(lineas)}`,download:"usuarios.txt"});
    a.click(); showToast("Exportado ✓");
  };

  const hoy = new Date();
  const esteMes = u=>{ const d=new Date(u.created_at); return d.getMonth()===hoy.getMonth()&&d.getFullYear()===hoy.getFullYear(); };
  const tabs = [
    {id:"todos",     label:"Todos",      count:usuarios.length},
    {id:"acceso",    label:"Con acceso", count:usuarios.filter(u=>u.tiene_acceso).length},
    {id:"gratis",    label:"Gratis",     count:usuarios.filter(u=>!u.tiene_acceso).length},
    {id:"inactivos", label:"Inactivos",  count:usuarios.filter(u=>!u.sesiones_completadas).length},
    {id:"nuevos",    label:"Este mes",   count:usuarios.filter(esteMes).length},
  ];

  let filtrados = usuarios.filter(u=>{
    const q=search.toLowerCase();
    return (!q||`${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q))
      &&(!codigoFiltro||(u.codigo_referido||"").toLowerCase().includes(codigoFiltro.toLowerCase()))
      &&(tabActivo==="todos"||tabActivo==="acceso"&&u.tiene_acceso||tabActivo==="gratis"&&!u.tiene_acceso||tabActivo==="inactivos"&&!u.sesiones_completadas||esteMes(u));
  });
  if (ordenar==="recientes") filtrados=[...filtrados].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  else if (ordenar==="progreso") filtrados=[...filtrados].sort((a,b)=>(b.porcentaje||0)-(a.porcentaje||0));
  else if (ordenar==="nombre") filtrados=[...filtrados].sort((a,b)=>a.nombre.localeCompare(b.nombre));

  const totalPags = Math.ceil(filtrados.length/POR_PAGINA);
  const paginados = filtrados.slice((pagina-1)*POR_PAGINA, pagina*POR_PAGINA);
  const s = stats||{total:0,conAcceso:0,soloGratis:0,conversion:0};

  return (
    <div style={{ display:"flex",gap:20,padding:isMobile?"14px 16px":"20px 28px",background:"#FBF4F6",minHeight:"100%",flexDirection:isMobile?"column":"row" }}>
      <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:16 }}>

        {toast && (
          <div style={{ position:"fixed",top:20,right:20,zIndex:100,display:"flex",alignItems:"center",gap:8,padding:"12px 18px",borderRadius:16,boxShadow:"0 8px 24px rgba(0,0,0,.15)",fontSize:13,fontWeight:600,color:"#fff",background:toast.tipo==="error"?"#C0392B":"#A0435F" }}>
            <CheckIcon size={14}/>{toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif",fontWeight:700,color:"#4A2A38",fontSize:isMobile?20:24,margin:0 }}>Usuarios registrados</h1>
            <p style={{ fontSize:12,color:"#9C8790",margin:"2px 0 0" }}>Administra estudiantes, acceso y secciones.</p>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={exportar} style={{ display:"flex",alignItems:"center",gap:5,color:"#A0435F",fontSize:12,fontWeight:600,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit" }}>
              <DownloadIcon size={14}/>Exportar
            </button>
            <button onClick={()=>setModalNuevo(true)}
              style={{ display:"flex",alignItems:"center",gap:5,background:"#A0435F",color:"#fff",fontSize:12,fontWeight:600,padding:"8px 14px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit" }}>
              <PlusIcon size={13}/>Nuevo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[
            // Estas tarjetas mostraban "+18% este mes", "+22%"… escritos a mano,
            // con flechita verde incluida. Nadie los calculaba: eran inventados,
            // igual que las métricas que se retiraron del Resumen en el Sprint 1.
            // Fuera. La cifra que sí es real se queda; la variación no existe
            // hasta que haya con qué compararla.
            {Icono:UsersIcon,      label:"Usuarios totales",       val:s.total?.toLocaleString("es-CO")},
            {Icono:UnlockIcon,     label:"Con acceso completo",    val:s.conAcceso?.toLocaleString("es-CO")},
            {Icono:GiftIcon,       label:"Solo bienvenida gratis", val:s.soloGratis?.toLocaleString("es-CO")},
            {Icono:TrendingUpIcon, label:"Conversión total",       val:`${s.conversion||0}%`},
          ].map((st,i)=>(
            <div key={i} style={{ background:"#fff",border:"1px solid #F5E1E7",borderRadius:16,padding:isMobile?"12px":"16px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <st.Icono size={isMobile?18:20} style={{ color:"#A0435F",marginBottom:8 }}/>
              <p style={{ fontSize:10,color:"#9C8790",margin:"0 0 2px",lineHeight:1.3 }}>{st.label}</p>
              <p style={{ fontFamily:"Georgia,serif",fontWeight:700,fontSize:isMobile?20:24,color:"#4A2A38",margin:0,lineHeight:1 }}>{st.val||0}</p>
            </div>
          ))}
        </div>

        {/* Búsqueda */}
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <div style={{ flex:1,position:"relative",minWidth:160 }}>
            <SearchIcon size={13} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#C9A9B4" }}/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPagina(1);}} placeholder="Buscar por nombre o email..."
              style={{ width:"100%",paddingLeft:30,paddingRight:12,height:38,border:"1.5px solid #F5E1E7",borderRadius:12,fontSize:12,color:"#4A2A38",outline:"none",boxSizing:"border-box",fontFamily:"inherit" }}/>
          </div>
          {!isMobile && (
            <div style={{ position:"relative" }}>
              <SearchIcon size={13} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#C9A9B4" }}/>
              <input value={codigoFiltro} onChange={e=>{setCodigoFiltro(e.target.value);setPagina(1);}} placeholder="Código referido"
                style={{ paddingLeft:30,paddingRight:12,height:38,width:150,border:"1.5px solid #F5E1E7",borderRadius:12,fontSize:12,color:"#4A2A38",outline:"none",fontFamily:"inherit" }}/>
            </div>
          )}
          <select value={ordenar} onChange={e=>setOrdenar(e.target.value)}
            style={{ height:38,border:"1.5px solid #F5E1E7",borderRadius:12,padding:"0 12px",fontSize:12,color:"#4A2A38",background:"#fff",outline:"none",fontFamily:"inherit" }}>
            <option value="recientes">Recientes</option>
            <option value="progreso">Progreso</option>
            <option value="nombre">Nombre</option>
          </select>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2 }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>{setTabActivo(t.id);setPagina(1);}}
              style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,border:"none",cursor:"pointer",fontSize:isMobile?11:12,fontWeight:tabActivo===t.id?700:500,whiteSpace:"nowrap",fontFamily:"inherit",transition:"all .12s",
                color:tabActivo===t.id?"#A0435F":"#9C8790",
                borderBottom:tabActivo===t.id?"2px solid #A0435F":"2px solid transparent",
                background:"transparent",
              }}>
              {t.label}
              <span style={{ fontSize:10,padding:"1px 6px",borderRadius:99,fontWeight:700,background:tabActivo===t.id?"#FCE8EE":"#FBF4F6",color:tabActivo===t.id?"#A0435F":"#9C8790" }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Tabla / Cards */}
        <div style={{ background:"#fff",borderRadius:20,border:"1px solid #F5E1E7",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
          {loading ? (
            <div style={{ padding:"48px 24px",display:"flex",justifyContent:"center" }}>
              <div style={{ width:32,height:32,border:"2px solid #C77D93",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : paginados.length===0 ? (
            <p style={{ padding:"48px 24px",textAlign:"center",fontSize:13,color:"#9C8790" }}>No se encontraron usuarios.</p>
          ) : isMobile ? (
            <div style={{ display:"flex",flexDirection:"column" }}>
              {paginados.map((u,i)=>{
                const secActivas = SECCIONES.filter(s=>u[s.key]);
                return (
                  <div key={u.id} style={{ padding:"14px 16px",borderBottom:i<paginados.length-1?"1px solid #FBEEF1":"none" }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
                        <div style={{ width:38,height:38,borderRadius:"50%",background:"#FCE8EE",border:"2px solid #C77D93",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          {u.foto_url?<img src={u.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ color:"#A0435F",fontSize:12,fontWeight:700 }}>{u.nombre?.[0]}</span>}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:13,fontWeight:600,color:"#4A2A38",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.nombre} {u.apellido}</p>
                          <p style={{ fontSize:11,color:"#9C8790",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.email}</p>
                        </div>
                      </div>
                      <span style={{ fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,flexShrink:0,
                        background:u.tiene_acceso?"#E6F9F0":!u.sesiones_completadas?"#FBF4F6":"#FFF4EC",
                        color:u.tiene_acceso?"#12A46B":!u.sesiones_completadas?"#A0435F":"#E8853B",
                      }}>
                        {u.tiene_acceso?"✓ Acceso":!u.sesiones_completadas?"Inactivo":"Gratis"}
                      </span>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                          <div style={{ flex:1,height:5,background:"#F5E1E7",borderRadius:99,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${u.porcentaje||0}%`,background:"linear-gradient(90deg,#A0435F,#C77D93)",borderRadius:99 }}/>
                          </div>
                          <span style={{ fontSize:10,color:"#9C8790",flexShrink:0 }}>{u.porcentaje||0}%</span>
                        </div>
                        <p style={{ fontSize:10,color:"#C9A9B4",margin:0 }}>{u.sesiones_completadas||0}/8 sesiones</p>
                      </div>
                      <div style={{ display:"flex",gap:4 }}>
                        {secActivas.slice(0,4).map(sec=>{
                          const Icon=sec.icon;
                          return <div key={sec.key} style={{ width:22,height:22,borderRadius:7,background:sec.bg,display:"flex",alignItems:"center",justifyContent:"center" }} title={sec.label}><Icon size={11} style={{ color:sec.color }}/></div>;
                        })}
                        {secActivas.length>4&&<span style={{ fontSize:10,color:"#9C8790",fontWeight:700 }}>+{secActivas.length-4}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={()=>setModalVer(u)} style={{ flex:1,padding:"7px",borderRadius:10,border:"1.5px solid #F5E1E7",background:"#fff",fontSize:11,fontWeight:600,color:"#A0435F",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
                        <EyeIcon size={12}/>Ver
                      </button>
                      <button onClick={()=>setModalEditar(u)} style={{ flex:1,padding:"7px",borderRadius:10,border:"1.5px solid #F5E1E7",background:"#fff",fontSize:11,fontWeight:600,color:"#A0435F",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
                        <PencilIcon size={12}/>Editar
                      </button>
                      <button onClick={()=>setModalCambiarRol(u)} style={{ flex:1,padding:"7px",borderRadius:10,border:"1.5px solid #FCE8EE",background:"#FBF4F6",fontSize:11,fontWeight:600,color:"#A0435F",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
                        <ShieldIcon size={12}/>Rol
                      </button>
                      <button onClick={()=>setModalAccesos(u)} style={{ flex:1,padding:"7px",borderRadius:10,border:"1.5px solid #E6F9F0",background:"#E6F9F0",fontSize:11,fontWeight:600,color:"#12A46B",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
                        <ShieldIcon size={12}/>Accesos
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div style={{ padding:"10px 16px",borderBottom:"1px solid #FCE8EE",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px",gap:12 }}>
                {["Usuario","Rol","Estado","Progreso","Código","Pago","Accesos","Acciones"].map((h,i)=>(
                  <p key={i} style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",color:"#9C8790",margin:0 }}>{h}</p>
                ))}
              </div>
              <div>
                {paginados.map((u,i)=>{
                  const secActivas=SECCIONES.filter(s=>u[s.key]);
                  return (
                    <div key={u.id} style={{ padding:"12px 16px",borderBottom:i<paginados.length-1?"1px solid #FBEEF1":"none",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px",gap:12,alignItems:"center" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
                        <div style={{ width:34,height:34,borderRadius:"50%",background:"#FCE8EE",border:"2px solid #C77D93",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          {u.foto_url?<img src={u.foto_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span style={{ color:"#A0435F",fontSize:11,fontWeight:700 }}>{u.nombre?.[0]}</span>}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:12,fontWeight:600,color:"#4A2A38",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.nombre} {u.apellido}</p>
                          <p style={{ fontSize:10,color:"#9C8790",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.email}</p>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:99,whiteSpace:"nowrap",background:u.rol==="admin"?"#FDECEC":u.rol==="asociada"?"#FCE8EE":u.rol === "agencia" ? "#FFF4EC" :"#FCE8EE",color:u.rol==="admin"?"#991b1b":u.rol==="asociada"?"#7D2F47": u.rol === "agencia" ? "#a16207" :"#1e40af" }}>
                          {u.rol==="admin"?"Admin":u.rol==="asociada"?"Asociada":u.rol==="agencia"?"Agencia":"Candidata"}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:99,whiteSpace:"nowrap",background:u.tiene_acceso?"#E6F9F0":!u.sesiones_completadas?"#FBF4F6":"#FFF4EC",color:u.tiene_acceso?"#12A46B":!u.sesiones_completadas?"#A0435F":"#E8853B" }}>
                          {u.tiene_acceso?"✓ Acceso":!u.sesiones_completadas?"Inactivo":"Gratis"}
                        </span>
                      </div>
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                          <div style={{ flex:1,height:5,background:"#F5E1E7",borderRadius:99,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${u.porcentaje||0}%`,background:"linear-gradient(90deg,#A0435F,#C77D93)",borderRadius:99 }}/>
                          </div>
                          <span style={{ fontSize:10,color:"#9C8790",flexShrink:0 }}>{u.porcentaje||0}%</span>
                        </div>
                        <p style={{ fontSize:9,color:"#C9A9B4",margin:0 }}>{u.sesiones_completadas||0}/8 ses.</p>
                      </div>
                      <div>
                        {u.codigo_referido
                          ? <span style={{ fontSize:11,fontWeight:700,color:"#A0435F" }}>{u.codigo_referido}</span>
                          : u.codigo_promo_usado
                          ? <span style={{ fontSize:11,fontWeight:700,color:"#A0435F",display:"inline-flex",alignItems:"center",gap:4 }}><TagIcon size={11}/>{u.codigo_promo_usado}</span>
                          : <span style={{ fontSize:10,color:"#C9A9B4" }}>—</span>}
                      </div>
                      <div>
                        {u.tiene_acceso?(
                          <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                            <div>
                              <p style={{ fontSize:11,fontWeight:700,color:"#4A2A38",margin:0 }}>{u.monto_pagado?`$${u.monto_pagado} USD`:"$35 USD"}</p>
                              <span style={{ fontSize:9,background:"#E6F9F0",color:"#12A46B",fontWeight:700,padding:"1px 6px",borderRadius:99 }}>Pagado</span>
                            </div>
                            <button
                              type="button"
                              onClick={()=>setModalEditPago({...u})}
                              style={{ width:20,height:20,borderRadius:6,background:"#FFF4EC",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                              <PencilIcon size={9} style={{ color:"#E8853B" }}/>
                            </button>
                          </div>
                        ):<span style={{ fontSize:10,color:"#C9A9B4" }}>—</span>}
                      </div>
                      <div style={{ display:"flex",gap:3,flexWrap:"wrap" }}>
                        {secActivas.length===0?<span style={{ fontSize:10,color:"#C9A9B4" }}>Ninguno</span>:secActivas.slice(0,3).map(sec=>{
                          const Icon=sec.icon;
                          return <div key={sec.key} style={{ width:20,height:20,borderRadius:6,background:sec.bg,display:"flex",alignItems:"center",justifyContent:"center" }} title={sec.label}><Icon size={10} style={{ color:sec.color }}/></div>;
                        })}
                        {secActivas.length>3&&<span style={{ fontSize:10,color:"#9C8790",fontWeight:700 }}>+{secActivas.length-3}</span>}
                      </div>
                      <div style={{ display:"flex",gap:4 }}>
                        <button type="button" onClick={()=>setModalVer(u)} style={{ width:28,height:28,borderRadius:8,background:"#FCE8EE",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <EyeIcon size={12} style={{ color:"#A0435F" }}/>
                        </button>
                        <button type="button" onClick={()=>setModalEditar(u)} style={{ width:28,height:28,borderRadius:8,background:"#FCE8EE",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <PencilIcon size={12} style={{ color:"#A0435F" }}/>
                        </button>
                        <button type="button" onClick={()=>setModalCambiarRol(u)} style={{ width:28,height:28,borderRadius:8,background:"#FCE8EE",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <ShieldIcon size={12} style={{ color:"#A0435F" }}/>
                        </button>
                        <button type="button" onClick={()=>setModalAccesos(u)} style={{ width:28,height:28,borderRadius:8,background:"#E6F9F0",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <ShieldIcon size={12} style={{ color:"#12A46B" }}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Paginación */}
          <div style={{ padding:"12px 16px",borderTop:"1px solid #FCE8EE",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
            <p style={{ fontSize:11,color:"#9C8790",margin:0 }}>
              {Math.min((pagina-1)*POR_PAGINA+1,filtrados.length)}–{Math.min(pagina*POR_PAGINA,filtrados.length)} de {filtrados.length}
            </p>
            <div style={{ display:"flex",gap:4 }}>
              <button onClick={()=>setPagina(p=>Math.max(1,p-1))} style={{ width:28,height:28,borderRadius:8,border:"1px solid #F5E1E7",background:"#fff",cursor:"pointer",fontSize:12,color:"#9C8790" }}>‹</button>
              {Array.from({length:Math.min(totalPags,3)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPagina(p)} style={{ width:28,height:28,borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:p===pagina?"#A0435F":"#fff",color:p===pagina?"#fff":"#9C8790" }}>{p}</button>
              ))}
              {totalPags>3&&<><span style={{ fontSize:11,color:"#9C8790",display:"flex",alignItems:"center" }}>...</span><button onClick={()=>setPagina(totalPags)} style={{ width:28,height:28,borderRadius:8,border:"none",cursor:"pointer",fontSize:11,color:"#9C8790",background:"#fff" }}>{totalPags}</button></>}
              <button onClick={()=>setPagina(p=>Math.min(totalPags,p+1))} style={{ width:28,height:28,borderRadius:8,border:"1px solid #F5E1E7",background:"#fff",cursor:"pointer",fontSize:12,color:"#9C8790" }}>›</button>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL LATERAL */}
      {!isMobile && (
        <div style={{ width:280,flexShrink:0,display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ background:"#fff",border:"1px solid #F5E1E7",borderRadius:20,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid #FCE8EE" }}>
              <p style={{ fontSize:13,fontWeight:700,color:"#4A2A38",margin:0 }}>Actividad reciente</p>
            </div>
            <div>
              {actividad.length===0
                ? <p style={{ textAlign:"center",fontSize:12,color:"#9C8790",padding:"24px" }}>Sin actividad aún.</p>
                : actividad.slice(0,5).map((a,i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"12px 16px",borderBottom:i<4?"1px solid #FBEEF1":"none" }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,background:a.tipo==="pago"?"#E6F9F0":a.tipo==="registro"?"#FCE8EE":"#FFF4EC" }}>
                      {a.tipo==="pago"?<CreditCardIcon size={13}/>:a.tipo==="registro"?<UserIcon size={13}/>:<BarChart2Icon size={13}/>}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:11,fontWeight:600,color:"#4A2A38",margin:0,lineHeight:1.3 }}>{a.titulo}</p>
                      <p style={{ fontSize:10,color:"#9C8790",margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.descripcion}</p>
                    </div>
                    <span style={{ fontSize:9,color:"#9C8790",flexShrink:0 }}>{a.tiempo}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div style={{ background:"#fff",border:"1px solid #F5E1E7",borderRadius:20,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid #FCE8EE" }}>
              <p style={{ fontSize:13,fontWeight:700,color:"#4A2A38",margin:0 }}>Top referidoras</p>
            </div>
            <div style={{ padding:"0 16px" }}>
              {topRef.length===0
                ? <p style={{ textAlign:"center",fontSize:12,color:"#9C8790",padding:"24px 0" }}>Sin datos aún.</p>
                : topRef.slice(0,3).map((r,i)=>(
                  <div key={i} style={{ padding:"12px 0",borderBottom:i<2?"1px solid #FBEEF1":"none" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                      <span style={{ fontSize:14 }}>{i===0?"🥇":i===1?"🥈":"🥉"}</span>
                      <div style={{ width:32,height:32,borderRadius:"50%",background:"#FCE8EE",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ color:"#A0435F",fontSize:11,fontWeight:700 }}>{r.nombre?.[0]}</span>
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:12,fontWeight:700,color:"#4A2A38",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.nombre}</p>
                        <p style={{ fontSize:10,color:"#A0435F",margin:0 }}>@{r.codigo?.toLowerCase()}</p>
                      </div>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6 }}>
                      {[{label:"Registradas",val:r.registradas},{label:"Pagaron",val:r.pagaron},{label:"Pendiente",val:`$${r.pendiente}`}].map((st,j)=>(
                        <div key={j} style={{ background:"#FBF4F6",borderRadius:10,padding:"6px 8px",textAlign:"center" }}>
                          <p style={{ fontSize:11,fontWeight:700,color:"#4A2A38",margin:0 }}>{st.val}</p>
                          <p style={{ fontSize:9,color:"#9C8790",margin:0 }}>{st.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {modalVer         && <ModalVer u={modalVer} onClose={()=>setModalVer(null)}/>}
      {modalEditar      && <ModalEditar u={modalEditar} onClose={()=>setModalEditar(null)} onSave={guardarEdicion}/>}
      {modalNuevo       && <ModalNuevo onClose={()=>setModalNuevo(false)} onSave={crearUsuario}/>}
      {modalCambiarRol  && <ModalCambiarRol u={modalCambiarRol} onClose={()=>setModalCambiarRol(null)} onCambiar={handleCambiarRol} cargando={cargandoRol}/>}
      {modalAccesos     && <ModalAccesos u={modalAccesos} onClose={()=>setModalAccesos(null)} onToggle={toggleSeccion}/>}

      {modalPago && (
        <ModalPago
          usuaria={modalPago}
          titulo="Confirmar pago"
          subtitulo="¿Cuánto pagó"
          gradiente="linear-gradient(90deg,#A0435F,#C77D93)"
          onClose={()=>setModalPago(null)}
          onConfirmar={async(monto)=>{ await confirmarToggle(modalPago.id, true, monto); }}
        />
      )}

      {modalEditPago && (
        <ModalPago
          usuaria={modalEditPago}
          titulo="Corregir monto de pago"
          subtitulo="Editando pago de"
          gradiente="linear-gradient(90deg,#12A46B,#90d060)"
          onClose={()=>setModalEditPago(null)}
          onConfirmar={async(monto)=>{ await corregirMonto(modalEditPago.id, monto); }}
        />
      )}
    </div>
  );
}