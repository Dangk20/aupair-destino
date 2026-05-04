"use client";

import { useEffect, useState } from "react";
import { UsersIcon, VideoIcon, CheckCircleIcon, DollarSignIcon } from "lucide-react";

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

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-[26px] font-bold text-[#2d1a22]">Resumen</h1>
        <p className="text-[13px] text-[#9a6672] mt-0.5">Panel de administración — Destino Au Pair</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: UsersIcon,       label: "Usuarias registradas", value: stats?.totalUsuarias || 0, color: "bg-[#fce8ed]", iconColor: "text-[#a0435f]" },
          { icon: DollarSignIcon,  label: "Con acceso pagado",    value: stats?.conAcceso     || 0, color: "bg-[#fdf3e3]", iconColor: "text-[#c9973a]" },
          { icon: CheckCircleIcon, label: "Completaron todo",     value: stats?.completaron   || 0, color: "bg-[#e8f0e0]", iconColor: "text-[#5a8a3a]" },
          { icon: VideoIcon,       label: "Sesiones activas",     value: stats?.totalSesiones || 0, color: "bg-[#f8e8ed]", iconColor: "text-[#c9607a]" },
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

      {/* Últimas usuarias */}
      <div className="bg-white rounded-2xl border border-[#f0dde2] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#fce8ed] flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#2d1a22]">Últimas registradas</h2>
          <a href="/admin/usuarias" className="text-[12px] text-[#a0435f] hover:underline">Ver todas →</a>
        </div>
        <div className="divide-y divide-[#fff0f3]">
          {stats?.ultimasUsuarias?.length > 0 ? stats.ultimasUsuarias.map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0">
                <span className="text-[#a0435f] text-[12px] font-serif font-bold">{u.nombre?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#2d1a22] truncate">{u.nombre} {u.apellido}</p>
                <p className="text-[11px] text-[#9a6672] truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  u.tiene_acceso ? "bg-[#e8f0e0] text-[#5a8a3a]" : "bg-[#fce8ed] text-[#9a6672]"
                }`}>
                  {u.tiene_acceso ? "Con acceso" : "Sin acceso"}
                </span>
                <span className="text-[10px] text-[#c0909a]">
                  {new Date(u.created_at).toLocaleDateString("es-CO")}
                </span>
              </div>
            </div>
          )) : (
            <p className="px-5 py-8 text-center text-[13px] text-[#9a6672]">No hay usuarias registradas aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}