"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, TagIcon, ShieldCheckIcon, ArrowLeftIcon, LockIcon } from "lucide-react";

// ⚠️ Cambia por el número real
const WHATSAPP_NUMBER = "13478886836";

const CODIGOS_VALIDOS = ["JENI", "TATI"];

// Iconos redes sociales SVG
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const IconTikTok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
);

export default function PagoPage() {
  const [codigo, setCodigo] = useState("");
  const [codigoAplicado, setCodigoAplicado] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState("");

  const precioTachado = 60;
  const precioRegular = 35;
  const precioConCodigo = 29;
  const precioFinal = codigoAplicado ? precioConCodigo : precioRegular;

  const handleAplicarCodigo = () => {
    if (CODIGOS_VALIDOS.includes(codigo.trim().toUpperCase())) {
      setCodigoAplicado(true);
      setErrorCodigo("");
    } else {
      setErrorCodigo("Código no válido. Verifica e intenta de nuevo.");
    }
  };

  const mensajeWhatsApp = () => {
    const base = codigoAplicado
      ? `Hola! Tengo el código promocional *${codigo.toUpperCase()}* y quisiera comprar el curso de Destino Au Pair por $${precioFinal} USD. ¿Me pueden indicar cómo proceder con el pago? 🙌`
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

        {/* Card principal */}
        <div className="bg-white border border-[#f0dde2] rounded-3xl p-6 mb-5 shadow-sm">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#fce8ed] border border-[#f0b8c4] text-[#a0435f] text-[11px] font-bold px-3 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            🚀 Precio de lanzamiento
          </div>

          {/* Precio */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[13px] text-[#9a6672] line-through mb-1">${precioTachado} USD</p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[52px] font-bold text-[#2d1a22] leading-none">
                  ${precioFinal}
                </span>
                <span className="text-[#9a6672] text-[16px]">USD</span>
              </div>
              <p className="text-[12px] text-[#9a6672] mt-1">Pago único · Sin suscripción</p>
            </div>
            <div className="bg-[#fce8ed] rounded-2xl px-4 py-3 text-center shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <TagIcon size={12} className="text-[#a0435f]" />
                <p className="text-[10px] text-[#9a6672]">Oferta</p>
              </div>
              <p className="text-[13px] font-bold text-[#a0435f]">Lanzamiento</p>
            </div>
          </div>

          {/* Card precio comunidad */}
          <div className="border border-[#f0dde2] rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#a0435f] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#2d1a22] mb-1">
                  ¿Quieres acceder al precio especial de la comunidad?
                </p>
                <p className="text-[12px] text-[#9a6672] leading-relaxed">
                  Síguenos en nuestras redes y escríbenos por WhatsApp para obtener tu{" "}
                  <span className="text-[#a0435f] font-semibold">código exclusivo</span>.
                </p>
              </div>
              {/* Redes sociales */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="flex gap-2">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white hover:opacity-80 transition">
                    <IconInstagram />
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#010101] flex items-center justify-center text-white hover:opacity-80 transition">
                    <IconTikTok />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition">
                    <IconFacebook />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-80 transition">
                    <IconYoutube />
                  </a>
                </div>
                <p className="text-[9px] text-[#9a6672] text-center leading-tight">
                  Síguenos y escribe<br /><span className="font-bold text-[#a0435f]">"AU PAIR"</span> por WhatsApp
                </p>
              </div>
            </div>

            {/* WhatsApp instrucción */}
            <div className="bg-[#f9fef5] border border-[#c8e6a0] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </div>
              <p className="text-[12px] text-[#5a7a3a]">
                Envíanos un pantallazo de que nos sigues y te daremos tu código.{" "}
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  className="font-bold text-[#25D366] hover:underline">
                  WhatsApp: +1 3478886836
                </a>
              </p>
            </div>
          </div>

          {/* Features en 2 columnas */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-5">
            {[
              { label: "8 sesiones", desc: "en video (bienvenida + 7 módulos)" },
              { label: "Acceso durante", desc: "tu proceso con acompañamiento" },
              { label: "Desbloqueo", desc: "progresivo a tu ritmo" },
              { label: "Documentación,", desc: "visa y contratos explicados" },
              { label: "Acceso a comunidad", desc: "privada al finalizar" },
              { label: "Revisión directa", desc: "con Jennifer y Tati" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon size={9} className="text-[#a0435f]" />
                </div>
                <p className="text-[12px] text-[#2d1a22] leading-snug">
                  <span className="font-bold">{item.label}</span> {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Código especial */}
          <div className="border border-[#f0dde2] rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#a0435f] flex items-center justify-center shrink-0">
                <TagIcon size={14} className="text-white" />
              </div>
              <p className="text-[13px] font-semibold text-[#2d1a22]">¿Tienes un código especial?</p>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ingresa tu código aquí"
                value={codigo}
                onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setErrorCodigo(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleAplicarCodigo()}
                disabled={codigoAplicado}
                className="flex-1 border border-[#f0dde2] rounded-xl px-3 py-2.5 text-[13px] text-[#2d1a22] bg-white placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a] transition uppercase disabled:opacity-50"
              />
              <div className="flex flex-col items-center justify-center bg-[#fce8ed] border border-dashed border-[#f0b8c4] rounded-xl px-3 py-2 text-center min-w-[110px]">
                <LockIcon size={11} className="text-[#a0435f] mb-1" />
                <p className="text-[9px] text-[#9a6672] leading-tight">Tu código te da acceso al precio especial de</p>
                <p className="text-[14px] font-bold text-[#a0435f]">${precioConCodigo} USD</p>
              </div>
            </div>

            {!codigoAplicado ? (
              <>
                <button
                  onClick={handleAplicarCodigo}
                  disabled={!codigo.trim()}
                  className="w-full bg-[#e8849a] hover:bg-[#d4708a] disabled:opacity-40 text-white text-[13px] font-medium py-2.5 rounded-xl transition mb-1"
                >
                  Aplicar
                </button>
                {errorCodigo && <p className="text-[11px] text-red-500 text-center">{errorCodigo}</p>}
                <p className="text-[11px] text-[#9a6672] text-center mt-1">
                  Código <span className="text-[#a0435f] font-semibold">exclusivo</span> para miembros de nuestra comunidad.
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between bg-[#e8f0e0] border border-[#b8d4a0] rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-[#5a8a3a]" />
                  <span className="text-[12px] font-semibold text-[#5a8a3a]">
                    Código <span className="font-bold">{codigo}</span> aplicado 🎉
                  </span>
                </div>
                <button onClick={() => { setCodigoAplicado(false); setCodigo(""); }}
                  className="text-[11px] text-[#9a6672] hover:text-[#a0435f] transition ml-2 shrink-0">
                  Quitar
                </button>
              </div>
            )}
          </div>

          {/* Resumen de precios */}
          <div className="border-t border-[#f0dde2] pt-4 mb-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#9a6672]">Precio regular</span>
              <span className="text-[13px] text-[#9a6672]">${precioRegular} USD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#a0435f]">Precio con código</span>
              <span className="font-serif text-[20px] font-bold text-[#a0435f]">${precioConCodigo} USD</span>
            </div>
          </div>

          {/* Botón principal */}
          <a
            href={mensajeWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#2d1a22] hover:bg-[#1a0d14] text-white font-medium text-[15px] py-4 rounded-2xl transition shadow-lg flex items-center justify-center gap-2.5"
          >
            <LockIcon size={16} />
            Acceder al programa — ${precioFinal} USD
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
            {[
              { nombre: "Nequi", color: "bg-[#6b2d8b]", icono: "💜", numero: "300 000 0000" },
              { nombre: "Daviplata", color: "bg-[#e8001c]", icono: "❤️", numero: "300 000 0000" },
              { nombre: "Bancolombia", color: "bg-[#fdda24]", icono: "💛", numero: "Ahorros: 000-000000-00" },
              { nombre: "Transferencia / Llave", color: "bg-[#2d1a22]", icono: "🔑", numero: "Cédula: 000.000.000" },
            ].map((m, i) => (
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
          <p className="text-[11px] text-[#9a6672] mt-3 text-center">
            Escríbenos por WhatsApp y te enviamos los datos exactos 💕
          </p>
        </div>

        {/* Info final */}
        <div className="bg-[#fce8ed] border border-[#f0b8c4] rounded-2xl p-4 text-center">
          <p className="text-[12px] text-[#7a4a54] leading-relaxed">
            Una vez confirmado el pago, activamos tu acceso en menos de <strong>24 horas hábiles</strong>. 🌸
          </p>
        </div>

      </div>
    </div>
  );
}