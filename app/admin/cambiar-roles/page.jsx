"use client";

import { useEffect, useState } from "react";
import { SearchIcon, CheckCircleIcon, AlertCircleIcon, ShieldIcon } from "lucide-react";

export default function CambiarRolesPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("todos");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cambiando, setCambiando] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const rolesDisponibles = [
    { valor: "usuaria", label: "Usuaria (Estudiante)", color: "bg-blue-100 text-blue-700" },
    { valor: "asociada", label: "Asociada (Asesora)", color: "bg-purple-100 text-purple-700" },
    { valor: "admin", label: "Admin (Administrador)", color: "bg-red-100 text-red-700" },
  ];

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarias");
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarias || []);
      }
    } catch (err) {
      console.error("Error fetching usuarios:", err);
      setErrorMessage("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    setCambiando(usuarioId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(
        `/api/admin/usuarios/${usuarioId}/cambiar-rol`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevoRol }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.mensaje);
        fetchUsuarios();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.error || "Error al cambiar rol");
      }
    } catch (err) {
      console.error("Error changing role:", err);
      setErrorMessage("Error al cambiar el rol");
    } finally {
      setCambiando(null);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideNombre =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const coincideRol = filterRol === "todos" || u.rol === filterRol;

    return coincideNombre && coincideRol;
  });

  const getRolColor = (rol) => {
    switch (rol) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "asociada":
        return "bg-purple-100 text-purple-700";
      case "usuaria":
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestionar Roles de Usuarios</h1>
        <p className="text-sm text-gray-600 mt-1">
          Cambia el rol de los usuarios registrados en el sistema
        </p>
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

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <SearchIcon size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
            />
          </div>

          {/* Filtro Rol */}
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
          >
            <option value="todos">Todos los roles</option>
            <option value="usuaria">Usuarias</option>
            <option value="asociada">Asociadas</option>
            <option value="admin">Administradores</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
        </p>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : usuariosFiltrados.length > 0 ? (
        <div className="space-y-3">
          {usuariosFiltrados.map((usuario, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Información del usuario */}
                <div>
                  <p className="font-semibold text-gray-900">
                    {usuario.nombre} {usuario.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{usuario.email}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {usuario.id}</p>
                </div>

                {/* Rol actual */}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Rol Actual</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getRolColor(usuario.rol)}`}>
                    {usuario.rol === "usuaria"
                      ? "👩‍🎓 Usuaria"
                      : usuario.rol === "asociada"
                      ? "👩‍🏫 Asociada"
                      : "👨‍💼 Admin"}
                  </span>
                </div>

                {/* Información adicional */}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Estado</p>
                  <div className="flex items-center gap-1">
                    {usuario.tiene_acceso ? (
                      <>
                        <CheckCircleIcon size={14} className="text-green-600" />
                        <span className="text-sm text-green-700">Tiene acceso</span>
                      </>
                    ) : (
                      <>
                        <AlertCircleIcon size={14} className="text-yellow-600" />
                        <span className="text-sm text-yellow-700">Sin acceso</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Botones cambiar rol */}
                <div className="flex gap-2 flex-wrap">
                  {rolesDisponibles.map((rol) => (
                    <button
                      key={rol.valor}
                      onClick={() => handleCambiarRol(usuario.id, rol.valor)}
                      disabled={usuario.rol === rol.valor || cambiando === usuario.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        usuario.rol === rol.valor
                          ? `${rol.color} opacity-50 cursor-not-allowed`
                          : `${rol.color} hover:opacity-80 active:opacity-100`
                      }`}
                    >
                      {cambiando === usuario.id ? (
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                      ) : null}
                      {rol.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ShieldIcon size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">
            {searchTerm || filterRol !== "todos"
              ? "No se encontraron usuarios"
              : "No hay usuarios registrados"}
          </p>
        </div>
      )}

      {/* Info sobre roles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-blue-900">📋 Tipos de Roles:</p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>👩‍🎓 <strong>Usuaria:</strong> Estudiantes Au Pair en el programa</li>
          <li>👩‍🏫 <strong>Asociada:</strong> Asesoras que guían a las usuarias</li>
          <li>👨‍💼 <strong>Admin:</strong> Administradores del sistema</li>
        </ul>
      </div>
    </div>
  );
}
