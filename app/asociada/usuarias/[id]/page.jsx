"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon, MailIcon, PhoneIcon, MapPinIcon, CalendarIcon,
  CheckCircleIcon, BookOpenIcon, FileTextIcon, AlertCircleIcon,
} from "lucide-react";

export default function UsuariaDetallesPage() {
  const params = useParams();
  const usuariaId = params.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/asociada/usuarias/${usuariaId}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Error fetching usuaria details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuariaId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron datos de la usuaria</p>
      </div>
    );
  }

  const { usuaria, sesiones, sesionesCompletadas, porcentajeProgreso, reuniones, documentos } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/asociada/usuarias" className="text-[#7c5cc4] hover:underline flex items-center gap-2">
          <ArrowLeftIcon size={18} />
          Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {usuaria.nombre} {usuaria.apellido}
        </h1>
      </div>

      {/* Tarjeta de información principal */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Datos personales */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información Personal</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MailIcon size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{usuaria.email}</p>
                </div>
              </div>
              {usuaria.telefono && (
                <div className="flex items-center gap-3">
                  <PhoneIcon size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="text-gray-900">{usuaria.telefono}</p>
                  </div>
                </div>
              )}
              {usuaria.ciudad && (
                <div className="flex items-center gap-3">
                  <MapPinIcon size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="text-gray-900">
                      {usuaria.ciudad}
                      {usuaria.pais && `, ${usuaria.pais}`}
                    </p>
                  </div>
                </div>
              )}
              {usuaria.fecha_nacimiento && (
                <div className="flex items-center gap-3">
                  <CalendarIcon size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                    <p className="text-gray-900">{new Date(usuaria.fecha_nacimiento).toLocaleDateString("es-CO")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estado y progreso */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Estado del Programa</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Progreso del Programa</p>
                  <p className="text-2xl font-bold text-[#7c5cc4]">{porcentajeProgreso}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#7c5cc4] h-3 rounded-full"
                    style={{ width: `${porcentajeProgreso}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircleIcon size={20} className="text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-700">{sesionesCompletadas}</p>
                  <p className="text-sm text-green-600">Sesiones Completadas</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpenIcon size={20} className="text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{sesiones.length}</p>
                  <p className="text-sm text-blue-600">Sesiones Totales</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${
                usuaria.estado_agencia === 'Completado'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="text-sm font-medium">
                  Estado: <span className={
                    usuaria.estado_agencia === 'Completado'
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }>
                    {usuaria.estado_agencia}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas Reuniones */}
      {reuniones.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Próximas Reuniones</h2>
          <div className="space-y-3">
            {reuniones.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{r.tema || "Sin tema"}</p>
                  <p className="text-sm text-gray-600">{new Date(r.fecha).toLocaleDateString("es-CO")} a las {r.hora}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  r.confirmada
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {r.confirmada ? "Confirmada" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos */}
      {documentos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Documentos Subidos</h2>
          <div className="space-y-2">
            {documentos.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileTextIcon size={18} className="text-[#7c5cc4]" />
                  <div>
                    <p className="font-medium text-gray-900">{d.tipo}</p>
                    <p className="text-xs text-gray-500">{new Date(d.fecha_subida).toLocaleDateString("es-CO")}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  d.estado === 'Revisado'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {d.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
