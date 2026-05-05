"use client";

import { useEffect, useState } from "react";
import { SearchIcon, CheckCircleIcon, XCircleIcon, UserIcon } from "lucide-react";

export default function AdminUsuariasPage() {
  const [usuarias, setUsuarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState(null);
  const [togglingPerfil, setTogglingPerfil] = useState(null);

  const cargar = () => {
    fetch("/api/admin/usuarias")
      .then((r) => r.json())
      .then((d) => { setUsuarias(d.usuarias || []); setLoading(false); });
  };

  useEffect(() => { cargar(); }, []);

  const toggleAcceso = async (id, tieneAcceso) => {
    setToggling(id);
    await fetch("/api/admin/toggle-acceso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, tiene_acceso: !tieneAcceso }),
    });
    cargar();
    setToggling(null);
  };

  const togglePerfil = async (id, perfilHabilitado) => {
    setTogglingPerfil(id);
    await fetch("/api/admin/toggle-perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, perfil_habilitado: !perfilHabilitado }),
    });
    cargar();
    setTogglingPerfil(null);
  };

  const filtradas = usuarias.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-bold text-[#2d1a22]">Usuarias</h1>
        <p className="text-[13px] text-[#9a6672] mt-0.5">Gestiona el acceso y perfil de cada estudiante</p>
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0909a]" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#f0dde2] rounded-xl text-[13px] text-[#2d1a22] placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a] transition"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-[#f0dde2] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#fce8ed] grid grid-cols-12 gap-2">
          <p className="col-span-4 text-[11px] font-semibold text-[#9a6672] uppercase tracking-wide">Usuaria</p>
          <p className="col-span-2 text-[11px] font-semibold text-[#9a6672] uppercase tracking-wide">Progreso</p>
          <p className="col-span-2 text-[11px] font-semibold text-[#9a6672] uppercase tracking-wide">Registro</p>
          <p className="col-span-2 text-[11px] font-semibold text-[#9a6672] uppercase tracking-wide">Acceso</p>
          <p className="col-span-2 text-[11px] font-semibold text-[#9a6672] uppercase tracking-wide">Perfil</p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-7 h-7 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtradas.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-[#9a6672]">No se encontraron usuarias.</p>
        ) : (
          <div className="divide-y divide-[#fff0f3]">
            {filtradas.map((u) => (
              <div key={u.id} className="px-5 py-3.5 grid grid-cols-12 gap-2 items-center hover:bg-[#fff8f9] transition">

                {/* Nombre + email */}
                <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0 overflow-hidden">
                    {u.foto_url
                      ? <img src={u.foto_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[#a0435f] text-[12px] font-serif font-bold">{u.nombre?.[0]}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#2d1a22] truncate">{u.nombre} {u.apellido}</p>
                    <p className="text-[11px] text-[#9a6672] truncate">{u.email}</p>
                  </div>
                </div>

                {/* Progreso */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="flex-1 h-1.5 bg-[#f0dde2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e8849a] rounded-full" style={{ width: `${u.porcentaje || 0}%` }} />
                    </div>
                    <span className="text-[10px] text-[#9a6672] shrink-0">{u.sesiones_completadas || 0}/8</span>
                  </div>
                  <p className="text-[10px] text-[#c0909a]">{u.porcentaje || 0}%</p>
                </div>

                {/* Fecha */}
                <div className="col-span-2">
                  <p className="text-[11px] text-[#7a4a54]">
                    {new Date(u.created_at).toLocaleDateString("es-CO")}
                  </p>
                </div>

                {/* Toggle acceso (pago) */}
                <div className="col-span-2">
                  <button
                    onClick={() => toggleAcceso(u.id, u.tiene_acceso)}
                    disabled={toggling === u.id}
                    className={`flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-xl transition w-full justify-center ${
                      u.tiene_acceso
                        ? "bg-[#e8f0e0] text-[#5a8a3a] hover:bg-[#d8e8d0]"
                        : "bg-[#fce8ed] text-[#a0435f] hover:bg-[#f8d8e4]"
                    }`}
                  >
                    {toggling === u.id ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : u.tiene_acceso ? (
                      <CheckCircleIcon size={11} />
                    ) : (
                      <XCircleIcon size={11} />
                    )}
                    {u.tiene_acceso ? "Activo" : "Sin acceso"}
                  </button>
                </div>

                {/* Toggle perfil */}
                <div className="col-span-2">
                  <button
                    onClick={() => togglePerfil(u.id, u.perfil_habilitado)}
                    disabled={togglingPerfil === u.id}
                    className={`flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-xl transition w-full justify-center ${
                      u.perfil_habilitado
                        ? "bg-[#e8f0ff] text-[#2a4a7f] hover:bg-[#d8e0f8]"
                        : "bg-[#f5f0ff] text-[#6b4f9e] hover:bg-[#ede8f8]"
                    }`}
                  >
                    {togglingPerfil === u.id ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UserIcon size={11} />
                    )}
                    {u.perfil_habilitado ? "Perfil ON" : "Perfil OFF"}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}