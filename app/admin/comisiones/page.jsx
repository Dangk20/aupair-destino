"use client";
// app/admin/comisiones/page.jsx — Comisiones de las asociadas (Sprint 1)
// Sigue el patrón de /admin/ventas. Las comisiones las genera
// lib/ventas-aupair.js al confirmar una venta con código de asociada; aquí
// sólo se consultan y se marcan como pagadas.

import { useEffect, useState, useCallback } from "react";
import {
  HandCoinsIcon, CheckCircleIcon, ClockIcon, TagIcon,
  RefreshCwIcon, UserIcon, Check, Ban, WalletIcon,
} from "lucide-react";

const money = (n) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USD`;
const fecha = (s) => (s ? new Date(s).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }) : "—");

export default function ComisionesAdminPage() {
  const [comisiones, setComisiones] = useState([]);
  const [totales, setTotales]   = useState({});
  const [asociadas, setAsociadas] = useState([]);
  const [tab, setTab]           = useState("pendiente");   // pendiente | pagada | anulada | todos
  const [asociada, setAsociada] = useState("");            // "" = todas
  const [loading, setLoading]   = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [modal, setModal]       = useState(null);          // comisión a pagar
  const [toast, setToast]       = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const qs   = asociada ? `?asociada=${asociada}` : "";
      const res  = await fetch(`/api/admin/comisiones${qs}`);
      const data = await res.json();
      setComisiones(data.comisiones || []);
      setTotales(data.totales || {});
      setAsociadas(data.asociadas || []);
    } catch { /* noop */ }
    setLoading(false);
  }, [asociada]);

  useEffect(() => { cargar(); }, [cargar]);

  const pagar = async () => {
    if (!modal) return;
    setProcesando(true);
    try {
      const res  = await fetch(`/api/admin/comisiones/${modal.id}/pagar`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setToast(data.yaPagada ? "Esa comisión ya estaba pagada" : `✓ Comisión de ${modal.asociada} marcada como pagada`);
        setModal(null);
        await cargar();
      } else {
        setToast(data.error || "No se pudo registrar el pago");
      }
    } catch {
      setToast("Error de red");
    }
    setProcesando(false);
    setTimeout(() => setToast(""), 4000);
  };

  const lista = comisiones.filter((c) => (tab === "todos" ? true : c.estado === tab));

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
          <HandCoinsIcon size={22} className="text-[#A0435F]" /> Comisiones
        </h1>
        <button onClick={cargar} className="flex items-center gap-1.5 text-[12px] text-[#A0435F] hover:text-[#7a2f45] transition">
          <RefreshCwIcon size={13} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>
      <p className="text-[13px] text-[#9C8790] mb-5">
        Lo que le debes a cada asociada por las ventas hechas con su código. Se generan solas al confirmar el pago.
      </p>

      {/* Totales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={ClockIcon}       label="Por pagar"          value={money(totales.por_pagar)} color="#E8853B" />
        <Stat icon={CheckCircleIcon} label="Ya pagado"          value={money(totales.pagado)}    color="#12A46B" />
        <Stat icon={WalletIcon}      label="Histórico"          value={money(totales.historico)} color="#A0435F" />
        <Stat icon={HandCoinsIcon}   label="Comisiones vivas"   value={(totales.total || 0) - (totales.n_anuladas || 0)} color="#A0435F" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          { id: "pendiente", label: `Por pagar${totales.n_pendientes ? ` (${totales.n_pendientes})` : ""}` },
          { id: "pagada",    label: "Pagadas" },
          { id: "anulada",   label: "Anuladas" },
          { id: "todos",     label: "Todas" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-[12px] font-semibold px-4 py-2 rounded-full transition
              ${tab === t.id ? "bg-[#A0435F] text-white shadow-sm" : "bg-white text-[#9C8790] border border-[#F5E1E7] hover:text-[#A0435F]"}`}>
            {t.label}
          </button>
        ))}

        {asociadas.length > 1 && (
          <select value={asociada} onChange={(e) => setAsociada(e.target.value)}
            className="ml-auto text-[12px] text-[#3A2530] bg-white border border-[#F5E1E7] rounded-full px-4 py-2 focus:outline-none focus:border-[#C77D93]">
            <option value="">Todas las asociadas</option>
            {asociadas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-[13px] text-[#9C8790] py-10 text-center">Cargando…</p>
      ) : lista.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F5E1E7] p-10 text-center">
          <HandCoinsIcon size={28} className="text-[#e8c4ce] mx-auto mb-3" />
          {comisiones.length === 0 ? (
            <>
              <p className="text-[14px] font-semibold text-[#3A2530] mb-1">Todavía no hay comisiones</p>
              <p className="text-[12.5px] text-[#9C8790] max-w-md mx-auto leading-relaxed">
                Se generan solas cuando confirmas una venta hecha con el código de una asociada.
                Si una venta no llevaba código, o el código no tiene porcentaje, no genera comisión.
              </p>
            </>
          ) : (
            <p className="text-[13px] text-[#9C8790]">
              No hay comisiones {tab === "pendiente" ? "por pagar" : tab === "todos" ? "" : `en estado "${tab}"`}
              {asociada ? " para esta asociada" : ""}.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {lista.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-[#F5E1E7] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fdeef2] flex items-center justify-center shrink-0">
                <UserIcon size={17} className="text-[#A0435F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#3A2530] truncate">{c.asociada}</p>
                <p className="text-[11px] text-[#9C8790] truncate">
                  por la venta de {c.candidata} · {money(c.monto_venta)} × {Number(c.porcentaje)}%
                </p>
                <p className="text-[10px] text-[#C9A9B4] mt-0.5">
                  {c.estado === "pagada" ? `Pagada ${fecha(c.pagada_at)}` : `Generada ${fecha(c.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {c.codigo && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A0435F] bg-[#f0ebfa] px-2.5 py-1 rounded-full">
                    <TagIcon size={10} /> {c.codigo}
                  </span>
                )}
                <span className={`text-[15px] font-bold w-[92px] text-right ${c.estado === "anulada" ? "text-[#C9A9B4] line-through" : "text-[#3A2530]"}`}>
                  {money(c.monto_comision)}
                </span>
                {c.estado === "pendiente" ? (
                  <button onClick={() => setModal(c)} title="Marcar como pagada"
                    className="h-9 px-3 rounded-xl bg-[#12A46B] hover:bg-[#12A46B] text-white text-[12px] font-semibold flex items-center gap-1.5 transition">
                    <Check size={15} /> Pagar
                  </button>
                ) : c.estado === "anulada" ? (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#C9A9B4] whitespace-nowrap">
                    <Ban size={13} /> Anulada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#12A46B] whitespace-nowrap">
                    <CheckCircleIcon size={14} /> Pagada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmación de pago */}
      {modal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: "rgba(58,20,32,.45)", backdropFilter: "blur(3px)" }}
             onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white rounded-2xl border border-[#F5E1E7] p-6 max-w-sm w-full shadow-xl">
            <div className="w-11 h-11 rounded-xl bg-[#eef5e8] flex items-center justify-center mb-4">
              <Check size={20} className="text-[#12A46B]" />
            </div>
            <h2 className="text-[16px] font-bold text-[#3A2530] mb-1.5">¿Ya le pagaste a {modal.asociada}?</h2>
            <p className="text-[13px] text-[#9C8790] leading-relaxed mb-5">
              Vas a registrar el pago de <b className="text-[#3A2530]">{money(modal.monto_comision)}</b> por
              la venta de {modal.candidata}. Queda con la fecha de hoy y deja de contar en “por pagar”.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} disabled={procesando}
                className="flex-1 py-2.5 rounded-xl border border-[#F5E1E7] text-[13px] font-semibold text-[#9C8790] hover:bg-[#fdf6f8] transition">
                Cancelar
              </button>
              <button onClick={pagar} disabled={procesando}
                className="flex-1 py-2.5 rounded-xl bg-[#12A46B] hover:bg-[#12A46B] disabled:opacity-60 text-white text-[13px] font-semibold transition">
                {procesando ? "Registrando…" : "Sí, ya le pagué"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] bg-[#3A2530] text-white text-[13px] px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
