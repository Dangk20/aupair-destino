"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckIcon, TagIcon, ShieldCheckIcon, ArrowLeftIcon, LockIcon,
  PlayCircleIcon, BookOpenIcon, UsersIcon, UnlockIcon, HeartIcon,
  MonitorIcon, ShieldIcon,
} from "lucide-react";

const WHATSAPP_NUMBER = "13478886836";
const CODIGOS_VALIDOS = ["JENI", "TATI"];

/* ── Íconos redes ── */
const IGIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const TKIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
);
const FBIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const YTIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
);

const includes = [
  { icon: PlayCircleIcon,  title: "8 sesiones en video",            desc: "Bienvenida + 7 módulos completos"                    },
  { icon: BookOpenIcon,    title: "Acompañamiento",                 desc: "Acceso durante todo tu proceso"                     },
  { icon: MonitorIcon,     title: "Documentación",                  desc: "Visa, contratos y formatos incluidos"               },
  { icon: UnlockIcon,      title: "Desbloqueo progresivo",          desc: "Aprende a tu ritmo"                                 },
  { icon: UsersIcon,       title: "Acceso a comunidad privada",     desc: "Conecta con otras chicas Au Pair"                   },
  { icon: HeartIcon,       title: "Revisión con profesionales",     desc: "Resolvemos tus dudas y te guiamos en cada paso"     },
  { icon: ShieldIcon,      title: "Sin devoluciones",               desc: "Tu compra es final."                                },
];

const badges = [
  { icon: PlayCircleIcon, label: "Contenido actualizado", sub: "Siempre al día"         },
  { icon: TagIcon,        label: "Enfocado en USA",       sub: "Información real y clara" },
  { icon: HeartIcon,      label: "Hecho por Au Pairs",    sub: "Que ya lo vivieron"       },
  { icon: UsersIcon,      label: "Para chicas",           sub: "Colombianas"              },
];

const metodos = [
  { nombre: "Nequi",              color: "bg-[#6b2d8b]", emoji: "💜", numero: "300 000 0000"         },
  { nombre: "Daviplata",          color: "bg-[#e8001c]", emoji: "❤️", numero: "300 000 0000"         },
  { nombre: "Bancolombia",        color: "bg-[#fdda24]", emoji: "💛", numero: "Ahorros: 000-000000-00"},
  { nombre: "Transferencia / Llave", color: "bg-[#3d1a7a]", emoji: "🔑", numero: "Cédula: 000.000.000"},
];

