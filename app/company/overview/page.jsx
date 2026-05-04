"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderOpen, Users, FileText, DollarSign,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  ArrowRight, Plus
} from "lucide-react";

export default function AppOverviewPage() {
  const [stats, setStats]       = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/app/stats").then(r => r.json()).catch(() => null),
      fetch("/api/app/projects?limit=5").then(r => r.json()).catch(() => []),
    ]).then(([s, p]) => {
      setStats(s);
      setProjects(Array.isArray(p) ? p : []);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Active Projects",   value: stats?.activeProjects ?? "—",   icon: FolderOpen,   color: "bg-cyan-50 text-cyan-600",   border: "border-cyan-200" },
    { label: "Team Members",      value: stats?.teamMembers    ?? "—",   icon: Users,        color: "bg-violet-50 text-violet-600", border: "border-violet-200" },
    { label: "Blueprints",        value: stats?.blueprints     ?? "—",   icon: FileText,     color: "bg-amber-50 text-amber-600",  border: "border-amber-200" },
    { label: "Total Budget",      value: stats?.totalBudget    ? `$${Number(stats.totalBudget).toLocaleString()}` : "—", icon: DollarSign, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-200" },
  ];

  const statusColors = {
    activo:     "bg-emerald-100 text-emerald-700",
    completado: "bg-cyan-100 text-cyan-700",
    suspendido: "bg-amber-100 text-amber-700",
    cancelado:  "bg-red-100 text-red-700",
  };

  const statusLabels = {
    activo: "Active", completado: "Completed", suspendido: "On Hold", cancelado: "Cancelled"
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Good morning 👋</h2>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your projects today.</p>
        </div>
        <Link href="/app/dashboard/projects/new"
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm">
          <Plus size={16} /> New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color} shrink-0`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{loading ? "…" : s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Recent Projects</h3>
            <Link href="/app/dashboard/projects" className="text-cyan-600 hover:text-cyan-500 text-xs flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading && (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">Loading...</div>
            )}
            {!loading && projects.length === 0 && (
              <div className="px-5 py-10 text-center">
                <FolderOpen size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No projects yet</p>
                <Link href="/app/dashboard/projects/new" className="text-cyan-600 text-xs hover:underline mt-1 inline-block">Create your first project →</Link>
              </div>
            )}
            {projects.map(p => (
              <div key={p.id_proyecto} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <FolderOpen size={16} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.nombre}</p>
                  <p className="text-xs text-slate-400 truncate">{p.descripcion || "No description"}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400">{p.progreso_porcentaje || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${p.progreso_porcentaje || 0}%` }} />
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[p.estado] || "bg-slate-100 text-slate-500"}`}>
                    {statusLabels[p.estado] || p.estado}
                  </span>
                  <Link href={`/app/dashboard/projects/${p.id_proyecto}`} className="text-slate-400 hover:text-cyan-600 transition">
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + activity */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "New Project",      href: "/app/dashboard/projects/new",   icon: Plus,         color: "text-cyan-600" },
                { label: "Upload Blueprint", href: "/app/dashboard/blueprints",     icon: FileText,     color: "text-amber-600" },
                { label: "Invite Team",      href: "/app/dashboard/team",           icon: Users,        color: "text-violet-600" },
                { label: "View Reports",     href: "/app/dashboard/reports",        icon: TrendingUp,   color: "text-emerald-600" },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition group">
                    <Icon size={16} className={a.color} />
                    <span className="text-sm text-slate-600 group-hover:text-slate-800">{a.label}</span>
                    <ArrowRight size={13} className="ml-auto text-slate-300 group-hover:text-slate-500" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Project status summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Project Status</h3>
            <div className="space-y-2.5">
              {[
                { label: "Active",    count: stats?.byStatus?.activo     || 0, icon: TrendingUp,   color: "text-emerald-500" },
                { label: "On Hold",   count: stats?.byStatus?.suspendido || 0, icon: Clock,        color: "text-amber-500" },
                { label: "Completed", count: stats?.byStatus?.completado || 0, icon: CheckCircle2, color: "text-cyan-500" },
                { label: "Cancelled", count: stats?.byStatus?.cancelado  || 0, icon: AlertCircle,  color: "text-red-400" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <Icon size={15} className={s.color} />
                    <span className="text-sm text-slate-600 flex-1">{s.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{loading ? "…" : s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}