"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon, PlusIcon, TrashIcon, SearchIcon, CheckCircleIcon,
  AlertCircleIcon, UserIcon,
} from "lucide-react";

export default function AsociadaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const asociadaId = params.id;

  const [asociada, setAsociada] = useState(null);
  const [usuarias, setUsuarias] = useState([]);
  const [usuariasDisponibles, setUsuariasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuaria, setSelectedUsuaria] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAsociada, resDisponibles] = await Promise.all([
        fetch(`/api/admin/asociadas/${asociadaId}`),
        fetch("/api/admin/asociadas/asignar/usuarias"),
      ]);

      if (resAsociada.ok) {
        const data = await resAsociada.json();
        setAsociada(data.asociada);
        setUsuarias(data.usuarias);
      }

      if (resDisponibles.ok) {
        const data = await resDisponibles.json();
        setUsuariasDisponibles(data.usuarias);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setErrorMessage("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUsuaria) return;

    try {
      const res = await fetch("/api/admin/asociadas/asignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: selectedUsuaria.id,
          asociadaId: asociadaId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Usuaria asignada correctamente");
        setShowModal(false);
        setSelectedUsuaria(null);
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.error || "Error al asignar");
      }
    } catch (err) {
      console.error("Error assigning:", err);
      setErrorMessage("Error al asignar");
    }
  };

  const handleRemove = async (usuarioId) => {
    if (!confirm("¿Desasignar esta usuaria?")) return;

    try {
      const res = await fetch(`/api/admin/asociadas/asignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuarioId,
          asociadaId: null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Usuaria desasignada correctamente");
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.error || "Error al desasignar");
      }
    } catch (err) {
      console.error("Error removing:", err);
      setErrorMessage("Error al desasignar");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!asociada) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Asesora no encontrada</p>
      </div>
    );
  }

  const usuariasFiltradas = usuarias.filter((u) =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const disponiblesFiltradas = usuariasDisponibles.filter((u) =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/asociadas"
          className="text-[#A0435F] hover:underline flex items-center gap-2"
        >
          <ArrowLeftIcon size={18} />
          Volver
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {asociada.nombre} {asociada.apellido}
          </h1>
          <p className="text-gray-600">{asociada.email}</p>
        </div>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircleIcon size={20} className="text-green-600" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircleIcon size={20} className="text-red-600" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la Asesora */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-900">{asociada.email}</p>
            </div>
            {asociada.telefono && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                <p className="text-sm text-gray-900">{asociada.telefono}</p>
              </div>
            )}
            {asociada.ciudad && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Ciudad</p>
                <p className="text-sm text-gray-900">{asociada.ciudad}</p>
              </div>
            )}
            {asociada.pais && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">País</p>
                <p className="text-sm text-gray-900">{asociada.pais}</p>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Registro</p>
              <p className="text-sm text-gray-900">
                {new Date(asociada.created_at).toLocaleDateString("es-CO")}
              </p>
            </div>
          </div>
        </div>

        {/* Usuarias Asignadas */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Usuarias Asignadas</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: <span className="font-bold text-[#A0435F]">{usuarias.length}</span>
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#A0435F] hover:bg-[#A0435F] text-white rounded-lg font-medium transition"
            >
              <PlusIcon size={18} />
              Asignar Usuaria
            </button>
          </div>

          {/* Búsqueda */}
          <div className="mb-4 relative">
            <SearchIcon size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuaria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0435F]"
            />
          </div>

          {/* Lista */}
          {usuariasFiltradas.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {usuariasFiltradas.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {u.nombre} {u.apellido}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Estado: <span className="font-medium">{u.estado}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(u.id)}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition text-red-600"
                    title="Desasignar"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No se encontraron usuarias" : "Sin usuarias asignadas"}
            </div>
          )}
        </div>
      </div>

      {/* Modal Asignar Usuaria */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Asignar Usuaria</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {disponiblesFiltradas.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {disponiblesFiltradas.map((u, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedUsuaria(u)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          selectedUsuaria?.id === u.id
                            ? "border-[#A0435F] bg-[#A0435F]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          {u.nombre} {u.apellido}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Registrada:{" "}
                          {new Date(u.created_at).toLocaleDateString("es-CO")}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleAssign}
                      disabled={!selectedUsuaria}
                      className="flex-1 px-4 py-2 bg-[#A0435F] hover:bg-[#A0435F] disabled:opacity-50 text-white rounded-lg font-medium transition"
                    >
                      Asignar
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <UserIcon size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    No hay usuarias disponibles para asignar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
