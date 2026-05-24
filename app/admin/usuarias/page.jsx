"use client";

import { useEffect, useState, useRef } from "react";
import {
  SearchIcon, UserIcon, DownloadIcon, PlusIcon, EyeIcon,
  PencilIcon, MoreVerticalIcon, XIcon, CheckIcon, ArrowUpIcon,
  FilterIcon, BookOpenIcon, FileTextIcon, CalendarIcon,
  MessageCircleIcon, UsersIcon, ShieldIcon,
} from "lucide-react";

/* ── Config secciones ─────────────────────────────────────────────────────── */
const SECCIONES = [
  { key:"tiene_acceso",      label:"Sesiones",    icon:BookOpenIcon,       color:"#5a8a3a", bg:"#e8f0e0" },
  { key:"perfil_habilitado", label:"Perfil",      icon:UserIcon,           color:"#7c5cc4", bg:"#ede9f8" },
  { key:"acceso_documentos", label:"Documentos",  icon:FileTextIcon,       color:"#2a4a7f", bg:"#e8effe" },
  { key:"acceso_recursos",   label:"Recursos",    icon:ShieldIcon,         color:"#c9973a", bg:"#fdf3e3" },
  { key:"acceso_reuniones",  label:"Reuniones",   icon:CalendarIcon,       color:"#a0435f", bg:"#fce8ed" },
  { key:"acceso_mensajes",   label:"Mensajes",    icon:MessageCircleIcon,  color:"#059669", bg:"#d1fae5" },
  { key:"acceso_comunidad",  label:"Comunidad",   icon:UsersIcon,          color:"#6b4f9e", bg:"#f0eaff" },
];

/* ── Toggle switch ────────────────────────────────────────────────────────── */
function Toggle({ active, onChange, color="#5a8a3a", disabled=false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!active)}
      disabled={disabled}
      style={{
        width:36, height:20, borderRadius:99, border:"none", cursor:disabled?"not-allowed":"pointer",
        background: active ? color : "#e0d0d8",
        position:"relative", transition:"background .2s", flexShrink:0,
        opacity: disabled ? .5 : 1,
      }}>
      <div style={{
        width:14, height:14, borderRadius:"50%", background:"#fff",
        position:"absolute", top:3,
        left: active ? 19 : 3,
        transition:"left .2s",
        boxShadow:"0 1px 3px rgba(0,0,0,.2)",
      }}/>
    </button>
  );
}

