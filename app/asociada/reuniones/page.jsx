"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, UserIcon, CheckCircleIcon } from "lucide-react";

export default function AsociadaReunionesPage() {
  const [reuniones, setReuniones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("proximas");

  useEffect(() => {
    const fetchReuniones = async () => {
      try {
        const res = await fetch("/api/asociada/reuniones");
        if (res.ok) {
          const data = await res.json();
          setReuniones(data.reuniones);
        }
      } catch (err) {
        console.error("Error fetching reuniones:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReuniones();
  }, []);

  const reunionesFiltradas = reuniones.filter((r) => {
    if (filtro === "proximas") return new Date(r.fecha) >= new Date();
    if (filtro === "completadas") return new Date(r.fecha) < new Date();
    return true;
  });

  const handleConfirmarAsistencia = async (reunionId) => {
    try {
      const res = await fetch(`/api/asociada/reuniones/${reunionId}/confirmar`, {
        method: "POST",
      });
      if (res.ok) {
        // Actualizar estado localmente
        setReuniones((prev) =>
          prev.map((r) =>
            r.id === reunionId ? { ...r, confirmada: true } : r
          )
        );
      }
    } catch (err) {
      console.error("Error confirming reunion:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Reuniones
        </h1>
        <p className="text-gray-600">
          Gestiona tus reuniones 1-a-1 con las usuarias
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro("proximas")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === "proximas"
              ? "bg-[#7c5cc4] text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Próximas
        </button>
        <button
          onClick={() => setFiltro("completadas")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === "completadas"
              ? "bg-[#7c5cc4] text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Completadas
        </button>
        <button
          onClick={() => setFiltro("todas")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === "todas"
              ? "bg-[#7c5cc4] text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Todas
        </button>
      </div>

      {/* Lista de reuniones */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-200 h-24 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : reunionesFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {reunionesFiltradas.map((r, i) => {
            const fechaObj = new Date(r.fecha);
            const esFutura = fechaObj >= new Date();

            return (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#7c5cc4]/10 rounded-lg flex items-center justify-center">
                      <CalendarIcon size={20} className="text-[#7c5cc4]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {r.nombreUsuaria}
                      </h3>
                      <p className="text-sm text-gray-600">{r.tipoReunion}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      r.confirmada
                        ? "bg-green-100 text-green-700"
                        : esFutura
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.confirmada ? "Confirmada" : esFutura ? "Pendiente" : "Completada"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fecha</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <CalendarIcon size={16} className="text-gray-400" />
                      {fechaObj.toLocaleDateString("es-CO")}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Hora</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <ClockIcon size={16} className="text-gray-400" />
                      {r.hora}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duración</p>
                    <p className="text-sm font-medium text-gray-900">
                      {r.duracion} minutos
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tema</p>
                    <p className="text-sm font-medium text-gray-900">
                      {r.tema || "N/A"}
                    </p>
                  </div>
                </div>

                {r.descripcion && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{r.descripcion}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {esFutura && !r.confirmada && (
                    <button
                      onClick={() => handleConfirmarAsistencia(r.id)}
                      className="flex-1 px-4 py-2 bg-[#7c5cc4] hover:bg-[#6a4ab0] text-white rounded-lg font-medium transition"
                    >
                      Confirmar asistencia
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                    Ver detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CalendarIcon size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">
            {filtro === "proximas"
              ? "No tienes reuniones próximas"
              : "No hay reuniones"}
          </p>
        </div>
      )}
    </div>
  );
}
