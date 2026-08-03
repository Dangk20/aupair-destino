"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchIcon, FilterIcon, ChevronRightIcon } from "lucide-react";

export default function AsociadaUsuariasPage() {
  const [usuarias, setUsuarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  useEffect(() => {
    const fetchUsuarias = async () => {
      try {
        const res = await fetch("/api/asociada/usuarias-asignadas");
        if (res.ok) {
          const data = await res.json();
          setUsuarias(data.usuarias);
        }
      } catch (err) {
        console.error("Error fetching usuarias:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarias();
  }, []);

  const usuariasFiltradas = usuarias.filter((u) => {
    const coincideNombre =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const coincideEstado =
      filterEstado === "todos" || u.estado === filterEstado;

    return coincideNombre && coincideEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Usuarias
        </h1>
        <p className="text-gray-600">
          Gestiona a las usuarias asignadas a ti. Total: {usuarias.length}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <SearchIcon
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0435F]"
            />
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center gap-2">
            <FilterIcon size={18} className="text-gray-400" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0435F]"
            >
              <option value="todos">Todos los estados</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
              <option value="Pausado">Pausado</option>
            </select>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600 py-2">
            Mostrando {usuariasFiltradas.length} de {usuarias.length} usuarias
          </div>
        </div>
      </div>

      {/* Lista de usuarias */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-200 h-20 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : usuariasFiltradas.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Progreso
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariasFiltradas.map((u, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {u.nombre} {u.apellido}
                      </p>
                      <p className="text-xs text-gray-500">{u.ciudad || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.estado === "Completado"
                            ? "bg-green-100 text-green-700"
                            : u.estado === "En progreso"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#A0435F] h-2 rounded-full"
                            style={{ width: `${u.porcentajeProgreso}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 whitespace-nowrap">
                          {u.porcentajeProgreso}%
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/asociada/usuarias/${u.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#A0435F] hover:underline"
                      >
                        Ver detalles
                        <ChevronRightIcon size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {searchTerm || filterEstado !== "todos"
              ? "No se encontraron usuarias con esos filtros."
              : "Aún no tienes usuarias asignadas."}
          </p>
        </div>
      )}
    </div>
  );
}
