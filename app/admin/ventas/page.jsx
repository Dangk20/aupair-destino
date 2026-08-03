"use client";
// app/admin/ventas/page.jsx — Recepción de pagos (Sprint 0.0)
// Lista las intenciones de pago reales (tabla ventas) y permite confirmarlas.
// Confirmar dispara: acceso de la candidata + comisión al asociado (si hay código).

import { useEffect, useState, useCallback } from "react";
import {
  CreditCardIcon, CheckCircleIcon, ClockIcon, TagIcon,
  RefreshCwIcon, UserIcon, Check, Ban, X,
} from "lucide-react";

const money = (n) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USD`;
const fecha = (s) => (s ? new Date(s).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }) : "—");

export default function VentasAdminPage() {
  const [ventas, setVentas]   = useState([]);
  const [stats, setStats]     = useState({ total: 0, pendientes: 0, confirmadas: 0, ingresos_confirmados: 0 });
  const [tab, setTab]         = useState("pendiente");   // pendiente | confirmado | todos
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [modal, setModal]     = useState(null); // { venta, accion:'confirmar'|'anular' }
  const [toast, setToast]     = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/ventas");
      const data = await res.json();
      setVentas(data.ventas || []);
      setStats(data.stats || {});
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const ejecutar = async () => {
    if (!modal) return;
    const { venta, accion } = modal;
    setProcesando(true);
    try {
      const res  = await fetch(`/api/admin/ventas/${venta.id}/${accion}`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        if (accion === "confirmar") {
          setToast(data.comision
            ? `✓ Pago confirmado · comisión ${money(data.comision.monto_comision)} (${data.comision.porcentaje}%)`
            : "✓ Pago confirmado y acceso habilitado");
        } else {
          setToast("Solicitud anulada");
        }
        setModal(null);
        await cargar();
      } else {
        setToast(data.error || "No se pudo completar la acción");
      }
    } catch {
      setToast("Error de red");
    }
    setProcesando(false);
    setTimeout(() => setToast(""), 4000);
  };

  const lista = ventas.filter((v) => (tab === "todos" ? true : v.estado === tab));

  const Stat = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl border border-[#F5E1E7] p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[11px] text-[#9C8790]">{label}</p>
        <p className="text-[18px] font-bold text-[#3A2530]">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[22px] font-bold text-[#3A2530] flex items-center gap-2">
          <CreditCardIcon size={22} className="text-[#A0435F]" /> Ventas
        </h1>
        <button onClick={cargar} className="flex items-center gap-1.5 text-[12px] text-[#A0435F] hover:text-[#7a2f45] transition">
          <RefreshCwIcon size={13} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>
      <p className="text-[13px] text-[#9C8790] mb-5">Intenciones de pago de las candidatas. Confirma cuando recibas el pago.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={ClockIcon}       label="Pendientes"  value={stats.pendientes || 0}  color="#E8853B" />
        <Stat icon={CheckCircleIcon} label="Confirmadas"  value={stats.confirmadas || 0} color="#12A46B" />
        <Stat icon={CreditCardIcon}  label="Total ventas" value={stats.total || 0}       color="#A0435F" />
        <Stat icon={TagIcon}         label="Ingresos"     value={money(stats.ingresos_confirmados)} color="#A0435F" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: "pendiente",  label: "Pendientes" },
          { id: "confirmado", label: "Confirmadas" },
          { id: "todos",      label: "Todas" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-[12px] font-semibold px-4 py-2 rounded-full transition
              ${tab === t.id ? "bg-[#A0435F] text-white shadow-sm" : "bg-white text-[#9C8790] border border-[#F5E1E7] hover:text-[#A0435F]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-[13px] text-[#9C8790] py-10 text-center">Cargando…</p>
      ) : lista.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F5E1E7] p-10 text-center">
          <p className="text-[13px] text-[#9C8790]">No hay ventas {tab !== "todos" ? `en estado "${tab}"` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {lista.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-[#F5E1E7] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fdeef2] flex items-center justify-center shrink-0">
                <UserIcon size={17} className="text-[#A0435F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#3A2530] truncate">{v.candidata}</p>
                <p className="text-[11px] text-[#9C8790] truncate">{v.email}</p>
                <p className="text-[10px] text-[#C9A9B4] mt-0.5">
                  {v.estado === "confirmado" ? `Confirmada ${fecha(v.confirmado_at)}` : `Solicitada ${fecha(v.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {v.codigo ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A0435F] bg-[#f0ebfa] px-2.5 py-1 rounded-full">
                    <TagIcon size={10} /> {v.codigo}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#C9A9B4] bg-[#f7f0f2] px-2.5 py-1 rounded-full">Directo</span>
                )}
                <span className="text-[15px] font-bold text-[#3A2530] w-[92px] text-right">{money(v.monto)}</span>
                {v.estado === "pendiente" ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal({ venta: v, accion: "confirmar" })} title="Confirmar pago"
                      className="w-9 h-9 rounded-xl bg-[#12A46B] hover:bg-[#12A46B] text-white flex items-center justify-center transition">
                      <Check size={17} />
                    </button>
                    <button onClick={() => setModal({ venta: v, accion: "anular" })} title="Anular solicitud"
                      className="w-9 h-9 rounded-xl bg-[#FDECEC] hover:bg-[#fbdada] text-[#c0392b] border border-[#f3c9c9] flex items-center justify-center transition">
                      <Ban size={16} />
                    </button>
                  </div>
                ) : v.estado === "anulado" ? (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#C9A9B4] whitespace-nowrap">
                    <Ban size={13} /> Anulada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#12A46B] whitespace-nowrap">
                    <CheckCircleIcon size={14} /> Confirmada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación / anulación (línea gráfica, no el nativo del navegador) */}
      {modal && (() => {
        const esConfirmar = modal.accion === "confirmar";
        const v = modal.venta;
        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: "rgba(58,20,32,.45)", backdropFilter: "blur(3px)" }}
            onClick={(e) => e.target === e.currentTarget && !procesando && setModal(null)}>
            <div className="bg-white rounded-3xl w-full max-w-[400px] p-6 shadow-2xl">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${esConfirmar ? "bg-[#eaf3e4] text-[#12A46B]" : "bg-[#FDECEC] text-[#c0392b]"}`}>
                {esConfirmar ? <Check size={26} /> : <Ban size={24} />}
              </div>
              <h3 className="text-[17px] font-bold text-[#3A2530] text-center mb-1">
                {esConfirmar ? "Confirmar pago" : "Anular solicitud"}
              </h3>
              <p className="text-[13px] text-[#9C8790] text-center leading-relaxed mb-1">
                {esConfirmar
                  ? <>Vas a confirmar el pago de <b className="text-[#3A2530]">{v.candidata}</b> por <b className="text-[#3A2530]">{money(v.monto)}</b>.</>
                  : <>Vas a anular la solicitud de <b className="text-[#3A2530]">{v.candidata}</b> por <b className="text-[#3A2530]">{money(v.monto)}</b>.</>}
              </p>
              <p className="text-[12px] text-[#C9A9B4] text-center mb-5">
                {esConfirmar
                  ? <>Se habilita el acceso completo{v.codigo ? <> y se genera la comisión del código <b>{v.codigo}</b></> : ""}.</>
                  : "No habilita acceso ni genera comisión. Podrá volver a solicitar el pago."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => !procesando && setModal(null)} disabled={procesando}
                  className="flex-1 py-3 rounded-xl border border-[#F5E1E7] text-[#9C8790] text-[13px] font-semibold hover:bg-[#FBF4F6] transition">
                  Cancelar
                </button>
                <button onClick={ejecutar} disabled={procesando}
                  className={`flex-1 py-3 rounded-xl text-white text-[13px] font-semibold transition disabled:opacity-60 ${esConfirmar ? "bg-[#12A46B] hover:bg-[#12A46B]" : "bg-[#c0392b] hover:bg-[#a93226]"}`}>
                  {procesando ? "Procesando…" : esConfirmar ? "Sí, confirmar" : "Sí, anular"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#3A2530] text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
