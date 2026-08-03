"use client";

import { useEffect, useState } from "react";
import { DatabaseIcon, CheckCircleIcon, AlertCircleIcon, CopyIcon } from "lucide-react";

export default function VerificadorBDPage() {
  const [bdInfo, setBdInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedTable, setCopiedTable] = useState(null);

  useEffect(() => {
    fetchBDInfo();
  }, []);

  const fetchBDInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bd-estructura");
      if (res.ok) {
        const data = await res.json();
        setBdInfo(data);
      }
    } catch (err) {
      console.error("Error fetching BD info:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, tableName) => {
    navigator.clipboard.writeText(text);
    setCopiedTable(tableName);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!bdInfo) {
    return (
      <div className="text-center py-12">
        <AlertCircleIcon size={32} className="mx-auto text-red-500 mb-2" />
        <p className="text-red-600">Error al cargar la información de la BD</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <DatabaseIcon size={32} className="text-[#A0435F]" />
          Verificador de Base de Datos
        </h1>
        <p className="text-gray-600 mt-2">
          Total de tablas: <span className="font-bold text-lg text-[#A0435F]">{bdInfo.total_tablas}</span>
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total de Tablas</p>
          <p className="text-3xl font-bold text-[#A0435F]">{bdInfo.total_tablas}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Tablas Esperadas</p>
          <p className="text-3xl font-bold text-green-600">15+</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Estado</p>
          <p className="text-lg font-bold text-green-600 flex items-center gap-1">
            <CheckCircleIcon size={20} />
            Activa
          </p>
        </div>
      </div>

      {/* Listado de Tablas */}
      <div className="space-y-3">
        {bdInfo.tablas.map((tabla, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#A0435F] to-[#5a3a90] px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{tabla.nombre}</h3>
                  <p className="text-sm text-white/80">
                    {tabla.filas} filas • {(tabla.tamanio / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${tabla.nombre}: ${tabla.columnas.map((c) => c.COLUMN_NAME).join(", ")}`,
                      tabla.nombre
                    )
                  }
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="Copiar estructura"
                >
                  <CopyIcon size={18} />
                  {copiedTable === tabla.nombre && <span className="text-xs ml-1">✓ Copiado</span>}
                </button>
              </div>
            </div>

            {/* Columnas */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Columna</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Tipo</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Nulo</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Clave</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Extra</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.columnas.map((col, cidx) => (
                    <tr key={cidx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-gray-900">{col.COLUMN_NAME}</td>
                      <td className="px-4 py-2 text-xs bg-blue-50 rounded inline-block text-blue-700">
                        {col.COLUMN_TYPE}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            col.IS_NULLABLE === "YES"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {col.IS_NULLABLE === "YES" ? "SÍ" : "NO"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {col.COLUMN_KEY ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            {col.COLUMN_KEY === "PRI" ? "PRIMARY" : col.COLUMN_KEY}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">
                        {col.EXTRA || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Info útil */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm font-medium text-green-900 mb-2">✅ Verificación Completada</p>
        <p className="text-sm text-green-800">
          Todas las tablas de tu base de datos están visibles arriba. Puedes copiar la estructura de cada tabla usando el botón de copiar.
        </p>
      </div>
    </div>
  );
}
