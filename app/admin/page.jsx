"use client";
// app/admin/page.jsx

import { useEffect, useState, useCallback } from "react";
import {
  UsersIcon, CheckCircleIcon, DollarSignIcon, TrendingUpIcon,
  AlertCircleIcon, UserPlusIcon, CreditCardIcon, ArrowUpIcon,
  EyeIcon, DownloadIcon, MoreVerticalIcon, CalendarIcon,
  ChevronDownIcon, RefreshCwIcon, PlusIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   GRÁFICAS
═══════════════════════════════════════════════════════════════════════════ */
function BarChart({ data }) {
  if (!data?.length) return (
    <div className="flex items-center justify-center h-40 text-[12px] text-[#9a6672]">
      Sin datos suficientes aún
    </div>
  );
  const maxVal = Math.max(...data.flatMap(d => [
    Number(d.ingresos||d.monto||0),
    Number(d.comisionesPagar||0),
    Number(d.comisionesPagadas||0),
  ]), 1);
  return (
    <div className="relative h-40">
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-5">
        {[4,3,2,1,0].map(i => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] text-[#9a6672] w-5 text-right shrink-0">{i===0?"0":`${i*2}K`}</span>
            <div className="flex-1 h-px bg-[#f0dde2]"/>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2 h-full pb-5 pl-7">
        {data.map((d, i) => {
          const bh = (v) => Math.max((Number(v||0) / maxVal) * 110, Number(v||0) > 0 ? 4 : 1);
          const ingr = Number(d.ingresos||d.monto||0);
          const cp   = Number(d.comisionesPagar||ingr*0.2||0);
          const cpg  = Number(d.comisionesPagadas||ingr*0.07||0);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-0.5 w-full justify-center">
                <div className="w-3 xl:w-4 rounded-t-sm bg-gradient-to-t from-[#a0435f] to-[#e8849a]" style={{ height:bh(ingr) }}/>
                <div className="w-3 xl:w-4 rounded-t-sm bg-gradient-to-t from-[#c9973a] to-[#f0c060]"   style={{ height:bh(cp)   }}/>
                <div className="w-3 xl:w-4 rounded-t-sm bg-gradient-to-t from-[#5a8a3a] to-[#90d060]"   style={{ height:bh(cpg)  }}/>
              </div>
              <span className="text-[9px] text-[#9a6672]">{d.mes||d.label||d.semana||""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DonutChart({ totalIngresos=0 }) {
  const r=52, circ=2*Math.PI*r;
  const segs = [
    { pct:0.94, fill:"#a0435f", label:"Programas (inscripciones)", pct_label:"94%" },
    { pct:0.04, fill:"#c9973a", label:"Materiales adicionales",    pct_label:"4%"  },
    { pct:0.02, fill:"#9a6672", label:"Otros",                     pct_label:"2%"  },
  ];
  let off = circ * 0.25;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} fill="none" stroke="#f0dde2" strokeWidth="18"/>
          {segs.map((s, i) => {
            const dash = s.pct * circ;
            const el = <circle key={i} cx="80" cy="80" r={r} fill="none" stroke={s.fill} strokeWidth="18"
              strokeDasharray={`${dash} ${circ}`} strokeDashoffset={-off+circ} strokeLinecap="round"/>;
            off -= dash; return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-serif font-bold text-[15px] text-[#2d1a22] leading-none text-center">
            {totalIngresos > 0 ? `$${Number(totalIngresos).toLocaleString("en")}` : "$0"}
          </span>
          <span className="text-[9px] text-[#9a6672] mt-0.5 text-center">USD{"\n"}Total ingresos</span>
        </div>
      </div>
      <div className="space-y-2 w-full mt-2">
        {segs.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:s.fill }}/>
              <span className="text-[10px] text-[#2d1a22]">{s.label}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-[#2d1a22]">
                ${Math.round(totalIngresos * s.pct).toLocaleString("en")} USD
              </span>
              <span className="text-[10px] text-[#9a6672] ml-1">{s.pct_label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ color="#a0435f", data=[] }) {
  const vals = data.length > 0
    ? data.map(d => Number(d.total||d.monto||d.ingresos||0))
    : [3,8,5,12,7,15,10,18,14];
  const max = Math.max(...vals, 1);
  const pts = vals.map((v,i) => `${i*(90/(vals.length-1||1))},${20-(v/max)*18}`).join(" ");
  return (
    <svg width="90" height="24" viewBox="0 0 90 24" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Modal nuevo referente ────────────────────────────────────────────────── */
function ModalReferente({ onClose, onSave }) {
  const [form, setForm] = useState({ nombre:"", email:"", codigo:"", porcentaje:20 });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const ic = "w-full border border-[#f0dde2] rounded-xl px-3 py-2 text-[13px] text-[#2d1a22] outline-none font-[inherit] focus:border-[#a0435f]";

  const guardar = async () => {
    if (!form.nombre || !form.codigo) return setErr("Nombre y código son obligatorios");
    setSaving(true); setErr("");
    const res = await fetch("/api/admin/referidos", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    const d = await res.json();
    if (!res.ok) setErr(d.error || "Error al guardar");
    else { onSave(); onClose(); }
    setSaving(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(45,26,34,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,.15)", overflow:"hidden" }}>
        <div style={{ height:4, background:"linear-gradient(90deg,#a0435f,#e8849a)" }}/>
        <div style={{ padding:"20px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"#2d1a22", margin:0 }}>Añadir referente</h2>
            <button onClick={onClose} style={{ background:"#fce8ed", border:"none", borderRadius:10, width:30, height:30, cursor:"pointer", fontSize:18, color:"#a0435f", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
          {err && <div style={{ background:"#fce8ed", border:"1px solid #f0b8c4", borderRadius:10, padding:"8px 12px", fontSize:12, color:"#a0435f", marginBottom:12 }}>{err}</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { label:"Nombre *",   name:"nombre",     type:"text",   ph:"Tati Gómez"     },
              { label:"Email",      name:"email",      type:"email",  ph:"tati@gmail.com" },
              { label:"Código *",   name:"codigo",     type:"text",   ph:"TATI2026"       },
              { label:"% Comisión", name:"porcentaje", type:"number", ph:"20"             },
            ].map(f => (
              <label key={f.name} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.6 }}>{f.label}</span>
                <input type={f.type} className={ic} placeholder={f.ph}
                  value={form[f.name]} onChange={e => setForm({...form, [f.name]: e.target.value})}/>
              </label>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button onClick={onClose} style={{ flex:1, padding:"9px", borderRadius:12, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a6672", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
            <button onClick={guardar} disabled={saving||!form.nombre||!form.codigo}
              style={{ flex:2, padding:"9px", borderRadius:12, border:"none", background:(!form.nombre||!form.codigo||saving)?"#f0dde2":"#a0435f", color:(!form.nombre||!form.codigo||saving)?"#c0909a":"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              {saving ? "Guardando…" : <><PlusIcon size={13}/>Añadir referente</>}
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
export default function AdminPage() {
  const [stats,     setStats]     = useState(null);  // /api/admin/stats
  const [pagos,     setPagos]     = useState(null);  // /api/admin/pagos/stats
  const [referidos, setReferidos] = useState({ referidos:[], totales:{} });
  const [loading,   setLoading]   = useState(true);
  const [modalRef,  setModalRef]  = useState(false);
  const [busqueda,  setBusqueda]  = useState("");
  const [pagina,    setPagina]    = useState(1);
  const POR_PAGINA = 5;

  const cargar = useCallback(async () => {
    setLoading(true);
    const safe = (p, fb={}) => p.then(r=>r.json().catch(()=>fb)).catch(()=>fb);
    const [s, pa, ref] = await Promise.all([
      safe(fetch("/api/admin/stats"),          {}),
      safe(fetch("/api/admin/pagos/stats"),    {}),
      safe(fetch("/api/admin/referidos"),      { referidos:[], totales:{} }),
    ]);
    setStats(s);
    setPagos(pa);
    setReferidos(ref);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  /* ── Datos reales ── */
  const s  = stats  || {};
  const pa = pagos  || {};

  // Ingresos desde pagos/stats (tabla referido_registros)
  const ingresos_totales     = Number(pa.ingresos          || 0);
  const comisiones_por_pagar = Number(pa.comisionesPagar   || 0);
  const comisiones_pagadas   = Number(pa.comisionesPagadas || 0);
  const ganancia_neta        = Number(pa.gananciaNeta      || 0);

  // Usuarias desde stats
  const totalUsuarias  = Number(s.totalUsuarias  || 0);
  const conAcceso      = Number(s.conAcceso       || 0);
  const tasaConversion = Number(s.tasaConversion  || 0);

  // Actividad desde stats
  const actividad = (s.actividad || []).map(a => ({
    Icon:   a.tipo_evento === "completado" ? CheckCircleIcon : UserPlusIcon,
    color:  a.tipo_evento === "completado" ? "bg-[#e8f0e0] text-[#5a8a3a]" : "bg-[#fce8ed] text-[#a0435f]",
    titulo: a.tipo_evento === "completado" ? `Sesión completada: ${a.sesion_titulo}` : `Inicio: ${a.sesion_titulo}`,
    desc:   a.nombre,
    tiempo: new Date(a.fecha).toLocaleDateString("es-CO", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }),
  }));

  // Gráfica: usar graficaIngresos de pagos/stats, o registrosPorSemana como fallback
  const graficaData = (() => {
    if (pa.graficaIngresos?.length) {
      return pa.graficaIngresos.map(d => ({
        mes: d.label, ingresos: Number(d.monto||0),
        comisionesPagar: Number(d.monto||0)*0.2, comisionesPagadas: Number(d.monto||0)*0.07,
      }));
    }
    if (s.registrosPorSemana?.length) {
      return s.registrosPorSemana.map(d => ({
        mes: d.semana, ingresos: Number(d.total||0)*300,
        comisionesPagar: Number(d.total||0)*60, comisionesPagadas: Number(d.total||0)*20,
      }));
    }
    return ["Ene","Feb","Mar","Abr","May"].map(mes => ({ mes, ingresos:0, comisionesPagar:0, comisionesPagadas:0 }));
  })();

  /* ── Referentes filtrados y paginados ── */
  const refFiltrados = (referidos.referidos || []).filter(r =>
    !busqueda || `${r.nombre} ${r.email} ${r.codigo}`.toLowerCase().includes(busqueda.toLowerCase())
  );
  const totalPaginas = Math.max(Math.ceil(refFiltrados.length / POR_PAGINA), 1);
  const refPagina    = refFiltrados.slice((pagina-1)*POR_PAGINA, pagina*POR_PAGINA);
  const tot          = referidos.totales || {};

  const fmtUSD = (n) => Number(n||0) > 0 ? `$${Number(n).toLocaleString("en")} USD` : "$0 USD";

  if (loading && !stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="p-5 xl:p-7 bg-[#fff8f9] min-h-full space-y-5">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {modalRef && <ModalReferente onClose={() => setModalRef(false)} onSave={cargar}/>}

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-[#2d1a22] text-[26px] xl:text-[28px] leading-tight">
            ¡Bienvenida, Jenni! 👋
          </h1>
          <p className="text-[13px] text-[#9a6672] mt-0.5">
            Aquí tienes el resumen general de tu actividad en{" "}
            <span className="text-[#a0435f] font-semibold">Destino Au Pair</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#f0dde2] rounded-xl px-3 py-2 text-[12px] text-[#2d1a22] shadow-sm cursor-pointer hover:border-[#e8849a] transition">
            <CalendarIcon size={13} className="text-[#a0435f]"/>
            Rango de fechas
            <ChevronDownIcon size={12} className="text-[#9a6672]"/>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#f0dde2] rounded-xl px-3 py-2 text-[12px] text-[#2d1a22] shadow-sm cursor-pointer hover:border-[#e8849a] transition">
            Comparar con: mes anterior
            <ChevronDownIcon size={12} className="text-[#9a6672]"/>
          </div>
          <button onClick={cargar} disabled={loading}
            className="flex items-center gap-2 bg-white border border-[#f0dde2] text-[#9a6672] text-[12px] font-semibold px-3 py-2 rounded-xl hover:border-[#e8849a] transition">
            <RefreshCwIcon size={13} style={{ animation:loading?"spin 1s linear infinite":"none" }}/>
          </button>
          <button className="flex items-center gap-2 bg-[#fce8ed] border border-[#f0b8c4] text-[#a0435f] text-[12px] font-semibold px-4 py-2 rounded-xl hover:bg-[#f0b8c4] transition">
            <DownloadIcon size={13}/> Exportar reporte
          </button>
        </div>
      </div>

      {/* ── CARDS INGRESOS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Ingresos totales",     val:fmtUSD(ingresos_totales),     Icon:DollarSignIcon, bg:"bg-[#fce8ed]", ic:"text-[#a0435f]", sc:"#a0435f" },
          { label:"Comisiones por pagar", val:fmtUSD(comisiones_por_pagar), Icon:CreditCardIcon, bg:"bg-[#fdf3e3]", ic:"text-[#c9973a]", sc:"#c9973a" },
          { label:"Comisiones pagadas",   val:fmtUSD(comisiones_pagadas),   Icon:CheckCircleIcon,bg:"bg-[#e8f0e0]", ic:"text-[#5a8a3a]", sc:"#5a8a3a" },
          { label:"Ganancia neta",        val:fmtUSD(ganancia_neta),        Icon:TrendingUpIcon,  bg:"bg-[#e8f0ff]", ic:"text-[#2a4a7f]", sc:"#2a4a7f" },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-[#f0dde2] rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
                <c.Icon size={16} className={c.ic}/>
              </div>
              <Sparkline color={c.sc} data={s.registrosPorSemana||[]}/>
            </div>
            <p className="text-[11px] text-[#9a6672] mb-1">{c.label}</p>
            <p className="font-serif font-bold text-[20px] xl:text-[22px] text-[#2d1a22] leading-none mb-2">{c.val}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#9a6672]">Este mes</span>
              <span className="text-[10px] font-bold text-[#5a8a3a] flex items-center gap-0.5">
                <ArrowUpIcon size={9}/>desde cero
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── MINI STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label:"Total referidos registrados", val:totalUsuarias,              sc:"#a0435f" },
          { label:"Referidos que pagaron",        val:conAcceso,                  sc:"#5a8a3a" },
          { label:"Nuevas inscripciones",         val:totalUsuarias,              sc:"#2a4a7f" },
          { label:"Tasa de conversión a pago",    val:`${tasaConversion}%`,       sc:"#c9973a" },
          { label:"Pagos recibidos",              val:Number(pa.totalTransacciones||0), sc:"#a0435f" },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-[#f0dde2] rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-[10px] text-[#9a6672] leading-snug mb-1">{m.label}</p>
            <p className="font-serif font-bold text-[24px] text-[#2d1a22] leading-none">{m.val}</p>
            <Sparkline color={m.sc} data={s.registrosPorSemana||[]}/>
          </div>
        ))}
      </div>

      {/* ── TABLA REFERIDOS ── */}
      <div className="bg-white border border-[#f0dde2] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#fce8ed] flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <UserPlusIcon size={15} className="text-[#a0435f]"/>
              <h2 className="text-[14px] font-bold text-[#2d1a22]">Referidos y comisiones</h2>
            </div>
            <p className="text-[11px] text-[#9a6672]">
              Códigos usados, personas referidas y comisiones generadas en tiempo real.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input placeholder="Buscar referente o código..."
              value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              className="border border-[#f0dde2] rounded-xl px-3 py-2 text-[12px] w-52 focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a]"/>
            <button onClick={() => setModalRef(true)}
              className="flex items-center gap-1.5 bg-[#a0435f] hover:bg-[#8a3550] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-md">
              + Añadir referente
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#fce8ed]">
                {["Referente","Código usado","Registradas","Pagaron","Ingresos generados","Comisión generada","Comisión pagada","Pendiente por pagar","Estado","Acciones"].map((h,i) => (
                  <th key={i} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9a6672] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fff0f3]">
              {refPagina.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-[13px] text-[#9a6672]">
                    {referidos.referidos?.length === 0
                      ? "No hay referentes aún. Agrega el primero con el botón de arriba."
                      : "Sin resultados para esa búsqueda."
                    }
                  </td>
                </tr>
              ) : refPagina.map((r, i) => {
                const comision_total  = Number(r.comision_generada || 0);
                const comision_pagada = Number(r.comision_pagada   || 0);
                const pendiente       = Math.max(comision_total - comision_pagada, 0);
                const ingresos        = Number(r.ingresos_generados || 0);

                return (
                  <tr key={r.id} className="hover:bg-[#fff8f9] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0">
                          <span className="text-[#a0435f] text-[12px] font-bold">{(r.nombre||"?")[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-[#2d1a22]">{r.nombre}</p>
                          <p className="text-[10px] text-[#9a6672]">{r.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-bold text-[#a0435f]">{r.codigo}</span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#2d1a22] font-medium">{r.registradas || 0}</td>
                    <td className="px-4 py-3 text-[12px] text-[#5a8a3a] font-bold">{r.pagaron || 0}</td>
                    <td className="px-4 py-3 text-[12px] text-[#2d1a22]">{fmtUSD(ingresos)}</td>
                    <td className="px-4 py-3 text-[12px] text-[#2d1a22]">{fmtUSD(comision_total)}</td>
                    <td className="px-4 py-3 text-[12px] text-[#2d1a22]">{fmtUSD(comision_pagada)}</td>
                    <td className="px-4 py-3 text-[12px] font-bold text-[#c9973a]">{fmtUSD(pendiente)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        r.estado === "Pagado"
                          ? "bg-[#e8f0e0] text-[#5a8a3a]"
                          : "bg-[#fdf3e3] text-[#c9973a]"
                      }`}>
                        {r.estado === "Pagado" ? "✓ Pagado" : "⏱ Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Marcar como pagado */}
                        {r.estado !== "Pagado" && (
                          <button
                            onClick={async () => {
                              await fetch(`/api/admin/referidos/${r.id}/pagar`, { method:"POST" });
                              cargar();
                            }}
                            className="w-7 h-7 rounded-lg bg-[#e8f0e0] flex items-center justify-center hover:bg-[#c8e0c0] transition"
                            title="Marcar como pagado">
                            <CheckCircleIcon size={12} className="text-[#5a8a3a]"/>
                          </button>
                        )}
                        <button className="w-7 h-7 rounded-lg bg-[#fce8ed] flex items-center justify-center hover:bg-[#f0b8c4] transition">
                          <EyeIcon size={12} className="text-[#a0435f]"/>
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-[#fce8ed] flex items-center justify-center hover:bg-[#f0b8c4] transition">
                          <MoreVerticalIcon size={12} className="text-[#a0435f]"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {referidos.referidos?.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#f0dde2] bg-[#fff8f9]">
                  <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]" colSpan={2}>Totales (este mes)</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">{Number(tot.total_registradas||0)}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#5a8a3a]">{Number(tot.total_pagaron||0)}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">{fmtUSD(tot.total_ingresos)}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">{fmtUSD(tot.total_comision)}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">{fmtUSD(tot.total_pagada)}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#c9973a]">
                    {fmtUSD(Math.max(Number(tot.total_comision||0) - Number(tot.total_pagada||0), 0))}
                  </td>
                  <td colSpan={2}/>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Paginación */}
        <div className="px-5 py-3 border-t border-[#fce8ed] flex items-center justify-between">
          <p className="text-[11px] text-[#9a6672]">
            Mostrando {refFiltrados.length === 0 ? 0 : (pagina-1)*POR_PAGINA+1} a {Math.min(pagina*POR_PAGINA, refFiltrados.length)} de {refFiltrados.length} referentes
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagina(p=>Math.max(1,p-1))} disabled={pagina===1}
              className="w-7 h-7 rounded-lg text-[11px] text-[#9a6672] hover:bg-[#fce8ed] disabled:opacity-40 transition">‹</button>
            {Array.from({length:totalPaginas},(_,i)=>i+1).map(p => (
              <button key={p} onClick={() => setPagina(p)}
                className={`w-7 h-7 rounded-lg text-[11px] font-medium transition ${p===pagina?"bg-[#a0435f] text-white":"text-[#9a6672] hover:bg-[#fce8ed]"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPagina(p=>Math.min(totalPaginas,p+1))} disabled={pagina>=totalPaginas}
              className="w-7 h-7 rounded-lg text-[11px] text-[#9a6672] hover:bg-[#fce8ed] disabled:opacity-40 transition">›</button>
          </div>
        </div>
      </div>

      {/* ── GRÁFICAS + ACTIVIDAD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-1">Ingresos vs comisiones</h2>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {[["bg-[#a0435f]","Ingresos"],["bg-[#c9973a]","Comisiones por pagar"],["bg-[#5a8a3a]","Comisiones pagadas"]].map(([c,l],i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${c}`}/><span className="text-[9px] text-[#9a6672]">{l}</span>
              </div>
            ))}
          </div>
          <BarChart data={graficaData}/>
        </div>

        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-4">Distribución de ingresos</h2>
          <DonutChart totalIngresos={ingresos_totales}/>
        </div>

        <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#fce8ed] flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-[#2d1a22]">Actividad reciente</h2>
            <a href="/admin/usuarias" className="text-[11px] text-[#a0435f] font-semibold hover:underline">Ver todas</a>
          </div>
          <div className="divide-y divide-[#fff0f3] px-4">
            {(actividad.length > 0 ? actividad : [{
              Icon: UserPlusIcon, color:"bg-[#fce8ed] text-[#a0435f]",
              titulo:"Sin actividad reciente",
              desc:"Las acciones aparecerán aquí", tiempo:"—",
            }]).slice(0,4).map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-3.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
                  <a.Icon size={14} strokeWidth={1.5}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#2d1a22] leading-snug">{a.titulo}</p>
                  <p className="text-[11px] text-[#9a6672] mt-0.5 leading-snug">{a.desc}</p>
                </div>
                <span className="text-[9px] text-[#9a6672] shrink-0 whitespace-nowrap ml-2">{a.tiempo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ALERTA SIN PROGRESO ── */}
      {Number(s.sinProgreso||0) > 0 && (
        <div className="bg-[#fdf3e3] border border-[#f0d090] rounded-2xl p-4 flex items-center gap-3">
          <AlertCircleIcon size={18} className="text-[#c9973a] shrink-0"/>
          <p className="text-[13px] text-[#7a6030]">
            <strong>{s.sinProgreso} usuaria{s.sinProgreso>1?"s":""}</strong>{" "}
            {s.sinProgreso>1?"se registraron":"se registró"} pero nunca {s.sinProgreso>1?"iniciaron":"inició"} el curso.
          </p>
          <a href="/admin/mensajes" className="ml-auto text-[12px] font-semibold text-[#c9973a] hover:underline whitespace-nowrap">
            Enviar mensaje →
          </a>
        </div>
      )}
    </div>
  );
}