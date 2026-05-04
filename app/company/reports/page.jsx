"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, FolderOpen, CheckCircle2, Clock, BarChart3 } from "lucide-react";

const ID_EMPRESA = 1;

export default function ReportsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/app/reports?id_empresa=${ID_EMPRESA}`)
      .then(r=>r.json()).catch(()=>null)
      .then(d=>{ setData(d); setLoading(false); });
  }, []);

  const projects = data?.projects || [];
  const maxBudget = Math.max(...projects.map(p=>Number(p.presupuesto||0)), 1);

  const summaryCards = [
    { label:"Total Budget",    value: data?.totalBudget    ? `$${Number(data.totalBudget).toLocaleString()}`  : "—", icon:DollarSign,   color:"text-emerald-600 bg-emerald-50" },
    { label:"Spent",           value: data?.totalSpent     ? `$${Number(data.totalSpent).toLocaleString()}`   : "—", icon:TrendingUp,   color:"text-red-500 bg-red-50" },
    { label:"Active Projects", value: data?.activeCount    ?? "—",                                             icon:FolderOpen,   color:"text-cyan-600 bg-cyan-50" },
    { label:"Completed",       value: data?.completedCount ?? "—",                                             icon:CheckCircle2, color:"text-violet-600 bg-violet-50" },
  ];

  const STATUS_COLORS = {
    activo:     "bg-emerald-500",
    completado: "bg-cyan-500",
    suspendido: "bg-amber-400",
    cancelado:  "bg-red-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Reports</h2>
        <p className="text-slate-500 text-sm mt-0.5">Budget and project performance overview</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <Icon size={18}/>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{loading?"…":s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Budget by project bar chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 text-sm mb-5 flex items-center gap-2">
            <BarChart3 size={16} className="text-cyan-600"/> Budget by Project
          </h3>
          {loading && <p className="text-slate-400 text-sm py-8 text-center">Loading...</p>}
          {!loading && projects.length === 0 && <p className="text-slate-400 text-sm py-8 text-center">No data available</p>}
          <div className="space-y-3">
            {projects.slice(0,8).map(p => {
              const pct = Math.round((Number(p.presupuesto||0)/maxBudget)*100);
              return (
                <div key={p.id_proyecto}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 truncate max-w-[160px] font-medium">{p.nombre}</span>
                    <span className="text-slate-500">{p.presupuesto?`$${Number(p.presupuesto).toLocaleString()}`:"—"}</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2 w-full">
                    <div className={`h-2 rounded-full transition-all ${STATUS_COLORS[p.estado]||"bg-slate-300"}`} style={{width:`${pct}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(STATUS_COLORS).map(([k,c])=>(
              <div key={k} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className={`w-2.5 h-2.5 rounded-full ${c}`}/>
                {k.charAt(0).toUpperCase()+k.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Progress table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Project Progress</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {loading && <p className="text-slate-400 text-sm py-8 text-center">Loading...</p>}
            {!loading && projects.length === 0 && <p className="text-slate-400 text-sm py-8 text-center">No projects</p>}
            {projects.map(p=>(
              <div key={p.id_proyecto} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.nombre}</p>
                  <p className="text-xs text-slate-400">{p.fecha_inicio?new Date(p.fecha_inicio).toLocaleDateString():"—"} → {p.fecha_fin?new Date(p.fecha_fin).toLocaleDateString():"—"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-slate-800">{p.progreso_porcentaje||0}%</p>
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1">
                    <div className={`h-1.5 rounded-full ${STATUS_COLORS[p.estado]||"bg-slate-300"}`} style={{width:`${p.progreso_porcentaje||0}%`}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock size={15} className="text-slate-500"/>
          <h3 className="font-semibold text-slate-800 text-sm">Project Timeline</h3>
        </div>
        <div className="p-5 overflow-x-auto">
          <div className="min-w-[600px] space-y-3">
            {loading && <p className="text-slate-400 text-sm py-4 text-center">Loading...</p>}
            {projects.filter(p=>p.fecha_inicio&&p.fecha_fin).map(p=>{
              const start = new Date(p.fecha_inicio).getTime();
              const end   = new Date(p.fecha_fin).getTime();
              const now   = Date.now();
              const total = end - start || 1;
              const elapsed = Math.min(Math.max(now - start, 0), total);
              const left  = Math.round(((start - Date.now()+ 365*24*3600000*0) / (365*24*3600000)) * 0) + 0;
              const width = Math.round((total / (1000*3600*24*365)) * 20);
              const progress = Math.round((elapsed/total)*100);
              return (
                <div key={p.id_proyecto} className="flex items-center gap-4">
                  <p className="text-xs text-slate-600 w-36 truncate shrink-0">{p.nombre}</p>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden">
                    <div className={`h-full rounded-full flex items-center justify-end pr-2 ${STATUS_COLORS[p.estado]||"bg-slate-300"}`}
                      style={{width:`${Math.max(progress,4)}%`, opacity:0.85}}>
                      <span className="text-[9px] text-white font-bold">{progress}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 w-20 text-right shrink-0">{new Date(p.fecha_fin).toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}