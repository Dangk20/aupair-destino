"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, TagIcon, SparklesIcon, ShieldCheckIcon, ArrowLeftIcon } from "lucide-react";

// ⚠️ Cambia este número cuando tengas el real
const WHATSAPP_NUMBER = "573000000000";

const METODOS = [
  {
    nombre: "Nequi",
    color: "bg-[#6b2d8b]",
    icono: "💜",
    numero: "300 000 0000",
  },
  {
    nombre: "Daviplata",
    color: "bg-[#e8001c]",
    icono: "❤️",
    numero: "300 000 0000",
  },
  {
    nombre: "Bancolombia",
    color: "bg-[#fdda24]",
    icono: "💛",
    numero: "Cuenta de ahorros: 000-000000-00",
  },
  {
    nombre: "Transferencia / Llave",
    color: "bg-[#2d1a22]",
    icono: "🔑",
    numero: "Cédula: 000.000.000",
  },
];

export default function PagoPage() {
  const [codigo, setCodigo] = useState("");
  const [codigoAplicado, setCodigoAplicado] = useState(false);

  // ── Lógica de precios ──────────────────────────
  const precioTachado = 60;       // precio tachado (antes)
  const precioOriginal = 29;      // precio normal sin código
  const precioConDescuento = 20;  // precio con código aplicado
  const tieneDescuento = codigoAplicado && codigo.trim() !== "";
  const precioFinal = tieneDescuento ? precioConDescuento : precioOriginal;
  const ahorro = precioOriginal - precioConDescuento; // 9 USD
  // ──────────────────────────────────────────────

  const CODIGOS_VALIDOS = ["JENI", "TATI"];

    const handleAplicarCodigo = () => {
    if (CODIGOS_VALIDOS.includes(codigo.trim().toUpperCase())) {
         setCodigoAplicado(true);
        } else {
        alert("Código no válido. Verifica e intenta de nuevo.");
        }
    };

  const mensajeWhatsApp = () => {
    const base = tieneDescuento
      ? `Hola! Tengo el código promocional de descuento *${codigo.toUpperCase()}* y quisiera comprar el curso completo de Destino Au Pair por $${precioFinal} USD. ¿Me pueden indicar cómo proceder con el pago? 🙌`
      : `Hola! Quisiera comprar el curso completo de Destino Au Pair por $${precioFinal} USD. ¿Me pueden indicar cómo proceder con el pago? 🙌`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(base)}`;
  };

  return (
    <div className="min-h-screen bg-[#fff8f9] relative overflow-hidden">

      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots-p" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#a0435f" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots-p)" />
        </svg>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#fce8ed]/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#e8849a]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10">

        {/* Volver */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-[#9a6672] hover:text-[#a0435f] transition mb-8">
          <ArrowLeftIcon size={14} />
          Volver al dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#fce8ed] border border-[#f0b8c4] text-[#a0435f] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-4">
            <SparklesIcon size={11} />
            Acceso completo al programa
          </div>
          <h1 className="font-serif text-[28px] font-bold text-[#2d1a22] mb-2">
            Desbloquea tu viaje au pair
          </h1>
          <p className="text-[13px] text-[#9a6672]">
            Un solo pago · Sin suscripción · Acceso de por vida
          </p>
        </div>

        {/* Card precio */}
        <div className="bg-white border border-[#f0dde2] rounded-3xl p-6 mb-5 shadow-sm">

          {/* Precio */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[12px] text-[#9a6672] line-through mb-0.5">${precioTachado} USD</p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[42px] font-bold text-[#2d1a22] leading-none">
                  ${precioFinal}
                </span>
                <span className="text-[#9a6672] text-[14px]">USD</span>
                {tieneDescuento && (
                  <span className="text-[11px] bg-[#e8f0e0] text-[#5a8a3a] font-semibold px-2 py-0.5 rounded-full">
                    -${ahorro} USD 🎉
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#9a6672] mt-1">Pago único · Sin suscripción</p>
            </div>
            <div className="bg-[#fce8ed] rounded-2xl p-3 text-center">
              <p className="text-[10px] text-[#9a6672] mb-1">Oferta</p>
              <p className="text-[11px] font-bold text-[#a0435f]">Lanzamiento</p>
            </div>
          </div>

          <div className="w-full h-px bg-[#f0dde2] mb-4" />

          {/* Lo que incluye */}
          <ul className="space-y-2.5 mb-5">
            {[
              "8 sesiones en video (bienvenida + 7 módulos)",
              "Desbloqueo progresivo a tu ritmo",
              "Acceso a comunidad privada al finalizar",
              "Revisión directa con Jennifer y Tati",
              "Acceso de por vida al contenido",
              "Documentación, visa y contratos explicados",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0">
                  <CheckIcon size={10} className="text-[#a0435f]" />
                </div>
                <span className="text-[12.5px] text-[#2d1a22]">{item}</span>
              </li>
            ))}
          </ul>

          {/* Código promocional */}
          <div className="bg-[#fff8f9] border border-[#f0dde2] rounded-2xl p-4 mb-5">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide mb-2">
              <TagIcon size={12} className="text-[#a0435f]" />
              ¿Tienes un código de descuento?
            </label>
            {!codigoAplicado ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: TATI, JENI, PROMO..."
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleAplicarCodigo()}
                  className="flex-1 border border-[#f0dde2] rounded-xl px-3 py-2.5 text-[13px] text-[#2d1a22] bg-white placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a] transition uppercase"
                />
                <button
                  onClick={handleAplicarCodigo}
                  disabled={!codigo.trim()}
                  className="bg-[#a0435f] hover:bg-[#8a3550] disabled:bg-[#f0dde2] disabled:text-[#c0909a] text-white text-[12px] font-medium px-4 py-2.5 rounded-xl transition"
                >
                  Aplicar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-[#e8f0e0] border border-[#b8d4a0] rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-[#5a8a3a]" />
                  <span className="text-[12px] font-semibold text-[#5a8a3a]">
                    Código <span className="font-bold">{codigo}</span> aplicado — ahorras ${ahorro} USD 🎉
                  </span>
                </div>
                <button
                  onClick={() => { setCodigoAplicado(false); setCodigo(""); }}
                  className="text-[11px] text-[#9a6672] hover:text-[#a0435f] transition ml-2 shrink-0"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          {/* Botón WhatsApp */}
          <a
            href={mensajeWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#1fba58] text-white font-medium text-[15px] py-4 rounded-2xl transition shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2.5"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Pagar por WhatsApp — ${precioFinal} USD
          </a>

          <div className="flex items-center justify-center gap-2 mt-3">
            <ShieldCheckIcon size={13} className="text-[#9a6672]" />
            <p className="text-[11px] text-[#9a6672] text-center">
              Garantía de 7 días — si no es para ti, te devolvemos el dinero.
            </p>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm mb-5">
          <p className="text-[12px] font-semibold text-[#2d1a22] uppercase tracking-wide mb-4">
            💳 Métodos de pago aceptados
          </p>
          <div className="grid grid-cols-2 gap-3">
            {METODOS.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#f0dde2] bg-[#fff8f9]">
                <div className={`w-9 h-9 rounded-xl ${m.color} flex items-center justify-center shrink-0 text-[16px]`}>
                  {m.icono}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#2d1a22]">{m.nombre}</p>
                  <p className="text-[10px] text-[#9a6672] truncate">{m.numero}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#9a6672] mt-3 text-center leading-relaxed">
            Escríbenos por WhatsApp y te enviamos los datos exactos de pago 💕
          </p>
        </div>

        {/* Info final */}
        <div className="bg-[#fce8ed] border border-[#f0b8c4] rounded-2xl p-4 text-center">
          <p className="text-[12px] text-[#7a4a54] leading-relaxed">
            Una vez confirmado el pago por WhatsApp, activamos tu acceso en menos de <strong>24 horas hábiles</strong>. 🌸
          </p>
        </div>

      </div>
    </div>
  );
}