export default function PagoPage() {
  const [codigo, setCodigo]           = useState("");
  const [validandoCodigo,  setValidandoCodigo]  = useState(false);
const [codigoDescuento,  setCodigoDescuento]  = useState("");
const [codigoAplicado,   setCodigoAplicado]   = useState(null);
const [errorCodigo,      setErrorCodigo]      = useState("");

  const precioTachado   = 60;
  const precioRegular   = 35;
  const precioConCodigo = 29;
  const precioFinal     = codigoAplicado ? precioConCodigo : precioRegular;

  const handleAplicar = () => {
    if (CODIGOS_VALIDOS.includes(codigo.trim().toUpperCase())) {
      setCodigoAplicado(true); setErrorCodigo("");
    } else {
      setErrorCodigo("Código no válido. Verifica e intenta de nuevo.");
    }
  };

  const waLink = () => {
    const txt = codigoAplicado
      ? `Hola! Tengo el código *${codigo.toUpperCase()}* y quisiera comprar Destino Au Pair por $${precioFinal} USD. ¿Cómo procedo? 🙌`
      : `Hola! Quisiera comprar Destino Au Pair por $${precioFinal} USD. ¿Cómo procedo? 🙌`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`;
  };

  return (
    <div className="min-h-screen bg-[#f5f0ff] relative overflow-hidden">

      {/* ── Fondo imagen USA — full screen ── */}
      <div className="fixed inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&q=80"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay lavanda semitransparente */}
        <div className="absolute inset-0 bg-[#7c5cc4]/40" />
        {/* Capa blanca suave para que el contenido sea legible */}
        <div className="absolute inset-0 bg-[#f5f0ff]/70" />
        {/* Sparkles */}
        <span className="absolute top-16 left-12 text-[#c4b0e8] text-[22px] select-none">✦</span>
        <span className="absolute top-32 left-20 text-[#c4b0e8] text-[13px] select-none">✦</span>
        <span className="absolute bottom-32 right-16 text-[#c4b0e8] text-[18px] select-none">♡</span>
        <span className="absolute top-20 right-20 text-[#c4b0e8] text-[12px] select-none">✦</span>
        {/* Línea punteada */}
        <svg className="absolute top-10 right-32 opacity-30 pointer-events-none"
             width="120" height="100" viewBox="0 0 120 100" fill="none">
          <path d="M10 90 Q60 10 110 20" stroke="#7c5cc4" strokeWidth="1.5"
                strokeDasharray="6 5" strokeLinecap="round"/>
        </svg>
        {/* Pasaporte izquierda — diseño real */}
        <div className="absolute left-6 top-1/3 pointer-events-none hidden xl:block"
             style={{ transform: "rotate(-8deg)", opacity: 0.75 }}>
          {/* Lomo del pasaporte */}
          <div className="relative w-36 h-48 shadow-2xl" style={{ filter: "drop-shadow(4px 6px 16px rgba(60,20,100,0.35))" }}>
            {/* Lomo lateral */}
            <div className="absolute left-0 top-0 w-5 h-full bg-[#3d1a7a] rounded-l-lg" />
            {/* Tapa principal */}
            <div className="absolute left-5 top-0 right-0 h-full bg-[#5a3a90] rounded-r-xl
                            flex flex-col items-center justify-between py-4 px-3">
              {/* Líneas decorativas arriba */}
              <div className="w-full space-y-1">
                <div className="h-px bg-white/20 w-full" />
                <div className="h-px bg-white/10 w-3/4 mx-auto" />
              </div>
              {/* Logo */}
              <div className="flex flex-col items-center gap-2">
                <img src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair"
                     className="w-14 h-14 object-contain brightness-0 invert opacity-90" />
                <div className="text-center">
                  <p className="text-white text-[8px] font-bold tracking-[2px] uppercase opacity-90">
                    Destino
                  </p>
                  <p className="text-white/60 text-[6px] tracking-[3px] uppercase">Au Pair</p>
                </div>
              </div>
              {/* Líneas decorativas abajo */}
              <div className="w-full space-y-1">
                <div className="h-px bg-white/10 w-3/4 mx-auto" />
                <div className="h-px bg-white/20 w-full" />
                <p className="text-white/40 text-[6px] tracking-[2px] uppercase text-center mt-1">
                  Pasaporte · Passport
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Estatua derecha */}
        <div className="absolute right-4 bottom-10 opacity-20 pointer-events-none hidden xl:block">
          <img src="https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&q=70"
               alt="" className="w-56 h-72 object-cover rounded-2xl shadow-xl"/>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 xl:px-8 py-8">

        {/* Volver */}
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#7c5cc4]
                     hover:text-[#5a3a90] transition mb-7">
          <ArrowLeftIcon size={14}/>
          Volver al dashboard
        </Link>

        {/* ── DOS COLUMNAS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-5">

          {/* ── COLUMNA IZQUIERDA ── */}
          <div className="space-y-4">

            {/* Card precio principal */}
            <div className="bg-white rounded-3xl border border-[#e0d4f5] shadow-sm p-6 xl:p-7">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#7c5cc4] text-white
                              text-[10px] font-bold px-4 py-2 rounded-full mb-5 tracking-[2px] uppercase shadow-md">
                <span className="text-[13px]">✈️</span>
                Precio de lanzamiento
              </div>

              {/* Precio */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[14px] text-[#9a80c0] line-through mb-1">${precioTachado} USD</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-[58px] xl:text-[64px] font-bold text-[#1a0a3d] leading-none">
                      ${precioFinal}
                    </span>
                    <span className="text-[#7060a0] text-[18px] font-medium">USD</span>
                  </div>
                  <p className="text-[12px] text-[#9a80c0] mt-1">Pago único · Sin suscripción</p>
                </div>
                <div className="bg-[#f5f0ff] border border-[#c4b0e8] rounded-2xl px-5 py-4 text-center shrink-0">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    <TagIcon size={12} className="text-[#7c5cc4]"/>
                    <p className="text-[10px] text-[#9a80c0]">Oferta</p>
                  </div>
                  <p className="text-[14px] font-bold text-[#7c5cc4]">Lanzamiento</p>
                </div>
              </div>

              {/* Card comunidad */}
              <div className="border border-[#e0d4f5] rounded-2xl p-4 mb-4 bg-[#faf8ff]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7c5cc4] flex items-center justify-center shrink-0">
                    <UsersIcon size={18} className="text-white" strokeWidth={1.5}/>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#1a0a3d] mb-1">
                      ¿Quieres acceder al precio especial de la comunidad?
                    </p>
                    <p className="text-[12px] text-[#7060a0] leading-relaxed">
                      Síguenos en nuestras redes y escríbenos por WhatsApp para
                      obtener tu <span className="text-[#7c5cc4] font-bold">código exclusivo</span>.
                    </p>
                  </div>
                  {/* Redes */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="flex gap-1.5">
                      {[
                        { icon: IGIcon, bg: "bg-gradient-to-br from-[#f09433] to-[#bc1888]", href: "https://instagram.com" },
                        { icon: TKIcon, bg: "bg-[#010101]", href: "https://tiktok.com" },
                        { icon: FBIcon, bg: "bg-[#1877F2]", href: "https://facebook.com" },
                        { icon: YTIcon, bg: "bg-[#FF0000]", href: "https://youtube.com" },
                      ].map(({ icon: Icon, bg, href }, i) => (
                        <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                           className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center
                                       text-white hover:opacity-80 transition shadow-sm`}>
                          <Icon/>
                        </a>
                      ))}
                    </div>
                    <p className="text-[9px] text-[#9a80c0] text-center leading-tight">
                      Síguenos y escribe<br/>
                      <span className="font-bold text-[#7c5cc4]">"AU PAIR"</span> por WhatsApp
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="bg-[#f0fef4] border border-[#b8e8c8] rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                  </div>
                  <p className="text-[12px] text-[#3a7a50]">
                    Envíanos un pantallazo de que nos sigues y te daremos tu código.{" "}
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                       className="font-bold text-[#25D366] hover:underline">
                      WhatsApp: +1 3478886836
                    </a>
                  </p>
                </div>
              </div>

              {/* Badges mini */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {badges.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#ede9f8] border border-[#c4b0e8]
                                      flex items-center justify-center">
                        <Icon size={16} className="text-[#7c5cc4]" strokeWidth={1.5}/>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#1a0a3d] leading-snug">{b.label}</p>
                        <p className="text-[10px] text-[#9a80c0]">{b.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Código especial */}
              <div className="border border-[#e0d4f5] rounded-2xl p-4 mb-5 bg-[#faf8ff]">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon size={16} className="text-[#7c5cc4]"/>
                  <p className="text-[13px] font-bold text-[#1a0a3d]">¿Tienes un código especial?</p>
                  <span className="text-[14px]">✦</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="INGRESA TU CÓDIGO AQUÍ"
                    value={codigo}
                    onChange={e => { setCodigo(e.target.value.toUpperCase()); setErrorCodigo(""); }}
                    onKeyDown={e => e.key === "Enter" && handleAplicar()}
                    disabled={codigoAplicado}
                    className="flex-1 border border-[#e0d4f5] rounded-xl px-4 py-3 text-[13px] font-bold
                               text-[#1a0a3d] bg-white placeholder:text-[#c4b0e8] placeholder:font-normal
                               focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]/30 focus:border-[#7c5cc4]
                               transition uppercase disabled:opacity-50"
                  />
                  <div className="flex flex-col items-center justify-center border border-dashed border-[#c4b0e8]
                                  rounded-xl px-4 py-2 text-center min-w-[130px] bg-white">
                    <LockIcon size={11} className="text-[#7c5cc4] mb-1"/>
                    <p className="text-[9px] text-[#9a80c0] leading-tight mb-1">
                      Tu código te da acceso al precio especial de
                    </p>
                    <p className="text-[16px] font-bold text-[#7c5cc4]">${precioConCodigo} USD</p>
                  </div>
                </div>

                {!codigoAplicado ? (
                  <>
                    <button onClick={handleAplicar}
                            disabled={!codigo.trim() || validandoCodigo}
                      className="w-full bg-[#7c5cc4] hover:bg-[#6a4ab0] disabled:opacity-40
                                 text-white text-[14px] font-semibold py-3 rounded-xl transition
                                 flex items-center justify-center gap-2 shadow-md shadow-[#7c5cc4]/25">
                      {validandoCodigo
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Verificando...</>
                        : "Aplicar código ⊕"
                      }
                    </button>
                    {errorCodigo && (
                      <p className="text-[11px] text-red-500 text-center mt-2">{errorCodigo}</p>
                    )}
                    <p className="text-[11px] text-[#9a80c0] text-center mt-2">
                      Código <span className="text-[#7c5cc4] font-bold">exclusivo</span> para miembros de nuestra comunidad.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-[#e8f8ed] border border-[#b8e8c8]
                                  rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-[#3a7a50]"/>
                      <span className="text-[12px] font-semibold text-[#3a7a50]">
                        Código <span className="font-bold">{codigo}</span> aplicado 🎉
                      </span>
                    </div>
                    <button onClick={() => { setCodigoAplicado(false); setCodigo(""); }}
                      className="text-[11px] text-[#9a80c0] hover:text-[#7c5cc4] transition ml-2">
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* Métodos de pago */}
              <div className="border-t border-[#e0d4f5] pt-5 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[14px]">💳</span>
                  <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#7060a0]">
                    Métodos de pago aceptados
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {metodos.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-[#e0d4f5] bg-white">
                      <div className={`w-8 h-8 rounded-xl ${m.color} flex items-center justify-center shrink-0 text-[14px]`}>
                        {m.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#1a0a3d] truncate">{m.nombre}</p>
                        <p className="text-[9px] text-[#9a80c0] truncate">{m.numero}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pago 100% seguro */}
                <div className="flex items-center gap-3 bg-[#f5f0ff] border border-[#c4b0e8] rounded-xl px-4 py-3">
                  <ShieldCheckIcon size={18} className="text-[#7c5cc4] shrink-0" strokeWidth={1.5}/>
                  <div>
                    <p className="text-[12px] font-bold text-[#1a0a3d]">Pago 100% seguro</p>
                    <p className="text-[11px] text-[#7060a0]">Tus datos están protegidos</p>
                  </div>
                </div>
              </div>

              {/* Resumen + CTA sticky */}
              <div className="border border-[#e0d4f5] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-white">
                  <div>
                    <p className="text-[13px] font-bold text-[#1a0a3d]">Precio regular</p>
                    <p className="text-[12px] text-[#9a80c0] line-through">${precioTachado} USD</p>
                  </div>
                  <p className="font-serif font-bold text-[24px] text-[#7c5cc4]">${precioRegular} USD</p>
                </div>
                <a href={waLink()} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#7c5cc4] hover:bg-[#6a4ab0]
                             text-white font-bold text-[15px] xl:text-[16px] py-4 transition
                             shadow-lg shadow-[#7c5cc4]/30 w-full">
                  <LockIcon size={16}/>
                  Acceder al programa — ${precioFinal} USD
                </a>
              </div>

              {/* Confirmación */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4
                              border-t border-[#e0d4f5]">
                <HeartIcon size={13} className="text-[#7c5cc4]" fill="#7c5cc4"/>
                <p className="text-[12px] text-[#7060a0] text-center">
                  Una vez confirmado el pago, activamos tu acceso en menos de{" "}
                  <strong className="text-[#1a0a3d]">24 horas hábiles</strong>.
                </p>
                <HeartIcon size={13} className="text-[#7c5cc4]" fill="#7c5cc4"/>
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA — incluye ── */}
          <div>
            <div className="bg-white rounded-3xl border border-[#e0d4f5] shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-5">
                <UsersIcon size={16} className="text-[#7c5cc4]" strokeWidth={1.5}/>
                <p className="text-[14px] font-bold text-[#1a0a3d]">Incluye todo esto y más</p>
              </div>
              <div className="space-y-4">
                {includes.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#ede9f8] border border-[#c4b0e8]
                                      flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-[#7c5cc4]" strokeWidth={1.5}/>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#1a0a3d] leading-snug">{item.title}</p>
                        <p className="text-[11px] text-[#9a80c0] leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Garantía */}
              <div className="mt-6 pt-5 border-t border-[#e0d4f5]">
                <div className="flex items-center gap-3 bg-[#f5f0ff] rounded-xl p-3">
                  <ShieldCheckIcon size={18} className="text-[#7c5cc4] shrink-0" strokeWidth={1.5}/>
                  <div>
                    <p className="text-[12px] font-bold text-[#1a0a3d]">Pago 100% seguro</p>
                    <p className="text-[11px] text-[#7060a0]">Tus datos están protegidos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}