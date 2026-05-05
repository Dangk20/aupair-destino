"use client";

import { useEffect, useState } from "react";
import { UsersIcon, VideoIcon, CheckCircleIcon, DollarSignIcon, TrendingUpIcon, AlertCircleIcon } from "lucide-react";

// Gráfica de barras simple con CSS
function BarChart({ data, maxVal }) {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-32 text-[12px] text-[#9a6672]">
      No hay datos suficientes aún
    </div>
  );
  const max = maxVal || Math.max(...data.map(d => d.total), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-[#a0435f] font-semibold">{d.total > 0 ? d.total : ""}</span>
          <div className="w-full rounded-t-md bg-gradient-to-t from-[#a0435f] to-[#e8849a] transition-all duration-500"
            style={{ height: `${Math.max((d.total / max) * 96, d.total > 0 ? 8 : 2)}px` }} />
          <span className="text-[9px] text-[#9a6672] text-center leading-tight">{d.semana}</span>
        </div>
      ))}
    </div>
  );
}

// Dona simple con SVG
function DonutChart({ pagadas, total }) {
  const gratis = total - pagadas;
  const pct = total > 0 ? (pagadas / total) : 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f0dde2" strokeWidth="12"/>
          <circle cx="48" cy="48" r={r} fill="none" stroke="url(#donaGrad)" strokeWidth="12"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            transform="rotate(-90 48 48)" strokeDashoffset="0"/>
          <defs>
            <linearGradient id="donaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a0435f"/>
              <stop offset="100%" stopColor="#e8849a"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-[18px] font-bold text-[#a0435f]">{Math.round(pct * 100)}%</span>
          <span className="text-[9px] text-[#9a6672]">pagaron</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#a0435f] to-[#e8849a]" />
          <span className="text-[12px] text-[#2d1a22]"><strong>{pagadas}</strong> con acceso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f0dde2]" />
          <span className="text-[12px] text-[#2d1a22]"><strong>{gratis}</strong> sin pagar</span>
        </div>
      </div>
    </div>
  );
}

// Barra de progreso horizontal
function HBar({ label, value, max, color = "#a0435f" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#2d1a22] truncate max-w-[200px]">{label}</p>
        <span className="text-[11px] font-semibold text-[#a0435f] shrink-0 ml-2">{value}</span>
      </div>
      <div className="w-full h-2 bg-[#f0dde2] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #a0435f, #e8849a)` }} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const maxSesion = Math.max(...(stats.sesionesPopulares?.map(s => s.completadas) || [1]), 1);

  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-[26px] font-bold text-[#2d1a22]">Resumen</h1>
        <p className="text-[13px] text-[#9a6672] mt-0.5">Panel de administración — Destino Au Pair</p>
      </div>

      {/* ── Tarjetas stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: UsersIcon,        label: "Registradas",      value: stats.totalUsuarias,    color: "bg-[#fce8ed]",  iconColor: "text-[#a0435f]" },
          { icon: DollarSignIcon,   label: "Con acceso",        value: stats.conAcceso,        color: "bg-[#fdf3e3]",  iconColor: "text-[#c9973a]" },
          { icon: CheckCircleIcon,  label: "Completaron todo",  value: stats.completaron,      color: "bg-[#e8f0e0]",  iconColor: "text-[#5a8a3a]" },
          { icon: TrendingUpIcon,   label: "Conversión",        value: `${stats.tasaConversion}%`, color: "bg-[#e8f0ff]", iconColor: "text-[#2a4a7f]" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#f0dde2] p-5">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon size={16} className={s.iconColor} />
              </div>
              <p className="font-serif text-[28px] font-bold text-[#2d1a22] leading-none">{s.value}</p>
              <p className="text-[11px] text-[#9a6672] mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Fila 2: Gráficas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Registros por semana */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-[#2d1a22]">Registros por semana</h2>
              <p className="text-[11px] text-[#9a6672]">Últimas 8 semanas</p>
            </div>
            <span className="text-[11px] bg-[#fce8ed] text-[#a0435f] font-medium px-2.5 py-1 rounded-full">
              {stats.registrosPorSemana?.reduce((a, b) => a + Number(b.total), 0)} total
            </span>
          </div>
          <BarChart data={stats.registrosPorSemana} />
        </div>

        {/* Dona pagadas vs gratis */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-[14px] font-semibold text-[#2d1a22]">Acceso al programa</h2>
            <p className="text-[11px] text-[#9a6672]">Pagadas vs gratuitas</p>
          </div>
          <DonutChart pagadas={stats.conAcceso} total={stats.totalUsuarias} />

          {/* Métricas extra */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#fce8ed]">
            <div className="text-center">
              <p className="font-serif text-[20px] font-bold text-[#2d1a22]">{stats.progresoPromedio}%</p>
              <p className="text-[10px] text-[#9a6672]">Progreso promedio</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-[20px] font-bold text-[#2d1a22]">{stats.sinProgreso}</p>
              <p className="text-[10px] text-[#9a6672]">Sin actividad</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fila 3: Sesiones populares + últimas usuarias ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Sesiones más completadas */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5">
          <h2 className="text-[14px] font-semibold text-[#2d1a22] mb-4">Progreso por sesión</h2>
          <div className="space-y-3">
            {stats.sesionesPopulares?.map((s, i) => (
              <HBar
                key={i}
                label={`${s.orden}. ${s.titulo}`}
                value={s.completadas}
                max={maxSesion}
              />
            ))}
          </div>
        </div>

        {/* Últimas usuarias */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#fce8ed] flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#2d1a22]">Últimas registradas</h2>
            <a href="/admin/usuarias" className="text-[12px] text-[#a0435f] hover:underline">Ver todas →</a>
          </div>
          <div className="divide-y divide-[#fff0f3]">
            {stats.ultimasUsuarias?.length > 0 ? stats.ultimasUsuarias.map((u, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0 overflow-hidden">
                  {u.foto_url
                    ? <img src={u.foto_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[#a0435f] text-[12px] font-serif font-bold">{u.nombre?.[0]}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#2d1a22] truncate">{u.nombre} {u.apellido}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-[#f0dde2] rounded-full overflow-hidden max-w-[80px]">
                      <div className="h-full bg-[#e8849a] rounded-full" style={{ width: `${u.porcentaje || 0}%` }} />
                    </div>
                    <span className="text-[10px] text-[#9a6672]">{u.porcentaje || 0}%</span>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  u.tiene_acceso ? "bg-[#e8f0e0] text-[#5a8a3a]" : "bg-[#fce8ed] text-[#9a6672]"
                }`}>
                  {u.tiene_acceso ? "Pagó" : "Gratis"}
                </span>
              </div>
            )) : (
              <p className="px-5 py-8 text-center text-[13px] text-[#9a6672]">No hay usuarias aún.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Alerta sin actividad ── */}
      {stats.sinProgreso > 0 && (
        <div className="bg-[#fdf3e3] border border-[#f0d090] rounded-2xl p-4 flex items-center gap-3">
          <AlertCircleIcon size={18} className="text-[#c9973a] shrink-0" />
          <p className="text-[13px] text-[#7a6030]">
            <strong>{stats.sinProgreso} usuaria{stats.sinProgreso > 1 ? "s" : ""}</strong> se registró pero nunca completó una sesión. Considera enviarles un mensaje de seguimiento.
          </p>
        </div>
      )}

    </div>
  );
}