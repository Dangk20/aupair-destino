"use client";
// app/admin/referidos/page.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import {
  UserPlusIcon, DownloadIcon, SearchIcon, EyeIcon, PencilIcon,
  TrashIcon, CopyIcon, CheckIcon, ChevronDownIcon, CalendarIcon,
  XIcon, MoreVerticalIcon, DollarSignIcon, UsersIcon, CreditCardIcon,
  ClockIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon,
} from "lucide-react";

/* ─── Dona SVG ────────────────────────────────────────────────────────────── */
const COLORES = ["#a0435f","#7c5cc4","#c9973a","#5a8a3a","#3a7ab0","#9a6672","#e8849a"];

function DonaComisiones({ datos, totalComisiones=0 }) {
  const total = datos.reduce((a,b)=>a+b.valor,0)||1;
  const r=70, cx=90, cy=90, stroke=22, circ=2*Math.PI*r;
  let acc=0;
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0dde2" strokeWidth={stroke}/>
        {datos.map((d,i)=>{
          const dash=(d.valor/total)*circ;
          const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={COLORES[i%COLORES.length]} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ-dash}`}
            strokeDashoffset={-(acc/total)*circ}
            transform={`rotate(-90 ${cx} ${cy})`}/>;
          acc+=d.valor; return el;
        })}
        <foreignObject x={30} y={30} width={120} height={120}>
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <span className="font-serif font-bold text-[17px] text-[#2d1a22] leading-none">
              ${Number(totalComisiones).toLocaleString("es-CO")}
            </span>
            <span className="font-bold text-[12px] text-[#2d1a22]">USD</span>
            <span className="text-[9px] text-[#9a6672] leading-tight mt-0.5">Total comisiones</span>
          </div>
        </foreignObject>
      </svg>
      <div className="w-full space-y-1.5">
        {datos.map((d,i)=>(
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:COLORES[i%COLORES.length]}}/>
              <span className="text-[11px] text-[#2d1a22] truncate max-w-[110px]">{d.nombre}</span>
            </div>
            <span className="text-[11px] font-semibold text-[#2d1a22]">{d.monto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Menú acciones ───────────────────────────────────────────────────────── */
function MenuAcciones({ referido, onVer, onEditar, onEliminar, onMarcarPagado }) {
  const [open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    const fn=(e)=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",fn);
    return ()=>document.removeEventListener("mousedown",fn);
  },[]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(!open)}
        className="w-7 h-7 rounded-lg hover:bg-[#fce8ed] flex items-center justify-center transition">
        <MoreVerticalIcon size={13} className="text-[#9a6672]"/>
      </button>
      {open&&(
        <div className="absolute right-0 top-8 z-50 bg-white border border-[#f0dde2] rounded-xl shadow-xl w-44 py-1">
          {[
            {icon:EyeIcon,      label:"Ver detalles",  fn:onVer,         color:"text-[#2d1a22]"},
            {icon:PencilIcon,   label:"Editar",        fn:onEditar,      color:"text-[#2d1a22]"},
            {icon:CheckIcon,    label:"Marcar pagado", fn:onMarcarPagado,color:"text-[#5a8a3a]", hide:referido.estado==="Pagado"},
            {icon:TrashIcon,    label:"Eliminar",      fn:onEliminar,    color:"text-red-500"},
          ].filter(i=>!i.hide).map((item,i)=>{
            const Icon=item.icon;
            return(
              <button key={i} onClick={()=>{item.fn();setOpen(false);}}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] hover:bg-[#fff8f9] transition ${item.color}`}>
                <Icon size={13}/>{item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Modal Añadir/Editar ─────────────────────────────────────────────────── */
function ModalReferido({ inicial, onClose, onSave }) {
  const [form,setForm]=useState({
    nombre:inicial?.nombre||"", email:inicial?.email||"",
    codigo:inicial?.codigo||"", porcentaje:inicial?.porcentaje||20,
    estado:inicial?.estado||"Pendiente",
  });
  const [guardando,setGuardando]=useState(false);
  const [err,setErr]=useState("");

  const submit=async()=>{
    if(!form.nombre||!form.email||!form.codigo){setErr("Nombre, email y código son obligatorios.");return;}
    setGuardando(true);setErr("");
    await onSave({...form,id:inicial?.id});
    setGuardando(false);onClose();
  };
  const ic="w-full border border-[#f0dde2] rounded-xl px-3.5 py-2.5 text-[13px] text-[#2d1a22] bg-white focus:outline-none focus:ring-2 focus:ring-[#e8849a]/40 focus:border-[#e8849a] transition font-[inherit]";
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]"/>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-[18px] font-bold text-[#2d1a22]">
              {inicial?"Editar referente":"Añadir referente"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#fce8ed] flex items-center justify-center hover:bg-[#f0b8c4] transition">
              <XIcon size={14} className="text-[#a0435f]"/>
            </button>
          </div>
          {err&&<div className="bg-red-50 border border-red-200 text-red-600 text-[12px] px-3 py-2 rounded-xl mb-4">{err}</div>}
          <div className="space-y-3.5">
            {[
              {label:"Nombre completo",    key:"nombre",  type:"text",  ph:"Tati Gómez",   upper:false},
              {label:"Correo electrónico", key:"email",   type:"email", ph:"tati@gmail.com",upper:false},
              {label:"Código de referido", key:"codigo",  type:"text",  ph:"TATI2026",      upper:true},
            ].map(f=>(
              <label key={f.key} className="block">
                <span className="text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide">{f.label}</span>
                <input type={f.type} placeholder={f.ph} value={form[f.key]}
                  onChange={e=>setForm({...form,[f.key]:f.upper?e.target.value.toUpperCase():e.target.value})}
                  className={`mt-1 ${ic}`}/>
              </label>
            ))}
            <label className="block">
              <span className="text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide">Comisión (%)</span>
              <input type="number" min={1} max={100} value={form.porcentaje}
                onChange={e=>setForm({...form,porcentaje:e.target.value})}
                className={`mt-1 ${ic}`}/>
            </label>
            {inicial&&(
              <label className="block">
                <span className="text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide">Estado</span>
                <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}
                  className={`mt-1 ${ic} cursor-pointer`}>
                  <option>Pendiente</option><option>Pagado</option>
                </select>
              </label>
            )}
          </div>
          <div className="flex gap-2.5 mt-6">
            <button onClick={onClose}
              className="flex-1 border border-[#f0dde2] text-[#9a6672] text-[13px] font-medium py-2.5 rounded-xl hover:bg-[#fff8f9] transition">
              Cancelar
            </button>
            <button onClick={submit} disabled={guardando}
              className="flex-1 bg-[#a0435f] hover:bg-[#8a3550] disabled:opacity-60 text-white text-[13px] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
              {guardando
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Guardando…</>
                : (inicial?"Guardar cambios":"Añadir referente")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Ver ───────────────────────────────────────────────────────────── */
function ModalVer({referido:r,onClose}){
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]"/>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-[18px] font-bold text-[#2d1a22]">Detalle del referente</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#fce8ed] flex items-center justify-center hover:bg-[#f0b8c4] transition">
              <XIcon size={14} className="text-[#a0435f]"/>
            </button>
          </div>
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#fce8ed]">
            <div className="w-14 h-14 rounded-2xl bg-[#fce8ed] flex items-center justify-center text-[#a0435f] text-[22px] font-bold font-serif border border-[#f0b8c4]">
              {r.inicial||r.nombre?.[0]}
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#2d1a22]">{r.nombre}</p>
              <p className="text-[12px] text-[#9a6672]">{r.email}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                r.estado==="Pagado"?"bg-[#e8f0e0] text-[#5a8a3a]":"bg-[#fdf3e3] text-[#c9973a]"}`}>
                {r.estado==="Pendiente"?"⏱ Pendiente":"✓ Pagado"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:"Código",             val:r.codigo},
              {label:"Comisión (%)",       val:`${r.porcentaje||20}%`},
              {label:"Registradas",        val:r.registradas},
              {label:"Pagaron",            val:r.pagaron},
              {label:"Ingresos generados", val:r.ingresos},
              {label:"Comisión generada",  val:r.comision},
              {label:"Comisión pagada",    val:r.pagada},
              {label:"Pendiente",          val:r.pendiente},
            ].map((item,i)=>(
              <div key={i} className="bg-[#fff8f9] rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-[#9a6672] font-semibold uppercase tracking-wide">{item.label}</p>
                <p className="text-[13px] font-bold text-[#2d1a22] mt-0.5">{item.val??'—'}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose}
            className="w-full mt-5 border border-[#f0dde2] text-[#9a6672] text-[13px] font-medium py-2.5 rounded-xl hover:bg-[#fff8f9] transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Eliminar ──────────────────────────────────────────────────────── */
function ModalEliminar({referido,onClose,onConfirm}){
  const [eli,setEli]=useState(false);
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center px-6 py-7">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <TrashIcon size={22} className="text-red-500"/>
        </div>
        <h3 className="font-serif text-[17px] font-bold text-[#2d1a22] mb-2">¿Eliminar referente?</h3>
        <p className="text-[13px] text-[#9a6672] mb-6">
          Vas a eliminar a <strong>{referido.nombre}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-[#f0dde2] text-[#9a6672] text-[13px] py-2.5 rounded-xl hover:bg-[#fff8f9] transition">
            Cancelar
          </button>
          <button onClick={async()=>{setEli(true);await onConfirm();setEli(false);onClose();}} disabled={eli}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[13px] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
            {eli?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<TrashIcon size={13}/>}
            {eli?"Eliminando…":"Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═════════════════════════════════════════════════════════════════════════════ */
export default function ReferidosPage() {
  // ── Estado vista referentes ──
  const [referidos,     setReferidos]     = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroEstado,  setFiltroEstado]  = useState("Todos");
  const [tab,           setTab]           = useState("referente");
  const [copiado,       setCopiado]       = useState(null);

  // ── Estado vista inscripciones ──
  const [inscripciones, setInscripciones] = useState([]);
  const [cargandoInsc,  setCargandoInsc]  = useState(false);
  const [busqInsc,      setBusqInsc]      = useState("");
  const [paginaInsc,    setPaginaInsc]    = useState(1);
  const [totalInsc,     setTotalInsc]     = useState(0);
  const [paginasInsc,   setPaginasInsc]   = useState(1);

  // ── Modales ──
  const [modalAniadir,   setModalAniadir]   = useState(false);
  const [modalEditar,    setModalEditar]    = useState(null);
  const [modalVer,       setModalVer]       = useState(null);
  const [modalEliminar,  setModalEliminar]  = useState(null);
  const [toast,          setToast]          = useState(null);

  /* ── Toast ── */
  const showToast=(msg,tipo="ok")=>{ setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  /* ── Cargar referentes ── */
  const cargar=useCallback(async()=>{
    setCargando(true);
    try{
      const res=await fetch("/api/admin/referidos");
      const data=await res.json();
      setReferidos(data.referidos||[]);
    }catch{ showToast("Error cargando datos","error"); }
    finally{ setCargando(false); }
  },[]);

  /* ── Cargar inscripciones ── */
  const cargarInsc=useCallback(async(pagina=1,q="")=>{
    setCargandoInsc(true);
    try{
      const params=new URLSearchParams({page:pagina,limit:10,...(q&&{q})});
      const res=await fetch(`/api/admin/referidos/inscripciones?${params}`);
      const data=await res.json();
      setInscripciones(data.inscripciones||[]);
      setTotalInsc(data.total||0);
      setPaginasInsc(data.paginas||1);
      setPaginaInsc(pagina);
    }catch{ showToast("Error cargando inscripciones","error"); }
    finally{ setCargandoInsc(false); }
  },[]);

  useEffect(()=>{ cargar(); },[cargar]);
  useEffect(()=>{
    if(tab==="inscripcion") cargarInsc(1,busqInsc);
  },[tab]);

  /* ── Guardar referente ── */
  const handleSave=async(form)=>{
    const method=form.id?"PUT":"POST";
    const res=await fetch("/api/admin/referidos",{
      method,headers:{"Content-Type":"application/json"},body:JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    if(res.ok){ showToast(form.id?"Referente actualizado":"Referente añadido"); cargar(); }
    else showToast(d.error||"Error al guardar","error");
  };

  /* ── Eliminar referente ── */
  const handleEliminar=async()=>{
    const res=await fetch(`/api/admin/referidos/${modalEliminar.id}`,{method:"DELETE"});
    if(res.ok){ showToast("Referente eliminado"); cargar(); }
    else showToast("Error al eliminar","error");
  };

  /* ── Marcar pagado ── */
  const handleMarcarPagado = async (id) => {
  const res = await fetch(`/api/admin/referidos/${id}/pagar`, {
    method: "POST",
  });
  if (res.ok) { showToast("Marcado como pagado ✓"); cargar(); }
  else showToast("Error", "error");
};

  /* ── Copiar código ── */
  const copiarCodigo=(codigo,id)=>{
    navigator.clipboard.writeText(codigo).then(()=>{ setCopiado(id); setTimeout(()=>setCopiado(null),2000); });
  };

  /* ── Exportar ── */
  const exportar=()=>{
    const csv=["Referente,Email,Código,Registradas,Pagaron,Ingresos,Comisión,Pagada,Pendiente,Estado",
      ...referidos.map(r=>`${r.nombre},${r.email},${r.codigo},${r.registradas},${r.pagaron},${r.ingresos},${r.comision},${r.pagada},${r.pendiente},${r.estado}`)
    ].join("\n");
    const a=document.createElement("a");
    a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download=`referidos-${Date.now()}.csv`;
    a.click();
    showToast("Reporte exportado");
  };

  /* ── Filtros vista referente ── */
  const filtrados=referidos.filter(r=>{
    const q=busqueda.toLowerCase();
    return (!q||r.nombre?.toLowerCase().includes(q)||r.codigo?.toLowerCase().includes(q)||r.email?.toLowerCase().includes(q))
      &&(filtroEstado==="Todos"||r.estado===filtroEstado);
  });

  const topCodigos=[...referidos].sort((a,b)=>b.registradas-a.registradas).slice(0,5);
  const maxReg=Math.max(...topCodigos.map(r=>r.registradas),1);
  const totalReg=referidos.reduce((a,b)=>a+b.registradas,0);
  const donaData=referidos.filter(r=>r.comision_num>0).map(r=>({nombre:r.nombre,monto:r.comision,valor:r.comision_num}));
  const totalComisiones=referidos.reduce((a,b)=>a+b.comision_num,0);

  const totales={
    registradas: filtrados.reduce((a,b)=>a+b.registradas,0),
    pagaron:     filtrados.reduce((a,b)=>a+b.pagaron,0),
  };

  /* ─── RENDER ─────────────────────────────────────────────────────────────── */
  return(
    <div className="p-5 xl:p-7 bg-[#fff8f9] min-h-full space-y-5">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Toast */}
      {toast&&(
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-[13px] font-medium text-white ${toast.tipo==="error"?"bg-red-500":"bg-[#a0435f]"}`}>
          <CheckIcon size={15}/>{toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-[#2d1a22] text-[24px] xl:text-[26px]">Referidos y comisiones</h1>
          <p className="text-[12px] text-[#9a6672]">Consulta qué códigos fueron usados, cuántas personas llegaron por cada referente y cuánto corresponde pagar.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportar}
            className="flex items-center gap-1.5 bg-white border border-[#f0dde2] text-[#a0435f] text-[12px] font-semibold px-4 py-2 rounded-xl hover:bg-[#fce8ed] transition shadow-sm">
            <DownloadIcon size={13}/> Exportar reporte
          </button>
          <button onClick={()=>setModalAniadir(true)}
            className="flex items-center gap-1.5 bg-[#a0435f] hover:bg-[#8a3550] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-[#a0435f]/20">
            <UserPlusIcon size={13}/> + Añadir referente
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {icon:UsersIcon,       color:"bg-[#fce8ed] text-[#a0435f]", label:"Total referidos registrados", val:referidos.reduce((a,b)=>a+b.registradas,0)},
          {icon:CheckCircleIcon, color:"bg-[#e8f0e0] text-[#5a8a3a]", label:"Referidos que pagaron",        val:referidos.reduce((a,b)=>a+b.pagaron,0)},
          {icon:DollarSignIcon,  color:"bg-[#fdf3e3] text-[#c9973a]", label:"Comisiones generadas",         val:`$${totalComisiones.toLocaleString("es-CO")} USD`},
          {icon:CreditCardIcon,  color:"bg-[#e8f0ff] text-[#2a4a7f]", label:"Comisiones pagadas",           val:`$${referidos.filter(r=>r.estado==="Pagado").reduce((a,b)=>a+b.comision_num,0).toLocaleString("es-CO")} USD`},
          {icon:ClockIcon,       color:"bg-[#fff0f8] text-[#a0435f]", label:"Pendientes por pagar",         val:`$${referidos.filter(r=>r.estado==="Pendiente").reduce((a,b)=>a+b.pendiente_num,0).toLocaleString("es-CO")} USD`,
           sub:`${referidos.filter(r=>r.estado==="Pendiente").length} pagos pendientes`},
        ].map((s,i)=>{
          const Icon=s.icon;
          return(
            <div key={i} className="bg-white border border-[#f0dde2] rounded-2xl px-4 py-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={16} strokeWidth={1.6}/>
              </div>
              <p className="text-[10px] text-[#9a6672] leading-snug mb-1">{s.label}</p>
              <p className="font-serif font-bold text-[20px] text-[#2d1a22] leading-none">{s.val}</p>
              {s.sub&&<p className="text-[10px] text-[#c9973a] font-semibold mt-1">{s.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* ── TABLA ── */}
      <div className="bg-white border border-[#f0dde2] rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-[#fce8ed] flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-1 bg-[#fff8f9] rounded-xl p-1 border border-[#f0dde2]">
            {[{id:"referente",label:"Vista por referente"},{id:"inscripcion",label:"Vista por inscripción"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition ${tab===t.id?"bg-white text-[#a0435f] font-semibold shadow-sm border border-[#f0dde2]":"text-[#9a6672] hover:text-[#2d1a22]"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 flex items-center gap-2 flex-wrap lg:justify-end">
            <div className="relative">
              <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0909a]"/>
              <input
                value={tab==="referente"?busqueda:busqInsc}
                onChange={e=>{
                  if(tab==="referente") setBusqueda(e.target.value);
                  else{ setBusqInsc(e.target.value); cargarInsc(1,e.target.value); }
                }}
                placeholder={tab==="referente"?"Buscar referente o código...":"Buscar por nombre, correo o código..."}
                className="pl-9 pr-4 py-2 border border-[#f0dde2] rounded-xl text-[12px] w-56 focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] bg-[#fff8f9]"/>
            </div>
            {tab==="referente"&&(
              <select value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)}
                className="border border-[#f0dde2] rounded-xl px-3 py-2 text-[11px] text-[#2d1a22] bg-white focus:outline-none cursor-pointer">
                <option value="Todos">Todos los estados</option>
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            )}
          </div>
        </div>

        {/* ── VISTA POR REFERENTE ── */}
        {tab==="referente"&&(
          <>
            {cargando?(
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full" style={{animation:"spin 1s linear infinite"}}/>
              </div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#fce8ed]">
                      {["Referente","Código","Registradas","Pagaron","Ingresos generados","Comisión generada","Comisión pagada","Pendiente por pagar","Estado","Acciones"].map((h,i)=>(
                        <th key={i} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9a6672] whitespace-nowrap bg-[#fff8f9]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#fff0f3]">
                    {filtrados.length===0?(
                      <tr><td colSpan={10} className="text-center py-10 text-[13px] text-[#9a6672]">No se encontraron resultados.</td></tr>
                    ):filtrados.map(r=>(
                      <tr key={r.id} className="hover:bg-[#fff8f9] transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0">
                              <span className="text-[#a0435f] text-[12px] font-bold">{r.inicial}</span>
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold text-[#2d1a22]">{r.nombre}</p>
                              <p className="text-[10px] text-[#9a6672]">{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-bold text-[#a0435f]">{r.codigo}</span>
                            <button onClick={()=>copiarCodigo(r.codigo,r.id)} className="text-[#c0a0a8] hover:text-[#a0435f] transition">
                              {copiado===r.id?<CheckIcon size={11} className="text-[#5a8a3a]"/>:<CopyIcon size={11}/>}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-[12px] text-[#2d1a22] font-medium">{r.registradas}</td>
                        <td className="px-4 py-3.5 text-[12px] text-[#5a8a3a] font-bold">{r.pagaron}</td>
                        <td className="px-4 py-3.5 text-[12px] text-[#2d1a22]">{r.ingresos}</td>
                        <td className="px-4 py-3.5 text-[12px] text-[#2d1a22]">{r.comision}</td>
                        <td className="px-4 py-3.5 text-[12px] text-[#2d1a22]">{r.pagada}</td>
                        <td className="px-4 py-3.5 text-[12px] font-bold text-[#c9973a]">{r.pendiente}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${r.estado==="Pagado"?"bg-[#e8f0e0] text-[#5a8a3a]":"bg-[#fdf3e3] text-[#c9973a]"}`}>
                            {r.estado==="Pendiente"?"⏱ Pendiente":"✓ Pagado"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={()=>setModalVer(r)} className="w-7 h-7 rounded-lg bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center transition">
                              <EyeIcon size={12} className="text-[#a0435f]"/>
                            </button>
                            <MenuAcciones referido={r}
                              onVer={()=>setModalVer(r)}
                              onEditar={()=>setModalEditar(r)}
                              onEliminar={()=>setModalEliminar(r)}
                              onMarcarPagado={()=>handleMarcarPagado(r.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#f0dde2] bg-[#fff8f9]">
                      <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]" colSpan={2}>Totales</td>
                      <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">{totales.registradas}</td>
                      <td className="px-4 py-3 text-[12px] font-bold text-[#5a8a3a]">{totales.pagaron}</td>
                      <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">${filtrados.reduce((a,b)=>a+b.ingresos_num,0).toLocaleString("es-CO")} USD</td>
                      <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">${filtrados.reduce((a,b)=>a+b.comision_num,0).toLocaleString("es-CO")} USD</td>
                      <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">${filtrados.filter(r=>r.estado==="Pagado").reduce((a,b)=>a+b.comision_num,0).toLocaleString("es-CO")} USD</td>
                      <td className="px-4 py-3 text-[12px] font-bold text-[#c9973a]">${filtrados.filter(r=>r.estado==="Pendiente").reduce((a,b)=>a+b.pendiente_num,0).toLocaleString("es-CO")} USD</td>
                      <td colSpan={2}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            <div className="px-5 py-3 border-t border-[#fce8ed] flex items-center justify-between">
              <p className="text-[11px] text-[#9a6672]">Mostrando {filtrados.length} de {referidos.length} referentes</p>
            </div>
          </>
        )}

        {/* ── VISTA POR INSCRIPCIÓN ── */}
        {tab==="inscripcion"&&(
          <>
            {cargandoInsc?(
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full" style={{animation:"spin 1s linear infinite"}}/>
              </div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#fce8ed]">
                      {["Estudiante","Correo","Código utilizado","Referido por","Fecha de registro","Estado de pago","Paquete","Monto pagado","Comisión generada","Estado comisión","Acciones"].map((h,i)=>(
                        <th key={i} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9a6672] whitespace-nowrap bg-[#fff8f9]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#fff0f3]">
                    {inscripciones.length===0?(
                      <tr><td colSpan={11} className="text-center py-10 text-[13px] text-[#9a6672]">No se encontraron inscripciones.</td></tr>
                    ):inscripciones.map(u=>(
                      <tr key={u.id} className="hover:bg-[#fff8f9] transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0 overflow-hidden">
                              {u.foto_url
                                ?<img src={u.foto_url} alt="" className="w-full h-full object-cover"/>
                                :<span className="text-[#a0435f] text-[11px] font-bold">{u.nombre?.[0]}</span>
                              }
                            </div>
                            <p className="text-[12px] font-semibold text-[#2d1a22]">{u.estudiante}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#9a6672]">{u.email}</td>
                        <td className="px-4 py-3">
                          {u.codigo_utilizado
                            ?<span className="text-[12px] font-bold text-[#a0435f]">{u.codigo_utilizado}</span>
                            :<span className="text-[11px] text-[#9a6672]">(Sin código)</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          {u.referido_por==="Directo / Orgánico"
                            ?<span className="text-[11px] text-[#9a6672]">— Directo / Orgánico</span>
                            :<div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-[#fce8ed] flex items-center justify-center text-[9px] font-bold text-[#a0435f] shrink-0">
                                {u.referido_inicial}
                              </div>
                              <span className="text-[12px] text-[#2d1a22]">{u.referido_por}</span>
                            </div>
                          }
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#9a6672] whitespace-nowrap">{u.fecha_registro}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                            u.estado_pago==="Pagada"?"bg-[#e8f0e0] text-[#5a8a3a]":"bg-[#fdf3e3] text-[#c9973a]"
                          }`}>{u.estado_pago}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#9a6672]">{u.paquete}</td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-[#2d1a22]">{u.monto_pagado}</td>
                        <td className="px-4 py-3 text-[12px] text-[#2d1a22]">
                          {u.comision_generada}
                          {u.porcentaje>0&&<span className="text-[10px] text-[#9a6672] ml-1">({u.porcentaje}%)</span>}
                        </td>
                        <td className="px-4 py-3">
                          {u.estado_comision==="N/A"
                            ?<span className="text-[11px] text-[#9a6672]">N/A</span>
                            :<span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                              u.estado_comision==="Pagado"?"bg-[#e8f0e0] text-[#5a8a3a]":"bg-[#fdf3e3] text-[#c9973a]"
                            }`}>{u.estado_comision}</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <button className="w-7 h-7 rounded-lg bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center transition">
                            <EyeIcon size={12} className="text-[#a0435f]"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Paginación inscripciones */}
            <div className="px-5 py-3 border-t border-[#fce8ed] flex items-center justify-between">
              <p className="text-[11px] text-[#9a6672]">
                Mostrando {Math.min((paginaInsc-1)*10+1,totalInsc)} a {Math.min(paginaInsc*10,totalInsc)} de {totalInsc} inscripciones
              </p>
              <div className="flex items-center gap-1">
                <button onClick={()=>cargarInsc(paginaInsc-1,busqInsc)} disabled={paginaInsc<=1}
                  className="w-7 h-7 rounded-lg text-[#9a6672] hover:bg-[#fce8ed] disabled:opacity-40 transition flex items-center justify-center">
                  <ChevronLeftIcon size={13}/>
                </button>
                {Array.from({length:Math.min(paginasInsc,6)},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>cargarInsc(p,busqInsc)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-medium transition ${p===paginaInsc?"bg-[#a0435f] text-white":"text-[#9a6672] hover:bg-[#fce8ed]"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={()=>cargarInsc(paginaInsc+1,busqInsc)} disabled={paginaInsc>=paginasInsc}
                  className="w-7 h-7 rounded-lg text-[#9a6672] hover:bg-[#fce8ed] disabled:opacity-40 transition flex items-center justify-center">
                  <ChevronRightIcon size={13}/>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── FILA INFERIOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dona */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-4">Distribución de comisiones</h2>
          <DonaComisiones
            datos={donaData.length>0?donaData:[{nombre:"Sin datos",monto:"$0",valor:1}]}
            totalComisiones={totalComisiones}
          />
        </div>

        {/* Top códigos */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-4">Top códigos utilizados</h2>
          {topCodigos.length===0
            ?<p className="text-[12px] text-[#9a6672] text-center py-4">Sin datos aún.</p>
            :(
              <div className="space-y-0 divide-y divide-[#fff0f3]">
                <div className="grid grid-cols-[1fr_40px_1fr_40px] gap-2 pb-2">
                  {["Código","Usos","% del total",""].map((h,i)=>(
                    <p key={i} className="text-[10px] font-bold uppercase text-[#9a6672]">{h}</p>
                  ))}
                </div>
                {topCodigos.map(r=>{
                  const pct=Math.round((r.registradas/maxReg)*100);
                  const pctT=totalReg>0?Math.round((r.registradas/totalReg)*100):0;
                  return(
                    <div key={r.id} className="grid grid-cols-[1fr_40px_1fr_40px] gap-2 items-center py-2.5">
                      <span className="text-[12px] font-bold text-[#a0435f]">{r.codigo}</span>
                      <span className="text-[12px] text-[#2d1a22] font-medium">{r.registradas}</span>
                      <div className="h-1.5 bg-[#f0dde2] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#a0435f] to-[#e8849a]" style={{width:`${pct}%`}}/>
                      </div>
                      <span className="text-[11px] text-[#9a6672] font-medium text-right">{pctT}%</span>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>

        {/* Últimos pagos */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#fce8ed]">
            <h2 className="text-[13px] font-bold text-[#2d1a22]">Últimos pagos de comisiones</h2>
          </div>
          <div className="px-5">
            <div className="grid grid-cols-[1fr_80px_70px] gap-2 py-2 border-b border-[#fff0f3]">
              {["Referente","Monto","Estado"].map((h,i)=>(
                <p key={i} className="text-[10px] font-bold uppercase text-[#9a6672]">{h}</p>
              ))}
            </div>
            {referidos.length===0
              ?<p className="py-6 text-center text-[12px] text-[#9a6672]">Sin pagos aún.</p>
              :referidos.slice(0,6).map((r,i)=>(
                <div key={i} className="grid grid-cols-[1fr_80px_70px] gap-2 items-center py-2.5 border-b border-[#fff0f3] last:border-0">
                  <span className="text-[12px] font-medium text-[#2d1a22] truncate">{r.nombre}</span>
                  <span className="text-[12px] font-bold text-[#2d1a22]">{r.comision}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-center ${r.estado==="Pagado"?"bg-[#e8f0e0] text-[#5a8a3a]":"bg-[#fdf3e3] text-[#c9973a]"}`}>
                    {r.estado==="Pagado"?"Pagado":"Pendiente"}
                  </span>
                </div>
              ))
            }
          </div>
          <div className="px-5 py-3 border-t border-[#fce8ed]">
            <p className="text-[10px] text-[#9a6672] italic">Los pagos se realizan únicamente a referentes con al menos $50 USD acumulados.</p>
          </div>
        </div>
      </div>

      {/* ── MODALES ── */}
      {(modalAniadir||modalEditar)&&(
        <ModalReferido inicial={modalEditar}
          onClose={()=>{setModalAniadir(false);setModalEditar(null);}}
          onSave={handleSave}/>
      )}
      {modalVer&&<ModalVer referido={modalVer} onClose={()=>setModalVer(null)}/>}
      {modalEliminar&&<ModalEliminar referido={modalEliminar} onClose={()=>setModalEliminar(null)} onConfirm={handleEliminar}/>}
    </div>
  );
}