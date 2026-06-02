"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusIcon, SearchIcon, TrashIcon, EditIcon, EyeIcon, ChevronDownIcon,
  UserPlusIcon, CheckCircleIcon, AlertCircleIcon,
} from "lucide-react";

export default function AdminAsociadasPage() {
  const [asociadas, setAsociadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    ciudad: "",
    pais: "",
  });
  const [nuevoCodigoReferido, setNuevoCodigoReferido] = useState(null);

  // Cargar asociadas
  useEffect(() => {
    fetchAsociadas();
  }, []);

  const fetchAsociadas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/asociadas");
      if (res.ok) {
        const data = await res.json();
        setAsociadas(data.asociadas);
      }
    } catch (err) {
      console.error("Error fetching asociadas:", err);
      setErrorMessage("Error al cargar las asesoras");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (asociada = null) => {
    if (asociada) {
      setEditingId(asociada.id);
      setFormData({
        nombre: asociada.nombre,
        apellido: asociada.apellido,
        email: asociada.email,
        password: "",
        telefono: asociada.telefono || "",
        ciudad: asociada.ciudad || "",
        pais: asociada.pais || "",
      });
      setNuevoCodigoReferido(null);
    } else {
      setEditingId(null);
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: "",
        ciudad: "",
        pais: "",
      });
      setNuevoCodigoReferido(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setErrorMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const url = editingId ? `/api/admin/asociadas/${editingId}` : "/api/admin/asociadas";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.mensaje || "Operación exitosa");
        if (data.codigo_referido && !editingId) {
          setNuevoCodigoReferido(data.codigo_referido);
        }
        setShowModal(false);
        fetchAsociadas();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.error || "Error al guardar");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setErrorMessage("Error al guardar los datos");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta asesora?")) return;

    try {
      const res = await fetch(`/api/admin/asociadas/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Asesora eliminada correctamente");
        fetchAsociadas();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.error || "Error al eliminar");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      setErrorMessage("Error al eliminar");
    }
  };

  const asociadasFiltradas = asociadas.filter((a) =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Mensajes */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircleIcon size={20} className="text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
            {nuevoCodigoReferido && (
              <p className="text-sm text-green-700 mt-2">
                <strong>Código de referido:</strong> <code className="bg-green-100 px-2 py-1 rounded font-mono">{nuevoCodigoReferido}</code>
              </p>
            )}
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircleIcon size={20} className="text-red-600" />
          <p className="text-sm font-medium text-red-900">{errorMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asesoras / Asociadas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las asesoras del programa Au Pair
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#7c5cc4] hover:bg-[#6a4ab0] text-white rounded-lg font-medium transition"
        >
          <PlusIcon size={18} />
          Nueva Asesora
        </button>
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

      {/* Búsqueda */}
      <div className="relative">
        <SearchIcon size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : asociadasFiltradas.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Códigos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Usuarias
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Reuniones
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Progreso Promedio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {asociadasFiltradas.map((asociada, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {asociada.nombre} {asociada.apellido}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {asociada.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {asociada.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        {/* Código de usuario (asesora) */}
                        {asociada.codigo_referido && (
                          <div className="flex items-center gap-2">
                            <code className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono text-xs font-bold">
                              {asociada.codigo_referido}
                            </code>
                            <span className="text-[9px] text-gray-500 font-medium">Usuario</span>
                          </div>
                        )}
                        
                        {/* Códigos de promoción vinculados */}
                        {asociada.codigos_referidos_promo && (
                          <div className="space-y-1">
                            {asociada.codigos_referidos_promo.split(', ').map((codigo, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <code className="bg-green-100 text-green-700 px-2 py-1 rounded font-mono text-xs font-bold">
                                  {codigo}
                                </code>
                                <span className="text-[9px] text-gray-500 font-medium">Promo</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {!asociada.codigo_referido && !asociada.codigos_referidos_promo && (
                          <span className="text-gray-400 text-xs">Sin códigos</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {asociada.ciudad && asociada.pais
                        ? `${asociada.ciudad}, ${asociada.pais}`
                        : asociada.ciudad || asociada.pais || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <UserPlusIcon size={14} />
                        {asociada.usuarias_asignadas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <span className="font-medium text-gray-900">
                          {asociada.reuniones_confirmadas}
                        </span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-600">
                          {asociada.reuniones_totales}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#7c5cc4] h-2 rounded-full"
                            style={{
                              width: `${Math.round(asociada.promedio_progreso_usuarias)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-8">
                          {Math.round(asociada.promedio_progreso_usuarias)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/asociadas/${asociada.id}`}
                          className="p-1.5 hover:bg-green-100 rounded-lg transition text-green-600"
                          title="Ver detalles"
                        >
                          <EyeIcon size={16} />
                        </Link>
                        <button
                          onClick={() => handleOpenModal(asociada)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Editar"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(asociada.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Eliminar"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <UserPlusIcon size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">
            {searchTerm ? "No se encontraron asesoras" : "No hay asesoras registradas aún"}
          </p>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Editar Asesora" : "Nueva Asesora"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4] disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Contraseña {editingId ? "(dejar en blanco para no cambiar)" : "*"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#7c5cc4] hover:bg-[#6a4ab0] text-white rounded-lg font-medium transition"
                >
                  {editingId ? "Guardar Cambios" : "Crear Asesora"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
