"use client";

import { useEffect, useState } from "react";
import {
  UsersIcon, CheckCircleIcon, DollarSignIcon, TrendingUpIcon,
  AlertCircleIcon, UserPlusIcon, CreditCardIcon, ArrowUpIcon,
  EyeIcon, DownloadIcon, MoreVerticalIcon, CalendarIcon, ChevronDownIcon,
} from "lucide-react";

/* ── Gráfica de barras delgadas agrupadas ── */
function BarChart({ data }) {
  if (!data?.length) return (
    <div className="flex items-center justify-center h-40 text-[12px] text-[#9a6672]">
      No hay datos suficientes aún
    </div>
  );
  const maxVal = Math.max(...data.flatMap(d => [d.ingresos||0, d.comisionesPagar||0, d.comisionesPagadas||0]), 1);

  return (
    <div className="relative h-40">
      {/* Líneas horizontales de fondo */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-5">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="w-full h-px bg-[#f0dde2]"/>
        ))}
      </div>

      {/* Barras */}
      <div className="flex items-end gap-3 h-full pb-5">
        {data.map((d, i) => {
          const barH = (v) => Math.max((v / maxVal) * 110, v > 0 ? 4 : 1);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {/* Grupo de 3 barras */}
              <div className="flex items-end gap-0.5 w-full justify-center">
                <div className="w-2.5 xl:w-3 rounded-t-sm bg-gradient-to-t from-[#a0435f] to-[#e8849a]"
                     style={{ height: barH(d.ingresos || 0) }}/>
                {d.comisionesPagar !== undefined && (
                  <div className="w-2.5 xl:w-3 rounded-t-sm bg-gradient-to-t from-[#c9973a] to-[#f0c060]"
                       style={{ height: barH(d.comisionesPagar || 0) }}/>
                )}
                {d.comisionesPagadas !== undefined && (
                  <div className="w-2.5 xl:w-3 rounded-t-sm bg-gradient-to-t from-[#5a8a3a] to-[#90d060]"
                       style={{ height: barH(d.comisionesPagadas || 0) }}/>
                )}
              </div>
              <span className="text-[9px] text-[#9a6672]">{d.mes || d.semana}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Dona ── */
function DonutChart({ pagadas, total }) {
  const pct  = total > 0 ? pagadas / total : 0;
  const r    = 52;
  const circ = 2 * Math.PI * r;
  const pctMateriales = 0.04;
  const pctOtros = 0.02;
  const pctProgramas = 1 - pctMateriales - pctOtros;

  const totalIngresos = 15450;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="dg1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a0435f"/>
              <stop offset="100%" stopColor="#e8849a"/>
            </linearGradient>
          </defs>
          {/* Fondo */}
          <circle cx="80" cy="80" r={r} fill="none" stroke="#f0dde2" strokeWidth="18"/>
          {/* Programas */}
          <circle cx="80" cy="80" r={r} fill="none" stroke="url(#dg1)" strokeWidth="18"
            strokeDasharray={`${pctProgramas * circ} ${circ}`}
            strokeDashoffset={`${circ * 0.25}`} strokeLinecap="round"/>
          {/* Materiales */}
          <circle cx="80" cy="80" r={r} fill="none" stroke="#c9973a" strokeWidth="18"
            strokeDasharray={`${pctMateriales * circ} ${circ}`}
            strokeDashoffset={`${circ * 0.25 - pctProgramas * circ}`} strokeLinecap="round"/>
          {/* Otros */}
          <circle cx="80" cy="80" r={r} fill="none" stroke="#9a6672" strokeWidth="18"
            strokeDasharray={`${pctOtros * circ} ${circ}`}
            strokeDashoffset={`${circ * 0.25 - (pctProgramas + pctMateriales) * circ}`} strokeLinecap="round"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif font-bold text-[22px] text-[#2d1a22] leading-none">
            ${totalIngresos.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#9a6672] mt-0.5">USD total ingresos</span>
        </div>
      </div>
      <div className="space-y-2 w-full mt-3">
        {[
          { color: "bg-gradient-to-r from-[#a0435f] to-[#e8849a]", label: "Programas (inscripciones)", val: "$14,600 USD", pct: "94%" },
          { color: "bg-[#c9973a]", label: "Materiales adicionales", val: "$650 USD", pct: "4%" },
          { color: "bg-[#9a6672]", label: "Otros", val: "$200 USD", pct: "2%" },
        ].map((l, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color} shrink-0`}/>
              <span className="text-[11px] text-[#2d1a22]">{l.label}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-[#2d1a22]">{l.val}</span>
              <span className="text-[10px] text-[#9a6672] ml-1">{l.pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mini sparkline SVG ── */
function Sparkline({ color = "#a0435f" }) {
  const pts = [3,8,5,12,7,15,10,18,14].map((v, i) => `${i * 12},${20 - v}`).join(" ");
  return (
    <svg width="90" height="24" viewBox="0 0 96 24" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const referidos = [
  { inicial: "T", nombre: "Tati Gómez",    email: "tati.gomez@gmail.com",  codigo: "TATI2026",   registradas: 18, pagaron: 12, ingresos: "$3,600 USD", comision: "$720 USD", pagada: "$0 USD",   pendiente: "$720 USD",  estado: "Pendiente" },
  { inicial: "S", nombre: "Sofia R.",       email: "sofiar@gmail.com",       codigo: "SOFIA2026",  registradas: 7,  pagaron: 4,  ingresos: "$1,200 USD", comision: "$240 USD", pagada: "$0 USD",   pendiente: "$240 USD",  estado: "Pendiente" },
  { inicial: "M", nombre: "Mariana P.",     email: "mariana.p@gmail.com",    codigo: "MARIANA2026",registradas: 3,  pagaron: 1,  ingresos: "$450 USD",   comision: "$90 USD",  pagada: "$90 USD",  pendiente: "$0 USD",    estado: "Pagado"    },
  { inicial: "L", nombre: "Laura C.",       email: "laura.c@gmail.com",      codigo: "LAURA2026",  registradas: 10, pagaron: 5,  ingresos: "$1,500 USD", comision: "$300 USD", pagada: "$0 USD",   pendiente: "$300 USD",  estado: "Pendiente" },
  { inicial: "V", nombre: "Valentina S.",   email: "vales@gmail.com",        codigo: "VALE2026",   registradas: 5,  pagaron: 2,  ingresos: "$700 USD",   comision: "$140 USD", pagada: "$140 USD", pendiente: "$0 USD",    estado: "Pagado"    },
];

const actividadReciente = [
  { icon: UserPlusIcon,  color: "bg-[#fce8ed] text-[#a0435f]", titulo: "Nueva inscripción con código TATI2026", desc: "Maria Fernanda Ortiz se registró",              tiempo: "Hoy, 10:24 a.m." },
  { icon: CreditCardIcon,color: "bg-[#e8f0e0] text-[#5a8a3a]", titulo: "Pago recibido",                          desc: "Isabella Martínez realizó el pago del programa", tiempo: "Ayer, 4:15 p.m." },
  { icon: CheckCircleIcon,color: "bg-[#fdf3e3] text-[#c9973a]",titulo: "Comisión generada",                      desc: "Se generó comisión de $90 USD para Mariana P.",  tiempo: "Ayer, 1:08 p.m." },
  { icon: DollarSignIcon, color: "bg-[#fce8ed] text-[#a0435f]", titulo: "Pago de comisión",                      desc: "Se marcó como pagada la comisión de Valentina S.",tiempo: "28 may, 11:30 a.m." },
];

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const s = stats || {};

  return (
    <div className="p-6 xl:p-8 bg-[#fff8f9] min-h-full space-y-6">

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
          {/* Rango fechas */}
          <div className="flex items-center gap-2 bg-white border border-[#f0dde2] rounded-xl px-3 py-2 text-[12px] text-[#2d1a22] shadow-sm cursor-pointer hover:border-[#e8849a] transition">
            <CalendarIcon size={13} className="text-[#a0435f]"/>
            01 – 31 de mayo, 2024
            <ChevronDownIcon size={12} className="text-[#9a6672]"/>
          </div>
          {/* Comparar */}
          <div className="flex items-center gap-2 bg-white border border-[#f0dde2] rounded-xl px-3 py-2 text-[12px] text-[#2d1a22] shadow-sm cursor-pointer hover:border-[#e8849a] transition">
            Comparar con: Abril 2024
            <ChevronDownIcon size={12} className="text-[#9a6672]"/>
          </div>
          {/* Exportar */}
          <button className="flex items-center gap-2 bg-[#fce8ed] border border-[#f0b8c4] text-[#a0435f]
                             text-[12px] font-semibold px-4 py-2 rounded-xl hover:bg-[#f0b8c4] transition">
            <DownloadIcon size={13}/>
            Exportar reporte
          </button>
        </div>
      </div>

      {/* ── CARDS INGRESOS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos totales",   val: "$15,450 USD", change: "+24%", vs: "vs abril", color: "text-[#5a8a3a]" },
          { label: "Comisiones por pagar", val: "$3,420 USD", change: "+12%", vs: "vs abril", color: "text-[#5a8a3a]" },
          { label: "Comisiones pagadas", val: "$2,560 USD", change: "+18%", vs: "vs abril", color: "text-[#5a8a3a]" },
          { label: "Ganancia neta",      val: "$9,470 USD", change: "+28%", vs: "vs abril", color: "text-[#5a8a3a]" },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-[#f0dde2] rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                i === 0 ? "bg-[#fce8ed]" : i === 1 ? "bg-[#fdf3e3]" : i === 2 ? "bg-[#e8f0e0]" : "bg-[#e8f0ff]"
              }`}>
                {i === 0 && <DollarSignIcon size={16} className="text-[#a0435f]"/>}
                {i === 1 && <CreditCardIcon size={16} className="text-[#c9973a]"/>}
                {i === 2 && <CheckCircleIcon size={16} className="text-[#5a8a3a]"/>}
                {i === 3 && <TrendingUpIcon size={16} className="text-[#2a4a7f]"/>}
              </div>
              <Sparkline color={i === 0 ? "#a0435f" : i === 1 ? "#c9973a" : i === 2 ? "#5a8a3a" : "#2a4a7f"}/>
            </div>
            <p className="text-[11px] text-[#9a6672] mb-1">{c.label}</p>
            <p className="font-serif font-bold text-[20px] xl:text-[22px] text-[#2d1a22] leading-none mb-2">{c.val}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#9a6672]">Este mes</span>
              <span className={`text-[10px] font-bold ${c.color} flex items-center gap-0.5`}>
                <ArrowUpIcon size={9}/>{c.change}
              </span>
              <span className="text-[10px] text-[#9a6672]">{c.vs}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── MINI STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total referidos registrados", val: s.totalUsuarias || 58, change: "+18%", color: "text-[#a0435f]" },
          { label: "Referidos que pagaron",        val: s.conAcceso     || 24, change: "+26%", color: "text-[#5a8a3a]" },
          { label: "Nuevas inscripciones",         val: 34,                   change: "+22%", color: "text-[#2a4a7f]" },
          { label: "Tasa de conversión a pago",    val: `${s.tasaConversion || 41}%`, change: "+6%", color: "text-[#c9973a]" },
          { label: "Pagos recibidos",              val: 26,                   change: "+30%", color: "text-[#a0435f]" },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-[#f0dde2] rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-[10px] text-[#9a6672] leading-snug mb-1">{m.label}</p>
            <p className="font-serif font-bold text-[24px] text-[#2d1a22] leading-none">{m.val}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-[#9a6672]">Este mes</span>
              <span className={`text-[10px] font-bold ${m.color} flex items-center gap-0.5`}>
                <ArrowUpIcon size={8}/>{m.change}
              </span>
            </div>
            <Sparkline color={["#a0435f","#5a8a3a","#2a4a7f","#c9973a","#a0435f"][i]}/>
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
              Consulta qué códigos fueron usados, cuántas personas llegaron por cada referente y cuánto corresponde pagar.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input placeholder="Buscar referente o código..."
                   className="border border-[#f0dde2] rounded-xl px-3 py-2 text-[12px] w-52
                              focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a]"/>
            {["Todos los referentes","Todos los códigos","Todos los estados"].map((p, i) => (
              <select key={i} className="border border-[#f0dde2] rounded-xl px-3 py-2 text-[11px]
                                         text-[#2d1a22] focus:outline-none cursor-pointer bg-white">
                <option>{p}</option>
              </select>
            ))}
            <button className="flex items-center gap-1.5 bg-[#a0435f] hover:bg-[#8a3550] text-white
                               text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-md">
              + Añadir referente
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#fce8ed]">
                {["Referente","Código usado","Registradas ⓘ","Pagaron ⓘ","Ingresos generados","Comisión generada ⓘ","Comisión pagada","Pendiente por pagar","Estado ⓘ","Acciones"].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9a6672] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fff0f3]">
              {referidos.map((r, i) => (
                <tr key={i} className="hover:bg-[#fff8f9] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4]
                                      flex items-center justify-center shrink-0">
                        <span className="text-[#a0435f] text-[12px] font-bold">{r.inicial}</span>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#2d1a22]">{r.nombre}</p>
                        <p className="text-[10px] text-[#9a6672]">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-[#a0435f]">{r.codigo}</span>
                      <button className="text-[#c0a0a8] hover:text-[#a0435f] transition text-[10px]">⧉</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#2d1a22] font-medium">{r.registradas}</td>
                  <td className="px-4 py-3 text-[12px] text-[#5a8a3a] font-bold">{r.pagaron}</td>
                  <td className="px-4 py-3 text-[12px] text-[#2d1a22]">{r.ingresos}</td>
                  <td className="px-4 py-3 text-[12px] text-[#2d1a22]">{r.comision}</td>
                  <td className="px-4 py-3 text-[12px] text-[#2d1a22]">{r.pagada}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#c9973a]">{r.pendiente}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      r.estado === "Pagado"
                        ? "bg-[#e8f0e0] text-[#5a8a3a]"
                        : "bg-[#fdf3e3] text-[#c9973a]"
                    }`}>
                      {r.estado === "Pendiente" ? "⏱ Pendiente" : "✓ Pagado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 rounded-lg bg-[#fce8ed] flex items-center justify-center
                                         hover:bg-[#f0b8c4] transition">
                        <EyeIcon size={12} className="text-[#a0435f]"/>
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-[#fce8ed] flex items-center justify-center
                                         hover:bg-[#f0b8c4] transition">
                        <MoreVerticalIcon size={12} className="text-[#a0435f]"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#f0dde2] bg-[#fff8f9]">
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]" colSpan={2}>Totales (este mes)</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">58</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#5a8a3a]">24</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">$7,450 USD</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">$1,490 USD</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">$230 USD</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#c9973a]">$1,260 USD</td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-5 py-3 border-t border-[#fce8ed] flex items-center justify-between">
          <p className="text-[11px] text-[#9a6672]">Mostrando 1 a 5 de 12 referentes</p>
          <div className="flex items-center gap-1">
            {["‹","1","2","3","›"].map((p, i) => (
              <button key={i} className={`w-7 h-7 rounded-lg text-[11px] font-medium transition ${
                p === "1" ? "bg-[#a0435f] text-white" : "text-[#9a6672] hover:bg-[#fce8ed]"
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILA INFERIOR: Gráficas + Actividad ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Ingresos vs comisiones */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-1">Ingresos vs comisiones</h2>
          <div className="flex items-center gap-4 mb-4">
            {[
              { color: "bg-[#a0435f]", label: "Ingresos" },
              { color: "bg-[#c9973a]", label: "Comisiones por pagar" },
              { color: "bg-[#5a8a3a]", label: "Comisiones pagadas" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`}/>
                <span className="text-[9px] text-[#9a6672]">{l.label}</span>
              </div>
            ))}
          </div>
          <BarChart data={
            stats?.registrosPorSemana?.map(d => ({
              ...d, ingresos: d.total * 300, comisionesPagar: d.total * 60, comisionesPagadas: d.total * 20,
              mes: d.semana
            })) || [
              {mes:"Ene",ingresos:2000,comisionesPagar:800,comisionesPagadas:400},
              {mes:"Feb",ingresos:3500,comisionesPagar:1000,comisionesPagadas:600},
              {mes:"Mar",ingresos:6000,comisionesPagar:1800,comisionesPagadas:900},
              {mes:"Abr",ingresos:4500,comisionesPagar:1200,comisionesPagadas:700},
              {mes:"May",ingresos:7000,comisionesPagar:2000,comisionesPagadas:1000},
            ]
          }/>
          {/* Eje Y labels */}
          <div className="flex justify-between mt-1">
            {["0","2K","4K","6K","8K"].map((l,i) => (
              <span key={i} className="text-[9px] text-[#9a6672]">{l}</span>
            ))}
          </div>
        </div>

        {/* Distribución ingresos */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-4">Distribución de ingresos</h2>
          <DonutChart pagadas={s.conAcceso || 24} total={s.totalUsuarias || 58}/>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#fce8ed] flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-[#2d1a22]">Actividad reciente</h2>
            <a href="/admin/reportes" className="text-[11px] text-[#a0435f] font-semibold hover:underline">
              Ver todas
            </a>
          </div>
          <div className="divide-y divide-[#fff0f3] px-4">
            {actividadReciente.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3 py-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
                    <Icon size={14} strokeWidth={1.5}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#2d1a22] leading-snug">{a.titulo}</p>
                    <p className="text-[11px] text-[#9a6672] mt-0.5 leading-snug">{a.desc}</p>
                  </div>
                  <span className="text-[9px] text-[#9a6672] shrink-0 whitespace-nowrap ml-2">{a.tiempo}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerta sin actividad */}
      {(s.sinProgreso > 0) && (
        <div className="bg-[#fdf3e3] border border-[#f0d090] rounded-2xl p-4 flex items-center gap-3">
          <AlertCircleIcon size={18} className="text-[#c9973a] shrink-0"/>
          <p className="text-[13px] text-[#7a6030]">
            <strong>{s.sinProgreso} usuaria{s.sinProgreso > 1 ? "s" : ""}</strong> se registró pero nunca completó una sesión.
            Considera enviarles un mensaje de seguimiento.
          </p>
        </div>
      )}
    </div>
  );
}