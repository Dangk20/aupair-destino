"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderOpen, Plus, Search, Filter, MoreHorizontal,
  Pencil, Trash2, Eye, ChevronDown, X, Calendar, DollarSign, Users
} from "lucide-react";

const STATUS_OPTIONS = ["activo","completado","suspendido","cancelado"];
const STATUS_LABELS  = { activo:"Active", completado:"Completed", suspendido:"On Hold", cancelado:"Cancelled" };
const STATUS_COLORS  = {
  activo:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  completado: "bg-cyan-100 text-cyan-700 border-cyan-200",
  suspendido: "bg-amber-100 text-amber-700 border-amber-200",
  cancelado:  "bg-red-100 text-red-700 border-red-200",
};

const ID_EMPRESA = 1; // TODO: replace with session

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]  = useState(null);
  const [form, setForm] = useState({ nombre:"", descripcion:"", presupuesto:"", fecha_inicio:"", fecha_fin:"" });
  const [saving, setSaving] = useState(false);

  async function loadProjects() {
    setLoading(true);
    const r = await fetch(`/api/app/projects?id_empresa=${ID_EMPRESA}`).catch(()=>null);
    const d = r ? await r.json().catch(()=>[]) : [];
    setProjects(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => { loadProjects(); }, []);

  function openCreate() { setEditing(null); setForm({ nombre:"", descripcion:"", presupuesto:"", fecha_inicio:"", fecha_fin:"" }); setShowModal(true); }
  function openEdit(p)  { setEditing(p); setForm({ nombre: p.nombre, descripcion: p.descripcion||"", presupuesto: p.presupuesto||"", fecha_inicio: p.fecha_inicio?.split("T")[0]||"", fecha_fin: p.fecha_fin?.split("T")[0]||"" }); setShowModal(true); }

  async function handleSave() {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      const url    = editing ? `/api/app/projects/${editing.id_proyecto}` : "/api/app/projects";
      const method = editing ? "PATCH" : "POST";
      await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ...form, id_empresa: ID_EMPRESA }) });
      setShowModal(false);
      loadProjects();
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await fetch(`/api/app/projects/${id}`, { method:"DELETE" });
    loadProjects();
  }

  async function handleStatusChange(id, estado) {
    await fetch(`/api/app/projects/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ estado }) });
    loadProjects();
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.estado === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Projects</h2>
          <p className="text-slate-500 text-sm mt-0.5">{projects.length} total projects</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
        </div>
        <div className="flex gap-2">
          {["all",...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={()=>setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition border ${filter===s ? "bg-cyan-600 text-white border-cyan-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
              {s === "all" ? "All" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Budget</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Dates</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Progress</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Loading projects...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center">
                <FolderOpen size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No projects found</p>
              </td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id_proyecto} className="hover:bg-slate-50/70 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                      <FolderOpen size={15} className="text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{p.nombre}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.descripcion||"—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="text-slate-700 font-medium">{p.presupuesto ? `$${Number(p.presupuesto).toLocaleString()}` : "—"}</span>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>Start: {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : "—"}</p>
                    <p>End: {p.fecha_fin   ? new Date(p.fecha_fin).toLocaleDateString()   : "—"}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="w-28">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-500">{p.progreso_porcentaje||0}%</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5 w-full">
                      <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{ width:`${p.progreso_porcentaje||0}%` }}/>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <select value={p.estado} onChange={e=>handleStatusChange(p.id_proyecto, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer outline-none ${STATUS_COLORS[p.estado]||"bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {STATUS_OPTIONS.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 justify-end">
                    <Link href={`/app/dashboard/projects/${p.id_proyecto}`}
                      className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition" title="View">
                      <Eye size={15}/>
                    </Link>
                    <button onClick={()=>openEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit">
                      <Pencil size={15}/>
                    </button>
                    <button onClick={()=>handleDelete(p.id_proyecto)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <Trash2 size={15}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editing ? "Edit Project" : "New Project"}</h3>
              <button onClick={()=>setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Project Name *</label>
                <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="e.g. Office Renovation"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} rows={2} placeholder="Brief project description..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 resize-none"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Budget (USD)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input type="number" value={form.presupuesto} onChange={e=>setForm({...form,presupuesto:e.target.value})} placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Start Date</label>
                  <input type="date" value={form.fecha_inicio} onChange={e=>setForm({...form,fecha_inicio:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">End Date</label>
                  <input type="date" value={form.fecha_fin} onChange={e=>setForm({...form,fecha_fin:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"/>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving||!form.nombre.trim()}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition">
                {saving?"Saving…": editing?"Save Changes":"Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}