/* ── Modal Ver ────────────────────────────────────────────────────────────── */
function ModalVer({ u, onClose }) {
  if (!u) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]"/>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0dde2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fce8ed] border-2 border-[#f0b8c4] overflow-hidden flex items-center justify-center">
              {u.foto_url
                ? <img src={u.foto_url} alt="" className="w-full h-full object-cover"/>
                : <span className="text-[#a0435f] font-bold font-serif">{u.nombre?.[0]}</span>}
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#2d1a22]">{u.nombre} {u.apellido}</h3>
              <p className="text-[11px] text-[#9a6672]">{u.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center">
            <XIcon size={14} className="text-[#a0435f]"/>
          </button>
        </div>
        <div className="px-6 py-4 grid grid-cols-2 gap-3">
          {[
            { label:"ID",                val: `#${u.id}` },
            { label:"Progreso",          val: `${u.porcentaje||0}% (${u.sesiones_completadas||0} ses.)` },
            { label:"Código referido",   val: u.codigo_referido || "Sin código" },
            { label:"Referida por",      val: u.referente_nombre || "—" },
            { label:"Pago",              val: u.monto_pagado ? `$${u.monto_pagado} USD` : "—" },
            { label:"Comisión generada", val: u.comision_generada ? `$${u.comision_generada} USD` : "—" },
            { label:"Registro",          val: u.created_at ? new Date(u.created_at).toLocaleDateString("es-CO") : "—" },
          ].map((s,i) => (
            <div key={i} className="bg-[#fff8f9] border border-[#f0dde2] rounded-xl px-3 py-2.5">
              <p className="text-[9px] text-[#9a6672] uppercase tracking-wide mb-0.5">{s.label}</p>
              <p className="text-[12px] font-bold text-[#2d1a22]">{s.val}</p>
            </div>
          ))}
        </div>
        {/* Accesos */}
        <div className="px-6 pb-2">
          <p className="text-[10px] font-bold text-[#9a6672] uppercase tracking-wide mb-2">Accesos activos</p>
          <div className="flex flex-wrap gap-2">
            {SECCIONES.map(s => {
              const activo = u[s.key];
              const Icon = s.icon;
              return (
                <div key={s.key} style={{ display:"flex", alignItems:"center", gap:5, background:activo?s.bg:"#f5f0f0", borderRadius:99, padding:"4px 10px" }}>
                  <Icon size={11} style={{ color:activo?s.color:"#c0909a" }}/>
                  <span style={{ fontSize:11, fontWeight:600, color:activo?s.color:"#c0909a" }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="px-6 pb-5 pt-3">
          <button onClick={onClose} className="w-full bg-[#a0435f] hover:bg-[#8a3550] text-white font-semibold text-[13px] py-3 rounded-xl transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Editar ─────────────────────────────────────────────────────────── */
function ModalEditar({ u, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: u.nombre || "", apellido: u.apellido || "", email: u.email || "",
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]"/>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0dde2]">
          <h3 className="font-bold text-[16px] text-[#2d1a22]">Editar usuario</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center">
            <XIcon size={14} className="text-[#a0435f]"/>
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {[{label:"Nombre",key:"nombre"},{label:"Apellido",key:"apellido"},{label:"Email",key:"email"}].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-[#2d1a22] mb-1">{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}
                className="w-full border border-[#f0dde2] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] bg-[#fff8f9]"/>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border-2 border-[#f0dde2] text-[#9a6672] font-semibold text-[13px] py-3 rounded-xl hover:bg-[#fff0f3] transition">Cancelar</button>
          <button onClick={() => { onSave(u.id, form); onClose(); }} className="flex-1 bg-[#a0435f] hover:bg-[#8a3550] text-white font-semibold text-[13px] py-3 rounded-xl transition">Guardar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Nuevo ──────────────────────────────────────────────────────────── */
function ModalNuevo({ onClose, onSave }) {
  const [form, setForm] = useState({ nombre:"", apellido:"", email:"", password:"" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]"/>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0dde2]">
          <h3 className="font-bold text-[16px] text-[#2d1a22]">Nuevo usuario</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center">
            <XIcon size={14} className="text-[#a0435f]"/>
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {[{label:"Nombre",key:"nombre",type:"text"},{label:"Apellido",key:"apellido",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Contraseña",key:"password",type:"password"}].map(f=>(
            <div key={f.key}>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-[#2d1a22] mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                className="w-full border border-[#f0dde2] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] bg-[#fff8f9]"/>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border-2 border-[#f0dde2] text-[#9a6672] font-semibold text-[13px] py-3 rounded-xl hover:bg-[#fff0f3] transition">Cancelar</button>
          <button onClick={()=>{onSave(form);onClose();}} className="flex-1 bg-[#a0435f] hover:bg-[#8a3550] text-white font-semibold text-[13px] py-3 rounded-xl transition">Crear</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Accesos (panel de toggles por sección) ─────────────────────────── */
function ModalAccesos({ u, onClose, onToggle }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]"/>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0dde2]">
          <div>
            <h3 className="font-bold text-[16px] text-[#2d1a22]">Gestionar accesos</h3>
            <p className="text-[11px] text-[#9a6672]">{u.nombre} {u.apellido}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center">
            <XIcon size={14} className="text-[#a0435f]"/>
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {SECCIONES.map(sec => {
            const Icon = sec.icon;
            const activo = !!u[sec.key];
            return (
              <div key={sec.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:activo?sec.bg+"80":"#fff8f9", borderRadius:14, border:`1px solid ${activo?sec.bg:"#f0dde2"}`, transition:"all .15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:activo?sec.bg:"#f0e8f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={15} style={{ color:activo?sec.color:"#c0909a" }}/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:activo?"#2d1a22":"#9a6672", margin:0 }}>{sec.label}</p>
                    <p style={{ fontSize:10, color:activo?sec.color:"#c0909a", margin:0, fontWeight:600 }}>
                      {activo?"Activo":"Desactivado"}
                    </p>
                  </div>
                </div>
                <Toggle
                  active={activo}
                  color={sec.color}
                  onChange={(val) => onToggle(u.id, sec.key, val)}
                />
              </div>
            );
          })}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full border border-[#f0dde2] text-[#9a6672] text-[13px] font-semibold py-3 rounded-xl hover:bg-[#fff8f9] transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Pago ───────────────────────────────────────────────────────────── */
function ModalPago({ usuaria, titulo, subtitulo, gradiente, onClose, onConfirmar }) {
  const [monto, setMonto] = useState(String(usuaria.monto_pagado || "35"));
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(45,26,34,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:400, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ height:4, background: gradiente || "linear-gradient(90deg,#a0435f,#e8849a)" }}/>
        <div style={{ padding:"24px" }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#2d1a22", margin:"0 0 6px" }}>{titulo}</h2>
          <p style={{ fontSize:13, color:"#9a6672", margin:"0 0 20px" }}>
            {subtitulo} <strong>{usuaria.nombre} {usuaria.apellido}</strong>
          </p>
          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.6 }}>Monto (USD)</span>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"#9a7080", fontWeight:600 }}>$</span>
              <input type="number" min="0" step="1" value={monto} onChange={e => setMonto(e.target.value)}
                style={{ width:"100%", border:"1.5px solid #f0dde2", borderRadius:12, padding:"10px 14px 10px 32px", fontSize:16, fontWeight:700, color:"#1e1033", outline:"none", boxSizing:"border-box" }}
                autoFocus/>
              <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#9a7080" }}>USD</span>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              {["29","35","300"].map(p => (
                <button key={p} onClick={() => setMonto(p)}
                  style={{ flex:1, padding:"7px", borderRadius:10, border:`1.5px solid ${monto===p?"#a0435f":"#f0dde2"}`, background:monto===p?"#fce8ed":"#fff", color:monto===p?"#a0435f":"#9a7080", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  ${p}
                </button>
              ))}
            </div>
          </label>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:12, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a6672", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
            <button onClick={() => onConfirmar(monto)} disabled={!monto||Number(monto)<=0}
              style={{ flex:2, padding:"10px", borderRadius:12, border:"none", background:(!monto||Number(monto)<=0)?"#f0dde2":"#a0435f", color:(!monto||Number(monto)<=0)?"#c0909a":"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              ✓ Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminUsuariosPage() {
  const [usuarios,      setUsuarios]      = useState([]);
  const [stats,         setStats]         = useState(null);
  const [actividad,     setActividad]     = useState([]);
  const [topRef,        setTopRef]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [codigoFiltro,  setCodigoFiltro]  = useState("");
  const [tabActivo,     setTabActivo]     = useState("todos");
  const [ordenar,       setOrdenar]       = useState("recientes");
  const [modalVer,      setModalVer]      = useState(null);
  const [modalEditar,   setModalEditar]   = useState(null);
  const [modalNuevo,    setModalNuevo]    = useState(false);
  const [modalAccesos,  setModalAccesos]  = useState(null); // panel de secciones
  const [modalPago,     setModalPago]     = useState(null);
  const [modalEditPago, setModalEditPago] = useState(null);
  const [toast,         setToast]         = useState(null);
  const [pagina,        setPagina]        = useState(1);
  const POR_PAGINA = 8;

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, aRes, tRes] = await Promise.all([
        fetch("/api/admin/usuarias"),
        fetch("/api/admin/usuarios/stats"),
        fetch("/api/admin/usuarios/actividad"),
        fetch("/api/admin/usuarios/top-referentes"),
      ]);
      const [uData, sData, aData, tData] = await Promise.all([uRes.json(), sRes.json(), aRes.json(), tRes.json()]);
      setUsuarios(uData.usuarias || []);
      setStats(sData);
      setActividad(aData.actividad || []);
      setTopRef(tData.referentes || []);
    } catch { showToast("Error cargando datos","error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  /* ── Toggle acceso completo (con modal de pago) ── */
  const toggleAcceso = (u) => {
    if (!u.tiene_acceso) setModalPago(u);
    else confirmarToggle(u.id, false, 0);
  };

  const confirmarToggle = async (id, tiene_acceso, monto) => {
    setModalPago(null);
    const res = await fetch("/api/admin/toggle-acceso", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, tiene_acceso, monto:Number(monto) }),
    });
    const data = await res.json();
    if (data.ok) {
      setUsuarios(prev => prev.map(u => u.id===id ? {...u, tiene_acceso:data.tiene_acceso} : u));
      showToast(tiene_acceso ? "✓ Acceso activado" : "Acceso desactivado");
      cargar();
    } else showToast("Error al actualizar acceso","error");
  };

  /* ── Toggle sección específica ── */
  const toggleSeccion = async (usuarioId, seccion, valor) => {
    // Actualizar estado local inmediatamente
    setUsuarios(prev => prev.map(u => u.id===usuarioId ? {...u, [seccion]:valor?1:0} : u));
    // Actualizar también el modal de accesos
    setModalAccesos(prev => prev ? {...prev, [seccion]:valor?1:0} : prev);

    const res = await fetch("/api/admin/toggle-acceso", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id:usuarioId, seccion, valor }),
    });
    const data = await res.json();
    if (!data.ok) {
      // Revertir si falla
      setUsuarios(prev => prev.map(u => u.id===usuarioId ? {...u, [seccion]:!valor?1:0} : u));
      showToast("Error al actualizar","error");
    } else {
      showToast(`${SECCIONES.find(s=>s.key===seccion)?.label} ${valor?"activado":"desactivado"} ✓`);
    }
  };

  /* ── Corregir monto ── */
  const corregirMonto = async (usuarioId, monto) => {
    setModalEditPago(null);
    const res = await fetch("/api/admin/toggle-acceso", {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ usuario_id:usuarioId, monto:Number(monto) }),
    });
    const data = await res.json();
    if (data.ok) {
      setUsuarios(prev => prev.map(u => u.id===usuarioId ? {...u, monto_pagado:Number(monto)} : u));
      showToast("Monto corregido ✓");
    } else showToast("Error al corregir monto","error");
  };

  const guardarEdicion = async (id, form) => {
    await fetch(`/api/admin/usuarias/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    showToast("Usuario actualizado ✓"); cargar();
  };

  const crearUsuario = async (form) => {
    const res = await fetch("/api/auth/register", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    if (res.ok) { showToast("Usuario creado ✓"); cargar(); }
    else showToast("Error al crear usuario","error");
  };

  const exportar = () => {
    const lineas = ["ID|Nombre|Email|Progreso|Código|Pago|Accesos",
      ...filtrados.map(u=>`${u.id}|${u.nombre} ${u.apellido}|${u.email}|${u.porcentaje||0}%|${u.codigo_referido||"—"}|${u.tiene_acceso?`$${u.monto_pagado||35} USD`:"Gratis"}|${SECCIONES.filter(s=>u[s.key]).map(s=>s.label).join(",")}`)
    ].join("\n");
    const a = Object.assign(document.createElement("a"), { href:`data:text/plain;charset=utf-8,${encodeURIComponent(lineas)}`, download:"usuarios.txt" });
    a.click(); showToast("Exportado ✓");
  };

  /* ── Filtros ── */
  const hoy = new Date();
  const esteMes = u => { const d=new Date(u.created_at); return d.getMonth()===hoy.getMonth()&&d.getFullYear()===hoy.getFullYear(); };
  const tabs = [
    { id:"todos",     label:"Todos",            count:usuarios.length },
    { id:"acceso",    label:"Con acceso",        count:usuarios.filter(u=>u.tiene_acceso).length },
    { id:"gratis",    label:"Gratis",            count:usuarios.filter(u=>!u.tiene_acceso).length },
    { id:"inactivos", label:"Inactivos",         count:usuarios.filter(u=>!u.sesiones_completadas).length },
    { id:"nuevos",    label:"Nuevos (este mes)", count:usuarios.filter(esteMes).length },
  ];
  let filtrados = usuarios.filter(u => {
    const q=search.toLowerCase();
    return (!q||`${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q))
      && (!codigoFiltro||(u.codigo_referido||"").toLowerCase().includes(codigoFiltro.toLowerCase()))
      && (tabActivo==="todos"||tabActivo==="acceso"&&u.tiene_acceso||tabActivo==="gratis"&&!u.tiene_acceso||tabActivo==="inactivos"&&!u.sesiones_completadas||esteMes(u));
  });
  if      (ordenar==="recientes") filtrados=[...filtrados].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  else if (ordenar==="progreso")  filtrados=[...filtrados].sort((a,b)=>(b.porcentaje||0)-(a.porcentaje||0));
  else if (ordenar==="nombre")    filtrados=[...filtrados].sort((a,b)=>a.nombre.localeCompare(b.nombre));

  const totalPags = Math.ceil(filtrados.length/POR_PAGINA);
  const paginados = filtrados.slice((pagina-1)*POR_PAGINA, pagina*POR_PAGINA);
  const s = stats||{total:0,conAcceso:0,soloGratis:0,conversion:0};

  return (
    <div className="flex gap-5 p-5 xl:p-7 bg-[#fff8f9] min-h-full">
      <div className="flex-1 min-w-0 space-y-5">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-[13px] font-medium text-white ${toast.tipo==="error"?"bg-red-500":"bg-[#a0435f]"}`}>
            <CheckIcon size={15}/>{toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-[#2d1a22] text-[24px] xl:text-[26px]">Usuarios registrados</h1>
              <div className="w-6 h-6 rounded-full bg-[#fce8ed] flex items-center justify-center"><UserIcon size={12} className="text-[#a0435f]"/></div>
            </div>
            <p className="text-[12px] text-[#9a6672]">Administra estudiantes, acceso al programa y secciones.</p>
          </div>
          <button onClick={exportar} className="flex items-center gap-1.5 text-[#a0435f] text-[12px] font-semibold hover:text-[#8a3550] transition">
            <DownloadIcon size={14}/>Exportar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {icon:"👥",color:"bg-[#fce8ed]",label:"Usuarios totales",     val:s.total?.toLocaleString("es-CO"),     change:"+18%"},
            {icon:"🔓",color:"bg-[#e8f0e0]",label:"Con acceso completo",  val:s.conAcceso?.toLocaleString("es-CO"),  change:"+22%"},
            {icon:"🎁",color:"bg-[#fdf3e3]",label:"Solo bienvenida gratis",val:s.soloGratis?.toLocaleString("es-CO"),change:"+9%"},
            {icon:"📈",color:"bg-[#e8f0ff]",label:"Conversión total",      val:`${s.conversion||0}%`,                change:"+15%"},
          ].map((st,i) => (
            <div key={i} className="bg-white border border-[#f0dde2] rounded-2xl px-4 py-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${st.color} text-[18px]`}>{st.icon}</div>
              <p className="text-[10px] text-[#9a6672] leading-snug mb-1">{st.label}</p>
              <p className="font-serif font-bold text-[22px] text-[#2d1a22] leading-none">{st.val||0}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-[#9a6672]">Este mes</span>
                <span className="text-[10px] font-bold text-[#5a8a3a] flex items-center gap-0.5"><ArrowUpIcon size={8}/>{st.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0909a]"/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPagina(1);}} placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-4 py-2.5 border border-[#f0dde2] rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] bg-white"/>
          </div>
          <div className="relative">
            <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0909a]"/>
            <input value={codigoFiltro} onChange={e=>{setCodigoFiltro(e.target.value);setPagina(1);}} placeholder="Código referido"
              className="pl-9 pr-4 py-2.5 border border-[#f0dde2] rounded-xl text-[12px] w-40 focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] bg-white"/>
          </div>
          <button onClick={()=>setModalNuevo(true)}
            className="flex items-center gap-1.5 bg-[#a0435f] hover:bg-[#8a3550] text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-[#a0435f]/20">
            <PlusIcon size={13}/>Nuevo usuario
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="px-4 py-3 border-b border-[#fce8ed] flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1 flex-nowrap">
              {tabs.map(t => (
                <button key={t.id} onClick={()=>{setTabActivo(t.id);setPagina(1);}}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition ${tabActivo===t.id?"text-[#a0435f] border-b-2 border-[#a0435f]":"text-[#9a6672] hover:text-[#2d1a22]"}`}>
                  {t.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tabActivo===t.id?"bg-[#fce8ed] text-[#a0435f]":"bg-[#f5f0f0] text-[#9a6672]"}`}>{t.count}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-[#9a6672]">Ordenar:</span>
              <select value={ordenar} onChange={e=>setOrdenar(e.target.value)}
                className="border border-[#f0dde2] rounded-xl px-3 py-1.5 text-[11px] text-[#2d1a22] bg-white focus:outline-none">
                <option value="recientes">Más recientes</option>
                <option value="progreso">Mayor progreso</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {/* Headers */}
          <div className="px-4 py-2.5 border-b border-[#fce8ed] grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_100px] gap-3">
            {["Usuario","Estado","Progreso","Código","Pago","Accesos","Acciones"].map((h,i) => (
              <p key={i} className="text-[10px] font-bold uppercase tracking-wide text-[#9a6672]">{h}</p>
            ))}
          </div>

          {/* Filas */}
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin"/></div>
          ) : paginados.length===0 ? (
            <p className="py-12 text-center text-[13px] text-[#9a6672]">No se encontraron usuarios.</p>
          ) : (
            <div className="divide-y divide-[#fff0f3]">
              {paginados.map(u => {
                const seccionesActivas = SECCIONES.filter(s => u[s.key]);
                return (
                  <div key={u.id} className="px-4 py-3 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_100px] gap-3 items-center hover:bg-[#fff8f9] transition">

                    {/* Usuario */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#fce8ed] border-2 border-[#f0b8c4] overflow-hidden flex items-center justify-center shrink-0">
                        {u.foto_url ? <img src={u.foto_url} alt="" className="w-full h-full object-cover"/> : <span className="text-[#a0435f] text-[12px] font-bold font-serif">{u.nombre?.[0]}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-[#2d1a22] truncate">{u.nombre} {u.apellido}</p>
                        <p className="text-[10px] text-[#9a6672] truncate">{u.email}</p>
                      </div>
                    </div>

                    {/* Estado */}
                    <div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        u.tiene_acceso?"bg-[#e8f0e0] text-[#5a8a3a]":!u.sesiones_completadas?"bg-[#f5f0ff] text-[#6b4f9e]":"bg-[#fdf3e3] text-[#c9973a]"
                      }`}>
                        {u.tiene_acceso?"✓ Acceso":!u.sesiones_completadas?"Inactivo":"Gratis"}
                      </span>
                    </div>

                    {/* Progreso */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="flex-1 h-1.5 bg-[#f0dde2] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#a0435f] to-[#e8849a] rounded-full" style={{width:`${u.porcentaje||0}%`}}/>
                        </div>
                        <span className="text-[10px] text-[#9a6672] shrink-0">{u.porcentaje||0}%</span>
                      </div>
                      <p className="text-[9px] text-[#c0909a]">{u.sesiones_completadas||0}/8 ses.</p>
                    </div>

                    {/* Código */}
                    <div>
                      {u.codigo_referido
                        ? <span className="text-[11px] font-bold text-[#a0435f]">{u.codigo_referido}</span>
                        : <span className="text-[10px] text-[#c0a0a8]">—</span>
                      }
                    </div>

                    {/* Pago */}
                    <div>
                      {u.tiene_acceso ? (
                        <div className="flex items-center gap-1">
                          <div>
                            <p className="text-[11px] font-bold text-[#2d1a22]">{u.monto_pagado?`$${u.monto_pagado} USD`:"$35 USD"}</p>
                            <span className="text-[9px] bg-[#e8f0e0] text-[#5a8a3a] font-bold px-1.5 py-0.5 rounded-full">Pagado</span>
                          </div>
                          <button onClick={()=>setModalEditPago(u)} className="w-5 h-5 rounded-lg bg-[#fdf3e3] hover:bg-[#f0d090] flex items-center justify-center transition shrink-0" title="Corregir monto">
                            <PencilIcon size={9} className="text-[#c9973a]"/>
                          </button>
                        </div>
                      ) : <span className="text-[10px] text-[#c0a0a8]">—</span>}
                    </div>

                    {/* Accesos — badges de secciones activas */}
                    <div className="flex flex-wrap gap-1">
                      {seccionesActivas.length===0
                        ? <span className="text-[10px] text-[#c0a0a8]">Ninguno</span>
                        : seccionesActivas.slice(0,3).map(sec => {
                          const Icon = sec.icon;
                          return (
                            <div key={sec.key} style={{ width:20, height:20, borderRadius:6, background:sec.bg, display:"flex", alignItems:"center", justifyContent:"center" }} title={sec.label}>
                              <Icon size={10} style={{ color:sec.color }}/>
                            </div>
                          );
                        })
                      }
                      {seccionesActivas.length>3 && <span className="text-[10px] text-[#9a6672] font-bold">+{seccionesActivas.length-3}</span>}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      <button onClick={()=>setModalVer(u)} className="w-7 h-7 rounded-lg bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center transition" title="Ver detalle">
                        <EyeIcon size={12} className="text-[#a0435f]"/>
                      </button>
                      <button onClick={()=>setModalEditar(u)} className="w-7 h-7 rounded-lg bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center transition" title="Editar">
                        <PencilIcon size={12} className="text-[#a0435f]"/>
                      </button>
                      {/* Botón gestionar accesos */}
                      <button onClick={()=>setModalAccesos(u)} className="w-7 h-7 rounded-lg bg-[#e8f0e0] hover:bg-[#c8e0c0] flex items-center justify-center transition" title="Gestionar accesos por sección">
                        <ShieldIcon size={12} className="text-[#5a8a3a]"/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          <div className="px-4 py-3 border-t border-[#fce8ed] flex items-center justify-between">
            <p className="text-[11px] text-[#9a6672]">
              Mostrando {Math.min((pagina-1)*POR_PAGINA+1,filtrados.length)} a {Math.min(pagina*POR_PAGINA,filtrados.length)} de {filtrados.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPagina(p=>Math.max(1,p-1))} className="w-7 h-7 rounded-lg text-[11px] text-[#9a6672] hover:bg-[#fce8ed] transition">‹</button>
              {Array.from({length:Math.min(totalPags,3)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPagina(p)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-medium transition ${p===pagina?"bg-[#a0435f] text-white":"text-[#9a6672] hover:bg-[#fce8ed]"}`}>{p}</button>
              ))}
              {totalPags>3&&<><span className="text-[#9a6672] text-[11px]">...</span><button onClick={()=>setPagina(totalPags)} className="w-7 h-7 rounded-lg text-[11px] text-[#9a6672] hover:bg-[#fce8ed] transition">{totalPags}</button></>}
              <button onClick={()=>setPagina(p=>Math.min(totalPags,p+1))} className="w-7 h-7 rounded-lg text-[11px] text-[#9a6672] hover:bg-[#fce8ed] transition">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL LATERAL ── */}
      <div className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
        <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3.5 border-b border-[#fce8ed] flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#2d1a22]">Actividad reciente</p>
          </div>
          <div className="divide-y divide-[#fff0f3]">
            {actividad.length===0
              ? <p className="text-center text-[12px] text-[#9a6672] py-6">Sin actividad aún.</p>
              : actividad.slice(0,5).map((a,i)=>(
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] ${a.tipo==="pago"?"bg-[#e8f0e0]":a.tipo==="registro"?"bg-[#fce8ed]":"bg-[#fdf3e3]"}`}>
                    {a.tipo==="pago"?"💳":a.tipo==="registro"?"👤":"📊"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[#2d1a22] leading-snug">{a.titulo}</p>
                    <p className="text-[10px] text-[#9a6672] mt-0.5 truncate">{a.descripcion}</p>
                  </div>
                  <span className="text-[9px] text-[#9a6672] shrink-0">{a.tiempo}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3.5 border-b border-[#fce8ed]">
            <p className="text-[13px] font-bold text-[#2d1a22]">Top referidoras</p>
          </div>
          <div className="divide-y divide-[#fff0f3] px-4">
            {topRef.length===0
              ? <p className="text-center text-[12px] text-[#9a6672] py-6">Sin datos aún.</p>
              : topRef.slice(0,3).map((r,i)=>(
                <div key={i} className="py-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[14px]">{i===0?"🥇":i===1?"🥈":"🥉"}</span>
                    <div className="w-8 h-8 rounded-full bg-[#fce8ed] flex items-center justify-center shrink-0">
                      <span className="text-[#a0435f] text-[11px] font-bold">{r.nombre?.[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-[#2d1a22] truncate">{r.nombre}</p>
                      <p className="text-[10px] text-[#a0435f]">@{r.codigo?.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[{label:"Registradas",val:r.registradas},{label:"Pagaron",val:r.pagaron},{label:"Pendiente",val:`$${r.pendiente} USD`}].map((st,j)=>(
                      <div key={j} className="bg-[#fff8f9] rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[11px] font-bold text-[#2d1a22]">{st.val}</p>
                        <p className="text-[9px] text-[#9a6672]">{st.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* ── MODALES ── */}
      {modalVer     && <ModalVer     u={modalVer}     onClose={()=>setModalVer(null)}/>}
      {modalEditar  && <ModalEditar  u={modalEditar}  onClose={()=>setModalEditar(null)} onSave={guardarEdicion}/>}
      {modalNuevo   && <ModalNuevo   onClose={()=>setModalNuevo(false)} onSave={crearUsuario}/>}

      {/* Modal gestión de accesos por sección */}
      {modalAccesos && (
        <ModalAccesos
          u={modalAccesos}
          onClose={()=>setModalAccesos(null)}
          onToggle={toggleSeccion}
        />
      )}

      {/* Modal confirmar pago */}
      {modalPago && (
        <ModalPago
          usuaria={modalPago}
          titulo="Confirmar pago"
          subtitulo="¿Cuánto pagó"
          gradiente="linear-gradient(90deg,#a0435f,#e8849a)"
          onClose={()=>setModalPago(null)}
          onConfirmar={(monto)=>confirmarToggle(modalPago.id, true, monto)}
        />
      )}

      {/* Modal corregir monto */}
      {modalEditPago && (
        <ModalPago
          usuaria={modalEditPago}
          titulo="Corregir monto de pago"
          subtitulo="Editando pago de"
          gradiente="linear-gradient(90deg,#5a8a3a,#90d060)"
          onClose={()=>setModalEditPago(null)}
          onConfirmar={(monto)=>corregirMonto(modalEditPago.id, monto)}
        />
      )}
    </div>
  );
}