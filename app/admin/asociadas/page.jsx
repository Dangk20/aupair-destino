"use client";
// app/admin/asociadas/page.jsx

import { useEffect, useState, useCallback } from "react";
import {
  UserPlusIcon, SearchIcon, TrashIcon, PencilIcon, EyeIcon,
  CheckIcon, XIcon, CopyIcon, UsersIcon, AlertCircleIcon, DollarSignIcon,
} from "lucide-react";

function CodigoBadge({ codigo, onCopy, copiado }) {
  if (!codigo) return <span className="text-[11px] text-[#C9A9B4] italic">Sin código</span>;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] font-bold text-[#A0435F] bg-[#FCE8EE] px-2.5 py-1 rounded-lg">{codigo}</span>
      <button onClick={onCopy} className="text-[#C9A9B4] hover:text-[#A0435F] transition">
        {copiado ? <CheckIcon size={12} className="text-[#12A46B]"/> : <CopyIcon size={12}/>}
      </button>
    </div>
  );
}

function ModalAsesora({ inicial, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: inicial?.nombre || "", apellido: inicial?.apellido || "",
    email: inicial?.email || "", password: "",
    telefono: inicial?.telefono || "", ciudad: inicial?.ciudad || "", pais: inicial?.pais || "",
  });
  const [guardando, setGuardando] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!form.nombre || !form.apellido || !form.email || (!inicial && !form.password)) {
      setErr("Completa los campos obligatorios."); return;
    }
    setGuardando(true); setErr("");
    await onSave({ ...form, id: inicial?.id });
    setGuardando(false);
  };

  const ic = "w-full border border-[#F5E1E7] rounded-xl px-3.5 py-2.5 text-[13px] text-[#4A2A38] bg-white focus:outline-none focus:ring-2 focus:ring-[#C77D93]/40 focus:border-[#C77D93] transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="h-1 bg-gradient-to-r from-[#A0435F] via-[#A0435F] to-[#A0435F] sticky top-0"/>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-[18px] font-bold text-[#4A2A38]">
              {inicial ? "Editar asesora" : "Nueva asesora"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#FCE8EE] flex items-center justify-center hover:bg-[#C77D93] transition">
              <XIcon size={14} className="text-[#A0435F]"/>
            </button>
          </div>

          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] px-3 py-2 rounded-xl mb-4">{err}</div>}

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-semibold text-[#4A2A38] uppercase tracking-wide">Nombre *</span>
                <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} className={`mt-1 ${ic}`}/>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#4A2A38] uppercase tracking-wide">Apellido *</span>
                <input value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} className={`mt-1 ${ic}`}/>
              </label>
            </div>
            <label className="block">
              <span className="text-[11px] font-semibold text-[#4A2A38] uppercase tracking-wide">Email *</span>
              <input type="email" value={form.email} disabled={!!inicial} onChange={e=>setForm({...form,email:e.target.value})} className={`mt-1 ${ic} disabled:bg-gray-50 disabled:text-gray-400`}/>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-[#4A2A38] uppercase tracking-wide">
                Contraseña {inicial ? "(dejar en blanco para no cambiar)" : "*"}
              </span>
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className={`mt-1 ${ic}`}/>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-[#4A2A38] uppercase tracking-wide">Teléfono</span>
              <input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} className={`mt-1 ${ic}`}/>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-semibold text-[#4A2A38] uppercase tracking-wide">Ciudad</span>
                <input value={form.ciudad} onChange={e=>setForm({...form,ciudad:e.target.value})} className={`mt-1 ${ic}`}/>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#4A2A38] uppercase tracking-wide">País</span>
                <input value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})} className={`mt-1 ${ic}`}/>
              </label>
            </div>
          </div>

          <div className="flex gap-2.5 mt-6">
            <button onClick={onClose} className="flex-1 border border-[#F5E1E7] text-[#9C8790] text-[13px] font-medium py-2.5 rounded-xl hover:bg-[#FBF4F6] transition">
              Cancelar
            </button>
            <button onClick={submit} disabled={guardando}
              className="flex-1 bg-[#A0435F] hover:bg-[#A0435F] disabled:opacity-60 text-white text-[13px] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
              {guardando
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Guardando…</>
                : (inicial ? "Guardar cambios" : "Crear asesora")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalVerAsesora({ asesora, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#A0435F] via-[#A0435F] to-[#A0435F]"/>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-[18px] font-bold text-[#4A2A38]">Detalle de la asesora</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#FCE8EE] flex items-center justify-center hover:bg-[#C77D93] transition">
              <XIcon size={14} className="text-[#A0435F]"/>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#FCE8EE]">
            <div className="w-14 h-14 rounded-2xl bg-[#FCE8EE] flex items-center justify-center text-[#A0435F] text-[22px] font-bold font-serif border border-[#C77D93] overflow-hidden">
              {asesora.foto_url
                ? <img src={asesora.foto_url} alt="" className="w-full h-full object-cover"/>
                : (asesora.nombre?.[0] || "A")}
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#4A2A38]">{asesora.nombre} {asesora.apellido}</p>
              <p className="text-[12px] text-[#9C8790]">{asesora.email}</p>
              {asesora.telefono && <p className="text-[12px] text-[#9C8790]">{asesora.telefono}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Código de referida",   val: asesora.codigo_referido || "Sin código" },
              { label:"Comisión asignada",    val: asesora.porcentaje ? `${asesora.porcentaje}%` : "—" },
              { label:"Ciudad",               val: asesora.ciudad || "—" },
              { label:"País",                 val: asesora.pais || "—" },
              { label:"Referidas totales",    val: asesora.referidas_totales || 0 },
              { label:"Referidas que pagaron",val: asesora.referidas_pagaron || 0 },
              { label:"Registrada el",        val: asesora.created_at ? new Date(asesora.created_at).toLocaleDateString("es-CO") : "—" },
            ].map((item,i)=>(
              <div key={i} className="bg-[#FBF4F6] rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-[#9C8790] font-semibold uppercase tracking-wide">{item.label}</p>
                <p className="text-[13px] font-bold text-[#4A2A38] mt-0.5">{item.val}</p>
              </div>
            ))}
          </div>

          <button onClick={onClose}
            className="w-full mt-5 border border-[#F5E1E7] text-[#9C8790] text-[13px] font-medium py-2.5 rounded-xl hover:bg-[#FBF4F6] transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEliminar({ asesora, onClose, onConfirm }) {
  const [eli, setEli] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center px-6 py-7">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <TrashIcon size={22} className="text-red-500"/>
        </div>
        <h3 className="font-serif text-[17px] font-bold text-[#4A2A38] mb-2">¿Eliminar asesora?</h3>
        <p className="text-[13px] text-[#9C8790] mb-6">
          Vas a eliminar a <strong>{asesora.nombre} {asesora.apellido}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-[#F5E1E7] text-[#9C8790] text-[13px] py-2.5 rounded-xl hover:bg-[#FBF4F6] transition">
            Cancelar
          </button>
          <button onClick={async()=>{setEli(true);await onConfirm();setEli(false);onClose();}} disabled={eli}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[13px] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
            {eli ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <TrashIcon size={13}/>}
            {eli ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAsociadasPage() {
  const [asociadas, setAsociadas]   = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [busqueda,  setBusqueda]    = useState("");
  const [modalNueva,setModalNueva]  = useState(false);
  const [modalEditar,setModalEditar]= useState(null);
  const [modalVer,  setModalVer]    = useState(null);
  const [modalEliminar,setModalEliminar] = useState(null);
  const [toast,     setToast]       = useState(null);
  const [copiado,   setCopiado]     = useState(null);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/asociadas");
      const data = await res.json();
      setAsociadas(data.asociadas || []);
    } catch { showToast("Error al cargar asesoras","error"); }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleSave = async (form) => {
    const url    = form.id ? `/api/admin/asociadas/${form.id}` : "/api/admin/asociadas";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) {
      showToast(data.codigo_referido ? `✓ Asesora creada — Código: ${data.codigo_referido}` : (data.mensaje||"Guardado ✓"));
      setModalNueva(false); setModalEditar(null);
      cargar();
    } else showToast(data.error || "Error al guardar","error");
  };

  const handleEliminar = async () => {
    const res = await fetch(`/api/admin/asociadas/${modalEliminar.id}`, { method:"DELETE" });
    if (res.ok) { showToast("Asesora eliminada"); cargar(); }
    else showToast("Error al eliminar","error");
  };

  const copiarCodigo = (codigo, id) => {
    navigator.clipboard.writeText(codigo).then(()=>{ setCopiado(id); setTimeout(()=>setCopiado(null),2000); });
  };

  const filtradas = asociadas.filter(a => {
    const q = busqueda.toLowerCase();
    return !q || `${a.nombre} ${a.apellido} ${a.email} ${a.codigo_referido||""}`.toLowerCase().includes(q);
  });

  const totalReferidas  = asociadas.reduce((acc,a)=>acc+(a.referidas_totales||0),0);
  const totalPagaron    = asociadas.reduce((acc,a)=>acc+(a.referidas_pagaron||0),0);
  const conCodigo       = asociadas.filter(a=>a.codigo_referido).length;

  return (
    <div className="p-5 xl:p-7 bg-[#FBF4F6] min-h-full space-y-5">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-[13px] font-medium text-white ${toast.tipo==="error"?"bg-red-500":"bg-[#A0435F]"}`}>
          <CheckIcon size={15}/>{toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-[#4A2A38] text-[24px] xl:text-[26px]">Asesoras / Asociadas</h1>
          <p className="text-[12px] text-[#9C8790]">Gestiona las asesoras del programa y sus códigos de referida.</p>
        </div>
        <button onClick={() => setModalNueva(true)}
          className="flex items-center gap-1.5 bg-[#A0435F] hover:bg-[#A0435F] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-[#A0435F]/20">
          <UserPlusIcon size={13}/> + Nueva asesora
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon:UsersIcon,    color:"bg-[#FCE8EE] text-[#A0435F]", label:"Total asesoras",     val:asociadas.length },
          { icon:CheckIcon,    color:"bg-[#E6F9F0] text-[#12A46B]", label:"Con código activo",  val:conCodigo },
          { icon:UserPlusIcon, color:"bg-[#FCE8EE] text-[#A0435F]", label:"Referidas totales",  val:totalReferidas },
          { icon:DollarSignIcon,color:"bg-[#FFF4EC] text-[#E8853B]",label:"Referidas que pagaron",val:totalPagaron },
        ].map((s,i)=>{
          const Icon=s.icon;
          return (
            <div key={i} className="bg-white border border-[#F5E1E7] rounded-2xl px-4 py-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={16} strokeWidth={1.6}/>
              </div>
              <p className="text-[10px] text-[#9C8790] leading-snug mb-1">{s.label}</p>
              <p className="font-serif font-bold text-[22px] text-[#4A2A38] leading-none">{s.val}</p>
            </div>
          );
        })}
      </div>

      {/* TABLA */}
      <div className="bg-white border border-[#F5E1E7] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#FCE8EE] flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A9B4]"/>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar por nombre, email o código..."
              className="w-full pl-9 pr-4 py-2 border border-[#F5E1E7] rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-[#C77D93]/30 focus:border-[#C77D93] bg-[#FBF4F6]"/>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#A0435F] border-t-transparent rounded-full" style={{animation:"spin 1s linear infinite"}}/>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-14">
            <UsersIcon size={32} className="mx-auto text-[#F5E1E7] mb-2"/>
            <p className="text-[#9C8790] text-[13px]">{busqueda ? "No se encontraron asesoras" : "No hay asesoras registradas aún"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#FCE8EE]">
                  {["Asesora","Código","Ubicación","Referidas","Pagaron","Acciones"].map((h,i)=>(
                    <th key={i} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9C8790] whitespace-nowrap bg-[#FBF4F6]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FBEEF1]">
                {filtradas.map(a => (
                  <tr key={a.id} className="hover:bg-[#FBF4F6] transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#FCE8EE] border border-[#C77D93] flex items-center justify-center shrink-0 overflow-hidden">
                          {a.foto_url
                            ? <img src={a.foto_url} alt="" className="w-full h-full object-cover"/>
                            : <span className="text-[#A0435F] text-[13px] font-bold">{a.nombre?.[0]}</span>}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#4A2A38]">{a.nombre} {a.apellido}</p>
                          <p className="text-[11px] text-[#9C8790]">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <CodigoBadge codigo={a.codigo_referido} onCopy={()=>copiarCodigo(a.codigo_referido,a.id)} copiado={copiado===a.id}/>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-[#4A2A38]">
                      {a.ciudad && a.pais ? `${a.ciudad}, ${a.pais}` : a.ciudad || a.pais || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-bold text-[#4A2A38]">{a.referidas_totales || 0}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-bold text-[#12A46B]">{a.referidas_pagaron || 0}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>setModalVer(a)} className="w-7 h-7 rounded-lg bg-[#FCE8EE] hover:bg-[#C77D93] flex items-center justify-center transition" title="Ver detalles">
                          <EyeIcon size={13} className="text-[#A0435F]"/>
                        </button>
                        <button onClick={()=>setModalEditar(a)} className="w-7 h-7 rounded-lg bg-[#FCE8EE] hover:bg-[#F5E1E7] flex items-center justify-center transition" title="Editar">
                          <PencilIcon size={13} className="text-[#A0435F]"/>
                        </button>
                        <button onClick={()=>setModalEliminar(a)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition" title="Eliminar">
                          <TrashIcon size={13} className="text-red-500"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#FCE8EE]">
          <p className="text-[11px] text-[#9C8790]">Mostrando {filtradas.length} de {asociadas.length} asesoras</p>
        </div>
      </div>

      {/* AVISO */}
      <div className="bg-[#FCE8EE] border border-[#F5E1E7] rounded-2xl px-5 py-3.5 flex items-start gap-3">
        <AlertCircleIcon size={16} className="text-[#A0435F] shrink-0 mt-0.5"/>
        <p className="text-[12px] text-[#7D2F47]">
          Cada asesora obtiene su código de referida automáticamente al crearse o al cambiarle el rol a "Asociada" desde la gestión de usuarios. Ese mismo código aparece en la página de <strong>Referidos</strong>.
        </p>
      </div>

      {/* MODALES */}
      {(modalNueva || modalEditar) && (
        <ModalAsesora inicial={modalEditar} onClose={()=>{setModalNueva(false);setModalEditar(null);}} onSave={handleSave}/>
      )}
      {modalVer && <ModalVerAsesora asesora={modalVer} onClose={()=>setModalVer(null)}/>}
      {modalEliminar && <ModalEliminar asesora={modalEliminar} onClose={()=>setModalEliminar(null)} onConfirm={handleEliminar}/>}
    </div>
  );
}