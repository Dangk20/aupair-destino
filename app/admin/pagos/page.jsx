"use client";

import { useState, useEffect, useRef } from "react";
import {
  DownloadIcon, FilterIcon, EyeIcon, SearchIcon,
  CalendarIcon, ChevronDownIcon, XIcon, CheckIcon,
  DollarSignIcon, CreditCardIcon, TrendingUpIcon,
  ClockIcon, UsersIcon, ArrowUpIcon, CheckCircleIcon,
} from "lucide-react";

const COLORES_DONA = ["#e8849a", "#c9973a", "#a0435f"];

/* ── Dona estatus comisiones ── */
function DonaEstatus({ pendientes, programadas, vencidas }) {
  const total = pendientes + programadas + vencidas || 1;
  const r = 60, cx = 80, cy = 80, stroke = 20;
  const circ = 2 * Math.PI * r;
  const datos = [
    { val: pendientes,  color: "#e8849a" },
    { val: programadas, color: "#c9973a" },
    { val: vencidas,    color: "#a0435f" },
  ];
  let offset = 0;
  const arcos = datos.map(d => {
    const dash = (d.val / total) * circ;
    const el = { ...d, dash, offset: circ * 0.25 - offset };
    offset += dash;
    return el;
  });
  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0dde2" strokeWidth={stroke}/>
          {arcos.map((a, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color}
              strokeWidth={stroke} strokeDasharray={`${a.dash} ${circ - a.dash}`}
              strokeDashoffset={a.offset} strokeLinecap="round"/>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif font-bold text-[18px] text-[#2d1a22]">
            ${(pendientes + programadas + vencidas).toLocaleString("es-CO")}
          </span>
          <span className="font-bold text-[12px] text-[#2d1a22]">USD</span>
          <span className="text-[8px] text-[#9a6672] text-center mt-0.5 leading-tight">Total por<br/>pagar</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { color:"bg-[#e8849a]", label:"Pendientes",  val:`$${pendientes.toLocaleString("es-CO")} USD`,  pct: Math.round(pendientes/total*100) },
          { color:"bg-[#c9973a]", label:"Programadas", val:`$${programadas.toLocaleString("es-CO")} USD`, pct: Math.round(programadas/total*100) },
          { color:"bg-[#a0435f]", label:"Vencidas",    val:`$${vencidas.toLocaleString("es-CO")} USD`,    pct: Math.round(vencidas/total*100) },
        ].map((l, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`}/>
              <span className="text-[11px] text-[#2d1a22]">{l.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#2d1a22]">{l.val}</span>
              <span className="text-[10px] text-[#9a6672]">{l.pct}%</span>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-[#f0dde2]">
          <p className="text-[10px] text-[#9a6672]">Próximos pagos programados</p>
          <p className="text-[12px] font-bold text-[#a0435f] mt-0.5">31 may, 2024 · ${programadas.toLocaleString("es-CO")} USD</p>
        </div>
      </div>
    </div>
  );
}

/* ── Gráfica barras ingresos ── */
function GraficaIngresos({ datos }) {
  const max = Math.max(...(datos?.map(d => d.monto) || [1]), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {(datos || []).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-gradient-to-t from-[#a0435f] to-[#e8849a]"
               style={{ height: `${Math.max((d.monto / max) * 96, d.monto > 0 ? 6 : 2)}px` }}/>
          <span className="text-[8px] text-[#9a6672] text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Modal ver detalle pago ── */
function ModalVerPago({ pago, onClose }) {
  if (!pago) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]"/>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0dde2]">
          <h3 className="font-bold text-[16px] text-[#2d1a22]">Detalle del movimiento</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center">
            <XIcon size={14} className="text-[#a0435f]"/>
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label:"Referencia / Código", val: pago.referencia },
            { label:"Tipo",               val: pago.tipo        },
            { label:"Descripción",        val: pago.descripcion },
            { label:"Estudiante",         val: pago.estudiante  },
            { label:"Referente / Código", val: pago.referente   },
            { label:"Método de pago",     val: pago.metodo      },
            { label:"Monto",              val: pago.monto       },
            { label:"Estado",             val: pago.estado      },
            { label:"Fecha",              val: pago.fecha       },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#fff0f3] last:border-0">
              <span className="text-[11px] text-[#9a6672] uppercase tracking-wide">{s.label}</span>
              <span className={`text-[12px] font-semibold ${
                s.label === "Estado" && pago.estado === "Completado" ? "text-[#5a8a3a]"
                : s.label === "Estado" && pago.estado === "Pendiente" ? "text-[#c9973a]"
                : s.label === "Monto" ? (pago.tipo === "Ingreso" ? "text-[#5a8a3a]" : "text-[#a0435f]")
                : "text-[#2d1a22]"
              }`}>{s.val || "—"}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose}
            className="w-full bg-[#a0435f] hover:bg-[#8a3550] text-white font-semibold text-[13px] py-3 rounded-xl transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal confirmar pago ── */
function ModalConfirmarPago({ onClose, onConfirm }) {
  const [usuarioId, setUsuarioId] = useState("");
  const [monto, setMonto]         = useState("35");
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (!usuarioId) return;
    setLoading(true);
    await onConfirm(usuarioId, parseFloat(monto));
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#5a8a3a] via-[#90d060] to-[#5a8a3a]"/>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0dde2]">
          <h3 className="font-bold text-[16px] text-[#2d1a22]">Confirmar pago recibido</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#fce8ed] flex items-center justify-center">
            <XIcon size={14} className="text-[#a0435f]"/>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#2d1a22] mb-1.5">
              ID del usuario
            </label>
            <input type="number" placeholder="Ej. 42" value={usuarioId}
              onChange={e => setUsuarioId(e.target.value)}
              className="w-full border border-[#f0dde2] rounded-xl px-4 py-2.5 text-[13px]
                         focus:outline-none focus:ring-2 focus:ring-[#5a8a3a]/30 focus:border-[#5a8a3a] bg-[#fff8f9]"/>
            <p className="text-[10px] text-[#9a6672] mt-1">Puedes ver el ID en la sección Usuarios</p>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#2d1a22] mb-1.5">
              Monto pagado (USD)
            </label>
            <div className="flex gap-2">
              {["29","35"].map(v => (
                <button key={v} onClick={() => setMonto(v)}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-2 transition ${
                    monto === v ? "bg-[#a0435f] border-[#a0435f] text-white" : "border-[#f0dde2] text-[#2d1a22] hover:border-[#e8849a]"
                  }`}>${v} USD</button>
              ))}
              <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
                className="flex-1 border-2 border-[#f0dde2] rounded-xl px-3 py-2.5 text-[13px]
                           focus:outline-none focus:border-[#a0435f] text-center" placeholder="Otro"/>
            </div>
          </div>
          <div className="bg-[#e8f0e0] border border-[#b8d4a0] rounded-xl px-4 py-3">
            <p className="text-[12px] text-[#3a7a50] font-medium">
              ✓ Esto activará el acceso del usuario y registrará la comisión del referente si aplica.
            </p>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 border-2 border-[#f0dde2] text-[#9a6672] font-semibold text-[13px] py-3 rounded-xl hover:bg-[#fff0f3] transition">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={!usuarioId || loading}
            className="flex-1 bg-[#5a8a3a] hover:bg-[#4a7a2a] disabled:opacity-40 text-white font-semibold text-[13px] py-3 rounded-xl transition">
            {loading ? "Confirmando..." : "Confirmar pago ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════
   PÁGINA PRINCIPAL
════════════════════════ */
export default function PagosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [stats, setStats]             = useState(null);
  const [cargando, setCargando]       = useState(true);
  const [busqueda, setBusqueda]       = useState("");
  const [filtroTipo, setFiltroTipo]   = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroMetodo, setFiltroMetodo] = useState("Todos");
  const [tab, setTab]                 = useState("flujo");
  const [fechaRango, setFechaRango]   = useState("01 – 31 de mayo, 2024");
  const [modalVer, setModalVer]       = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [toast, setToast]             = useState(null);
  const [pagina, setPagina]           = useState(1);
  const POR_PAGINA = 7;

  const showToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargar = async () => {
    setCargando(true);
    try {
      const [mRes, sRes] = await Promise.all([
        fetch("/api/admin/pagos/movimientos"),
        fetch("/api/admin/pagos/stats"),
      ]);
      const mData = await mRes.json();
      const sData = await sRes.json();
      setMovimientos(mData.movimientos || []);
      setStats(sData);
    } catch (e) {
      showToast("Error cargando datos", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleConfirmarPago = async (usuarioId, monto) => {
    try {
      const res = await fetch("/api/admin/confirmar-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: parseInt(usuarioId), monto }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Error", "error"); return; }
      showToast("Pago confirmado y acceso activado ✓");
      cargar();
    } catch { showToast("Error de conexión", "error"); }
  };

  const exportar = () => {
    const lineas = [
      "DESTINO AU PAIR — Reporte de Pagos y Comisiones",
      `Período: ${fechaRango}`,
      "",
      "Fecha | Tipo | Descripción | Referencia | Estudiante | Método | Monto | Estado",
      ...filtrados.map(m =>
        `${m.fecha} | ${m.tipo} | ${m.descripcion} | ${m.referencia} | ${m.estudiante} | ${m.metodo} | ${m.monto} | ${m.estado}`
      ),
    ].join("\n");
    const blob = new Blob([lineas], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob), download: "pagos-comisiones.txt"
    });
    a.click(); URL.revokeObjectURL(a.href);
    showToast("Reporte exportado 📄");
  };

  const filtrados = movimientos.filter(m => {
    const q = busqueda.toLowerCase();
    const matchQ = !q || m.estudiante?.toLowerCase().includes(q)
      || m.referencia?.toLowerCase().includes(q)
      || m.referente?.toLowerCase().includes(q);
    const matchT = filtroTipo   === "Todos" || m.tipo   === filtroTipo;
    const matchE = filtroEstado === "Todos" || m.estado === filtroEstado;
    const matchM = filtroMetodo === "Todos" || m.metodo === filtroMetodo;
    return matchQ && matchT && matchE && matchM;
  });

  const totalPags  = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados  = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const s = stats || {
    ingresos: 0, comisionesPagar: 0, comisionesPagadas: 0,
    gananciaNeta: 0, pagosPendientes: 0, montoPendiente: 0,
    pendientes: 0, programadas: 0, vencidas: 0,
    graficaIngresos: [],
    topReferentes: [],
    metodoPagos: [],
  };

  if (cargando) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="p-5 xl:p-7 bg-[#fff8f9] min-h-full space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3
                         rounded-2xl shadow-xl text-[13px] font-medium text-white ${
          toast.tipo === "error" ? "bg-red-500" : "bg-[#a0435f]"
        }`}>
          <CheckIcon size={15}/>{toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif font-bold text-[#2d1a22] text-[24px] xl:text-[26px]">
              Pagos y comisiones
            </h1>
            <div className="w-6 h-6 rounded-full bg-[#fce8ed] flex items-center justify-center">
              <span className="text-[10px] text-[#a0435f] font-bold">ⓘ</span>
            </div>
          </div>
          <p className="text-[12px] text-[#9a6672]">
            Gestiona los pagos recibidos del programa y el pago de comisiones a tus referidos.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-white border border-[#f0dde2] rounded-xl
                             px-3 py-2 text-[12px] text-[#2d1a22] shadow-sm hover:border-[#e8849a] transition">
            <CalendarIcon size={13} className="text-[#a0435f]"/>
            {fechaRango}
            <ChevronDownIcon size={11} className="text-[#9a6672]"/>
          </button>
          <button className="flex items-center gap-1.5 bg-white border border-[#f0dde2] text-[#9a6672]
                             text-[12px] font-semibold px-4 py-2 rounded-xl hover:bg-[#fce8ed] transition shadow-sm">
            <FilterIcon size={13}/>
            Filtros avanzados
          </button>
          <button onClick={exportar}
            className="flex items-center gap-1.5 bg-[#a0435f] hover:bg-[#8a3550] text-white
                       text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-[#a0435f]/20">
            <DownloadIcon size={13}/>
            Exportar reporte
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon:DollarSignIcon,  color:"bg-[#fce8ed] text-[#a0435f]", label:"Ingresos totales (programa)", val:`$${s.ingresos?.toLocaleString("es-CO")||0} USD`, change:"+24%" },
          { icon:CreditCardIcon,  color:"bg-[#fdf3e3] text-[#c9973a]", label:"Comisiones por pagar",        val:`$${s.comisionesPagar?.toLocaleString("es-CO")||0} USD`, change:"+12%" },
          { icon:CheckCircleIcon, color:"bg-[#e8f0e0] text-[#5a8a3a]", label:"Comisiones pagadas",          val:`$${s.comisionesPagadas?.toLocaleString("es-CO")||0} USD`, change:"+18%" },
          { icon:TrendingUpIcon,  color:"bg-[#e8f0ff] text-[#2a4a7f]", label:"Ganancia neta",               val:`$${s.gananciaNeta?.toLocaleString("es-CO")||0} USD`, change:"+28%" },
          { icon:ClockIcon,       color:"bg-[#fff0f8] text-[#a0435f]", label:"Pagos pendientes de referidos", val: s.pagosPendientes||0,
            sub:`$${s.montoPendiente?.toLocaleString("es-CO")||0} USD` },
        ].map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="bg-white border border-[#f0dde2] rounded-2xl px-4 py-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${st.color}`}>
                <Icon size={16} strokeWidth={1.6}/>
              </div>
              <p className="text-[10px] text-[#9a6672] leading-snug mb-1">{st.label}</p>
              <p className="font-serif font-bold text-[20px] text-[#2d1a22] leading-none">{st.val}</p>
              {st.change && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-[#9a6672]">Este mes</span>
                  <span className="text-[10px] font-bold text-[#5a8a3a] flex items-center gap-0.5">
                    <ArrowUpIcon size={8}/>{st.change}
                  </span>
                  <span className="text-[10px] text-[#9a6672]">vs abril</span>
                </div>
              )}
              {st.sub && <p className="text-[11px] text-[#c9973a] font-bold mt-1">{st.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* ── TABLA ── */}
      <div className="bg-white border border-[#f0dde2] rounded-2xl shadow-sm overflow-hidden">

        {/* Tabs + filtros */}
        <div className="px-5 py-4 border-b border-[#fce8ed] flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-1 bg-[#fff8f9] rounded-xl p-1 border border-[#f0dde2]">
            {[
              { id:"flujo",    label:"Flujo de pagos"       },
              { id:"historial",label:"Historial de comisiones" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition ${
                  tab === t.id ? "bg-white text-[#a0435f] font-semibold shadow-sm border border-[#f0dde2]" : "text-[#9a6672] hover:text-[#2d1a22]"
                }`}>{t.label}</button>
            ))}
          </div>

          <div className="flex-1 flex items-center gap-2 flex-wrap lg:justify-end">
            {/* Filtros */}
            {[
              { label:"Tipo: Todos",    opts:["Todos","Ingreso","Comisión"], val:filtroTipo,   set:setFiltroTipo   },
              { label:"Estado: Todos",  opts:["Todos","Completado","Pendiente","Pagado"], val:filtroEstado, set:setFiltroEstado },
              { label:"Método: Todos",  opts:["Todos","Tarjeta","PayPal","Transferencia","Nequi","Daviplata"], val:filtroMetodo, set:setFiltroMetodo },
            ].map((f, i) => (
              <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
                className="border border-[#f0dde2] rounded-xl px-3 py-2 text-[11px]
                           text-[#2d1a22] bg-white focus:outline-none cursor-pointer">
                {f.opts.map(o => <option key={o} value={o}>{o === "Todos" ? f.label : o}</option>)}
              </select>
            ))}
            {/* Buscar */}
            <div className="relative">
              <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0909a]"/>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por referente, código o transacción..."
                className="pl-9 pr-4 py-2 border border-[#f0dde2] rounded-xl text-[12px] w-64
                           focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] bg-[#fff8f9]"/>
            </div>
            {/* Confirmar pago */}
            <button onClick={() => setModalConfirmar(true)}
              className="flex items-center gap-1.5 bg-[#5a8a3a] hover:bg-[#4a7a2a] text-white
                         text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-md">
              <CheckIcon size={13}/>
              Confirmar pago
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#fce8ed]">
                {["Fecha","Tipo","Descripción","Referencia / Código","Referente / Estudiante","Método","Monto","Estado","Acciones"].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9a6672] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fff0f3]">
              {paginados.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[13px] text-[#9a6672]">
                  No hay movimientos aún.
                </td></tr>
              ) : paginados.map((m, i) => (
                <tr key={i} className="hover:bg-[#fff8f9] transition">
                  {/* Fecha */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-[11px] font-semibold text-[#2d1a22]">{m.fecha?.split(" ")[0]}</p>
                    <p className="text-[10px] text-[#9a6672]">{m.fecha?.split(" ")[1]}</p>
                  </td>
                  {/* Tipo */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      m.tipo === "Ingreso" ? "bg-[#e8f0e0] text-[#5a8a3a]" : "bg-[#fdf3e3] text-[#c9973a]"
                    }`}>{m.tipo}</span>
                  </td>
                  {/* Descripción */}
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] font-semibold text-[#2d1a22]">{m.descripcion}</p>
                    <p className="text-[10px] text-[#9a6672]">{m.subdescripcion}</p>
                  </td>
                  {/* Referencia */}
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold text-[#a0435f]">{m.referencia}</span>
                  </td>
                  {/* Referente/Estudiante */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#fce8ed] flex items-center justify-center shrink-0">
                        <span className="text-[#a0435f] text-[10px] font-bold">{m.inicial}</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#2d1a22]">{m.estudiante}</p>
                        <p className="text-[10px] text-[#9a6672]">{m.emailEstudiante}</p>
                      </div>
                    </div>
                  </td>
                  {/* Método */}
                  <td className="px-4 py-3.5">
                    <p className="text-[11px] text-[#2d1a22]">{m.metodo}</p>
                  </td>
                  {/* Monto */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[12px] font-bold ${
                      m.tipo === "Ingreso" ? "text-[#5a8a3a]" : "text-[#a0435f]"
                    }`}>
                      {m.tipo === "Ingreso" ? "+" : "-"}{m.monto}
                    </span>
                  </td>
                  {/* Estado */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      m.estado === "Completado" ? "bg-[#e8f0e0] text-[#5a8a3a]"
                      : m.estado === "Pagado"   ? "bg-[#e8f0e0] text-[#5a8a3a]"
                      : "bg-[#fdf3e3] text-[#c9973a]"
                    }`}>{m.estado}</span>
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3.5">
                    <button onClick={() => setModalVer(m)}
                      className="w-7 h-7 rounded-lg bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center transition">
                      <EyeIcon size={12} className="text-[#a0435f]"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-5 py-3 border-t border-[#fce8ed] flex items-center justify-between">
          <p className="text-[11px] text-[#9a6672]">
            Mostrando {Math.min((pagina-1)*POR_PAGINA+1, filtrados.length)} a {Math.min(pagina*POR_PAGINA, filtrados.length)} de {filtrados.length} movimientos
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagina(p => Math.max(1, p-1))}
              className="w-7 h-7 rounded-lg text-[11px] text-[#9a6672] hover:bg-[#fce8ed] transition">‹</button>
            {Array.from({ length: Math.min(totalPags, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPagina(p)}
                className={`w-7 h-7 rounded-lg text-[11px] font-medium transition ${
                  p === pagina ? "bg-[#a0435f] text-white" : "text-[#9a6672] hover:bg-[#fce8ed]"
                }`}>{p}</button>
            ))}
            {totalPags > 5 && <span className="text-[#9a6672] text-[11px]">...</span>}
            {totalPags > 5 && (
              <button onClick={() => setPagina(totalPags)}
                className={`w-7 h-7 rounded-lg text-[11px] font-medium transition ${
                  pagina === totalPags ? "bg-[#a0435f] text-white" : "text-[#9a6672] hover:bg-[#fce8ed]"
                }`}>{totalPags}</button>
            )}
            <button onClick={() => setPagina(p => Math.min(totalPags, p+1))}
              className="w-7 h-7 rounded-lg text-[11px] text-[#9a6672] hover:bg-[#fce8ed] transition">›</button>
          </div>
        </div>
      </div>

      {/* ── FILA INFERIOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Resumen ingresos */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-bold text-[#2d1a22]">Resumen de ingresos del programa</h2>
            <select className="border border-[#f0dde2] rounded-xl px-2 py-1 text-[10px] text-[#9a6672] bg-white focus:outline-none">
              <option>Este mes</option>
            </select>
          </div>
          <p className="font-serif font-bold text-[28px] text-[#2d1a22] mb-4">
            ${s.ingresos?.toLocaleString("es-CO") || 0} USD
          </p>
          <GraficaIngresos datos={s.graficaIngresos}/>
          <div className="mt-4 space-y-2 pt-3 border-t border-[#f0dde2]">
            {(s.metodoPagos || []).map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[11px] text-[#2d1a22]">{m.metodo}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#2d1a22]">${m.monto?.toLocaleString("es-CO")} USD</span>
                  <span className="text-[10px] text-[#9a6672]">{m.pct}%</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-[#f0dde2]">
              <span className="text-[11px] font-semibold text-[#2d1a22]">Total transacciones</span>
              <span className="text-[11px] font-bold text-[#2d1a22]">{s.totalTransacciones || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#2d1a22]">Ticket promedio</span>
              <span className="text-[11px] font-bold text-[#2d1a22]">${s.ticketPromedio?.toLocaleString("es-CO") || 0} USD</span>
            </div>
          </div>
        </div>

        {/* Estatus comisiones */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-4">Estatus de comisiones</h2>
          <DonaEstatus
            pendientes={s.pendientes || 0}
            programadas={s.programadas || 0}
            vencidas={s.vencidas || 0}
          />
        </div>

        {/* Top referentes */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-bold text-[#2d1a22]">Top referentes por comisiones generadas</h2>
            <select className="border border-[#f0dde2] rounded-xl px-2 py-1 text-[10px] text-[#9a6672] bg-white focus:outline-none">
              <option>Este mes</option>
            </select>
          </div>
          <div className="space-y-3">
            {(s.topReferentes || []).map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[#9a6672] w-4">{i+1}</span>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-[#2d1a22]">{r.nombre}</p>
                  <p className="text-[10px] font-bold text-[#a0435f]">{r.codigo}</p>
                </div>
                <span className="text-[12px] font-bold text-[#2d1a22]">${r.comision?.toLocaleString("es-CO")} USD</span>
              </div>
            ))}
            {(!s.topReferentes || s.topReferentes.length === 0) && (
              <p className="text-center text-[12px] text-[#9a6672] py-4">Sin datos aún.</p>
            )}
          </div>
          <button className="w-full mt-4 border border-[#f0dde2] text-[#a0435f] text-[12px] font-semibold
                             py-2.5 rounded-xl hover:bg-[#fce8ed] transition">
            Ver todos los referentes →
          </button>
        </div>
      </div>

      {/* MODALES */}
      {modalVer      && <ModalVerPago pago={modalVer} onClose={() => setModalVer(null)}/>}
      {modalConfirmar && <ModalConfirmarPago onClose={() => setModalConfirmar(false)} onConfirm={handleConfirmarPago}/>}
    </div>
  );
}