"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Mail, Phone, Pencil, Trash2, X, Shield } from "lucide-react";

const ROLES = ["Admin Empresa","Gerente","Contratista","Contador"];
const ROLE_COLORS = {
  "Admin Empresa": "bg-purple-100 text-purple-700",
  "Gerente":       "bg-cyan-100 text-cyan-700",
  "Contratista":   "bg-amber-100 text-amber-700",
  "Contador":      "bg-emerald-100 text-emerald-700",
};
const ID_EMPRESA = 1;

export default function TeamPage() {
  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({ nombre:"", apellido:"", email:"", telefono:"", id_rol:"", password:"" });

  async function loadMembers() {
    setLoading(true);
    const r = await fetch(`/api/app/team?id_empresa=${ID_EMPRESA}`).catch(()=>null);
    const d = r ? await r.json().catch(()=>[]) : [];
    setMembers(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => { loadMembers(); }, []);

  function openCreate() { setEditing(null); setForm({ nombre:"", apellido:"", email:"", telefono:"", id_rol:"", password:"" }); setShowModal(true); }
  function openEdit(m)  { setEditing(m); setForm({ nombre:m.nombre, apellido:m.apellido, email:m.email, telefono:m.telefono||"", id_rol:m.nombre_rol||"", password:"" }); setShowModal(true); }

  async function handleSave() {
    if (!form.nombre.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      const url    = editing ? `/api/app/team/${editing.id_usuario}` : "/api/app/team";
      const method = editing ? "PATCH" : "POST";
      await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ...form, id_empresa: ID_EMPRESA }) });
      setShowModal(false);
      loadMembers();
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/app/team/${id}`, { method:"DELETE" });
    loadMembers();
  }

  const filtered = members.filter(m =>
    `${m.nombre} ${m.apellido} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const initials = m => `${m.nombre?.[0]||""}${m.apellido?.[0]||""}`.toUpperCase();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Team</h2>
          <p className="text-slate-500 text-sm mt-0.5">{members.length} members</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
          <Plus size={16}/> Invite Member
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search team..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400"/>
      </div>

      {/* Members grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && <div className="col-span-3 py-10 text-center text-slate-400">Loading team...</div>}
        {!loading && filtered.length === 0 && (
          <div className="col-span-3 py-12 text-center">
            <Users size={32} className="text-slate-300 mx-auto mb-2"/>
            <p className="text-slate-400 text-sm">No team members yet</p>
          </div>
        )}
        {filtered.map(m => (
          <div key={m.id_usuario} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {initials(m)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{m.nombre} {m.apellido}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[m.nombre_rol]||"bg-slate-100 text-slate-500"}`}>
                    {m.nombre_rol}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={()=>openEdit(m)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><Pencil size={13}/></button>
                <button onClick={()=>handleDelete(m.id_usuario)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={13}/></button>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2"><Mail size={12} className="text-slate-400"/>{m.email}</div>
              {m.telefono && <div className="flex items-center gap-2"><Phone size={12} className="text-slate-400"/>{m.telefono}</div>}
            </div>
            <div className={`mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs ${m.estado==="activo"?"text-emerald-600":"text-slate-400"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${m.estado==="activo"?"bg-emerald-500":"bg-slate-300"}`}/>
              {m.estado === "activo" ? "Active" : "Inactive"}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editing ? "Edit Member" : "Invite Team Member"}</h3>
              <button onClick={()=>setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">First Name *</label>
                  <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Last Name *</label>
                  <input value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Phone</label>
                <input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Role *</label>
                <select value={form.id_rol} onChange={e=>setForm({...form,id_rol:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400 bg-white">
                  <option value="">Select a role...</option>
                  {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {!editing && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Temporary Password *</label>
                  <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400"/>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={handleSave} disabled={saving||!form.nombre.trim()||!form.email.trim()}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition">
                {saving?"Saving…": editing?"Save Changes":"Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}